import React, { useState } from 'react';
import { 
  Card, 
  Text, 
  Box, 
  Flex, 
  SimpleGrid,
  Icon,
  Select,
  createListCollection,
  Stack,
  Badge
} from '@chakra-ui/react';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown,
  Calendar,
  Activity,
  Award,
  Target
} from 'lucide-react';

interface PerformanceMetric {
  name: string;
  value: number;
  benchmark: number;
  period: string;
  trend: 'up' | 'down' | 'neutral';
}



export const PerformanceAnalytics: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('1Y');
  const [comparisonBenchmark, setComparisonBenchmark] = useState('NIFTY50');

  const performanceMetrics: PerformanceMetric[] = [
    {
      name: 'Total Returns',
      value: 12.45,
      benchmark: 8.32,
      period: '1Y',
      trend: 'up'
    },
    {
      name: 'Annualized Returns',
      value: 15.67,
      benchmark: 11.24,
      period: '3Y',
      trend: 'up'
    },
    {
      name: 'Volatility',
      value: 18.45,
      benchmark: 22.10,
      period: '1Y',
      trend: 'down'
    },
    {
      name: 'Sharpe Ratio',
      value: 1.34,
      benchmark: 0.89,
      period: '1Y',
      trend: 'up'
    },
    {
      name: 'Max Drawdown',
      value: -8.23,
      benchmark: -12.45,
      period: '1Y',
      trend: 'up'
    },
    {
      name: 'Alpha',
      value: 4.13,
      benchmark: 0,
      period: '1Y',
      trend: 'up'
    }
  ];

  const monthlyReturns = [
    { month: 'Jan', portfolio: 2.3, benchmark: 1.8 },
    { month: 'Feb', portfolio: -1.2, benchmark: -0.8 },
    { month: 'Mar', portfolio: 3.4, benchmark: 2.1 },
    { month: 'Apr', portfolio: 1.8, benchmark: 1.5 },
    { month: 'May', portfolio: -0.5, benchmark: 0.2 },
    { month: 'Jun', portfolio: 2.7, benchmark: 1.9 },
    { month: 'Jul', portfolio: 1.9, benchmark: 1.3 },
    { month: 'Aug', portfolio: -2.1, benchmark: -1.5 },
    { month: 'Sep', portfolio: 3.2, benchmark: 2.4 },
    { month: 'Oct', portfolio: 1.6, benchmark: 1.1 },
    { month: 'Nov', portfolio: 2.8, benchmark: 2.0 },
    { month: 'Dec', portfolio: 1.4, benchmark: 0.9 }
  ];

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp size={16} />;
      case 'down': return <TrendingDown size={16} />;
      default: return <Activity size={16} />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up': return 'success.600';
      case 'down': return 'danger.600';
      default: return 'neutral.600';
    }
  };

  const getPerformanceColor = (value: number, benchmark: number, isLowerBetter = false) => {
    const isOutperforming = isLowerBetter ? value < benchmark : value > benchmark;
    return isOutperforming ? 'success.600' : 'danger.600';
  };

  return (
    <Card.Root>
      <Card.Body>
        <Flex justify="space-between" align="center" mb={6}>
          <Flex align="center" gap={3}>
            <Icon as={BarChart3} color="brand.600" boxSize={6} />
            <Box>
              <Text textStyle="heading.md" color="neutral.900">
                Performance Analytics
              </Text>
              <Text fontSize="sm" color="neutral.600">
                Detailed portfolio performance analysis
              </Text>
            </Box>
          </Flex>
          <Flex gap={2}>
            <Select.Root 
              collection={createListCollection({
                items: [
                  { label: '1 Month', value: '1M' },
                  { label: '3 Months', value: '3M' },
                  { label: '6 Months', value: '6M' },
                  { label: '1 Year', value: '1Y' },
                  { label: '3 Years', value: '3Y' },
                  { label: '5 Years', value: '5Y' }
                ]
              })}
              value={[selectedPeriod]} 
              onValueChange={(e) => setSelectedPeriod(e.value[0])}
            >
              <Select.Trigger minW="100px">
                <Select.ValueText />
              </Select.Trigger>
              <Select.Content>
                <Select.Item item="1M">1 Month</Select.Item>
                <Select.Item item="3M">3 Months</Select.Item>
                <Select.Item item="6M">6 Months</Select.Item>
                <Select.Item item="1Y">1 Year</Select.Item>
                <Select.Item item="3Y">3 Years</Select.Item>
                <Select.Item item="5Y">5 Years</Select.Item>
              </Select.Content>
            </Select.Root>
            <Select.Root 
              collection={createListCollection({
                items: [
                  { label: 'NIFTY 50', value: 'NIFTY50' },
                  { label: 'SENSEX', value: 'SENSEX' },
                  { label: 'NIFTY 500', value: 'NIFTY500' },
                  { label: 'BANK NIFTY', value: 'BANKNIFTY' }
                ]
              })}
              value={[comparisonBenchmark]} 
              onValueChange={(e) => setComparisonBenchmark(e.value[0])}
            >
              <Select.Trigger minW="120px">
                <Select.ValueText />
              </Select.Trigger>
              <Select.Content>
                <Select.Item item="NIFTY50">NIFTY 50</Select.Item>
                <Select.Item item="SENSEX">SENSEX</Select.Item>
                <Select.Item item="NIFTY500">NIFTY 500</Select.Item>
                <Select.Item item="BANKNIFTY">BANK NIFTY</Select.Item>
              </Select.Content>
            </Select.Root>
          </Flex>
        </Flex>

        {/* Performance Metrics Grid */}
        <SimpleGrid columns={{ base: 2, md: 3 }} gap={4} mb={6}>
          {performanceMetrics.map((metric) => (
            <Box
              key={metric.name}
              p={4}
              bg="neutral.50"
              borderRadius="md"
              border="1px solid"
              borderColor="neutral.200"
            >
              <Flex justify="space-between" align="center" mb={2}>
                <Text fontSize="sm" fontWeight="medium" color="neutral.900">
                  {metric.name}
                </Text>
                <Icon as={getTrendIcon(metric.trend).type} color={getTrendColor(metric.trend)} boxSize={4} />
              </Flex>
              
              <Text 
                fontSize="lg" 
                fontWeight="bold" 
                color={getPerformanceColor(
                  metric.value, 
                  metric.benchmark, 
                  metric.name === 'Volatility' || metric.name === 'Max Drawdown'
                )}
                mb={1}
              >
                {metric.name === 'Sharpe Ratio' ? 
                  metric.value.toFixed(2) : 
                  `${metric.value > 0 ? '+' : ''}${metric.value.toFixed(2)}%`
                }
              </Text>
              
              <Text fontSize="xs" color="neutral.600">
                vs {comparisonBenchmark}: {metric.benchmark > 0 ? '+' : ''}{metric.benchmark.toFixed(2)}%
              </Text>
            </Box>
          ))}
        </SimpleGrid>

        {/* Monthly Returns Comparison */}
        <Box mb={6}>
          <Flex align="center" gap={2} mb={4}>
            <Icon as={Calendar} color="brand.600" boxSize={4} />
            <Text fontSize="sm" fontWeight="medium" color="neutral.900">
              Monthly Returns Comparison
            </Text>
          </Flex>
          
          <SimpleGrid columns={{ base: 6, md: 12 }} gap={2}>
            {monthlyReturns.map((data) => (
              <Box key={data.month} textAlign="center">
                <Text fontSize="xs" color="neutral.600" mb={1}>
                  {data.month}
                </Text>
                <Box 
                  h="60px" 
                  bg="neutral.100" 
                  borderRadius="sm" 
                  position="relative"
                  overflow="hidden"
                >
                  {/* Portfolio Bar */}
                  <Box
                    position="absolute"
                    bottom={0}
                    left="2px"
                    w="calc(50% - 3px)"
                    h={`${Math.abs(data.portfolio) * 10}px`}
                    bg={data.portfolio >= 0 ? 'success.500' : 'danger.500'}
                    borderRadius="xs"
                  />
                  {/* Benchmark Bar */}
                  <Box
                    position="absolute"
                    bottom={0}
                    right="2px"
                    w="calc(50% - 3px)"
                    h={`${Math.abs(data.benchmark) * 10}px`}
                    bg={data.benchmark >= 0 ? 'success.300' : 'danger.300'}
                    borderRadius="xs"
                  />
                </Box>
                <Text fontSize="xs" color="neutral.700" mt={1}>
                  {data.portfolio > 0 ? '+' : ''}{data.portfolio.toFixed(1)}%
                </Text>
              </Box>
            ))}
          </SimpleGrid>
          
          <Flex justify="center" gap={4} mt={3}>
            <Flex align="center" gap={1}>
              <Box w={3} h={3} bg="success.500" borderRadius="sm" />
              <Text fontSize="xs" color="neutral.600">Portfolio</Text>
            </Flex>
            <Flex align="center" gap={1}>
              <Box w={3} h={3} bg="success.300" borderRadius="sm" />
              <Text fontSize="xs" color="neutral.600">{comparisonBenchmark}</Text>
            </Flex>
          </Flex>
        </Box>

        {/* Risk-Return Analysis */}
        <Box mb={6}>
          <Flex align="center" gap={2} mb={4}>
            <Icon as={Target} color="warning.600" boxSize={4} />
            <Text fontSize="sm" fontWeight="medium" color="neutral.900">
              Risk-Return Profile
            </Text>
          </Flex>
          
          <SimpleGrid columns={2} gap={4}>
            <Box p={4} bg="success.50" borderRadius="md" border="1px solid" borderColor="success.200">
              <Text fontSize="sm" fontWeight="medium" color="success.800" mb={2}>
                Risk-Adjusted Performance
              </Text>
              <Text fontSize="lg" fontWeight="bold" color="success.700" mb={1}>
                Excellent
              </Text>
              <Text fontSize="xs" color="success.600">
                Sharpe ratio of 1.34 indicates good risk-adjusted returns
              </Text>
            </Box>
            
            <Box p={4} bg="brand.50" borderRadius="md" border="1px solid" borderColor="brand.200">
              <Text fontSize="sm" fontWeight="medium" color="brand.800" mb={2}>
                Consistency Score
              </Text>
              <Text fontSize="lg" fontWeight="bold" color="brand.700" mb={1}>
                8.5/10
              </Text>
              <Text fontSize="xs" color="brand.600">
                Low volatility with steady positive returns
              </Text>
            </Box>
          </SimpleGrid>
        </Box>

        {/* Performance Insights */}
        <Box>
          <Flex align="center" gap={2} mb={4}>
            <Icon as={Award} color="ai.600" boxSize={4} />
            <Text fontSize="sm" fontWeight="medium" color="neutral.900">
              AI Performance Insights
            </Text>
          </Flex>
          
          <Stack gap={3}>
            <Box p={3} bg="ai.50" borderRadius="md" border="1px solid" borderColor="ai.200">
              <Flex align="center" gap={2} mb={1}>
                <Badge colorPalette="success" size="sm">Strong</Badge>
                <Text fontSize="sm" fontWeight="medium" color="ai.800">
                  Outperforming Benchmark
                </Text>
              </Flex>
              <Text fontSize="xs" color="ai.700">
                Your portfolio has consistently outperformed {comparisonBenchmark} by 4.13% annually
              </Text>
            </Box>
            
            <Box p={3} bg="warning.50" borderRadius="md" border="1px solid" borderColor="warning.200">
              <Flex align="center" gap={2} mb={1}>
                <Badge colorPalette="warning" size="sm">Moderate</Badge>
                <Text fontSize="sm" fontWeight="medium" color="warning.800">
                  Sector Concentration Risk
                </Text>
              </Flex>
              <Text fontSize="xs" color="warning.700">
                Consider diversifying beyond technology sector to reduce volatility
              </Text>
            </Box>
            
            <Box p={3} bg="success.50" borderRadius="md" border="1px solid" borderColor="success.200">
              <Flex align="center" gap={2} mb={1}>
                <Badge colorPalette="success" size="sm">Excellent</Badge>
                <Text fontSize="sm" fontWeight="medium" color="success.800">
                  Downside Protection
                </Text>
              </Flex>
              <Text fontSize="xs" color="success.700">
                Maximum drawdown of -8.23% is better than benchmark's -12.45%
              </Text>
            </Box>
          </Stack>
        </Box>
      </Card.Body>
    </Card.Root>
  );
};