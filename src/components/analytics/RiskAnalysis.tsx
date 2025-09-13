import React from 'react';
import { Card, Grid, Text, Progress, Badge } from '@chakra-ui/react';
import { Shield, AlertTriangle, TrendingDown, Activity } from 'lucide-react';
import { formatCurrency, formatPercentage } from '../../utils/formatters';

interface RiskAnalysisProps {
  data: {
    valueAtRisk: number;
    expectedShortfall: number;
    portfolioVolatility: number;
    correlationMatrix: number[][];
  };
  period: string;
  detailed?: boolean;
}

export const RiskAnalysis: React.FC<RiskAnalysisProps> = ({ 
  data, 
  period, 
  detailed = false 
}) => {
  const getRiskLevel = (volatility: number) => {
    if (volatility < 10) return { level: 'Low', color: 'success', score: 25 };
    if (volatility < 20) return { level: 'Moderate', color: 'warning', score: 50 };
    if (volatility < 30) return { level: 'High', color: 'orange', score: 75 };
    return { level: 'Very High', color: 'danger', score: 90 };
  };

  const riskLevel = getRiskLevel(data.portfolioVolatility);

  const riskMetrics = [
    {
      title: 'Value at Risk (95%)',
      value: formatCurrency(Math.abs(data.valueAtRisk)),
      description: 'Maximum expected loss over 1 day',
      icon: <AlertTriangle size={20} />,
      color: 'danger.600'
    },
    {
      title: 'Expected Shortfall',
      value: formatCurrency(Math.abs(data.expectedShortfall)),
      description: 'Average loss beyond VaR threshold',
      icon: <TrendingDown size={20} />,
      color: 'danger.600'
    },
    {
      title: 'Portfolio Volatility',
      value: formatPercentage(data.portfolioVolatility),
      description: 'Annualized standard deviation',
      icon: <Activity size={20} />,
      color: 'warning.600'
    },
    {
      title: 'Risk Level',
      value: riskLevel.level,
      description: 'Overall portfolio risk assessment',
      icon: <Shield size={20} />,
      color: riskLevel.color === 'success' ? 'success.600' : 
             riskLevel.color === 'warning' ? 'warning.600' : 'danger.600'
    }
  ];

  if (detailed) {
    return (
      <div className="space-y-6">
        <Card.Root>
          <Card.Body>
            <div className="mb-4">
              <Text className="text-lg font-semibold">Risk Analysis</Text>
              <Text className="text-sm text-neutral-600">
                Comprehensive risk assessment for {period} period
              </Text>
            </div>
            
            <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' }} gap={4}>
              {riskMetrics.map((metric, index) => (
                <Card.Root key={index} className="hover:shadow-md transition-shadow">
                  <Card.Body>
                    <div className="flex items-center justify-between mb-3">
                      <div style={{ color: `var(--chakra-colors-${metric.color.replace('.', '-')})` }}>
                        {metric.icon}
                      </div>
                      <Badge 
                        colorPalette={riskLevel.color}
                        variant="subtle"
                        size="sm"
                      >
                        {period}
                      </Badge>
                    </div>
                    
                    <div className="text-2xl font-bold text-neutral-900 mb-1">
                      {metric.value}
                    </div>
                    <div className="text-sm font-medium text-neutral-700 mb-2">
                      {metric.title}
                    </div>
                    <div className="text-xs text-neutral-500">
                      {metric.description}
                    </div>
                  </Card.Body>
                </Card.Root>
              ))}
            </Grid>
          </Card.Body>
        </Card.Root>

        {/* Risk Breakdown */}
        <Grid templateColumns={{ base: '1fr', lg: 'repeat(2, 1fr)' }} gap={6}>
          <Card.Root>
            <Card.Body>
              <div className="mb-4">
                <Text className="text-lg font-semibold">Risk Composition</Text>
                <Text className="text-sm text-neutral-600">
                  Breakdown of portfolio risk factors
                </Text>
              </div>
              
              <div className="space-y-4">
                {[
                  { name: 'Market Risk', percentage: 45, color: 'danger' },
                  { name: 'Sector Risk', percentage: 25, color: 'warning' },
                  { name: 'Stock Specific Risk', percentage: 20, color: 'orange' },
                  { name: 'Currency Risk', percentage: 10, color: 'neutral' }
                ].map((risk, index) => (
                  <div key={index}>
                    <div className="flex justify-between items-center mb-2">
                      <Text className="text-sm font-medium">{risk.name}</Text>
                      <Text className="text-sm text-neutral-600">{risk.percentage}%</Text>
                    </div>
                    <Progress.Root value={risk.percentage} max={100} colorPalette={risk.color}>
                      <Progress.Track>
                        <Progress.Range />
                      </Progress.Track>
                    </Progress.Root>
                  </div>
                ))}
              </div>
            </Card.Body>
          </Card.Root>

          <Card.Root>
            <Card.Body>
              <div className="mb-4">
                <Text className="text-lg font-semibold">Risk Scenarios</Text>
                <Text className="text-sm text-neutral-600">
                  Portfolio performance under stress scenarios
                </Text>
              </div>
              
              <div className="space-y-3">
                {[
                  { scenario: 'Market Crash (-20%)', impact: -18500, probability: '5%' },
                  { scenario: 'Recession (-10%)', impact: -9200, probability: '15%' },
                  { scenario: 'Interest Rate Spike', impact: -5800, probability: '25%' },
                  { scenario: 'Sector Rotation', impact: -3200, probability: '35%' }
                ].map((scenario, index) => (
                  <div key={index} className="flex justify-between items-center p-3 bg-neutral-50 rounded-lg">
                    <div>
                      <div className="font-medium text-sm">{scenario.scenario}</div>
                      <div className="text-xs text-neutral-600">Probability: {scenario.probability}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono font-semibold text-danger-600">
                        {formatCurrency(scenario.impact)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card.Body>
          </Card.Root>
        </Grid>

        {/* Risk Chart Placeholder */}
        <Card.Root>
          <Card.Body>
            <div className="mb-4">
              <Text className="text-lg font-semibold">Risk Timeline</Text>
              <Text className="text-sm text-neutral-600">
                Historical risk metrics over time
              </Text>
            </div>
            
            <div className="h-64 bg-neutral-100 rounded-lg flex items-center justify-center">
              <div className="text-center text-neutral-500">
                <div className="mx-auto mb-2 flex justify-center">
                  <Activity size={32} color="var(--chakra-colors-neutral-500)" />
                </div>
                <Text>Risk timeline chart would be rendered here</Text>
                <Text className="text-sm">Line chart showing VaR, volatility, and drawdown over time</Text>
              </div>
            </div>
          </Card.Body>
        </Card.Root>
      </div>
    );
  }

  return (
    <Card.Root>
      <Card.Body>
        <div className="flex items-center justify-between mb-4">
          <div>
            <Text className="text-lg font-semibold">Risk Analysis</Text>
            <Text className="text-sm text-neutral-600">
              Risk assessment for {period}
            </Text>
          </div>
          <Shield size={20} color="var(--chakra-colors-analytics-high)" />
        </div>
        
        <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={4}>
          {riskMetrics.map((metric, index) => (
            <div key={index} className="p-3 bg-neutral-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <div style={{ color: `var(--chakra-colors-${metric.color.replace('.', '-')})` }}>
                  {metric.icon}
                </div>
              </div>
              <div className="font-semibold text-lg">{metric.value}</div>
              <div className="text-xs text-neutral-600">{metric.title}</div>
            </div>
          ))}
        </Grid>
        
        {/* Risk Level Indicator */}
        <div className="mt-4 pt-4 border-t border-neutral-200">
          <div className="flex justify-between items-center mb-2">
            <Text className="text-sm text-neutral-600">Overall Risk Level</Text>
            <Badge colorPalette={riskLevel.color} variant="subtle">
              {riskLevel.level}
            </Badge>
          </div>
          <Progress.Root 
            value={riskLevel.score} 
            max={100}
            colorPalette={riskLevel.color}
          >
            <Progress.Track>
              <Progress.Range />
            </Progress.Track>
          </Progress.Root>
        </div>
      </Card.Body>
    </Card.Root>
  );
};