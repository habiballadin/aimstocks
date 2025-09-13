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
  Switch,
  Alert,
  Table,
  Textarea,
  Progress,
  Dialog,
  createListCollection
} from '@chakra-ui/react';
import { 
  Code, 
  Play, 
  Pause,
  Settings,
  Brain,
  FileCode,
  Plus,
  BarChart3,
  Activity,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import { formatCurrency, formatPercentage } from '../../utils/formatters';

interface Algorithm {
  id: string;
  name: string;
  type: 'PREDEFINED' | 'CUSTOM';
  category: 'MOMENTUM' | 'MEAN_REVERSION' | 'ARBITRAGE' | 'ML_BASED' | 'CUSTOM';
  description: string;
  pythonCode?: string;
  parameters: Record<string, string | number>;
  status: 'STOPPED' | 'RUNNING' | 'PAUSED' | 'ERROR';
  performance: {
    totalReturn: number;
    sharpeRatio: number;
    maxDrawdown: number;
    winRate: number;
    totalTrades: number;
    profitFactor: number;
  };
  backtestResults?: {
    startDate: string;
    endDate: string;
    initialCapital: number;
    finalValue: number;
    trades: number;
    avgReturn: number;
  };
  isActive: boolean;
  createdAt: string;
  lastRun?: string;
}

interface AlgoExecution {
  id: string;
  algoId: string;
  algoName: string;
  symbol: string;
  action: 'BUY' | 'SELL';
  quantity: number;
  price: number;
  timestamp: string;
  reason: string;
  confidence: number;
  status: 'PENDING' | 'EXECUTED' | 'FAILED';
}

interface PythonEnvironment {
  status: 'CONNECTED' | 'DISCONNECTED' | 'ERROR';
  version: string;
  libraries: string[];
  lastHealthCheck: string;
}

export const AlgorithmicTrading: React.FC = () => {
  const [activeTab, setActiveTab] = useState('algorithms');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isCodeEditorOpen, setIsCodeEditorOpen] = useState(false);
  const [selectedAlgo, setSelectedAlgo] = useState<Algorithm | null>(null);
  const [newAlgoCode, setNewAlgoCode] = useState('');

  const [pythonEnv] = useState<PythonEnvironment>({
    status: 'CONNECTED',
    version: '3.9.7',
    libraries: ['pandas', 'numpy', 'scikit-learn', 'ta-lib', 'yfinance', 'backtrader'],
    lastHealthCheck: new Date().toISOString()
  });

  const [algorithms] = useState<Algorithm[]>([
    {
      id: 'algo1',
      name: 'Moving Average Crossover',
      type: 'PREDEFINED',
      category: 'MOMENTUM',
      description: 'Buy when short MA crosses above long MA, sell when it crosses below',
      parameters: {
        shortPeriod: 20,
        longPeriod: 50,
        symbol: 'RELIANCE',
        quantity: 10
      },
      status: 'RUNNING',
      performance: {
        totalReturn: 15.8,
        sharpeRatio: 1.42,
        maxDrawdown: -8.5,
        winRate: 68.5,
        totalTrades: 23,
        profitFactor: 1.85
      },
      backtestResults: {
        startDate: '2024-01-01',
        endDate: '2024-12-31',
        initialCapital: 100000,
        finalValue: 115800,
        trades: 23,
        avgReturn: 0.68
      },
      isActive: true,
      createdAt: '2024-01-15T10:00:00Z',
      lastRun: '2025-01-27T11:30:00Z'
    },
    {
      id: 'algo2',
      name: 'RSI Mean Reversion',
      type: 'PREDEFINED',
      category: 'MEAN_REVERSION',
      description: 'Buy when RSI < 30 (oversold), sell when RSI > 70 (overbought)',
      parameters: {
        rsiPeriod: 14,
        oversoldLevel: 30,
        overboughtLevel: 70,
        symbol: 'TCS',
        quantity: 5
      },
      status: 'RUNNING',
      performance: {
        totalReturn: 12.3,
        sharpeRatio: 1.18,
        maxDrawdown: -6.2,
        winRate: 72.1,
        totalTrades: 31,
        profitFactor: 1.67
      },
      isActive: true,
      createdAt: '2024-02-01T09:00:00Z',
      lastRun: '2025-01-27T11:25:00Z'
    },
    {
      id: 'algo3',
      name: 'AI Sentiment Trading',
      type: 'CUSTOM',
      category: 'ML_BASED',
      description: 'ML model that trades based on news sentiment and technical indicators',
      pythonCode: `
import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
import ta

class SentimentTradingAlgo:
    def __init__(self, symbol, quantity=10):
        self.symbol = symbol
        self.quantity = quantity
        self.model = RandomForestClassifier(n_estimators=100)
        
    def get_features(self, data, sentiment_score):
        # Technical indicators
        data['rsi'] = ta.momentum.RSIIndicator(data['close']).rsi()
        data['macd'] = ta.trend.MACD(data['close']).macd()
        data['bb_high'] = ta.volatility.BollingerBands(data['close']).bollinger_hband()
        data['bb_low'] = ta.volatility.BollingerBands(data['close']).bollinger_lband()
        
        # Features
        features = {
            'rsi': data['rsi'].iloc[-1],
            'macd': data['macd'].iloc[-1],
            'price_to_bb_high': data['close'].iloc[-1] / data['bb_high'].iloc[-1],
            'price_to_bb_low': data['close'].iloc[-1] / data['bb_low'].iloc[-1],
            'sentiment_score': sentiment_score,
            'volume_ratio': data['volume'].iloc[-1] / data['volume'].rolling(20).mean().iloc[-1]
        }
        return features
        
    def generate_signal(self, data, sentiment_score):
        features = self.get_features(data, sentiment_score)
        
        # Simple rule-based logic (in real implementation, use trained model)
        if (features['sentiment_score'] > 0.7 and 
            features['rsi'] < 70 and 
            features['macd'] > 0):
            return 'BUY', 0.85
        elif (features['sentiment_score'] < -0.5 and 
              features['rsi'] > 30):
            return 'SELL', 0.78
        else:
            return 'HOLD', 0.45
`,
      parameters: {
        symbol: 'INFY',
        quantity: 15,
        sentimentThreshold: 0.7,
        modelRetrain: 7
      },
      status: 'RUNNING',
      performance: {
        totalReturn: 22.7,
        sharpeRatio: 1.89,
        maxDrawdown: -4.8,
        winRate: 78.3,
        totalTrades: 18,
        profitFactor: 2.34
      },
      isActive: true,
      createdAt: '2024-03-10T14:30:00Z',
      lastRun: '2025-01-27T11:20:00Z'
    },
    {
      id: 'algo4',
      name: 'Pairs Trading Strategy',
      type: 'PREDEFINED',
      category: 'ARBITRAGE',
      description: 'Statistical arbitrage between correlated stock pairs',
      parameters: {
        pair1: 'HDFC',
        pair2: 'ICICIBANK',
        lookbackPeriod: 60,
        entryThreshold: 2.0,
        exitThreshold: 0.5,
        quantity: 20
      },
      status: 'PAUSED',
      performance: {
        totalReturn: 8.9,
        sharpeRatio: 1.05,
        maxDrawdown: -3.2,
        winRate: 65.4,
        totalTrades: 12,
        profitFactor: 1.45
      },
      isActive: false,
      createdAt: '2024-04-05T11:00:00Z'
    }
  ]);

  const [executions] = useState<AlgoExecution[]>([
    {
      id: 'exec1',
      algoId: 'algo1',
      algoName: 'Moving Average Crossover',
      symbol: 'RELIANCE',
      action: 'BUY',
      quantity: 10,
      price: 2847.65,
      timestamp: '2025-01-27T11:30:00Z',
      reason: 'Short MA (20) crossed above Long MA (50)',
      confidence: 0.82,
      status: 'EXECUTED'
    },
    {
      id: 'exec2',
      algoId: 'algo3',
      algoName: 'AI Sentiment Trading',
      symbol: 'INFY',
      action: 'BUY',
      quantity: 15,
      price: 1847.90,
      timestamp: '2025-01-27T11:20:00Z',
      reason: 'Positive sentiment (0.78) + bullish technical indicators',
      confidence: 0.85,
      status: 'EXECUTED'
    },
    {
      id: 'exec3',
      algoId: 'algo2',
      algoName: 'RSI Mean Reversion',
      symbol: 'TCS',
      action: 'SELL',
      quantity: 5,
      price: 4125.30,
      timestamp: '2025-01-27T11:25:00Z',
      reason: 'RSI (72.5) above overbought level (70)',
      confidence: 0.76,
      status: 'PENDING'
    }
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'RUNNING': return 'success';
      case 'PAUSED': return 'warning';
      case 'STOPPED': return 'neutral';
      case 'ERROR': return 'danger';
      default: return 'neutral';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'MOMENTUM': return 'blue';
      case 'MEAN_REVERSION': return 'purple';
      case 'ARBITRAGE': return 'orange';
      case 'ML_BASED': return 'ai';
      case 'CUSTOM': return 'brand';
      default: return 'neutral';
    }
  };

  const getPerformanceColor = (value: number, isPercentage = true) => {
    if (isPercentage) {
      return value >= 10 ? 'success.600' : value >= 0 ? 'warning.600' : 'danger.600';
    }
    return value >= 1.5 ? 'success.600' : value >= 1 ? 'warning.600' : 'danger.600';
  };

  const handleStartAlgo = (algoId: string) => {
    console.log('Starting algorithm:', algoId);
    // In real app, this would call Python backend
  };

  const handleStopAlgo = (algoId: string) => {
    console.log('Stopping algorithm:', algoId);
    // In real app, this would call Python backend
  };

  const handleCreateCustomAlgo = () => {
    console.log('Creating custom algorithm with code:', newAlgoCode);
    setIsCodeEditorOpen(false);
    setNewAlgoCode('');
  };

  const predefinedAlgoTemplates = [
    {
      name: 'Bollinger Bands Strategy',
      category: 'MEAN_REVERSION',
      description: 'Buy when price touches lower band, sell at upper band',
      code: `
class BollingerBandsStrategy:
    def __init__(self, symbol, period=20, std_dev=2):
        self.symbol = symbol
        self.period = period
        self.std_dev = std_dev
    
    def generate_signal(self, data):
        # Calculate Bollinger Bands
        sma = data['close'].rolling(self.period).mean()
        std = data['close'].rolling(self.period).std()
        upper_band = sma + (std * self.std_dev)
        lower_band = sma - (std * self.std_dev)
        
        current_price = data['close'].iloc[-1]
        
        if current_price <= lower_band.iloc[-1]:
            return 'BUY', 0.75
        elif current_price >= upper_band.iloc[-1]:
            return 'SELL', 0.75
        else:
            return 'HOLD', 0.5
`
    },
    {
      name: 'MACD Strategy',
      category: 'MOMENTUM',
      description: 'Trade based on MACD line and signal line crossovers',
      code: `
class MACDStrategy:
    def __init__(self, symbol, fast=12, slow=26, signal=9):
        self.symbol = symbol
        self.fast = fast
        self.slow = slow
        self.signal = signal
    
    def generate_signal(self, data):
        # Calculate MACD
        exp1 = data['close'].ewm(span=self.fast).mean()
        exp2 = data['close'].ewm(span=self.slow).mean()
        macd_line = exp1 - exp2
        signal_line = macd_line.ewm(span=self.signal).mean()
        
        if (macd_line.iloc[-1] > signal_line.iloc[-1] and 
            macd_line.iloc[-2] <= signal_line.iloc[-2]):
            return 'BUY', 0.8
        elif (macd_line.iloc[-1] < signal_line.iloc[-1] and 
              macd_line.iloc[-2] >= signal_line.iloc[-2]):
            return 'SELL', 0.8
        else:
            return 'HOLD', 0.5
`
    }
  ];

  return (
    <Box>
      {/* Header */}
      <Card.Root mb={6}>
        <Card.Body>
          <Flex justify="space-between" align="center" mb={4}>
            <Flex align="center" gap={3}>
              <Icon color="ai.600">
                <Code size={24} />
              </Icon>
              <Box>
                <Text textStyle="heading.md" color="neutral.900">
                  Algorithmic Trading
                </Text>
                <Text fontSize="sm" color="neutral.600">
                  Python-powered algorithmic trading with custom and predefined strategies
                </Text>
              </Box>
            </Flex>
            
            <Flex align="center" gap={3}>
              <Box textAlign="right">
                <Text fontSize="xs" color="neutral.600">Python Environment</Text>
                <Flex align="center" gap={2}>
                  <Box 
                    w="8px" 
                    h="8px" 
                    borderRadius="full" 
                    bg={pythonEnv.status === 'CONNECTED' ? 'success.500' : 'danger.500'} 
                  />
                  <Text fontSize="sm" fontWeight="medium" color={pythonEnv.status === 'CONNECTED' ? 'success.600' : 'danger.600'}>
                    {pythonEnv.status} (v{pythonEnv.version})
                  </Text>
                </Flex>
              </Box>
              
              <Button colorPalette="ai" onClick={() => setIsCreateModalOpen(true)}>
                <Icon><Plus size={16} /></Icon>
                Create Algorithm
              </Button>
            </Flex>
          </Flex>

          {/* Quick Stats */}
          <SimpleGrid columns={{ base: 2, md: 4 }} gap={4}>
            <Box textAlign="center">
              <Text fontSize="2xl" fontWeight="bold" color="success.600">4</Text>
              <Text fontSize="sm" color="neutral.600">Active Algorithms</Text>
            </Box>
            <Box textAlign="center">
              <Text fontSize="2xl" fontWeight="bold" color="ai.600">₹47,500</Text>
              <Text fontSize="sm" color="neutral.600">Total Profit</Text>
            </Box>
            <Box textAlign="center">
              <Text fontSize="2xl" fontWeight="bold" color="warning.600">84</Text>
              <Text fontSize="sm" color="neutral.600">Trades Today</Text>
            </Box>
            <Box textAlign="center">
              <Text fontSize="2xl" fontWeight="bold" color="brand.600">73.2%</Text>
              <Text fontSize="sm" color="neutral.600">Win Rate</Text>
            </Box>
          </SimpleGrid>
        </Card.Body>
      </Card.Root>

      <Tabs.Root value={activeTab} onValueChange={(e) => setActiveTab(e.value)}>
        <Tabs.List mb={6}>
          <Tabs.Trigger value="algorithms">Algorithms</Tabs.Trigger>
          <Tabs.Trigger value="executions">Live Executions</Tabs.Trigger>
          <Tabs.Trigger value="backtesting">Backtesting</Tabs.Trigger>
          <Tabs.Trigger value="python">Python Environment</Tabs.Trigger>
        </Tabs.List>

        {/* Algorithms Tab */}
        <Tabs.Content value="algorithms">
          <SimpleGrid columns={{ base: 1, lg: 2 }} gap={6}>
            {algorithms.map((algo) => (
              <Card.Root key={algo.id} layerStyle={algo.type === 'CUSTOM' ? 'card.ai' : undefined}>
                <Card.Body>
                  <Flex justify="space-between" align="flex-start" mb={3}>
                    <Box flex={1}>
                      <Flex align="center" gap={2} mb={2}>
                        <Icon color={`${getCategoryColor(algo.category)}.600`}>
                          {algo.type === 'CUSTOM' ? <Brain size={16} /> : <BarChart3 size={16} />}
                        </Icon>
                        <Text fontWeight="semibold" color="neutral.900">
                          {algo.name}
                        </Text>
                        <Badge colorPalette={getCategoryColor(algo.category)} size="sm">
                          {algo.category}
                        </Badge>
                      </Flex>
                      <Text fontSize="sm" color="neutral.700" mb={2}>
                        {algo.description}
                      </Text>
                    </Box>
                    <Badge colorPalette={getStatusColor(algo.status)} size="sm">
                      {algo.status}
                    </Badge>
                  </Flex>

                  {/* Performance Metrics */}
                  <SimpleGrid columns={3} gap={3} mb={4}>
                    <Box textAlign="center">
                      <Text fontSize="xs" color="neutral.600">Total Return</Text>
                      <Text 
                        fontSize="sm" 
                        fontWeight="bold" 
                        color={getPerformanceColor(algo.performance.totalReturn)}
                      >
                        {formatPercentage(algo.performance.totalReturn)}
                      </Text>
                    </Box>
                    <Box textAlign="center">
                      <Text fontSize="xs" color="neutral.600">Sharpe Ratio</Text>
                      <Text 
                        fontSize="sm" 
                        fontWeight="bold" 
                        color={getPerformanceColor(algo.performance.sharpeRatio, false)}
                      >
                        {algo.performance.sharpeRatio.toFixed(2)}
                      </Text>
                    </Box>
                    <Box textAlign="center">
                      <Text fontSize="xs" color="neutral.600">Win Rate</Text>
                      <Text 
                        fontSize="sm" 
                        fontWeight="bold" 
                        color={getPerformanceColor(algo.performance.winRate)}
                      >
                        {algo.performance.winRate.toFixed(1)}%
                      </Text>
                    </Box>
                  </SimpleGrid>

                  {/* Parameters */}
                  <Box mb={4}>
                    <Text fontSize="sm" fontWeight="medium" color="neutral.800" mb={2}>
                      Parameters
                    </Text>
                    <Box bg="neutral.50" p={3} borderRadius="md">
                      {Object.entries(algo.parameters).map(([key, value]) => (
                        <Flex key={key} justify="space-between" fontSize="xs" mb={1}>
                          <Text color="neutral.600">{key}:</Text>
                          <Text fontWeight="medium">{String(value)}</Text>
                        </Flex>
                      ))}
                    </Box>
                  </Box>

                  {/* Controls */}
                  <Flex justify="space-between" align="center">
                    <Flex align="center" gap={2}>
                      <Switch.Root 
                        checked={algo.isActive}
                        size="sm"
                      >
                        <Switch.Control>
                          <Switch.Thumb />
                        </Switch.Control>
                      </Switch.Root>
                      <Text fontSize="xs" color={algo.isActive ? 'success.600' : 'neutral.500'}>
                        {algo.isActive ? 'Active' : 'Inactive'}
                      </Text>
                    </Flex>
                    
                    <Flex gap={2}>
                      {algo.status === 'RUNNING' ? (
                        <Button 
                          size="sm" 
                          colorPalette="warning"
                          onClick={() => handleStopAlgo(algo.id)}
                        >
                          <Icon><Pause size={14} /></Icon>
                        </Button>
                      ) : (
                        <Button 
                          size="sm" 
                          colorPalette="success"
                          onClick={() => handleStartAlgo(algo.id)}
                        >
                          <Icon><Play size={14} /></Icon>
                        </Button>
                      )}
                      
                      <Button size="sm" variant="outline">
                        <Icon><Settings size={14} /></Icon>
                      </Button>
                      
                      {algo.type === 'CUSTOM' && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => {
                            setSelectedAlgo(algo);
                            setNewAlgoCode(algo.pythonCode || '');
                            setIsCodeEditorOpen(true);
                          }}
                        >
                          <Icon><FileCode size={14} /></Icon>
                        </Button>
                      )}
                    </Flex>
                  </Flex>

                  {algo.lastRun && (
                    <Text fontSize="xs" color="neutral.500" mt={2}>
                      Last run: {new Date(algo.lastRun).toLocaleString()}
                    </Text>
                  )}
                </Card.Body>
              </Card.Root>
            ))}
          </SimpleGrid>
        </Tabs.Content>

        {/* Live Executions Tab */}
        <Tabs.Content value="executions">
          <Card.Root>
            <Card.Body>
              <Text fontWeight="semibold" color="neutral.900" mb={4}>
                Live Algorithm Executions
              </Text>
              
              <Table.Root>
                <Table.Header>
                  <Table.Row>
                    <Table.ColumnHeader>Time</Table.ColumnHeader>
                    <Table.ColumnHeader>Algorithm</Table.ColumnHeader>
                    <Table.ColumnHeader>Action</Table.ColumnHeader>
                    <Table.ColumnHeader>Symbol</Table.ColumnHeader>
                    <Table.ColumnHeader>Quantity</Table.ColumnHeader>
                    <Table.ColumnHeader>Price</Table.ColumnHeader>
                    <Table.ColumnHeader>Confidence</Table.ColumnHeader>
                    <Table.ColumnHeader>Status</Table.ColumnHeader>
                    <Table.ColumnHeader>Reason</Table.ColumnHeader>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {executions.map((execution) => (
                    <Table.Row key={execution.id}>
                      <Table.Cell>
                        <Text fontSize="sm">
                          {new Date(execution.timestamp).toLocaleTimeString()}
                        </Text>
                      </Table.Cell>
                      <Table.Cell>
                        <Text fontSize="sm" fontWeight="medium">
                          {execution.algoName}
                        </Text>
                      </Table.Cell>
                      <Table.Cell>
                        <Badge 
                          colorPalette={execution.action === 'BUY' ? 'success' : 'danger'} 
                          size="sm"
                        >
                          {execution.action}
                        </Badge>
                      </Table.Cell>
                      <Table.Cell>
                        <Text fontSize="sm" fontWeight="medium">
                          {execution.symbol}
                        </Text>
                      </Table.Cell>
                      <Table.Cell>
                        <Text fontSize="sm">
                          {execution.quantity}
                        </Text>
                      </Table.Cell>
                      <Table.Cell>
                        <Text fontSize="sm">
                          {formatCurrency(execution.price)}
                        </Text>
                      </Table.Cell>
                      <Table.Cell>
                        <Flex align="center" gap={2}>
                          <Text fontSize="sm" fontWeight="bold" color="ai.600">
                            {(execution.confidence * 100).toFixed(0)}%
                          </Text>
                          <Box w="30px" bg="neutral.200" borderRadius="full" h="3px">
                            <Box 
                              bg="ai.500" 
                              h="3px" 
                              borderRadius="full" 
                              w={`${execution.confidence * 100}%`} 
                            />
                          </Box>
                        </Flex>
                      </Table.Cell>
                      <Table.Cell>
                        <Badge 
                          colorPalette={
                            execution.status === 'EXECUTED' ? 'success' : 
                            execution.status === 'PENDING' ? 'warning' : 'danger'
                          } 
                          size="sm"
                        >
                          {execution.status}
                        </Badge>
                      </Table.Cell>
                      <Table.Cell>
                        <Text fontSize="xs" color="neutral.600" maxW="200px" lineClamp={2}>
                          {execution.reason}
                        </Text>
                      </Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table.Root>
            </Card.Body>
          </Card.Root>
        </Tabs.Content>

        {/* Backtesting Tab */}
        <Tabs.Content value="backtesting">
          <SimpleGrid columns={{ base: 1, lg: 2 }} gap={6}>
            <Card.Root>
              <Card.Body>
                <Text fontWeight="semibold" color="neutral.900" mb={4}>
                  Backtest Results
                </Text>
                
                {algorithms.filter(a => a.backtestResults).map((algo) => (
                  <Box key={algo.id} p={4} bg="neutral.50" borderRadius="md" mb={4}>
                    <Flex justify="space-between" align="center" mb={3}>
                      <Text fontWeight="medium" color="neutral.800">
                        {algo.name}
                      </Text>
                      <Badge colorPalette={getCategoryColor(algo.category)} size="sm">
                        {algo.category}
                      </Badge>
                    </Flex>
                    
                    {algo.backtestResults && (
                      <SimpleGrid columns={2} gap={3}>
                        <Box>
                          <Text fontSize="xs" color="neutral.600">Period</Text>
                          <Text fontSize="sm" fontWeight="medium">
                            {new Date(algo.backtestResults.startDate).getFullYear()} - {new Date(algo.backtestResults.endDate).getFullYear()}
                          </Text>
                        </Box>
                        <Box>
                          <Text fontSize="xs" color="neutral.600">Total Return</Text>
                          <Text fontSize="sm" fontWeight="bold" color="success.600">
                            {formatPercentage((algo.backtestResults.finalValue - algo.backtestResults.initialCapital) / algo.backtestResults.initialCapital * 100)}
                          </Text>
                        </Box>
                        <Box>
                          <Text fontSize="xs" color="neutral.600">Total Trades</Text>
                          <Text fontSize="sm" fontWeight="medium">
                            {algo.backtestResults.trades}
                          </Text>
                        </Box>
                        <Box>
                          <Text fontSize="xs" color="neutral.600">Avg Return/Trade</Text>
                          <Text fontSize="sm" fontWeight="medium" color="success.600">
                            {formatPercentage(algo.backtestResults.avgReturn)}
                          </Text>
                        </Box>
                      </SimpleGrid>
                    )}
                  </Box>
                ))}
              </Card.Body>
            </Card.Root>

            <Card.Root>
              <Card.Body>
                <Text fontWeight="semibold" color="neutral.900" mb={4}>
                  Run New Backtest
                </Text>
                
                <Stack gap={4}>
                  <Box>
                    <Text fontSize="sm" fontWeight="medium" color="neutral.700" mb={2}>
                      Select Algorithm
                    </Text>
                    <Select.Root collection={createListCollection({ items: algorithms.map(a => ({ value: a.id, label: a.name })) })}>
                      <Select.Trigger>
                        <Select.ValueText placeholder="Choose algorithm" />
                      </Select.Trigger>
                      <Select.Content>
                        {algorithms.map((algo) => (
                          <Select.Item key={algo.id} item={algo.id}>
                            {algo.name}
                          </Select.Item>
                        ))}
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
                    <Input type="number" placeholder="100000" />
                  </Box>

                  <Button colorPalette="ai">
                    <Icon><Play size={16} /></Icon>
                    Run Backtest
                  </Button>
                </Stack>
              </Card.Body>
            </Card.Root>
          </SimpleGrid>
        </Tabs.Content>

        {/* Python Environment Tab */}
        <Tabs.Content value="python">
          <SimpleGrid columns={{ base: 1, lg: 2 }} gap={6}>
            <Card.Root>
              <Card.Body>
                <Text fontWeight="semibold" color="neutral.900" mb={4}>
                  Python Environment Status
                </Text>
                
                <Stack gap={4}>
                  <Box p={4} bg={pythonEnv.status === 'CONNECTED' ? 'success.50' : 'danger.50'} borderRadius="md">
                    <Flex align="center" gap={3} mb={2}>
                      <Icon color={pythonEnv.status === 'CONNECTED' ? 'success.600' : 'danger.600'}>
                        {pythonEnv.status === 'CONNECTED' ? <CheckCircle size={20} /> : <AlertTriangle size={20} />}
                      </Icon>
                      <Text fontWeight="medium" color={pythonEnv.status === 'CONNECTED' ? 'success.800' : 'danger.800'}>
                        Python {pythonEnv.version} - {pythonEnv.status}
                      </Text>
                    </Flex>
                    <Text fontSize="sm" color="neutral.700">
                      Last health check: {new Date(pythonEnv.lastHealthCheck).toLocaleString()}
                    </Text>
                  </Box>

                  <Box>
                    <Text fontWeight="medium" color="neutral.800" mb={3}>
                      Installed Libraries
                    </Text>
                    <SimpleGrid columns={2} gap={2}>
                      {pythonEnv.libraries.map((lib) => (
                        <Badge key={lib} colorPalette="success" size="sm">
                          {lib}
                        </Badge>
                      ))}
                    </SimpleGrid>
                  </Box>

                  <Alert.Root status="info">
                    <Alert.Indicator />
                    <Box>
                      <Alert.Title>Environment Ready</Alert.Title>
                      <Text fontSize="sm">
                        All required libraries are installed and ready for algorithmic trading.
                      </Text>
                    </Box>
                  </Alert.Root>
                </Stack>
              </Card.Body>
            </Card.Root>

            <Card.Root>
              <Card.Body>
                <Text fontWeight="semibold" color="neutral.900" mb={4}>
                  System Resources
                </Text>
                
                <Stack gap={4}>
                  <Box>
                    <Flex justify="space-between" mb={2}>
                      <Text fontSize="sm" color="neutral.700">CPU Usage</Text>
                      <Text fontSize="sm" fontWeight="bold">23%</Text>
                    </Flex>
                    <Progress.Root value={23} colorPalette="success">
                      <Progress.Track><Progress.Range /></Progress.Track>
                    </Progress.Root>
                  </Box>

                  <Box>
                    <Flex justify="space-between" mb={2}>
                      <Text fontSize="sm" color="neutral.700">Memory Usage</Text>
                      <Text fontSize="sm" fontWeight="bold">45%</Text>
                    </Flex>
                    <Progress.Root value={45} colorPalette="warning">
                      <Progress.Track><Progress.Range /></Progress.Track>
                    </Progress.Root>
                  </Box>

                  <Box>
                    <Flex justify="space-between" mb={2}>
                      <Text fontSize="sm" color="neutral.700">Active Algorithms</Text>
                      <Text fontSize="sm" fontWeight="bold">3</Text>
                    </Flex>
                    <Progress.Root value={75} colorPalette="ai">
                      <Progress.Track><Progress.Range /></Progress.Track>
                    </Progress.Root>
                  </Box>

                  <Button variant="outline" colorPalette="ai">
                    <Icon><Activity size={16} /></Icon>
                    View Detailed Logs
                  </Button>
                </Stack>
              </Card.Body>
            </Card.Root>
          </SimpleGrid>
        </Tabs.Content>
      </Tabs.Root>

      {/* Create Algorithm Modal */}
      <Dialog.Root open={isCreateModalOpen} onOpenChange={(details) => setIsCreateModalOpen(details.open)}>
        <Dialog.Content>
          <Dialog.Header>
            <Dialog.Title>Create New Algorithm</Dialog.Title>
          </Dialog.Header>
          <Dialog.Body>
            <Stack gap={4}>
              <Box>
                <Text fontSize="sm" fontWeight="medium" color="neutral.700" mb={2}>
                  Algorithm Type
                </Text>
                <Select.Root collection={createListCollection({ items: [{ value: 'predefined', label: 'Predefined Strategy' }, { value: 'custom', label: 'Custom Python Code' }] })}>
                  <Select.Trigger>
                    <Select.ValueText placeholder="Choose type" />
                  </Select.Trigger>
                  <Select.Content>
                    <Select.Item item="predefined">Predefined Strategy</Select.Item>
                    <Select.Item item="custom">Custom Python Code</Select.Item>
                  </Select.Content>
                </Select.Root>
              </Box>

              <Box>
                <Text fontSize="sm" fontWeight="medium" color="neutral.700" mb={2}>
                  Strategy Template
                </Text>
                <Select.Root collection={createListCollection({ items: predefinedAlgoTemplates.map(t => ({ value: t.name, label: t.name })) })}>
                  <Select.Trigger>
                    <Select.ValueText placeholder="Select template" />
                  </Select.Trigger>
                  <Select.Content>
                    {predefinedAlgoTemplates.map((template, index) => (
                      <Select.Item key={index} item={template.name}>
                        {template.name}
                      </Select.Item>
                    ))}
                  </Select.Content>
                </Select.Root>
              </Box>

              <Box>
                <Text fontSize="sm" fontWeight="medium" color="neutral.700" mb={2}>
                  Algorithm Name
                </Text>
                <Input placeholder="Enter algorithm name" />
              </Box>
            </Stack>
          </Dialog.Body>
          <Dialog.Footer>
            <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button colorPalette="ai" onClick={() => {
              setIsCreateModalOpen(false);
              setIsCodeEditorOpen(true);
            }}>
              Create & Edit Code
            </Button>
          </Dialog.Footer>
        </Dialog.Content>
      </Dialog.Root>

      {/* Code Editor Modal */}
      <Dialog.Root open={isCodeEditorOpen} onOpenChange={(details) => setIsCodeEditorOpen(details.open)} size="xl">
        <Dialog.Content>
          <Dialog.Header>
            <Dialog.Title>
              {selectedAlgo ? `Edit ${selectedAlgo.name}` : 'Create Custom Algorithm'}
            </Dialog.Title>
          </Dialog.Header>
          <Dialog.Body>
            <Box>
              <Text fontSize="sm" fontWeight="medium" color="neutral.700" mb={2}>
                Python Code
              </Text>
              <Textarea
                value={newAlgoCode}
                onChange={(e) => setNewAlgoCode(e.target.value)}
                placeholder="Enter your Python algorithm code here..."
                rows={20}
                fontFamily="mono"
                fontSize="sm"
              />
              <Text fontSize="xs" color="neutral.600" mt={2}>
                Your algorithm should implement a generate_signal method that returns action and confidence.
              </Text>
            </Box>
          </Dialog.Body>
          <Dialog.Footer>
            <Button variant="outline" onClick={() => setIsCodeEditorOpen(false)}>
              Cancel
            </Button>
            <Button colorPalette="ai" onClick={handleCreateCustomAlgo}>
              Save Algorithm
            </Button>
          </Dialog.Footer>
        </Dialog.Content>
      </Dialog.Root>
    </Box>
  );
};