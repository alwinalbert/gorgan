import { useState, useEffect } from 'react';
import { Wind } from 'lucide-react';

export default function AirQualitySensor() {
  const [aqi, setAqi] = useState(145);

  // Simulate AQI changes
  useEffect(() => {
    const interval = setInterval(() => {
      setAqi(prev => {
        const change = (Math.random() - 0.5) * 20;
        return Math.max(50, Math.min(500, prev + change));
      });
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  const getAQIStatus = () => {
    if (aqi > 400) return { label: 'CRITICAL', color: 'text-red-400', barColor: 'bg-red-500' };
    if (aqi > 250) return { label: 'WARNING', color: 'text-yellow-400', barColor: 'bg-yellow-500' };
    return { label: 'NORMAL', color: 'text-green-400', barColor: 'bg-green-500' };
  };

  const status = getAQIStatus();

  return (
    <div className="bg-black rounded-lg p-3 md:p-4 hover-glow border-0">
      <div className="flex items-center justify-between mb-2 md:mb-3">
        <div className="flex items-center gap-1 md:gap-2">
          <Wind className="w-4 h-4 md:w-5 md:h-5 text-white" />
          <h3 className="text-xs md:text-sm font-bold text-white">AIR QUALITY</h3>
        </div>
        {status.label !== 'NORMAL' && (
          <span className={`text-[10px] md:text-xs bg-${status.label === 'CRITICAL' ? 'red' : 'yellow'}-900/50 ${status.color} px-1.5 md:px-2 py-0.5 md:py-1 rounded`}>
            {status.label}
          </span>
        )}
      </div>

      <div className="text-center">
        <div className="text-2xl md:text-3xl font-bold text-white">
          {Math.round(aqi)}
        </div>
        <div className="text-[10px] md:text-xs text-gray-500 mt-1">Safe: ≤250 AQI</div>
      </div>

      {/* AQI Bar */}
      <div className="mt-2 md:mt-3">
        <div className="w-full bg-gray-800 rounded-full h-2 overflow-hidden">
          <div
            className={`h-full ${status.barColor} transition-all duration-500`}
            style={{ width: `${Math.min((aqi / 500) * 100, 100)}%` }}
          />
        </div>
      </div>
    </div>
  );
}
