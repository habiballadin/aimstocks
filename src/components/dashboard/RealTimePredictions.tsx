import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Text, 
  Box, 
  Flex, 
  SimpleGrid,

  Button,
  Badge,
  Progress,
  Stack,
  Table,
  Select,
  createListCollection
} from '@chakra-ui/react';
import { 
  Brain, 
  TrendingUp, 
  TrendingDown,
  Zap,
  Target,
  Clock,
  Activity,
  AlertTriangle,
  CheckCircle,
  RefreshCw
} from 'lucide-react';
import { PriceDisplay } from '../common/PriceDisplay';
import { AIConfidenceIndicator } from '../common/AIConfidenceIndicator';

import { formatCurrency, formatPercentage } from '../../utils/formatters';
import { useRealTimeData } from '../../hooks/useRealTimeData';

interface PredictionData {
  symbol: string;
  companyName: string;
  currentPrice: number;
  change: number;
  changePercent: number;
  
  // Short-term predictions (1-5 days)
  shortTerm: {
    targetPrice: number;
    probability: number;
    direction: 'UP' | 'DOWN' | 'SIDEWAYS';
    confidence: number;
    timeframe: string;
    factors: string[];
  };
  
  // Medium-term predictions (1-4 weeks)
  mediumTerm: {
    targetPrice: number;
    probability: number;
    direction: 'UP' | 'DOWN' | 'SIDEWAYS';
    confidence: number;
    timeframe: string;
    factors: string[];
  };
  
  // Long-term predictions (1-6 months)
  longTerm: {
    targetPrice: number;
    probability: number;
    direction: 'UP' | 'DOWN' | 'SIDEWAYS';
    confidence: number;
    timeframe: string;
    factors: string[];
  };
  
  // AI Signals
  signals: {
    momentum: number;
    volatility: number;
    sentiment: number;
    technical: number;
    fundamental: number;
  };
  
  // Risk Assessment
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  riskFactors: string[];
  
  lastUpdated: string;
}

interface MarketPrediction {
  index: string;
  currentValue: number;
  prediction: {
    target: number;
    probability: number;
    timeframe: string;
    confidence: number;
  };
  factors: string[];
}

