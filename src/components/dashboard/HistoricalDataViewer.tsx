import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Text, 
  Box, 
  Flex, 
  SimpleGrid,
  Icon,
  Button,
  Badge,
  Stack,
  Tabs,
  Input,
  Select,
  Switch,
  Alert,
  createListCollection
} from '@chakra-ui/react';
import { 
  LineChart, 
  BarChart3,
  TrendingUp,
  Download,
  Maximize,
  Activity,
  Volume2,
  Target,
  Filter,
  Wifi
} from 'lucide-react';
import Chart from 'react-apexcharts';
import { formatCurrency, formatPercentage, formatNumber } from '../../utils/formatters';
import { ChartTimeframe, ChartType, TechnicalIndicator } from '../../types/enums';
import { getRealtimeQuote, RealtimeData } from '../../services/realtimeDataService';
import { fyersService } from '../../services/fyersService';

interface StockData {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  adjustedClose: number;
}

interface TechnicalIndicatorData {
  indicator: TechnicalIndicator;
  name: string;
  values: { date: string; value: number | { [key: string]: number } }[];
  parameters: Record<string, string | number>;
  visible: boolean;
  color: string;
}

interface ChartConfig {
  symbol: string;
  timeframe: ChartTimeframe;
  chartType: ChartType;
  startDate: string;
  endDate: string;
  indicators: TechnicalIndicatorData[];
  showVolume: boolean;
  showGrid: boolean;
  theme: 'light' | 'dark';
}

