import React from 'react';
import { Box, Typography, Stack, Card, CardContent } from '@mui/material';
import { LineChart, BarChart } from '@mui/x-charts';
import { formatCurrency, formatPercentage } from '../../utils/formatters';

interface PerformanceChartProps {
  performanceData: {
    dailyPnL: Array<{ date: string; pnl: number; trades: number }>;
    executionQuality: {
      avgSlippage: number;
      avgExecutionSpeed: number;
      fillRate: number;
      rejectionRate: number;
      partialFillRate: number;
      marketImpact: number;
      implementationShortfall: number;
    };
  };
}

export const PerformanceChart: React.FC<PerformanceChartProps> = ({ performanceData }) => {
  const pnlData = performanceData.dailyPnL.map(item => ({
    date: new Date(item.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
    pnl: item.pnl,
    trades: item.trades
  }));

  const executionMetrics = [
    { metric: 'Fill Rate', value: performanceData.executionQuality.fillRate * 100 },
    { metric: 'Rejection Rate', value: performanceData.executionQuality.rejectionRate * 100 },
    { metric: 'Partial Fill Rate', value: performanceData.executionQuality.partialFillRate * 100 }
  ];

  const totalPnL = performanceData.dailyPnL.reduce((sum, item) => sum + item.pnl, 0);
  const totalTrades = performanceData.dailyPnL.reduce((sum, item) => sum + item.trades, 0);
  const avgDailyPnL = totalPnL / performanceData.dailyPnL.length;

  return (
    <Stack spacing={3}>
      {/* Performance Summary */}
      <Card>
        <CardContent>
          <Typography variant="h6" fontWeight="bold" mb={2}>
            Performance Summary
          </Typography>
          <Stack direction="row" spacing={4}>
            <Box>
              <Typography variant="body2" color="textSecondary">Total P&L</Typography>
              <Typography variant="h5" fontWeight="bold" color={totalPnL >= 0 ? 'success.main' : 'error.main'}>
                {formatCurrency(totalPnL)}
              </Typography>
            </Box>
            <Box>
              <Typography variant="body2" color="textSecondary">Avg Daily P&L</Typography>
              <Typography variant="h5" fontWeight="bold" color={avgDailyPnL >= 0 ? 'success.main' : 'error.main'}>
                {formatCurrency(avgDailyPnL)}
              </Typography>
            </Box>
            <Box>
              <Typography variant="body2" color="textSecondary">Total Trades</Typography>
              <Typography variant="h5" fontWeight="bold">
                {totalTrades}
              </Typography>
            </Box>
            <Box>
              <Typography variant="body2" color="textSecondary">Avg Execution Speed</Typography>
              <Typography variant="h5" fontWeight="bold">
                {performanceData.executionQuality.avgExecutionSpeed}ms
              </Typography>
            </Box>
          </Stack>
        </CardContent>
      </Card>

      {/* Daily P&L Chart */}
      <Card>
        <CardContent>
          <Typography variant="h6" fontWeight="bold" mb={2}>
            Daily P&L Trend
          </Typography>
          <Box sx={{ width: '100%', height: 300 }}>
            <LineChart
              dataset={pnlData}
              xAxis={[{ 
                scaleType: 'point', 
                dataKey: 'date',
                tickLabelStyle: { fontSize: 12 }
              }]}
              yAxis={[{
                tickLabelStyle: { fontSize: 12 },
                valueFormatter: (value) => formatCurrency(value)
              }]}
              series={[
                {
                  dataKey: 'pnl',
                  label: 'Daily P&L',
                  color: '#22c55e',
                  curve: 'monotoneX'
                }
              ]}
              margin={{ left: 80, right: 20, top: 20, bottom: 60 }}
            />
          </Box>
        </CardContent>
      </Card>

      {/* Execution Quality Metrics */}
      <Card>
        <CardContent>
          <Typography variant="h6" fontWeight="bold" mb={2}>
            Execution Quality Metrics
          </Typography>
          <Box sx={{ width: '100%', height: 300 }}>
            <BarChart
              dataset={executionMetrics}
              xAxis={[{ 
                scaleType: 'band', 
                dataKey: 'metric',
                tickLabelStyle: { fontSize: 12 }
              }]}
              yAxis={[{
                tickLabelStyle: { fontSize: 12 },
                valueFormatter: (value) => `${value.toFixed(1)}%`
              }]}
              series={[
                {
                  dataKey: 'value',
                  label: 'Percentage',
                  color: '#3b82f6'
                }
              ]}
              margin={{ left: 60, right: 20, top: 20, bottom: 80 }}
            />
          </Box>
          
          <Stack direction="row" spacing={4} mt={2}>
            <Box>
              <Typography variant="body2" color="textSecondary">Avg Slippage</Typography>
              <Typography variant="body1" fontWeight="bold">
                {(performanceData.executionQuality.avgSlippage * 10000).toFixed(2)} bps
              </Typography>
            </Box>
            <Box>
              <Typography variant="body2" color="textSecondary">Market Impact</Typography>
              <Typography variant="body1" fontWeight="bold">
                {(performanceData.executionQuality.marketImpact * 10000).toFixed(2)} bps
              </Typography>
            </Box>
            <Box>
              <Typography variant="body2" color="textSecondary">Implementation Shortfall</Typography>
              <Typography variant="body1" fontWeight="bold">
                {(performanceData.executionQuality.implementationShortfall * 10000).toFixed(2)} bps
              </Typography>
            </Box>
          </Stack>
        </CardContent>
      </Card>
    </Stack>
  );
};