import React, { useState } from 'react';
import {
  Box,
  VStack,
  HStack,
  Button,
  Input,
  Select,
  Text,
  Badge,
  Alert,
  AlertIcon
} from '@chakra-ui/react';
import { SymbolSearch } from './SymbolSearch';
import { symbolService, Symbol } from '../../services/symbolService';

export const OrderForm: React.FC = () => {
  const [selectedSymbol, setSelectedSymbol] = useState<Symbol | null>(null);
  const [orderType, setOrderType] = useState<'BUY' | 'SELL'>('BUY');
  const [quantity, setQuantity] = useState('');
  const [price, setPrice] = useState('');
  const [orderMode, setOrderMode] = useState<'MARKET' | 'LIMIT'>('MARKET');

  const handleSymbolSelect = (symbol: Symbol) => {
    setSelectedSymbol(symbol);
    if (orderMode === 'LIMIT') {
      setPrice(symbol.previous_close.toString());
    }
  };

  const validateOrder = () => {
    if (!selectedSymbol) return 'Please select a symbol';
    if (!symbolService.isSymbolTradeable(selectedSymbol)) return 'Symbol not tradeable';
    
    const qty = parseInt(quantity);
    const limits = symbolService.getSymbolLimits(selectedSymbol);
    
    if (qty < limits.minLotSize) return `Minimum quantity: ${limits.minLotSize}`;
    if (qty % limits.minLotSize !== 0) return `Quantity must be multiple of ${limits.minLotSize}`;
    
    if (orderMode === 'LIMIT') {
      const orderPrice = parseFloat(price);
      if (orderPrice < limits.lowerLimit || orderPrice > limits.upperLimit) {
        return `Price must be between ₹${limits.lowerLimit} - ₹${limits.upperLimit}`;
      }
    }
    
    return null;
  };

  const handlePlaceOrder = () => {
    const error = validateOrder();
    if (error) {
      alert(error);
      return;
    }
    
    const orderData = {
      symbol: symbolService.formatSymbolForFyers(selectedSymbol!),
      side: orderType,
      quantity: parseInt(quantity),
      type: orderMode,
      price: orderMode === 'LIMIT' ? parseFloat(price) : undefined
    };
    
    console.log('Placing order:', orderData);
    // API call to place order
  };

  const error = validateOrder();

  return (
    <Box p={6} bg="white" borderRadius="lg" shadow="md">
      <VStack spacing={4} align="stretch">
        <Text fontSize="lg" fontWeight="bold">Place Order</Text>
        
        <SymbolSearch onSymbolSelect={handleSymbolSelect} />
        
        {selectedSymbol && (
          <Box p={3} bg="gray.50" borderRadius="md">
            <HStack justify="space-between">
              <Text fontWeight="medium">{selectedSymbol.sym_details}</Text>
              <Badge colorScheme={symbolService.isSymbolTradeable(selectedSymbol) ? 'green' : 'red'}>
                {symbolService.isSymbolTradeable(selectedSymbol) ? 'Active' : 'Inactive'}
              </Badge>
            </HStack>
            <Text fontSize="sm" color="gray.600">
              LTP: ₹{selectedSymbol.previous_close} | Lot Size: {selectedSymbol.min_lot_size}
            </Text>
          </Box>
        )}
        
        <HStack>
          <Button
            colorScheme={orderType === 'BUY' ? 'green' : 'gray'}
            onClick={() => setOrderType('BUY')}
            flex={1}
          >
            BUY
          </Button>
          <Button
            colorScheme={orderType === 'SELL' ? 'red' : 'gray'}
            onClick={() => setOrderType('SELL')}
            flex={1}
          >
            SELL
          </Button>
        </HStack>
        
        <Select value={orderMode} onChange={(e) => setOrderMode(e.target.value as any)}>
          <option value="MARKET">Market Order</option>
          <option value="LIMIT">Limit Order</option>
        </Select>
        
        <Input
          placeholder="Quantity"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          type="number"
        />
        
        {orderMode === 'LIMIT' && (
          <Input
            placeholder="Price"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            type="number"
            step="0.05"
          />
        )}
        
        {error && (
          <Alert status="error" size="sm">
            <AlertIcon />
            {error}
          </Alert>
        )}
        
        <Button
          colorScheme={orderType === 'BUY' ? 'green' : 'red'}
          onClick={handlePlaceOrder}
          isDisabled={!!error}
          size="lg"
        >
          {orderType} {selectedSymbol?.symbol_ticker || 'Stock'}
        </Button>
      </VStack>
    </Box>
  );
};