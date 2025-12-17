import { useState, useEffect, useRef, useCallback } from 'react';
import { AlertTriangle, Eye, Wifi, Users } from 'lucide-react';
import type { ThreatLevel } from '../types/index';
import WebcamCapture from './WebcamCapture';
import VecnaMeter from './VecnaMeter';
import AIAssistant from './AIAssistant';
import TemperatureSensor from './TemperatureSensor';
import SoundTracker from './SoundTracker';
import AirQualitySensor from './AirQualitySensor';
import MessagingDashboard from './MessagingDashboard';
import ManualOverrideModal from './ManualOverrideModal';
import { SensorProvider, useSensorContext } from '../context/SensorContext';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../hooks/useSocket';
import { alertAPI } from '../services/api';
import { userAPI } from '../services/api';

function DashboardContent() {
  const [threatLevel, setThreatLevel] = useState<ThreatLevel>('safe');
  const [showAI, setShowAI] = useState(false);
  const [showMessaging, setShowMessaging] = useState(false);
  const [showManual, setShowManual] = useState(false);
  const [membersCount, setMembersCount] = useState<number | null>(null);
  const [upsidoAlerted, setUpsidoAlerted] = useState(false);
  const [upsidoOverlay, setUpsidoOverlay] = useState(false);
  const [soundReady, setSoundReady] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { user, loading: authLoading } = useAuth();
  const { socket, connected } = useSocket();
  const { sensorData, setLiveMode, liveMode } = useSensorContext();

  // Lazy-load alert audio once
  useEffect(() => {
    if (!audioRef.current) {
      const audio = new Audio('/alert.mp3');
      audio.loop = false;
      audio.preload = 'auto';
      audioRef.current = audio;
    }
  }, []);

  // Prime audio after any user gesture to satisfy autoplay policies
  useEffect(() => {
    const tryPrime = async () => {
      const audio = audioRef.current;
      if (!audio) return;
      try {
        await audio.play();
        audio.pause();
        audio.currentTime = 0;
        setSoundReady(true);
        window.removeEventListener('pointerdown', tryPrime);
        window.removeEventListener('keydown', tryPrime);
      } catch (err) {
        console.warn('Audio prime blocked until user interacts again');
      }
    };

    window.addEventListener('pointerdown', tryPrime);
    window.addEventListener('keydown', tryPrime);
    return () => {
      window.removeEventListener('pointerdown', tryPrime);
      window.removeEventListener('keydown', tryPrime);
    };
  }, []);

  const primeAudioNow = async () => {
    const audio = audioRef.current;
    if (!audio) return;
    try {
      await audio.play();
      audio.pause();
      audio.currentTime = 0;
      setSoundReady(true);
    } catch (err) {
      console.warn('User gesture required to enable sound:', err);
    }
  };

  // Calculate threat level based on sensor data
  useEffect(() => {
    const { temperature, soundLevel, aqi } = sensorData;

    if (temperature > 30 || soundLevel > 80 || aqi > 200) {
      setThreatLevel('critical');
    } else if (temperature > 25 || soundLevel > 60 || aqi > 150) {
      setThreatLevel('danger');
    } else if (temperature > 22 || soundLevel > 40 || aqi > 100) {
      setThreatLevel('warning');
    } else {
      setThreatLevel('safe');
    }
  }, [sensorData]);

  const calculateUpsidometer = useCallback(() => {
    let threatScore = 0;

    if (sensorData.temperature < 0) {
      threatScore += 33;
    } else if (sensorData.temperature < 15) {
      threatScore += 20;
    } else if (sensorData.temperature > 35) {
      threatScore += 25;
    } else {
      threatScore += 5;
    }

    if (sensorData.soundLevel > 110) {
      threatScore += 33;
    } else if (sensorData.soundLevel > 95) {
      threatScore += 20;
    } else if (sensorData.soundLevel > 80) {
      threatScore += 10;
    }

    if (sensorData.aqi > 400) {
      threatScore += 34;
    } else if (sensorData.aqi > 250) {
      threatScore += 20;
    } else if (sensorData.aqi > 150) {
      threatScore += 10;
    } else {
      threatScore += 5;
    }

    return Math.min(100, Math.max(0, threatScore));
  }, [sensorData]);

  // Trigger audio + broadcast when upsido meter crosses 60%
  useEffect(() => {
    const level = calculateUpsidometer();

    const triggerAlert = async () => {
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play()
          .then(() => setSoundReady(true))
          .catch((err) => console.warn('Audio playback blocked:', err));
      }

      try {
        await alertAPI.createAlert({
          threatLevel: 'critical',
          message: `Upsidometer spiked to ${Math.round(level)}%`,
          sensorData,
        });
      } catch (error) {
        console.error('Failed to send upsido alert:', error);
      }

      try {
        socket?.emit('broadcast-alert', {
          type: 'upsidometer',
          level: Math.round(level),
          message: 'Upsidometer exceeded 60%!',
          sensorData,
        });
      } catch (error) {
        console.error('Socket broadcast failed:', error);
      }
    };

    if (level > 60 && !upsidoAlerted) {
      setUpsidoAlerted(true);
      setUpsidoOverlay(true);
      triggerAlert();
    }

    if (level <= 50 && upsidoAlerted) {
      setUpsidoAlerted(false);
      setUpsidoOverlay(false);
    }
  }, [calculateUpsidometer, socket, sensorData, upsidoAlerted]);

  // Fetch members count from backend
  useEffect(() => {
    const loadMembersCount = async () => {
      if (!user) return;
      try {
        const res = await userAPI.getAll();
        const list = res.data || [];
        setMembersCount(Array.isArray(list) ? list.length : null);
      } catch (error) {
        console.error('Failed to fetch members count:', error);
        setMembersCount(null);
      }
    };

    loadMembersCount();
  }, [user]);

  // Send alert to backend when threat level changes
  useEffect(() => {
    if (!user) return;

    const sendAlert = async () => {
      try {
        await alertAPI.createAlert({
          threatLevel,
          message: `Threat level changed to ${threatLevel}`,
          sensorData,
        });
      } catch (error) {
        console.error('Failed to send alert:', error);
      }
    };

    if (threatLevel !== 'safe') {
      sendAlert();
    }
  }, [threatLevel, user]);

  const getThreatColor = () => {
    switch (threatLevel) {
      case 'safe':
        return 'from-green-900 to-green-700';
      case 'warning':
        return 'from-yellow-900 to-yellow-700';
      case 'danger':
        return 'from-orange-900 to-orange-700';
      case 'critical':
        return 'from-red-900 to-red-700';
      default:
        return 'from-gray-900 to-gray-700';
    }
  };

  const getThreatBorderColor = () => {
    switch (threatLevel) {
      case 'safe':
        return 'border-green-500';
      case 'warning':
        return 'border-yellow-500';
      case 'danger':
        return 'border-orange-500';
      case 'critical':
        return 'border-red-500 animate-pulse';
      default:
        return 'border-gray-500';
    }
  };

  if (!user && !authLoading) return null;

  return (
    <div className="min-h-screen bg-black text-white">
      {upsidoOverlay && (
        <div className="fixed inset-0 bg-red-600/30 animate-pulse pointer-events-none z-40" />
      )}
      {threatLevel === 'critical' && (
        <div className="fixed inset-0 bg-red-600 opacity-20 animate-pulse pointer-events-none z-50" />
      )}

      <header className="border-b border-red-800 bg-black/50 backdrop-blur sticky top-0 z-40">
        <div className="px-3 md:px-4 py-3 md:py-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-2 md:gap-3">
              <Eye className="w-6 h-6 md:w-8 md:h-8 text-red-500" />
              <div>
                <h1 className="text-sm md:text-2xl font-bold tracking-wider text-red-500 font-mono">
                  UPSIDE DOWN SURVIVAL
                </h1>
                <p className="text-[10px] md:text-xs text-gray-400 hidden sm:block">Demogorgon Detection System</p>
              </div>
            </div>

            <div className="flex items-center gap-2 md:gap-6">
              <div className="flex items-center gap-1 md:gap-2">
                <Wifi className={`w-4 h-4 md:w-5 md:h-5 ${connected ? 'text-green-500' : 'text-gray-500'} animate-pulse`} />
                <span className="text-xs md:text-sm hidden sm:inline">{connected ? 'ONLINE' : 'OFFLINE'}</span>
              </div>

                {!soundReady && (
                  <button
                    onClick={primeAudioNow}
                    className="hidden md:flex items-center gap-2 px-3 py-2 rounded-lg bg-red-900/30 hover:bg-red-900/50 border border-red-700/50 hover:border-red-600 transition-all duration-200"
                    title="Enable alert sound"
                  >
                    <AlertTriangle className="w-4 h-4 text-red-400" />
                    <span className="text-sm">Enable Sound</span>
                  </button>
                )}

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setLiveMode(false);
                    setShowManual(true);
                  }}
                  className="hidden md:flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-900/30 hover:bg-amber-900/50 border border-amber-700/50 hover:border-amber-600 transition-all duration-200"
                >
                  <AlertTriangle className="w-5 h-5 text-amber-400" />
                  <span className="text-sm">Manual Trigger</span>
                </button>

                {!liveMode && (
                  <button
                    onClick={() => setLiveMode(true)}
                    className="hidden md:flex items-center gap-2 px-3 py-2 rounded-lg bg-green-900/30 hover:bg-green-900/50 border border-green-700/50 hover:border-green-600 transition-all duration-200"
                  >
                    <Wifi className="w-5 h-5 text-green-400" />
                    <span className="text-sm">Resume Live</span>
                  </button>
                )}
              </div>

              <button
                onClick={() => setShowMessaging(true)}
                className="hidden md:flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-900/30 hover:bg-blue-900/50 border border-blue-700/50 hover:border-blue-600 transition-all duration-200"
              >
                <Users className="w-5 h-5 text-blue-400" />
                <span className="text-sm">{membersCount !== null ? `${membersCount} Member${membersCount === 1 ? '' : 's'}` : 'Members'}</span>
              </button>

              <div className={`px-2 md:px-4 py-1 md:py-2 rounded-lg bg-gradient-to-r ${getThreatColor()} border-2 ${getThreatBorderColor()}`}>
                <div className="flex items-center gap-1 md:gap-2">
                  <AlertTriangle className="w-4 h-4 md:w-5 md:h-5" />
                  <span className="text-xs md:text-base font-bold uppercase tracking-wider">{threatLevel}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="layout-shell px-3 md:px-4 py-4 md:py-6">
        <div className="board-grid">
          <aside className="sensors-column">
            <TemperatureSensor />
            <SoundTracker />
            <AirQualitySensor />
          </aside>

          <section className="camera-column">
            <div className="camera-frame bg-black rounded-lg p-3 hover-glow h-full">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-base md:text-lg font-bold text-white flex items-center gap-2">
                  <Eye className="w-4 h-4 md:w-5 md:h-5 text-white" />
                  SURVEILLANCE CAMERA
                </h2>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                  <span className="text-xs text-gray-400">READY</span>
                </div>
              </div>
              <WebcamCapture onCapture={() => {}} />
            </div>
          </section>

          <aside className="logo-column space-y-4">
            <button
              onClick={() => setShowAI(!showAI)}
              className="logo-placeholder hover-glow"
            >
              <img src="/hellfire.jpeg" alt="Hellfire Club" className="logo-image" />
              <div className="logo-text text-center">
                <div className="text-sm font-bold tracking-wide">HELLFIRE CLUB</div>
                <div className="text-xs text-gray-300">EDDYY</div>
              </div>
            </button>
          </aside>
        </div>

        <div className="vecna-row">
          <VecnaMeter />
        </div>

        {showAI && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="w-full max-w-4xl">
              <AIAssistant onClose={() => setShowAI(false)} />
            </div>
          </div>
        )}

        {showMessaging && (
          <MessagingDashboard onClose={() => setShowMessaging(false)} />
        )}

        {showManual && (
          <ManualOverrideModal
            onClose={() => {
              setShowManual(false);
            }}
          />
        )}
      </main>
    </div>
  );
}

export default function Dashboard() {
  return (
    <SensorProvider>
      <DashboardContent />
    </SensorProvider>
  );
}
