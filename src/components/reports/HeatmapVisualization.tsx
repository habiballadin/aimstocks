import React, { useState } from 'react';
import { Card, Text, Select, Button, Grid, createListCollection } from '@chakra-ui/react';
import { Blocks, Download } from 'lucide-react';

interface HeatmapData {
  symbol: string;
  sector: string;
  performance: number;
  volume: number;
}

interface HeatmapVisualizationProps {
  data: HeatmapData[];
}

export const HeatmapVisualization: React.FC<HeatmapVisualizationProps> = ({ data }) => {
  const [heatmapType, setHeatmapType] = useState('performance');
  const [timeframe, setTimeframe] = useState('1D');

  const heatmapTypes = [
    { value: 'performance', label: 'Performance' },
    { value: 'volume', label: 'Volume' },
    { value: 'volatility', label: 'Volatility' },
    { value: 'market-cap', label: 'Market Cap' }
  ];

  const timeframes = [
    { value: '1D', label: '1 Day' },
    { value: '1W', label: '1 Week' },
    { value: '1M', label: '1 Month' },
    { value: '3M', label: '3 Months' },
    { value: '1Y', label: '1 Year' }
  ];

  const getPerformanceColor = (performance: number) => {
    if (performance > 10) return 'bg-success-600';
    if (performance > 5) return 'bg-success-400';
    if (performance > 0) return 'bg-success-200';
    if (performance > -5) return 'bg-danger-200';
    if (performance > -10) return 'bg-danger-400';
    return 'bg-danger-600';
  };

  const getVolumeColor = (volume: number) => {
    if (volume > 80) return 'bg-blue-600';
    if (volume > 60) return 'bg-blue-400';
    if (volume > 40) return 'bg-blue-200';
    if (volume > 20) return 'bg-blue-100';
    return 'bg-neutral-100';
  };

  const getCellColor = (item: HeatmapData) => {
    switch (heatmapType) {
      case 'performance':
        return getPerformanceColor(item.performance);
      case 'volume':
        return getVolumeColor(item.volume);
      default:
        return getPerformanceColor(item.performance);
    }
  };

  const getCellValue = (item: HeatmapData) => {
    switch (heatmapType) {
      case 'performance':
        return `${item.performance > 0 ? '+' : ''}${item.performance.toFixed(1)}%`;
      case 'volume':
        return `${item.volume.toFixed(1)}M`;
      default:
        return `${item.performance > 0 ? '+' : ''}${item.performance.toFixed(1)}%`;
    }
  };

  const getTextColor = (item: HeatmapData) => {
    const value = heatmapType === 'performance' ? item.performance : item.volume;
    const threshold = heatmapType === 'performance' ? 5 : 50;
    return Math.abs(value) > threshold ? 'text-white' : 'text-neutral-900';
  };

  // Group data by sector for better visualization
  const groupedData = data.reduce((acc, item) => {
    if (!acc[item.sector]) {
      acc[item.sector] = [];
    }
    acc[item.sector].push(item);
    return acc;
  }, {} as Record<string, HeatmapData[]>);

  return (
    <div className="space-y-6">
      <Card.Root>
        <Card.Body>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Blocks size={24} color="var(--chakra-colors-analytics-neutral)" />
              <div>
                <Text className="text-lg font-semibold">Market Heatmap</Text>
                <Text className="text-sm text-neutral-600">
                  Visual representation of market performance and activity
                </Text>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Select.Root 
                collection={createListCollection({ items: heatmapTypes })}
                value={[heatmapType]} 
                onValueChange={(e) => setHeatmapType(e.value[0])}
              >
                <Select.Trigger className="min-w-32">
                  <Select.ValueText />
                </Select.Trigger>
                <Select.Content>
                  {heatmapTypes.map(type => (
                    <Select.Item key={type.value} item={type}>
                      {type.label}
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select.Root>
              
              <Select.Root 
                collection={createListCollection({ items: timeframes })}
                value={[timeframe]} 
                onValueChange={(e) => setTimeframe(e.value[0])}
              >
                <Select.Trigger className="min-w-24">
                  <Select.ValueText />
                </Select.Trigger>
                <Select.Content>
                  {timeframes.map(tf => (
                    <Select.Item key={tf.value} item={tf}>
                      {tf.label}
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select.Root>
              
              <Button variant="outline" size="sm">
                <Download size={16} className="mr-2" />
                Export
              </Button>
            </div>
          </div>

          {/* Heatmap Grid */}
          <div className="space-y-4">
            {Object.entries(groupedData).map(([sector, stocks]) => (
              <div key={sector}>
                <Text className="text-sm font-semibold text-neutral-700 mb-2">
                  {sector}
                </Text>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
                  {stocks.map((stock, index) => (
                    <div
                      key={index}
                      className={`
                        relative p-3 rounded-lg border border-neutral-200 cursor-pointer
                        hover:scale-105 transition-transform group
                        ${getCellColor(stock)}
                      `}
                    >
                      <div className={`text-center ${getTextColor(stock)}`}>
                        <div className="font-semibold text-sm">{stock.symbol}</div>
                        <div className="text-xs font-medium">
                          {getCellValue(stock)}
                        </div>
                      </div>
                      
                      {/* Tooltip */}
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-neutral-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 whitespace-nowrap">
                        <div>{stock.symbol}</div>
                        <div>Performance: {stock.performance > 0 ? '+' : ''}{stock.performance.toFixed(1)}%</div>
                        <div>Volume: {stock.volume.toFixed(1)}M</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className="mt-6 flex items-center justify-between">
            <div>
              <Text className="text-sm font-medium mb-2">
                {heatmapType === 'performance' ? 'Performance Scale' : 'Volume Scale'}
              </Text>
              <div className="flex items-center gap-2">
                {heatmapType === 'performance' ? (
                  <>
                    <div className="flex items-center gap-1">
                      <div className="w-4 h-4 bg-danger-600 rounded"></div>
                      <Text className="text-xs">&lt; -10%</Text>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-4 h-4 bg-danger-200 rounded"></div>
                      <Text className="text-xs">-5% to 0%</Text>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-4 h-4 bg-success-200 rounded"></div>
                      <Text className="text-xs">0% to +5%</Text>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-4 h-4 bg-success-600 rounded"></div>
                      <Text className="text-xs">&gt; +10%</Text>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center gap-1">
                      <div className="w-4 h-4 bg-neutral-100 rounded"></div>
                      <Text className="text-xs">Low</Text>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-4 h-4 bg-blue-200 rounded"></div>
                      <Text className="text-xs">Medium</Text>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-4 h-4 bg-blue-600 rounded"></div>
                      <Text className="text-xs">High</Text>
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="text-right">
              <Text className="text-sm font-medium">Market Summary</Text>
              <div className="text-xs text-neutral-600 space-y-1">
                <div>Gainers: {data.filter(d => d.performance > 0).length}</div>
                <div>Losers: {data.filter(d => d.performance < 0).length}</div>
                <div>Avg Performance: {(data.reduce((sum, d) => sum + d.performance, 0) / data.length).toFixed(1)}%</div>
              </div>
            </div>
          </div>
        </Card.Body>
      </Card.Root>

      {/* Sector Performance Summary */}
      <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={6}>
        <Card.Root>
          <Card.Body>
            <Text className="text-lg font-semibold mb-4">Sector Performance</Text>
            <div className="space-y-3">
              {Object.entries(groupedData).map(([sector, stocks]) => {
                const avgPerformance = stocks.reduce((sum, stock) => sum + stock.performance, 0) / stocks.length;
                return (
                  <div key={sector} className="flex justify-between items-center">
                    <Text className="text-sm">{sector}</Text>
                    <div className={`text-sm font-semibold ${
                      avgPerformance >= 0 ? 'text-success-600' : 'text-danger-600'
                    }`}>
                      {avgPerformance >= 0 ? '+' : ''}{avgPerformance.toFixed(1)}%
                    </div>
                  </div>
                );
              })}
            </div>
          </Card.Body>
        </Card.Root>

        <Card.Root>
          <Card.Body>
            <Text className="text-lg font-semibold mb-4">Top Performers</Text>
            <div className="space-y-3">
              {data
                .sort((a, b) => b.performance - a.performance)
                .slice(0, 5)
                .map((stock, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <div>
                      <Text className="text-sm font-medium">{stock.symbol}</Text>
                      <Text className="text-xs text-neutral-600">{stock.sector}</Text>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold text-success-600">
                        +{stock.performance.toFixed(1)}%
                      </div>
                      <div className="text-xs text-neutral-600">
                        Vol: {stock.volume.toFixed(1)}M
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </Card.Body>
        </Card.Root>
      </Grid>
    </div>
  );
};