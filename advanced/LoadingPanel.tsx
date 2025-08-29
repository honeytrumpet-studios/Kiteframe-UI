import React, { useState, useEffect } from 'react';
import {
  Activity,
  Zap,
  BarChart3,
  Smile,
  Settings,
  MoreHorizontal,
  MessageCircle,
  Send,
} from 'lucide-react';

const ICONS = [Activity, Zap, BarChart3, Smile, Settings, MoreHorizontal, MessageCircle, Send];
const MESSAGES = [
  'Analyzing workflow…',
  'Adding comment…',
  'Syncing thread…',
  'Loading replies…',
  'Processing reactions…',
  'Almost there…',
];

interface LoadingPanelProps {
  message?: string;
  className?: string;
}

export const LoadingPanel: React.FC<LoadingPanelProps> = ({ 
  message,
  className = '' 
}) => {
  const [iconIdx, setIconIdx] = useState(0);
  const [msgIdx, setMsgIdx] = useState(0);

  useEffect(() => {
    const iconTimer = setInterval(() => {
      setIconIdx(i => (i + 1) % ICONS.length);
    }, 500);
    const msgTimer = setInterval(() => {
      setMsgIdx(m => (m + 1) % MESSAGES.length);
    }, 3000);
    return () => {
      clearInterval(iconTimer);
      clearInterval(msgTimer);
    };
  }, []);

  const Icon = ICONS[iconIdx];
  const displayMessage = message || MESSAGES[msgIdx];

  return (
    <div className={`flex flex-col items-center justify-center h-full p-4 space-y-4 ${className}`}>
      <Icon className="h-12 w-12 text-blue-500 animate-spin-slow" />
      <p className="text-gray-700 dark:text-gray-300 text-center animate-pulse">
        {displayMessage}
      </p>
    </div>
  );
};