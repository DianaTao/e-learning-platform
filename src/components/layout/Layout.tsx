import React, { useState } from 'react';
import { Header } from './Header';
import { ToastContainer } from '@/components/ui/ToastContainer';
import { SessionTimeoutWarning } from '@/components/auth/SessionTimeoutWarning';
import { useSessionTimeout } from '@/hooks/useSessionTimeout';
import { useAuthStore } from '@/stores/authStore';
import { useAppStore } from '@/stores/appStore';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [showTimeoutWarning, setShowTimeoutWarning] = useState(false);
  const { logout } = useAuthStore();
  const { addToast } = useAppStore();

  const { resetTimer, getRemainingTime } = useSessionTimeout({
    timeoutMinutes: 30,
    warningMinutes: 5,
    onWarning: () => {
      setShowTimeoutWarning(true);
      addToast({
        type: 'warning',
        title: 'Session Expiring',
        message: 'Your session will expire in 5 minutes due to inactivity.',
        duration: 8000
      });
    },
    onTimeout: () => {
      setShowTimeoutWarning(false);
      addToast({
        type: 'info',
        title: 'Session Expired',
        message: 'You have been logged out due to inactivity.',
        duration: 5000
      });
    }
  });

  const handleExtendSession = () => {
    resetTimer();
    setShowTimeoutWarning(false);
    addToast({
      type: 'success',
      title: 'Session Extended',
      message: 'Your session has been extended for another 30 minutes.',
      duration: 3000
    });
  };

  const handleLogoutNow = () => {
    setShowTimeoutWarning(false);
    logout();
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
      <ToastContainer />
      
      <SessionTimeoutWarning
        show={showTimeoutWarning}
        onExtend={handleExtendSession}
        onLogout={handleLogoutNow}
        onClose={() => setShowTimeoutWarning(false)}
        remainingMinutes={Math.ceil(getRemainingTime() / (1000 * 60))}
      />
    </div>
  );
};
