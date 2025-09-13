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
  Progress,
  Stack,
  Tabs,
  Alert,
  Table,
  Select,
  createListCollection
} from '@chakra-ui/react';
import { 
  Brain, 
  Target, 
  TrendingUp,
  PieChart,
  Shield,
  Zap,
  BarChart3,
  RefreshCw,

  AlertTriangle,
  DollarSign
} from 'lucide-react';
import { formatCurrency, formatPercentage } from '../../utils/formatters';
import { RiskLevel } from '../../types/enums';
import { AIConfidenceIndicator } from '../common/AIConfidenceIndicator';

interface OptimizationSuggestion {
  id: string;
  type: 'REBALANCE' | 'ADD_POSITION' | 'REDUCE_POSITION' | 'SECTOR_ROTATE' | 'TAX_HARVEST';
  title: string;
  description: string;
  impact: {
    expectedReturn: number;
    riskReduction: number;
    taxSavings?: number;
  };
  confidence: number;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  actions: Array<{
    symbol: string;
    action: 'BUY' | 'SELL';
    quantity: number;
    currentWeight: number;
    targetWeight: number;
  }>;
}

interface PortfolioMetrics {
  currentValue: number;
  expectedReturn: number;
  volatility: number;
  sharpeRatio: number;
  maxDrawdown: number;
  diversificationRatio: number;
  riskLevel: RiskLevel;
  sectorAllocation: Array<{
    sector: string;
    currentWeight: number;
    targetWeight: number;
    deviation: number;
  }>;
}

