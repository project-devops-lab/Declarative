import React from 'react';
import { AlertTriangle, FileText, Shield, CheckCircle, Clock, X } from 'lucide-react';
import { MonitoringEvent } from '../types';

interface EventsPanelProps {
  events: MonitoringEvent[];
  onResolveEvent: (eventId: string) => void;
}

export const EventsPanel: React.FC<EventsPanelProps> = ({ events, onResolveEvent }) => {
  const getEventIcon = (type: string, severity: string) => {
    switch (type) {
      case 'error':
        return <AlertTriangle className={`h-5 w-5 ${severity === 'critical' ? 'text-red-600' : 'text-orange-600'}`} />;
      case 'change':
        return <FileText className="h-5 w-5 text-blue-600" />;
      case 'sensitive_data':
        return <Shield className="h-5 w-5 text-purple-600" />;
      default:
        return <Clock className="h-5 w-5 text-gray-600" />;
    }
  };

  const getSeverityBadge = (severity: string) => {
    const colors = {
      low: 'bg-blue-100 text-blue-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-orange-100 text-orange-800',
      critical: 'bg-red-100 text-red-800',
    };
    
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${colors[severity as keyof typeof colors]}`}>
        {severity.toUpperCase()}
      </span>
    );
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const activeEvents = events.filter(event => !event.resolved);
  const resolvedEvents = events.filter(event => event.resolved);

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">System Events</h2>
        <p className="text-gray-600">Monitor all system activities and alerts</p>
      </div>

      {/* Active Events */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Active Alerts</h3>
          <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium">
            {activeEvents.length} active
          </span>
        </div>

        <div className="space-y-3">
          {activeEvents.length === 0 ? (
            <div className="text-center py-8 bg-green-50 rounded-lg border border-green-200">
              <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-3" />
              <p className="text-green-800 font-medium">All systems operational</p>
              <p className="text-green-600 text-sm">No active alerts at this time</p>
            </div>
          ) : (
            activeEvents.map((event) => (
              <div key={event.id} className="bg-white border rounded-lg p-4 hover:shadow-md transition-shadow duration-200">
                <div className="flex items-start space-x-4">
                  <div className="mt-1">
                    {getEventIcon(event.type, event.severity)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-2">
                      {getSeverityBadge(event.severity)}
                      <span className="text-sm text-gray-500">{formatTimestamp(event.timestamp)}</span>
                    </div>
                    <h4 className="text-sm font-medium text-gray-900 mb-1">{event.message}</h4>
                    <p className="text-sm text-gray-600 mb-2">{event.details}</p>
                    {event.filePath && (
                      <p className="text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded inline-block">
                        {event.filePath}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => onResolveEvent(event.id)}
                    className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all duration-200"
                    title="Mark as resolved"
                  >
                    <CheckCircle className="h-5 w-5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Recent Resolved Events */}
      {resolvedEvents.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Recently Resolved</h3>
            <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
              {resolvedEvents.length} resolved
            </span>
          </div>

          <div className="space-y-3">
            {resolvedEvents.slice(0, 5).map((event) => (
              <div key={event.id} className="bg-gray-50 border rounded-lg p-4 opacity-75">
                <div className="flex items-start space-x-4">
                  <div className="mt-1">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="bg-green-100 text-green-800 px-2 py-1 text-xs font-medium rounded-full">
                        RESOLVED
                      </span>
                      <span className="text-sm text-gray-500">{formatTimestamp(event.timestamp)}</span>
                    </div>
                    <h4 className="text-sm font-medium text-gray-700 mb-1">{event.message}</h4>
                    <p className="text-sm text-gray-600">{event.details}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};