export const HistoricalDataViewer: React.FC = () => {
  const [activeTab, setActiveTab] = useState('chart');
  const [selectedSymbol, setSelectedSymbol] = useState('RELIANCE');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [realtimeData, setRealtimeData] = useState<RealtimeData | null>(null);
  const [isLiveMode, setIsLiveMode] = useState(false);
  const [isBrokerConnected, setIsBrokerConnected] = useState(false);

  const [chartConfig, setChartConfig] = useState<ChartConfig>({
    symbol: 'RELIANCE',
    timeframe: ChartTimeframe.ONE_DAY,
    chartType: ChartType.CANDLESTICK,
    startDate: '2024-01-01',
    endDate: '2024-12-31',
    indicators: [
      {
        indicator: TechnicalIndicator.SMA,
        name: 'SMA (20)',
        values: [],
        parameters: { period: 20 },
        visible: true,
        color: '#3b82f6'
      },
      {
        indicator: TechnicalIndicator.SMA,
        name: 'SMA (50)',
        values: [],
        parameters: { period: 50 },
        visible: true,
        color: '#ef4444'
      },
      {
        indicator: TechnicalIndicator.RSI,
        name: 'RSI (14)',
        values: [],
        parameters: { period: 14 },
        visible: false,
        color: '#8b5cf6'
      }
    ],
    showVolume: true,
    showGrid: true,
    theme: 'light'
  });

  const [stockData] = useState<StockData[]>([
    {
      date: '2024-12-30',
      open: 2820.50,
      high: 2865.75,
      low: 2815.20,
      close: 2847.65,
      volume: 2547890,
      adjustedClose: 2847.65
    },
    {
      date: '2024-12-29',
      open: 2795.30,
      high: 2825.40,
      low: 2790.15,
      close: 2802.45,
      volume: 1876543,
      adjustedClose: 2802.45
    },
    {
      date: '2024-12-28',
      open: 2810.75,
      high: 2815.90,
      low: 2785.60,
      close: 2798.20,
      volume: 2134567,
      adjustedClose: 2798.20
    },
    // Add more historical data...
  ]);

  const [availableSymbols] = useState([
    { symbol: 'RELIANCE', name: 'Reliance Industries Ltd' },
    { symbol: 'TCS', name: 'Tata Consultancy Services' },
    { symbol: 'INFY', name: 'Infosys Limited' },
    { symbol: 'HDFC', name: 'HDFC Bank Limited' },
    { symbol: 'ICICIBANK', name: 'ICICI Bank Limited' },
    { symbol: 'SBIN', name: 'State Bank of India' },
    { symbol: 'BHARTIARTL', name: 'Bharti Airtel Limited' },
    { symbol: 'ITC', name: 'ITC Limited' },
    { symbol: 'KOTAKBANK', name: 'Kotak Mahindra Bank' },
    { symbol: 'LT', name: 'Larsen & Toubro Limited' }
  ]);

  const currentStock = availableSymbols.find(s => s.symbol === selectedSymbol) || availableSymbols[0];
  const latestData = stockData[0];

  // Prepare chart data with real-time updates
  const getChartData = () => {
    let chartData = [...stockData];
    
    if (isLiveMode && isBrokerConnected && realtimeData) {
      // Update the latest candle with real-time data
      const today = new Date().toISOString().split('T')[0];
      const latestCandle = {
        date: today,
        open: realtimeData.open,
        high: realtimeData.high,
        low: realtimeData.low,
        close: realtimeData.ltp,
        volume: realtimeData.volume,
        adjustedClose: realtimeData.ltp
      };
      
      // Replace today's data or add new candle
      const todayIndex = chartData.findIndex(item => item.date === today);
      if (todayIndex >= 0) {
        chartData[todayIndex] = latestCandle;
      } else {
        chartData = [latestCandle, ...chartData];
      }
    }
    
    return chartData;
  };

  useEffect(() => {
    const checkBrokerConnection = async () => {
      try {
        const profile = await fyersService.getProfile();
        console.log('Broker connected:', profile);
        setIsBrokerConnected(true);
      } catch (error) {
        console.log('Broker not connected:', error);
        setIsBrokerConnected(false);
      }
    };
    
    checkBrokerConnection();
    
    // Check connection status every 10 seconds
    const interval = setInterval(checkBrokerConnection, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    let interval: number;
    
    console.log('Live mode:', isLiveMode, 'Broker connected:', isBrokerConnected);
    
    if (isLiveMode && isBrokerConnected) {
      const fetchData = async () => {
        console.log('Fetching real-time data for:', selectedSymbol);
        try {
          const data = await getRealtimeQuote(selectedSymbol);
          console.log('Real-time data received:', data);
          if (data) setRealtimeData(data);
        } catch (error) {
          console.error('Error fetching real-time data:', error);
        }
      };
      
      fetchData();
      interval = setInterval(fetchData, 5000);
    } else if (isLiveMode && !isBrokerConnected) {
      console.log('Live mode enabled but broker not connected');
      setRealtimeData(null);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [selectedSymbol, isLiveMode, isBrokerConnected]);

  const getChartTypeIcon = (type: ChartType) => {
    switch (type) {
      case ChartType.CANDLESTICK: return <BarChart3 size={16} />;
      case ChartType.LINE: return <LineChart size={16} />;
      case ChartType.AREA: return <Activity size={16} />;
      case ChartType.VOLUME: return <Volume2 size={16} />;
      default: return <LineChart size={16} />;
    }
  };

  const getIndicatorColor = (indicator: TechnicalIndicator) => {
    switch (indicator) {
      case TechnicalIndicator.SMA: return 'blue.500';
      case TechnicalIndicator.EMA: return 'green.500';
      case TechnicalIndicator.RSI: return 'purple.500';
      case TechnicalIndicator.MACD: return 'orange.500';
      case TechnicalIndicator.BOLLINGER_BANDS: return 'pink.500';
      default: return 'gray.500';
    }
  };



  const handleSymbolChange = (symbol: string) => {
    setSelectedSymbol(symbol);
    setChartConfig(prev => ({ ...prev, symbol }));
  };

  const handleTimeframeChange = (timeframe: ChartTimeframe) => {
    setChartConfig(prev => ({ ...prev, timeframe }));
  };

  const handleChartTypeChange = (chartType: ChartType) => {
    setChartConfig(prev => ({ ...prev, chartType }));
  };

  const toggleIndicator = (index: number) => {
    setChartConfig(prev => ({
      ...prev,
      indicators: prev.indicators.map((ind, i) => 
        i === index ? { ...ind, visible: !ind.visible } : ind
      )
    }));
  };

  const handleExportData = () => {
    console.log('Exporting data for', selectedSymbol);
    // Implementation for data export
  };

  return (
    <Box>
      {/* Header */}
      <Card.Root mb={6}>
        <Card.Body>
          <Flex justify="space-between" align="center" mb={4}>
            <Flex align="center" gap={3}>
              <Icon color="brand.600">
                <LineChart size={24} />
              </Icon>
              <Box>
                <Text textStyle="heading.md" color="neutral.900">
                  Historical Data Viewer
                </Text>
                <Text fontSize="sm" color="neutral.600">
                  Advanced charting and technical analysis
                </Text>
              </Box>
            </Flex>
            
            <Flex align="center" gap={3}>
              <Button 
                variant="outline"
                onClick={() => setIsFullscreen(!isFullscreen)}
              >
                <Icon><Maximize size={16} /></Icon>
                {isFullscreen ? 'Exit' : 'Fullscreen'}
              </Button>
              <Button colorPalette="brand" onClick={handleExportData}>
                <Icon><Download size={16} /></Icon>
                Export
              </Button>
            </Flex>
          </Flex>

          {/* Stock Selection and Quick Stats */}
          <Flex justify="space-between" align="center" mb={4}>
            <Flex align="center" gap={4}>
              <Box>
                <Text fontSize="sm" color="neutral.600" mb={1}>Symbol</Text>
                <Select.Root 
                  collection={createListCollection({
                    items: availableSymbols.map(stock => ({ label: `${stock.symbol} - ${stock.name}`, value: stock.symbol }))
                  })}
                  value={[selectedSymbol]} 
                  onValueChange={(e) => handleSymbolChange(e.value[0])}
                >
                  <Select.Trigger minW="200px">
                    <Select.ValueText />
                  </Select.Trigger>
                  <Select.Content>
                    {availableSymbols.map((stock) => (
                      <Select.Item key={stock.symbol} item={stock.symbol}>
                        {stock.symbol} - {stock.name}
                      </Select.Item>
                    ))}
                  </Select.Content>
                </Select.Root>
              </Box>
              
              <Box>
                <Flex align="center" gap={2} mb={1}>
                  <Text fontSize="sm" color="neutral.600">Current Price</Text>
                  {isLiveMode && <Icon color="green.500" fontSize="xs"><Wifi /></Icon>}
                </Flex>
                <Text fontSize="lg" fontWeight="bold" color="brand.600">
                  {isLiveMode && isBrokerConnected && realtimeData ? formatCurrency(realtimeData.ltp) : formatCurrency(latestData.close)}
                </Text>
              </Box>
              
              <Box>
                <Text fontSize="sm" color="neutral.600" mb={1}>Day Change</Text>
                <Flex align="center" gap={1}>
                  <Icon color={(realtimeData?.change || 0) >= 0 ? "success.600" : "danger.600"} fontSize="md">
                    <TrendingUp />
                  </Icon>
                  <Text fontSize="lg" fontWeight="bold" color={(realtimeData?.change || 0) >= 0 ? "success.600" : "danger.600"}>
                    {isLiveMode && isBrokerConnected && realtimeData ? formatPercentage(realtimeData.changePercent) : '+1.61%'}
                  </Text>
                </Flex>
              </Box>
              
              <Box>
                <Text fontSize="sm" color="neutral.600" mb={1}>Volume</Text>
                <Text fontSize="lg" fontWeight="bold" color="neutral.900">
                  {isLiveMode && isBrokerConnected && realtimeData ? formatNumber(realtimeData.volume) : formatNumber(latestData.volume)}
                </Text>
              </Box>
            </Flex>
          </Flex>

          {/* Chart Controls */}
          <Flex justify="space-between" align="center">
            <Flex align="center" gap={4}>
              <Box>
                <Text fontSize="sm" color="neutral.600" mb={1}>Timeframe</Text>
                <Select.Root 
                  collection={createListCollection({
                    items: [
                      { label: '1 Minute', value: ChartTimeframe.ONE_MIN },
                      { label: '5 Minutes', value: ChartTimeframe.FIVE_MIN },
                      { label: '15 Minutes', value: ChartTimeframe.FIFTEEN_MIN },
                      { label: '1 Hour', value: ChartTimeframe.ONE_HOUR },
                      { label: '1 Day', value: ChartTimeframe.ONE_DAY },
                      { label: '1 Week', value: ChartTimeframe.ONE_WEEK },
                      { label: '1 Month', value: ChartTimeframe.ONE_MONTH }
                    ]
                  })}
                  value={[chartConfig.timeframe]} 
                  onValueChange={(e) => handleTimeframeChange(e.value[0] as ChartTimeframe)}
                >
                  <Select.Trigger>
                    <Select.ValueText />
                  </Select.Trigger>
                  <Select.Content>
                    <Select.Item item={ChartTimeframe.ONE_MIN}>1 Minute</Select.Item>
                    <Select.Item item={ChartTimeframe.FIVE_MIN}>5 Minutes</Select.Item>
                    <Select.Item item={ChartTimeframe.FIFTEEN_MIN}>15 Minutes</Select.Item>
                    <Select.Item item={ChartTimeframe.ONE_HOUR}>1 Hour</Select.Item>
                    <Select.Item item={ChartTimeframe.ONE_DAY}>1 Day</Select.Item>
                    <Select.Item item={ChartTimeframe.ONE_WEEK}>1 Week</Select.Item>
                    <Select.Item item={ChartTimeframe.ONE_MONTH}>1 Month</Select.Item>
                  </Select.Content>
                </Select.Root>
              </Box>
              
              <Box>
                <Text fontSize="sm" color="neutral.600" mb={1}>Chart Type</Text>
                <Select.Root 
                  collection={createListCollection({
                    items: [
                      { label: 'Candlestick', value: ChartType.CANDLESTICK },
                      { label: 'Line', value: ChartType.LINE },
                      { label: 'Area', value: ChartType.AREA },
                      { label: 'Volume', value: ChartType.VOLUME }
                    ]
                  })}
                  value={[chartConfig.chartType]} 
                  onValueChange={(e) => handleChartTypeChange(e.value[0] as ChartType)}
                >
                  <Select.Trigger>
                    <Flex align="center" gap={2}>
                      <Icon>{getChartTypeIcon(chartConfig.chartType)}</Icon>
                      <Select.ValueText />
                    </Flex>
                  </Select.Trigger>
                  <Select.Content>
                    <Select.Item item={ChartType.CANDLESTICK}>Candlestick</Select.Item>
                    <Select.Item item={ChartType.LINE}>Line</Select.Item>
                    <Select.Item item={ChartType.AREA}>Area</Select.Item>
                    <Select.Item item={ChartType.VOLUME}>Volume</Select.Item>
                  </Select.Content>
                </Select.Root>
              </Box>
            </Flex>
            
            <Flex align="center" gap={4}>
              <Button 
                colorPalette={isLiveMode ? "green" : "gray"}
                variant={isLiveMode ? "solid" : "outline"}
                size="sm"
                onClick={() => setIsLiveMode(!isLiveMode)}
              >
                <Icon color={isLiveMode && isBrokerConnected ? "white" : "gray.600"}>
                  <Wifi size={16} />
                </Icon>
                {isLiveMode ? 'Live Data ON' : 'Live Data OFF'}
              </Button>
              
              <Flex align="center" gap={2}>
                <Switch.Root 
                  checked={chartConfig.showVolume}
                  onCheckedChange={(details) => setChartConfig(prev => ({ ...prev, showVolume: details.checked }))}
                >
                  <Switch.Control>
                    <Switch.Thumb />
                  </Switch.Control>
                </Switch.Root>
                <Text fontSize="sm" color="neutral.700">Volume</Text>
              </Flex>
              
              <Flex align="center" gap={2}>
                <Switch.Root 
                  checked={chartConfig.showGrid}
                  onCheckedChange={(details) => setChartConfig(prev => ({ ...prev, showGrid: details.checked }))}
                >
                  <Switch.Control>
                    <Switch.Thumb />
                  </Switch.Control>
                </Switch.Root>
                <Text fontSize="sm" color="neutral.700">Grid</Text>
              </Flex>
            </Flex>
          </Flex>
        </Card.Body>
      </Card.Root>

      <Tabs.Root value={activeTab} onValueChange={(e) => setActiveTab(e.value)}>
        <Tabs.List mb={6}>
          <Tabs.Trigger value="chart">Chart</Tabs.Trigger>
          <Tabs.Trigger value="indicators">Technical Indicators</Tabs.Trigger>
          <Tabs.Trigger value="patterns">Pattern Recognition</Tabs.Trigger>
          <Tabs.Trigger value="data">Raw Data</Tabs.Trigger>
          <Tabs.Trigger value="analysis">Analysis</Tabs.Trigger>
        </Tabs.List>

        {/* Chart Tab */}
        <Tabs.Content value="chart">
          <SimpleGrid columns={{ base: 1, xl: 4 }} gap={6}>
            {/* Main Chart Area */}
            <Box gridColumn={{ xl: 'span 3' }}>
              <Card.Root h={isFullscreen ? '80vh' : '600px'}>
                <Card.Body>
                  <Flex justify="between" align="center" mb={4}>
                    <Text fontWeight="semibold" color="neutral.900">
                      {currentStock.name} ({currentStock.symbol})
                    </Text>
                    <Badge colorPalette="brand">
                      {chartConfig.timeframe.toUpperCase()}
                    </Badge>
                  </Flex>
                  
                  {/* ApexCharts */}
                  <Box h="500px" w="100%">
                    <Chart
                      options={{
                        chart: {
                          type: 'candlestick',
                          height: 500,
                          toolbar: { show: true },
                          animations: { enabled: false }
                        },
                        title: {
                          text: `${currentStock.symbol} - ${chartConfig.chartType}`,
                          align: 'left'
                        },
                        xaxis: {
                          type: 'datetime',
                          labels: {
                            formatter: function(val: string) {
                              return new Date(Number(val)).toLocaleDateString();
                            }
                          }
                        },
                        yaxis: {
                          tooltip: { enabled: true },
                          labels: {
                            formatter: function(val: string) {
                              return '₹' + Number(val).toFixed(2);
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
                          show: chartConfig.showGrid
                        },
                        tooltip: {
                          enabled: true
                        }
                      }}
                      series={[{
                        name: currentStock.symbol,
                        data: getChartData().map(item => ({
                          x: new Date(item.date).getTime(),
                          y: [item.open, item.high, item.low, item.close]
                        }))
                      }]}
                      type="candlestick"
                      height={500}
                      width="100%"
                    />
                  </Box>
                </Card.Body>
              </Card.Root>
            </Box>

            {/* Chart Controls Sidebar */}
            <Box>
              <Stack gap={4}>
                {/* Active Indicators */}
                <Card.Root>
                  <Card.Body>
                    <Text fontWeight="semibold" color="neutral.900" mb={3}>
                      Active Indicators
                    </Text>
                    
                    <Stack gap={3}>
                      {chartConfig.indicators.map((indicator, index) => (
                        <Flex key={index} justify="space-between" align="center">
                          <Flex align="center" gap={2}>
                            <Box 
                              w="12px" 
                              h="12px" 
                              borderRadius="full" 
                              bg={indicator.color}
                            />
                            <Text fontSize="sm" color="neutral.800">
                              {indicator.name}
                            </Text>
                          </Flex>
                          <Switch.Root 
                            checked={indicator.visible}
                            onCheckedChange={() => toggleIndicator(index)}
                            size="sm"
                          >
                            <Switch.Control>
                              <Switch.Thumb />
                            </Switch.Control>
                          </Switch.Root>
                        </Flex>
                      ))}
                    </Stack>
                    
                    <Button size="sm" variant="outline" mt={3} w="full">
                      <Icon><Target size={14} /></Icon>
                      Add Indicator
                    </Button>
                  </Card.Body>
                </Card.Root>

                {/* Chart Settings */}
                <Card.Root>
                  <Card.Body>
                    <Text fontWeight="semibold" color="neutral.900" mb={3}>
                      Chart Settings
                    </Text>
                    
                    <Stack gap={3}>
                      <Box>
                        <Text fontSize="sm" color="neutral.700" mb={2}>Date Range</Text>
                        <Stack gap={2}>
                          <Input 
                            type="date" 
                            size="sm"
                            value={chartConfig.startDate}
                            onChange={(e) => setChartConfig(prev => ({ ...prev, startDate: e.target.value }))}
                          />
                          <Input 
                            type="date" 
                            size="sm"
                            value={chartConfig.endDate}
                            onChange={(e) => setChartConfig(prev => ({ ...prev, endDate: e.target.value }))}
                          />
                        </Stack>
                      </Box>
                      
                      <Box>
                        <Text fontSize="sm" color="neutral.700" mb={2}>Theme</Text>
                        <Select.Root 
                          collection={createListCollection({
                            items: [
                              { label: 'Light', value: 'light' },
                              { label: 'Dark', value: 'dark' }
                            ]
                          })}
                          value={[chartConfig.theme]} 
                          onValueChange={(e) => setChartConfig(prev => ({ ...prev, theme: e.value[0] as 'light' | 'dark' }))}
                        >
                          <Select.Trigger>
                            <Select.ValueText />
                          </Select.Trigger>
                          <Select.Content>
                            <Select.Item item="light">Light</Select.Item>
                            <Select.Item item="dark">Dark</Select.Item>
                          </Select.Content>
                        </Select.Root>
                      </Box>
                    </Stack>
                  </Card.Body>
                </Card.Root>

                {/* Quick Stats */}
                <Card.Root>
                  <Card.Body>
                    <Text fontWeight="semibold" color="neutral.900" mb={3}>
                      Quick Stats
                    </Text>
                    
                    <Stack gap={3}>
                      <Flex justify="space-between">
                        <Text fontSize="sm" color="neutral.600">Open</Text>
                        <Text fontSize="sm" fontWeight="medium">
                          {formatCurrency(latestData.open)}
                        </Text>
                      </Flex>
                      <Flex justify="space-between">
                        <Text fontSize="sm" color="neutral.600">High</Text>
                        <Text fontSize="sm" fontWeight="medium" color="success.600">
                          {formatCurrency(latestData.high)}
                        </Text>
                      </Flex>
                      <Flex justify="space-between">
                        <Text fontSize="sm" color="neutral.600">Low</Text>
                        <Text fontSize="sm" fontWeight="medium" color="danger.600">
                          {formatCurrency(latestData.low)}
                        </Text>
                      </Flex>
                      <Flex justify="space-between">
                        <Text fontSize="sm" color="neutral.600">Close</Text>
                        <Text fontSize="sm" fontWeight="medium">
                          {formatCurrency(latestData.close)}
                        </Text>
                      </Flex>
                      <Flex justify="space-between">
                        <Text fontSize="sm" color="neutral.600">Volume</Text>
                        <Text fontSize="sm" fontWeight="medium">
                          {formatNumber(latestData.volume)}
                        </Text>
                      </Flex>
                    </Stack>
                  </Card.Body>
                </Card.Root>
              </Stack>
            </Box>
          </SimpleGrid>
        </Tabs.Content>

        {/* Technical Indicators Tab */}
        <Tabs.Content value="indicators">
          <SimpleGrid columns={{ base: 1, lg: 2 }} gap={6}>
            <Card.Root>
              <Card.Body>
                <Text fontWeight="semibold" color="neutral.900" mb={4}>
                  Available Indicators
                </Text>
                
                <Stack gap={3}>
                  {Object.values(TechnicalIndicator).map((indicator) => (
                    <Flex key={indicator} justify="space-between" align="center" p={3} bg="neutral.50" borderRadius="md">
                      <Flex align="center" gap={2}>
                        <Box 
                          w="12px" 
                          h="12px" 
                          borderRadius="full" 
                          bg={getIndicatorColor(indicator)}
                        />
                        <Box>
                          <Text fontSize="sm" fontWeight="medium" color="neutral.900">
                            {indicator.replace('_', ' ')}
                          </Text>
                          <Text fontSize="xs" color="neutral.600">
                            {indicator === TechnicalIndicator.SMA && 'Simple Moving Average'}
                            {indicator === TechnicalIndicator.EMA && 'Exponential Moving Average'}
                            {indicator === TechnicalIndicator.RSI && 'Relative Strength Index'}
                            {indicator === TechnicalIndicator.MACD && 'Moving Average Convergence Divergence'}
                            {indicator === TechnicalIndicator.BOLLINGER_BANDS && 'Bollinger Bands'}
                            {indicator === TechnicalIndicator.STOCHASTIC && 'Stochastic Oscillator'}
                            {indicator === TechnicalIndicator.ATR && 'Average True Range'}
                            {indicator === TechnicalIndicator.VOLUME_PROFILE && 'Volume Profile'}
                          </Text>
                        </Box>
                      </Flex>
                      <Button size="sm" variant="outline">
                        <Icon><Target size={14} /></Icon>
                        Add
                      </Button>
                    </Flex>
                  ))}
                </Stack>
              </Card.Body>
            </Card.Root>

            <Card.Root>
              <Card.Body>
                <Text fontWeight="semibold" color="neutral.900" mb={4}>
                  Indicator Values
                </Text>
                
                <Alert.Root status="info" mb={4}>
                  <Alert.Indicator />
                  <Box>
                    <Alert.Title>Real-time Calculations</Alert.Title>
                    <Text fontSize="sm">
                      Technical indicators are calculated in real-time based on the selected timeframe and parameters.
                    </Text>
                  </Box>
                </Alert.Root>

                <Stack gap={4}>
                  <Box p={4} bg="blue.50" borderRadius="md">
                    <Text fontSize="sm" fontWeight="medium" color="blue.800" mb={2}>
                      SMA (20): {formatCurrency(2835.40)}
                    </Text>
                    <Text fontSize="xs" color="blue.600">
                      Current price is 0.43% above 20-day moving average
                    </Text>
                  </Box>

                  <Box p={4} bg="purple.50" borderRadius="md">
                    <Text fontSize="sm" fontWeight="medium" color="purple.800" mb={2}>
                      RSI (14): 58.7
                    </Text>
                    <Text fontSize="xs" color="purple.600">
                      Neutral territory - neither overbought nor oversold
                    </Text>
                  </Box>

                  <Box p={4} bg="orange.50" borderRadius="md">
                    <Text fontSize="sm" fontWeight="medium" color="orange.800" mb={2}>
                      MACD: 12.45 (Signal: 8.92)
                    </Text>
                    <Text fontSize="xs" color="orange.600">
                      Bullish crossover - MACD line above signal line
                    </Text>
                  </Box>
                </Stack>
              </Card.Body>
            </Card.Root>
          </SimpleGrid>
        </Tabs.Content>

        {/* Pattern Recognition Tab */}
        <Tabs.Content value="patterns">
          <Card.Root>
            <Card.Body>
              <Text fontWeight="semibold" color="neutral.900" mb={4}>
                Detected Patterns
              </Text>
              
              <Alert.Root status="info" mb={4}>
                <Alert.Indicator />
                <Box>
                  <Alert.Title>AI-Powered Pattern Recognition</Alert.Title>
                  <Text fontSize="sm">
                    Our AI system automatically detects technical patterns in real-time.
                  </Text>
                </Box>
              </Alert.Root>

              <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={4}>
                <Box p={4} bg="success.50" borderRadius="md" border="1px solid" borderColor="success.200">
                  <Flex align="center" gap={2} mb={2}>
                    <Icon color="success.600"><TrendingUp size={16} /></Icon>
                    <Text fontSize="sm" fontWeight="medium" color="success.800">
                      Ascending Triangle
                    </Text>
                  </Flex>
                  <Text fontSize="xs" color="success.700" mb={2}>
                    Detected on 1D timeframe
                  </Text>
                  <Text fontSize="xs" color="success.600">
                    Bullish pattern with 78% reliability
                  </Text>
                </Box>

                <Box p={4} bg="blue.50" borderRadius="md" border="1px solid" borderColor="blue.200">
                  <Flex align="center" gap={2} mb={2}>
                    <Icon color="blue.600"><Activity size={16} /></Icon>
                    <Text fontSize="sm" fontWeight="medium" color="blue.800">
                      Support Level
                    </Text>
                  </Flex>
                  <Text fontSize="xs" color="blue.700" mb={2}>
                    At ₹2,820 level
                  </Text>
                  <Text fontSize="xs" color="blue.600">
                    Strong support with 3 touches
                  </Text>
                </Box>

                <Box p={4} bg="warning.50" borderRadius="md" border="1px solid" borderColor="warning.200">
                  <Flex align="center" gap={2} mb={2}>
                    <Icon color="warning.600"><Target size={16} /></Icon>
                    <Text fontSize="sm" fontWeight="medium" color="warning.800">
                      Resistance Level
                    </Text>
                  </Flex>
                  <Text fontSize="xs" color="warning.700" mb={2}>
                    At ₹2,870 level
                  </Text>
                  <Text fontSize="xs" color="warning.600">
                    Key resistance to watch
                  </Text>
                </Box>
              </SimpleGrid>
            </Card.Body>
          </Card.Root>
        </Tabs.Content>

        {/* Raw Data Tab */}
        <Tabs.Content value="data">
          <Card.Root>
            <Card.Body>
              <Flex justify="space-between" align="center" mb={4}>
                <Text fontWeight="semibold" color="neutral.900">
                  Historical Data - {currentStock.symbol}
                </Text>
                <Flex align="center" gap={3}>
                  <Input 
                    placeholder="Search dates..." 
                    size="sm"
                    maxW="200px"
                  />
                  <Button size="sm" variant="outline">
                    <Icon><Filter size={14} /></Icon>
                    Filter
                  </Button>
                  <Button size="sm" colorPalette="brand">
                    <Icon><Download size={14} /></Icon>
                    Export CSV
                  </Button>
                </Flex>
              </Flex>
              
              <Box overflowX="auto">
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                      <th style={{ textAlign: 'left', padding: '12px 8px', fontSize: '14px', color: '#64748b' }}>Date</th>
                      <th style={{ textAlign: 'right', padding: '12px 8px', fontSize: '14px', color: '#64748b' }}>Open</th>
                      <th style={{ textAlign: 'right', padding: '12px 8px', fontSize: '14px', color: '#64748b' }}>High</th>
                      <th style={{ textAlign: 'right', padding: '12px 8px', fontSize: '14px', color: '#64748b' }}>Low</th>
                      <th style={{ textAlign: 'right', padding: '12px 8px', fontSize: '14px', color: '#64748b' }}>Close</th>
                      <th style={{ textAlign: 'right', padding: '12px 8px', fontSize: '14px', color: '#64748b' }}>Volume</th>
                      <th style={{ textAlign: 'right', padding: '12px 8px', fontSize: '14px', color: '#64748b' }}>Change %</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stockData.map((data, index) => {
                      const prevClose = index < stockData.length - 1 ? stockData[index + 1].close : data.open;
                      const change = ((data.close - prevClose) / prevClose) * 100;
                      
                      return (
                        <tr key={data.date} style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td style={{ padding: '12px 8px' }}>
                            <Text fontSize="sm" color="neutral.900">
                              {new Date(data.date).toLocaleDateString()}
                            </Text>
                          </td>
                          <td style={{ textAlign: 'right', padding: '12px 8px' }}>
                            <Text fontSize="sm" color="neutral.900">
                              {formatCurrency(data.open)}
                            </Text>
                          </td>
                          <td style={{ textAlign: 'right', padding: '12px 8px' }}>
                            <Text fontSize="sm" color="success.600">
                              {formatCurrency(data.high)}
                            </Text>
                          </td>
                          <td style={{ textAlign: 'right', padding: '12px 8px' }}>
                            <Text fontSize="sm" color="danger.600">
                              {formatCurrency(data.low)}
                            </Text>
                          </td>
                          <td style={{ textAlign: 'right', padding: '12px 8px' }}>
                            <Text fontSize="sm" fontWeight="medium" color="neutral.900">
                              {formatCurrency(data.close)}
                            </Text>
                          </td>
                          <td style={{ textAlign: 'right', padding: '12px 8px' }}>
                            <Text fontSize="sm" color="neutral.700">
                              {formatNumber(data.volume)}
                            </Text>
                          </td>
                          <td style={{ textAlign: 'right', padding: '12px 8px' }}>
                            <Text 
                              fontSize="sm" 
                              fontWeight="medium"
                              color={change >= 0 ? 'success.600' : 'danger.600'}
                            >
                              {formatPercentage(change)}
                            </Text>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </Box>
            </Card.Body>
          </Card.Root>
        </Tabs.Content>

        {/* Analysis Tab */}
        <Tabs.Content value="analysis">
          <SimpleGrid columns={{ base: 1, lg: 2 }} gap={6}>
            <Card.Root>
              <Card.Body>
                <Text fontWeight="semibold" color="neutral.900" mb={4}>
                  Price Analysis
                </Text>
                
                <Stack gap={4}>
                  <Box p={4} bg="neutral.50" borderRadius="md">
                    <Text fontSize="sm" fontWeight="medium" color="neutral.800" mb={2}>
                      52-Week Range
                    </Text>
                    <Flex justify="space-between" align="center">
                      <Text fontSize="sm" color="danger.600">
                        Low: {formatCurrency(2220.30)}
                      </Text>
                      <Text fontSize="sm" color="success.600">
                        High: {formatCurrency(3024.90)}
                      </Text>
                    </Flex>
                    <Box mt={2} bg="neutral.200" h="4px" borderRadius="full">
                      <Box 
                        bg="brand.500" 
                        h="4px" 
                        borderRadius="full" 
                        w="78%" 
                      />
                    </Box>
                    <Text fontSize="xs" color="neutral.600" mt={1}>
                      Current price is 78% of 52-week range
                    </Text>
                  </Box>

                  <Box p={4} bg="neutral.50" borderRadius="md">
                    <Text fontSize="sm" fontWeight="medium" color="neutral.800" mb={2}>
                      Volatility Analysis
                    </Text>
                    <SimpleGrid columns={2} gap={3}>
                      <Box>
                        <Text fontSize="xs" color="neutral.600">Daily Volatility</Text>
                        <Text fontSize="sm" fontWeight="bold" color="warning.600">
                          2.1%
                        </Text>
                      </Box>
                      <Box>
                        <Text fontSize="xs" color="neutral.600">30-Day Volatility</Text>
                        <Text fontSize="sm" fontWeight="bold" color="warning.600">
                          18.4%
                        </Text>
                      </Box>
                    </SimpleGrid>
                  </Box>

                  <Box p={4} bg="neutral.50" borderRadius="md">
                    <Text fontSize="sm" fontWeight="medium" color="neutral.800" mb={2}>
                      Volume Analysis
                    </Text>
                    <SimpleGrid columns={2} gap={3}>
                      <Box>
                        <Text fontSize="xs" color="neutral.600">Avg Volume (30D)</Text>
                        <Text fontSize="sm" fontWeight="bold" color="brand.600">
                          {formatNumber(2100000)}
                        </Text>
                      </Box>
                      <Box>
                        <Text fontSize="xs" color="neutral.600">Volume Ratio</Text>
                        <Text fontSize="sm" fontWeight="bold" color="success.600">
                          1.21x
                        </Text>
                      </Box>
                    </SimpleGrid>
                  </Box>
                </Stack>
              </Card.Body>
            </Card.Root>

            <Card.Root>
              <Card.Body>
                <Text fontWeight="semibold" color="neutral.900" mb={4}>
                  Technical Summary
                </Text>
                
                <Stack gap={4}>
                  <Box p={4} bg="success.50" borderRadius="md">
                    <Flex align="center" gap={2} mb={2}>
                      <Icon color="success.600"><TrendingUp size={16} /></Icon>
                      <Text fontSize="sm" fontWeight="medium" color="success.800">
                        Overall Trend: Bullish
                      </Text>
                    </Flex>
                    <Text fontSize="xs" color="success.700">
                      Price is above key moving averages with strong momentum
                    </Text>
                  </Box>

                  <Box p={4} bg="blue.50" borderRadius="md">
                    <Flex align="center" gap={2} mb={2}>
                      <Icon color="blue.600"><Target size={16} /></Icon>
                      <Text fontSize="sm" fontWeight="medium" color="blue.800">
                        Support: ₹2,820
                      </Text>
                    </Flex>
                    <Text fontSize="xs" color="blue.700">
                      Strong support level with multiple touches
                    </Text>
                  </Box>

                  <Box p={4} bg="warning.50" borderRadius="md">
                    <Flex align="center" gap={2} mb={2}>
                      <Icon color="warning.600"><Target size={16} /></Icon>
                      <Text fontSize="sm" fontWeight="medium" color="warning.800">
                        Resistance: ₹2,870
                      </Text>
                    </Flex>
                    <Text fontSize="xs" color="warning.700">
                      Key resistance level to watch for breakout
                    </Text>
                  </Box>

                  <Box p={4} bg="purple.50" borderRadius="md">
                    <Text fontSize="sm" fontWeight="medium" color="purple.800" mb={2}>
                      Key Levels
                    </Text>
                    <Stack gap={2}>
                      <Flex justify="space-between">
                        <Text fontSize="xs" color="purple.600">Next Support</Text>
                        <Text fontSize="xs" fontWeight="medium" color="purple.800">₹2,780</Text>
                      </Flex>
                      <Flex justify="space-between">
                        <Text fontSize="xs" color="purple.600">Next Resistance</Text>
                        <Text fontSize="xs" fontWeight="medium" color="purple.800">₹2,920</Text>
                      </Flex>
                    </Stack>
                  </Box>
                </Stack>
              </Card.Body>
            </Card.Root>
          </SimpleGrid>
        </Tabs.Content>
      </Tabs.Root>
    </Box>
  );
};