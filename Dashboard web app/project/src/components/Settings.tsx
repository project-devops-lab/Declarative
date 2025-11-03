import React, { useState } from 'react';
import { Save, FolderOpen, Shield, Mail, AlertTriangle } from 'lucide-react';
import { MonitoringConfig } from '../types';

interface SettingsProps {
  config: MonitoringConfig;
  onUpdateConfig: (config: MonitoringConfig) => void;
}

export const Settings: React.FC<SettingsProps> = ({ config, onUpdateConfig }) => {
  const [localConfig, setLocalConfig] = useState<MonitoringConfig>(config);
  const [newWatchPath, setNewWatchPath] = useState('');
  const [newPattern, setNewPattern] = useState('');

  const handleSave = () => {
    onUpdateConfig(localConfig);
  };

  const addWatchPath = () => {
    if (newWatchPath && !localConfig.watchPaths.includes(newWatchPath)) {
      setLocalConfig({
        ...localConfig,
        watchPaths: [...localConfig.watchPaths, newWatchPath]
      });
      setNewWatchPath('');
    }
  };

  const removeWatchPath = (path: string) => {
    setLocalConfig({
      ...localConfig,
      watchPaths: localConfig.watchPaths.filter(p => p !== path)
    });
  };

  const addSensitivePattern = () => {
    if (newPattern && !localConfig.sensitiveDataPatterns.includes(newPattern)) {
      setLocalConfig({
        ...localConfig,
        sensitiveDataPatterns: [...localConfig.sensitiveDataPatterns, newPattern]
      });
      setNewPattern('');
    }
  };

  const removeSensitivePattern = (pattern: string) => {
    setLocalConfig({
      ...localConfig,
      sensitiveDataPatterns: localConfig.sensitiveDataPatterns.filter(p => p !== pattern)
    });
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">System Configuration</h2>
        <p className="text-gray-600">Configure monitoring rules and notification settings</p>
      </div>

      <div className="space-y-8">
        {/* Watch Paths Configuration */}
        <div className="bg-white border rounded-lg p-6">
          <div className="flex items-center space-x-2 mb-4">
            <FolderOpen className="h-5 w-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">Watch Paths</h3>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            Specify directories and files to monitor for changes
          </p>
          
          <div className="flex space-x-2 mb-4">
            <input
              type="text"
              value={newWatchPath}
              onChange={(e) => setNewWatchPath(e.target.value)}
              placeholder="/path/to/monitor"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={addWatchPath}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200"
            >
              Add Path
            </button>
          </div>

          <div className="space-y-2">
            {localConfig.watchPaths.map((path, index) => (
              <div key={index} className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-lg">
                <span className="text-sm font-mono text-gray-800">{path}</span>
                <button
                  onClick={() => removeWatchPath(path)}
                  className="text-red-600 hover:text-red-800 text-sm"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Sensitive Data Patterns */}
        <div className="bg-white border rounded-lg p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Shield className="h-5 w-5 text-purple-600" />
            <h3 className="text-lg font-semibold text-gray-900">Sensitive Data Patterns</h3>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            Define regex patterns to detect sensitive data (API keys, passwords, etc.)
          </p>
          
          <div className="flex space-x-2 mb-4">
            <input
              type="text"
              value={newPattern}
              onChange={(e) => setNewPattern(e.target.value)}
              placeholder="sk-[a-zA-Z0-9]{48}"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <button
              onClick={addSensitivePattern}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors duration-200"
            >
              Add Pattern
            </button>
          </div>

          <div className="space-y-2">
            {localConfig.sensitiveDataPatterns.map((pattern, index) => (
              <div key={index} className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-lg">
                <span className="text-sm font-mono text-gray-800">{pattern}</span>
                <button
                  onClick={() => removeSensitivePattern(pattern)}
                  className="text-red-600 hover:text-red-800 text-sm"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Notification Settings */}
        <div className="bg-white border rounded-lg p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Mail className="h-5 w-5 text-green-600" />
            <h3 className="text-lg font-semibold text-gray-900">Notification Settings</h3>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="emailNotifications"
                checked={localConfig.emailNotifications}
                onChange={(e) => setLocalConfig({
                  ...localConfig,
                  emailNotifications: e.target.checked
                })}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="emailNotifications" className="text-sm font-medium text-gray-900">
                Enable email notifications
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notify these roles:
              </label>
              <div className="space-y-2">
                {['admin', 'developer', 'observer'].map((role) => (
                  <div key={role} className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id={`role-${role}`}
                      checked={localConfig.notificationRoles.includes(role as any)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setLocalConfig({
                            ...localConfig,
                            notificationRoles: [...localConfig.notificationRoles, role as any]
                          });
                        } else {
                          setLocalConfig({
                            ...localConfig,
                            notificationRoles: localConfig.notificationRoles.filter(r => r !== role)
                          });
                        }
                      }}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor={`role-${role}`} className="text-sm text-gray-900 capitalize">
                      {role}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center space-x-2"
          >
            <Save className="h-4 w-4" />
            <span>Save Configuration</span>
          </button>
        </div>
      </div>
    </div>
  );
};