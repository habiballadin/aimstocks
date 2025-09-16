import React, { useState, useEffect } from 'react';
import { Box, Badge, Flex, Text } from '@chakra-ui/react';
import { fyersService, FyersMarketStatus } from '../../services/fyersService';

const MarketStatus: React.FC = () => {
  const [marketStatus, setMarketStatus] = useState<FyersMarketStatus[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMarketStatus = async () => {
      try {
        const response = await fyersService.getMarketStatus();
        const data = Array.isArray(response) ? response : (response as { data?: FyersMarketStatus[] })?.data || [];
        setMarketStatus(data);
      } catch (error) {
        console.error('Failed to fetch market status:', error);
        // Set mock data if API fails
        setMarketStatus([
          { exchange: 10, segment: 10, market_type: 'NORMAL', status: 'CLOSED' },
          { exchange: 11, segment: 20, market_type: 'NORMAL', status: 'CLOSED' },
          { exchange: 12, segment: 10, market_type: 'NORMAL', status: 'CLOSED' }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchMarketStatus();
    const interval = setInterval(fetchMarketStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const getExchangeName = (exchange: number) => {
    const exchangeMap: Record<number, string> = {
      10: 'NSE',
      11: 'MCX', 
      12: 'BSE'
    };
    return exchangeMap[exchange] || `EX${exchange}`;
  };



  // Get unique main markets status (one per exchange)
  const uniqueExchanges = new Map();
  if (Array.isArray(marketStatus)) {
    marketStatus.forEach(m => {
      if (m.market_type === 'NORMAL' && !uniqueExchanges.has(m.exchange)) {
        uniqueExchanges.set(m.exchange, m);
      }
    });
  }
  const mainMarkets = Array.from(uniqueExchanges.values());

  if (loading) {
    return (
      <Box p={3} bg="white" borderRadius="md" border="1px solid #e2e8f0">
        <Text fontSize="sm" color="gray.500">Loading market status...</Text>
      </Box>
    );
  }

  return (
    <Box p={3} bg="white" borderRadius="md" border="1px solid #e2e8f0">
      <Text fontSize="sm" fontWeight="bold" mb={2}>Market Status</Text>
      <Flex gap={3} align="center">
        {mainMarkets.length > 0 ? mainMarkets.map((market, index) => (
          <Box key={index}>
            <Text fontSize="xs" color="gray.600">{getExchangeName(market.exchange)}</Text>
            <Badge 
              bg={market.status === 'OPEN' ? 'green.500' : 'red.500'}
              color="white"
              size="sm"
              px={2}
              py={1}
              borderRadius="md"
            >
              {market.status === 'OPEN' ? 'OPEN' : 'CLOSED'}
            </Badge>
          </Box>
        )) : (
          <Text fontSize="xs" color="gray.500">No market data available</Text>
        )}
      </Flex>
    </Box>
  );
};

export default MarketStatus;