import { Skull, TrendingUp } from 'lucide-react';
import { useSensorContext } from '../context/SensorContext';

export default function VecnaMeter() {
  const { sensorData } = useSensorContext();

  // Calculate threat level based on sensor data
  const calculateThreatLevel = (): number => {
    let threatScore = 0;

    // Temperature contribution (0-33 points)
    // Critical if < 0°C or > 35°C
    // Warning if < 15°C
    if (sensorData.temperature < 0) {
      threatScore += 33; // Critical
    } else if (sensorData.temperature < 15) {
      threatScore += 20; // Warning
    } else if (sensorData.temperature > 35) {
      threatScore += 25; // High
    } else {
      threatScore += 5; // Normal baseline
    }

    // Sound level contribution (0-33 points)
    // Critical if > 110 dB
    // Warning if > 95 dB
    if (sensorData.soundLevel > 110) {
      threatScore += 33; // Critical
    } else if (sensorData.soundLevel > 95) {
      threatScore += 20; // Warning
    } else if (sensorData.soundLevel > 80) {
      threatScore += 10; // Elevated
    } else {
      threatScore += 0; // Normal
    }

    // AQI contribution (0-34 points)
    // Critical if > 400
    // Warning if > 250
    if (sensorData.aqi > 400) {
      threatScore += 34; // Critical
    } else if (sensorData.aqi > 250) {
      threatScore += 20; // Warning
    } else if (sensorData.aqi > 150) {
      threatScore += 10; // Elevated
    } else {
      threatScore += 5; // Normal baseline
    }

    // Clamp between 0-100
    return Math.min(100, Math.max(0, threatScore));
  };

  const vecnaLevel = calculateThreatLevel();

  const getVecnaStatus = () => {
    if (vecnaLevel <= 25) return { label: 'MINIMAL', color: 'text-green-400' };
    if (vecnaLevel <= 50) return { label: 'MODERATE', color: 'text-yellow-400' };
    if (vecnaLevel <= 75) return { label: 'HIGH', color: 'text-orange-400' };
    return { label: 'CRITICAL', color: 'text-red-400' };
  };

  const status = getVecnaStatus();

  return (
    <div className="bg-black rounded-lg p-4 md:p-5 hover-glow">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg md:text-xl font-bold text-white flex items-center gap-2">
          <Skull className="w-5 h-5 md:w-6 md:h-6 text-white" />
          UPSIDOMETER
        </h2>
        <div className={`flex items-center gap-1 ${status.color}`}>
          <TrendingUp className="w-4 h-4" />
          <span className="text-xs font-bold">{status.label}</span>
        </div>
      </div>

      <div className="space-y-3">
        <div className="h-4 bg-gray-800 rounded-full relative overflow-hidden">
          {/* Background gradient track - always visible */}
          <div className="absolute inset-0 rounded-full overflow-hidden">
            <div className="absolute inset-0 flex">
              {/* Green section: 0-33% */}
              <div className="h-full bg-green-500" style={{ width: '33%' }}></div>
              {/* Yellow section: 33-66% */}
              <div className="h-full bg-yellow-500" style={{ width: '33%' }}></div>
              {/* Red section: 66-100% */}
              <div className="h-full bg-red-500" style={{ width: '34%' }}></div>
            </div>
          </div>

          {/* Dark overlay that reveals the gradient as it fills */}
          <div
            className="absolute inset-y-0 right-0 bg-gray-800 transition-all duration-700 ease-out"
            style={{ width: `${100 - Math.min(vecnaLevel, 100)}%` }}
          />

          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none" />
          <span className="absolute -top-5 right-0 text-xs text-gray-300 font-semibold">{vecnaLevel}%</span>
        </div>

        <div className="flex justify-between text-[11px] text-gray-500">
          <span>0</span>
          <span>33</span>
          <span>66</span>
          <span>100</span>
        </div>

        <div className="flex items-center justify-between text-xs text-gray-300">
          <span className="font-semibold">THREAT INTENSITY</span>
          <span className={status.color}>{status.label}</span>
        </div>
      </div>
    </div>
  );
}
