import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { EventsPanel } from './components/EventsPanel';
import { UserManagement } from './components/UserManagement';
import { Settings } from './components/Settings';
import { MonitoringEvent, User, SystemStats, MonitoringConfig } from './types';
import { v4 as uuidv4 } from 'uuid';

function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'events' | 'users' | 'settings'>('dashboard');
  const [showSettings, setShowSettings] = useState(false);
  const [isMonitoring, setIsMonitoring] = useState(true);

  // Mock data
  const [events, setEvents] = useState<MonitoringEvent[]>([
    {
      id: '1',
      type: 'error',
      severity: 'high',
      message: 'Application Error Detected',
      details: 'Uncaught TypeError in dashboard.js line 127',
      filePath: '/src/components/dashboard.js',
      timestamp: new Date().toISOString(),
      resolved: false,
    },
    {
      id: '2',
      type: 'sensitive_data',
      severity: 'critical',
      message: 'Sensitive Data Upload Blocked',
      details: 'API key pattern detected in uploaded file',
      filePath: '/uploads/config.txt',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      resolved: false,
    },
    {
      id: '3',
      type: 'change',
      severity: 'medium',
      message: 'File Modified',
      details: 'Critical system file has been modified',
      filePath: '/config/database.json',
      timestamp: new Date(Date.now() - 7200000).toISOString(),
      resolved: true,
    },
  ]);

  const [users, setUsers] = useState<User[]>([
    {
      id: '1',
      name: 'John Smith',
      email: 'john.smith@company.com',
      role: 'admin',
      active: true,
      createdAt: new Date().toISOString(),
    },
    {
      id: '2',
      name: 'Bangaru Tejachari',
      email: 'bteja16354@wipro.com',
      role: 'developer',
      active: true,
      createdAt: new Date().toISOString(),
    },
    {
      id: '3',
      name: 'Shubhangi Khatkale',
      email: 'shubhangi@wipro.com',
      role: 'observer',
      active: false,
      createdAt: new Date().toISOString(),
    },
    {
      id: '4',
      name: 'Rashmi',
      email: 'Rashmi@wipro.com',
      role: 'observer',
      active: false,
      createdAt: new Date().toISOString(),
    },
  ]);

  const [config, setConfig] = useState<MonitoringConfig>({
    watchPaths: ['/src', '/config', '/uploads'],
    excludePatterns: ['*.log', '*.tmp', 'node_modules/*'],
    emailNotifications: true,
    sensitiveDataPatterns: [
      'sk-[a-zA-Z0-9]{48}',
      'password\\s*[=:]\\s*[\'"][^\'"]+[\'"]',
      'api[_-]?key\\s*[=:]\\s*[\'"][^\'"]+[\'"]',
    ],
    notificationRoles: ['admin', 'developer'],
  });

  const stats: SystemStats = {
    totalEvents: events.length,
    activeAlerts: events.filter(e => !e.resolved).length,
    resolvedIssues: events.filter(e => e.resolved).length,
    monitoredFiles: 1247,
    uptime: '5d 14h 23m',
    lastUpdate: 'Just now',
  };

  const handleResolveEvent = (eventId: string) => {
    setEvents(events.map(event => 
      event.id === eventId ? { ...event, resolved: true } : event
    ));
  };

  const handleAddUser = (newUser: Omit<User, 'id' | 'createdAt'>) => {
    const user: User = {
      ...newUser,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
    };
    setUsers([...users, user]);
  };

  const handleUpdateUser = (userId: string, updates: Partial<User>) => {
    setUsers(users.map(user => 
      user.id === userId ? { ...user, ...updates } : user
    ));
  };

  const handleDeleteUser = (userId: string) => {
    setUsers(users.filter(user => user.id !== userId));
  };

  const handleUpdateConfig = (newConfig: MonitoringConfig) => {
    setConfig(newConfig);
  };

  const navigation = [
    { id: 'dashboard', label: 'Dashboard', active: activeTab === 'dashboard' },
    { id: 'events', label: 'Events', active: activeTab === 'events' },
    { id: 'users', label: 'Users', active: activeTab === 'users' },
  ];

  const renderContent = () => {
    if (showSettings) {
      return <Settings config={config} onUpdateConfig={handleUpdateConfig} />;
    }

    switch (activeTab) {
      case 'dashboard':
        return <Dashboard stats={stats} isMonitoring={isMonitoring} />;
      case 'events':
        return <EventsPanel events={events} onResolveEvent={handleResolveEvent} />;
      case 'users':
        return (
          <UserManagement
            users={users}
            onAddUser={handleAddUser}
            onUpdateUser={handleUpdateUser}
            onDeleteUser={handleDeleteUser}
          />
        );
      default:
        return <Dashboard stats={stats} isMonitoring={isMonitoring} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        currentUser="John Smith"
        alertCount={stats.activeAlerts}
        onSettingsClick={() => setShowSettings(!showSettings)}
      />

      <div className="flex">
        {/* Sidebar Navigation */}
        <div className="w-64 bg-white border-r border-gray-200 min-h-screen">
          <nav className="p-4">
            <div className="space-y-2">
              {navigation.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id as any);
                    setShowSettings(false);
                  }}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-200 ${
                    item.active
                      ? 'bg-blue-50 text-blue-700 font-medium border border-blue-200'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            {/* Monitoring Status */}
            <div className="mt-8 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Monitoring</span>
                <div className={`h-3 w-3 rounded-full ${isMonitoring ? 'bg-green-500' : 'bg-red-500'}`} />
              </div>
              <button
                onClick={() => setIsMonitoring(!isMonitoring)}
                className={`w-full px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                  isMonitoring
                    ? 'bg-red-100 text-red-800 hover:bg-red-200'
                    : 'bg-green-100 text-green-800 hover:bg-green-200'
                }`}
              >
                {isMonitoring ? 'Pause' : 'Resume'}
              </button>
            </div>
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}

export default App;