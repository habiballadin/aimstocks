import React, { useState, useEffect } from 'react';
import {
  Box,
  SimpleGrid,
  Card,
  Text,
  HStack,
  VStack,
  Badge,
  Spinner,
  Button
} from '@chakra-ui/react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { symbolService, Symbol } from '../../services/symbolService';

export const PopularStocks: React.FC = () => {
  const [stocks, setStocks] = useState<Symbol[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPopularStocks();
  }, []);

  const loadPopularStocks = async () => {
    try {
      const data = await symbolService.getPopularStocks();
      setStocks(data);
    } catch (error) {
      console.error('Error loading popular stocks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToWatchlist = (symbol: Symbol) => {
    console.log('Adding to watchlist:', symbol.symbol_ticker);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={8}>
        <Spinner size="lg" />
      </Box>
    );
  }

  return (
    <Box>
      <HStack justify="space-between" mb={6}>
        <Text fontSize="xl" fontWeight="bold">Popular Stocks</Text>
        <Button size="sm" onClick={loadPopularStocks}>
          Refresh
        </Button>
      </HStack>

      <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
        {stocks.map((stock) => {
          const priceChange = Math.random() * 10 - 5;
          const isPositive = priceChange >= 0;
          
          return (
            <Card.Root key={stock.symbol_ticker} p={4} cursor="pointer" _hover={{ shadow: 'md' }}>
              <Card.Body>
                <VStack align="stretch" spacing={3}>
                  <HStack justify="space-between">
                    <VStack align="start" spacing={1}>
                      <Text fontWeight="bold" fontSize="lg">
                        {stock.symbol_ticker}
                      </Text>
                      <Text fontSize="sm" color="gray.600" noOfLines={1}>
                        {stock.sym_details}
                      </Text>
                    </VStack>
                    <Badge 
                      colorScheme={symbolService.isSymbolTradeable(stock) ? 'green' : 'red'}
                      size="sm"
                    >
                      {symbolService.isSymbolTradeable(stock) ? 'Active' : 'Inactive'}
                    </Badge>
                  </HStack>

                  <HStack justify="space-between" align="center">
                    <VStack align="start" spacing={0}>
                      <Text fontSize="xl" fontWeight="bold">
                        ₹{stock.previous_close?.toFixed(2) || 'N/A'}
                      </Text>
                      <HStack spacing={1}>
                        {isPositive ? (
                          <TrendingUp size={16} color="green" />
                        ) : (
                          <TrendingDown size={16} color="red" />
                        )}
                        <Text 
                          fontSize="sm" 
                          color={isPositive ? 'green.500' : 'red.500'}
                          fontWeight="medium"
                        >
                          {isPositive ? '+' : ''}{priceChange.toFixed(2)} ({(priceChange/stock.previous_close*100).toFixed(2)}%)
                        </Text>
                      </HStack>
                    </VStack>

                    <VStack align="end" spacing={1}>
                      <Text fontSize="xs" color="gray.500">
                        Lot: {stock.min_lot_size}
                      </Text>
                      <Text fontSize="xs" color="gray.500">
                        Tick: ₹{stock.tick_size}
                      </Text>
                    </VStack>
                  </HStack>

                  <HStack spacing={2}>
                    <Button 
                      size="sm" 
                      colorScheme="blue" 
                      variant="outline"
                      flex={1}
                      onClick={() => handleAddToWatchlist(stock)}
                    >
                      Add to Watchlist
                    </Button>
                    <Button 
                      size="sm" 
                      colorScheme="green"
                      flex={1}
                      isDisabled={!symbolService.isSymbolTradeable(stock)}
                    >
                      Trade
                    </Button>
                  </HStack>
                </VStack>
              </Card.Body>
            </Card.Root>
          );
        })}
      </SimpleGrid>
    </Box>
  );
};