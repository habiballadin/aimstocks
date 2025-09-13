import React, { useState } from 'react';
import { 
  Card, 
  Text, 
  Box, 
  Flex, 
  Table,
  Icon,
  Button,
  Badge,
  Tabs,
  Select,
  Stack,
  SimpleGrid,
  createListCollection
} from '@chakra-ui/react';
import { 
  Radar, 
  TrendingUp, 
  TrendingDown,
  Volume2,
  Target,
  Zap,
  Filter
} from 'lucide-react';
import { PriceDisplay } from '../common/PriceDisplay';
import { formatVolume } from '../../utils/formatters';

interface ScannerResult {
  symbol: string;
  companyName: string;
  currentPrice: number;
  change: number;
  changePercent: number;
  volume: number;
  avgVolume: number;
  marketCap: number;
  signal: 'BREAKOUT' | 'BREAKDOWN' | 'VOLUME_SPIKE' | 'OVERSOLD' | 'OVERBOUGHT';
  confidence: number;
  reason: string;
}

export const MarketScanner: React.FC = () => {
  const [activeTab, setActiveTab] = useState('breakouts');
  const [timeframe, setTimeframe] = useState('1d');
  const [marketCap, setMarketCap] = useState('all');

  const scannerResults: ScannerResult[] = [
    {
      symbol: 'ADANIPORTS',
      companyName: 'Adani Ports & SEZ Ltd',
      currentPrice: 1247.80,
      change: 67.45,
      changePercent: 5.72,
      volume: 8945672,
      avgVolume: 3456789,
      marketCap: 2650000000000,
      signal: 'BREAKOUT',
      confidence: 0.87,
      reason: 'Breaking above 1200 resistance with high volume'
    },
    {
      symbol: 'BAJFINANCE',
      companyName: 'Bajaj Finance Limited',
      currentPrice: 6789.30,
      change: 234.50,
      changePercent: 3.58,
      volume: 1234567,
      avgVolume: 987654,
      marketCap: 4200000000000,
      signal: 'VOLUME_SPIKE',
      confidence: 0.79,
      reason: 'Volume 2.5x above average with positive momentum'
    },
    {
      symbol: 'MARUTI',
      companyName: 'Maruti Suzuki India Ltd',
      currentPrice: 11456.75,
      change: -145.20,
      changePercent: -1.25,
      volume: 567890,
      avgVolume: 789012,
      marketCap: 3450000000000,
      signal: 'OVERSOLD',
      confidence: 0.72,
      reason: 'RSI below 30, potential bounce expected'
    },
    {
      symbol: 'ASIANPAINT',
      companyName: 'Asian Paints Limited',
      currentPrice: 2987.45,
      change: -89.30,
      changePercent: -2.90,
      volume: 2345678,
      avgVolume: 1567890,
      marketCap: 2870000000000,
      signal: 'BREAKDOWN',
      confidence: 0.81,
      reason: 'Breaking below 3000 support level'
    },
    {
      symbol: 'WIPRO',
      companyName: 'Wipro Limited',
      currentPrice: 567.80,
      change: 45.60,
      changePercent: 8.73,
      volume: 15678901,
      avgVolume: 4567890,
      marketCap: 3120000000000,
      signal: 'OVERBOUGHT',
      confidence: 0.68,
      reason: 'RSI above 70, potential correction due'
    }
  ];

  const getSignalIcon = (signal: string) => {
    switch (signal) {
      case 'BREAKOUT': return <TrendingUp size={14} />;
      case 'BREAKDOWN': return <TrendingDown size={14} />;
      case 'VOLUME_SPIKE': return <Volume2 size={14} />;
      case 'OVERSOLD': return <Target size={14} />;
      case 'OVERBOUGHT': return <Zap size={14} />;
      default: return <Radar size={14} />;
    }
  };

  const getSignalColor = (signal: string) => {
    switch (signal) {
      case 'BREAKOUT': return 'success';
      case 'BREAKDOWN': return 'danger';
      case 'VOLUME_SPIKE': return 'brand';
      case 'OVERSOLD': return 'warning';
      case 'OVERBOUGHT': return 'warning';
      default: return 'neutral';
    }
  };

  const filteredResults = scannerResults.filter(result => {
    if (activeTab === 'breakouts') return result.signal === 'BREAKOUT';
    if (activeTab === 'breakdowns') return result.signal === 'BREAKDOWN';
    if (activeTab === 'volume') return result.signal === 'VOLUME_SPIKE';
    if (activeTab === 'oversold') return result.signal === 'OVERSOLD';
    if (activeTab === 'overbought') return result.signal === 'OVERBOUGHT';
    return true;
  });

  const signalCounts = {
    breakouts: scannerResults.filter(r => r.signal === 'BREAKOUT').length,
    breakdowns: scannerResults.filter(r => r.signal === 'BREAKDOWN').length,
    volume: scannerResults.filter(r => r.signal === 'VOLUME_SPIKE').length,
    oversold: scannerResults.filter(r => r.signal === 'OVERSOLD').length,
    overbought: scannerResults.filter(r => r.signal === 'OVERBOUGHT').length
  };

  return (
    <Card.Root>
      <Card.Body>
        <Flex justify="space-between" align="center" mb={6}>
          <Flex align="center" gap={3}>
            <Icon color="brand.600">
              <Radar size={24} />
            </Icon>
            <Box>
              <Text textStyle="heading.md" color="neutral.900">
                Market Scanner
              </Text>
              <Text fontSize="sm" color="neutral.600">
                AI-powered stock screening
              </Text>
            </Box>
          </Flex>
          <Button size="sm" colorPalette="brand">
            <Icon><Filter size={16} /></Icon>
            Custom Scan
          </Button>
        </Flex>

        {/* Filters */}
        <SimpleGrid columns={2} gap={3} mb={4}>
          <Select.Root 
            collection={createListCollection({
              items: [
                { label: '5 Minutes', value: '5m' },
                { label: '15 Minutes', value: '15m' },
                { label: '1 Hour', value: '1h' },
                { label: '1 Day', value: '1d' },
                { label: '1 Week', value: '1w' }
              ]
            })}
            value={[timeframe]} 
            onValueChange={(e) => setTimeframe(e.value[0])}
          >
            <Select.Trigger>
              <Select.ValueText placeholder="Timeframe" />
            </Select.Trigger>
            <Select.Content>
              <Select.Item item="5m">5 Minutes</Select.Item>
              <Select.Item item="15m">15 Minutes</Select.Item>
              <Select.Item item="1h">1 Hour</Select.Item>
              <Select.Item item="1d">1 Day</Select.Item>
              <Select.Item item="1w">1 Week</Select.Item>
            </Select.Content>
          </Select.Root>

          <Select.Root 
            collection={createListCollection({
              items: [
                { label: 'All Caps', value: 'all' },
                { label: 'Large Cap', value: 'large' },
                { label: 'Mid Cap', value: 'mid' },
                { label: 'Small Cap', value: 'small' }
              ]
            })}
            value={[marketCap]} 
            onValueChange={(e) => setMarketCap(e.value[0])}
          >
            <Select.Trigger>
              <Select.ValueText placeholder="Market Cap" />
            </Select.Trigger>
            <Select.Content>
              <Select.Item item="all">All Caps</Select.Item>
              <Select.Item item="large">Large Cap</Select.Item>
              <Select.Item item="mid">Mid Cap</Select.Item>
              <Select.Item item="small">Small Cap</Select.Item>
            </Select.Content>
          </Select.Root>
        </SimpleGrid>

        {/* Scanner Tabs */}
        <Tabs.Root value={activeTab} onValueChange={(e) => setActiveTab(e.value)} mb={4}>
          <Tabs.List>
            <Tabs.Trigger value="breakouts">
              Breakouts ({signalCounts.breakouts})
            </Tabs.Trigger>
            <Tabs.Trigger value="breakdowns">
              Breakdowns ({signalCounts.breakdowns})
            </Tabs.Trigger>
            <Tabs.Trigger value="volume">
              Volume ({signalCounts.volume})
            </Tabs.Trigger>
            <Tabs.Trigger value="oversold">
              Oversold ({signalCounts.oversold})
            </Tabs.Trigger>
            <Tabs.Trigger value="overbought">
              Overbought ({signalCounts.overbought})
            </Tabs.Trigger>
          </Tabs.List>
        </Tabs.Root>

        {/* Results Table */}
        <Table.Root variant="outline" size="sm">
          <Table.Header>
            <Table.Row>
              <Table.ColumnHeader>Stock</Table.ColumnHeader>
              <Table.ColumnHeader>Price</Table.ColumnHeader>
              <Table.ColumnHeader>Change</Table.ColumnHeader>
              <Table.ColumnHeader>Volume</Table.ColumnHeader>
              <Table.ColumnHeader>Signal</Table.ColumnHeader>
              <Table.ColumnHeader>AI Score</Table.ColumnHeader>
              <Table.ColumnHeader>Reason</Table.ColumnHeader>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {filteredResults.map((result) => (
              <Table.Row key={result.symbol} _hover={{ bg: 'neutral.50' }}>
                <Table.Cell>
                  <Box>
                    <Text fontWeight="semibold" color="neutral.900">
                      {result.symbol}
                    </Text>
                    <Text fontSize="xs" color="neutral.600" lineClamp={1}>
                      {result.companyName}
                    </Text>
                  </Box>
                </Table.Cell>
                <Table.Cell>
                  <PriceDisplay 
                    price={result.currentPrice}
                    change={0}
                    changePercent={0}
                    size="sm"
                    showIcon={false}
                  />
                </Table.Cell>
                <Table.Cell>
                  <PriceDisplay 
                    price={0}
                    change={result.change}
                    changePercent={result.changePercent}
                    size="sm"
                  />
                </Table.Cell>
                <Table.Cell>
                  <Stack gap={1}>
                    <Text fontSize="sm" color="neutral.700">
                      {formatVolume(result.volume)}
                    </Text>
                    <Text fontSize="xs" color="neutral.500">
                      Avg: {formatVolume(result.avgVolume)}
                    </Text>
                  </Stack>
                </Table.Cell>
                <Table.Cell>
                  <Badge 
                    colorPalette={getSignalColor(result.signal)}
                    size="sm"
                    display="flex"
                    alignItems="center"
                    gap={1}
                  >
                    <Icon>
                      {getSignalIcon(result.signal)}
                    </Icon>
                    {result.signal}
                  </Badge>
                </Table.Cell>
                <Table.Cell>
                  <Text 
                    fontSize="sm" 
                    fontWeight="bold"
                    color={result.confidence >= 0.8 ? 'success.600' : 
                           result.confidence >= 0.6 ? 'warning.600' : 'danger.600'}
                  >
                    {Math.round(result.confidence * 100)}%
                  </Text>
                </Table.Cell>
                <Table.Cell>
                  <Text fontSize="xs" color="neutral.600" maxW="200px" lineClamp={2}>
                    {result.reason}
                  </Text>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Root>

        {filteredResults.length === 0 && (
          <Box textAlign="center" py={8}>
            <Icon color="neutral.400" mb={2}>
              <Radar size={32} />
            </Icon>
            <Text color="neutral.600" fontSize="sm">
              No signals found for the selected criteria
            </Text>
          </Box>
        )}
      </Card.Body>
    </Card.Root>
  );
};