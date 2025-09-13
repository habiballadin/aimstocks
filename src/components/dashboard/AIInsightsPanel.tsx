import React, { useState } from 'react';
import {
  Card,
  Text,
  Box,
  Flex,
  Badge,
  Button,
  Stack
} from '@chakra-ui/react';
import { BrainCircuit, TrendingUp, AlertTriangle, Sparkles } from 'lucide-react';
import { mockQuery } from '../../data/stockTradingMockData';
import { AIConfidenceIndicator } from '../common/AIConfidenceIndicator';

export const AIInsightsPanel: React.FC = () => {
  const [expandedInsight, setExpandedInsight] = useState<string | null>(null);
  const insights = mockQuery.aiInsights;

  const getHexColor = (chakraColor: string) => {
    switch (chakraColor) {
      case 'ai.600': return '#4A5568';
      case 'ai.700': return '#2D3748';
      case 'ai.800': return '#1A202C';
      case 'ai.50': return '#F7FAFC';
      case 'ai.200': return '#E2E8F0';
      case 'ai.300': return '#CBD5E0';
      default: return '#4A5568';
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'HIGH': return 'danger';
      case 'MEDIUM': return 'warning';
      default: return 'neutral';
    }
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'MARKET_SENTIMENT': return TrendingUp;
      case 'PRICE_PREDICTION': return Sparkles;
      case 'SECTOR_ANALYSIS': return AlertTriangle;
      default: return BrainCircuit;
    }
  };

  return (
    <Card.Root layerStyle="card.ai" h="fit-content">
      <Card.Body>
        <Flex align="center" gap={3} mb={4}>
          <BrainCircuit size={24} color={getHexColor('ai.600')} />
          <Box>
            <Text textStyle="heading.md" color="ai.700">
              AI Market Insights
            </Text>
            <Text fontSize="sm" color="neutral.600">
              Real-time AI-powered analysis
            </Text>
          </Box>
        </Flex>

        <Stack gap={3}>
          {insights.map((insight) => (
            <Box
              key={insight.id}
              p={4}
              bg="ai.50"
              borderRadius="md"
              border="1px solid"
              borderColor="ai.200"
              cursor="pointer"
              transition="all 0.2s"
              _hover={{ borderColor: 'ai.300', shadow: 'sm' }}
              onClick={() => setExpandedInsight(
                expandedInsight === insight.id ? null : insight.id
              )}
            >
              <Flex justify="space-between" align="flex-start" mb={2}>
                <Flex align="center" gap={2}>
                  {React.createElement(getInsightIcon(insight.type), { size: 16, color: getHexColor('ai.600') })}
                  <Text fontWeight="semibold" color="ai.800">
                    {insight.title}
                  </Text>
                </Flex>
                <Badge colorPalette={getImpactColor(insight.impact)} size="sm">
                  {insight.impact}
                </Badge>
              </Flex>

              <Text fontSize="sm" color="neutral.700" mb={3}>
                {insight.description}
              </Text>

              <AIConfidenceIndicator 
                confidence={insight.confidence}
                size="sm"
              />

              {expandedInsight === insight.id && (
                <Box mt={3} pt={3} borderTop="1px solid" borderColor="ai.200">
                  <Text fontSize="xs" color="neutral.600" mb={2}>
                    Generated: {new Date(insight.timestamp).toLocaleString()}
                  </Text>
                  <Button size="sm" variant="outline" colorPalette="ai">
                    View Details
                  </Button>
                </Box>
              )}
            </Box>
          ))}
        </Stack>

        <Box mt={4} p={3} bg="gradient.ai" borderRadius="md">
          <Text color="white" fontSize="sm" textAlign="center">
            💡 AI analyzes 1000+ data points every second to generate these insights
          </Text>
        </Box>
      </Card.Body>
    </Card.Root>
  );
};