import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Text, 
  Box, 
  Flex, 
  Button,
  Badge,
  Group
} from '@chakra-ui/react';
import { ChartCandlestick, TrendingUp, Brain, Wifi, WifiOff } from 'lucide-react';
import { ChartTimeframe } from '../../types/enums';
import Chart from 'react-apexcharts';
import { ApexOptions } from 'apexcharts';
import { fyersService, HistoricalData } from '../../services/fyersService';

interface StockChartProps {
  symbol?: string;
}

export const StockChart: React.FC<StockChartProps> = ({ symbol = 'NSE:RELIANCE-EQ' }) => {
  const [timeframe, setTimeframe] = useState<ChartTimeframe>(ChartTimeframe.ONE_DAY);
  const [showAIAnnotations, setShowAIAnnotations] = useState(true);
  const [chartData, setChartData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  const timeframes = [
    { value: ChartTimeframe.ONE_MIN, label: '1m' },
    { value: ChartTimeframe.FIVE_MIN, label: '5m' },
    { value: ChartTimeframe.FIFTEEN_MIN, label: '15m' },
    { value: ChartTimeframe.ONE_HOUR, label: '1h' },
    { value: ChartTimeframe.ONE_DAY, label: '1d' },
    { value: ChartTimeframe.ONE_WEEK, label: '1w' },
    { value: ChartTimeframe.ONE_MONTH, label: '1M' }
  ];

  const getResolutionFromTimeframe = (tf: ChartTimeframe): string => {
    switch (tf) {
      case ChartTimeframe.ONE_MIN: return '1';
      case ChartTimeframe.FIVE_MIN: return '5';
      case ChartTimeframe.FIFTEEN_MIN: return '15';
      case ChartTimeframe.ONE_HOUR: return '60';
      case ChartTimeframe.ONE_DAY: return 'D';
      case ChartTimeframe.ONE_WEEK: return 'W';
      case ChartTimeframe.ONE_MONTH: return 'M';
      default: return 'D';
    }
  };

  const fetchChartData = async () => {
    setLoading(true);
    try {
      const resolution = getResolutionFromTimeframe(timeframe);
      const data = await fyersService.getHistoricalData(symbol, resolution);
      
      const formattedData = data.map((item: HistoricalData) => ({
        x: new Date(item.timestamp).getTime(),
        y: [item.open, item.high, item.low, item.close]
      }));
      
      setChartData(formattedData);
      setIsConnected(true);
    } catch (error) {
      console.error('Failed to fetch chart data:', error);
      setIsConnected(false);
      // Fallback to mock data
      const mockData = [];
      let basePrice = 2800;
      const now = new Date();
      
      for (let i = 49; i >= 0; i--) {
        const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
        const open = Math.round((basePrice + (Math.random() - 0.5) * 20) * 100) / 100;
        const high = Math.round((open + Math.random() * 30) * 100) / 100;
        const low = Math.round((open - Math.random() * 30) * 100) / 100;
        const close = Math.round((low + Math.random() * (high - low)) * 100) / 100;
        
        mockData.push({
          x: date.getTime(),
          y: [open, high, low, close]
        });
        
        basePrice = close;
      }
      
      setChartData(mockData);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChartData();
  }, [symbol, timeframe]);
  
  const chartOptions: ApexOptions = {
    chart: {
      type: 'candlestick',
      height: 300,
      toolbar: {
        show: true,
        tools: {
          download: true,
          selection: true,
          zoom: true,
          zoomin: true,
          zoomout: true,
          pan: true,
          reset: true
        }
      }
    },
    title: {
      text: `${symbol} Stock Price`,
      align: 'left'
    },
    xaxis: {
      type: 'datetime'
    },
    yaxis: {
      tooltip: {
        enabled: true
      },
      labels: {
        formatter: function (val) {
          return '₹' + val.toFixed(2);
        }
      }
    },
    plotOptions: {
      candlestick: {
        colors: {
          upward: '#00B746',
          downward: '#EF403C'
        }
      }
    },
    grid: {
      show: true,
      borderColor: '#e0e0e0',
      strokeDashArray: 3
    },
    tooltip: {
      enabled: true,
      theme: 'light',
      custom: function({ seriesIndex, dataPointIndex, w }) {
        const data = w.globals.initialSeries[seriesIndex].data[dataPointIndex];
        const [open, high, low, close] = data.y;
        return `
          <div style="padding: 10px; background: white; border-radius: 4px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
            <div><strong>Open:</strong> ₹${open.toFixed(2)}</div>
            <div><strong>High:</strong> ₹${high.toFixed(2)}</div>
            <div><strong>Low:</strong> ₹${low.toFixed(2)}</div>
            <div><strong>Close:</strong> ₹${close.toFixed(2)}</div>
          </div>
        `;
      }
    }
  };

  const series = [{
    name: symbol.replace('NSE:', '').replace('-EQ', ''),
    data: chartData
  }];

  return (
    <Card.Root h="500px">
      <Card.Body>
        <Flex justify="space-between" align="center" mb={4}>
          <Flex align="center" gap={3}>
            <ChartCandlestick size={24} color="#3182ce" />
            <Box>
              <Text textStyle="heading.md" color="neutral.900">
                {symbol.replace('NSE:', '').replace('-EQ', '')} Chart
              </Text>
              <Flex align="center" gap={2}>
                <Text fontSize="sm" color="neutral.600">
                  Technical analysis with AI insights
                </Text>
                {isConnected ? (
                  <Wifi size={14} color="green" />
                ) : (
                  <WifiOff size={14} color="red" />
                )}
              </Flex>
            </Box>
          </Flex>
          
          <Flex align="center" gap={2}>
            <Button
              variant={showAIAnnotations ? 'solid' : 'outline'}
              size="sm"
              colorPalette="ai"
              onClick={() => setShowAIAnnotations(!showAIAnnotations)}
            >
            <Brain size={16} />
              AI Insights
            </Button>
          </Flex>
        </Flex>

        {/* Timeframe Selector */}
        <Group gap={1} mb={4}>
          {timeframes.map((tf) => (
            <Button
              key={tf.value}
              variant={timeframe === tf.value ? 'solid' : 'outline'}
              size="sm"
              colorPalette="brand"
              loading={loading && timeframe === tf.value}
              onClick={() => setTimeframe(tf.value)}
            >
              {tf.label}
            </Button>
          ))}
        </Group>

        {/* Chart Container */}
        <Box 
          position="relative" 
          h="350px" 
          bg="white" 
          borderRadius="md"
          border="1px solid"
          borderColor="neutral.200"
          p={2}
        >
          <Chart
            options={chartOptions}
            series={series}
            type="candlestick"
            height={320}
          />
          
          {/* AI Prediction Overlay */}
          {showAIAnnotations && (
            <Box position="absolute" top={4} right={4}>
              <Badge colorPalette="ai" size="sm">
                <TrendingUp size={12} />
                AI: Bullish Signal
              </Badge>
            </Box>
          )}
        </Box>

        {/* Chart Controls */}
        <Flex justify="space-between" align="center" mt={4}>
          <Flex gap={2}>
            <Button variant="outline" size="sm">
              Technical Indicators
            </Button>
            <Button variant="outline" size="sm">
              Drawing Tools
            </Button>
          </Flex>
          
          <Flex align="center" gap={2}>
            <Text fontSize="xs" color="neutral.600">
              {isConnected ? 'Live Data' : 'Demo Data'} • Last updated: {new Date().toLocaleTimeString()}
            </Text>
            <Button 
              variant="ghost" 
              size="xs" 
              onClick={fetchChartData}
              loading={loading}
            >
              Refresh
            </Button>
          </Flex>
        </Flex>
      </Card.Body>
    </Card.Root>
  );
};