export const RealTimePredictions: React.FC = () => {
  const [selectedTimeframe, setSelectedTimeframe] = useState('short');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  // Mock real-time data - in real app, this would come from WebSocket
  const { isConnected } = useRealTimeData('/api/predictions');

  const [predictions] = useState<PredictionData[]>([
    {
      symbol: 'RELIANCE',
      companyName: 'Reliance Industries Limited',
      currentPrice: 2847.65,
      change: 45.20,
      changePercent: 1.61,
      
      shortTerm: {
        targetPrice: 2920.00,
        probability: 78.5,
        direction: 'UP',
        confidence: 0.82,
        timeframe: '1-3 days',
        factors: ['Technical breakout', 'Volume surge', 'Positive momentum']
      },
      
      mediumTerm: {
        targetPrice: 3100.00,
        probability: 72.3,
        direction: 'UP',
        confidence: 0.75,
        timeframe: '2-4 weeks',
        factors: ['Q3 results beat', 'Sector rotation', 'Institutional buying']
      },
      
      longTerm: {
        targetPrice: 3250.00,
        probability: 68.7,
        direction: 'UP',
        confidence: 0.71,
        timeframe: '3-6 months',
        factors: ['Expansion plans', 'Market leadership', 'Dividend growth']
      },
      
      signals: {
        momentum: 8.2,
        volatility: 6.5,
        sentiment: 7.8,
        technical: 8.5,
        fundamental: 8.0
      },
      
      riskLevel: 'MEDIUM',
      riskFactors: ['Commodity price volatility', 'Regulatory changes'],
      lastUpdated: new Date().toISOString()
    },
    {
      symbol: 'TCS',
      companyName: 'Tata Consultancy Services',
      currentPrice: 4125.30,
      change: -25.70,
      changePercent: -0.62,
      
      shortTerm: {
        targetPrice: 4080.00,
        probability: 65.2,
        direction: 'DOWN',
        confidence: 0.68,
        timeframe: '1-2 days',
        factors: ['Profit booking', 'Technical resistance', 'Weak momentum']
      },
      
      mediumTerm: {
        targetPrice: 4300.00,
        probability: 74.1,
        direction: 'UP',
        confidence: 0.76,
        timeframe: '2-3 weeks',
        factors: ['Strong fundamentals', 'Digital transformation', 'Client wins']
      },
      
      longTerm: {
        targetPrice: 4500.00,
        probability: 71.8,
        direction: 'UP',
        confidence: 0.73,
        timeframe: '4-6 months',
        factors: ['AI adoption', 'Cloud growth', 'Market expansion']
      },
      
      signals: {
        momentum: 6.8,
        volatility: 5.2,
        sentiment: 8.1,
        technical: 6.5,
        fundamental: 9.2
      },
      
      riskLevel: 'LOW',
      riskFactors: ['Currency fluctuation', 'Competition'],
      lastUpdated: new Date().toISOString()
    },
    {
      symbol: 'INFY',
      companyName: 'Infosys Limited',
      currentPrice: 1847.90,
      change: 18.45,
      changePercent: 1.01,
      
      shortTerm: {
        targetPrice: 1880.00,
        probability: 71.4,
        direction: 'UP',
        confidence: 0.74,
        timeframe: '2-4 days',
        factors: ['Bullish pattern', 'Volume confirmation', 'Sector strength']
      },
      
      mediumTerm: {
        targetPrice: 1950.00,
        probability: 69.8,
        direction: 'UP',
        confidence: 0.72,
        timeframe: '3-4 weeks',
        factors: ['Deal pipeline', 'Margin expansion', 'Digital deals']
      },
      
      longTerm: {
        targetPrice: 2100.00,
        probability: 66.5,
        direction: 'UP',
        confidence: 0.69,
        timeframe: '5-6 months',
        factors: ['AI capabilities', 'Cloud migration', 'Cost optimization']
      },
      
      signals: {
        momentum: 7.5,
        volatility: 6.8,
        sentiment: 7.2,
        technical: 7.8,
        fundamental: 8.3
      },
      
      riskLevel: 'MEDIUM',
      riskFactors: ['Client concentration', 'Visa issues'],
      lastUpdated: new Date().toISOString()
    }
  ]);

  const [marketPredictions] = useState<MarketPrediction[]>([
    {
      index: 'NIFTY 50',
      currentValue: 24850.75,
      prediction: {
        target: 25200.00,
        probability: 73.2,
        timeframe: '1-2 weeks',
        confidence: 0.75
      },
      factors: ['FII inflows', 'Earnings season', 'Global cues']
    },
    {
      index: 'BANK NIFTY',
      currentValue: 52347.85,
      prediction: {
        target: 53500.00,
        probability: 68.7,
        timeframe: '2-3 weeks',
        confidence: 0.71
      },
      factors: ['Credit growth', 'NIM expansion', 'Asset quality']
    },
    {
      index: 'NIFTY IT',
      currentValue: 43256.20,
      prediction: {
        target: 44800.00,
        probability: 71.5,
        timeframe: '1-3 weeks',
        confidence: 0.73
      },
      factors: ['Digital transformation', 'AI adoption', 'Deal wins']
    }
  ]);

  const getDirectionIcon = (direction: string) => {
    switch (direction) {
      case 'UP': return <TrendingUp size={16} />;
      case 'DOWN': return <TrendingDown size={16} />;
      default: return <Activity size={16} />;
    }
  };

  const getDirectionColor = (direction: string) => {
    switch (direction) {
      case 'UP': return 'success.600';
      case 'DOWN': return 'danger.600';
      default: return 'warning.600';
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'LOW': return 'success';
      case 'MEDIUM': return 'warning';
      case 'HIGH': return 'danger';
      default: return 'neutral';
    }
  };

  const getSignalScore = (score: number) => {
    return score >= 8 ? 'success.600' : score >= 6 ? 'warning.600' : 'danger.600';
  };

  const getCurrentPrediction = (prediction: PredictionData) => {
    switch (selectedTimeframe) {
      case 'medium': return prediction.mediumTerm;
      case 'long': return prediction.longTerm;
      default: return prediction.shortTerm;
    }
  };

  // Auto-refresh every 30 seconds
  useEffect(() => {
    if (!autoRefresh) return;
    
    const interval = setInterval(() => {
      setLastUpdate(new Date());
    }, 30000);
    
    return () => clearInterval(interval);
  }, [autoRefresh]);

  return (
    <Box>
      {/* Header */}
      <Card.Root mb={6}>
        <Card.Body>
          <Flex justify="space-between" align="center" mb={4}>
            <Flex align="center" gap={3}>
              <Brain size={24} color="#3182ce" />
              <Box>
                <Text textStyle="heading.md" color="neutral.900">
                  Real-Time AI Predictions
                </Text>
                <Text fontSize="sm" color="neutral.600">
                  Live market predictions powered by machine learning
                </Text>
              </Box>
            </Flex>
            
            <Flex align="center" gap={3}>
              <Flex align="center" gap={2}>
                <Zap size={16} color={isConnected ? '#38a169' : '#e53e3e'} />
                <Text fontSize="sm" color={isConnected ? 'success.600' : 'danger.600'}>
                  {isConnected ? 'Live' : 'Disconnected'}
                </Text>
              </Flex>
              
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => setAutoRefresh(!autoRefresh)}
              >
                <RefreshCw size={16} />
                {autoRefresh ? 'Auto' : 'Manual'}
              </Button>
              
              <Select.Root 
                collection={createListCollection({
                  items: [
                    { label: 'Short Term', value: 'short' },
                    { label: 'Medium Term', value: 'medium' },
                    { label: 'Long Term', value: 'long' }
                  ]
                })}
                value={[selectedTimeframe]} 
                onValueChange={(e) => setSelectedTimeframe(e.value[0])}
              >
                <Select.Trigger minW="120px">
                  <Select.ValueText />
                </Select.Trigger>
                <Select.Content>
                  <Select.Item item="short">Short Term</Select.Item>
                  <Select.Item item="medium">Medium Term</Select.Item>
                  <Select.Item item="long">Long Term</Select.Item>
                </Select.Content>
              </Select.Root>
            </Flex>
          </Flex>
          
          <Text fontSize="xs" color="neutral.500">
            Last updated: {lastUpdate.toLocaleTimeString()}
          </Text>
        </Card.Body>
      </Card.Root>

      {/* Market Predictions */}
      <Card.Root mb={6}>
        <Card.Body>
          <Text fontWeight="semibold" color="neutral.900" mb={4}>
            Market Index Predictions
          </Text>
          
          <SimpleGrid columns={{ base: 1, md: 3 }} gap={4}>
            {marketPredictions.map((market) => (
              <Box
                key={market.index}
                p={4}
                bg="ai.50"
                borderRadius="md"
                border="1px solid"
                borderColor="ai.200"
              >
                <Flex justify="space-between" align="center" mb={2}>
                  <Text fontWeight="semibold" color="ai.800">
                    {market.index}
                  </Text>
                  <Badge colorPalette="ai" size="sm">
                    {(market.prediction.confidence * 100).toFixed(0)}%
                  </Badge>
                </Flex>
                
                <Text fontSize="lg" fontWeight="bold" color="neutral.900" mb={1}>
                  {market.currentValue.toLocaleString()}
                </Text>
                
                <Flex align="center" gap={2} mb={2}>
                  <TrendingUp size={14} color="#38a169" />
                  <Text fontSize="sm" color="success.600" fontWeight="medium">
                    Target: {market.prediction.target.toLocaleString()}
                  </Text>
                </Flex>
                
                <Text fontSize="xs" color="ai.700" mb={2}>
                  {market.prediction.timeframe} • {market.prediction.probability.toFixed(1)}% probability
                </Text>
                
                <Text fontSize="xs" color="neutral.600">
                  Key factors: {market.factors.slice(0, 2).join(', ')}
                </Text>
              </Box>
            ))}
          </SimpleGrid>
        </Card.Body>
      </Card.Root>

      {/* Stock Predictions */}
      <Card.Root>
        <Card.Body>
          <Text fontWeight="semibold" color="neutral.900" mb={4}>
            Individual Stock Predictions
          </Text>
          
          <Table.Root variant="outline" size="sm">
            <Table.Header>
              <Table.Row>
                <Table.ColumnHeader>Stock</Table.ColumnHeader>
                <Table.ColumnHeader>Current Price</Table.ColumnHeader>
                <Table.ColumnHeader>Prediction</Table.ColumnHeader>
                <Table.ColumnHeader>Probability</Table.ColumnHeader>
                <Table.ColumnHeader>AI Signals</Table.ColumnHeader>
                <Table.ColumnHeader>Risk</Table.ColumnHeader>
                <Table.ColumnHeader>Confidence</Table.ColumnHeader>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {predictions.map((prediction) => {
                const currentPrediction = getCurrentPrediction(prediction);
                const potentialReturn = ((currentPrediction.targetPrice - prediction.currentPrice) / prediction.currentPrice) * 100;
                
                return (
                  <Table.Row key={prediction.symbol} _hover={{ bg: 'neutral.50' }}>
                    <Table.Cell>
                      <Box>
                        <Text fontWeight="semibold" color="neutral.900">
                          {prediction.symbol}
                        </Text>
                        <Text fontSize="xs" color="neutral.600">
                          {prediction.companyName}
                        </Text>
                      </Box>
                    </Table.Cell>
                    
                    <Table.Cell>
                      <PriceDisplay 
                        price={prediction.currentPrice}
                        change={prediction.change}
                        changePercent={prediction.changePercent}
                        size="sm"
                      />
                    </Table.Cell>
                    
                    <Table.Cell>
                      <Stack gap={1}>
                        <Flex align="center" gap={2}>
                          <div style={{ color: getDirectionColor(currentPrediction.direction) === 'success.600' ? '#38a169' : getDirectionColor(currentPrediction.direction) === 'danger.600' ? '#e53e3e' : '#d69e2e' }}>
                            {getDirectionIcon(currentPrediction.direction)}
                          </div>
                          <Text fontSize="sm" fontWeight="medium">
                            {formatCurrency(currentPrediction.targetPrice)}
                          </Text>
                        </Flex>
                        <Text fontSize="xs" color={potentialReturn >= 0 ? 'success.600' : 'danger.600'}>
                          {formatPercentage(potentialReturn)} potential
                        </Text>
                        <Text fontSize="xs" color="neutral.500">
                          {currentPrediction.timeframe}
                        </Text>
                      </Stack>
                    </Table.Cell>
                    
                    <Table.Cell>
                      <Stack gap={1}>
                        <Text fontSize="sm" fontWeight="bold" color="ai.600">
                          {currentPrediction.probability.toFixed(1)}%
                        </Text>
                        <Progress.Root 
                          value={currentPrediction.probability} 
                          size="sm" 
                          colorPalette="ai"
                          w="60px"
                        >
                          <Progress.Track>
                            <Progress.Range />
                          </Progress.Track>
                        </Progress.Root>
                      </Stack>
                    </Table.Cell>
                    
                    <Table.Cell>
                      <SimpleGrid columns={2} gap={1} fontSize="xs">
                        <Flex justify="space-between">
                          <Text color="neutral.600">Mom:</Text>
                          <Text color={getSignalScore(prediction.signals.momentum)} fontWeight="medium">
                            {prediction.signals.momentum.toFixed(1)}
                          </Text>
                        </Flex>
                        <Flex justify="space-between">
                          <Text color="neutral.600">Tech:</Text>
                          <Text color={getSignalScore(prediction.signals.technical)} fontWeight="medium">
                            {prediction.signals.technical.toFixed(1)}
                          </Text>
                        </Flex>
                        <Flex justify="space-between">
                          <Text color="neutral.600">Sent:</Text>
                          <Text color={getSignalScore(prediction.signals.sentiment)} fontWeight="medium">
                            {prediction.signals.sentiment.toFixed(1)}
                          </Text>
                        </Flex>
                        <Flex justify="space-between">
                          <Text color="neutral.600">Fund:</Text>
                          <Text color={getSignalScore(prediction.signals.fundamental)} fontWeight="medium">
                            {prediction.signals.fundamental.toFixed(1)}
                          </Text>
                        </Flex>
                      </SimpleGrid>
                    </Table.Cell>
                    
                    <Table.Cell>
                      <Badge colorPalette={getRiskColor(prediction.riskLevel)} size="sm">
                        {prediction.riskLevel}
                      </Badge>
                    </Table.Cell>
                    
                    <Table.Cell>
                      <AIConfidenceIndicator 
                        confidence={currentPrediction.confidence}
                        size="sm"
                      />
                    </Table.Cell>
                  </Table.Row>
                );
              })}
            </Table.Body>
          </Table.Root>
        </Card.Body>
      </Card.Root>

      {/* Prediction Details */}
      <SimpleGrid columns={{ base: 1, lg: 2 }} gap={6} mt={6}>
        <Card.Root layerStyle="card.ai">
          <Card.Body>
            <Flex align="center" gap={2} mb={4}>
              <Target size={20} color="#3182ce" />
              <Text fontWeight="semibold">AI Model Performance</Text>
            </Flex>
            
            <Stack gap={3}>
              <Box>
                <Flex justify="space-between" mb={1}>
                  <Text fontSize="sm">Prediction Accuracy (7 days)</Text>
                  <Text fontSize="sm" fontWeight="bold" color="success.600">84.2%</Text>
                </Flex>
                <Progress.Root value={84.2} colorPalette="success">
                  <Progress.Track><Progress.Range /></Progress.Track>
                </Progress.Root>
              </Box>
              
              <Box>
                <Flex justify="space-between" mb={1}>
                  <Text fontSize="sm">Model Confidence</Text>
                  <Text fontSize="sm" fontWeight="bold" color="ai.600">91.5%</Text>
                </Flex>
                <Progress.Root value={91.5} colorPalette="ai">
                  <Progress.Track><Progress.Range /></Progress.Track>
                </Progress.Root>
              </Box>
              
              <Box>
                <Flex justify="space-between" mb={1}>
                  <Text fontSize="sm">Success Rate (30 days)</Text>
                  <Text fontSize="sm" fontWeight="bold" color="success.600">78.9%</Text>
                </Flex>
                <Progress.Root value={78.9} colorPalette="success">
                  <Progress.Track><Progress.Range /></Progress.Track>
                </Progress.Root>
              </Box>
            </Stack>
          </Card.Body>
        </Card.Root>

        <Card.Root>
          <Card.Body>
            <Flex align="center" gap={2} mb={4}>
              <AlertTriangle size={20} color="#d69e2e" />
              <Text fontWeight="semibold">Market Alerts</Text>
            </Flex>
            
            <Stack gap={3}>
              <Box p={3} bg="success.50" borderRadius="md" borderLeft="3px solid" borderColor="success.500">
                <Flex align="center" gap={2} mb={1}>
                  <CheckCircle size={14} color="#38a169" />
                  <Text fontSize="sm" fontWeight="medium" color="success.800">
                    Bullish Breakout Detected
                  </Text>
                </Flex>
                <Text fontSize="xs" color="success.700">
                  RELIANCE showing strong momentum above key resistance
                </Text>
                <Text fontSize="xs" color="neutral.600">2 minutes ago</Text>
              </Box>
              
              <Box p={3} bg="warning.50" borderRadius="md" borderLeft="3px solid" borderColor="warning.500">
                <Flex align="center" gap={2} mb={1}>
                  <Clock size={14} color="#d69e2e" />
                  <Text fontSize="sm" fontWeight="medium" color="warning.800">
                    Volatility Spike Alert
                  </Text>
                </Flex>
                <Text fontSize="xs" color="warning.700">
                  Increased volatility expected in IT sector
                </Text>
                <Text fontSize="xs" color="neutral.600">15 minutes ago</Text>
              </Box>
              
              <Box p={3} bg="ai.50" borderRadius="md" borderLeft="3px solid" borderColor="ai.500">
                <Flex align="center" gap={2} mb={1}>
                  <Brain size={14} color="#3182ce" />
                  <Text fontSize="sm" fontWeight="medium" color="ai.800">
                    AI Model Update
                  </Text>
                </Flex>
                <Text fontSize="xs" color="ai.700">
                  New earnings data integrated into predictions
                </Text>
                <Text fontSize="xs" color="neutral.600">1 hour ago</Text>
              </Box>
            </Stack>
          </Card.Body>
        </Card.Root>
      </SimpleGrid>
    </Box>
  );
};