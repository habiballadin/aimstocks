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
  Select,
  Table,
  Alert,
  createListCollection
} from '@chakra-ui/react';
import { 
  TrendingUp, 
  TrendingDown,
  Activity,
  Target,
  Eye,
  BarChart3,
  Zap,
  CheckCircle
} from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';
import { ChartTimeframe } from '../../types/enums';

interface PatternRecognition {
  id: string;
  pattern: string;
  symbol: string;
  timeframe: ChartTimeframe;
  confidence: number;
  direction: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  targetPrice: number;
  stopLoss: number;
  probability: number;
  detectedAt: string;
  status: 'ACTIVE' | 'COMPLETED' | 'FAILED';
}

interface TechnicalIndicator {
  name: string;
  value: number;
  signal: 'BUY' | 'SELL' | 'NEUTRAL';
  strength: number;
  description: string;
}

interface SupportResistance {
  type: 'SUPPORT' | 'RESISTANCE';
  level: number;
  strength: number;
  touches: number;
  lastTested: string;
  status: 'ACTIVE' | 'BROKEN';
}

export const TechnicalAnalysis: React.FC = () => {
  const [selectedSymbol, setSelectedSymbol] = useState('RELIANCE');
  const [selectedTimeframe, setSelectedTimeframe] = useState(ChartTimeframe.ONE_DAY);
  const [activeTab, setActiveTab] = useState('patterns');

  const symbolOptions = createListCollection({
    items: [
      { value: 'RELIANCE', label: 'RELIANCE' },
      { value: 'TCS', label: 'TCS' },
      { value: 'INFY', label: 'INFY' },
      { value: 'HDFC', label: 'HDFC' }
    ]
  });

  const timeframeOptions = createListCollection({
    items: [
      { value: ChartTimeframe.FIVE_MIN, label: '5m' },
      { value: ChartTimeframe.FIFTEEN_MIN, label: '15m' },
      { value: ChartTimeframe.ONE_HOUR, label: '1h' },
      { value: ChartTimeframe.ONE_DAY, label: '1d' }
    ]
  });

  const [patterns] = useState<PatternRecognition[]>([
    {
      id: 'pat1',
      pattern: 'Ascending Triangle',
      symbol: 'RELIANCE',
      timeframe: ChartTimeframe.ONE_DAY,
      confidence: 0.87,
      direction: 'BULLISH',
      targetPrice: 2950,
      stopLoss: 2780,
      probability: 78.5,
      detectedAt: '2025-01-27T09:30:00Z',
      status: 'ACTIVE'
    },
    {
      id: 'pat2',
      pattern: 'Head and Shoulders',
      symbol: 'TCS',
      timeframe: ChartTimeframe.ONE_DAY,
      confidence: 0.72,
      direction: 'BEARISH',
      targetPrice: 3950,
      stopLoss: 4200,
      probability: 65.2,
      detectedAt: '2025-01-27T10:15:00Z',
      status: 'ACTIVE'
    },
    {
      id: 'pat3',
      pattern: 'Bull Flag',
      symbol: 'INFY',
      timeframe: ChartTimeframe.FIVE_MIN,
      confidence: 0.91,
      direction: 'BULLISH',
      targetPrice: 1920,
      stopLoss: 1820,
      probability: 82.3,
      detectedAt: '2025-01-27T11:00:00Z',
      status: 'ACTIVE'
    },
    {
      id: 'pat4',
      pattern: 'Double Bottom',
      symbol: 'HDFC',
      timeframe: ChartTimeframe.ONE_HOUR,
      confidence: 0.68,
      direction: 'BULLISH',
      targetPrice: 1720,
      stopLoss: 1620,
      probability: 71.8,
      detectedAt: '2025-01-27T08:45:00Z',
      status: 'COMPLETED'
    }
  ]);

  const [technicalIndicators] = useState<TechnicalIndicator[]>([
    {
      name: 'RSI (14)',
      value: 68.5,
      signal: 'NEUTRAL',
      strength: 6.5,
      description: 'Approaching overbought territory'
    },
    {
      name: 'MACD',
      value: 12.3,
      signal: 'BUY',
      strength: 8.2,
      description: 'Bullish crossover confirmed'
    },
    {
      name: 'Bollinger Bands',
      value: 0.75,
      signal: 'BUY',
      strength: 7.1,
      description: 'Price near lower band, potential bounce'
    },
    {
      name: 'Stochastic',
      value: 32.1,
      signal: 'BUY',
      strength: 7.8,
      description: 'Oversold condition, reversal expected'
    },
    {
      name: 'Williams %R',
      value: -25.6,
      signal: 'NEUTRAL',
      strength: 5.5,
      description: 'Neutral momentum'
    },
    {
      name: 'ADX',
      value: 45.2,
      signal: 'BUY',
      strength: 8.8,
      description: 'Strong trending market'
    }
  ]);

  const [supportResistanceLevels] = useState<SupportResistance[]>([
    {
      type: 'RESISTANCE',
      level: 2875,
      strength: 8.5,
      touches: 4,
      lastTested: '2025-01-27T10:30:00Z',
      status: 'ACTIVE'
    },
    {
      type: 'SUPPORT',
      level: 2780,
      strength: 9.2,
      touches: 6,
      lastTested: '2025-01-26T14:15:00Z',
      status: 'ACTIVE'
    },
    {
      type: 'RESISTANCE',
      level: 2950,
      strength: 7.1,
      touches: 2,
      lastTested: '2025-01-25T11:45:00Z',
      status: 'ACTIVE'
    },
    {
      type: 'SUPPORT',
      level: 2720,
      strength: 6.8,
      touches: 3,
      lastTested: '2025-01-24T09:20:00Z',
      status: 'BROKEN'
    }
  ]);

  const getPatternIcon = (pattern: string) => {
    if (pattern.includes('Triangle') || pattern.includes('Flag')) return <TrendingUp size={16} />;
    if (pattern.includes('Head') || pattern.includes('Top')) return <TrendingDown size={16} />;
    return <Activity size={16} />;
  };

  const getDirectionColor = (direction: string) => {
    switch (direction) {
      case 'BULLISH': return 'success.600';
      case 'BEARISH': return 'danger.600';
      default: return 'warning.600';
    }
  };



  const getStrengthColor = (strength: number) => {
    if (strength >= 8) return 'success.600';
    if (strength >= 6) return 'warning.600';
    return 'danger.600';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'ai';
      case 'COMPLETED': return 'success';
      case 'FAILED': return 'danger';
      default: return 'neutral';
    }
  };

  return (
    <Box>
      {/* Header */}
      <Card.Root mb={6}>
        <Card.Body>
          <Flex justify="space-between" align="center" mb={4}>
            <Flex align="center" gap={3}>
              <Icon color="ai.600">
                <BarChart3 size={24} />
              </Icon>
              <Box>
                <Text textStyle="heading.md" color="neutral.900">
                  Advanced Technical Analysis
                </Text>
                <Text fontSize="sm" color="neutral.600">
                  AI-powered pattern recognition and technical indicators
                </Text>
              </Box>
            </Flex>
            
            <Flex align="center" gap={3}>
              <Select.Root 
                collection={symbolOptions}
                value={[selectedSymbol]} 
                onValueChange={(e) => setSelectedSymbol(e.value[0])}
              >
                <Select.Trigger minW="120px">
                  <Select.ValueText />
                </Select.Trigger>
                <Select.Content>
                  {symbolOptions.items.map((symbol) => (
                    <Select.Item key={symbol.value} item={symbol}>
                      {symbol.label}
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select.Root>
              
              <Select.Root 
                collection={timeframeOptions}
                value={[selectedTimeframe]} 
                onValueChange={(e) => setSelectedTimeframe(e.value[0] as ChartTimeframe)}
              >
                <Select.Trigger minW="100px">
                  <Select.ValueText />
                </Select.Trigger>
                <Select.Content>
                  {timeframeOptions.items.map((timeframe) => (
                    <Select.Item key={timeframe.value} item={timeframe}>
                      {timeframe.label}
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select.Root>
            </Flex>
          </Flex>
        </Card.Body>
      </Card.Root>

      <Tabs.Root value={activeTab} onValueChange={(e) => setActiveTab(e.value)}>
        <Tabs.List mb={6}>
          <Tabs.Trigger value="patterns">Pattern Recognition</Tabs.Trigger>
          <Tabs.Trigger value="indicators">Technical Indicators</Tabs.Trigger>
          <Tabs.Trigger value="levels">Support/Resistance</Tabs.Trigger>
          <Tabs.Trigger value="scanner">Pattern Scanner</Tabs.Trigger>
        </Tabs.List>

        {/* Pattern Recognition Tab */}
        <Tabs.Content value="patterns">
          <SimpleGrid columns={{ base: 1, lg: 2 }} gap={6}>
            {/* Detected Patterns */}
            <Card.Root>
              <Card.Body>
                <Flex align="center" gap={2} mb={4}>
                  <Icon color="ai.600"><Eye size={20} /></Icon>
                  <Text fontWeight="semibold">Detected Patterns</Text>
                </Flex>
                
                <Stack gap={4}>
                  {patterns.filter(p => p.symbol === selectedSymbol).map((pattern) => (
                    <Box
                      key={pattern.id}
                      p={4}
                      bg="ai.50"
                      borderRadius="md"
                      border="1px solid"
                      borderColor="ai.200"
                    >
                      <Flex justify="space-between" align="flex-start" mb={2}>
                        <Flex align="center" gap={2}>
                          <Icon color={getDirectionColor(pattern.direction)}>
                            {getPatternIcon(pattern.pattern)}
                          </Icon>
                          <Box>
                            <Text fontWeight="semibold" color="ai.800">
                              {pattern.pattern}
                            </Text>
                            <Text fontSize="xs" color="neutral.600">
                              {pattern.timeframe} • {new Date(pattern.detectedAt).toLocaleTimeString()}
                            </Text>
                          </Box>
                        </Flex>
                        <Badge colorPalette={getStatusColor(pattern.status)} size="sm">
                          {pattern.status}
                        </Badge>
                      </Flex>

                      <SimpleGrid columns={3} gap={3} mb={3}>
                        <Box>
                          <Text fontSize="xs" color="neutral.600">Target</Text>
                          <Text fontSize="sm" fontWeight="bold" color="success.600">
                            {formatCurrency(pattern.targetPrice)}
                          </Text>
                        </Box>
                        <Box>
                          <Text fontSize="xs" color="neutral.600">Stop Loss</Text>
                          <Text fontSize="sm" fontWeight="bold" color="danger.600">
                            {formatCurrency(pattern.stopLoss)}
                          </Text>
                        </Box>
                        <Box>
                          <Text fontSize="xs" color="neutral.600">Probability</Text>
                          <Text fontSize="sm" fontWeight="bold" color="ai.600">
                            {pattern.probability.toFixed(1)}%
                          </Text>
                        </Box>
                      </SimpleGrid>

                      <Flex justify="space-between" align="center">
                        <Box>
                          <Text fontSize="xs" color="neutral.600">Confidence</Text>
                          <Text fontSize="sm" fontWeight="bold" color="ai.600">
                            {(pattern.confidence * 100).toFixed(0)}%
                          </Text>
                        </Box>
                        <Button size="sm" variant="outline" colorPalette="ai">
                          View Chart
                        </Button>
                      </Flex>
                    </Box>
                  ))}
                </Stack>
              </Card.Body>
            </Card.Root>

            {/* Pattern Statistics */}
            <Stack gap={6}>
              <Card.Root layerStyle="card.ai">
                <Card.Body>
                  <Flex align="center" gap={2} mb={4}>
                    <Icon color="ai.600"><Target size={20} /></Icon>
                    <Text fontWeight="semibold" color="ai.800">Pattern Success Rate</Text>
                  </Flex>
                  
                  <Stack gap={3}>
                    <Box>
                      <Flex justify="space-between" mb={1}>
                        <Text fontSize="sm" color="ai.700">Bullish Patterns</Text>
                        <Text fontSize="sm" fontWeight="bold" color="success.600">78.5%</Text>
                      </Flex>
                      <Box bg="ai.100" borderRadius="full" h="6px">
                        <Box bg="success.500" h="6px" borderRadius="full" w="78.5%" />
                      </Box>
                    </Box>
                    
                    <Box>
                      <Flex justify="space-between" mb={1}>
                        <Text fontSize="sm" color="ai.700">Bearish Patterns</Text>
                        <Text fontSize="sm" fontWeight="bold" color="danger.600">72.3%</Text>
                      </Flex>
                      <Box bg="ai.100" borderRadius="full" h="6px">
                        <Box bg="danger.500" h="6px" borderRadius="full" w="72.3%" />
                      </Box>
                    </Box>
                    
                    <Box>
                      <Flex justify="space-between" mb={1}>
                        <Text fontSize="sm" color="ai.700">Overall Accuracy</Text>
                        <Text fontSize="sm" fontWeight="bold" color="ai.600">75.8%</Text>
                      </Flex>
                      <Box bg="ai.100" borderRadius="full" h="6px">
                        <Box bg="ai.500" h="6px" borderRadius="full" w="75.8%" />
                      </Box>
                    </Box>
                  </Stack>
                </Card.Body>
              </Card.Root>

              <Card.Root>
                <Card.Body>
                  <Text fontWeight="semibold" color="neutral.900" mb={4}>
                    Recent Alerts
                  </Text>
                  
                  <Stack gap={3}>
                    <Box p={3} bg="success.50" borderRadius="md" borderLeft="3px solid" borderColor="success.500">
                      <Flex align="center" gap={2} mb={1}>
                        <Icon color="success.600"><CheckCircle size={14} /></Icon>
                        <Text fontSize="sm" fontWeight="medium" color="success.800">
                          Pattern Completed
                        </Text>
                      </Flex>
                      <Text fontSize="xs" color="success.700">
                        HDFC Double Bottom reached target price
                      </Text>
                      <Text fontSize="xs" color="neutral.600">15 minutes ago</Text>
                    </Box>
                    
                    <Box p={3} bg="ai.50" borderRadius="md" borderLeft="3px solid" borderColor="ai.500">
                      <Flex align="center" gap={2} mb={1}>
                        <Icon color="ai.600"><Eye size={14} /></Icon>
                        <Text fontSize="sm" fontWeight="medium" color="ai.800">
                          New Pattern Detected
                        </Text>
                      </Flex>
                      <Text fontSize="xs" color="ai.700">
                        INFY Bull Flag pattern forming
                      </Text>
                      <Text fontSize="xs" color="neutral.600">1 hour ago</Text>
                    </Box>
                  </Stack>
                </Card.Body>
              </Card.Root>
            </Stack>
          </SimpleGrid>
        </Tabs.Content>

        {/* Technical Indicators Tab */}
        <Tabs.Content value="indicators">
          <SimpleGrid columns={{ base: 1, lg: 2 }} gap={6}>
            <Card.Root>
              <Card.Body>
                <Text fontWeight="semibold" color="neutral.900" mb={4}>
                  Technical Indicators - {selectedSymbol}
                </Text>
                
                <Table.Root variant="outline" size="sm">
                  <Table.Header>
                    <Table.Row>
                      <Table.ColumnHeader>Indicator</Table.ColumnHeader>
                      <Table.ColumnHeader>Value</Table.ColumnHeader>
                      <Table.ColumnHeader>Signal</Table.ColumnHeader>
                      <Table.ColumnHeader>Strength</Table.ColumnHeader>
                    </Table.Row>
                  </Table.Header>
                  <Table.Body>
                    {technicalIndicators.map((indicator) => (
                      <Table.Row key={indicator.name}>
                        <Table.Cell>
                          <Box>
                            <Text fontWeight="medium" fontSize="sm">
                              {indicator.name}
                            </Text>
                            <Text fontSize="xs" color="neutral.600">
                              {indicator.description}
                            </Text>
                          </Box>
                        </Table.Cell>
                        <Table.Cell>
                          <Text fontSize="sm" fontWeight="medium">
                            {indicator.value.toFixed(1)}
                          </Text>
                        </Table.Cell>
                        <Table.Cell>
                          <Badge 
                            colorPalette={indicator.signal === 'BUY' ? 'success' : indicator.signal === 'SELL' ? 'danger' : 'warning'} 
                            size="sm"
                          >
                            {indicator.signal}
                          </Badge>
                        </Table.Cell>
                        <Table.Cell>
                          <Flex align="center" gap={2}>
                            <Text 
                              fontSize="sm" 
                              fontWeight="bold" 
                              color={getStrengthColor(indicator.strength)}
                            >
                              {indicator.strength.toFixed(1)}
                            </Text>
                            <Box w="40px" bg="neutral.200" borderRadius="full" h="4px">
                              <Box 
                                bg={getStrengthColor(indicator.strength)} 
                                h="4px" 
                                borderRadius="full" 
                                w={`${(indicator.strength / 10) * 100}%`} 
                              />
                            </Box>
                          </Flex>
                        </Table.Cell>
                      </Table.Row>
                    ))}
                  </Table.Body>
                </Table.Root>
              </Card.Body>
            </Card.Root>

            <Card.Root>
              <Card.Body>
                <Text fontWeight="semibold" color="neutral.900" mb={4}>
                  Overall Technical Signal
                </Text>
                
                <Box textAlign="center" mb={6}>
                  <Text fontSize="3xl" fontWeight="bold" color="success.600" mb={2}>
                    BUY
                  </Text>
                  <Text fontSize="sm" color="neutral.600" mb={4}>
                    Strong bullish signals detected
                  </Text>
                  
                  <SimpleGrid columns={3} gap={4} mb={4}>
                    <Box textAlign="center">
                      <Text fontSize="lg" fontWeight="bold" color="success.600">6</Text>
                      <Text fontSize="xs" color="success.600">Bullish</Text>
                    </Box>
                    <Box textAlign="center">
                      <Text fontSize="lg" fontWeight="bold" color="warning.600">2</Text>
                      <Text fontSize="xs" color="warning.600">Neutral</Text>
                    </Box>
                    <Box textAlign="center">
                      <Text fontSize="lg" fontWeight="bold" color="danger.600">0</Text>
                      <Text fontSize="xs" color="danger.600">Bearish</Text>
                    </Box>
                  </SimpleGrid>
                </Box>

                <Alert.Root status="success">
                  <Alert.Indicator />
                  <Box>
                    <Alert.Title>Strong Buy Signal</Alert.Title>
                    <Text fontSize="sm">
                      Multiple indicators confirm bullish momentum. 
                      Consider entering position with proper risk management.
                    </Text>
                  </Box>
                </Alert.Root>
              </Card.Body>
            </Card.Root>
          </SimpleGrid>
        </Tabs.Content>

        {/* Support/Resistance Tab */}
        <Tabs.Content value="levels">
          <Card.Root>
            <Card.Body>
              <Text fontWeight="semibold" color="neutral.900" mb={4}>
                Key Support & Resistance Levels - {selectedSymbol}
              </Text>
              
              <Table.Root variant="outline">
                <Table.Header>
                  <Table.Row>
                    <Table.ColumnHeader>Type</Table.ColumnHeader>
                    <Table.ColumnHeader>Level</Table.ColumnHeader>
                    <Table.ColumnHeader>Strength</Table.ColumnHeader>
                    <Table.ColumnHeader>Touches</Table.ColumnHeader>
                    <Table.ColumnHeader>Last Tested</Table.ColumnHeader>
                    <Table.ColumnHeader>Status</Table.ColumnHeader>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {supportResistanceLevels.map((level, index) => (
                    <Table.Row key={index}>
                      <Table.Cell>
                        <Badge 
                          colorPalette={level.type === 'RESISTANCE' ? 'danger' : 'success'} 
                          size="sm"
                        >
                          {level.type}
                        </Badge>
                      </Table.Cell>
                      <Table.Cell>
                        <Text fontWeight="medium">
                          {formatCurrency(level.level)}
                        </Text>
                      </Table.Cell>
                      <Table.Cell>
                        <Flex align="center" gap={2}>
                          <Text 
                            fontSize="sm" 
                            fontWeight="bold" 
                            color={getStrengthColor(level.strength)}
                          >
                            {level.strength.toFixed(1)}
                          </Text>
                          <Box w="50px" bg="neutral.200" borderRadius="full" h="4px">
                            <Box 
                              bg={getStrengthColor(level.strength)} 
                              h="4px" 
                              borderRadius="full" 
                              w={`${(level.strength / 10) * 100}%`} 
                            />
                          </Box>
                        </Flex>
                      </Table.Cell>
                      <Table.Cell>
                        <Text fontSize="sm">{level.touches}</Text>
                      </Table.Cell>
                      <Table.Cell>
                        <Text fontSize="sm" color="neutral.600">
                          {new Date(level.lastTested).toLocaleDateString()}
                        </Text>
                      </Table.Cell>
                      <Table.Cell>
                        <Badge 
                          colorPalette={level.status === 'ACTIVE' ? 'success' : 'danger'} 
                          size="sm"
                        >
                          {level.status}
                        </Badge>
                      </Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table.Root>
            </Card.Body>
          </Card.Root>
        </Tabs.Content>

        {/* Pattern Scanner Tab */}
        <Tabs.Content value="scanner">
          <Card.Root>
            <Card.Body>
              <Flex justify="space-between" align="center" mb={4}>
                <Text fontWeight="semibold" color="neutral.900">
                  Market-wide Pattern Scanner
                </Text>
                <Button colorPalette="ai">
                  <Icon><Zap size={16} /></Icon>
                  Scan Market
                </Button>
              </Flex>
              
              <Alert.Root status="info" mb={4}>
                <Alert.Indicator />
                <Box>
                  <Alert.Title>Live Pattern Scanning</Alert.Title>
                  <Text fontSize="sm">
                    AI continuously scans 500+ stocks for emerging patterns. 
                    Last scan: 2 minutes ago
                  </Text>
                </Box>
              </Alert.Root>

              <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={4}>
                <Box p={4} bg="success.50" borderRadius="md" border="1px solid" borderColor="success.200">
                  <Text fontWeight="semibold" color="success.800" mb={2}>
                    Bullish Patterns Found
                  </Text>
                  <Text fontSize="2xl" fontWeight="bold" color="success.600" mb={1}>
                    23
                  </Text>
                  <Text fontSize="sm" color="success.700">
                    Across 18 stocks
                  </Text>
                </Box>

                <Box p={4} bg="danger.50" borderRadius="md" border="1px solid" borderColor="danger.200">
                  <Text fontWeight="semibold" color="danger.800" mb={2}>
                    Bearish Patterns Found
                  </Text>
                  <Text fontSize="2xl" fontWeight="bold" color="danger.600" mb={1}>
                    12
                  </Text>
                  <Text fontSize="sm" color="danger.700">
                    Across 10 stocks
                  </Text>
                </Box>

                <Box p={4} bg="ai.50" borderRadius="md" border="1px solid" borderColor="ai.200">
                  <Text fontWeight="semibold" color="ai.800" mb={2}>
                    High Confidence
                  </Text>
                  <Text fontSize="2xl" fontWeight="bold" color="ai.600" mb={1}>
                    8
                  </Text>
                  <Text fontSize="sm" color="ai.700">
                    Above 80% confidence
                  </Text>
                </Box>
              </SimpleGrid>
            </Card.Body>
          </Card.Root>
        </Tabs.Content>
      </Tabs.Root>
    </Box>
  );
};