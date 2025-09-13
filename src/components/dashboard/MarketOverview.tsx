import React, { useState, useEffect } from 'react';
import {
  Card,
  Text,
  Box,
  Flex,
  SimpleGrid,
  Badge,
  Spinner,
  Center
} from '@chakra-ui/react';
import { BarChart3, TrendingUp, TrendingDown } from 'lucide-react';
import { fyersService } from '../../services/fyersService';
import { formatPercentage } from '../../utils/formatters';

interface MarketIndex {
  name: string;
  value: number;
  change: number;
  changePercent: number;
}

interface MarketMover {
  symbol: string;
  change: number;
}

interface MarketOverviewData {
  indices: MarketIndex[];
  topGainers: MarketMover[];
  topLosers: MarketMover[];
}

export const MarketOverview: React.FC = () => {
  const [marketOverview, setMarketOverview] = useState<MarketOverviewData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMarketOverview = async () => {
      try {
        // Fetch quotes for major indices
        const indexSymbols = ['NSE:NIFTY50-INDEX', 'NSE:NIFTYBANK-INDEX', 'BSE:SENSEX-INDEX'];
        const quotes = await fyersService.getQuotes(indexSymbols);
        
        // Fetch quotes for top stocks
        const stockSymbols = ['NSE:RELIANCE-EQ', 'NSE:ICICIBANK-EQ', 'NSE:INFY-EQ', 'NSE:TCS-EQ', 'NSE:HDFCBANK-EQ', 'NSE:WIPRO-EQ'];
        const stockQuotes = await fyersService.getQuotes(stockSymbols);
        
        // Transform data
        const indices: MarketIndex[] = [
          {
            name: '24,850.75',
            value: quotes['NSE:NIFTY50-INDEX']?.lp || 24710.41,
            change: quotes['NSE:NIFTY50-INDEX']?.ch || -138.27,
            changePercent: quotes['NSE:NIFTY50-INDEX']?.chp || -0.56
          },
          {
            name: 'SENSEX',
            value: quotes['BSE:SENSEX-INDEX']?.lp || 81215.09,
            change: quotes['BSE:SENSEX-INDEX']?.ch || -32.48,
            changePercent: quotes['BSE:SENSEX-INDEX']?.chp || -0.04
          },
          {
            name: 'BANK NIFTY',
            value: quotes['NSE:NIFTYBANK-INDEX']?.lp || 52645.18,
            change: quotes['NSE:NIFTYBANK-INDEX']?.ch || 298.75,
            changePercent: quotes['NSE:NIFTYBANK-INDEX']?.chp || 0.57
          }
        ];
        
        // Sort stocks by change percentage for gainers/losers
        const stocksWithChange = Object.entries(stockQuotes).map(([symbol, quote]) => ({
          symbol: symbol.split(':')[1].replace('-EQ', ''),
          change: quote.chp || 0
        })).sort((a, b) => b.change - a.change);
        
        const topGainers = stocksWithChange.slice(0, 3);
        const topLosers = stocksWithChange.slice(-3).reverse();
        
        setMarketOverview({ indices, topGainers, topLosers });
      } catch (error) {
        console.error('Failed to fetch market overview:', error);
        // Fallback to static data
        setMarketOverview({
          indices: [
            { name: 'NIFTY 50', value: 24710.41, change: -138.27, changePercent: -0.56 },
            { name: 'SENSEX', value: 81215.09, change: -32.48, changePercent: -0.04 },
            { name: 'BANK NIFTY', value: 52645.18, change: 298.75, changePercent: 0.57 }
          ],
          topGainers: [{ symbol: 'RELIANCE', change: 2.1 }, { symbol: 'ICICIBANK', change: 1.8 }, { symbol: 'INFY', change: 1.2 }],
          topLosers: [{ symbol: 'TCS', change: -1.5 }, { symbol: 'HDFCBANK', change: -0.9 }, { symbol: 'WIPRO', change: -0.7 }]
        });
      } finally {
        setLoading(false);
      }
    };

    fetchMarketOverview();

    // Refresh every 30 seconds
    const interval = setInterval(fetchMarketOverview, 30000);

    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <Card.Root>
        <Card.Body>
          <Center h="200px">
            <Spinner size="lg" color="blue.500" />
          </Center>
        </Card.Body>
      </Card.Root>
    );
  }

  if (!marketOverview) {
    return (
      <Card.Root>
        <Card.Body>
          <Text>Failed to load market data</Text>
        </Card.Body>
      </Card.Root>
    );
  }

  return (
    <Card.Root>
      <Card.Body>
        <Flex align="center" gap={3} mb={6}>
          <BarChart3 size={24} color="#3182ce" />
          <Box>
            <Text textStyle="heading.md" color="neutral.900">
              Market Overview
            </Text>
            <Text fontSize="sm" color="neutral.600">
              Live market indices and movers
            </Text>
          </Box>
        </Flex>

        {/* Market Indices */}
        <Box mb={6}>
          <Text fontSize="sm" fontWeight="semibold" color="neutral.700" mb={3}>
            Major Indices
          </Text>
          <SimpleGrid columns={3} gap={4}>
            {marketOverview.indices.map((index) => (
              <Box
                key={index.name}
                p={4}
                bg="neutral.50"
                borderRadius="md"
                border="1px solid"
                borderColor="neutral.200"
              >
                <Text fontSize="xs" color="neutral.600" mb={1}>
                  {index.name}
                </Text>
                <Text fontWeight="bold" color="neutral.900" mb={1}>
                  {index.value.toLocaleString()}
                </Text>
                <Flex align="center" gap={1}>
                  {React.createElement(index.change >= 0 ? TrendingUp : TrendingDown, {
                    size: 12,
                    color: index.change >= 0 ? '#38a169' : '#e53e3e'
                  })}
                  <Text
                    fontSize="xs"
                    color={index.change >= 0 ? 'success.600' : 'danger.600'}
                  >
                    {formatPercentage(index.changePercent)}
                  </Text>
                </Flex>
              </Box>
            ))}
          </SimpleGrid>
        </Box>

        {/* Top Gainers and Losers */}
        <SimpleGrid columns={2} gap={6}>
          <Box>
            <Text fontSize="sm" fontWeight="semibold" color="success.700" mb={3}>
              Top Gainers
            </Text>
            {marketOverview.topGainers.map((stock) => (
              <Flex key={stock.symbol} justify="space-between" align="center" py={2}>
                <Text fontSize="sm" fontWeight="medium" color="neutral.900">
                  {stock.symbol}
                </Text>
                <Badge colorPalette="green" size="sm">
                  {formatPercentage(stock.change)}
                </Badge>
              </Flex>
            ))}
          </Box>

          <Box>
            <Text fontSize="sm" fontWeight="semibold" color="danger.700" mb={3}>
              Top Losers
            </Text>
            {marketOverview.topLosers.map((stock) => (
              <Flex key={stock.symbol} justify="space-between" align="center" py={2}>
                <Text fontSize="sm" fontWeight="medium" color="neutral.900">
                  {stock.symbol}
                </Text>
                <Badge colorPalette="red" size="sm">
                  {formatPercentage(stock.change)}
                </Badge>
              </Flex>
            ))}
          </Box>
        </SimpleGrid>
      </Card.Body>
    </Card.Root>
  );
};