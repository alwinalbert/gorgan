import { useEffect } from 'react';
import { Wind } from 'lucide-react';
import { getCurrentWeatherData } from '../services/weatherService';
import { useSensorContext } from '../context/SensorContext';

export default function AirQualitySensor() {
  const { sensorData, updateAQI, liveMode } = useSensorContext();

  // Fetch real air quality data
  useEffect(() => {
    const fetchAQIData = async () => {
      try {
        const data = await getCurrentWeatherData();
        updateAQI(data.aqi); // Update context
      } catch (error) {
        console.error('Error fetching AQI:', error);
      }
    };

    if (!liveMode) return;

    fetchAQIData();
    const interval = setInterval(fetchAQIData, 600000);
    return () => clearInterval(interval);
  }, [updateAQI, liveMode]);

  const getAQIStatus = () => {
    if (sensorData.aqi > 400) return { label: 'CRITICAL', color: 'text-red-400', barColor: 'bg-red-500' };
    if (sensorData.aqi > 250) return { label: 'WARNING', color: 'text-yellow-400', barColor: 'bg-yellow-500' };
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
          {Math.round(sensorData.aqi)}
        </div>
        <div className="text-[10px] md:text-xs text-gray-500 mt-1">Safe: ≤250 AQI</div>
      </div>

      {/* AQI Bar */}
      <div className="mt-2 md:mt-3">
        <div className="w-full bg-gray-800 rounded-full h-2 overflow-hidden">
          <div
            className={`h-full ${status.barColor} transition-all duration-500`}
            style={{ width: `${Math.min((sensorData.aqi / 500) * 100, 100)}%` }}
          />
        </div>
      </div>
    </div>
  );
}
