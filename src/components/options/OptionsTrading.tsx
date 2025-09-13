import React, { useState } from 'react';
import { Box, Card, Tabs, Grid, Heading, Select, createListCollection } from '@chakra-ui/react';
import { Shuffle, TrendingUp } from 'lucide-react';
import { OptionsChain } from './OptionsChain';
import { GreeksCalculator } from './GreeksCalculator';
import { StrategyBuilder } from './StrategyBuilder';
import { mockOptionsChain } from '../../data/optionsAndAnalyticsMockData';

export const OptionsTrading: React.FC = () => {
  const [activeTab, setActiveTab] = useState('chain');
  const [selectedSymbol, setSelectedSymbol] = useState('HDFCBANK');

  const symbolOptions = createListCollection({
    items: [
      { value: 'HDFCBANK', label: 'HDFC Bank' },
      { value: 'RELIANCE', label: 'Reliance Industries' },
      { value: 'TCS', label: 'Tata Consultancy Services' },
      { value: 'INFY', label: 'Infosys Limited' },
      { value: 'ICICIBANK', label: 'ICICI Bank' }
    ]
  });

  return (
    <Box className="p-6 min-h-screen bg-neutral-50">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Shuffle size={28} color="#38a169" />
            <Heading size="2xl" color="neutral.900">
              Options Trading
            </Heading>
          </div>
          
          <div className="flex items-center gap-3">
            <TrendingUp size={20} color="#3182ce" />
            <Select.Root 
              collection={symbolOptions}
              value={[selectedSymbol]} 
              onValueChange={(e) => setSelectedSymbol(e.value[0])}
            >
              <Select.Trigger minW="200px">
                <Select.ValueText />
              </Select.Trigger>
              <Select.Content>
                {symbolOptions.items.map((symbol) => (
                  <Select.Item key={symbol.value} item={symbol}>
                    {symbol.label}
                  </Select.Item>
                ))}
              </Select.Content>
            </Select.Root>
          </div>
        </div>

        {/* Main Content */}
        <Tabs.Root 
          value={activeTab} 
          onValueChange={(e) => setActiveTab(e.value)}
        >
          <Tabs.List className="mb-6 bg-white p-1 rounded-lg shadow-sm">
            <Tabs.Trigger value="chain">Options Chain</Tabs.Trigger>
            <Tabs.Trigger value="greeks">Greeks Calculator</Tabs.Trigger>
            <Tabs.Trigger value="strategy">Strategy Builder</Tabs.Trigger>
          </Tabs.List>

          <Tabs.Content value="chain">
            <Grid templateColumns={{ base: '1fr', lg: '1fr 300px' }} gap={6}>
              <OptionsChain 
                symbol={selectedSymbol}
                optionsData={{
                  calls: [...mockOptionsChain.calls],
                  puts: [...mockOptionsChain.puts]
                }}
              />
              <Card.Root className="h-fit">
                <Card.Body>
                  <Heading size="md" className="mb-4">Market Info</Heading>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-neutral-600">Symbol:</span>
                      <span className="font-semibold">{selectedSymbol}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-600">Last Price:</span>
                      <span className="font-semibold">$185.50</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-600">IV Rank:</span>
                      <span className="font-semibold text-warning-600">28%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-600">Days to Expiry:</span>
                      <span className="font-semibold">15</span>
                    </div>
                  </div>
                </Card.Body>
              </Card.Root>
            </Grid>
          </Tabs.Content>

          <Tabs.Content value="greeks">
            <GreeksCalculator />
          </Tabs.Content>

          <Tabs.Content value="strategy">
            <StrategyBuilder />
          </Tabs.Content>
        </Tabs.Root>
      </div>
    </Box>
  );
};