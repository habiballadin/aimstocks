import React, { useState } from 'react';
import { Box, Grid, Stack, Button, Text, VStack } from '@chakra-ui/react';
import { 
  LayoutDashboard, 
  Briefcase, 
  Brain, 
  BookMarked, 
  ArrowUpDown, 
  TrendingUp, 
  Search, 
  Filter, 
  BarChart3, 
  Target, 
  ShoppingCart, 
  Bell, 
  Bot, 
  Play, 
  DollarSign, 
  History, 
  Database, 
  ClipboardList, 
  Shield, 
  Building, 
  GraduationCap, 
  Users,
  Wifi 
} from 'lucide-react';
import { Header } from '../layout/Header';
import { AIInsightsPanel } from './AIInsightsPanel';
import { PortfolioSummary } from './PortfolioSummary';
import { PortfolioHoldings } from './PortfolioHoldings';
import { Watchlist } from './Watchlist';
import { StockChart } from './StockChart';
import { MarketOverview } from './MarketOverview';
import { TradingInterface } from './TradingInterface';
import { NewsAndCommunity } from './NewsAndCommunity';
import { EducationalHub } from './EducationalHub';
import { OrderManagement } from './OrderManagement';
import { MarketScanner } from './MarketScanner';
import { AdvancedScreener } from './AdvancedScreener';
import { StockAnalysis } from './StockAnalysis';
import { RealTimePredictions } from './RealTimePredictions';
import { RiskAnalyzer } from './RiskAnalyzer';

import { PerformanceAnalytics } from './PerformanceAnalytics';
import { BrokerManagement } from './BrokerManagement';
import { PortfolioOptimizer } from './PortfolioOptimizer';
import { TechnicalAnalysis } from './TechnicalAnalysis';
import { SmartAlerts } from './SmartAlerts';
import { AlgorithmicTrading } from './AlgorithmicTrading';
import { OrderManagementDashboard } from './OrderManagementDashboard';
import { VirtualTradingDashboard } from './VirtualTradingDashboard';
import { BacktestingEngine } from './BacktestingEngine';
import { HistoricalDataViewer } from './HistoricalDataViewer';
import { FundManagement } from './FundManagement';
import { FyersConnectionPage } from '../broker/FyersConnectionPage';
import { BrokerConnectionCard } from '../broker/BrokerConnectionCard';
import { UserProfile } from '../profile/UserProfile';
import MarketStatus from '../header/MarketStatus';
import { MarketHeader } from '../common/MarketHeader';
import { OptionsTrading } from '../trading/OptionsTrading';
import { DataIngestionMonitor } from '../data/DataIngestionMonitor';

const menuItems = [
  { id: 0, label: 'Dashboard', icon: LayoutDashboard },
  { id: 1, label: 'Portfolio', icon: Briefcase },
  { id: 2, label: 'AI Optimizer', icon: Brain },
  { id: 3, label: 'Watchlist', icon: BookMarked },
  { id: 4, label: 'Trading', icon: ArrowUpDown },
  { id: 5, label: 'Technical', icon: TrendingUp },
  { id: 6, label: 'Scanner', icon: Search },
  { id: 7, label: 'Screener', icon: Filter },
  { id: 8, label: 'Analysis', icon: BarChart3 },
  { id: 9, label: 'Predictions', icon: Target },
  { id: 10, label: 'Orders', icon: ShoppingCart },
  { id: 11, label: 'Smart Alerts', icon: Bell },
  { id: 12, label: 'Algo Trading', icon: Bot },
  { id: 13, label: 'Virtual Trading', icon: Play },
  { id: 14, label: 'Fund Management', icon: DollarSign },
  { id: 15, label: 'Backtesting', icon: History },
  { id: 16, label: 'Historical Data', icon: Database },
  { id: 17, label: 'Order Management', icon: ClipboardList },
  { id: 18, label: 'Risk', icon: Shield },
  { id: 19, label: 'Brokers', icon: Building },
  { id: 20, label: 'Learn', icon: GraduationCap },
  { id: 21, label: 'Community', icon: Users },
  { id: 22, label: 'Options', icon: Target },
  { id: 23, label: 'Connect', icon: Wifi },
  { id: 24, label: 'Data Monitor', icon: Database }
];

