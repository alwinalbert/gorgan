import { useState, useEffect } from 'react';
import { Thermometer } from 'lucide-react';
import { getCurrentWeatherData } from '../services/weatherService';
import { useSensorContext } from '../context/SensorContext';

export default function TemperatureSensor() {
  const [location, setLocation] = useState('Loading...');
  const { sensorData, updateTemperature, liveMode } = useSensorContext();

  // Fetch real weather data
  useEffect(() => {
    const fetchWeatherData = async () => {
      try {
        const data = await getCurrentWeatherData();
        setLocation(data.location);
        updateTemperature(data.temperature); // Update context
      } catch (error) {
        console.error('Error fetching weather:', error);
      }
    };

    if (!liveMode) return;

    fetchWeatherData();
    const interval = setInterval(fetchWeatherData, 600000);
    return () => clearInterval(interval);
  }, [updateTemperature, liveMode]);

  const getTemperatureStatus = () => {
    if (sensorData.temperature < 0) return { label: 'CRITICAL', color: 'text-red-400', barColor: 'bg-red-500' };
    if (sensorData.temperature < 15) return { label: 'WARNING', color: 'text-yellow-400', barColor: 'bg-yellow-500' };
    return { label: 'NORMAL', color: 'text-green-400', barColor: 'bg-green-500' };
  };

  const status = getTemperatureStatus();

  return (
    <div className="bg-black/60 backdrop-blur rounded-lg p-3 md:p-4 hover-glow border-0">
      <div className="flex items-center justify-between mb-2 md:mb-3">
        <div className="flex items-center gap-1 md:gap-2">
          <Thermometer className="w-4 h-4 md:w-5 md:h-5 text-white" />
          <h3 className="text-xs md:text-sm font-bold text-white">TEMPERATURE</h3>
        </div>
        {status.label !== 'NORMAL' && (
          <span className={`text-[10px] md:text-xs bg-${status.label === 'CRITICAL' ? 'red' : 'yellow'}-900/50 ${status.color} px-1.5 md:px-2 py-0.5 md:py-1 rounded`}>
            {status.label}
          </span>
        )}
      </div>

      <div className="text-center">
        <div className="text-2xl md:text-3xl font-bold text-white">
          {sensorData.temperature.toFixed(1)}°C
        </div>
        <div className="text-[10px] md:text-xs text-gray-500 mt-1">{location}</div>
      </div>

      {/* Temperature Bar */}
      <div className="mt-2 md:mt-3">
        <div className="w-full bg-gray-800 rounded-full h-2 overflow-hidden">
          <div
            className={`h-full ${status.barColor} transition-all duration-500`}
            style={{ width: `${Math.min(Math.max(((sensorData.temperature + 10) / 45) * 100, 0), 100)}%` }}
          />
        </div>
      </div>
    </div>
  );
}
