import React from 'react';
import { Card, Grid, Stat, Icon, Text, Progress } from '@chakra-ui/react';
import { TrendingUp, TrendingDown, Target, Award } from 'lucide-react';
import { formatPercentage, formatRiskMetric } from '../../utils/formatters';

interface PerformanceMetricsProps {
  data: {
    totalReturn: number;
    annualizedReturn: number;
    sharpeRatio: number;
    maxDrawdown: number;
    winRate: number;
    profitFactor: number;
    alpha: number;
    beta: number;
    volatility: number;
  };
  period: string;
  detailed?: boolean;
}

export const PerformanceMetrics: React.FC<PerformanceMetricsProps> = ({ 
  data, 
  period, 
  detailed = false 
}) => {
  const MetricCard: React.FC<{
    title: string;
    value: string;
    change?: number;
    icon: React.ReactNode;
    color?: string;
    description?: string;
  }> = ({ title, value, change, icon, color = 'neutral.600', description }) => (
    <Card.Root className="hover:shadow-md transition-shadow">
      <Card.Body>
        <div className="flex items-center justify-between mb-3">
          <Icon color={color}>
            {icon}
          </Icon>
          {change !== undefined && (
            <div className={`flex items-center gap-1 text-sm ${
              change >= 0 ? 'text-success-600' : 'text-danger-600'
            }`}>
              <Icon>
                {change >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
              </Icon>
              {formatPercentage(Math.abs(change))}
            </div>
          )}
        </div>
        
        <Stat.Root>
          <Stat.ValueText className="text-2xl font-bold text-neutral-900">
            {value}
          </Stat.ValueText>
          <Stat.Label className="text-sm text-neutral-600 mt-1">
            {title}
          </Stat.Label>
        </Stat.Root>
        
        {description && (
          <Text className="text-xs text-neutral-500 mt-2">
            {description}
          </Text>
        )}
      </Card.Body>
    </Card.Root>
  );

  const mainMetrics = [
    {
      title: 'Total Return',
      value: formatPercentage(data.totalReturn),
      change: 2.3,
      icon: <TrendingUp size={20} />,
      color: data.totalReturn >= 0 ? 'success.600' : 'danger.600',
      description: `Performance over ${period} period`
    },
    {
      title: 'Annualized Return',
      value: formatPercentage(data.annualizedReturn),
      change: 1.8,
      icon: <Target size={20} />,
      color: 'ai.600',
      description: 'Compound annual growth rate'
    },
    {
      title: 'Sharpe Ratio',
      value: formatRiskMetric(data.sharpeRatio, 'SHARPE_RATIO'),
      change: 0.15,
      icon: <Award size={20} />,
      color: 'warning.600',
      description: 'Risk-adjusted return measure'
    },
    {
      title: 'Max Drawdown',
      value: formatPercentage(Math.abs(data.maxDrawdown)),
      change: -0.5,
      icon: <TrendingDown size={20} />,
      color: 'danger.600',
      description: 'Largest peak-to-trough decline'
    }
  ];

  const detailedMetrics = [
    {
      title: 'Win Rate',
      value: formatPercentage(data.winRate),
      icon: <Target size={20} />,
      color: 'success.600',
      description: 'Percentage of profitable trades'
    },
    {
      title: 'Profit Factor',
      value: data.profitFactor.toFixed(2),
      icon: <Award size={20} />,
      color: 'ai.600',
      description: 'Gross profit / Gross loss ratio'
    },
    {
      title: 'Alpha',
      value: formatPercentage(data.alpha),
      icon: <TrendingUp size={20} />,
      color: 'success.600',
      description: 'Excess return vs benchmark'
    },
    {
      title: 'Beta',
      value: data.beta.toFixed(2),
      icon: <TrendingUp size={20} />,
      color: 'neutral.600',
      description: 'Market sensitivity measure'
    },
    {
      title: 'Volatility',
      value: formatPercentage(data.volatility),
      icon: <TrendingDown size={20} />,
      color: 'warning.600',
      description: 'Standard deviation of returns'
    }
  ];

  if (detailed) {
    return (
      <div className="space-y-6">
        <Card.Root>
          <Card.Body>
            <div className="mb-4">
              <Text className="text-lg font-semibold">Performance Overview</Text>
              <Text className="text-sm text-neutral-600">
                Comprehensive performance metrics for {period} period
              </Text>
            </div>
            
            <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' }} gap={4}>
              {mainMetrics.map((metric, index) => (
                <MetricCard key={index} {...metric} />
              ))}
            </Grid>
          </Card.Body>
        </Card.Root>

        <Card.Root>
          <Card.Body>
            <div className="mb-4">
              <Text className="text-lg font-semibold">Advanced Metrics</Text>
              <Text className="text-sm text-neutral-600">
                Additional performance and risk-adjusted metrics
              </Text>
            </div>
            
            <Grid templateColumns={{ base: '1fr', md: 'repeat(3, 1fr)', lg: 'repeat(5, 1fr)' }} gap={4}>
              {detailedMetrics.map((metric, index) => (
                <MetricCard key={index} {...metric} />
              ))}
            </Grid>
          </Card.Body>
        </Card.Root>

        {/* Performance Chart Placeholder */}
        <Card.Root>
          <Card.Body>
            <div className="mb-4">
              <Text className="text-lg font-semibold">Performance Chart</Text>
              <Text className="text-sm text-neutral-600">
                Historical performance vs benchmark
              </Text>
            </div>
            
            <div className="h-64 bg-neutral-100 rounded-lg flex items-center justify-center">
              <div className="text-center text-neutral-500">
                <Icon className="mx-auto mb-2">
                  <TrendingUp size={32} />
                </Icon>
                <Text>Performance chart would be rendered here</Text>
                <Text className="text-sm">Line chart showing portfolio vs benchmark performance</Text>
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
            <Text className="text-lg font-semibold">Performance Metrics</Text>
            <Text className="text-sm text-neutral-600">
              Key performance indicators for {period}
            </Text>
          </div>
          <Icon color="analytics.positive">
            <TrendingUp size={20} />
          </Icon>
        </div>
        
        <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={4}>
          {mainMetrics.map((metric, index) => (
            <div key={index} className="p-3 bg-neutral-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <Icon color={metric.color}>
                  {metric.icon}
                </Icon>
                {metric.change !== undefined && (
                  <div className={`text-xs ${
                    metric.change >= 0 ? 'text-success-600' : 'text-danger-600'
                  }`}>
                    {metric.change >= 0 ? '+' : ''}{formatPercentage(metric.change)}
                  </div>
                )}
              </div>
              <div className="font-semibold text-lg">{metric.value}</div>
              <div className="text-xs text-neutral-600">{metric.title}</div>
            </div>
          ))}
        </Grid>
        
        {/* Performance Progress Bar */}
        <div className="mt-4 pt-4 border-t border-neutral-200">
          <div className="flex justify-between items-center mb-2">
            <Text className="text-sm text-neutral-600">YTD Performance</Text>
            <Text className="text-sm font-semibold text-success-600">
              {formatPercentage(data.totalReturn)}
            </Text>
          </div>
          <Progress.Root 
            value={Math.min(Math.max(data.totalReturn + 20, 0), 40)} 
            max={40}
            colorPalette="green"
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