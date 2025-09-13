import React from 'react';
import { 
  Card, 
  CardContent, 
  Typography, 
  Stack, 
  Box,
  Alert
} from '@mui/material';
import { formatCurrency, formatPercentage } from '../../utils/formatters';
import { getRiskLevelColor, getRiskLevelText } from './utils/StatusUtils';
import { MetricDisplay } from './common/MetricDisplay';
import { ProgressWithLabel } from './common/ProgressWithLabel';

interface RiskMetricsCardProps {
  riskMetrics: {
    portfolioValue: number;
    totalExposure: number;
    availableMargin: number;
    usedMargin: number;
    marginUtilization: number;
    maxDrawdown: number;
    var95: number;
    expectedShortfall: number;
    betaToMarket: number;
    correlationToNifty: number;
    concentrationRisk: number;
    liquidityRisk: number;
    overallRiskScore: number;
  };
}

export const RiskMetricsCard: React.FC<RiskMetricsCardProps> = ({ riskMetrics }) => {

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" fontWeight="bold" mb={3}>
          Risk Management Dashboard
        </Typography>

        {riskMetrics.overallRiskScore > 0.7 && (
          <Alert severity="warning" sx={{ mb: 3 }}>
            High risk detected! Portfolio risk score is {formatPercentage(riskMetrics.overallRiskScore * 100)}
          </Alert>
        )}

        <Stack spacing={3}>
          {/* Portfolio Overview */}
          <Box>
            <Typography variant="subtitle1" fontWeight="bold" mb={2}>
              Portfolio Overview
            </Typography>
            <Stack direction="row" spacing={4}>
              <MetricDisplay
                label="Portfolio Value"
                value={formatCurrency(riskMetrics.portfolioValue)}
                size="large"
              />
              <MetricDisplay
                label="Total Exposure"
                value={formatCurrency(riskMetrics.totalExposure)}
                size="large"
              />
              <MetricDisplay
                label="Available Margin"
                value={formatCurrency(riskMetrics.availableMargin)}
                color="success.main"
                size="large"
              />
            </Stack>
          </Box>

          {/* Margin Utilization */}
          <Box>
            <Typography variant="subtitle1" fontWeight="bold" mb={1}>
              Margin Utilization
            </Typography>
            <Typography variant="body2" mb={1}>
              {formatCurrency(riskMetrics.usedMargin)} / {formatCurrency(riskMetrics.usedMargin + riskMetrics.availableMargin)}
            </Typography>
            <ProgressWithLabel
              value={riskMetrics.marginUtilization * 100}
              color={riskMetrics.marginUtilization > 0.8 ? 'error' : riskMetrics.marginUtilization > 0.6 ? 'warning' : 'success'}
              height={8}
            />
          </Box>

          {/* Risk Metrics */}
          <Box>
            <Typography variant="subtitle1" fontWeight="bold" mb={2}>
              Risk Metrics
            </Typography>
            <Stack direction="row" spacing={4}>
              <MetricDisplay
                label="Max Drawdown"
                value={formatCurrency(riskMetrics.maxDrawdown)}
                color="error.main"
              />
              <MetricDisplay
                label="VaR 95%"
                value={formatCurrency(riskMetrics.var95)}
                color="error.main"
              />
              <MetricDisplay
                label="Expected Shortfall"
                value={formatCurrency(riskMetrics.expectedShortfall)}
                color="error.main"
              />
            </Stack>
          </Box>

          {/* Market Risk */}
          <Box>
            <Typography variant="subtitle1" fontWeight="bold" mb={2}>
              Market Risk
            </Typography>
            <Stack direction="row" spacing={4}>
              <MetricDisplay
                label="Beta to Market"
                value={riskMetrics.betaToMarket.toFixed(2)}
              />
              <MetricDisplay
                label="Correlation to Nifty"
                value={riskMetrics.correlationToNifty.toFixed(2)}
              />
            </Stack>
          </Box>

          {/* Risk Scores */}
          <Box>
            <Typography variant="subtitle1" fontWeight="bold" mb={2}>
              Risk Scores
            </Typography>
            
            <Stack spacing={2}>
              <ProgressWithLabel
                value={riskMetrics.concentrationRisk * 100}
                label="Concentration Risk"
                color={getRiskLevelColor(riskMetrics.concentrationRisk)}
                height={6}
              />

              <ProgressWithLabel
                value={riskMetrics.liquidityRisk * 100}
                label="Liquidity Risk"
                color={getRiskLevelColor(riskMetrics.liquidityRisk)}
                height={6}
              />

              <Box>
                <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
                  <Typography variant="body2">Overall Risk Score</Typography>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Typography variant="body2" fontWeight="bold">
                      {formatPercentage(riskMetrics.overallRiskScore * 100)}
                    </Typography>
                    <Typography 
                      variant="body2" 
                      color={`${getRiskLevelColor(riskMetrics.overallRiskScore)}.main`}
                      fontWeight="bold"
                    >
                      ({getRiskLevelText(riskMetrics.overallRiskScore)})
                    </Typography>
                  </Stack>
                </Stack>
                <ProgressWithLabel
                  value={riskMetrics.overallRiskScore * 100}
                  color={getRiskLevelColor(riskMetrics.overallRiskScore)}
                  showPercentage={false}
                  height={8}
                />
              </Box>
            </Stack>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
};