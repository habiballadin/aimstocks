import React, { useState } from 'react';
import { Card, Grid, Text, Icon, Progress, Button, Table } from '@chakra-ui/react';
import { PieChart, BarChart3, Grid3X3 } from 'lucide-react';
import { formatCurrency, formatPercentage } from '../../utils/formatters';

interface SectorAllocation {
  sector: string;
  percentage: number;
  value: number;
}

interface PortfolioBreakdownProps {
  data: SectorAllocation[];
  detailed?: boolean;
}

export const PortfolioBreakdown: React.FC<PortfolioBreakdownProps> = ({ 
  data, 
  detailed = false 
}) => {
  const [viewMode, setViewMode] = useState<'chart' | 'table'>('chart');

  const totalValue = data.reduce((sum, item) => sum + item.value, 0);

  const getSectorColor = (sector: string) => {
    const colors = {
      'Technology': 'blue',
      'Healthcare': 'green',
      'Financial Services': 'purple',
      'Consumer Discretionary': 'orange',
      'Energy': 'yellow',
      'Others': 'gray'
    };
    return colors[sector as keyof typeof colors] || 'gray';
  };

  if (detailed) {
    return (
      <div className="space-y-6">
        <Card.Root>
          <Card.Body>
            <div className="flex items-center justify-between mb-4">
              <div>
                <Text className="text-lg font-semibold">Portfolio Allocation</Text>
                <Text className="text-sm text-neutral-600">
                  Detailed breakdown by sector and holdings
                </Text>
              </div>
              
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant={viewMode === 'chart' ? 'solid' : 'outline'}
                  onClick={() => setViewMode('chart')}
                >
                  <Icon>
                    <PieChart size={16} />
                  </Icon>
                  Chart
                </Button>
                <Button
                  size="sm"
                  variant={viewMode === 'table' ? 'solid' : 'outline'}
                  onClick={() => setViewMode('table')}
                >
                  <Icon>
                    <Grid3X3 size={16} />
                  </Icon>
                  Table
                </Button>
              </div>
            </div>

            {viewMode === 'chart' ? (
              <Grid templateColumns={{ base: '1fr', lg: '1fr 1fr' }} gap={6}>
                {/* Chart Placeholder */}
                <div className="h-64 bg-neutral-100 rounded-lg flex items-center justify-center">
                  <div className="text-center text-neutral-500">
                    <Icon className="mx-auto mb-2">
                      <PieChart size={32} />
                    </Icon>
                    <Text>Sector allocation pie chart</Text>
                    <Text className="text-sm">Interactive donut chart showing sector breakdown</Text>
                  </div>
                </div>

                {/* Sector List */}
                <div className="space-y-3">
                  {data.map((sector, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: `var(--chakra-colors-${getSectorColor(sector.sector)}-500)` }}
                        />
                        <div>
                          <div className="font-medium">{sector.sector}</div>
                          <div className="text-sm text-neutral-600">
                            {formatCurrency(sector.value)}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">{formatPercentage(sector.percentage)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </Grid>
            ) : (
              <div className="overflow-x-auto">
                <Table.Root>
                  <Table.Header>
                    <Table.Row>
                      <Table.ColumnHeader>Sector</Table.ColumnHeader>
                      <Table.ColumnHeader className="text-right">Value</Table.ColumnHeader>
                      <Table.ColumnHeader className="text-right">Percentage</Table.ColumnHeader>
                      <Table.ColumnHeader className="text-right">Weight</Table.ColumnHeader>
                    </Table.Row>
                  </Table.Header>
                  <Table.Body>
                    {data.map((sector, index) => (
                      <Table.Row key={index}>
                        <Table.Cell>
                          <div className="flex items-center gap-3">
                            <div 
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: `var(--chakra-colors-${getSectorColor(sector.sector)}-500)` }}
                            />
                            <span className="font-medium">{sector.sector}</span>
                          </div>
                        </Table.Cell>
                        <Table.Cell className="text-right font-mono">
                          {formatCurrency(sector.value)}
                        </Table.Cell>
                        <Table.Cell className="text-right font-mono">
                          {formatPercentage(sector.percentage)}
                        </Table.Cell>
                        <Table.Cell className="text-right">
                          <Progress.Root 
                            value={sector.percentage} 
                            max={50}
                            colorPalette={getSectorColor(sector.sector)}
                            size="sm"
                          >
                            <Progress.Track>
                              <Progress.Range />
                            </Progress.Track>
                          </Progress.Root>
                        </Table.Cell>
                      </Table.Row>
                    ))}
                  </Table.Body>
                </Table.Root>
              </div>
            )}
          </Card.Body>
        </Card.Root>

        {/* Additional Breakdowns */}
        <Grid templateColumns={{ base: '1fr', lg: 'repeat(2, 1fr)' }} gap={6}>
          <Card.Root>
            <Card.Body>
              <div className="mb-4">
                <Text className="text-lg font-semibold">Market Cap Distribution</Text>
                <Text className="text-sm text-neutral-600">
                  Portfolio allocation by company size
                </Text>
              </div>
              
              <div className="space-y-4">
                {[
                  { name: 'Large Cap', percentage: 65, value: 162500 },
                  { name: 'Mid Cap', percentage: 25, value: 62500 },
                  { name: 'Small Cap', percentage: 10, value: 25000 }
                ].map((cap, index) => (
                  <div key={index}>
                    <div className="flex justify-between items-center mb-2">
                      <Text className="text-sm font-medium">{cap.name}</Text>
                      <div className="text-right">
                        <div className="text-sm font-semibold">{formatPercentage(cap.percentage)}</div>
                        <div className="text-xs text-neutral-600">{formatCurrency(cap.value)}</div>
                      </div>
                    </div>
                    <Progress.Root value={cap.percentage} max={100} colorPalette="blue">
                      <Progress.Track>
                        <Progress.Range />
                      </Progress.Track>
                    </Progress.Root>
                  </div>
                ))}
              </div>
            </Card.Body>
          </Card.Root>

          <Card.Root>
            <Card.Body>
              <div className="mb-4">
                <Text className="text-lg font-semibold">Geographic Distribution</Text>
                <Text className="text-sm text-neutral-600">
                  Portfolio allocation by region
                </Text>
              </div>
              
              <div className="space-y-4">
                {[
                  { name: 'North America', percentage: 70, value: 175000 },
                  { name: 'Europe', percentage: 20, value: 50000 },
                  { name: 'Asia Pacific', percentage: 8, value: 20000 },
                  { name: 'Emerging Markets', percentage: 2, value: 5000 }
                ].map((region, index) => (
                  <div key={index}>
                    <div className="flex justify-between items-center mb-2">
                      <Text className="text-sm font-medium">{region.name}</Text>
                      <div className="text-right">
                        <div className="text-sm font-semibold">{formatPercentage(region.percentage)}</div>
                        <div className="text-xs text-neutral-600">{formatCurrency(region.value)}</div>
                      </div>
                    </div>
                    <Progress.Root value={region.percentage} max={100} colorPalette="green">
                      <Progress.Track>
                        <Progress.Range />
                      </Progress.Track>
                    </Progress.Root>
                  </div>
                ))}
              </div>
            </Card.Body>
          </Card.Root>
        </Grid>
      </div>
    );
  }

  return (
    <Card.Root>
      <Card.Body>
        <div className="flex items-center justify-between mb-4">
          <div>
            <Text className="text-lg font-semibold">Portfolio Breakdown</Text>
            <Text className="text-sm text-neutral-600">
              Sector allocation overview
            </Text>
          </div>
          <Icon color="analytics.neutral">
            <BarChart3 size={20} />
          </Icon>
        </div>
        
        <div className="space-y-3">
          {data.map((sector, index) => (
            <div key={index}>
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: `var(--chakra-colors-${getSectorColor(sector.sector)}-500)` }}
                  />
                  <Text className="text-sm font-medium">{sector.sector}</Text>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold">{formatPercentage(sector.percentage)}</div>
                  <div className="text-xs text-neutral-600">{formatCurrency(sector.value)}</div>
                </div>
              </div>
              <Progress.Root 
                value={sector.percentage} 
                max={50}
                colorPalette={getSectorColor(sector.sector)}
                size="sm"
              >
                <Progress.Track>
                  <Progress.Range />
                </Progress.Track>
              </Progress.Root>
            </div>
          ))}
        </div>
        
        {/* Summary */}
        <div className="mt-4 pt-4 border-t border-neutral-200">
          <div className="flex justify-between items-center">
            <Text className="text-sm text-neutral-600">Total Portfolio Value</Text>
            <Text className="font-semibold">{formatCurrency(totalValue)}</Text>
          </div>
        </div>
      </Card.Body>
    </Card.Root>
  );
};