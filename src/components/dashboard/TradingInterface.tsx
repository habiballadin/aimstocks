import React, { useState } from 'react';
import { 
  Card, 
  Text, 
  Box, 
  Flex, 
  Button,
  Input,
  Select,
  Alert,
  Stack,
  Tabs,
  createListCollection
} from '@chakra-ui/react';
import { ArrowUpDown, Calculator } from 'lucide-react';
import { OrderType, OrderSide, ProductType } from '../../types/enums';
import { formatCurrency } from '../../utils/formatters';

export const TradingInterface: React.FC = () => {
  const [orderSide, setOrderSide] = useState<OrderSide>(OrderSide.BUY);
  const [orderType, setOrderType] = useState<OrderType>(OrderType.MARKET);
  const [productType, setProductType] = useState<ProductType>(ProductType.DELIVERY);
  const [symbol, setSymbol] = useState('RELIANCE');
  const [quantity, setQuantity] = useState('10');
  const [price, setPrice] = useState('2847.65');

  const orderTypeOptions = createListCollection({
    items: [
      { value: OrderType.MARKET, label: 'Market' },
      { value: OrderType.LIMIT, label: 'Limit' },
      { value: OrderType.STOP_LOSS, label: 'Stop Loss' }
    ]
  });

  const productTypeOptions = createListCollection({
    items: [
      { value: ProductType.DELIVERY, label: 'Delivery' },
      { value: ProductType.INTRADAY, label: 'Intraday' }
    ]
  });

  const currentPrice = 2847.65;
  const estimatedValue = parseFloat(quantity) * (orderType === OrderType.MARKET ? currentPrice : parseFloat(price));

  const handlePlaceOrder = () => {
    // In real app, this would call API
    console.log('Placing order:', {
      symbol,
      side: orderSide,
      type: orderType,
      product: productType,
      quantity: parseInt(quantity),
      price: orderType === OrderType.MARKET ? currentPrice : parseFloat(price)
    });
  };

  return (
    <Card.Root>
      <Card.Body>
        <Flex align="center" gap={3} mb={6}>
          <ArrowUpDown size={24} color="var(--chakra-colors-brand-600)" />
          <Box>
            <Text textStyle="heading.md" color="neutral.900">
              Quick Trade
            </Text>
            <Text fontSize="sm" color="neutral.600">
              Place orders with AI assistance
            </Text>
          </Box>
        </Flex>

        <Tabs.Root value={orderSide} onValueChange={(e) => setOrderSide(e.value as OrderSide)}>
          <Tabs.List mb={4}>
            <Tabs.Trigger value={OrderSide.BUY} colorPalette="green">
              BUY
            </Tabs.Trigger>
            <Tabs.Trigger value={OrderSide.SELL} colorPalette="red">
              SELL
            </Tabs.Trigger>
          </Tabs.List>

          <Stack gap={4}>
            {/* Stock Selection */}
            <Box>
              <Text fontSize="sm" fontWeight="medium" color="neutral.700" mb={2}>
                Stock Symbol
              </Text>
              <Input 
                value={symbol}
                onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                placeholder="Enter stock symbol"
              />
              <Text fontSize="xs" color="neutral.600" mt={1}>
                Current Price: {formatCurrency(currentPrice)}
              </Text>
            </Box>

            {/* Order Type */}
            <Box>
              <Text fontSize="sm" fontWeight="medium" color="neutral.700" mb={2}>
                Order Type
              </Text>
              <Select.Root 
                collection={orderTypeOptions}
                value={[orderType]} 
                onValueChange={(e) => setOrderType(e.value[0] as OrderType)}
              >
                <Select.Trigger>
                  <Select.ValueText />
                </Select.Trigger>
                <Select.Content>
                  {orderTypeOptions.items.map((option) => (
                    <Select.Item key={option.value} item={option}>
                      {option.label}
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select.Root>
            </Box>

            {/* Product Type */}
            <Box>
              <Text fontSize="sm" fontWeight="medium" color="neutral.700" mb={2}>
                Product Type
              </Text>
              <Select.Root 
                collection={productTypeOptions}
                value={[productType]} 
                onValueChange={(e) => setProductType(e.value[0] as ProductType)}
              >
                <Select.Trigger>
                  <Select.ValueText />
                </Select.Trigger>
                <Select.Content>
                  {productTypeOptions.items.map((option) => (
                    <Select.Item key={option.value} item={option}>
                      {option.label}
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select.Root>
            </Box>

            {/* Quantity */}
            <Box>
              <Text fontSize="sm" fontWeight="medium" color="neutral.700" mb={2}>
                Quantity
              </Text>
              <Input 
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="Enter quantity"
              />
            </Box>

            {/* Price (for limit orders) */}
            {orderType !== OrderType.MARKET && (
              <Box>
                <Text fontSize="sm" fontWeight="medium" color="neutral.700" mb={2}>
                  Price
                </Text>
                <Input 
                  type="number"
                  step="0.01"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="Enter price"
                />
              </Box>
            )}

            {/* Order Summary */}
            <Box 
              p={4} 
              bg="neutral.50" 
              borderRadius="md"
              border="1px solid"
              borderColor="neutral.200"
            >
              <Flex align="center" gap={2} mb={2}>
                <Calculator size={16} color="var(--chakra-colors-brand-600)" />
                <Text fontSize="sm" fontWeight="medium" color="neutral.700">
                  Order Summary
                </Text>
              </Flex>
              <Flex justify="space-between" mb={1}>
                <Text fontSize="sm" color="neutral.600">Estimated Value:</Text>
                <Text fontSize="sm" fontWeight="medium" color="neutral.900">
                  {formatCurrency(estimatedValue)}
                </Text>
              </Flex>
              <Flex justify="space-between" mb={1}>
                <Text fontSize="sm" color="neutral.600">Brokerage:</Text>
                <Text fontSize="sm" fontWeight="medium" color="neutral.900">
                  ₹20.00
                </Text>
              </Flex>
              <Flex justify="space-between">
                <Text fontSize="sm" fontWeight="medium" color="neutral.700">Total:</Text>
                <Text fontSize="sm" fontWeight="bold" color="neutral.900">
                  {formatCurrency(estimatedValue + 20)}
                </Text>
              </Flex>
            </Box>

            {/* AI Risk Assessment */}
            <Alert.Root status="info" size="sm">
              <Alert.Indicator />
              <Box>
                <Alert.Title>AI Risk Assessment</Alert.Title>
                <Text fontSize="xs">
                  Moderate risk detected. Consider setting stop loss at ₹2750.
                </Text>
              </Box>
            </Alert.Root>

            {/* Place Order Button */}
            <Button 
              colorPalette={orderSide === OrderSide.BUY ? 'green' : 'red'}
              size="lg"
              onClick={handlePlaceOrder}
            >
              {orderSide === OrderSide.BUY ? 'Buy' : 'Sell'} {symbol}
            </Button>
          </Stack>
        </Tabs.Root>
      </Card.Body>
    </Card.Root>
  );
};