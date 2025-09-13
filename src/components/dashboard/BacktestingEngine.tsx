import React, { useState } from 'react';
import { 
  Card, 
  Text, 
  Box, 
  Flex, 
  SimpleGrid,
  Icon,
  Button,
  Badge,
  Stack,
  Tabs,
  Input,
  Select,
  Progress,
  Stat,
  Textarea,
  createListCollection
} from '@chakra-ui/react';
import { 
  Play, 
  Square,
  BarChart3,
  Activity,
  Settings,
  Download
} from 'lucide-react';
import { formatCurrency, formatPercentage } from '../../utils/formatters';
import { BacktestStatus, BacktestType, AlgorithmType } from '../../types/enums';

interface BacktestConfig {
  id: string;
  name: string;
  algorithm: string;
  algorithmType: AlgorithmType;
  startDate: string;
  endDate: string;
  initialCapital: number;
  symbols: string[];
  parameters: Record<string, string | number>;
  backtestType: BacktestType;
}

interface BacktestResult {
  id: string;
  configId: string;
  name: string;
  status: BacktestStatus;
  startTime: string;
  endTime?: string;
  duration?: number;
  progress: number;
  results?: {
    initialCapital: number;
    finalValue: number;
    totalReturn: number;
    totalReturnPercent: number;
    maxDrawdown: number;
    sharpeRatio: number;
    sortinoRatio: number;
    calmarRatio: number;
    winRate: number;
    profitFactor: number;
    totalTrades: number;
    avgTradeDuration: number;
    maxConsecutiveWins: number;
    maxConsecutiveLosses: number;
    largestWin: number;
    largestLoss: number;
    avgWin: number;
    avgLoss: number;
    volatility: number;
    beta: number;
    alpha: number;
    informationRatio: number;
  };
  trades?: BacktestTrade[];
  equity_curve?: { date: string; value: number; drawdown: number }[];
}

interface BacktestTrade {
  id: string;
  symbol: string;
  side: 'BUY' | 'SELL';
  quantity: number;
  entryPrice: number;
  exitPrice: number;
  entryTime: string;
  exitTime: string;
  pnl: number;
  pnlPercent: number;
  duration: number;
  reason: string;
}

