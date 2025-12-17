import { AlertTriangle, Shield, Activity } from 'lucide-react';
import type { ThreatLevel } from '../types/index';

interface ThreatMonitorProps {
  threatLevel: ThreatLevel;
  analysis?: {
    confidence: number;
    description: string;
    recommendations: string[];
  };
}

export default function ThreatMonitor({ threatLevel, analysis }: ThreatMonitorProps) {
  const getThreatDetails = () => {
    switch (threatLevel) {
      case 'safe':
        return {
          color: 'text-green-400',
          bg: 'bg-green-900/20',
          border: 'border-green-500',
          icon: Shield,
          message: 'No threats detected. Area is secure.'
        };
      case 'warning':
        return {
          color: 'text-yellow-400',
          bg: 'bg-yellow-900/20',
          border: 'border-yellow-500',
          icon: Activity,
          message: 'Unusual activity detected. Stay alert.'
        };
      case 'danger':
        return {
          color: 'text-orange-400',
          bg: 'bg-orange-900/20',
          border: 'border-orange-500',
          icon: AlertTriangle,
          message: 'Potential threat identified. Proceed with caution.'
        };
      case 'critical':
        return {
          color: 'text-red-400',
          bg: 'bg-red-900/20',
          border: 'border-red-500 animate-pulse',
          icon: AlertTriangle,
          message: 'DEMOGORGON DETECTED! EVACUATE IMMEDIATELY!'
        };
      default:
        return {
          color: 'text-gray-400',
          bg: 'bg-gray-900/20',
          border: 'border-gray-500',
          icon: Shield,
          message: 'System initializing...'
        };
    }
  };

  const details = getThreatDetails();
  const Icon = details.icon;

  return (
    <div className="bg-black rounded-lg p-6 hover-glow">
      <div className="flex items-center gap-3 mb-4">
        <Icon className={`w-8 h-8 ${details.color}`} />
        <h2 className="text-xl font-bold text-red-400">THREAT ANALYSIS</h2>
      </div>

      {/* Status Message */}
      <div className={`${details.bg} rounded-lg p-4 mb-4`}>
        <p className={`text-lg font-bold ${details.color} uppercase tracking-wide`}>
          {details.message}
        </p>
      </div>

      {/* Analysis Details */}
      {analysis && (
        <div className="space-y-4">
          {/* Confidence Level */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-400">CONFIDENCE LEVEL</span>
              <span className={`text-sm font-bold ${details.color}`}>
                {analysis.confidence}%
              </span>
            </div>
            <div className="w-full bg-gray-800 rounded-full h-3 overflow-hidden">
              <div
                className={`h-full ${details.bg} ${details.border} border-r-2 transition-all duration-500`}
                style={{ width: `${analysis.confidence}%` }}
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <h3 className="text-sm text-gray-400 mb-2">DESCRIPTION</h3>
            <p className="text-white bg-black/40 p-3 rounded border border-gray-700">
              {analysis.description}
            </p>
          </div>

          {/* Recommendations */}
          {analysis.recommendations && analysis.recommendations.length > 0 && (
            <div>
              <h3 className="text-sm text-gray-400 mb-2">RECOMMENDED ACTIONS</h3>
              <div className="space-y-2">
                {analysis.recommendations.map((rec, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-2 bg-black/40 p-3 rounded border border-gray-700"
                  >
                    <span className={`${details.color} font-bold`}>{index + 1}.</span>
                    <span className="text-gray-300 text-sm">{rec}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Placeholder when no analysis */}
      {!analysis && (
        <div className="text-center py-8 text-gray-500">
          <Activity className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>Capture an image or upload a file to begin analysis</p>
        </div>
      )}
    </div>
  );
}
