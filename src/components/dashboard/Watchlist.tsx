import React, { useState } from 'react';
import { 
  Card, 
  Text, 
  Box, 
  Flex, 
  Table,

  Button,
  Input,
  Menu,
  Badge
} from '@chakra-ui/react';
import { 
  BookMarked, 
  Search, 
  Filter, 
  Plus,
  MoreHorizontal,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import { mockQuery } from '../../data/stockTradingMockData';
import { PriceDisplay } from '../common/PriceDisplay';
import { AIConfidenceIndicator } from '../common/AIConfidenceIndicator';
import { formatVolume } from '../../utils/formatters';
import { TrendDirection } from '../../types/enums';

export const Watchlist: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'symbol' | 'price' | 'change'>('symbol');
  const stocks = mockQuery.watchlistStocks;

  const filteredAndSortedStocks = stocks
    .filter(stock => 
      stock.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
      stock.companyName.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'price':
          return b.currentPrice - a.currentPrice;
        case 'change':
          return b.changePercent - a.changePercent;
        default:
          return a.symbol.localeCompare(b.symbol);
      }
    });

  const getTrendIcon = (trend: TrendDirection) => {
    switch (trend) {
      case TrendDirection.BULLISH:
        return <TrendingUp size={14} color="currentColor" />;
      case TrendDirection.BEARISH:
        return <TrendingDown size={14} color="currentColor" />;
      default:
        return null;
    }
  };

  const getTrendColor = (trend: TrendDirection) => {
    switch (trend) {
      case TrendDirection.BULLISH: return 'success.600';
      case TrendDirection.BEARISH: return 'danger.600';
      default: return 'neutral.600';
    }
  };

  const getRecommendationColor = (recommendation: string) => {
    switch (recommendation) {
      case 'BUY': return 'green';
      case 'SELL': return 'red';
      case 'HOLD': return 'warning';
      default: return 'neutral';
    }
  };

  return (
    <Card.Root>
      <Card.Body>
        <Flex justify="space-between" align="center" mb={4}>
          <Flex align="center" gap={3}>
            <BookMarked size={24} color="#3182ce" />
            <Box>
              <Text textStyle="heading.md" color="neutral.900">
                My Watchlist
              </Text>
              <Text fontSize="sm" color="neutral.600">
                {filteredAndSortedStocks.length} stocks tracked
              </Text>
            </Box>
          </Flex>
          <Button size="sm" colorPalette="brand">
            <Plus size={16} />
            Add Stock
          </Button>
        </Flex>

        {/* Search and Filter */}
        <Flex gap={3} mb={4}>
          <Box position="relative" flex={1}>
            <Search 
              size={16}
              style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#a0aec0'
              }}
            />
            <Input 
              pl={10}
              placeholder="Search stocks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </Box>
          <Menu.Root>
            <Menu.Trigger asChild>
              <Button variant="outline" size="md">
                <Filter size={16} />
                Filter
              </Button>
            </Menu.Trigger>
            <Menu.Content>
              <Menu.Item value="symbol" onClick={() => setSortBy('symbol')}>Sort by Symbol</Menu.Item>
              <Menu.Item value="price" onClick={() => setSortBy('price')}>Sort by Price</Menu.Item>
              <Menu.Item value="change" onClick={() => setSortBy('change')}>Sort by Change</Menu.Item>
            </Menu.Content>
          </Menu.Root>
        </Flex>

        {/* Watchlist Table */}
        <Table.Root variant="outline" size="sm">
          <Table.Header>
            <Table.Row>
              <Table.ColumnHeader>Stock</Table.ColumnHeader>
              <Table.ColumnHeader>Price</Table.ColumnHeader>
              <Table.ColumnHeader>Change</Table.ColumnHeader>
              <Table.ColumnHeader>Volume</Table.ColumnHeader>
              <Table.ColumnHeader>AI Signal</Table.ColumnHeader>
              <Table.ColumnHeader>Actions</Table.ColumnHeader>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {filteredAndSortedStocks.map((stock) => (
              <Table.Row key={stock.symbol} _hover={{ bg: 'neutral.50' }}>
                <Table.Cell>
                  <Box>
                    <Flex align="center" gap={2}>
                      <Text fontWeight="semibold" color="neutral.900">
                        {stock.symbol}
                      </Text>
                      <div style={{ color: getTrendColor(stock.trend) === 'success.600' ? '#38a169' : getTrendColor(stock.trend) === 'danger.600' ? '#e53e3e' : '#718096' }}>
                        {getTrendIcon(stock.trend)}
                      </div>
                    </Flex>
                    <Text fontSize="xs" color="neutral.600" lineClamp={1}>
                      {stock.companyName}
                    </Text>
                  </Box>
                </Table.Cell>
                <Table.Cell>
                  <PriceDisplay 
                    price={stock.currentPrice}
                    change={0}
                    changePercent={0}
                    size="sm"
                  />
                </Table.Cell>
                <Table.Cell>
                  <PriceDisplay 
                    price={0}
                    change={stock.change}
                    changePercent={stock.changePercent}
                    size="sm"
                  />
                </Table.Cell>
                <Table.Cell>
                  <Text fontSize="sm" color="neutral.700">
                    {formatVolume(stock.volume)}
                  </Text>
                </Table.Cell>
                <Table.Cell>
                  <Flex align="center" gap={2}>
                    <Badge 
                      colorPalette={getRecommendationColor(stock.aiRecommendation)}
                      size="sm"
                    >
                      {stock.aiRecommendation}
                    </Badge>
                    <AIConfidenceIndicator 
                      confidence={stock.aiConfidence}
                      size="sm"
                    />
                  </Flex>
                </Table.Cell>
                <Table.Cell>
                  <Menu.Root>
                    <Menu.Trigger asChild>
                      <Button variant="ghost" size="sm" p={1}>
                        <MoreHorizontal size={16} />
                      </Button>
                    </Menu.Trigger>
                    <Menu.Content>
                      <Menu.Item value="buy">Buy</Menu.Item>
                      <Menu.Item value="sell">Sell</Menu.Item>
                      <Menu.Item value="alert">Set Alert</Menu.Item>
                      <Menu.Item value="chart">View Chart</Menu.Item>
                      <Menu.Separator />
                      <Menu.Item value="remove" color="danger.600">Remove</Menu.Item>
                    </Menu.Content>
                  </Menu.Root>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Root>
      </Card.Body>
    </Card.Root>
  );
};