export const BacktestingEngine: React.FC = () => {
  const [activeTab, setActiveTab] = useState('configure');

  const [isRunning, setIsRunning] = useState(false);

  const [backtestConfigs] = useState<BacktestConfig[]>([
    {
      id: 'config1',
      name: 'MA Crossover Strategy',
      algorithm: 'Moving Average Crossover',
      algorithmType: AlgorithmType.MOMENTUM,
      startDate: '2024-01-01',
      endDate: '2024-12-31',
      initialCapital: 1000000,
      symbols: ['RELIANCE', 'TCS', 'INFY'],
      parameters: {
        shortPeriod: 20,
        longPeriod: 50,
        stopLoss: 5,
        takeProfit: 10
      },
      backtestType: BacktestType.SINGLE_STRATEGY
    },
    {
      id: 'config2',
      name: 'RSI Mean Reversion',
      algorithm: 'RSI Mean Reversion',
      algorithmType: AlgorithmType.MEAN_REVERSION,
      startDate: '2024-01-01',
      endDate: '2024-12-31',
      initialCapital: 1000000,
      symbols: ['HDFC', 'ICICIBANK', 'SBIN'],
      parameters: {
        rsiPeriod: 14,
        oversoldLevel: 30,
        overboughtLevel: 70,
        stopLoss: 3,
        takeProfit: 6
      },
      backtestType: BacktestType.SINGLE_STRATEGY
    },
    {
      id: 'config3',
      name: 'Multi-Strategy Portfolio',
      algorithm: 'Combined Strategies',
      algorithmType: AlgorithmType.CUSTOM,
      startDate: '2024-01-01',
      endDate: '2024-12-31',
      initialCapital: 2000000,
      symbols: ['RELIANCE', 'TCS', 'INFY', 'HDFC', 'ICICIBANK'],
      parameters: {
        strategy1Weight: 0.6,
        strategy2Weight: 0.4,
        rebalanceFrequency: 'monthly'
      },
      backtestType: BacktestType.MULTI_STRATEGY
    }
  ]);

  const [backtestResults] = useState<BacktestResult[]>([
    {
      id: 'result1',
      configId: 'config1',
      name: 'MA Crossover Strategy',
      status: BacktestStatus.COMPLETED,
      startTime: '2025-01-27T09:00:00Z',
      endTime: '2025-01-27T09:15:00Z',
      duration: 900000,
      progress: 100,
      results: {
        initialCapital: 1000000,
        finalValue: 1285000,
        totalReturn: 285000,
        totalReturnPercent: 28.5,
        maxDrawdown: -8.7,
        sharpeRatio: 1.42,
        sortinoRatio: 1.89,
        calmarRatio: 3.28,
        winRate: 68.5,
        profitFactor: 1.85,
        totalTrades: 156,
        avgTradeDuration: 4.2,
        maxConsecutiveWins: 8,
        maxConsecutiveLosses: 4,
        largestWin: 15600,
        largestLoss: -8900,
        avgWin: 2840,
        avgLoss: -1540,
        volatility: 18.4,
        beta: 0.92,
        alpha: 4.2,
        informationRatio: 0.78
      }
    },
    {
      id: 'result2',
      configId: 'config2',
      name: 'RSI Mean Reversion',
      status: BacktestStatus.RUNNING,
      startTime: '2025-01-27T10:30:00Z',
      progress: 65,
    },
    {
      id: 'result3',
      configId: 'config3',
      name: 'Multi-Strategy Portfolio',
      status: BacktestStatus.COMPLETED,
      startTime: '2025-01-27T08:00:00Z',
      endTime: '2025-01-27T08:25:00Z',
      duration: 1500000,
      progress: 100,
      results: {
        initialCapital: 2000000,
        finalValue: 2640000,
        totalReturn: 640000,
        totalReturnPercent: 32.0,
        maxDrawdown: -6.2,
        sharpeRatio: 1.78,
        sortinoRatio: 2.34,
        calmarRatio: 5.16,
        winRate: 72.3,
        profitFactor: 2.15,
        totalTrades: 234,
        avgTradeDuration: 3.8,
        maxConsecutiveWins: 12,
        maxConsecutiveLosses: 3,
        largestWin: 28400,
        largestLoss: -12300,
        avgWin: 4120,
        avgLoss: -1920,
        volatility: 16.8,
        beta: 0.88,
        alpha: 6.1,
        informationRatio: 1.12
      }
    }
  ]);

  const getStatusColor = (status: BacktestStatus) => {
    switch (status) {
      case BacktestStatus.RUNNING: return 'blue';
      case BacktestStatus.COMPLETED: return 'success';
      case BacktestStatus.FAILED: return 'danger';
      case BacktestStatus.CANCELLED: return 'warning';
      default: return 'neutral';
    }
  };

  const getAlgorithmTypeColor = (type: AlgorithmType) => {
    switch (type) {
      case AlgorithmType.MOMENTUM: return 'blue';
      case AlgorithmType.MEAN_REVERSION: return 'purple';
      case AlgorithmType.ML_BASED: return 'ai';
      case AlgorithmType.CUSTOM: return 'brand';
      default: return 'neutral';
    }
  };

  const handleRunBacktest = (configId: string) => {
    console.log('Running backtest for config:', configId);
    setIsRunning(true);
    // Simulate backtest running
    setTimeout(() => setIsRunning(false), 5000);
  };

  const handleStopBacktest = (resultId: string) => {
    console.log('Stopping backtest:', resultId);
  };

  return (
    <Box>
      {/* Header */}
      <Card.Root mb={6}>
        <Card.Body>
          <Flex justify="space-between" align="center" mb={4}>
            <Flex align="center" gap={3}>
              <Icon color="brand.600">
                <BarChart3 size={24} />
              </Icon>
              <Box>
                <Text textStyle="heading.md" color="neutral.900">
                  Backtesting Engine
                </Text>
                <Text fontSize="sm" color="neutral.600">
                  Test your trading strategies with historical data
                </Text>
              </Box>
            </Flex>
            
            <Flex align="center" gap={3}>
              <Button colorPalette="brand">
                <Icon><Settings size={16} /></Icon>
                Settings
              </Button>
              <Button colorPalette="success">
                <Icon><Play size={16} /></Icon>
                New Backtest
              </Button>
            </Flex>
          </Flex>

          {/* Quick Stats */}
          <SimpleGrid columns={{ base: 2, md: 4 }} gap={4}>
            <Box textAlign="center">
              <Text fontSize="2xl" fontWeight="bold" color="brand.600">
                {backtestConfigs.length}
              </Text>
              <Text fontSize="sm" color="neutral.600">Configurations</Text>
            </Box>
            <Box textAlign="center">
              <Text fontSize="2xl" fontWeight="bold" color="success.600">
                {backtestResults.filter(r => r.status === BacktestStatus.COMPLETED).length}
              </Text>
              <Text fontSize="sm" color="neutral.600">Completed</Text>
            </Box>
            <Box textAlign="center">
              <Text fontSize="2xl" fontWeight="bold" color="blue.600">
                {backtestResults.filter(r => r.status === BacktestStatus.RUNNING).length}
              </Text>
              <Text fontSize="sm" color="neutral.600">Running</Text>
            </Box>
            <Box textAlign="center">
              <Text fontSize="2xl" fontWeight="bold" color="purple.600">
                {formatPercentage(24.7)}
              </Text>
              <Text fontSize="sm" color="neutral.600">Avg Return</Text>
            </Box>
          </SimpleGrid>
        </Card.Body>
      </Card.Root>

      <Tabs.Root value={activeTab} onValueChange={(e) => setActiveTab(e.value)}>
        <Tabs.List mb={6}>
          <Tabs.Trigger value="configure">Configure</Tabs.Trigger>
          <Tabs.Trigger value="results">Results</Tabs.Trigger>
          <Tabs.Trigger value="comparison">Comparison</Tabs.Trigger>
          <Tabs.Trigger value="analysis">Analysis</Tabs.Trigger>
        </Tabs.List>

        {/* Configure Tab */}
        <Tabs.Content value="configure">
          <SimpleGrid columns={{ base: 1, lg: 2 }} gap={6}>
            {/* Configuration List */}
            <Card.Root>
              <Card.Body>
                <Text fontWeight="semibold" color="neutral.900" mb={4}>
                  Backtest Configurations
                </Text>
                
                <Stack gap={4}>
                  {backtestConfigs.map((config) => (
                    <Box 
                      key={config.id}
                      p={4} 
                      bg="neutral.50" 
                      borderRadius="md"
                      border="1px solid"
                      borderColor="neutral.200"
                      cursor="pointer"
                      _hover={{ bg: 'neutral.100' }}
                    >
                      <Flex justify="space-between" align="center" mb={2}>
                        <Text fontWeight="medium" color="neutral.900">
                          {config.name}
                        </Text>
                        <Badge colorPalette={getAlgorithmTypeColor(config.algorithmType)}>
                          {config.algorithmType}
                        </Badge>
                      </Flex>
                      
                      <Text fontSize="sm" color="neutral.700" mb={3}>
                        {config.algorithm}
                      </Text>
                      
                      <SimpleGrid columns={2} gap={3} mb={3}>
                        <Box>
                          <Text fontSize="xs" color="neutral.600">Period</Text>
                          <Text fontSize="sm" color="neutral.900">
                            {new Date(config.startDate).getFullYear()} - {new Date(config.endDate).getFullYear()}
                          </Text>
                        </Box>
                        <Box>
                          <Text fontSize="xs" color="neutral.600">Capital</Text>
                          <Text fontSize="sm" color="neutral.900">
                            {formatCurrency(config.initialCapital)}
                          </Text>
                        </Box>
                        <Box>
                          <Text fontSize="xs" color="neutral.600">Symbols</Text>
                          <Text fontSize="sm" color="neutral.900">
                            {config.symbols.length} stocks
                          </Text>
                        </Box>
                        <Box>
                          <Text fontSize="xs" color="neutral.600">Type</Text>
                          <Text fontSize="sm" color="neutral.900">
                            {config.backtestType.replace('_', ' ')}
                          </Text>
                        </Box>
                      </SimpleGrid>
                      
                      <Flex justify="space-between" align="center">
                        <Text fontSize="xs" color="neutral.500">
                          Symbols: {config.symbols.join(', ')}
                        </Text>
                        <Button 
                          size="sm" 
                          colorPalette="brand"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRunBacktest(config.id);
                          }}
                          loading={isRunning}
                        >
                          <Icon><Play size={14} /></Icon>
                          Run
                        </Button>
                      </Flex>
                    </Box>
                  ))}
                </Stack>
              </Card.Body>
            </Card.Root>

            {/* Configuration Form */}
            <Card.Root>
              <Card.Body>
                <Text fontWeight="semibold" color="neutral.900" mb={4}>
                  Create New Backtest
                </Text>
                
                <Stack gap={4}>
                  <Box>
                    <Text fontSize="sm" fontWeight="medium" color="neutral.700" mb={2}>
                      Backtest Name
                    </Text>
                    <Input placeholder="Enter backtest name" />
                  </Box>

                  <Box>
                    <Text fontSize="sm" fontWeight="medium" color="neutral.700" mb={2}>
                      Strategy
                    </Text>
                    <Select.Root collection={createListCollection({
                      items: [
                        { label: 'Moving Average Crossover', value: 'ma_crossover' },
                        { label: 'RSI Mean Reversion', value: 'rsi_mean_reversion' },
                        { label: 'Bollinger Bands', value: 'bollinger_bands' },
                        { label: 'MACD Strategy', value: 'macd_strategy' },
                        { label: 'Custom Strategy', value: 'custom' }
                      ]
                    })}>
                      <Select.Trigger>
                        <Select.ValueText placeholder="Select strategy" />
                      </Select.Trigger>
                      <Select.Content>
                        <Select.Item item="ma_crossover">Moving Average Crossover</Select.Item>
                        <Select.Item item="rsi_mean_reversion">RSI Mean Reversion</Select.Item>
                        <Select.Item item="bollinger_bands">Bollinger Bands</Select.Item>
                        <Select.Item item="macd_strategy">MACD Strategy</Select.Item>
                        <Select.Item item="custom">Custom Strategy</Select.Item>
                      </Select.Content>
                    </Select.Root>
                  </Box>

                  <SimpleGrid columns={2} gap={4}>
                    <Box>
                      <Text fontSize="sm" fontWeight="medium" color="neutral.700" mb={2}>
                        Start Date
                      </Text>
                      <Input type="date" defaultValue="2024-01-01" />
                    </Box>
                    <Box>
                      <Text fontSize="sm" fontWeight="medium" color="neutral.700" mb={2}>
                        End Date
                      </Text>
                      <Input type="date" defaultValue="2024-12-31" />
                    </Box>
                  </SimpleGrid>

                  <Box>
                    <Text fontSize="sm" fontWeight="medium" color="neutral.700" mb={2}>
                      Initial Capital
                    </Text>
                    <Input 
                      type="number" 
                      placeholder="1000000" 
                      defaultValue="1000000"
                    />
                  </Box>

                  <Box>
                    <Text fontSize="sm" fontWeight="medium" color="neutral.700" mb={2}>
                      Symbols (comma-separated)
                    </Text>
                    <Input placeholder="RELIANCE, TCS, INFY, HDFC" />
                  </Box>

                  <Box>
                    <Text fontSize="sm" fontWeight="medium" color="neutral.700" mb={2}>
                      Backtest Type
                    </Text>
                    <Select.Root collection={createListCollection({
                      items: [
                        { label: 'Single Strategy', value: 'single' },
                        { label: 'Multi Strategy', value: 'multi' },
                        { label: 'Monte Carlo', value: 'monte_carlo' },
                        { label: 'Walk Forward', value: 'walk_forward' }
                      ]
                    })}>
                      <Select.Trigger>
                        <Select.ValueText placeholder="Select type" />
                      </Select.Trigger>
                      <Select.Content>
                        <Select.Item item="single">Single Strategy</Select.Item>
                        <Select.Item item="multi">Multi Strategy</Select.Item>
                        <Select.Item item="monte_carlo">Monte Carlo</Select.Item>
                        <Select.Item item="walk_forward">Walk Forward</Select.Item>
                      </Select.Content>
                    </Select.Root>
                  </Box>

                  <Box>
                    <Text fontSize="sm" fontWeight="medium" color="neutral.700" mb={2}>
                      Strategy Parameters (JSON)
                    </Text>
                    <Textarea 
                      placeholder='{"shortPeriod": 20, "longPeriod": 50, "stopLoss": 5}'
                      rows={4}
                    />
                  </Box>

                  <Button colorPalette="brand" size="lg">
                    <Icon><Play size={16} /></Icon>
                    Run Backtest
                  </Button>
                </Stack>
              </Card.Body>
            </Card.Root>
          </SimpleGrid>
        </Tabs.Content>

        {/* Results Tab */}
        <Tabs.Content value="results">
          <Stack gap={6}>
            {backtestResults.map((result) => (
              <Card.Root key={result.id}>
                <Card.Body>
                  <Flex justify="space-between" align="center" mb={4}>
                    <Flex align="center" gap={3}>
                      <Icon color="brand.600">
                        {result.status === BacktestStatus.RUNNING ? <Activity size={20} /> : <BarChart3 size={20} />}
                      </Icon>
                      <Box>
                        <Text fontWeight="semibold" color="neutral.900">
                          {result.name}
                        </Text>
                        <Text fontSize="sm" color="neutral.600">
                          Started: {new Date(result.startTime).toLocaleString()}
                        </Text>
                      </Box>
                    </Flex>
                    
                    <Flex align="center" gap={3}>
                      <Badge colorPalette={getStatusColor(result.status)}>
                        {result.status}
                      </Badge>
                      {result.status === BacktestStatus.RUNNING && (
                        <Button 
                          size="sm" 
                          colorPalette="danger"
                          onClick={() => handleStopBacktest(result.id)}
                        >
                          <Icon><Square size={14} /></Icon>
                          Stop
                        </Button>
                      )}
                      {result.status === BacktestStatus.COMPLETED && (
                        <Button size="sm" variant="outline">
                          <Icon><Download size={14} /></Icon>
                          Export
                        </Button>
                      )}
                    </Flex>
                  </Flex>

                  {result.status === BacktestStatus.RUNNING && (
                    <Box mb={4}>
                      <Flex justify="space-between" align="center" mb={2}>
                        <Text fontSize="sm" color="neutral.700">Progress</Text>
                        <Text fontSize="sm" color="neutral.700">{result.progress}%</Text>
                      </Flex>
                      <Progress.Root value={result.progress} colorPalette="brand">
                        <Progress.Track>
                          <Progress.Range />
                        </Progress.Track>
                      </Progress.Root>
                    </Box>
                  )}

                  {result.results && (
                    <SimpleGrid columns={{ base: 2, md: 4, lg: 6 }} gap={4}>
                      <Stat.Root>
                        <Stat.Label>Total Return</Stat.Label>
                        <Stat.ValueText 
                          fontSize="lg" 
                          fontWeight="bold" 
                          color="success.600"
                        >
                          {formatPercentage(result.results.totalReturnPercent)}
                        </Stat.ValueText>
                      </Stat.Root>
                      
                      <Stat.Root>
                        <Stat.Label>Sharpe Ratio</Stat.Label>
                        <Stat.ValueText fontSize="lg" fontWeight="bold" color="brand.600">
                          {result.results.sharpeRatio.toFixed(2)}
                        </Stat.ValueText>
                      </Stat.Root>
                      
                      <Stat.Root>
                        <Stat.Label>Max Drawdown</Stat.Label>
                        <Stat.ValueText fontSize="lg" fontWeight="bold" color="danger.600">
                          {formatPercentage(result.results.maxDrawdown)}
                        </Stat.ValueText>
                      </Stat.Root>
                      
                      <Stat.Root>
                        <Stat.Label>Win Rate</Stat.Label>
                        <Stat.ValueText fontSize="lg" fontWeight="bold" color="success.600">
                          {result.results.winRate.toFixed(1)}%
                        </Stat.ValueText>
                      </Stat.Root>
                      
                      <Stat.Root>
                        <Stat.Label>Total Trades</Stat.Label>
                        <Stat.ValueText fontSize="lg" fontWeight="bold" color="neutral.900">
                          {result.results.totalTrades}
                        </Stat.ValueText>
                      </Stat.Root>
                      
                      <Stat.Root>
                        <Stat.Label>Profit Factor</Stat.Label>
                        <Stat.ValueText fontSize="lg" fontWeight="bold" color="brand.600">
                          {result.results.profitFactor.toFixed(2)}
                        </Stat.ValueText>
                      </Stat.Root>
                    </SimpleGrid>
                  )}

                  {result.endTime && (
                    <Text fontSize="xs" color="neutral.500" mt={3}>
                      Completed: {new Date(result.endTime).toLocaleString()} 
                      {result.duration && ` (${Math.round(result.duration / 1000)}s)`}
                    </Text>
                  )}
                </Card.Body>
              </Card.Root>
            ))}
          </Stack>
        </Tabs.Content>

        {/* Comparison Tab */}
        <Tabs.Content value="comparison">
          <Card.Root>
            <Card.Body>
              <Text fontWeight="semibold" color="neutral.900" mb={4}>
                Strategy Performance Comparison
              </Text>
              
              <Box overflowX="auto">
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                      <th style={{ textAlign: 'left', padding: '12px 8px', fontSize: '14px', color: '#64748b' }}>Strategy</th>
                      <th style={{ textAlign: 'right', padding: '12px 8px', fontSize: '14px', color: '#64748b' }}>Total Return</th>
                      <th style={{ textAlign: 'right', padding: '12px 8px', fontSize: '14px', color: '#64748b' }}>Sharpe Ratio</th>
                      <th style={{ textAlign: 'right', padding: '12px 8px', fontSize: '14px', color: '#64748b' }}>Max Drawdown</th>
                      <th style={{ textAlign: 'right', padding: '12px 8px', fontSize: '14px', color: '#64748b' }}>Win Rate</th>
                      <th style={{ textAlign: 'right', padding: '12px 8px', fontSize: '14px', color: '#64748b' }}>Profit Factor</th>
                      <th style={{ textAlign: 'right', padding: '12px 8px', fontSize: '14px', color: '#64748b' }}>Total Trades</th>
                    </tr>
                  </thead>
                  <tbody>
                    {backtestResults
                      .filter(r => r.results)
                      .map((result) => (
                        <tr key={result.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td style={{ padding: '12px 8px' }}>
                            <Text fontSize="sm" fontWeight="medium" color="neutral.900">
                              {result.name}
                            </Text>
                          </td>
                          <td style={{ textAlign: 'right', padding: '12px 8px' }}>
                            <Text 
                              fontSize="sm" 
                              fontWeight="bold" 
                              color={result.results!.totalReturnPercent >= 0 ? 'success.600' : 'danger.600'}
                            >
                              {formatPercentage(result.results!.totalReturnPercent)}
                            </Text>
                          </td>
                          <td style={{ textAlign: 'right', padding: '12px 8px' }}>
                            <Text fontSize="sm" color="neutral.900">
                              {result.results!.sharpeRatio.toFixed(2)}
                            </Text>
                          </td>
                          <td style={{ textAlign: 'right', padding: '12px 8px' }}>
                            <Text fontSize="sm" color="danger.600">
                              {formatPercentage(result.results!.maxDrawdown)}
                            </Text>
                          </td>
                          <td style={{ textAlign: 'right', padding: '12px 8px' }}>
                            <Text fontSize="sm" color="success.600">
                              {result.results!.winRate.toFixed(1)}%
                            </Text>
                          </td>
                          <td style={{ textAlign: 'right', padding: '12px 8px' }}>
                            <Text fontSize="sm" color="brand.600">
                              {result.results!.profitFactor.toFixed(2)}
                            </Text>
                          </td>
                          <td style={{ textAlign: 'right', padding: '12px 8px' }}>
                            <Text fontSize="sm" color="neutral.900">
                              {result.results!.totalTrades}
                            </Text>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </Box>
            </Card.Body>
          </Card.Root>
        </Tabs.Content>

        {/* Analysis Tab */}
        <Tabs.Content value="analysis">
          <SimpleGrid columns={{ base: 1, lg: 2 }} gap={6}>
            <Card.Root>
              <Card.Body>
                <Text fontWeight="semibold" color="neutral.900" mb={4}>
                  Risk-Return Analysis
                </Text>
                
                <Stack gap={4}>
                  {backtestResults
                    .filter(r => r.results)
                    .map((result) => (
                      <Box key={result.id} p={4} bg="neutral.50" borderRadius="md">
                        <Text fontSize="sm" fontWeight="medium" color="neutral.800" mb={3}>
                          {result.name}
                        </Text>
                        <SimpleGrid columns={2} gap={3}>
                          <Box>
                            <Text fontSize="xs" color="neutral.600">Return</Text>
                            <Text 
                              fontSize="sm" 
                              fontWeight="bold" 
                              color={result.results!.totalReturnPercent >= 0 ? 'success.600' : 'danger.600'}
                            >
                              {formatPercentage(result.results!.totalReturnPercent)}
                            </Text>
                          </Box>
                          <Box>
                            <Text fontSize="xs" color="neutral.600">Volatility</Text>
                            <Text fontSize="sm" fontWeight="bold" color="warning.600">
                              {result.results!.volatility.toFixed(1)}%
                            </Text>
                          </Box>
                          <Box>
                            <Text fontSize="xs" color="neutral.600">Beta</Text>
                            <Text fontSize="sm" fontWeight="bold" color="brand.600">
                              {result.results!.beta.toFixed(2)}
                            </Text>
                          </Box>
                          <Box>
                            <Text fontSize="xs" color="neutral.600">Alpha</Text>
                            <Text fontSize="sm" fontWeight="bold" color="purple.600">
                              {result.results!.alpha.toFixed(1)}%
                            </Text>
                          </Box>
                        </SimpleGrid>
                      </Box>
                    ))}
                </Stack>
              </Card.Body>
            </Card.Root>

            <Card.Root>
              <Card.Body>
                <Text fontWeight="semibold" color="neutral.900" mb={4}>
                  Trade Analysis
                </Text>
                
                <Stack gap={4}>
                  {backtestResults
                    .filter(r => r.results)
                    .map((result) => (
                      <Box key={result.id} p={4} bg="neutral.50" borderRadius="md">
                        <Text fontSize="sm" fontWeight="medium" color="neutral.800" mb={3}>
                          {result.name}
                        </Text>
                        <SimpleGrid columns={2} gap={3}>
                          <Box>
                            <Text fontSize="xs" color="neutral.600">Avg Win</Text>
                            <Text fontSize="sm" fontWeight="bold" color="success.600">
                              {formatCurrency(result.results!.avgWin)}
                            </Text>
                          </Box>
                          <Box>
                            <Text fontSize="xs" color="neutral.600">Avg Loss</Text>
                            <Text fontSize="sm" fontWeight="bold" color="danger.600">
                              {formatCurrency(result.results!.avgLoss)}
                            </Text>
                          </Box>
                          <Box>
                            <Text fontSize="xs" color="neutral.600">Largest Win</Text>
                            <Text fontSize="sm" fontWeight="bold" color="success.600">
                              {formatCurrency(result.results!.largestWin)}
                            </Text>
                          </Box>
                          <Box>
                            <Text fontSize="xs" color="neutral.600">Largest Loss</Text>
                            <Text fontSize="sm" fontWeight="bold" color="danger.600">
                              {formatCurrency(result.results!.largestLoss)}
                            </Text>
                          </Box>
                        </SimpleGrid>
                      </Box>
                    ))}
                </Stack>
              </Card.Body>
            </Card.Root>
          </SimpleGrid>
        </Tabs.Content>
      </Tabs.Root>
    </Box>
  );
};