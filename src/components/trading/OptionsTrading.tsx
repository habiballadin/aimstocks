import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  Text,
  Flex,
  Button,
  Input,
  Select,
  SimpleGrid,
  Stack,
  createListCollection
} from '@chakra-ui/react';
import { formatCurrency } from '../../utils/formatters';
import { getOptionChain, OptionChainData } from '../../services/realtimeDataService';
import { fyersService } from '../../services/fyersService';

export const OptionsTrading: React.FC = () => {
  const [selectedSymbol, setSelectedSymbol] = useState('NIFTY');
  const [selectedExpiry, setSelectedExpiry] = useState('');
  const [orderType, setOrderType] = useState('BUY');
  const [optionType, setOptionType] = useState('CALL');
  const [quantity, setQuantity] = useState('50');
  const [price, setPrice] = useState('');
  const [optionChain, setOptionChain] = useState<OptionChainData[]>([]);
  const [availableExpiries, setAvailableExpiries] = useState<Array<{label: string, value: string}>>([]);
  const [loading, setLoading] = useState(false);

  const symbols = createListCollection({
    items: [
      { label: 'NIFTY', value: 'NIFTY' },
      { label: 'BANKNIFTY', value: 'BANKNIFTY' },
      { label: 'RELIANCE', value: 'RELIANCE' },
      { label: 'TCS', value: 'TCS' }
    ]
  });

  const expiries = createListCollection({
    items: availableExpiries
  });

  const fetchOptionChain = async () => {
    if (!selectedExpiry) return;
    
    setLoading(true);
    try {
      const data = await getOptionChain(selectedSymbol, selectedExpiry);
      setOptionChain(data);
    } catch (error) {
      console.error('Error fetching option chain:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchExpiries = async () => {
    const defaultExpiries = [
      { label: '30-Jan-2025', value: '30-Jan-2025' },
      { label: '06-Feb-2025', value: '06-Feb-2025' },
      { label: '13-Feb-2025', value: '13-Feb-2025' },
      { label: '27-Feb-2025', value: '27-Feb-2025' }
    ];
    
    try {
      const fyersSymbol = `NSE:${selectedSymbol}-EQ`;
      const response = await fyersService.getOptionChain(fyersSymbol, 1);
      
      if (response?.expiryData && response.expiryData.length > 0) {
        const expiries = response.expiryData.map(exp => ({
          label: exp.date,
          value: exp.date
        }));
        setAvailableExpiries(expiries);
        
        if (!selectedExpiry) {
          setSelectedExpiry(expiries[0].value);
        }
      } else {
        setAvailableExpiries(defaultExpiries);
        if (!selectedExpiry) {
          setSelectedExpiry(defaultExpiries[0].value);
        }
      }
    } catch (error) {
      console.error('Error fetching expiries:', error);
      setAvailableExpiries(defaultExpiries);
      if (!selectedExpiry) {
        setSelectedExpiry(defaultExpiries[0].value);
      }
    }
  };

  useEffect(() => {
    fetchExpiries();
  }, [selectedSymbol]);

  useEffect(() => {
    // Initialize with default expiries on component mount
    if (availableExpiries.length === 0) {
      const defaultExpiries = [
        { label: '30-Jan-2025', value: '30-Jan-2025' },
        { label: '06-Feb-2025', value: '06-Feb-2025' },
        { label: '13-Feb-2025', value: '13-Feb-2025' },
        { label: '27-Feb-2025', value: '27-Feb-2025' }
      ];
      setAvailableExpiries(defaultExpiries);
      setSelectedExpiry(defaultExpiries[0].value);
    }
  }, []);

  useEffect(() => {
    if (selectedExpiry) {
      fetchOptionChain();
      const interval = setInterval(fetchOptionChain, 5000);
      return () => clearInterval(interval);
    }
  }, [selectedSymbol, selectedExpiry]);

  const handlePlaceOrder = async () => {
    if (!selectedExpiry || !quantity || !price) {
      alert('Please fill all required fields');
      return;
    }

    try {
      const expiryCode = selectedExpiry.replace(/-/g, '').toUpperCase();
      const strike = '25000';
      const optionSymbol = `NSE:${selectedSymbol}${expiryCode}${strike}${optionType === 'CALL' ? 'CE' : 'PE'}`;
      
      const orderData = {
        symbol: optionSymbol,
        qty: parseInt(quantity),
        type: 1,
        side: orderType === 'BUY' ? 1 : -1,
        product_type: 'INTRADAY',
        limit_price: parseFloat(price)
      };

      const result = await fyersService.placeOrder(orderData);
      
      if (result.success) {
        alert('Order placed successfully!');
        setPrice('');
      } else {
        alert(`Order failed: ${result.error}`);
      }
    } catch (error) {
      console.error('Error placing order:', error);
      alert('Failed to place order');
    }
  };

  return (
    <Box>
      <Text textStyle="heading.lg" mb={6}>Options Trading</Text>
      
      <SimpleGrid columns={{ base: 1, xl: 3 }} gap={6}>
        <Card.Root>
          <Card.Body>
            <Text fontWeight="semibold" mb={4}>Place Options Order</Text>
            
            <Stack gap={4}>
              <Box>
                <Text fontSize="sm" mb={2}>Symbol</Text>
                <Select.Root 
                  collection={symbols}
                  value={[selectedSymbol]}
                  onValueChange={(e) => setSelectedSymbol(e.value[0])}
                >
                  <Select.Trigger>
                    <Select.ValueText />
                  </Select.Trigger>
                  <Select.Content>
                    {symbols.items.map((item) => (
                      <Select.Item key={item.value} item={item.value}>
                        {item.label}
                      </Select.Item>
                    ))}
                  </Select.Content>
                </Select.Root>
              </Box>

              <Box>
                <Text fontSize="sm" mb={2}>Expiry</Text>
                <Select.Root 
                  collection={expiries}
                  value={[selectedExpiry]}
                  onValueChange={(e) => setSelectedExpiry(e.value[0])}
                >
                  <Select.Trigger>
                    <Select.ValueText />
                  </Select.Trigger>
                  <Select.Content>
                    {expiries.items.map((item) => (
                      <Select.Item key={item.value} item={item.value}>
                        {item.label}
                      </Select.Item>
                    ))}
                  </Select.Content>
                </Select.Root>
              </Box>

              <Flex gap={2}>
                <Button 
                  variant={orderType === 'BUY' ? 'solid' : 'outline'}
                  colorPalette="green"
                  onClick={() => setOrderType('BUY')}
                  flex={1}
                >
                  BUY
                </Button>
                <Button 
                  variant={orderType === 'SELL' ? 'solid' : 'outline'}
                  colorPalette="red"
                  onClick={() => setOrderType('SELL')}
                  flex={1}
                >
                  SELL
                </Button>
              </Flex>

              <Flex gap={2}>
                <Button 
                  variant={optionType === 'CALL' ? 'solid' : 'outline'}
                  colorPalette="blue"
                  onClick={() => setOptionType('CALL')}
                  flex={1}
                >
                  CALL
                </Button>
                <Button 
                  variant={optionType === 'PUT' ? 'solid' : 'outline'}
                  colorPalette="purple"
                  onClick={() => setOptionType('PUT')}
                  flex={1}
                >
                  PUT
                </Button>
              </Flex>

              <Box>
                <Text fontSize="sm" mb={2}>Quantity</Text>
                <Input 
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  placeholder="Enter quantity"
                />
              </Box>

              <Box>
                <Text fontSize="sm" mb={2}>Price</Text>
                <Input 
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="Enter price"
                />
              </Box>

              <Button 
                colorPalette="brand"
                onClick={handlePlaceOrder}
                size="lg"
              >
                Place Order
              </Button>
            </Stack>
          </Card.Body>
        </Card.Root>

        <Box gridColumn={{ xl: 'span 2' }}>
          <Card.Root>
            <Card.Body>
              <Flex justify="space-between" align="center" mb={4}>
                <Text fontWeight="semibold">Option Chain - {selectedSymbol} ({selectedExpiry})</Text>
                <Button size="sm" onClick={fetchOptionChain} loading={loading}>
                  Refresh
                </Button>
              </Flex>
              
              <Box overflowX="auto">
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid #e2e8f0' }}>
                      <th style={{ padding: '12px 8px', textAlign: 'center', fontSize: '12px', fontWeight: 'bold' }}>OI</th>
                      <th style={{ padding: '12px 8px', textAlign: 'center', fontSize: '12px', fontWeight: 'bold' }}>CHNG</th>
                      <th style={{ padding: '12px 8px', textAlign: 'center', fontSize: '12px', fontWeight: 'bold' }}>LTP</th>
                      <th style={{ padding: '12px 8px', textAlign: 'center', fontSize: '12px', fontWeight: 'bold', backgroundColor: '#f7fafc' }}>STRIKE</th>
                      <th style={{ padding: '12px 8px', textAlign: 'center', fontSize: '12px', fontWeight: 'bold' }}>LTP</th>
                      <th style={{ padding: '12px 8px', textAlign: 'center', fontSize: '12px', fontWeight: 'bold' }}>CHNG</th>
                      <th style={{ padding: '12px 8px', textAlign: 'center', fontSize: '12px', fontWeight: 'bold' }}>OI</th>
                    </tr>
                    <tr>
                      <th colSpan={3} style={{ padding: '8px', textAlign: 'center', backgroundColor: '#e6fffa', fontSize: '14px', fontWeight: 'bold' }}>CALLS</th>
                      <th style={{ padding: '8px' }}></th>
                      <th colSpan={3} style={{ padding: '8px', textAlign: 'center', backgroundColor: '#fef5e7', fontSize: '14px', fontWeight: 'bold' }}>PUTS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {optionChain.map((option) => (
                      <tr key={option.strike} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '8px', textAlign: 'center', fontSize: '12px' }}>
                          {(option.callOI / 100000).toFixed(1)}L
                        </td>
                        <td style={{ padding: '8px', textAlign: 'center', fontSize: '12px' }}>
                          <Text color={option.callChange >= 0 ? 'green.600' : 'red.600'}>
                            {option.callChange >= 0 ? '+' : ''}{option.callChange.toFixed(2)}
                          </Text>
                        </td>
                        <td style={{ padding: '8px', textAlign: 'center', fontSize: '12px', fontWeight: 'bold' }}>
                          {formatCurrency(option.callLTP)}
                        </td>
                        <td style={{ padding: '8px', textAlign: 'center', fontSize: '14px', fontWeight: 'bold', backgroundColor: '#f7fafc' }}>
                          {option.strike}
                        </td>
                        <td style={{ padding: '8px', textAlign: 'center', fontSize: '12px', fontWeight: 'bold' }}>
                          {formatCurrency(option.putLTP)}
                        </td>
                        <td style={{ padding: '8px', textAlign: 'center', fontSize: '12px' }}>
                          <Text color={option.putChange >= 0 ? 'green.600' : 'red.600'}>
                            {option.putChange >= 0 ? '+' : ''}{option.putChange.toFixed(2)}
                          </Text>
                        </td>
                        <td style={{ padding: '8px', textAlign: 'center', fontSize: '12px' }}>
                          {(option.putOI / 100000).toFixed(1)}L
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Box>
            </Card.Body>
          </Card.Root>
        </Box>
      </SimpleGrid>
    </Box>
  );
};