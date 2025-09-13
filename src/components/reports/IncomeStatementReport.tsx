import React from 'react';
import { Card, Table, Text, Grid, Icon, Progress } from '@chakra-ui/react';
import { TrendingUp, DollarSign } from 'lucide-react';
import { formatCurrency, formatPercentage } from '../../utils/formatters';

interface IncomeStatementData {
  revenue: number;
  grossProfit: number;
  operatingIncome: number;
  netIncome: number;
  eps: number;
  dividends: number;
}

interface IncomeStatementReportProps {
  data: IncomeStatementData;
  period: string;
}

export const IncomeStatementReport: React.FC<IncomeStatementReportProps> = ({ data, period }) => {
  const calculateMargins = () => {
    return {
      grossMargin: (data.grossProfit / data.revenue) * 100,
      operatingMargin: (data.operatingIncome / data.revenue) * 100,
      netMargin: (data.netIncome / data.revenue) * 100
    };
  };

  const margins = calculateMargins();

  const incomeItems = [
    { name: 'Revenue', value: data.revenue, margin: 100, bold: true },
    { name: 'Cost of Goods Sold', value: data.revenue - data.grossProfit, margin: null },
    { name: 'Gross Profit', value: data.grossProfit, margin: margins.grossMargin, bold: true },
    { name: 'Operating Expenses', value: data.grossProfit - data.operatingIncome, margin: null },
    { name: 'Operating Income', value: data.operatingIncome, margin: margins.operatingMargin, bold: true },
    { name: 'Other Income/Expenses', value: data.operatingIncome - data.netIncome, margin: null },
    { name: 'Net Income', value: data.netIncome, margin: margins.netMargin, bold: true, highlight: true }
  ];

  return (
    <div className="space-y-6">
      <Grid templateColumns={{ base: '1fr', lg: '2fr 1fr' }} gap={6}>
        {/* Income Statement Table */}
        <Card.Root>
          <Card.Body>
            <div className="mb-4">
              <Text className="text-lg font-semibold">Income Statement</Text>
              <Text className="text-sm text-neutral-600">
                Financial performance for {period}
              </Text>
            </div>

            <div className="overflow-x-auto">
              <Table.Root>
                <Table.Header>
                  <Table.Row>
                    <Table.ColumnHeader>Item</Table.ColumnHeader>
                    <Table.ColumnHeader className="text-right">Amount</Table.ColumnHeader>
                    <Table.ColumnHeader className="text-right">Margin %</Table.ColumnHeader>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {incomeItems.map((item, index) => (
                    <Table.Row 
                      key={index}
                      className={item.highlight ? 'bg-success-50' : ''}
                    >
                      <Table.Cell>
                        <div className={item.bold ? 'font-semibold' : ''}>
                          {item.name}
                        </div>
                      </Table.Cell>
                      <Table.Cell className={`text-right font-mono ${
                        item.bold ? 'font-semibold' : ''
                      } ${item.highlight ? 'text-success-700' : ''}`}>
                        {formatCurrency(item.value)}
                      </Table.Cell>
                      <Table.Cell className="text-right text-sm">
                        {item.margin ? (
                          <span className={item.highlight ? 'text-success-700 font-semibold' : 'text-neutral-600'}>
                            {formatPercentage(item.margin)}
                          </span>
                        ) : (
                          <span className="text-neutral-400">-</span>
                        )}
                      </Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table.Root>
            </div>

            {/* Key Metrics */}
            <div className="mt-6 grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-neutral-50 rounded-lg">
                <div className="text-sm text-neutral-600">Earnings Per Share</div>
                <div className="text-xl font-bold text-ai-600">${data.eps}</div>
              </div>
              <div className="text-center p-3 bg-neutral-50 rounded-lg">
                <div className="text-sm text-neutral-600">Dividends Paid</div>
                <div className="text-xl font-bold text-success-600">{formatCurrency(data.dividends)}</div>
              </div>
            </div>
          </Card.Body>
        </Card.Root>

        {/* Profitability Analysis */}
        <Card.Root>
          <Card.Body>
            <div className="mb-4">
              <Text className="text-lg font-semibold">Profitability Analysis</Text>
              <Text className="text-sm text-neutral-600">
                Margin trends and efficiency
              </Text>
            </div>

            <div className="space-y-4">
              <div className="p-3 bg-neutral-50 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <Text className="text-sm font-medium">Gross Margin</Text>
                  <Text className="font-mono font-semibold text-success-600">
                    {formatPercentage(margins.grossMargin)}
                  </Text>
                </div>
                <Progress.Root value={margins.grossMargin} max={100} colorPalette="green">
                  <Progress.Track>
                    <Progress.Range />
                  </Progress.Track>
                </Progress.Root>
                <Text className="text-xs text-neutral-600 mt-1">
                  Revenue efficiency after direct costs
                </Text>
              </div>

              <div className="p-3 bg-neutral-50 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <Text className="text-sm font-medium">Operating Margin</Text>
                  <Text className="font-mono font-semibold text-ai-600">
                    {formatPercentage(margins.operatingMargin)}
                  </Text>
                </div>
                <Progress.Root value={margins.operatingMargin} max={100} colorPalette="blue">
                  <Progress.Track>
                    <Progress.Range />
                  </Progress.Track>
                </Progress.Root>
                <Text className="text-xs text-neutral-600 mt-1">
                  Operational efficiency measure
                </Text>
              </div>

              <div className="p-3 bg-neutral-50 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <Text className="text-sm font-medium">Net Margin</Text>
                  <Text className="font-mono font-semibold text-warning-600">
                    {formatPercentage(margins.netMargin)}
                  </Text>
                </div>
                <Progress.Root value={margins.netMargin} max={100} colorPalette="orange">
                  <Progress.Track>
                    <Progress.Range />
                  </Progress.Track>
                </Progress.Root>
                <Text className="text-xs text-neutral-600 mt-1">
                  Overall profitability after all expenses
                </Text>
              </div>

              {/* Performance Indicators */}
              <div className="mt-4 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-neutral-600">Revenue Growth</span>
                  <div className="flex items-center gap-1 text-success-600">
                    <Icon>
                      <TrendingUp size={14} />
                    </Icon>
                    <span className="font-semibold">+12.5%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-neutral-600">Profit Growth</span>
                  <div className="flex items-center gap-1 text-success-600">
                    <Icon>
                      <TrendingUp size={14} />
                    </Icon>
                    <span className="font-semibold">+18.3%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-neutral-600">ROE</span>
                  <span className="font-semibold text-ai-600">15.8%</span>
                </div>
              </div>
            </div>
          </Card.Body>
        </Card.Root>
      </Grid>

      {/* Revenue Breakdown Chart Placeholder */}
      <Card.Root>
        <Card.Body>
          <div className="mb-4">
            <Text className="text-lg font-semibold">Revenue Analysis</Text>
            <Text className="text-sm text-neutral-600">
              Revenue trends and composition over time
            </Text>
          </div>
          
          <div className="h-64 bg-neutral-100 rounded-lg flex items-center justify-center">
            <div className="text-center text-neutral-500">
              <Icon className="mx-auto mb-2">
                <DollarSign size={32} />
              </Icon>
              <Text>Revenue trend chart would be rendered here</Text>
              <Text className="text-sm">Line chart showing revenue, profit margins over time</Text>
            </div>
          </div>
        </Card.Body>
      </Card.Root>
    </div>
  );
};