import React, { useState } from 'react';
import { Box, Card, Tabs, Grid, Heading, Button, Icon, Select, createListCollection } from '@chakra-ui/react';
import { FileChartColumn, Download, Calendar } from 'lucide-react';
import { BalanceSheetReport } from './BalanceSheetReport';
import { IncomeStatementReport } from './IncomeStatementReport';
import { HeatmapVisualization } from './HeatmapVisualization';
import { mockReportsData } from '../../data/optionsAndAnalyticsMockData';

export const ReportsCenter: React.FC = () => {
  const [activeTab, setActiveTab] = useState('balance-sheet');
  const [selectedPeriod, setSelectedPeriod] = useState('Q4-2023');
  const [reportFormat, setReportFormat] = useState('pdf');

  const periods = [
    { value: 'Q4-2023', label: 'Q4 2023' },
    { value: 'Q3-2023', label: 'Q3 2023' },
    { value: 'Q2-2023', label: 'Q2 2023' },
    { value: 'Q1-2023', label: 'Q1 2023' },
    { value: 'FY-2023', label: 'Full Year 2023' },
    { value: 'FY-2022', label: 'Full Year 2022' }
  ];

  const formats = [
    { value: 'pdf', label: 'PDF Document' },
    { value: 'excel', label: 'Excel Spreadsheet' },
    { value: 'csv', label: 'CSV Data' }
  ];

  return (
    <Box className="p-6 min-h-screen bg-neutral-50">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Icon color="analytics.neutral">
              <FileChartColumn size={28} />
            </Icon>
            <Heading size="2xl" color="neutral.900">
              Reports Center
            </Heading>
          </div>
          
          <div className="flex items-center gap-3">
            <Select.Root 
              collection={createListCollection({ items: periods })}
              value={[selectedPeriod]} 
              onValueChange={(e) => setSelectedPeriod(e.value[0])}
            >
              <Select.Trigger className="min-w-32">
                <Icon>
                  <Calendar size={16} />
                </Icon>
                <Select.ValueText />
              </Select.Trigger>
              <Select.Content>
                {periods.map(period => (
                  <Select.Item key={period.value} item={period}>
                    {period.label}
                  </Select.Item>
                ))}
              </Select.Content>
            </Select.Root>
            
            <Select.Root 
              collection={createListCollection({ items: formats })}
              value={[reportFormat]} 
              onValueChange={(e) => setReportFormat(e.value[0])}
            >
              <Select.Trigger className="min-w-36">
                <Select.ValueText />
              </Select.Trigger>
              <Select.Content>
                {formats.map(format => (
                  <Select.Item key={format.value} item={format}>
                    {format.label}
                  </Select.Item>
                ))}
              </Select.Content>
            </Select.Root>
            
            <Button colorPalette="brand">
              <Icon>
                <Download size={16} />
              </Icon>
              Generate Report
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <Grid templateColumns={{ base: '1fr', md: 'repeat(4, 1fr)' }} gap={4} className="mb-6">
          <Card.Root>
            <Card.Body className="text-center">
              <div className="text-2xl font-bold text-success-600">$1.25M</div>
              <div className="text-sm text-neutral-600">Total Assets</div>
            </Card.Body>
          </Card.Root>
          <Card.Root>
            <Card.Body className="text-center">
              <div className="text-2xl font-bold text-ai-600">$142K</div>
              <div className="text-sm text-neutral-600">Net Income</div>
            </Card.Body>
          </Card.Root>
          <Card.Root>
            <Card.Body className="text-center">
              <div className="text-2xl font-bold text-warning-600">15.8%</div>
              <div className="text-sm text-neutral-600">ROE</div>
            </Card.Body>
          </Card.Root>
          <Card.Root>
            <Card.Body className="text-center">
              <div className="text-2xl font-bold text-neutral-900">2.84</div>
              <div className="text-sm text-neutral-600">EPS</div>
            </Card.Body>
          </Card.Root>
        </Grid>

        {/* Main Content */}
        <Tabs.Root 
          value={activeTab} 
          onValueChange={(e) => setActiveTab(e.value)}
        >
          <Tabs.List className="mb-6 bg-white p-1 rounded-lg shadow-sm">
            <Tabs.Trigger value="balance-sheet">Balance Sheet</Tabs.Trigger>
            <Tabs.Trigger value="income-statement">Income Statement</Tabs.Trigger>
            <Tabs.Trigger value="cash-flow">Cash Flow</Tabs.Trigger>
            <Tabs.Trigger value="heatmaps">Heatmaps</Tabs.Trigger>
            <Tabs.Trigger value="tax-reports">Tax Reports</Tabs.Trigger>
          </Tabs.List>

          <Tabs.Content value="balance-sheet">
            <BalanceSheetReport 
              data={mockReportsData.balanceSheet}
              period={selectedPeriod}
            />
          </Tabs.Content>

          <Tabs.Content value="income-statement">
            <IncomeStatementReport 
              data={mockReportsData.incomeStatement}
              period={selectedPeriod}
            />
          </Tabs.Content>

          <Tabs.Content value="cash-flow">
            <Card.Root>
              <Card.Body>
                <div className="text-center py-12">
                  <Icon className="mx-auto mb-4" color="neutral.400">
                    <FileChartColumn size={48} />
                  </Icon>
                  <Heading size="md" className="mb-2">Cash Flow Statement</Heading>
                  <div className="text-neutral-600">Cash flow analysis coming soon</div>
                </div>
              </Card.Body>
            </Card.Root>
          </Tabs.Content>

          <Tabs.Content value="heatmaps">
            <HeatmapVisualization 
              data={[...mockReportsData.heatmapData]}
            />
          </Tabs.Content>

          <Tabs.Content value="tax-reports">
            <Card.Root>
              <Card.Body>
                <div className="text-center py-12">
                  <Icon className="mx-auto mb-4" color="neutral.400">
                    <FileChartColumn size={48} />
                  </Icon>
                  <Heading size="md" className="mb-2">Tax Reports</Heading>
                  <div className="text-neutral-600">Tax optimization reports coming soon</div>
                </div>
              </Card.Body>
            </Card.Root>
          </Tabs.Content>
        </Tabs.Root>
      </div>
    </Box>
  );
};