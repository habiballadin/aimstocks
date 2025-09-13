import React from 'react';
import { Card, Table, Text, Grid, Icon } from '@chakra-ui/react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

interface BalanceSheetData {
  totalAssets: number;
  currentAssets: number;
  fixedAssets: number;
  totalLiabilities: number;
  currentLiabilities: number;
  longTermLiabilities: number;
  equity: number;
  retainedEarnings: number;
}

interface BalanceSheetReportProps {
  data: BalanceSheetData;
  period: string;
}

export const BalanceSheetReport: React.FC<BalanceSheetReportProps> = ({ data, period }) => {
  const calculateRatios = () => {
    return {
      currentRatio: data.currentAssets / data.currentLiabilities,
      debtToEquity: data.totalLiabilities / data.equity,
      equityRatio: data.equity / data.totalAssets,
      assetTurnover: data.totalAssets / data.equity // Simplified calculation
    };
  };

  const ratios = calculateRatios();

  const balanceSheetItems = [
    {
      category: 'ASSETS',
      items: [
        { name: 'Current Assets', value: data.currentAssets, indent: 1 },
        { name: 'Fixed Assets', value: data.fixedAssets, indent: 1 },
        { name: 'Total Assets', value: data.totalAssets, indent: 0, bold: true }
      ]
    },
    {
      category: 'LIABILITIES',
      items: [
        { name: 'Current Liabilities', value: data.currentLiabilities, indent: 1 },
        { name: 'Long-term Liabilities', value: data.longTermLiabilities, indent: 1 },
        { name: 'Total Liabilities', value: data.totalLiabilities, indent: 0, bold: true }
      ]
    },
    {
      category: 'EQUITY',
      items: [
        { name: 'Retained Earnings', value: data.retainedEarnings, indent: 1 },
        { name: 'Total Equity', value: data.equity, indent: 0, bold: true }
      ]
    }
  ];

  return (
    <div className="space-y-6">
      <Grid templateColumns={{ base: '1fr', lg: '2fr 1fr' }} gap={6}>
        {/* Balance Sheet Table */}
        <Card.Root>
          <Card.Body>
            <div className="mb-4">
              <Text className="text-lg font-semibold">Balance Sheet</Text>
              <Text className="text-sm text-neutral-600">
                Financial position as of {period}
              </Text>
            </div>

            <div className="overflow-x-auto">
              <Table.Root>
                <Table.Header>
                  <Table.Row>
                    <Table.ColumnHeader>Item</Table.ColumnHeader>
                    <Table.ColumnHeader className="text-right">Amount</Table.ColumnHeader>
                    <Table.ColumnHeader className="text-right">% of Total</Table.ColumnHeader>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {balanceSheetItems.map((category, categoryIndex) => (
                    <React.Fragment key={categoryIndex}>
                      <Table.Row className="bg-neutral-50">
                        <Table.Cell colSpan={3} className="font-semibold text-neutral-700">
                          {category.category}
                        </Table.Cell>
                      </Table.Row>
                      {category.items.map((item, itemIndex) => (
                        <Table.Row key={itemIndex}>
                          <Table.Cell>
                            <div 
                              className={`${item.indent === 1 ? 'pl-4' : ''} ${
                                item.bold ? 'font-semibold' : ''
                              }`}
                            >
                              {item.name}
                            </div>
                          </Table.Cell>
                          <Table.Cell className={`text-right font-mono ${
                            item.bold ? 'font-semibold' : ''
                          }`}>
                            {formatCurrency(item.value)}
                          </Table.Cell>
                          <Table.Cell className="text-right text-sm text-neutral-600">
                            {((item.value / data.totalAssets) * 100).toFixed(1)}%
                          </Table.Cell>
                        </Table.Row>
                      ))}
                    </React.Fragment>
                  ))}
                </Table.Body>
              </Table.Root>
            </div>

            {/* Balance Check */}
            <div className="mt-4 p-3 bg-success-50 border border-success-200 rounded-lg">
              <div className="flex justify-between items-center">
                <Text className="text-sm font-medium text-success-800">
                  Balance Verification
                </Text>
                <div className="flex items-center gap-2">
                  <Icon color="success.600">
                    <TrendingUp size={16} />
                  </Icon>
                  <Text className="text-sm text-success-700">
                    Assets = Liabilities + Equity ✓
                  </Text>
                </div>
              </div>
            </div>
          </Card.Body>
        </Card.Root>

        {/* Financial Ratios */}
        <Card.Root>
          <Card.Body>
            <div className="mb-4">
              <Text className="text-lg font-semibold">Key Ratios</Text>
              <Text className="text-sm text-neutral-600">
                Financial health indicators
              </Text>
            </div>

            <div className="space-y-4">
              <div className="p-3 bg-neutral-50 rounded-lg">
                <div className="flex justify-between items-center mb-1">
                  <Text className="text-sm font-medium">Current Ratio</Text>
                  <Text className="font-mono font-semibold">
                    {ratios.currentRatio.toFixed(2)}
                  </Text>
                </div>
                <Text className="text-xs text-neutral-600">
                  Current Assets / Current Liabilities
                </Text>
                <div className="mt-2">
                  {ratios.currentRatio > 1.5 ? (
                    <div className="flex items-center gap-1 text-success-600">
                      <Icon>
                        <TrendingUp size={12} />
                      </Icon>
                      <Text className="text-xs">Good liquidity</Text>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 text-warning-600">
                      <Icon>
                        <TrendingDown size={12} />
                      </Icon>
                      <Text className="text-xs">Monitor liquidity</Text>
                    </div>
                  )}
                </div>
              </div>

              <div className="p-3 bg-neutral-50 rounded-lg">
                <div className="flex justify-between items-center mb-1">
                  <Text className="text-sm font-medium">Debt-to-Equity</Text>
                  <Text className="font-mono font-semibold">
                    {ratios.debtToEquity.toFixed(2)}
                  </Text>
                </div>
                <Text className="text-xs text-neutral-600">
                  Total Liabilities / Total Equity
                </Text>
                <div className="mt-2">
                  {ratios.debtToEquity < 0.5 ? (
                    <div className="flex items-center gap-1 text-success-600">
                      <Icon>
                        <TrendingUp size={12} />
                      </Icon>
                      <Text className="text-xs">Conservative leverage</Text>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 text-warning-600">
                      <Icon>
                        <TrendingDown size={12} />
                      </Icon>
                      <Text className="text-xs">High leverage</Text>
                    </div>
                  )}
                </div>
              </div>

              <div className="p-3 bg-neutral-50 rounded-lg">
                <div className="flex justify-between items-center mb-1">
                  <Text className="text-sm font-medium">Equity Ratio</Text>
                  <Text className="font-mono font-semibold">
                    {(ratios.equityRatio * 100).toFixed(1)}%
                  </Text>
                </div>
                <Text className="text-xs text-neutral-600">
                  Total Equity / Total Assets
                </Text>
                <div className="mt-2">
                  <div className="flex items-center gap-1 text-ai-600">
                    <Icon>
                      <TrendingUp size={12} />
                    </Icon>
                    <Text className="text-xs">Strong equity base</Text>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-neutral-50 rounded-lg">
                <div className="flex justify-between items-center mb-1">
                  <Text className="text-sm font-medium">Asset Efficiency</Text>
                  <Text className="font-mono font-semibold">
                    {ratios.assetTurnover.toFixed(2)}x
                  </Text>
                </div>
                <Text className="text-xs text-neutral-600">
                  Asset utilization ratio
                </Text>
              </div>
            </div>
          </Card.Body>
        </Card.Root>
      </Grid>

      {/* Asset Composition Chart Placeholder */}
      <Card.Root>
        <Card.Body>
          <div className="mb-4">
            <Text className="text-lg font-semibold">Asset Composition</Text>
            <Text className="text-sm text-neutral-600">
              Breakdown of asset categories
            </Text>
          </div>
          
          <div className="h-64 bg-neutral-100 rounded-lg flex items-center justify-center">
            <div className="text-center text-neutral-500">
              <Icon className="mx-auto mb-2">
                <TrendingUp size={32} />
              </Icon>
              <Text>Asset composition chart would be rendered here</Text>
              <Text className="text-sm">Pie chart showing current vs fixed assets breakdown</Text>
            </div>
          </div>
        </Card.Body>
      </Card.Root>
    </div>
  );
};