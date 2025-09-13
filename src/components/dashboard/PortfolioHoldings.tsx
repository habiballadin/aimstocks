import React, { useState } from 'react';
import { 
  Card, 
  Text, 
  Box, 
  Flex, 
  Table,
  Icon,
  Button,
  Input,
  Menu,
  Progress
} from '@chakra-ui/react';
import { 
  Briefcase, 
  Search, 
  MoreHorizontal,
  TrendingUp,
  TrendingDown,
  PieChart
} from 'lucide-react';
import { mockQuery } from '../../data/stockTradingMockData';
import { PriceDisplay } from '../common/PriceDisplay';
import { formatCurrency, formatPercentage } from '../../utils/formatters';

export const PortfolioHoldings: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const holdings = mockQuery.portfolio;

  const filteredHoldings = holdings.filter(holding => 
    holding.symbol.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalInvestedValue = holdings.reduce((sum, holding) => sum + holding.investedValue, 0);
  const totalCurrentValue = holdings.reduce((sum, holding) => sum + holding.currentValue, 0);
  const totalPnL = totalCurrentValue - totalInvestedValue;
  const totalPnLPercent = (totalPnL / totalInvestedValue) * 100;

  return (
    <Card.Root>
      <Card.Body>
        <Flex justify="space-between" align="center" mb={4}>
          <Flex align="center" gap={3}>
            <Icon as={Briefcase} color="brand.600" boxSize={6} />
            <Box>
              <Text textStyle="heading.md" color="neutral.900">
                Portfolio Holdings
              </Text>
              <Text fontSize="sm" color="neutral.600">
                {filteredHoldings.length} stocks in portfolio
              </Text>
            </Box>
          </Flex>
          <Button size="sm" colorPalette="brand" variant="outline">
            <Icon as={PieChart} boxSize={4} />
            Analyze
          </Button>
        </Flex>

        {/* Portfolio Summary */}
        <Box 
          p={4} 
          bg={totalPnL >= 0 ? 'success.50' : 'danger.50'}
          borderRadius="md"
          border="1px solid"
          borderColor={totalPnL >= 0 ? 'success.200' : 'danger.200'}
          mb={4}
        >
          <Flex justify="space-between" align="center">
            <Box>
              <Text fontSize="sm" color="neutral.700" mb={1}>Total Portfolio Value</Text>
              <Text textStyle="price.lg" color="neutral.900">
                {formatCurrency(totalCurrentValue)}
              </Text>
            </Box>
            <Box textAlign="right">
              <Text fontSize="sm" color="neutral.700" mb={1}>Total P&L</Text>
              <Flex align="center" gap={2}>
                <Icon as={totalPnL >= 0 ? TrendingUp : TrendingDown} color={totalPnL >= 0 ? 'success.600' : 'danger.600'} boxSize={4} />
                <Text 
                  textStyle="price.md" 
                  color={totalPnL >= 0 ? 'success.700' : 'danger.700'}
                >
                  {formatCurrency(totalPnL)} ({formatPercentage(totalPnLPercent)})
                </Text>
              </Flex>
            </Box>
          </Flex>
        </Box>

        {/* Search */}
        <Box position="relative" mb={4}>
          <Icon 
            position="absolute" 
            left={3} 
            top="50%" 
            transform="translateY(-50%)"
            color="neutral.400"
            as={Search}
            boxSize={4}
          />
          <Input 
            pl={10}
            placeholder="Search holdings..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </Box>

        {/* Holdings Table */}
        <Table.Root variant="outline" size="sm">
          <Table.Header>
            <Table.Row>
              <Table.ColumnHeader>Stock</Table.ColumnHeader>
              <Table.ColumnHeader>Qty</Table.ColumnHeader>
              <Table.ColumnHeader>Avg Price</Table.ColumnHeader>
              <Table.ColumnHeader>Current Price</Table.ColumnHeader>
              <Table.ColumnHeader>P&L</Table.ColumnHeader>
              <Table.ColumnHeader>Allocation</Table.ColumnHeader>
              <Table.ColumnHeader>Actions</Table.ColumnHeader>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {filteredHoldings.map((holding) => {
              const allocation = (holding.currentValue / totalCurrentValue) * 100;
              return (
                <Table.Row key={holding.symbol} _hover={{ bg: 'neutral.50' }}>
                  <Table.Cell>
                    <Text fontWeight="semibold" color="neutral.900">
                      {holding.symbol}
                    </Text>
                  </Table.Cell>
                  <Table.Cell>
                    <Text fontSize="sm" color="neutral.700">
                      {holding.quantity}
                    </Text>
                  </Table.Cell>
                  <Table.Cell>
                    <PriceDisplay 
                      price={holding.avgPrice}
                      change={0}
                      changePercent={0}
                      size="sm"
                      showIcon={false}
                    />
                  </Table.Cell>
                  <Table.Cell>
                    <PriceDisplay 
                      price={holding.currentPrice}
                      change={0}
                      changePercent={0}
                      size="sm"
                      showIcon={false}
                    />
                  </Table.Cell>
                  <Table.Cell>
                    <Box>
                      <Text 
                        fontSize="sm" 
                        color={holding.pnl >= 0 ? 'success.600' : 'danger.600'}
                        fontWeight="medium"
                      >
                        {formatCurrency(holding.pnl)}
                      </Text>
                      <Text 
                        fontSize="xs" 
                        color={holding.pnl >= 0 ? 'success.600' : 'danger.600'}
                      >
                        ({formatPercentage(holding.pnlPercent)})
                      </Text>
                    </Box>
                  </Table.Cell>
                  <Table.Cell>
                    <Box>
                      <Text fontSize="sm" color="neutral.700" mb={1}>
                        {allocation.toFixed(1)}%
                      </Text>
                      <Progress.Root 
                        value={allocation} 
                        size="sm" 
                        colorPalette="brand"
                        w="60px"
                      >
                        <Progress.Track>
                          <Progress.Range />
                        </Progress.Track>
                      </Progress.Root>
                    </Box>
                  </Table.Cell>
                  <Table.Cell>
                    <Menu.Root>
                      <Menu.Trigger asChild>
                        <Button variant="ghost" size="sm" p={1}>
                        <Icon as={MoreHorizontal} boxSize={4} />
                        </Button>
                      </Menu.Trigger>
                      <Menu.Content>
                        <Menu.Item value="buy">Buy More</Menu.Item>
                        <Menu.Item value="sell">Sell</Menu.Item>
                        <Menu.Item value="alert">Set Alert</Menu.Item>
                        <Menu.Item value="analysis">View Analysis</Menu.Item>
                        <Menu.Separator />
                        <Menu.Item value="remove" color="danger.600">Remove from Portfolio</Menu.Item>
                      </Menu.Content>
                    </Menu.Root>
                  </Table.Cell>
                </Table.Row>
              );
            })}
          </Table.Body>
        </Table.Root>
      </Card.Body>
    </Card.Root>
  );
};