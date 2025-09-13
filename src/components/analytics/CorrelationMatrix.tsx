import React from 'react';
import { Card, Text } from '@chakra-ui/react';
import { Blocks } from 'lucide-react';

interface CorrelationMatrixProps {
  data: number[][];
}

export const CorrelationMatrix: React.FC<CorrelationMatrixProps> = ({ data }) => {
  const assets = ['AAPL', 'GOOGL', 'MSFT', 'TSLA'];
  
  const getCorrelationColor = (value: number) => {
    if (value > 0.7) return 'bg-success-500';
    if (value > 0.3) return 'bg-success-300';
    if (value > -0.3) return 'bg-neutral-300';
    if (value > -0.7) return 'bg-danger-300';
    return 'bg-danger-500';
  };

  const getCorrelationIntensity = (value: number) => {
    return Math.abs(value);
  };

  return (
    <Card.Root>
      <Card.Body>
        <div className="flex items-center gap-3 mb-6">
          <Blocks size={24} color="var(--chakra-colors-analytics-neutral)" />
          <div>
            <Text className="text-lg font-semibold">Correlation Matrix</Text>
            <Text className="text-sm text-neutral-600">
              Asset correlation analysis showing relationships between holdings
            </Text>
          </div>
        </div>

        {/* Matrix Grid */}
        <div className="overflow-x-auto">
          <div className="inline-block min-w-full">
            {/* Header Row */}
            <div className="flex">
              <div className="w-16 h-16 flex items-center justify-center">
                {/* Empty corner */}
              </div>
              {assets.map((asset, index) => (
                <div key={index} className="w-16 h-16 flex items-center justify-center">
                  <Text className="text-sm font-semibold transform -rotate-45">
                    {asset}
                  </Text>
                </div>
              ))}
            </div>

            {/* Matrix Rows */}
            {data.map((row, rowIndex) => (
              <div key={rowIndex} className="flex">
                {/* Row Label */}
                <div className="w-16 h-16 flex items-center justify-center">
                  <Text className="text-sm font-semibold">
                    {assets[rowIndex]}
                  </Text>
                </div>

                {/* Correlation Cells */}
                {row.map((value, colIndex) => (
                  <div 
                    key={colIndex}
                    className={`w-16 h-16 flex items-center justify-center border border-neutral-200 relative group cursor-pointer ${getCorrelationColor(value)}`}
                    style={{ opacity: 0.3 + (getCorrelationIntensity(value) * 0.7) }}
                  >
                    <Text 
                      className={`text-xs font-semibold ${
                        Math.abs(value) > 0.5 ? 'text-white' : 'text-neutral-900'
                      }`}
                    >
                      {value.toFixed(2)}
                    </Text>

                    {/* Tooltip on hover */}
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-neutral-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                      {assets[rowIndex]} vs {assets[colIndex]}: {value.toFixed(3)}
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="mt-6 flex items-center justify-between">
          <div>
            <Text className="text-sm font-medium mb-2">Correlation Scale</Text>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <div className="w-4 h-4 bg-danger-500 rounded"></div>
                <Text className="text-xs">-1.0</Text>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-4 h-4 bg-danger-300 rounded"></div>
                <Text className="text-xs">-0.5</Text>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-4 h-4 bg-neutral-300 rounded"></div>
                <Text className="text-xs">0.0</Text>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-4 h-4 bg-success-300 rounded"></div>
                <Text className="text-xs">+0.5</Text>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-4 h-4 bg-success-500 rounded"></div>
                <Text className="text-xs">+1.0</Text>
              </div>
            </div>
          </div>

          <div className="text-right">
            <Text className="text-sm font-medium">Interpretation</Text>
            <div className="text-xs text-neutral-600 space-y-1">
              <div>Strong positive: &gt; 0.7</div>
              <div>Moderate positive: 0.3 to 0.7</div>
              <div>Weak/No correlation: -0.3 to 0.3</div>
              <div>Negative correlation: &lt; -0.3</div>
            </div>
          </div>
        </div>

        {/* Key Insights */}
        <div className="mt-6 p-4 bg-neutral-50 rounded-lg">
          <Text className="text-sm font-medium mb-2">Key Insights</Text>
          <div className="text-xs text-neutral-600 space-y-1">
            <div>• Tech stocks (AAPL, GOOGL, MSFT) show moderate positive correlation</div>
            <div>• TSLA exhibits lower correlation with traditional tech stocks</div>
            <div>• Diversification benefit exists across the portfolio</div>
            <div>• Consider rebalancing if correlations increase significantly</div>
          </div>
        </div>
      </Card.Body>
    </Card.Root>
  );
};