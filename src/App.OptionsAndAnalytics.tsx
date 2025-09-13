import React, { useState } from 'react';
import { ChakraProvider } from '@chakra-ui/react';
import { BrowserRouter as Router } from 'react-router-dom';
import { Box, Tabs, Heading } from '@chakra-ui/react';
import { 
  Shuffle, 
  ChartNoAxesCombined, 
  FileChartColumn, 
  UserCog, 
  BrainCircuit, 
  Bell 
} from 'lucide-react';

// Import theme and components
import { theme } from './theme';
import { ToastProvider } from './components/common/ToastProvider';
import { Header } from './components/layout/Header';

// Import new page components
import { OptionsTrading } from './components/options/OptionsTrading';
import { AnalyticsDashboard } from './components/analytics/AnalyticsDashboard';
import { ReportsCenter } from './components/reports/ReportsCenter';
import { UserProfile } from './components/profile/UserProfile';
import { AIFeaturesHub } from './components/ai/AIFeaturesHub';
import { NotificationCenter } from './components/notifications/NotificationCenter';

function App() {
  const [activeTab, setActiveTab] = useState('options');

  return (
    <ChakraProvider value={theme}>
      <ToastProvider>
        <Router>
          <Box minH="100vh" bg="neutral.50">
            <Header />
            
            <Box p={6}>
              <div className="max-w-7xl mx-auto">
                {/* Main Navigation */}
                <div className="mb-6">
                  <Heading size="2xl" className="mb-4 text-center">
                    Stock Prediction App - New Features
                  </Heading>
                  
                  <Tabs.Root 
                    value={activeTab} 
                    onValueChange={(e) => setActiveTab(e.value)}
                  >
                    <Tabs.List className="bg-white p-1 rounded-lg shadow-sm overflow-x-auto">
                      <Tabs.Trigger value="options" className="flex items-center gap-2">
                        <Shuffle size={16} />
                        Options Trading
                      </Tabs.Trigger>
                      <Tabs.Trigger value="analytics" className="flex items-center gap-2">
                        <ChartNoAxesCombined size={16} />
                        Analytics
                      </Tabs.Trigger>
                      <Tabs.Trigger value="reports" className="flex items-center gap-2">
                        <FileChartColumn size={16} />
                        Reports
                      </Tabs.Trigger>
                      <Tabs.Trigger value="profile" className="flex items-center gap-2">
                        <UserCog size={16} />
                        Profile
                      </Tabs.Trigger>
                      <Tabs.Trigger value="ai" className="flex items-center gap-2">
                        <BrainCircuit size={16} />
                        AI Features
                      </Tabs.Trigger>
                      <Tabs.Trigger value="notifications" className="flex items-center gap-2">
                        <Bell size={16} />
                        Notifications
                      </Tabs.Trigger>
                    </Tabs.List>

                    {/* Tab Content */}
                    <div className="mt-6">
                      <Tabs.Content value="options">
                        <OptionsTrading />
                      </Tabs.Content>

                      <Tabs.Content value="analytics">
                        <AnalyticsDashboard />
                      </Tabs.Content>

                      <Tabs.Content value="reports">
                        <ReportsCenter />
                      </Tabs.Content>

                      <Tabs.Content value="profile">
                        <UserProfile />
                      </Tabs.Content>

                      <Tabs.Content value="ai">
                        <AIFeaturesHub />
                      </Tabs.Content>

                      <Tabs.Content value="notifications">
                        <NotificationCenter />
                      </Tabs.Content>
                    </div>
                  </Tabs.Root>
                </div>
              </div>
            </Box>
          </Box>
        </Router>
      </ToastProvider>
    </ChakraProvider>
  );
}

export default App;