export const Dashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);

  const renderContent = () => {
    switch (activeTab) {
      case 0:
        return (
          <Grid templateColumns={{ base: '1fr', lg: '1fr 350px' }} gap={6}>
            <Stack gap={6}>
              <BrokerConnectionCard />
              <Grid templateColumns={{ base: '1fr', md: '1fr 1fr' }} gap={6}>
                <PortfolioSummary />
                <MarketOverview />
              </Grid>
              <StockChart />
              <NewsAndCommunity />
            </Stack>
            <Stack gap={6}>
              <MarketStatus />
              <UserProfile />
              <AIInsightsPanel />
              <TradingInterface />
            </Stack>
          </Grid>
        );
      case 1:
        return (
          <Grid templateColumns={{ base: '1fr', lg: '1fr 350px' }} gap={6}>
            <Stack gap={6}>
              <PortfolioSummary />
              <PortfolioHoldings />
              <PerformanceAnalytics />
            </Stack>
            <Stack gap={6}>
              <AIInsightsPanel />
              <RiskAnalyzer />
            </Stack>
          </Grid>
        );
      case 2:
        return <PortfolioOptimizer />;
      case 3:
        return (
          <Grid templateColumns={{ base: '1fr', lg: '1fr 350px' }} gap={6}>
            <Stack gap={6}>
              <Watchlist />
              <StockChart />
            </Stack>
            <Stack gap={6}>
              <AIInsightsPanel />
              <TradingInterface />
            </Stack>
          </Grid>
        );
      case 4:
        return (
          <Grid templateColumns={{ base: '1fr', lg: '1fr 350px' }} gap={6}>
            <Stack gap={6}>
              <StockChart />
              <MarketOverview />
            </Stack>
            <Stack gap={6}>
              <TradingInterface />
              <AIInsightsPanel />
            </Stack>
          </Grid>
        );
      case 5:
        return <TechnicalAnalysis />;
      case 6:
        return (
          <Grid templateColumns={{ base: '1fr', lg: '1fr 350px' }} gap={6}>
            <MarketScanner />
            <Stack gap={6}>
              <AIInsightsPanel />
              <TradingInterface />
            </Stack>
          </Grid>
        );
      case 7:
        return <AdvancedScreener />;
      case 8:
        return (
          <Grid templateColumns={{ base: '1fr', lg: '1fr 350px' }} gap={6}>
            <StockAnalysis />
            <Stack gap={6}>
              <AIInsightsPanel />
              <TradingInterface />
            </Stack>
          </Grid>
        );
      case 9:
        return (
          <Grid templateColumns={{ base: '1fr', lg: '1fr 350px' }} gap={6}>
            <RealTimePredictions />
            <Stack gap={6}>
              <AIInsightsPanel />
              <MarketOverview />
            </Stack>
          </Grid>
        );
      case 10:
        return (
          <Grid templateColumns={{ base: '1fr', lg: '1fr 350px' }} gap={6}>
            <OrderManagement />
            <Stack gap={6}>
              <TradingInterface />
              <AIInsightsPanel />
            </Stack>
          </Grid>
        );
      case 11:
        return <SmartAlerts />;
      case 12:
        return <AlgorithmicTrading />;
      case 13:
        return <VirtualTradingDashboard />;
      case 14:
        return <FundManagement />;
      case 15:
        return <BacktestingEngine />;
      case 16:
        return <HistoricalDataViewer />;
      case 17:
        return <OrderManagementDashboard />;
      case 18:
        return (
          <Grid templateColumns={{ base: '1fr', lg: '1fr 350px' }} gap={6}>
            <Stack gap={6}>
              <RiskAnalyzer />
              <PortfolioHoldings />
            </Stack>
            <Stack gap={6}>
              <AIInsightsPanel />
              <TradingInterface />
            </Stack>
          </Grid>
        );
      case 19:
        return (
          <Grid templateColumns={{ base: '1fr', lg: '1fr 350px' }} gap={6}>
            <BrokerManagement />
            <Stack gap={6}>
              <UserProfile />
              <AIInsightsPanel />
            </Stack>
          </Grid>
        );
      case 20:
        return (
          <Grid templateColumns={{ base: '1fr', lg: '1fr 350px' }} gap={6}>
            <EducationalHub />
            <Stack gap={6}>
              <AIInsightsPanel />
              <NewsAndCommunity />
            </Stack>
          </Grid>
        );
      case 21:
        return (
          <Grid templateColumns={{ base: '1fr', lg: '1fr 350px' }} gap={6}>
            <Stack gap={6}>
              <NewsAndCommunity />
              <MarketOverview />
            </Stack>
            <Stack gap={6}>
              <AIInsightsPanel />
              <TradingInterface />
            </Stack>
          </Grid>
        );
      case 22:
        return <OptionsTrading />;
      case 23:
        return <FyersConnectionPage />;
      case 24:
        return <DataIngestionMonitor />;
      default:
        return null;
    }
  };

  return (
    <Box minH="100vh" bg="neutral.50">
      <Header />
      <MarketHeader />
      
      <Grid templateColumns="250px 1fr" minH="calc(100vh - 80px)">
        {/* Sidebar */}
        <Box bg="white" borderRight="1px solid" borderColor="neutral.200" p={4}>
          <VStack gap={1} align="stretch">
            {menuItems.map((item) => {
              const IconComponent = item.icon;
              return (
                <Button
                  key={item.id}
                  variant={activeTab === item.id ? "solid" : "ghost"}
                  colorPalette={activeTab === item.id ? "brand" : "neutral"}
                  justifyContent="flex-start"
                  onClick={() => setActiveTab(item.id)}
                  size="sm"
                  w="full"
                >
                  <IconComponent size={16} />
                  <Text ml={3} fontSize="sm">{item.label}</Text>
                </Button>
              );
            })}
          </VStack>
        </Box>
        
        {/* Main Content */}
        <Box p={6} overflowY="auto">
          {renderContent()}
        </Box>
      </Grid>
    </Box>
  );
};