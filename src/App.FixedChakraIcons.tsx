import React from 'react';
import { Provider } from './components/ui/provider';
import { Box, Heading, Stack } from '@chakra-ui/react';
import { HeatmapVisualization } from './components/reports/HeatmapVisualization';
import { CorrelationMatrix } from './components/analytics/CorrelationMatrix';
import { TradingInterface } from './components/dashboard/TradingInterface';
import { RiskAnalysis } from './components/analytics/RiskAnalysis';
import { EmptyState } from './components/common/EmptyState';

// Mock data for components
const mockHeatmapData = [
  { symbol: 'AAPL', sector: 'Technology', performance: 12.5, volume: 85.2 },
  { symbol: 'GOOGL', sector: 'Technology', performance: 8.3, volume: 72.1 },
  { symbol: 'MSFT', sector: 'Technology', performance: 15.7, volume: 91.3 },
  { symbol: 'TSLA', sector: 'Automotive', performance: -5.2, volume: 156.8 },
  { symbol: 'JPM', sector: 'Financial', performance: 3.1, volume: 45.6 },
  { symbol: 'BAC', sector: 'Financial', performance: 1.8, volume: 38.2 },
  { symbol: 'JNJ', sector: 'Healthcare', performance: 6.4, volume: 28.9 },
  { symbol: 'PFE', sector: 'Healthcare', performance: -2.1, volume: 42.3 },
  { symbol: 'XOM', sector: 'Energy', performance: 18.9, volume: 67.4 },
  { symbol: 'CVX', sector: 'Energy', performance: 14.2, volume: 52.1 }
];

const mockCorrelationData = [
  [1.00, 0.75, 0.68, 0.42],
  [0.75, 1.00, 0.82, 0.35],
  [0.68, 0.82, 1.00, 0.28],
  [0.42, 0.35, 0.28, 1.00]
];

const mockRiskData = {
  valueAtRisk: -25000,
  expectedShortfall: -35000,
  portfolioVolatility: 18.5,
  correlationMatrix: mockCorrelationData
};

function App() {
  return (
    <Provider>
      <Box className="min-h-screen bg-neutral-50 p-6">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="text-center mb-8">
            <Heading size="2xl" className="mb-2">
              Fixed Chakra UI Icons Demo
            </Heading>
            <p className="text-neutral-600">
              Demonstrating proper Icon usage in Chakra V3 components
            </p>
          </div>

          <Stack gap={8}>
            {/* Trading Interface */}
            <Box>
              <Heading size="lg" className="mb-4">Trading Interface</Heading>
              <TradingInterface />
            </Box>

            {/* Heatmap Visualization */}
            <Box>
              <Heading size="lg" className="mb-4">Market Heatmap</Heading>
              <HeatmapVisualization data={mockHeatmapData} />
            </Box>

            {/* Correlation Matrix */}
            <Box>
              <Heading size="lg" className="mb-4">Correlation Matrix</Heading>
              <CorrelationMatrix data={mockCorrelationData} />
            </Box>

            {/* Risk Analysis */}
            <Box>
              <Heading size="lg" className="mb-4">Risk Analysis</Heading>
              <RiskAnalysis 
                data={mockRiskData} 
                period="1 Month" 
                detailed={true} 
              />
            </Box>

            {/* Empty State Examples */}
            <Box>
              <Heading size="lg" className="mb-4">Empty State Components</Heading>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <EmptyState
                  title="No Data Available"
                  description="Start by adding some data to see analytics"
                  icon="search"
                  actionLabel="Add Data"
                  onAction={() => console.log('Add data clicked')}
                />
                <EmptyState
                  title="Create Your First Trade"
                  description="Begin trading with our AI-powered platform"
                  icon="add"
                  actionLabel="Start Trading"
                  onAction={() => console.log('Start trading clicked')}
                />
                <EmptyState
                  title="No Charts Available"
                  description="Charts will appear here once you have data"
                  icon="chart"
                />
              </div>
            </Box>
          </Stack>
        </div>
      </Box>
    </Provider>
  );
}

export default App;