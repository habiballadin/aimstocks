import React from 'react';
import { ChakraProvider } from '@chakra-ui/react';
import { VirtualTradingDashboard } from './components/dashboard/VirtualTradingDashboard';
import { BacktestingEngine } from './components/dashboard/BacktestingEngine';
import { HistoricalDataViewer } from './components/dashboard/HistoricalDataViewer';
import { FundManagement } from './components/dashboard/FundManagement';
import { theme } from './theme';
import { Box, Tabs, Text, Flex } from '@chakra-ui/react';
import { Wallet, BarChart3, LineChart, DollarSign } from 'lucide-react';

function App() {
  return (
    <ChakraProvider value={theme}>
      <Box minH="100vh" bg="neutral.50" p={6}>
        <Box maxW="1400px" mx="auto">
          <Flex align="center" gap={3} mb={6}>
            <Wallet size={32} color="#3182ce" />
            <Box>
              <Text textStyle="heading.2xl" color="neutral.900">
                Virtual Trading & Advanced Features Demo
              </Text>
              <Text fontSize="lg" color="neutral.600">
                Complete virtual trading, backtesting, and historical data analysis
              </Text>
            </Box>
          </Flex>

          <Tabs.Root defaultValue="virtual">
            <Tabs.List mb={6} bg="white" p={1} borderRadius="lg" shadow="sm">
              <Tabs.Trigger value="virtual">
                <Wallet size={16} style={{ marginRight: '8px' }} />
                Virtual Trading
              </Tabs.Trigger>
              <Tabs.Trigger value="funds">
                <DollarSign size={16} style={{ marginRight: '8px' }} />
                Fund Management
              </Tabs.Trigger>
              <Tabs.Trigger value="backtest">
                <BarChart3 size={16} style={{ marginRight: '8px' }} />
                Backtesting
              </Tabs.Trigger>
              <Tabs.Trigger value="history">
                <LineChart size={16} style={{ marginRight: '8px' }} />
                Historical Data
              </Tabs.Trigger>
            </Tabs.List>

            <Tabs.Content value="virtual">
              <VirtualTradingDashboard />
            </Tabs.Content>

            <Tabs.Content value="funds">
              <FundManagement />
            </Tabs.Content>

            <Tabs.Content value="backtest">
              <BacktestingEngine />
            </Tabs.Content>

            <Tabs.Content value="history">
              <HistoricalDataViewer />
            </Tabs.Content>
          </Tabs.Root>
        </Box>
      </Box>
    </ChakraProvider>
  );
}

export default App;