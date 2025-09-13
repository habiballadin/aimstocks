import React from 'react';
import { Box, Text, Flex } from '@chakra-ui/react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { formatCurrency, formatPercentage } from '../../utils/formatters';

interface PriceDisplayProps {
  price: number;
  change: number;
  changePercent: number;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

export const PriceDisplay: React.FC<PriceDisplayProps> = ({
  price,
  change,
  changePercent,
  size = 'md',
  showIcon = true
}) => {
  const isPositive = change >= 0;
  const color = isPositive ? 'success.600' : 'danger.600';
  
  const priceSize = size === 'sm' ? 'sm' : size === 'lg' ? 'lg' : 'md';
  const changeSize = size === 'sm' ? 'xs' : size === 'lg' ? 'sm' : 'xs';

  return (
    <Box>
      <Text fontSize={priceSize} fontWeight="bold" color="neutral.900">
        {formatCurrency(price)}
      </Text>
      <Flex align="center" gap={1}>
        {showIcon && (
          <div style={{ color: isPositive ? '#38a169' : '#e53e3e' }}>
            {isPositive ? <TrendingUp size={size === 'sm' ? 12 : 14} /> : <TrendingDown size={size === 'sm' ? 12 : 14} />}
          </div>
        )}
        <Text fontSize={changeSize} color={color} fontWeight="medium">
          {isPositive ? '+' : ''}{formatCurrency(change)}
        </Text>
        <Text fontSize={changeSize} color={color}>
          ({formatPercentage(changePercent)})
        </Text>
      </Flex>
    </Box>
  );
};