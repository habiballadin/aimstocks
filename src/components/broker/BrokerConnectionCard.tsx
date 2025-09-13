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
    checkConnectionStatus();
    
    // Check connection status every 30 seconds
    const interval = setInterval(checkConnectionStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const checkConnectionStatus = async () => {
    try {
      await fyersService.getProfile();
      setIsConnected(true);
      setError(null);
    } catch (err) {
      setIsConnected(false);
      setError(err instanceof Error ? err.message : 'Connection failed');
    }
  };

  const handleConnect = async () => {
    setIsConnecting(true);
    setError(null);
    
    try {
      const authUrl = await fyersService.getAuthUrl();
      if (authUrl.includes('client_id=None')) {
        setError('Backend configuration error. Please check environment variables.');
        return;
      }
      window.open(authUrl, '_blank');
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