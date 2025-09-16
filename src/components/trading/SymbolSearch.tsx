import React, { useState, useEffect } from 'react';
import { Box, Input, VStack, Text, Badge, Spinner } from '@chakra-ui/react';
import { symbolService, Symbol } from '../../services/symbolService';

interface SymbolSearchProps {
  onSymbolSelect: (symbol: Symbol) => void;
  placeholder?: string;
}

export const SymbolSearch: React.FC<SymbolSearchProps> = ({ 
  onSymbolSelect, 
  placeholder = "Search stocks..." 
}) => {
  const [query, setQuery] = useState('');
  const [symbols, setSymbols] = useState<Symbol[]>([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    const searchSymbols = async () => {
      if (query.length < 2) {
        setSymbols([]);
        setShowResults(false);
        return;
      }

      setLoading(true);
      try {
        const results = await symbolService.searchSymbols(query, 'NSE');
        setSymbols(results);
        setShowResults(true);
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setLoading(false);
      }
    };

    const debounce = setTimeout(searchSymbols, 300);
    return () => clearTimeout(debounce);
  }, [query]);

  const handleSymbolClick = (symbol: Symbol) => {
    onSymbolSelect(symbol);
    setQuery(symbol.symbol_ticker);
    setShowResults(false);
  };

  return (
    <Box position="relative">
      <Input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
        onFocus={() => query.length >= 2 && setShowResults(true)}
        onBlur={() => setTimeout(() => setShowResults(false), 200)}
      />
      
      {loading && (
        <Box position="absolute" right={3} top={3}>
          <Spinner size="sm" />
        </Box>
      )}

      {showResults && symbols.length > 0 && (
        <Box
          position="absolute"
          top="100%"
          left={0}
          right={0}
          bg="white"
          border="1px solid"
          borderColor="gray.200"
          borderRadius="md"
          maxH="300px"
          overflowY="auto"
          zIndex={1000}
          shadow="lg"
        >
          <VStack spacing={0} align="stretch">
            {symbols.map((symbol) => (
              <Box
                key={symbol.symbol_ticker}
                p={3}
                cursor="pointer"
                _hover={{ bg: 'gray.50' }}
                onClick={() => handleSymbolClick(symbol)}
                borderBottom="1px solid"
                borderColor="gray.100"
              >
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Text fontWeight="semibold">{symbol.symbol_ticker}</Text>
                    <Text fontSize="sm" color="gray.600" noOfLines={1}>
                      {symbol.sym_details}
                    </Text>
                  </Box>
                  <Box textAlign="right">
                    <Text fontWeight="medium">₹{symbol.previous_close}</Text>
                    <Badge 
                      colorScheme={symbolService.isSymbolTradeable(symbol) ? 'green' : 'red'}
                      size="sm"
                    >
                      {symbolService.isSymbolTradeable(symbol) ? 'Active' : 'Inactive'}
                    </Badge>
                  </Box>
                </Box>
              </Box>
            ))}
          </VStack>
        </Box>
      )}
    </Box>
  );
};