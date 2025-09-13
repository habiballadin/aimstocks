import React, { createContext, useContext, useState, useCallback } from 'react';
import { Box, Portal } from '@chakra-ui/react';
import { ToastNotification } from './ToastNotification';

interface ToastData {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
}

interface ToastContextType {
  showToast: (toast: Omit<ToastData, 'id'>) => void;
  hideToast: (id: string) => void;
  clearAllToasts: () => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

interface ToastProviderProps {
  children: React.ReactNode;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
  maxToasts?: number;
  defaultDuration?: number;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({
  children,
  position = 'top-right',
  maxToasts = 5,
  defaultDuration = 5000
}) => {
  const [toasts, setToasts] = useState<ToastData[]>([]);

  const showToast = useCallback((toast: Omit<ToastData, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast: ToastData = {
      ...toast,
      id,
      duration: toast.duration ?? defaultDuration
    };

    setToasts(prev => {
      const updated = [newToast, ...prev];
      return updated.slice(0, maxToasts);
    });

    // Auto-hide toast after duration
    if (newToast.duration > 0) {
      setTimeout(() => {
        hideToast(id);
      }, newToast.duration);
    }
  }, [defaultDuration, maxToasts]);

  const hideToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const clearAllToasts = useCallback(() => {
    setToasts([]);
  }, []);

  const getPositionStyles = () => {
    const baseStyles = {
      position: 'fixed' as const,
      zIndex: 'toast',
      pointerEvents: 'none' as const
    };

    switch (position) {
      case 'top-right':
        return { ...baseStyles, top: '1rem', right: '1rem' };
      case 'top-left':
        return { ...baseStyles, top: '1rem', left: '1rem' };
      case 'bottom-right':
        return { ...baseStyles, bottom: '1rem', right: '1rem' };
      case 'bottom-left':
        return { ...baseStyles, bottom: '1rem', left: '1rem' };
      case 'top-center':
        return { ...baseStyles, top: '1rem', left: '50%', transform: 'translateX(-50%)' };
      case 'bottom-center':
        return { ...baseStyles, bottom: '1rem', left: '50%', transform: 'translateX(-50%)' };
      default:
        return { ...baseStyles, top: '1rem', right: '1rem' };
    }
  };

  return (
    <ToastContext.Provider value={{ showToast, hideToast, clearAllToasts }}>
      {children}
      <Portal>
        <Box {...getPositionStyles()}>
          <div className="flex flex-col gap-2">
            {toasts.map(toast => (
              <ToastNotification
                key={toast.id}
                {...toast}
                onClose={() => hideToast(toast.id)}
              />
            ))}
          </div>
        </Box>
      </Portal>
    </ToastContext.Provider>
  );
};