import React, { useState } from 'react';
import { 
  Card, 
  Text, 
  Box, 
  Flex, 
  Progress,
  Icon,
  Button,
  SimpleGrid,
  Stack,
  Alert,
  Badge
} from '@chakra-ui/react';
import { 
  Shield, 
  AlertTriangle, 
  TrendingDown,
  Target,
  PieChart,
  BarChart3,
  Activity
} from 'lucide-react';
import { mockQuery } from '../../data/stockTradingMockData';
import { formatCurrency } from '../../utils/formatters';

interface RiskMetric {
  name: string;
  value: number;
  maxValue: number;
  status: 'low' | 'medium' | 'high';
  description: string;
}

interface PortfolioRisk {
  overallRisk: number;
  diversification: number;
  volatility: number;
  concentration: number;
  sectorExposure: { [key: string]: number };
  recommendations: string[];
}

export const RiskAnalyzer: React.FC = () => {
  const [showDetails, setShowDetails] = useState(false);
  
  // Calculate portfolio risk metrics
  const portfolio = mockQuery.portfolio;
  const totalValue = portfolio.reduce((sum, holding) => sum + holding.currentValue, 0);
  
  const portfolioRisk: PortfolioRisk = {
    overallRisk: 6.5, // Scale of 1-10
    diversification: 7.2,
    volatility: 18.5, // Percentage
    concentration: 35.2, // Percentage in top holding
    sectorExposure: {
      'Technology': 45.2,
      'Energy': 28.7,
      'Financial': 26.1
    },
    recommendations: [
      'Consider reducing concentration in technology sector',
      'Add defensive stocks to reduce volatility',
      'Increase diversification across market caps',
      'Set stop-loss orders for high-risk positions'
    ]
  };

  const riskMetrics: RiskMetric[] = [
    {
      name: 'Portfolio Risk',
      value: portfolioRisk.overallRisk,
      maxValue: 10,
      status: portfolioRisk.overallRisk > 7 ? 'high' : portfolioRisk.overallRisk > 4 ? 'medium' : 'low',
      description: 'Overall portfolio risk assessment'
    },
    {
      name: 'Diversification',
      value: portfolioRisk.diversification,
      maxValue: 10,
      status: portfolioRisk.diversification < 5 ? 'high' : portfolioRisk.diversification < 7 ? 'medium' : 'low',
      description: 'How well diversified your portfolio is'
    },
    {
      name: 'Volatility',
      value: portfolioRisk.volatility,
      maxValue: 30,
      status: portfolioRisk.volatility > 20 ? 'high' : portfolioRisk.volatility > 15 ? 'medium' : 'low',
      description: 'Expected price fluctuation range'
    },
    {
      name: 'Concentration',
      value: portfolioRisk.concentration,
      maxValue: 50,
      status: portfolioRisk.concentration > 40 ? 'high' : portfolioRisk.concentration > 25 ? 'medium' : 'low',
      description: 'Percentage invested in largest holding'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'low': return 'success';
      case 'medium': return 'warning';
      case 'high': return 'danger';
      default: return 'neutral';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'low': return <Shield size={16} />;
      case 'medium': return <AlertTriangle size={16} />;
      case 'high': return <TrendingDown size={16} />;
      default: return <Activity size={16} />;
    }
  };

  const getRiskLevel = (value: number) => {
    if (value <= 3) return 'Conservative';
    if (value <= 6) return 'Moderate';
    if (value <= 8) return 'Aggressive';
    return 'Very High Risk';
  };

  return (
    <Card.Root>
      <Card.Body>
        <Flex justify="space-between" align="center" mb={6}>
          <Flex align="center" gap={3}>
            <Icon as={Shield} color="warning.600" boxSize={6} />
            <Box>
              <Text textStyle="heading.md" color="neutral.900">
                Risk Analyzer
              </Text>
              <Text fontSize="sm" color="neutral.600">
                Portfolio risk assessment and recommendations
              </Text>
            </Box>
          </Flex>
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => setShowDetails(!showDetails)}
          >
            {showDetails ? 'Hide Details' : 'Show Details'}
          </Button>
        </Flex>

        {/* Overall Risk Score */}
        <Box 
          p={4} 
          bg="warning.50" 
          borderRadius="md"
          border="1px solid"
          borderColor="warning.200"
          mb={6}
        >
          <Flex justify="space-between" align="center" mb={3}>
            <Text fontSize="sm" fontWeight="medium" color="warning.800">
              Overall Portfolio Risk
            </Text>
            <Badge colorPalette={getStatusColor(riskMetrics[0].status)} size="sm">
              {getRiskLevel(portfolioRisk.overallRisk)}
            </Badge>
          </Flex>
          <Progress.Root 
            value={(portfolioRisk.overallRisk / 10) * 100} 
            colorPalette="warning"
            size="lg"
            mb={2}
          >
            <Progress.Track>
              <Progress.Range />
            </Progress.Track>
          </Progress.Root>
          <Flex justify="space-between" align="center">
            <Text fontSize="xs" color="warning.700">
              Risk Score: {portfolioRisk.overallRisk}/10
            </Text>
            <Text fontSize="xs" color="warning.700">
              Expected Annual Volatility: {portfolioRisk.volatility}%
            </Text>
          </Flex>
        </Box>

        {/* Risk Metrics Grid */}
        <SimpleGrid columns={2} gap={4} mb={6}>
          {riskMetrics.map((metric) => (
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
                <Icon as={getStatusIcon(metric.status).type} color={`${getStatusColor(metric.status)}.600`} boxSize={4} />
              </Flex>
              <Progress.Root 
                value={(metric.value / metric.maxValue) * 100} 
                colorPalette={getStatusColor(metric.status)}
                size="sm"
                mb={2}
              >
                <Progress.Track>
                  <Progress.Range />
                </Progress.Track>
              </Progress.Root>
              <Text fontSize="xs" color="neutral.600">
                {metric.description}
              </Text>
            </Box>
          ))}
        </SimpleGrid>

        {/* Sector Exposure */}
        <Box mb={6}>
          <Flex align="center" gap={2} mb={3}>
            <Icon as={PieChart} color="brand.600" boxSize={4} />
            <Text fontSize="sm" fontWeight="medium" color="neutral.900">
              Sector Exposure
            </Text>
          </Flex>
          <Stack gap={3}>
            {Object.entries(portfolioRisk.sectorExposure).map(([sector, percentage]) => (
              <Box key={sector}>
                <Flex justify="space-between" align="center" mb={1}>
                  <Text fontSize="sm" color="neutral.700">{sector}</Text>
                  <Text fontSize="sm" fontWeight="medium" color="neutral.900">
                    {percentage}%
                  </Text>
                </Flex>
                <Progress.Root 
                  value={percentage} 
                  colorPalette="brand"
                  size="sm"
                >
                  <Progress.Track>
                    <Progress.Range />
                  </Progress.Track>
                </Progress.Root>
              </Box>
            ))}
          </Stack>
        </Box>

        {/* Risk Recommendations */}
        <Box>
          <Flex align="center" gap={2} mb={3}>
            <Icon as={Target} color="ai.600" boxSize={4} />
            <Text fontSize="sm" fontWeight="medium" color="neutral.900">
              AI Risk Recommendations
            </Text>
          </Flex>
          <Stack gap={2}>
            {portfolioRisk.recommendations.map((recommendation, index) => (
              <Alert.Root key={index} status="info" size="sm">
                <Alert.Indicator />
                <Alert.Description fontSize="sm">
                  {recommendation}
                </Alert.Description>
              </Alert.Root>
            ))}
          </Stack>
        </Box>

        {/* Detailed Analysis */}
        {showDetails && (
          <Box mt={6} pt={6} borderTop="1px solid" borderColor="neutral.200">
            <Text fontSize="sm" fontWeight="medium" color="neutral.900" mb={4}>
              Detailed Risk Analysis
            </Text>
            
            <SimpleGrid columns={1} gap={4}>
              <Box p={4} bg="neutral.50" borderRadius="md">
                <Flex align="center" gap={2} mb={2}>
                  <Icon color="brand.600">
                    <BarChart3 size={16} />
                  </Icon>
                  <Text fontSize="sm" fontWeight="medium">Value at Risk (VaR)</Text>
                </Flex>
                <Text fontSize="sm" color="neutral.700" mb={1}>
                  1-day VaR (95% confidence): {formatCurrency(totalValue * 0.025)}
                </Text>
                <Text fontSize="xs" color="neutral.600">
                  Maximum expected loss in a single day under normal market conditions
                </Text>
              </Box>

              <Box p={4} bg="neutral.50" borderRadius="md">
                <Flex align="center" gap={2} mb={2}>
                  <Icon color="warning.600">
                    <Activity size={16} />
                  </Icon>
                  <Text fontSize="sm" fontWeight="medium">Beta Analysis</Text>
                </Flex>
                <Text fontSize="sm" color="neutral.700" mb={1}>
                  Portfolio Beta: 1.15 (15% more volatile than market)
                </Text>
                <Text fontSize="xs" color="neutral.600">
                  Measures portfolio sensitivity to market movements
                </Text>
              </Box>

              <Box p={4} bg="neutral.50" borderRadius="md">
                <Flex align="center" gap={2} mb={2}>
                  <Icon color="success.600">
                    <Target size={16} />
                  </Icon>
                  <Text fontSize="sm" fontWeight="medium">Sharpe Ratio</Text>
                </Flex>
                <Text fontSize="sm" color="neutral.700" mb={1}>
                  Current Sharpe Ratio: 1.34 (Good risk-adjusted returns)
                </Text>
                <Text fontSize="xs" color="neutral.600">
                  Measures return per unit of risk taken
                </Text>
              </Box>
            </SimpleGrid>
          </Box>
        )}
      </Card.Body>
    </Card.Root>
  );
};