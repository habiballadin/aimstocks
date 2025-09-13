import React, { useState, useEffect } from 'react';
import { Box, VStack, HStack, Text, Button, Skeleton, Badge } from '@chakra-ui/react';
import { fyersService, FyersProfile, FyersFunds } from '../../services/fyersService';

export const UserProfile: React.FC = () => {
  const [profile, setProfile] = useState<FyersProfile | null>(null);
  const [funds, setFunds] = useState<FyersFunds[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      const [profileData, fundsData] = await Promise.all([
        fyersService.getProfile(),
        fyersService.getFunds().catch(() => [])
      ]);
      setProfile(profileData);
      setFunds(fundsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch profile');
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  if (loading) {
    return (
      <Box bg="white" rounded="lg" shadow="sm" p={6}>
        <VStack gap={3} align="stretch">
          <Skeleton height="4" width="25%" />
          <Skeleton height="3" width="50%" />
          <Skeleton height="3" width="33%" />
        </VStack>
      </Box>
    );
  }

  if (error) {
    return (
      <Box bg="white" rounded="lg" shadow="sm" p={6}>
        <Text fontSize="lg" fontWeight="medium" mb={2}>User Profile</Text>
        <Text fontSize="sm" color="gray.500">
          {error === 'Not authenticated' ? 'Please connect to Fyers to view profile' : error}
        </Text>
      </Box>
    );
  }

  if (!profile) return null;

  return (
    <Box bg="white" rounded="lg" shadow="sm" p={6}>
      <HStack justify="space-between" mb={4}>
        <Text fontSize="lg" fontWeight="medium">User Profile</Text>
        <Button size="sm" variant="ghost" colorPalette="blue" onClick={fetchProfile}>
          Refresh
        </Button>
      </HStack>
      
      <VStack gap={3} align="stretch">
        <HStack>
          <Box 
            w="12" 
            h="12" 
            bg="blue.500" 
            color="white" 
            fontWeight="bold" 
            rounded="full" 
            display="flex" 
            alignItems="center" 
            justifyContent="center"
          >
            {profile.name?.charAt(0) || 'U'}
          </Box>
          <VStack align="start" gap={0}>
            <Text fontWeight="medium">{profile.name}</Text>
            <Text fontSize="sm" color="gray.500">{profile.display_name}</Text>
          </VStack>
        </HStack>
        
        <VStack gap={2} align="stretch" fontSize="sm">
          <HStack>
            <Text fontWeight="medium" color="gray.700">Email:</Text>
            <Text color="gray.600">{profile.email_id}</Text>
          </HStack>
          
          <HStack>
            <Text fontWeight="medium" color="gray.700">Mobile:</Text>
            <Text color="gray.600">{profile.mobile_number}</Text>
          </HStack>
          
          <HStack>
            <Text fontWeight="medium" color="gray.700">PAN:</Text>
            <Text color="gray.600">{profile.PAN}</Text>
          </HStack>
          
          <HStack>
            <Text fontWeight="medium" color="gray.700">User ID:</Text>
            <Text color="gray.600">{profile.fy_id}</Text>
          </HStack>
          
          {profile.totp !== undefined && (
            <HStack>
              <Text fontWeight="medium" color="gray.700">2FA:</Text>
              <Badge colorPalette={profile.totp ? 'green' : 'red'}>
                {profile.totp ? 'Enabled' : 'Disabled'}
              </Badge>
            </HStack>
          )}
          
          {funds.length > 0 && (
            <Box mt={3} pt={3} borderTop="1px" borderColor="gray.200">
              <Text fontWeight="medium" color="gray.700" mb={2}>Account Balance</Text>
              {funds.filter(f => [1, 3, 10].includes(f.id)).map(fund => (
                <HStack key={fund.id} justify="space-between">
                  <Text fontSize="xs" color="gray.600">{fund.title}:</Text>
                  <Text fontSize="xs" fontWeight="medium">₹{fund.equityAmount.toFixed(2)}</Text>
                </HStack>
              ))}
            </Box>
          )}
        </VStack>
      </VStack>
    </Box>
  );
};