import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  Text,
  Flex,
  Button,
  Badge,
  SimpleGrid,
  Stack,
  Progress
} from '@chakra-ui/react';
import { useToast } from '@chakra-ui/toast';
import { Database, Wifi, RefreshCw, CheckCircle, XCircle, Clock, TrendingUp, Play, Square } from 'lucide-react';
import { fyersService } from '../../services/fyersService';

export const DataIngestionMonitor: React.FC = () => {
  const toast = useToast();
  const [stats, setStats] = useState({
    totalSymbols: 5,
    successfulUpdates: 5,
    failedUpdates: 0,
    lastUpdateTime: new Date().toISOString(),
    updateInterval: 30,
    isRunning: true
  });

  const [dataSources, setDataSources] = useState([
    { name: 'yFinance', status: 'connected', lastUpdate: '2 min ago', symbolsCount: 5, latency: 1200 },
    { name: 'Fyers API', status: 'disconnected', lastUpdate: '10 min ago', symbolsCount: 0, latency: 0 },
    { name: 'Fallback Data', status: 'connected', lastUpdate: '1 min ago', symbolsCount: 5, latency: 50 }
  ]);

  const [marketData, setMarketData] = useState([
    { symbol: 'RELIANCE', ltp: 2900.51, change: 25.01, changePercent: 0.87, volume: 1250000, lastUpdated: '1 min ago', source: 'Fallback' },
    { symbol: 'TCS', ltp: 3904.87, change: 24.62, changePercent: 0.63, volume: 890000, lastUpdated: '1 min ago', source: 'Fallback' },
    { symbol: 'INFY', ltp: 1675.95, change: 0.15, changePercent: 0.01, volume: 1100000, lastUpdated: '1 min ago', source: 'Fallback' },
    { symbol: 'HDFCBANK', ltp: 1585.97, change: -9.33, changePercent: -0.58, volume: 980000, lastUpdated: '1 min ago', source: 'Fallback' },
    { symbol: 'ICICIBANK', ltp: 1228.25, change: -17.35, changePercent: -1.39, volume: 1350000, lastUpdated: '1 min ago', source: 'Fallback' }
  ]);

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isRealtimeRunning, setIsRealtimeRunning] = useState(false);

  // Load initial data
  useEffect(() => {
    loadIngestionData();
  }, []);

  const loadIngestionData = async () => {
    try {
      // Load ingestion status
      const statusData = await fyersService.getIngestionStatus();
      setStats(statusData);

      // Load data sources status
      const sourcesData = await fyersService.getDataSourcesStatus();
      setDataSources(sourcesData);

      // Load latest market data
      const marketDataResponse = await fyersService.getLatestMarketData();
      if (marketDataResponse && marketDataResponse.length > 0) {
        const formattedData = marketDataResponse.slice(0, 5).map(item => ({
          symbol: item.symbol.replace('NSE:', '').replace('-EQ', ''),
          ltp: item.latest_price,
          change: item.price_change || 0,
          changePercent: item.price_change_pct || 0,
          volume: item.volume || 0,
          lastUpdated: 'Just now',
          source: 'Fyers API'
        }));
        setMarketData(formattedData);
      }
    } catch (error) {
      console.error('Failed to load ingestion data:', error);
      toast({
        title: 'Failed to load data',
        description: 'Could not fetch real-time ingestion data',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    try {
      await loadIngestionData();
      toast({
        title: 'Data refreshed',
        description: 'Latest market data has been loaded',
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
    } catch {
      toast({
        title: 'Refresh failed',
        description: 'Could not refresh market data',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleHistoricalIngestion = async () => {
    try {
      const result = await fyersService.triggerHistoricalIngestion('1D', 30);
      toast({
        title: 'Historical ingestion started',
        description: `Processing ${result.records_processed || 0} records`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      // Refresh data after a short delay
      setTimeout(() => loadIngestionData(), 2000);
    } catch {
      toast({
        title: 'Historical ingestion failed',
        description: 'Could not start historical data ingestion',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleStartRealtime = async () => {
    try {
      await fyersService.startRealtimeIngestion();
      setIsRealtimeRunning(true);
      toast({
        title: 'Real-time ingestion started',
        description: 'Real-time data ingestion is now running',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch {
      toast({
        title: 'Failed to start real-time ingestion',
        description: 'Could not start real-time data ingestion',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleStopRealtime = async () => {
    try {
      await fyersService.stopRealtimeIngestion();
      setIsRealtimeRunning(false);
      toast({
        title: 'Real-time ingestion stopped',
        description: 'Real-time data ingestion has been stopped',
        status: 'info',
        duration: 3000,
        isClosable: true,
      });
    } catch {
      toast({
        title: 'Failed to stop real-time ingestion',
        description: 'Could not stop real-time data ingestion',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'green';
      case 'disconnected': return 'gray';
      case 'error': return 'red';
      default: return 'gray';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected': return CheckCircle;
      case 'disconnected': return XCircle;
      case 'error': return XCircle;
      default: return Clock;
    }
  };

  return (
    <Box>
      <Flex justify="space-between" align="center" mb={6}>
        <Box>
          <Text textStyle="heading.lg">Market Data Ingestion</Text>
          <Text fontSize="sm" color="neutral.600">
            Real-time monitoring of data sources and ingestion process
          </Text>
        </Box>
        <Flex gap={3}>
          <Button
            onClick={handleHistoricalIngestion}
            colorScheme="green"
            size="sm"
          >
            <Database size={16} />
            Historical
          </Button>
          {isRealtimeRunning ? (
            <Button
              onClick={handleStopRealtime}
              colorScheme="red"
              size="sm"
            >
              <Square size={16} />
              Stop Realtime
            </Button>
          ) : (
            <Button
              onClick={handleStartRealtime}
              colorScheme="purple"
              size="sm"
            >
              <Play size={16} />
              Start Realtime
            </Button>
          )}
          <Button
            onClick={handleManualRefresh}
            loading={isRefreshing}
            colorScheme="blue"
            size="sm"
          >
            <RefreshCw size={16} />
            Refresh
          </Button>
        </Flex>
      </Flex>

      <SimpleGrid columns={{ base: 2, md: 4 }} gap={4} mb={6}>
        <Card.Root>
          <Card.Body>
            <Flex align="center" gap={3}>
              <Database size={24} color="#3182ce" />
              <Box>
                <Text fontSize="2xl" fontWeight="bold">{stats.totalSymbols}</Text>
                <Text fontSize="sm" color="neutral.600">Total Symbols</Text>
              </Box>
            </Flex>
          </Card.Body>
        </Card.Root>

        <Card.Root>
          <Card.Body>
            <Flex align="center" gap={3}>
              <CheckCircle size={24} color="#38a169" />
              <Box>
                <Text fontSize="2xl" fontWeight="bold">{stats.successfulUpdates}</Text>
                <Text fontSize="sm" color="neutral.600">Successful Updates</Text>
              </Box>
            </Flex>
          </Card.Body>
        </Card.Root>

        <Card.Root>
          <Card.Body>
            <Flex align="center" gap={3}>
              <XCircle size={24} color="#e53e3e" />
              <Box>
                <Text fontSize="2xl" fontWeight="bold">{stats.failedUpdates}</Text>
                <Text fontSize="sm" color="neutral.600">Failed Updates</Text>
              </Box>
            </Flex>
          </Card.Body>
        </Card.Root>

        <Card.Root>
          <Card.Body>
            <Flex align="center" gap={3}>
              <Clock size={24} color="#805ad5" />
              <Box>
                <Text fontSize="2xl" fontWeight="bold">{stats.updateInterval}s</Text>
                <Text fontSize="sm" color="neutral.600">Update Interval</Text>
              </Box>
            </Flex>
          </Card.Body>
        </Card.Root>
      </SimpleGrid>

      <SimpleGrid columns={{ base: 1, lg: 2 }} gap={6}>
        <Card.Root>
          <Card.Body>
            <Text fontWeight="semibold" mb={4}>Data Sources</Text>
            <Stack gap={4}>
              {dataSources.map((source) => {
                const StatusIcon = getStatusIcon(source.status);
                return (
                  <Flex key={source.name} justify="space-between" align="center" p={3} bg="neutral.50" borderRadius="md">
                    <Flex align="center" gap={3}>
                      <StatusIcon size={20} color={getStatusColor(source.status) === 'green' ? '#38a169' : '#e53e3e'} />
                      <Box>
                        <Text fontWeight="medium">{source.name}</Text>
                        <Text fontSize="sm" color="neutral.600">{source.lastUpdate}</Text>
                      </Box>
                    </Flex>
                    <Box textAlign="right">
                      <Badge colorScheme={getStatusColor(source.status)} size="sm" mb={1}>
                        {source.status}
                      </Badge>
                      <Text fontSize="xs" color="neutral.600">
                        {source.symbolsCount} symbols
                      </Text>
                    </Box>
                  </Flex>
                );
              })}
            </Stack>
          </Card.Body>
        </Card.Root>

        <Card.Root>
          <Card.Body>
            <Text fontWeight="semibold" mb={4}>System Health</Text>
            <Stack gap={4}>
              <Box>
                <Flex justify="space-between" mb={2}>
                  <Text fontSize="sm">Success Rate</Text>
                  <Text fontSize="sm" fontWeight="medium">
                    {((stats.successfulUpdates / (stats.successfulUpdates + stats.failedUpdates)) * 100).toFixed(1)}%
                  </Text>
                </Flex>
                <Progress.Root value={(stats.successfulUpdates / (stats.successfulUpdates + stats.failedUpdates)) * 100} colorPalette="green">
                  <Progress.Track>
                    <Progress.Range />
                  </Progress.Track>
                </Progress.Root>
              </Box>

              <Box>
                <Flex justify="space-between" mb={2}>
                  <Text fontSize="sm">Database Connection</Text>
                  <Badge colorScheme="green" size="sm">Healthy</Badge>
                </Flex>
              </Box>

              <Box>
                <Flex justify="space-between" mb={2}>
                  <Text fontSize="sm">Last Update</Text>
                  <Text fontSize="sm" color="neutral.600">
                    {new Date(stats.lastUpdateTime).toLocaleTimeString()}
                  </Text>
                </Flex>
              </Box>

              <Box>
                <Flex justify="space-between" mb={2}>
                  <Text fontSize="sm">Ingestion Status</Text>
                  <Badge colorScheme={stats.isRunning ? 'green' : 'red'} size="sm">
                    {stats.isRunning ? 'Running' : 'Stopped'}
                  </Badge>
                </Flex>
              </Box>
            </Stack>
          </Card.Body>
        </Card.Root>
      </SimpleGrid>

      <Card.Root mt={6}>
        <Card.Body>
          <Flex justify="space-between" align="center" mb={4}>
            <Text fontWeight="semibold">Live Market Data</Text>
            <Flex align="center" gap={2}>
              <Wifi size={16} color="#38a169" />
              <Text fontSize="sm" color="green.600">Live</Text>
            </Flex>
          </Flex>

          <Box overflowX="auto">
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <th style={{ padding: '12px 8px', textAlign: 'left', fontSize: '12px', fontWeight: 'bold' }}>Symbol</th>
                  <th style={{ padding: '12px 8px', textAlign: 'left', fontSize: '12px', fontWeight: 'bold' }}>LTP</th>
                  <th style={{ padding: '12px 8px', textAlign: 'left', fontSize: '12px', fontWeight: 'bold' }}>Change</th>
                  <th style={{ padding: '12px 8px', textAlign: 'left', fontSize: '12px', fontWeight: 'bold' }}>Volume</th>
                  <th style={{ padding: '12px 8px', textAlign: 'left', fontSize: '12px', fontWeight: 'bold' }}>Source</th>
                  <th style={{ padding: '12px 8px', textAlign: 'left', fontSize: '12px', fontWeight: 'bold' }}>Updated</th>
                </tr>
              </thead>
              <tbody>
                {marketData.map((item) => (
                  <tr key={item.symbol} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '12px 8px' }}>
                      <Text fontWeight="medium">{item.symbol}</Text>
                    </td>
                    <td style={{ padding: '12px 8px' }}>
                      <Text fontWeight="medium">₹{item.ltp.toFixed(2)}</Text>
                    </td>
                    <td style={{ padding: '12px 8px' }}>
                      <Flex align="center" gap={1}>
                        <TrendingUp
                          size={12}
                          color={item.changePercent >= 0 ? '#38a169' : '#e53e3e'}
                          style={{ transform: item.changePercent < 0 ? 'rotate(180deg)' : 'none' }}
                        />
                        <Text color={item.changePercent >= 0 ? 'green.600' : 'red.600'}>
                          {item.changePercent >= 0 ? '+' : ''}{item.changePercent.toFixed(2)}%
                        </Text>
                      </Flex>
                    </td>
                    <td style={{ padding: '12px 8px' }}>
                      <Text fontSize="sm">{(item.volume / 100000).toFixed(1)}L</Text>
                    </td>
                    <td style={{ padding: '12px 8px' }}>
                      <Badge size="sm" colorScheme="blue">{item.source}</Badge>
                    </td>
                    <td style={{ padding: '12px 8px' }}>
                      <Text fontSize="sm" color="neutral.600">{item.lastUpdated}</Text>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Box>
        </Card.Body>
      </Card.Root>
    </Box>
  );
};
