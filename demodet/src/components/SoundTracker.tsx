import { useState, useEffect } from 'react';
import { Volume2 } from 'lucide-react';

export default function SoundTracker() {
  const [soundLevel, setSoundLevel] = useState(72);

  // Simulate sound level changes
  useEffect(() => {
    const interval = setInterval(() => {
      setSoundLevel(prev => {
        const change = (Math.random() - 0.5) * 10;
        return Math.max(30, Math.min(130, prev + change));
      });
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  const getSoundStatus = () => {
    if (soundLevel > 110) return { label: 'CRITICAL', color: 'text-red-400', barColor: 'bg-red-500' };
    if (soundLevel > 95) return { label: 'WARNING', color: 'text-yellow-400', barColor: 'bg-yellow-500' };
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
        {status.label !== 'NORMAL' && (
          <span className={`text-[10px] md:text-xs bg-${status.label === 'CRITICAL' ? 'red' : 'yellow'}-900/50 ${status.color} px-1.5 md:px-2 py-0.5 md:py-1 rounded`}>
            {status.label}
          </span>
        )}
      </div>

      <div className="text-center">
        <div className="text-2xl md:text-3xl font-bold text-white">
          {Math.round(soundLevel)} dB
        </div>
        <div className="text-[10px] md:text-xs text-gray-500 mt-1">Safe: ≤95 dB</div>
      </div>

      {/* Sound Level Bar */}
      <div className="mt-2 md:mt-3">
        <div className="w-full bg-gray-800 rounded-full h-2 overflow-hidden">
          <div
            className={`h-full ${status.barColor} transition-all duration-300`}
            style={{ width: `${Math.min((soundLevel / 130) * 100, 100)}%` }}
          />
        </div>
      </div>
    </div>
  );
}
