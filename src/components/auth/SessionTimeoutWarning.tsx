import React, { useState, useEffect } from 'react';
import { Clock, X } from 'lucide-react';

interface SessionTimeoutWarningProps {
  show: boolean;
  onExtend: () => void;
  onLogout: () => void;
  onClose: () => void;
  remainingMinutes: number;
}

export const SessionTimeoutWarning: React.FC<SessionTimeoutWarningProps> = ({
  show,
  onExtend,
  onLogout,
  onClose,
  remainingMinutes: initialMinutes
}) => {
  const [remainingTime, setRemainingTime] = useState(initialMinutes * 60);

  useEffect(() => {
    if (!show) return;

    setRemainingTime(initialMinutes * 60);

    const interval = setInterval(() => {
      setRemainingTime(prev => {
        if (prev <= 1) {
          onLogout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [show, initialMinutes, onLogout]);

  if (!show) return null;

  const minutes = Math.floor(remainingTime / 60);
  const seconds = remainingTime % 60;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center text-orange-600">
            <Clock className="w-6 h-6 mr-2" />
            <h3 className="text-lg font-semibold">Session Expiring Soon</h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mb-6">
          <p className="text-gray-700 mb-4">
            Your session will expire in{' '}
            <span className="font-mono font-bold text-orange-600">
              {minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
            </span>
          </p>
          <p className="text-gray-600 text-sm">
            You'll be automatically logged out to protect your account. 
            Click "Stay Logged In" to extend your session.
          </p>
        </div>

        <div className="flex space-x-3">
          <button
            onClick={onExtend}
            className="flex-1 btn btn-primary"
          >
            Stay Logged In
          </button>
          <button
            onClick={onLogout}
            className="flex-1 btn btn-outline"
          >
            Logout Now
          </button>
        </div>
      </div>
    </div>
  );
};
