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
  Progress,
  Alert,
  Stat
} from '@chakra-ui/react';
import { 
  Wallet, 
  TrendingUp, 
  TrendingDown,
  Target,
  Award,
  BarChart3,
  PieChart,
  Activity,
  DollarSign,
  Zap,
  Shield,
  RefreshCw,
  Settings
} from 'lucide-react';
import { formatCurrency, formatPercentage } from '../../utils/formatters';
import { TradingMode } from '../../types/enums';

interface VirtualPortfolio {
  id: string;
  name: string;
  initialCapital: number;
  currentValue: number;
  availableBalance: number;
  totalPnL: number;
  totalPnLPercent: number;
  daysPnL: number;
  daysPnLPercent: number;
  totalTrades: number;
  winningTrades: number;
  winRate: number;
  maxDrawdown: number;
  sharpeRatio: number;
  createdAt: string;
  isActive: boolean;
}

interface VirtualHolding {
  symbol: string;
  companyName: string;
  quantity: number;
  avgPrice: number;
  currentPrice: number;
  investedValue: number;
  currentValue: number;
  pnl: number;
  pnlPercent: number;
  dayChange: number;
  dayChangePercent: number;
}

interface FundAllocation {
  virtualFunds: number;
  realFunds: number;
  totalFunds: number;
  virtualAllocationPercent: number;
  realAllocationPercent: number;
}

