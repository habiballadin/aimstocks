import React, { useEffect, useState } from 'react';
import { Alert, IconButton } from '@chakra-ui/react';
import { CheckCircle, AlertTriangle, Info, X, AlertCircle } from 'lucide-react';

interface ToastNotificationProps {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
  onClose: () => void;
}

export const ToastNotification: React.FC<ToastNotificationProps> = ({
  type,
  title,
  message,
  onClose
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Trigger animation
    setTimeout(() => setIsVisible(true), 10);
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 200); // Wait for animation to complete
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle size={20} />;
      case 'error':
        return <AlertCircle size={20} />;
      case 'warning':
        return <AlertTriangle size={20} />;
      case 'info':
        return <Info size={20} />;
      default:
        return <Info size={20} />;
    }
  };

  const getStatus = () => {
    switch (type) {
      case 'success':
        return 'success';
      case 'error':
        return 'error';
      case 'warning':
        return 'warning';
      case 'info':
        return 'info';
      default:
        return 'info';
    }
  };

  return (
    <div 
      className={`
        transform transition-all duration-200 ease-in-out pointer-events-auto
        ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
      `}
      style={{ minWidth: '320px', maxWidth: '400px' }}
    >
      <Alert.Root 
        status={getStatus()} 
        variant="subtle"
        className="shadow-lg border border-gray-200 rounded-lg"
      >
        <Alert.Indicator>
          {getIcon()}
        </Alert.Indicator>
        <div className="flex-1 min-w-0">
          <Alert.Title className="text-sm font-semibold">
            {title}
          </Alert.Title>
          <Alert.Description className="text-sm mt-1">
            {message}
          </Alert.Description>
        </div>
        <IconButton
          variant="ghost"
          size="sm"
          onClick={handleClose}
          className="ml-2 flex-shrink-0"
        >
          <X size={16} />
        </IconButton>
      </Alert.Root>
    </div>
  );
};