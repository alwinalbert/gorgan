import { useState } from 'react';
import { AlertTriangle, Eye, MessageSquare, Wifi, Users } from 'lucide-react';
import type { ThreatLevel } from '../types/index';
import WebcamCapture from './WebcamCapture';
import VecnaMeter from './VecnaMeter';
import AIAssistant from './AIAssistant';
import TemperatureSensor from './TemperatureSensor';
import SoundTracker from './SoundTracker';
import AirQualitySensor from './AirQualitySensor';
import { SensorProvider } from '../context/SensorContext';

export default function Dashboard() {
  const [threatLevel, setThreatLevel] = useState<ThreatLevel>('safe');
  const [showAI, setShowAI] = useState(false);

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

  return (
    <SensorProvider>
      <div className="min-h-screen bg-black text-white">
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
                <Wifi className="w-4 h-4 md:w-5 md:h-5 text-green-500 animate-pulse" />
                <span className="text-xs md:text-sm hidden sm:inline">ONLINE</span>
              </div>

              <div className="hidden md:flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-400" />
                <span className="text-sm">4 Members</span>
              </div>

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
      </main>
      </div>
    </SensorProvider>
  );
}
