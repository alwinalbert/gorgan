import { Bell, Clock, MapPin } from 'lucide-react';
import type { Alert } from '../types/index';

interface AlertPanelProps {
  alerts: Alert[];
}

export default function AlertPanel({ alerts }: AlertPanelProps) {
  const getThreatIcon = (level: string) => {
    switch (level) {
      case 'critical':
        return '🔴';
      case 'danger':
        return '🟠';
      case 'warning':
        return '🟡';
      default:
        return '🟢';
    }
  };

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  // Sample alerts for demo
  const sampleAlerts: Alert[] = alerts.length === 0 ? [
    {
      id: '1',
      timestamp: new Date(Date.now() - 120000),
      type: 'demogorgon',
      confidence: 89,
      threatLevel: 'critical',
      location: 'Sector 7-G',
      description: 'Large entity detected near east perimeter'
    },
    {
      id: '2',
      timestamp: new Date(Date.now() - 300000),
      type: 'demodogs',
      confidence: 67,
      threatLevel: 'warning',
      location: 'Sector 3-B',
      description: 'Multiple small heat signatures'
    },
    {
      id: '3',
      timestamp: new Date(Date.now() - 600000),
      type: 'other',
      confidence: 45,
      threatLevel: 'safe',
      location: 'Sector 1-A',
      description: 'False alarm - wildlife detected'
    }
  ] : alerts;

  return (
    <div className="bg-black/60 backdrop-blur border-2 border-red-900 rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-red-400 flex items-center gap-2">
          <Bell className="w-6 h-6" />
          ALERT HISTORY
        </h2>
        <div className="bg-red-900/30 px-3 py-1 rounded-full">
          <span className="text-sm font-bold">{sampleAlerts.length} Alerts</span>
        </div>
      </div>

      <div className="space-y-3 max-h-96 overflow-y-auto custom-scrollbar">
        {sampleAlerts.map((alert) => (
          <div
            key={alert.id}
            className="bg-black/40 border-l-4 border-red-500 p-3 rounded hover:bg-black/60 transition-colors"
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{getThreatIcon(alert.threatLevel)}</span>
                <span className="font-bold text-white uppercase text-sm">
                  {alert.type}
                </span>
              </div>
              <span className={`text-xs px-2 py-1 rounded ${
                alert.threatLevel === 'critical'
                  ? 'bg-red-900 text-red-200'
                  : alert.threatLevel === 'danger'
                  ? 'bg-orange-900 text-orange-200'
                  : alert.threatLevel === 'warning'
                  ? 'bg-yellow-900 text-yellow-200'
                  : 'bg-green-900 text-green-200'
              }`}>
                {alert.confidence}% confident
              </span>
            </div>

            <p className="text-gray-300 text-sm mb-2">{alert.description}</p>

            <div className="flex items-center gap-4 text-xs text-gray-500">
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {formatTime(alert.timestamp)}
              </div>
              {alert.location && (
                <div className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {alert.location}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {sampleAlerts.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <Bell className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>No alerts recorded</p>
        </div>
      )}
    </div>
  );
}
