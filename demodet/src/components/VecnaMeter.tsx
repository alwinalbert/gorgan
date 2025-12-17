import { Skull, TrendingUp } from 'lucide-react';

export default function VecnaMeter() {
  const vecnaLevel = 67;

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
          <div
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-green-500 via-yellow-500 via-orange-500 to-red-500 transition-all duration-700 ease-out"
            style={{ width: `${Math.min(vecnaLevel, 100)}%` }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none" />
          <span className="absolute -top-5 right-0 text-xs text-gray-300 font-semibold">{vecnaLevel}%</span>
        </div>

        <div className="flex justify-between text-[11px] text-gray-500">
          <span>0</span>
          <span>25</span>
          <span>50</span>
          <span>75</span>
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
