import React, { useState, useEffect } from 'react';
import {
  Card,
  Text,
  Button,
  Flex,
  Box,
  Badge,
  Input
} from '@chakra-ui/react';
import { ExternalLink, CheckCircle, AlertCircle } from 'lucide-react';
import { fyersService } from '../../services/fyersService';

interface FyersAuthProps {
  onAuthSuccess?: () => void;
}

export const FyersAuth: React.FC<FyersAuthProps> = ({ onAuthSuccess }) => {
  const [authUrl, setAuthUrl] = useState<string>('');
  const [authCode, setAuthCode] = useState<string>('');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [profile, setProfile] = useState<{ name?: string; id?: string; email?: string } | null>(null);

  const getAuthUrl = async () => {
    try {
      setLoading(true);
      const url = await fyersService.getAuthUrl();
      setAuthUrl(url);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const authenticate = async () => {
    if (!authCode.trim()) {
      setError('Please enter the authorization code');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      const result = await fyersService.authenticate(authCode);
      
      if (result.success) {
        setIsAuthenticated(true);
        
        // Get user profile
        try {
          const profileData = await fyersService.getProfile();
          setProfile(profileData);
        } catch (profileErr) {
          console.warn('Could not fetch profile:', profileErr);
        }
        
        onAuthSuccess?.();
      } else {
        setError(result.error || 'Authentication failed');
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const openAuthUrl = () => {
    if (authUrl) {
      window.open(authUrl, '_blank');
    }
  };

  const disconnect = () => {
    setIsAuthenticated(false);
    setProfile(null);
    setAuthCode('');
    setError('');
    // Clear any stored tokens or session data
    localStorage.removeItem('fyers_access_token');
    // Refresh auth URL for reconnection
    getAuthUrl();
  };

  useEffect(() => {
    getAuthUrl();
  }, []);

  if (isAuthenticated) {
    return (
      <Card.Root>
        <Card.Body>
          <Flex align="center" gap={3} mb={4}>
            <CheckCircle size={24} color="green" />
            <Box>
              <Text textStyle="heading.sm" color="green.600">
                Fyers Connected
              </Text>
              <Text fontSize="sm" color="neutral.600">
                Successfully authenticated with Fyers API
              </Text>
            </Box>
            <Flex gap={2}>
              <Badge colorPalette="green" size="sm">
                Live
              </Badge>
              <Button
                variant="outline"
                size="xs"
                colorPalette="red"
                onClick={disconnect}
              >
                Disconnect
              </Button>
            </Flex>
          </Flex>

          {profile && (
            <Box p={3} bg="neutral.50" borderRadius="md">
              <Text fontSize="sm" fontWeight="medium" mb={1}>
                Account: {profile.name || profile.id}
              </Text>
              <Text fontSize="xs" color="neutral.600">
                {profile.email || 'Connected successfully'}
              </Text>
            </Box>
          )}
        </Card.Body>
      </Card.Root>
    );
  }

  return (
    <Card.Root>
      <Card.Body>
        <Flex align="center" gap={3} mb={4}>
          <ExternalLink size={24} color="#3182ce" />
          <Box>
            <Text textStyle="heading.sm" color="neutral.900">
              Connect to Fyers
            </Text>
            <Text fontSize="sm" color="neutral.600">
              Authenticate to access live market data and trading
            </Text>
          </Box>
        </Flex>

        {error && (
          <Box p={3} bg="red.50" borderRadius="md" mb={4}>
            <Flex align="center" gap={2} mb={1}>
              <AlertCircle size={16} color="red" />
              <Text fontSize="sm" fontWeight="medium" color="red.700">
                Authentication Error
              </Text>
            </Flex>
            <Text fontSize="sm" color="red.600">
              {error}
            </Text>
          </Box>
        )}

        <Box mb={4}>
          <Text fontSize="sm" fontWeight="medium" mb={2}>
            Step 1: Get Authorization Code
          </Text>
          <Button
            variant="outline"
            size="sm"
            onClick={openAuthUrl}
            disabled={!authUrl || loading}
            loading={loading && !authUrl ? true : false}
          >
            <ExternalLink size={16} />
            Open Fyers Login
          </Button>
          <Text fontSize="xs" color="neutral.600" mt={1}>
            This will open Fyers login in a new tab
          </Text>
        </Box>

        <Box mb={4}>
          <Text fontSize="sm" fontWeight="medium" mb={2}>
            Step 2: Enter Authorization Code
          </Text>
          <Flex gap={2}>
            <Input
              placeholder="Paste authorization code here"
              value={authCode}
              onChange={(e) => setAuthCode(e.target.value)}
              size="sm"
            />
            <Button
              colorPalette="brand"
              size="sm"
              onClick={authenticate}
              loading={loading && !!authCode}
              disabled={!authCode.trim()}
            >
              Connect
            </Button>
          </Flex>
          <Text fontSize="xs" color="neutral.600" mt={1}>
            Copy the code from the redirect URL after login
          </Text>
        </Box>

        <Box p={3} bg="blue.50" borderRadius="md">
          <Text fontSize="xs" color="blue.700">
            <strong>Note:</strong> You need a Fyers trading account and API credentials configured in the backend to use live data.
          </Text>
        </Box>
      </Card.Body>
    </Card.Root>
  );
};