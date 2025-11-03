import React from 'react';
import { Activity, AlertTriangle, CheckCircle, FileText, Clock, Zap } from 'lucide-react';
import { SystemStats } from '../types';

interface DashboardProps {
  stats: SystemStats;
  isMonitoring: boolean;
}

export const Dashboard: React.FC<DashboardProps> = ({ stats, isMonitoring }) => {
  const statCards = [
    {
      title: 'Total Events',
      value: stats.totalEvents,
      icon: Activity,
      color: 'blue',
      change: '+12%',
    },
    {
      title: 'Active Alerts',
      value: stats.activeAlerts,
      icon: AlertTriangle,
      color: stats.activeAlerts > 0 ? 'red' : 'gray',
      change: stats.activeAlerts > 0 ? 'Needs attention' : 'All clear',
    },
    {
      title: 'Resolved Issues',
      value: stats.resolvedIssues,
      icon: CheckCircle,
      color: 'green',
      change: '+8 today',
    },
    {
      title: 'Monitored Files',
      value: stats.monitoredFiles,
      icon: FileText,
      color: 'purple',
      change: 'Active',
    },
  ];

  const getColorClasses = (color: string) => {
    const colors = {
      blue: 'bg-blue-500 text-blue-600 bg-blue-50',
      red: 'bg-red-500 text-red-600 bg-red-50',
      green: 'bg-green-500 text-green-600 bg-green-50',
      purple: 'bg-purple-500 text-purple-600 bg-purple-50',
      gray: 'bg-gray-500 text-gray-600 bg-gray-50',
    };
    return colors[color as keyof typeof colors] || colors.gray;
  };

  return (
    <div className="p-6">
      {/* Status Banner */}
      <div className={`mb-6 p-4 rounded-lg border-l-4 ${
        isMonitoring 
          ? 'bg-green-50 border-green-400 text-green-800' 
          : 'bg-yellow-50 border-yellow-400 text-yellow-800'
      }`}>
        <div className="flex items-center">
          <div className="flex">
            {isMonitoring ? (
              <Zap className="h-5 w-5 text-green-600 mr-2" />
            ) : (
              <Clock className="h-5 w-5 text-yellow-600 mr-2" />
            )}
          </div>
          <div>
            <p className="font-medium">
              {isMonitoring ? 'System Monitoring Active' : 'System Monitoring Paused'}
            </p>
            <p className="text-sm opacity-75">
              {isMonitoring 
                ? `Uptime: ${stats.uptime} • Last update: ${stats.lastUpdate}`
                : 'Click to resume monitoring'
              }
            </p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat, index) => {
          const colorClasses = getColorClasses(stat.color).split(' ');
          const IconComponent = stat.icon;
          
          return (
            <div
              key={index}
              className="bg-white p-6 rounded-xl shadow-sm border hover:shadow-md transition-all duration-300 hover:-translate-y-1"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
                  <p className="text-3xl font-bold text-gray-900">{stat.value.toLocaleString()}</p>
                  <p className={`text-sm mt-2 ${stat.color === 'red' ? 'text-red-600' : 'text-gray-500'}`}>
                    {stat.change}
                  </p>
                </div>
                <div className={`p-3 rounded-lg ${colorClasses[2]}`}>
                  <IconComponent className={`h-6 w-6 ${colorClasses[1]}`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="bg-white p-6 rounded-xl shadow-sm border">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="p-4 text-left border rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-all duration-200">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Activity className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">View All Events</p>
                <p className="text-sm text-gray-600">Monitor system activity</p>
              </div>
            </div>
          </button>

          <button className="p-4 text-left border rounded-lg hover:bg-purple-50 hover:border-purple-300 transition-all duration-200">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <FileText className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Manage Users</p>
                <p className="text-sm text-gray-600">Configure access roles</p>
              </div>
            </div>
          </button>

          <button className="p-4 text-left border rounded-lg hover:bg-green-50 hover:border-green-300 transition-all duration-200">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">System Health</p>
                <p className="text-sm text-gray-600">Check performance</p>
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};