export const PortfolioOptimizer: React.FC = () => {
  const [activeTab, setActiveTab] = useState('optimization');
  const [optimizationRunning, setOptimizationRunning] = useState(false);
  const [riskTolerance, setRiskTolerance] = useState('MODERATE');


  const [portfolioMetrics] = useState<PortfolioMetrics>({
    currentValue: 547500,
    expectedReturn: 12.5,
    volatility: 18.2,
    sharpeRatio: 0.68,
    maxDrawdown: -15.3,
    diversificationRatio: 0.72,
    riskLevel: RiskLevel.MODERATE,
    sectorAllocation: [
      { sector: 'Technology', currentWeight: 35, targetWeight: 25, deviation: 10 },
      { sector: 'Banking', currentWeight: 25, targetWeight: 30, deviation: -5 },
      { sector: 'Healthcare', currentWeight: 15, targetWeight: 20, deviation: -5 },
      { sector: 'Energy', currentWeight: 20, targetWeight: 15, deviation: 5 },
      { sector: 'Consumer', currentWeight: 5, targetWeight: 10, deviation: -5 }
    ]
  });

  const [optimizationSuggestions] = useState<OptimizationSuggestion[]>([
    {
      id: 'opt1',
      type: 'REBALANCE',
      title: 'Rebalance Technology Exposure',
      description: 'Reduce overweight technology position to improve diversification',
      impact: {
        expectedReturn: 0.8,
        riskReduction: 2.1
      },
      confidence: 0.85,
      priority: 'HIGH',
      actions: [
        { symbol: 'TCS', action: 'SELL', quantity: 10, currentWeight: 15, targetWeight: 12 },
        { symbol: 'INFY', action: 'SELL', quantity: 5, currentWeight: 12, targetWeight: 10 },
        { symbol: 'HDFC', action: 'BUY', quantity: 15, currentWeight: 18, targetWeight: 22 }
      ]
    },
    {
      id: 'opt2',
      type: 'SECTOR_ROTATE',
      title: 'Healthcare Sector Opportunity',
      description: 'AI detects undervaluation in healthcare sector with strong fundamentals',
      impact: {
        expectedReturn: 2.3,
        riskReduction: 0.5
      },
      confidence: 0.78,
      priority: 'HIGH',
      actions: [
        { symbol: 'SUNPHARMA', action: 'BUY', quantity: 20, currentWeight: 0, targetWeight: 8 },
        { symbol: 'DRREDDY', action: 'BUY', quantity: 15, currentWeight: 0, targetWeight: 6 }
      ]
    },
    {
      id: 'opt3',
      type: 'TAX_HARVEST',
      title: 'Tax Loss Harvesting Opportunity',
      description: 'Realize losses in underperforming positions to offset gains',
      impact: {
        expectedReturn: 0.2,
        riskReduction: 0.1,
        taxSavings: 15000
      },
      confidence: 0.92,
      priority: 'MEDIUM',
      actions: [
        { symbol: 'WIPRO', action: 'SELL', quantity: 25, currentWeight: 8, targetWeight: 0 }
      ]
    }
  ]);

  const runOptimization = async () => {
    setOptimizationRunning(true);
    // Simulate AI optimization process
    await new Promise(resolve => setTimeout(resolve, 3000));
    setOptimizationRunning(false);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HIGH': return 'danger';
      case 'MEDIUM': return 'warning';
      default: return 'neutral';
    }
  };

  const getMetricColor = (value: number, threshold: { good: number; warning: number }) => {
    if (value >= threshold.good) return 'success.600';
    if (value >= threshold.warning) return 'warning.600';
    return 'danger.600';
  };

  return (
    <Box>
      {/* Header */}
      <Card.Root mb={6}>
        <Card.Body>
          <Flex justify="space-between" align="center" mb={4}>
            <Flex align="center" gap={3}>
              <Icon color="ai.600">
                <Brain size={24} />
              </Icon>
              <Box>
                <Text textStyle="heading.md" color="neutral.900">
                  AI Portfolio Optimizer
                </Text>
                <Text fontSize="sm" color="neutral.600">
                  Maximize returns while managing risk with AI-powered optimization
                </Text>
              </Box>
            </Flex>
            
            <Flex align="center" gap={3}>
              <Select.Root 
                collection={createListCollection({
                  items: [
                    { label: 'Conservative', value: 'CONSERVATIVE' },
                    { label: 'Moderate', value: 'MODERATE' },
                    { label: 'Aggressive', value: 'AGGRESSIVE' }
                  ]
                })}
                value={[riskTolerance]} 
                onValueChange={(e) => setRiskTolerance(e.value[0])}
              >
                <Select.Trigger minW="140px">
                  <Select.ValueText />
                </Select.Trigger>
                <Select.Content>
                  <Select.Item item="CONSERVATIVE">Conservative</Select.Item>
                  <Select.Item item="MODERATE">Moderate</Select.Item>
                  <Select.Item item="AGGRESSIVE">Aggressive</Select.Item>
                </Select.Content>
              </Select.Root>
              
              <Button 
                colorPalette="ai" 
                onClick={runOptimization}
                loading={optimizationRunning}
                loadingText="Optimizing..."
              >
                <Icon><RefreshCw size={16} /></Icon>
                Optimize Portfolio
              </Button>
            </Flex>
          </Flex>
        </Card.Body>
      </Card.Root>

      <Tabs.Root value={activeTab} onValueChange={(e) => setActiveTab(e.value)}>
        <Tabs.List mb={6}>
          <Tabs.Trigger value="optimization">Optimization</Tabs.Trigger>
          <Tabs.Trigger value="metrics">Portfolio Metrics</Tabs.Trigger>
          <Tabs.Trigger value="allocation">Asset Allocation</Tabs.Trigger>
          <Tabs.Trigger value="backtesting">Backtesting</Tabs.Trigger>
        </Tabs.List>

        {/* Optimization Tab */}
        <Tabs.Content value="optimization">
          <SimpleGrid columns={{ base: 1, lg: 2 }} gap={6}>
            {/* Optimization Suggestions */}
            <Card.Root>
              <Card.Body>
                <Flex align="center" gap={2} mb={4}>
                  <Icon color="ai.600"><Target size={20} /></Icon>
                  <Text fontWeight="semibold">AI Optimization Suggestions</Text>
                </Flex>
                
                <Stack gap={4}>
                  {optimizationSuggestions.map((suggestion) => (
                    <Box
                      key={suggestion.id}
                      p={4}
                      bg="ai.50"
                      borderRadius="md"
                      border="1px solid"
                      borderColor="ai.200"
                    >
                      <Flex justify="space-between" align="flex-start" mb={2}>
                        <Box flex={1}>
                          <Flex align="center" gap={2} mb={1}>
                            <Text fontWeight="semibold" color="ai.800">
                              {suggestion.title}
                            </Text>
                            <Badge colorPalette={getPriorityColor(suggestion.priority)} size="sm">
                              {suggestion.priority}
                            </Badge>
                          </Flex>
                          <Text fontSize="sm" color="neutral.700" mb={2}>
                            {suggestion.description}
                          </Text>
                        </Box>
                      </Flex>

                      <SimpleGrid columns={3} gap={3} mb={3}>
                        <Box textAlign="center">
                          <Text fontSize="xs" color="neutral.600">Expected Return</Text>
                          <Text fontSize="sm" fontWeight="bold" color="success.600">
                            +{formatPercentage(suggestion.impact.expectedReturn)}
                          </Text>
                        </Box>
                        <Box textAlign="center">
                          <Text fontSize="xs" color="neutral.600">Risk Reduction</Text>
                          <Text fontSize="sm" fontWeight="bold" color="ai.600">
                            -{formatPercentage(suggestion.impact.riskReduction)}
                          </Text>
                        </Box>
                        {suggestion.impact.taxSavings && (
                          <Box textAlign="center">
                            <Text fontSize="xs" color="neutral.600">Tax Savings</Text>
                            <Text fontSize="sm" fontWeight="bold" color="success.600">
                              {formatCurrency(suggestion.impact.taxSavings)}
                            </Text>
                          </Box>
                        )}
                      </SimpleGrid>

                      <Flex justify="space-between" align="center">
                        <AIConfidenceIndicator 
                          confidence={suggestion.confidence}
                          size="sm"
                        />
                        <Button size="sm" colorPalette="ai">
                          Apply Changes
                        </Button>
                      </Flex>
                    </Box>
                  ))}
                </Stack>
              </Card.Body>
            </Card.Root>

            {/* Quick Actions */}
            <Stack gap={6}>
              {/* Portfolio Health Score */}
              <Card.Root layerStyle="card.ai">
                <Card.Body>
                  <Flex align="center" gap={2} mb={4}>
                    <Icon color="ai.600"><Shield size={20} /></Icon>
                    <Text fontWeight="semibold" color="ai.800">Portfolio Health Score</Text>
                  </Flex>
                  
                  <Box textAlign="center" mb={4}>
                    <Text fontSize="3xl" fontWeight="bold" color="ai.600">
                      78
                    </Text>
                    <Text fontSize="sm" color="ai.700">
                      Good - Room for improvement
                    </Text>
                  </Box>

                  <Stack gap={2}>
                    <Flex justify="space-between" align="center">
                      <Text fontSize="sm" color="ai.700">Diversification</Text>
                      <Text fontSize="sm" fontWeight="medium" color="success.600">85%</Text>
                    </Flex>
                    <Progress.Root value={85} colorPalette="success" size="sm">
                      <Progress.Track><Progress.Range /></Progress.Track>
                    </Progress.Root>

                    <Flex justify="space-between" align="center">
                      <Text fontSize="sm" color="ai.700">Risk Management</Text>
                      <Text fontSize="sm" fontWeight="medium" color="warning.600">72%</Text>
                    </Flex>
                    <Progress.Root value={72} colorPalette="warning" size="sm">
                      <Progress.Track><Progress.Range /></Progress.Track>
                    </Progress.Root>

                    <Flex justify="space-between" align="center">
                      <Text fontSize="sm" color="ai.700">Cost Efficiency</Text>
                      <Text fontSize="sm" fontWeight="medium" color="success.600">91%</Text>
                    </Flex>
                    <Progress.Root value={91} colorPalette="success" size="sm">
                      <Progress.Track><Progress.Range /></Progress.Track>
                    </Progress.Root>
                  </Stack>
                </Card.Body>
              </Card.Root>

              {/* Quick Optimization Actions */}
              <Card.Root>
                <Card.Body>
                  <Text fontWeight="semibold" color="neutral.900" mb={4}>
                    Quick Actions
                  </Text>
                  
                  <Stack gap={3}>
                    <Button variant="outline" size="sm" justifyContent="flex-start">
                      <Icon><PieChart size={16} /></Icon>
                      Auto-Rebalance Portfolio
                    </Button>
                    <Button variant="outline" size="sm" justifyContent="flex-start">
                      <Icon><TrendingUp size={16} /></Icon>
                      Optimize for Growth
                    </Button>
                    <Button variant="outline" size="sm" justifyContent="flex-start">
                      <Icon><Shield size={16} /></Icon>
                      Reduce Risk Exposure
                    </Button>
                    <Button variant="outline" size="sm" justifyContent="flex-start">
                      <Icon><DollarSign size={16} /></Icon>
                      Tax Loss Harvesting
                    </Button>
                  </Stack>
                </Card.Body>
              </Card.Root>
            </Stack>
          </SimpleGrid>
        </Tabs.Content>

        {/* Portfolio Metrics Tab */}
        <Tabs.Content value="metrics">
          <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} gap={6} mb={6}>
            <Card.Root>
              <Card.Body textAlign="center">
                <Icon color="success.600" mb={2}>
                  <TrendingUp size={24} />
                </Icon>
                <Text fontSize="sm" color="neutral.600">Expected Return</Text>
                <Text fontSize="2xl" fontWeight="bold" color="success.600">
                  {formatPercentage(portfolioMetrics.expectedReturn)}
                </Text>
              </Card.Body>
            </Card.Root>

            <Card.Root>
              <Card.Body textAlign="center">
                <Icon color="warning.600" mb={2}>
                  <BarChart3 size={24} />
                </Icon>
                <Text fontSize="sm" color="neutral.600">Volatility</Text>
                <Text fontSize="2xl" fontWeight="bold" color="warning.600">
                  {formatPercentage(portfolioMetrics.volatility)}
                </Text>
              </Card.Body>
            </Card.Root>

            <Card.Root>
              <Card.Body textAlign="center">
                <Icon color="ai.600" mb={2}>
                  <Zap size={24} />
                </Icon>
                <Text fontSize="sm" color="neutral.600">Sharpe Ratio</Text>
                <Text fontSize="2xl" fontWeight="bold" color={getMetricColor(portfolioMetrics.sharpeRatio, { good: 1, warning: 0.5 })}>
                  {portfolioMetrics.sharpeRatio.toFixed(2)}
                </Text>
              </Card.Body>
            </Card.Root>

            <Card.Root>
              <Card.Body textAlign="center">
                <Icon color="danger.600" mb={2}>
                  <AlertTriangle size={24} />
                </Icon>
                <Text fontSize="sm" color="neutral.600">Max Drawdown</Text>
                <Text fontSize="2xl" fontWeight="bold" color="danger.600">
                  {formatPercentage(portfolioMetrics.maxDrawdown)}
                </Text>
              </Card.Body>
            </Card.Root>
          </SimpleGrid>

          {/* Detailed Metrics */}
          <Card.Root>
            <Card.Body>
              <Text fontWeight="semibold" color="neutral.900" mb={4}>
                Risk-Return Analysis
              </Text>
              
              <Alert.Root status="info" mb={4}>
                <Alert.Indicator />
                <Box>
                  <Alert.Title>Portfolio Assessment</Alert.Title>
                  <Text fontSize="sm">
                    Your portfolio shows moderate risk with good diversification. 
                    Consider reducing technology exposure for better balance.
                  </Text>
                </Box>
              </Alert.Root>

              <SimpleGrid columns={{ base: 1, md: 2 }} gap={6}>
                <Box>
                  <Text fontWeight="medium" color="neutral.800" mb={3}>
                    Risk Metrics
                  </Text>
                  <Stack gap={2}>
                    <Flex justify="space-between">
                      <Text fontSize="sm" color="neutral.600">Value at Risk (95%)</Text>
                      <Text fontSize="sm" fontWeight="medium">-8.2%</Text>
                    </Flex>
                    <Flex justify="space-between">
                      <Text fontSize="sm" color="neutral.600">Beta</Text>
                      <Text fontSize="sm" fontWeight="medium">1.15</Text>
                    </Flex>
                    <Flex justify="space-between">
                      <Text fontSize="sm" color="neutral.600">Alpha</Text>
                      <Text fontSize="sm" fontWeight="medium" color="success.600">2.3%</Text>
                    </Flex>
                    <Flex justify="space-between">
                      <Text fontSize="sm" color="neutral.600">Information Ratio</Text>
                      <Text fontSize="sm" fontWeight="medium">0.45</Text>
                    </Flex>
                  </Stack>
                </Box>

                <Box>
                  <Text fontWeight="medium" color="neutral.800" mb={3}>
                    Performance Metrics
                  </Text>
                  <Stack gap={2}>
                    <Flex justify="space-between">
                      <Text fontSize="sm" color="neutral.600">Annualized Return</Text>
                      <Text fontSize="sm" fontWeight="medium" color="success.600">12.5%</Text>
                    </Flex>
                    <Flex justify="space-between">
                      <Text fontSize="sm" color="neutral.600">Tracking Error</Text>
                      <Text fontSize="sm" fontWeight="medium">4.2%</Text>
                    </Flex>
                    <Flex justify="space-between">
                      <Text fontSize="sm" color="neutral.600">Calmar Ratio</Text>
                      <Text fontSize="sm" fontWeight="medium">0.82</Text>
                    </Flex>
                    <Flex justify="space-between">
                      <Text fontSize="sm" color="neutral.600">Sortino Ratio</Text>
                      <Text fontSize="sm" fontWeight="medium">0.91</Text>
                    </Flex>
                  </Stack>
                </Box>
              </SimpleGrid>
            </Card.Body>
          </Card.Root>
        </Tabs.Content>

        {/* Asset Allocation Tab */}
        <Tabs.Content value="allocation">
          <Card.Root>
            <Card.Body>
              <Text fontWeight="semibold" color="neutral.900" mb={4}>
                Sector Allocation vs Target
              </Text>
              
              <Table.Root variant="outline">
                <Table.Header>
                  <Table.Row>
                    <Table.ColumnHeader>Sector</Table.ColumnHeader>
                    <Table.ColumnHeader>Current</Table.ColumnHeader>
                    <Table.ColumnHeader>Target</Table.ColumnHeader>
                    <Table.ColumnHeader>Deviation</Table.ColumnHeader>
                    <Table.ColumnHeader>Action</Table.ColumnHeader>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {portfolioMetrics.sectorAllocation.map((sector) => (
                    <Table.Row key={sector.sector}>
                      <Table.Cell>
                        <Text fontWeight="medium">{sector.sector}</Text>
                      </Table.Cell>
                      <Table.Cell>
                        <Flex align="center" gap={2}>
                          <Text>{sector.currentWeight}%</Text>
                          <Progress.Root 
                            value={sector.currentWeight} 
                            size="sm" 
                            w="60px"
                            colorPalette="ai"
                          >
                            <Progress.Track><Progress.Range /></Progress.Track>
                          </Progress.Root>
                        </Flex>
                      </Table.Cell>
                      <Table.Cell>
                        <Text color="neutral.600">{sector.targetWeight}%</Text>
                      </Table.Cell>
                      <Table.Cell>
                        <Text 
                          color={sector.deviation > 0 ? 'danger.600' : sector.deviation < 0 ? 'warning.600' : 'success.600'}
                          fontWeight="medium"
                        >
                          {sector.deviation > 0 ? '+' : ''}{sector.deviation}%
                        </Text>
                      </Table.Cell>
                      <Table.Cell>
                        {Math.abs(sector.deviation) > 3 && (
                          <Badge 
                            colorPalette={sector.deviation > 0 ? 'danger' : 'warning'} 
                            size="sm"
                          >
                            {sector.deviation > 0 ? 'Reduce' : 'Increase'}
                          </Badge>
                        )}
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
          <Card.Root>
            <Card.Body>
              <Flex justify="space-between" align="center" mb={4}>
                <Text fontWeight="semibold" color="neutral.900">
                  Strategy Backtesting
                </Text>
                <Button colorPalette="ai" size="sm">
                  Run Backtest
                </Button>
              </Flex>
              
              <Alert.Root status="info">
                <Alert.Indicator />
                <Box>
                  <Alert.Title>Backtesting Results</Alert.Title>
                  <Text fontSize="sm">
                    AI-optimized portfolio would have generated 15.2% annual returns 
                    vs 11.8% for the benchmark over the last 3 years.
                  </Text>
                </Box>
              </Alert.Root>
            </Card.Body>
          </Card.Root>
        </Tabs.Content>
      </Tabs.Root>
    </Box>
  );
};