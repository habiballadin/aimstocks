import React, { useState } from 'react';
import { Box, Grid, Heading, Select, Button, Icon, Tabs, createListCollection } from '@chakra-ui/react';
import { ChartNoAxesCombined, Download, Filter } from 'lucide-react';
import { PerformanceMetrics } from './PerformanceMetrics';
import { RiskAnalysis } from './RiskAnalysis';
import { PortfolioBreakdown } from './PortfolioBreakdown';
import { CorrelationMatrix } from './CorrelationMatrix';
import { mockAnalyticsData } from '../../data/optionsAndAnalyticsMockData';

export const AnalyticsDashboard: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('1M');
  const [activeTab, setActiveTab] = useState('overview');

  const periods = [
    { value: '1D', label: '1 Day' },
    { value: '1W', label: '1 Week' },
    { value: '1M', label: '1 Month' },
    { value: '3M', label: '3 Months' },
    { value: '6M', label: '6 Months' },
    { value: '1Y', label: '1 Year' },
    { value: 'YTD', label: 'Year to Date' },
    { value: 'ALL', label: 'All Time' }
  ];

  return (
    <Box className="p-6 min-h-screen bg-neutral-50">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Icon color="analytics.neutral">
              <ChartNoAxesCombined size={28} />
            </Icon>
            <Heading size="2xl" color="neutral.900">
              Analytics Dashboard
            </Heading>
          </div>
          
          <div className="flex items-center gap-3">
            <Select.Root collection={createListCollection({ items: periods })} value={[selectedPeriod]} onValueChange={(e) => setSelectedPeriod(e.value[0])}>
              <Select.Trigger className="min-w-32">
                <Select.ValueText />
              </Select.Trigger>
              <Select.Content>
                {periods.map(period => (
                  <Select.Item key={period.value} item={period.value}>
                    {period.label}
                  </Select.Item>
                ))}
              </Select.Content>
            </Select.Root>
            
            <Button variant="outline">
              <Icon>
                <Filter size={16} />
              </Icon>
              Filters
            </Button>
            
            <Button colorPalette="brand">
              <Icon>
                <Download size={16} />
              </Icon>
              Export
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <Tabs.Root 
          value={activeTab} 
          onValueChange={(e) => setActiveTab(e.value)}
        >
          <Tabs.List className="mb-6 bg-white p-1 rounded-lg shadow-sm">
            <Tabs.Trigger value="overview">Overview</Tabs.Trigger>
            <Tabs.Trigger value="performance">Performance</Tabs.Trigger>
            <Tabs.Trigger value="risk">Risk Analysis</Tabs.Trigger>
            <Tabs.Trigger value="allocation">Allocation</Tabs.Trigger>
            <Tabs.Trigger value="correlation">Correlation</Tabs.Trigger>
          </Tabs.List>

          <Tabs.Content value="overview">
            <Grid templateColumns={{ base: '1fr', lg: 'repeat(2, 1fr)' }} gap={6}>
              <PerformanceMetrics 
                data={mockAnalyticsData.performanceMetrics}
                period={selectedPeriod}
              />
              <RiskAnalysis 
                data={{...mockAnalyticsData.riskMetrics, correlationMatrix: mockAnalyticsData.riskMetrics.correlationMatrix.map(row => [...row])}}
                period={selectedPeriod}
              />
              <div className="lg:col-span-2">
                <PortfolioBreakdown 
                  data={[...mockAnalyticsData.sectorAllocation]}
                />
              </div>
            </Grid>
          </Tabs.Content>

          <Tabs.Content value="performance">
            <PerformanceMetrics 
              data={mockAnalyticsData.performanceMetrics}
              period={selectedPeriod}
              detailed={true}
            />
          </Tabs.Content>

          <Tabs.Content value="risk">
            <RiskAnalysis 
              data={{...mockAnalyticsData.riskMetrics, correlationMatrix: mockAnalyticsData.riskMetrics.correlationMatrix.map(row => [...row])}}
              period={selectedPeriod}
              detailed={true}
            />
          </Tabs.Content>

          <Tabs.Content value="allocation">
            <PortfolioBreakdown 
              data={[...mockAnalyticsData.sectorAllocation]}
              detailed={true}
            />
          </Tabs.Content>

          <Tabs.Content value="correlation">
            <CorrelationMatrix 
              data={mockAnalyticsData.riskMetrics.correlationMatrix.map(row => [...row])}
            />
          </Tabs.Content>
        </Tabs.Root>
      </div>
    </Box>
  );
};