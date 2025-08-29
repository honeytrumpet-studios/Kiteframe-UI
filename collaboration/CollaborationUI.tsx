import React, { useState } from 'react';
import { useYjs } from './YjsProvider';
import { useYjsAwareness } from './useYjsAwareness';
import { Users, Wifi, WifiOff, Settings, Palette, User } from 'lucide-react';

interface CollaborationUIProps {
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
}

export const CollaborationUI: React.FC<CollaborationUIProps> = ({
  position = 'top-right',
}) => {
  const { isConnected, userName, userColor, setUserName, setUserColor } = useYjs();
  const [awarenessState] = useYjsAwareness();
  const [showSettings, setShowSettings] = useState(false);
  const [tempUserName, setTempUserName] = useState(userName);
  const [tempUserColor, setTempUserColor] = useState(userColor);

  const positionClasses = {
    'top-left': 'top-4 left-4',
    'top-right': 'top-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'bottom-right': 'bottom-4 right-4',
  };

  const handleSaveSettings = () => {
    setUserName(tempUserName);
    setUserColor(tempUserColor);
    setShowSettings(false);
  };

  const predefinedColors = [
    '#3b82f6', '#ef4444', '#10b981', '#f59e0b',
    '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16',
    '#f97316', '#6366f1', '#14b8a6', '#eab308',
  ];

  return (
    <div className={`fixed z-50 ${positionClasses[position]}`}>
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-3">
        {/* Connection status */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            {isConnected ? (
              <Wifi className="w-4 h-4 text-green-500" />
            ) : (
              <WifiOff className="w-4 h-4 text-red-500" />
            )}
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              {isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>

        {/* Active users */}
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Users className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-700 dark:text-gray-300">
              {awarenessState.users.length + 1} active
            </span>
          </div>
          
          {/* Current user */}
          <div className="flex items-center space-x-2">
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-medium"
              style={{ backgroundColor: userColor }}
            >
              {userName.charAt(0).toUpperCase()}
            </div>
            <span className="text-sm text-gray-900 dark:text-white">
              {userName} (you)
            </span>
          </div>

          {/* Other users */}
          {awarenessState.users.map((user) => (
            <div key={user.id} className="flex items-center space-x-2">
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-medium"
                style={{ backgroundColor: user.color }}
              >
                {user.name.charAt(0).toUpperCase()}
              </div>
              <span className="text-sm text-gray-900 dark:text-white">
                {user.name}
              </span>
            </div>
          ))}
        </div>

        {/* Settings panel */}
        {showSettings && (
          <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
            <div className="space-y-3">
              {/* Name input */}
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Display Name
                </label>
                <input
                  type="text"
                  value={tempUserName}
                  onChange={(e) => setTempUserName(e.target.value)}
                  className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              {/* Color picker */}
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Color
                </label>
                <div className="grid grid-cols-6 gap-1">
                  {predefinedColors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setTempUserColor(color)}
                      className={`w-6 h-6 rounded border-2 ${
                        tempUserColor === color
                          ? 'border-gray-900 dark:border-white'
                          : 'border-gray-300 dark:border-gray-600'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              {/* Save button */}
              <button
                onClick={handleSaveSettings}
                className="w-full px-3 py-2 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Save Settings
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};