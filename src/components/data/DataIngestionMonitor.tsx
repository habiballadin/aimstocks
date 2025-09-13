import React, { useState } from 'react';
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
import { Database, Wifi, RefreshCw, CheckCircle, XCircle, Clock, TrendingUp } from 'lucide-react';

export const DataIngestionMonitor: React.FC = () => {
  const [stats, setStats] = useState({
    totalSymbols: 5,
    successfulUpdates: 5,
    failedUpdates: 0,
    lastUpdateTime: new Date().toISOString(),
    updateInterval: 30,
    isRunning: true
  });

  const [dataSources] = useState([
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

  const handleManualRefresh = async () => {
    setIsRefreshing(true);

    setTimeout(() => {
      setStats(prev => ({
        ...prev,
        lastUpdateTime: new Date().toISOString(),
        successfulUpdates: prev.successfulUpdates + 1
      }));

      setMarketData(prev => prev.map(item => ({
        ...item,
        ltp: item.ltp + (Math.random() - 0.5) * 10,
        change: item.change + (Math.random() - 0.5) * 2,
        changePercent: item.changePercent + (Math.random() - 0.5) * 0.5,
        lastUpdated: 'Just now'
      })));

      setIsRefreshing(false);
    }, 2000);
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
        <Button
          onClick={handleManualRefresh}
          loading={isRefreshing}
          colorScheme="blue"
        >
          <RefreshCw size={16} />
          Refresh Now
        </Button>
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
