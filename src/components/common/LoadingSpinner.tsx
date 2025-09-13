import React from 'react';
import { Box, Spinner, Text } from '@chakra-ui/react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  message?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  message = 'Loading...'
}) => {
  return (
    <Box textAlign="center" p={4}>
      <Spinner 
        size={size} 
        color="ai.600"
      />
      {message && (
        <Text fontSize="sm" color="neutral.600">
          {message}
        </Text>
      )}
    </Box>
  );
};