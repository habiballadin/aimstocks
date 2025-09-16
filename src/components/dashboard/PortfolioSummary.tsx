import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Text, 
  Box, 
  Flex, 
  SimpleGrid,
  Stat,
} from '@chakra-ui/react';
import { Briefcase, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { formatPercentage } from '../../utils/formatters';
import { FyersFunds } from '../../services/fyersService';

export const PortfolioSummary: React.FC = () => {
  const [funds, setFunds] = useState<FyersFunds[]>([]);
  const [holdings, setHoldings] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [fundsRes, holdingsRes] = await Promise.all([
          fetch('/api/fyers/funds'),
          fetch('/api/fyers/holdings')
        ]);
        
        const fundsData = await fundsRes.json();
        const holdingsData = await holdingsRes.json();
        
        if (fundsData.success) setFunds(fundsData.data.fund_limit || []);
        if (holdingsData.success) setHoldings(holdingsData.data);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      }
    };
    fetchData();
  }, []);

  const investedAmount = holdings?.overall?.total_investment ?? 0;
  const currentValue = holdings?.overall?.total_current_value ?? 0;
  const totalReturns = holdings?.overall?.total_pl ?? 0;
  const totalReturnsPercent = holdings?.overall?.pnl_perc ?? 0;
  const availableBalance = funds.find(f => f.id === 10)?.equityAmount ?? 0;

  return (
    <Card.Root layerStyle="card.default">
      <Card.Body>
        <Flex align="center" gap={3} mb={6}>
          <Briefcase size={24} color="#3182ce" />
          <Box>
            <Text textStyle="heading.md" color="neutral.900">
              Portfolio Overview
            </Text>
            <Text fontSize="sm" color="neutral.600">
              Your investment summary
            </Text>
          </Box>
        </Flex>

        <SimpleGrid columns={2} gap={6} mb={6}>
          <Stat.Root>
            <Stat.Label>
              <DollarSign size={16} color="#718096" />
              Invested Amount
            </Stat.Label>
            <Stat.ValueText 
              color="neutral.900"
              textStyle="price.lg"
            >
              ₹{investedAmount.toFixed(2)}
            </Stat.ValueText>
          </Stat.Root>

          <Stat.Root>
            <Stat.Label>
              Current Value
            </Stat.Label>
            <Stat.ValueText 
              color="neutral.900"
              textStyle="price.lg"
            >
              ₹{currentValue.toFixed(2)}
            </Stat.ValueText>
          </Stat.Root>
        </SimpleGrid>

        <SimpleGrid columns={2} gap={6} mb={6}>
          <Box 
            p={4} 
            bg={totalReturns >= 0 ? 'success.50' : 'danger.50'}
            borderRadius="md"
            border="1px solid"
            borderColor={totalReturns >= 0 ? 'success.200' : 'danger.200'}
          >
            <Flex align="center" gap={2} mb={1}>
              {React.createElement(totalReturns >= 0 ? TrendingUp : TrendingDown, { 
                size: 16, 
                color: totalReturns >= 0 ? '#38a169' : '#e53e3e' 
              })}
              <Text fontSize="sm" color="neutral.700">Today's P&L</Text>
            </Flex>
            <Text 
              textStyle="price.md" 
              color={totalReturns >= 0 ? 'success.700' : 'danger.700'}
            >
              ₹{totalReturns.toFixed(2)}
            </Text>
          </Box>

          <Box 
            p={4} 
            bg={totalReturns >= 0 ? 'success.50' : 'danger.50'}
            borderRadius="md"
            border="1px solid"
            borderColor={totalReturns >= 0 ? 'success.200' : 'danger.200'}
          >
            <Flex align="center" gap={2} mb={1}>
              {React.createElement(totalReturns >= 0 ? TrendingUp : TrendingDown, { 
                size: 16, 
                color: totalReturns >= 0 ? '#38a169' : '#e53e3e' 
              })}
              <Text fontSize="sm" color="neutral.700">Total Returns</Text>
            </Flex>
            <Text 
              textStyle="price.md" 
              color={totalReturns >= 0 ? 'success.700' : 'danger.700'}
            >
              ₹{totalReturns.toFixed(2)} ({formatPercentage(totalReturnsPercent)})
            </Text>
          </Box>
        </SimpleGrid>

        <Box 
          p={4} 
          bg="brand.50" 
          borderRadius="md"
          border="1px solid"
          borderColor="brand.200"
        >
          <Text fontSize="sm" color="brand.700" mb={1}>Available Balance</Text>
          <Text textStyle="price.lg" color="brand.800">
            ₹{availableBalance.toFixed(2)}
          </Text>
        </Box>
      </Card.Body>
    </Card.Root>
  );
};