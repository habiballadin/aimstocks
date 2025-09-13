import React from 'react';
import { Alert, Button, Box } from '@chakra-ui/react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface ErrorMessageProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  variant?: 'subtle' | 'solid' | 'outline';
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({
  title = 'Something went wrong',
  message,
  onRetry,
  variant = 'subtle'
}) => {
  return (
    <Alert.Root status="error" variant={variant}>
      <Alert.Indicator>
        <AlertTriangle size={16} />
      </Alert.Indicator>
      <Box flex={1}>
        <Alert.Title>{title}</Alert.Title>
        <Alert.Description>{message}</Alert.Description>
        {onRetry && (
          <Button
            size="sm"
            variant="outline"
            colorPalette="red"
            mt={3}
            onClick={onRetry}
          >
            <RefreshCw size={14} />
            Try Again
          </Button>
        )}
      </Box>
    </Alert.Root>
  );
};