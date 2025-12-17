import { useState, useEffect } from 'react';
import { Volume2, Mic, MicOff } from 'lucide-react';
import { getSoundLevel, initializeMicrophone, stopMicrophone, isMicrophoneActive } from '../services/weatherService';
import { useSensorContext } from '../context/SensorContext';

export default function SoundTracker() {
  const [micActive, setMicActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { sensorData, updateSoundLevel, liveMode } = useSensorContext();

  const startMicrophone = async () => {
    try {
      await initializeMicrophone();
      setMicActive(true);
      setError(null);
    } catch (err) {
      console.error('Error starting microphone:', err);
      setError('Microphone access denied');
      setMicActive(false);
    }
  };

  const stopMic = () => {
    stopMicrophone();
    setMicActive(false);
    updateSoundLevel(0);
  };

  // Update sound level when microphone is active
  useEffect(() => {
    if (!micActive || !liveMode) return;

    const interval = setInterval(() => {
      if (isMicrophoneActive()) {
        const level = getSoundLevel();
        updateSoundLevel(level); // Update context and UI
      }
    }, 100); // Update every 100ms for smooth real-time display

    return () => clearInterval(interval);
  }, [micActive, liveMode, updateSoundLevel]);

  // Auto-start microphone on mount
  useEffect(() => {
    startMicrophone();

    return () => {
      stopMic();
    };
  }, []);

  const getSoundStatus = () => {
    if (sensorData.soundLevel > 110) return { label: 'CRITICAL', color: 'text-red-400', barColor: 'bg-red-500' };
    if (sensorData.soundLevel > 95) return { label: 'WARNING', color: 'text-yellow-400', barColor: 'bg-yellow-500' };
    return { label: 'NORMAL', color: 'text-green-400', barColor: 'bg-green-500' };
  };

  const status = getSoundStatus();

  return (
    <div className="bg-black/60 backdrop-blur rounded-lg p-3 md:p-4 hover-glow border-0">
      <div className="flex items-center justify-between mb-2 md:mb-3">
        <div className="flex items-center gap-1 md:gap-2">
          <Volume2 className="w-4 h-4 md:w-5 md:h-5 text-white" />
          <h3 className="text-xs md:text-sm font-bold text-white">SOUND LEVEL</h3>
        </div>
        <div className="flex items-center gap-2">
          {status.label !== 'NORMAL' && (
            <span className={`text-[10px] md:text-xs bg-${status.label === 'CRITICAL' ? 'red' : 'yellow'}-900/50 ${status.color} px-1.5 md:px-2 py-0.5 md:py-1 rounded`}>
              {status.label}
            </span>
          )}
          <button
            onClick={micActive ? stopMic : startMicrophone}
            className={`p-1 rounded ${micActive ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'} transition-colors`}
            title={micActive ? 'Stop microphone' : 'Start microphone'}
          >
            {micActive ? (
              <Mic className="w-3 h-3 md:w-4 md:h-4 text-white" />
            ) : (
              <MicOff className="w-3 h-3 md:w-4 md:h-4 text-white" />
            )}
          </button>
        </div>
      </div>

      <div className="text-center">
        <div className="text-2xl md:text-3xl font-bold text-white">
          {Math.round(sensorData.soundLevel)} dB
        </div>
        <div className="text-[10px] md:text-xs text-gray-500 mt-1">
          {error ? error : micActive ? 'Real-time' : 'Mic Off'}
        </div>
      </div>

      {/* Sound Level Bar */}
      <div className="mt-2 md:mt-3">
        <div className="w-full bg-gray-800 rounded-full h-2 overflow-hidden">
          <div
            className={`h-full ${status.barColor} transition-all duration-300`}
            style={{ width: `${Math.min((sensorData.soundLevel / 130) * 100, 100)}%` }}
          />
        </div>
      </div>
    </div>
  );
}
