import React from 'react';
import {
  Box,
  Text,
  Card,
  Flex,
  Badge,
  VStack
} from '@chakra-ui/react';
import { Building2, Shield, Zap } from 'lucide-react';
import { FyersAuth } from '../auth/FyersAuth';

export const FyersConnectionPage: React.FC = () => {
  const handleAuthSuccess = () => {
    console.log('Fyers authentication successful');
  };

  return (
    <Box maxW="800px" mx="auto" p={6}>
      {/* Header */}
      <Flex align="center" gap={3} mb={6}>
        <Building2 size={32} color="#3182ce" />
        <Box>
          <Text textStyle="heading.lg" color="neutral.900">
            Fyers Broker Integration
          </Text>
          <Text fontSize="md" color="neutral.600">
            Connect your Fyers account for live trading and market data
          </Text>
        </Box>
      </Flex>

      {/* Features */}
      <VStack gap={4} mb={8}>
        <Card.Root w="full">
          <Card.Body>
            <Flex align="center" gap={3}>
              <Zap size={24} color="green" />
              <Box>
                <Text fontWeight="medium" mb={1}>Real-time Market Data</Text>
                <Text fontSize="sm" color="neutral.600">
                  Live quotes, historical data, and market depth
                </Text>
              </Box>
              <Badge colorPalette="green" size="sm">Live</Badge>
            </Flex>
          </Card.Body>
        </Card.Root>

        <Card.Root w="full">
          <Card.Body>
            <Flex align="center" gap={3}>
              <Shield size={24} color="blue" />
              <Box>
                <Text fontWeight="medium" mb={1}>Secure Trading</Text>
                <Text fontSize="sm" color="neutral.600">
                  Place orders, manage positions, and track portfolio
                </Text>
              </Box>
              <Badge colorPalette="blue" size="sm">Secure</Badge>
            </Flex>
          </Card.Body>
        </Card.Root>
      </VStack>

      {/* Connection Component */}
      <FyersAuth onAuthSuccess={handleAuthSuccess} />
    </Box>
  );
};