import { useState, useEffect } from 'react';
import { X, AlertTriangle } from 'lucide-react';
import { useSensorContext } from '../context/SensorContext';

interface ManualOverrideModalProps {
  onClose: () => void;
}

export default function ManualOverrideModal({ onClose }: ManualOverrideModalProps) {
  const { sensorData, updateTemperature, updateSoundLevel, updateAQI } = useSensorContext();
  const [temp, setTemp] = useState(sensorData.temperature);
  const [sound, setSound] = useState(sensorData.soundLevel);
  const [aqi, setAqi] = useState(sensorData.aqi);

  // Keep local state in sync if context changes while open
  useEffect(() => {
    setTemp(sensorData.temperature);
    setSound(sensorData.soundLevel);
    setAqi(sensorData.aqi);
  }, [sensorData]);

  const applyManual = () => {
    updateTemperature(temp);
    updateSoundLevel(sound);
    updateAQI(aqi);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-xl bg-black/80 border border-red-800 rounded-2xl p-6 space-y-4 hover-glow">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-6 h-6 text-red-500" />
            <div>
              <h2 className="text-lg font-bold text-white">Manual Override</h2>
              <p className="text-xs text-gray-400">Set custom readings to trigger alerts</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-red-900/30 rounded-lg">
            <X className="w-5 h-5 text-red-400" />
          </button>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <label className="text-sm text-gray-300 w-32">Temperature (°C)</label>
            <input
              type="number"
              value={temp}
              onChange={(e) => setTemp(parseFloat(e.target.value))}
              className="flex-1 bg-gray-900/60 border border-red-800/60 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-red-500"
            />
          </div>

          <div className="flex items-center justify-between gap-3">
            <label className="text-sm text-gray-300 w-32">Sound (dB)</label>
            <input
              type="number"
              value={sound}
              onChange={(e) => setSound(parseFloat(e.target.value))}
              className="flex-1 bg-gray-900/60 border border-red-800/60 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-red-500"
            />
          </div>

          <div className="flex items-center justify-between gap-3">
            <label className="text-sm text-gray-300 w-32">AQI</label>
            <input
              type="number"
              value={aqi}
              onChange={(e) => setAqi(parseFloat(e.target.value))}
              className="flex-1 bg-gray-900/60 border border-red-800/60 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-red-500"
            />
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 pt-2">
          <div className="text-xs text-gray-500">Manual values override live feed until you close this panel.</div>
          <button
            onClick={applyManual}
            className="bg-red-700 hover:bg-red-600 text-white px-4 py-2 rounded-lg border border-red-500 font-semibold"
          >
            Apply & Close
          </button>
        </div>
      </div>
    </div>
  );
}
