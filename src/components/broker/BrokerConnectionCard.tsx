import React, { useState, useEffect } from 'react';
import { Card, Box, Text, Button, Badge, Flex, Stack } from '@chakra-ui/react';
import { Wifi, WifiOff, AlertCircle, CheckCircle } from 'lucide-react';
import { fyersService } from '../../services/fyersService';

interface BrokerConnectionCardProps {
  onConnect?: () => void;
}

export const BrokerConnectionCard: React.FC<BrokerConnectionCardProps> = ({ onConnect }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check for auth code in URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const authCode = urlParams.get('auth_code');
    
    if (authCode) {
      handleAuthCallback(authCode);
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    } else {
      checkConnectionStatus();
    }
    
    // Check connection status every 30 seconds
    const interval = setInterval(checkConnectionStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleAuthCallback = async (authCode: string) => {
    setIsConnecting(true);
    try {
      const result = await fyersService.authenticate(authCode);
      if (result.success) {
        setIsConnected(true);
        setError(null);
      } else {
        setError(result.error || 'Authentication failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed');
    } finally {
      setIsConnecting(false);
    }
  };

  const checkConnectionStatus = async () => {
    try {
      const response = await fetch('/api/fyers/profile');
      const data = await response.json();
      
      if (data.success && data.data?.data?.fy_id) {
        setIsConnected(true);
        setError(null);
      } else {
        setIsConnected(false);
        setError(data.error || 'Not authenticated');
      }
    } catch (err) {
      setIsConnected(false);
      setError('Backend not available');
      console.error('Connection check failed:', err);
    }
  };

  const handleConnect = async () => {
    setIsConnecting(true);
    setError(null);
    
    try {
      const authUrl = await fyersService.getAuthUrl();
      if (authUrl && authUrl.includes('client_id=None')) {
        setError('Backend configuration error. Please check environment variables.');
        return;
      }
      if (!authUrl) {
        setError('Failed to get authentication URL');
        return;
      }
      window.location.href = authUrl;
      onConnect?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Backend server not available');
    } finally {
      setIsConnecting(false);
    }
  };

  if (isConnected) {
    return (
      <Card.Root variant="outline" size="sm">
        <Card.Body>
          <Flex align="center" gap={4}>
            <Box color="green.500">
              <CheckCircle size={24} />
            </Box>
            
            <Stack gap={1} flex={1}>
              <Text fontWeight="medium" color="neutral.900">
                Fyers Connected
              </Text>
              <Text fontSize="sm" color="neutral.600">
                Ready for trading
              </Text>
            </Stack>

            <Badge colorPalette="green" variant="subtle" size="sm">
              Connected
            </Badge>
          </Flex>
        </Card.Body>
      </Card.Root>
    );
  }

  return (
    <Card.Root variant="outline" size="sm">
      <Card.Body>
        <Flex align="center" gap={4}>
          <Box color="red.500">
            <WifiOff size={24} />
          </Box>
          
          <Stack gap={1} flex={1}>
            <Text fontWeight="medium" color="neutral.900">
              Broker Not Connected
            </Text>
            <Text fontSize="sm" color="neutral.600">
              Connect to Fyers to start trading
            </Text>
            {error && (
              <Flex align="center" gap={1}>
                <AlertCircle size={12} color="red" />
                <Text fontSize="xs" color="red.500">{error}</Text>
              </Flex>
            )}
          </Stack>

          <Stack gap={2} align="flex-end">
            <Badge colorPalette="red" variant="subtle" size="sm">
              Disconnected
            </Badge>
            <Button
              colorPalette="brand"
              size="sm"
              onClick={handleConnect}
              loading={isConnecting}
            >
              <Wifi size={14} />
              Connect
            </Button>
          </Stack>
        </Flex>
      </Card.Body>
    </Card.Root>
  );
};