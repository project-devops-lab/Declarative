import React from 'react';
import { Shield, Bell, Settings, User } from 'lucide-react';

interface HeaderProps {
  currentUser: string;
  alertCount: number;
  onSettingsClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({ currentUser, alertCount, onSettingsClick }) => {
  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <Shield className="h-8 w-8 text-blue-600" />
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Rahul Kumar
            </h1>
          </div>
          <div className="hidden md:block h-6 w-px bg-gray-300 ml-4" />
          <div className="hidden md:block text-sm text-gray-600">
            Advanced Monitoring & Protection
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <button className="relative p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200">
            <Bell className="h-5 w-5" />
            {alertCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
                {alertCount > 9 ? '9+' : alertCount}
              </span>
            )}
          </button>
          
          <button 
            onClick={onSettingsClick}
            className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
          >
            <Settings className="h-5 w-5" />
          </button>

          <div className="flex items-center space-x-2 bg-gray-50 px-3 py-2 rounded-lg">
            <User className="h-4 w-4 text-gray-600" />
            <span className="text-sm font-medium text-gray-900">{currentUser}</span>
          </div>
        </div>
      </div>
    </header>
  );
};