export const VirtualTradingDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [tradingMode, setTradingMode] = useState<TradingMode>(TradingMode.VIRTUAL);
  const [selectedPortfolio, setSelectedPortfolio] = useState<string>('portfolio1');

  const [virtualPortfolios] = useState<VirtualPortfolio[]>([
    {
      id: 'portfolio1',
      name: 'Conservative Growth',
      initialCapital: 500000,
      currentValue: 547500,
      availableBalance: 125000,
      totalPnL: 47500,
      totalPnLPercent: 9.5,
      daysPnL: 2850,
      daysPnLPercent: 0.52,
      totalTrades: 45,
      winningTrades: 32,
      winRate: 71.1,
      maxDrawdown: -8.2,
      sharpeRatio: 1.34,
      createdAt: '2024-01-15T00:00:00Z',
      isActive: true
    },
    {
      id: 'portfolio2',
      name: 'Aggressive Tech',
      initialCapital: 300000,
      currentValue: 385000,
      availableBalance: 45000,
      totalPnL: 85000,
      totalPnLPercent: 28.3,
      daysPnL: -1250,
      daysPnLPercent: -0.32,
      totalTrades: 78,
      winningTrades: 48,
      winRate: 61.5,
      maxDrawdown: -15.7,
      sharpeRatio: 1.89,
      createdAt: '2024-02-01T00:00:00Z',
      isActive: true
    },
    {
      id: 'portfolio3',
      name: 'Dividend Focus',
      initialCapital: 750000,
      currentValue: 798000,
      availableBalance: 98000,
      totalPnL: 48000,
      totalPnLPercent: 6.4,
      daysPnL: 1200,
      daysPnLPercent: 0.15,
      totalTrades: 23,
      winningTrades: 19,
      winRate: 82.6,
      maxDrawdown: -4.1,
      sharpeRatio: 0.98,
      createdAt: '2024-03-10T00:00:00Z',
      isActive: false
    }
  ]);

  const [virtualHoldings] = useState<VirtualHolding[]>([
    {
      symbol: 'RELIANCE',
      companyName: 'Reliance Industries Ltd',
      quantity: 50,
      avgPrice: 2650.00,
      currentPrice: 2847.65,
      investedValue: 132500,
      currentValue: 142382.50,
      pnl: 9882.50,
      pnlPercent: 7.46,
      dayChange: 45.20,
      dayChangePercent: 1.61
    },
    {
      symbol: 'TCS',
      companyName: 'Tata Consultancy Services',
      quantity: 25,
      avgPrice: 3950.00,
      currentPrice: 4125.30,
      investedValue: 98750,
      currentValue: 103132.50,
      pnl: 4382.50,
      pnlPercent: 4.44,
      dayChange: -25.70,
      dayChangePercent: -0.62
    },
    {
      symbol: 'INFY',
      companyName: 'Infosys Limited',
      quantity: 30,
      avgPrice: 1780.00,
      currentPrice: 1847.90,
      investedValue: 53400,
      currentValue: 55437.00,
      pnl: 2037.00,
      pnlPercent: 3.81,
      dayChange: 18.45,
      dayChangePercent: 1.01
    },
    {
      symbol: 'HDFC',
      companyName: 'HDFC Bank Limited',
      quantity: 40,
      avgPrice: 1680.00,
      currentPrice: 1654.75,
      investedValue: 67200,
      currentValue: 66190.00,
      pnl: -1010.00,
      pnlPercent: -1.50,
      dayChange: -12.30,
      dayChangePercent: -0.74
    }
  ]);

  const [fundAllocation] = useState<FundAllocation>({
    virtualFunds: 1550000,
    realFunds: 850000,
    totalFunds: 2400000,
    virtualAllocationPercent: 64.6,
    realAllocationPercent: 35.4
  });

  const currentPortfolio = virtualPortfolios.find(p => p.id === selectedPortfolio) || virtualPortfolios[0];

  const getPerformanceColor = (value: number) => {
    return value >= 0 ? 'success.600' : 'danger.600';
  };

  const getRiskColor = (risk: number) => {
    if (risk <= 5) return 'success.600';
    if (risk <= 10) return 'warning.600';
    return 'danger.600';
  };

  return (
    <Box>
      {/* Header */}
      <Card.Root mb={6}>
        <Card.Body>
          <Flex justify="space-between" align="center" mb={4}>
            <Flex align="center" gap={3}>
              <Icon color="brand.600">
                <Wallet size={24} />
              </Icon>
              <Box>
                <Text textStyle="heading.md" color="neutral.900">
                  Virtual Trading Dashboard
                </Text>
                <Text fontSize="sm" color="neutral.600">
                  Risk-free paper trading with real market data
                </Text>
              </Box>
            </Flex>
            
            <Flex align="center" gap={4}>
              <Flex align="center" gap={2}>
                <Text fontSize="sm" color="neutral.700">Trading Mode:</Text>
                <Box 
                  as="button"
                  w="12"
                  h="6"
                  bg={tradingMode === TradingMode.VIRTUAL ? 'blue.500' : 'gray.300'}
                  borderRadius="full"
                  position="relative"
                  onClick={() => setTradingMode(tradingMode === TradingMode.VIRTUAL ? TradingMode.LIVE : TradingMode.VIRTUAL)}
                  transition="all 0.2s"
                >
                  <Box
                    w="5"
                    h="5"
                    bg="white"
                    borderRadius="full"
                    position="absolute"
                    top="0.5"
                    left={tradingMode === TradingMode.VIRTUAL ? '1.5' : '0.5'}
                    transition="all 0.2s"
                    shadow="sm"
                  />
                </Box>
                <Badge colorPalette={tradingMode === TradingMode.VIRTUAL ? 'blue' : 'green'}>
                  {tradingMode}
                </Badge>
              </Flex>
              
              <Button colorPalette="brand">
                <Icon mr={2}><Settings size={16} /></Icon>
                Settings
              </Button>
              <Button colorPalette="success" variant="outline">
                <Icon mr={2}><RefreshCw size={16} /></Icon>
                Refresh
              </Button>
            </Flex>
          </Flex>

          {/* Fund Allocation Overview */}
          <SimpleGrid columns={{ base: 2, md: 4 }} gap={4}>
            <Box textAlign="center">
              <Icon color="brand.600" mb={2}>
                <DollarSign size={24} />
              </Icon>
              <Text fontSize="2xl" fontWeight="bold" color="brand.600">
                {formatCurrency(fundAllocation.totalFunds)}
              </Text>
              <Text fontSize="sm" color="neutral.600">Total Funds</Text>
            </Box>
            <Box textAlign="center">
              <Icon color="blue.600" mb={2}>
                <Activity size={24} />
              </Icon>
              <Text fontSize="2xl" fontWeight="bold" color="blue.600">
                {formatCurrency(fundAllocation.virtualFunds)}
              </Text>
              <Text fontSize="sm" color="neutral.600">Virtual Funds</Text>
            </Box>
            <Box textAlign="center">
              <Icon color="green.600" mb={2}>
                <Zap size={24} />
              </Icon>
              <Text fontSize="2xl" fontWeight="bold" color="green.600">
                {formatCurrency(fundAllocation.realFunds)}
              </Text>
              <Text fontSize="sm" color="neutral.600">Real Funds</Text>
            </Box>
            <Box textAlign="center">
              <Icon color="purple.600" mb={2}>
                <PieChart size={24} />
              </Icon>
              <Text fontSize="2xl" fontWeight="bold" color="purple.600">
                {virtualPortfolios.filter(p => p.isActive).length}
              </Text>
              <Text fontSize="sm" color="neutral.600">Active Portfolios</Text>
            </Box>
          </SimpleGrid>
        </Card.Body>
      </Card.Root>

      <Tabs.Root value={activeTab} onValueChange={(e) => setActiveTab(e.value)}>
        <Tabs.List mb={6}>
          <Tabs.Trigger value="overview">
            <Icon mr={2}><BarChart3 size={16} /></Icon>
            Overview
          </Tabs.Trigger>
          <Tabs.Trigger value="portfolios">
            <Icon mr={2}><PieChart size={16} /></Icon>
            Virtual Portfolios
          </Tabs.Trigger>
          <Tabs.Trigger value="holdings">
            <Icon mr={2}><Activity size={16} /></Icon>
            Holdings
          </Tabs.Trigger>
          <Tabs.Trigger value="performance">
            <Icon mr={2}><TrendingUp size={16} /></Icon>
            Performance
          </Tabs.Trigger>
          <Tabs.Trigger value="comparison">
            <Icon mr={2}><Target size={16} /></Icon>
            Real vs Virtual
          </Tabs.Trigger>
        </Tabs.List>

        {/* Overview Tab */}
        <Tabs.Content value="overview">
          <SimpleGrid columns={{ base: 1, lg: 2 }} gap={6}>
            {/* Current Portfolio Summary */}
            <Card.Root>
              <Card.Body>
                <Flex justify="space-between" align="center" mb={4}>
                  <Text fontWeight="semibold" color="neutral.900">
                    {currentPortfolio.name}
                  </Text>
                  <Badge colorPalette={currentPortfolio.isActive ? 'success' : 'neutral'}>
                    {currentPortfolio.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </Flex>

                <SimpleGrid columns={2} gap={4} mb={4}>
                  <Stat.Root>
                    <Stat.Label>Current Value</Stat.Label>
                    <Stat.ValueText fontSize="xl" fontWeight="bold" color="brand.600">
                      {formatCurrency(currentPortfolio.currentValue)}
                    </Stat.ValueText>
                  </Stat.Root>
                  
                  <Stat.Root>
                    <Stat.Label>Total P&L</Stat.Label>
                    <Stat.ValueText 
                      fontSize="xl" 
                      fontWeight="bold" 
                      color={getPerformanceColor(currentPortfolio.totalPnL)}
                    >
                      {formatCurrency(currentPortfolio.totalPnL)}
                    </Stat.ValueText>
                  </Stat.Root>
                  
                  <Stat.Root>
                    <Stat.Label>Day's P&L</Stat.Label>
                    <Stat.ValueText 
                      fontSize="lg" 
                      fontWeight="bold" 
                      color={getPerformanceColor(currentPortfolio.daysPnL)}
                    >
                      {formatCurrency(currentPortfolio.daysPnL)}
                    </Stat.ValueText>
                  </Stat.Root>
                  
                  <Stat.Root>
                    <Stat.Label>Win Rate</Stat.Label>
                    <Stat.ValueText fontSize="lg" fontWeight="bold" color="success.600">
                      {currentPortfolio.winRate.toFixed(1)}%
                    </Stat.ValueText>
                  </Stat.Root>
                </SimpleGrid>

                <Box>
                  <Text fontSize="sm" color="neutral.600" mb={2}>
                    Available Balance
                  </Text>
                  <Text fontSize="lg" fontWeight="bold" color="neutral.900">
                    {formatCurrency(currentPortfolio.availableBalance)}
                  </Text>
                </Box>
              </Card.Body>
            </Card.Root>

            {/* Performance Metrics */}
            <Card.Root>
              <Card.Body>
                <Text fontWeight="semibold" color="neutral.900" mb={4}>
                  Performance Metrics
                </Text>

                <Stack gap={4}>
                  <Box>
                    <Flex justify="space-between" align="center" mb={2}>
                      <Text fontSize="sm" color="neutral.700">Total Return</Text>
                      <Text 
                        fontSize="sm" 
                        fontWeight="bold" 
                        color={getPerformanceColor(currentPortfolio.totalPnLPercent)}
                      >
                        {formatPercentage(currentPortfolio.totalPnLPercent)}
                      </Text>
                    </Flex>
                    <Progress.Root 
                      value={Math.abs(currentPortfolio.totalPnLPercent)} 
                      max={30}
                      colorPalette={currentPortfolio.totalPnLPercent >= 0 ? 'success' : 'danger'}
                    >
                      <Progress.Track>
                        <Progress.Range />
                      </Progress.Track>
                    </Progress.Root>
                  </Box>

                  <Box>
                    <Flex justify="space-between" align="center" mb={2}>
                      <Text fontSize="sm" color="neutral.700">Max Drawdown</Text>
                      <Text 
                        fontSize="sm" 
                        fontWeight="bold" 
                        color={getRiskColor(Math.abs(currentPortfolio.maxDrawdown))}
                      >
                        {formatPercentage(currentPortfolio.maxDrawdown)}
                      </Text>
                    </Flex>
                    <Progress.Root 
                      value={Math.abs(currentPortfolio.maxDrawdown)} 
                      max={20}
                      colorPalette="danger"
                    >
                      <Progress.Track>
                        <Progress.Range />
                      </Progress.Track>
                    </Progress.Root>
                  </Box>

                  <Box>
                    <Flex justify="space-between" align="center" mb={2}>
                      <Text fontSize="sm" color="neutral.700">Sharpe Ratio</Text>
                      <Text fontSize="sm" fontWeight="bold" color="brand.600">
                        {currentPortfolio.sharpeRatio.toFixed(2)}
                      </Text>
                    </Flex>
                    <Progress.Root 
                      value={currentPortfolio.sharpeRatio} 
                      max={3}
                      colorPalette="brand"
                    >
                      <Progress.Track>
                        <Progress.Range />
                      </Progress.Track>
                    </Progress.Root>
                  </Box>

                  <SimpleGrid columns={2} gap={4}>
                    <Box textAlign="center" p={3} bg="neutral.50" borderRadius="md">
                      <Text fontSize="lg" fontWeight="bold" color="neutral.900">
                        {currentPortfolio.totalTrades}
                      </Text>
                      <Text fontSize="xs" color="neutral.600">Total Trades</Text>
                    </Box>
                    <Box textAlign="center" p={3} bg="neutral.50" borderRadius="md">
                      <Text fontSize="lg" fontWeight="bold" color="success.600">
                        {currentPortfolio.winningTrades}
                      </Text>
                      <Text fontSize="xs" color="neutral.600">Winning Trades</Text>
                    </Box>
                  </SimpleGrid>
                </Stack>
              </Card.Body>
            </Card.Root>
          </SimpleGrid>
        </Tabs.Content>

        {/* Virtual Portfolios Tab */}
        <Tabs.Content value="portfolios">
          <SimpleGrid columns={{ base: 1, lg: 2, xl: 3 }} gap={6}>
            {virtualPortfolios.map((portfolio) => (
              <Card.Root 
                key={portfolio.id}
                layerStyle={portfolio.id === selectedPortfolio ? 'card.selected' : undefined}
                cursor="pointer"
                onClick={() => setSelectedPortfolio(portfolio.id)}
              >
                <Card.Body>
                  <Flex justify="space-between" align="center" mb={3}>
                    <Text fontWeight="semibold" color="neutral.900">
                      {portfolio.name}
                    </Text>
                    <Badge colorPalette={portfolio.isActive ? 'success' : 'neutral'}>
                      {portfolio.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </Flex>

                  <SimpleGrid columns={2} gap={3} mb={4}>
                    <Box>
                      <Text fontSize="xs" color="neutral.600">Current Value</Text>
                      <Text fontSize="sm" fontWeight="bold" color="brand.600">
                        {formatCurrency(portfolio.currentValue)}
                      </Text>
                    </Box>
                    <Box>
                      <Text fontSize="xs" color="neutral.600">Total P&L</Text>
                      <Text 
                        fontSize="sm" 
                        fontWeight="bold" 
                        color={getPerformanceColor(portfolio.totalPnL)}
                      >
                        {formatPercentage(portfolio.totalPnLPercent)}
                      </Text>
                    </Box>
                    <Box>
                      <Text fontSize="xs" color="neutral.600">Win Rate</Text>
                      <Text fontSize="sm" fontWeight="bold" color="success.600">
                        {portfolio.winRate.toFixed(1)}%
                      </Text>
                    </Box>
                    <Box>
                      <Text fontSize="xs" color="neutral.600">Sharpe Ratio</Text>
                      <Text fontSize="sm" fontWeight="bold" color="brand.600">
                        {portfolio.sharpeRatio.toFixed(2)}
                      </Text>
                    </Box>
                  </SimpleGrid>

                  <Flex justify="space-between" align="center">
                    <Text fontSize="xs" color="neutral.500">
                      Created: {new Date(portfolio.createdAt).toLocaleDateString()}
                    </Text>
                    <Button size="sm" variant="outline">
                      <Icon><Settings size={14} /></Icon>
                    </Button>
                  </Flex>
                </Card.Body>
              </Card.Root>
            ))}
          </SimpleGrid>
        </Tabs.Content>

        {/* Holdings Tab */}
        <Tabs.Content value="holdings">
          <Card.Root>
            <Card.Body>
              <Text fontWeight="semibold" color="neutral.900" mb={4}>
                Virtual Holdings - {currentPortfolio.name}
              </Text>
              
              <Box overflowX="auto">
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                      <th style={{ textAlign: 'left', padding: '12px 8px', fontSize: '14px', color: '#64748b' }}>Symbol</th>
                      <th style={{ textAlign: 'right', padding: '12px 8px', fontSize: '14px', color: '#64748b' }}>Qty</th>
                      <th style={{ textAlign: 'right', padding: '12px 8px', fontSize: '14px', color: '#64748b' }}>Avg Price</th>
                      <th style={{ textAlign: 'right', padding: '12px 8px', fontSize: '14px', color: '#64748b' }}>Current Price</th>
                      <th style={{ textAlign: 'right', padding: '12px 8px', fontSize: '14px', color: '#64748b' }}>P&L</th>
                      <th style={{ textAlign: 'right', padding: '12px 8px', fontSize: '14px', color: '#64748b' }}>Day Change</th>
                    </tr>
                  </thead>
                  <tbody>
                    {virtualHoldings.map((holding) => (
                      <tr key={holding.symbol} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '12px 8px' }}>
                          <Box>
                            <Text fontSize="sm" fontWeight="medium" color="neutral.900">
                              {holding.symbol}
                            </Text>
                            <Text fontSize="xs" color="neutral.600">
                              {holding.companyName}
                            </Text>
                          </Box>
                        </td>
                        <td style={{ textAlign: 'right', padding: '12px 8px' }}>
                          <Text fontSize="sm" color="neutral.900">
                            {holding.quantity}
                          </Text>
                        </td>
                        <td style={{ textAlign: 'right', padding: '12px 8px' }}>
                          <Text fontSize="sm" color="neutral.900">
                            {formatCurrency(holding.avgPrice)}
                          </Text>
                        </td>
                        <td style={{ textAlign: 'right', padding: '12px 8px' }}>
                          <Text fontSize="sm" color="neutral.900">
                            {formatCurrency(holding.currentPrice)}
                          </Text>
                        </td>
                        <td style={{ textAlign: 'right', padding: '12px 8px' }}>
                          <Box>
                            <Text 
                              fontSize="sm" 
                              fontWeight="medium" 
                              color={getPerformanceColor(holding.pnl)}
                            >
                              {formatCurrency(holding.pnl)}
                            </Text>
                            <Text 
                              fontSize="xs" 
                              color={getPerformanceColor(holding.pnl)}
                            >
                              ({formatPercentage(holding.pnlPercent)})
                            </Text>
                          </Box>
                        </td>
                        <td style={{ textAlign: 'right', padding: '12px 8px' }}>
                          <Flex align="center" justify="flex-end" gap={1}>
                            <Icon 
                              color={getPerformanceColor(holding.dayChange)}
                            >
                              {holding.dayChange >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                            </Icon>
                            <Text 
                              fontSize="sm" 
                              color={getPerformanceColor(holding.dayChange)}
                            >
                              {formatPercentage(holding.dayChangePercent)}
                            </Text>
                          </Flex>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Box>
            </Card.Body>
          </Card.Root>
        </Tabs.Content>

        {/* Performance Tab */}
        <Tabs.Content value="performance">
          <SimpleGrid columns={{ base: 1, lg: 2 }} gap={6}>
            <Card.Root>
              <Card.Body>
                <Text fontWeight="semibold" color="neutral.900" mb={4}>
                  Portfolio Performance Comparison
                </Text>
                
                <Stack gap={4}>
                  {virtualPortfolios.map((portfolio) => (
                    <Box key={portfolio.id} p={4} bg="neutral.50" borderRadius="md">
                      <Flex justify="space-between" align="center" mb={2}>
                        <Text fontSize="sm" fontWeight="medium" color="neutral.800">
                          {portfolio.name}
                        </Text>
                        <Text 
                          fontSize="sm" 
                          fontWeight="bold" 
                          color={getPerformanceColor(portfolio.totalPnLPercent)}
                        >
                          {formatPercentage(portfolio.totalPnLPercent)}
                        </Text>
                      </Flex>
                      <Progress.Root 
                        value={Math.abs(portfolio.totalPnLPercent)} 
                        max={30}
                        colorPalette={portfolio.totalPnLPercent >= 0 ? 'success' : 'danger'}
                      >
                        <Progress.Track>
                          <Progress.Range />
                        </Progress.Track>
                      </Progress.Root>
                    </Box>
                  ))}
                </Stack>
              </Card.Body>
            </Card.Root>

            <Card.Root>
              <Card.Body>
                <Text fontWeight="semibold" color="neutral.900" mb={4}>
                  Risk Metrics
                </Text>
                
                <Stack gap={4}>
                  {virtualPortfolios.map((portfolio) => (
                    <Box key={portfolio.id} p={4} bg="neutral.50" borderRadius="md">
                      <Text fontSize="sm" fontWeight="medium" color="neutral.800" mb={3}>
                        {portfolio.name}
                      </Text>
                      <SimpleGrid columns={2} gap={3}>
                        <Box>
                          <Text fontSize="xs" color="neutral.600">Max Drawdown</Text>
                          <Text 
                            fontSize="sm" 
                            fontWeight="bold" 
                            color={getRiskColor(Math.abs(portfolio.maxDrawdown))}
                          >
                            {formatPercentage(portfolio.maxDrawdown)}
                          </Text>
                        </Box>
                        <Box>
                          <Text fontSize="xs" color="neutral.600">Sharpe Ratio</Text>
                          <Text fontSize="sm" fontWeight="bold" color="brand.600">
                            {portfolio.sharpeRatio.toFixed(2)}
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

        {/* Real vs Virtual Comparison Tab */}
        <Tabs.Content value="comparison">
          <Alert.Root status="info" mb={6}>
            <Alert.Indicator />
            <Box>
              <Alert.Title>Virtual vs Real Trading Comparison</Alert.Title>
              <Text fontSize="sm">
                Compare your virtual trading performance with real trading to identify areas for improvement.
              </Text>
            </Box>
          </Alert.Root>

          <SimpleGrid columns={{ base: 1, lg: 2 }} gap={6}>
            <Card.Root>
              <Card.Body>
                <Text fontWeight="semibold" color="neutral.900" mb={4}>
                  Performance Comparison
                </Text>
                
                <Stack gap={4}>
                  <Box p={4} bg="blue.50" borderRadius="md" borderLeft="4px solid" borderColor="blue.500">
                    <Text fontSize="sm" fontWeight="medium" color="blue.800" mb={2}>
                      Virtual Trading
                    </Text>
                    <SimpleGrid columns={2} gap={3}>
                      <Box>
                        <Text fontSize="xs" color="blue.600">Total Return</Text>
                        <Text fontSize="lg" fontWeight="bold" color="blue.700">
                          {formatPercentage(12.8)}
                        </Text>
                      </Box>
                      <Box>
                        <Text fontSize="xs" color="blue.600">Win Rate</Text>
                        <Text fontSize="lg" fontWeight="bold" color="blue.700">
                          71.5%
                        </Text>
                      </Box>
                    </SimpleGrid>
                  </Box>

                  <Box p={4} bg="green.50" borderRadius="md" borderLeft="4px solid" borderColor="green.500">
                    <Text fontSize="sm" fontWeight="medium" color="green.800" mb={2}>
                      Real Trading
                    </Text>
                    <SimpleGrid columns={2} gap={3}>
                      <Box>
                        <Text fontSize="xs" color="green.600">Total Return</Text>
                        <Text fontSize="lg" fontWeight="bold" color="green.700">
                          {formatPercentage(8.4)}
                        </Text>
                      </Box>
                      <Box>
                        <Text fontSize="xs" color="green.600">Win Rate</Text>
                        <Text fontSize="lg" fontWeight="bold" color="green.700">
                          65.2%
                        </Text>
                      </Box>
                    </SimpleGrid>
                  </Box>
                </Stack>
              </Card.Body>
            </Card.Root>

            <Card.Root>
              <Card.Body>
                <Text fontWeight="semibold" color="neutral.900" mb={4}>
                  Key Insights
                </Text>
                
                <Stack gap={3}>
                  <Box p={3} bg="success.50" borderRadius="md">
                    <Flex align="center" gap={2} mb={1}>
                      <Icon color="success.600"><Award size={16} /></Icon>
                      <Text fontSize="sm" fontWeight="medium" color="success.800">
                        Better Virtual Performance
                      </Text>
                    </Flex>
                    <Text fontSize="xs" color="success.700">
                      Your virtual trading shows 4.4% higher returns, indicating good strategy potential.
                    </Text>
                  </Box>

                  <Box p={3} bg="warning.50" borderRadius="md">
                    <Flex align="center" gap={2} mb={1}>
                      <Icon color="warning.600"><Shield size={16} /></Icon>
                      <Text fontSize="sm" fontWeight="medium" color="warning.800">
                        Risk Management
                      </Text>
                    </Flex>
                    <Text fontSize="xs" color="warning.700">
                      Consider implementing stricter stop-losses in real trading.
                    </Text>
                  </Box>

                  <Box p={3} bg="brand.50" borderRadius="md">
                    <Flex align="center" gap={2} mb={1}>
                      <Icon color="brand.600"><Target size={16} /></Icon>
                      <Text fontSize="sm" fontWeight="medium" color="brand.800">
                        Recommendation
                      </Text>
                    </Flex>
                    <Text fontSize="xs" color="brand.700">
                      Gradually increase real trading allocation as virtual performance improves.
                    </Text>
                  </Box>
                </Stack>
              </Card.Body>
            </Card.Root>
          </SimpleGrid>
        </Tabs.Content>
      </Tabs.Root>
    </Box>
  );
};