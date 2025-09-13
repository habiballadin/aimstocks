import React from 'react';
import { 
  Card, 
  Box, 
  Text, 
  Progress, 
  Stack, 
  Grid,
  Flex,
  Badge,
  Stat
} from '@chakra-ui/react';
import { formatLatency, formatSuccessRate, formatDataPoints, formatTime } from '../../utils/formatters';
import PollOutlinedIcon from '@mui/icons-material/PollOutlined';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import SpeedIcon from '@mui/icons-material/Speed';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

interface ConnectionMetrics {
  totalConnections: number;
  activeConnections: number;
  failedConnections: number;
  avgLatency: number;
  totalDataPoints: number;
  overallSuccessRate: number;
}

interface RealtimeAnalysis {
  dataFlowRate: number;
  peakDataRate: number;
  connectionUptime: number;
  errorRate: number;
  lastAnalysisUpdate: string;
}

interface BrokerAnalyticsProps {
  connectionMetrics: ConnectionMetrics;
  realtimeAnalysis: RealtimeAnalysis;
}

export const BrokerAnalytics: React.FC<BrokerAnalyticsProps> = ({
  connectionMetrics,
  realtimeAnalysis
}) => {
  const getUptimeColor = () => {
    if (realtimeAnalysis.connectionUptime >= 0.95) return 'green';
    if (realtimeAnalysis.connectionUptime >= 0.85) return 'yellow';
    return 'red';
  };

  const getLatencyColor = () => {
    if (connectionMetrics.avgLatency <= 100) return 'green';
    if (connectionMetrics.avgLatency <= 300) return 'yellow';
    return 'red';
  };

  const getSuccessRateColor = () => {
    if (connectionMetrics.overallSuccessRate >= 0.95) return 'green';
    if (connectionMetrics.overallSuccessRate >= 0.85) return 'yellow';
    return 'red';
  };

  return (
    <Stack gap={6}>
      {/* Header */}
      <Flex align="center" gap={2}>
        <PollOutlinedIcon style={{ fontSize: 20, color: 'var(--chakra-colors-brand-500)' }} />
        <Text textStyle="heading.lg">Broker Analytics</Text>
        <Badge colorPalette="green" variant="subtle" size="sm">
          Live
        </Badge>
      </Flex>

      {/* Overview Cards */}
      <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' }} gap={4}>
        <Card.Root variant="elevated" size="sm">
          <Card.Body>
            <Stat.Root>
              <Stat.Label fontSize="sm" color="neutral.600">
                <Flex align="center" gap={1}>
                  <CheckCircleIcon style={{ fontSize: 14 }} />
                  Active Connections
                </Flex>
              </Stat.Label>
              <Stat.ValueText fontSize="2xl" fontWeight="bold" color="success.600">
                {connectionMetrics.activeConnections}
              </Stat.ValueText>
              <Stat.HelpText fontSize="xs">
                of {connectionMetrics.totalConnections} total
              </Stat.HelpText>
            </Stat.Root>
          </Card.Body>
        </Card.Root>

        <Card.Root variant="elevated" size="sm">
          <Card.Body>
            <Stat.Root>
              <Stat.Label fontSize="sm" color="neutral.600">
                <Flex align="center" gap={1}>
                  <SpeedIcon style={{ fontSize: 14 }} />
                  Avg Latency
                </Flex>
              </Stat.Label>
              <Stat.ValueText fontSize="2xl" fontWeight="bold" color={`${getLatencyColor()}.600`}>
                {formatLatency(connectionMetrics.avgLatency)}
              </Stat.ValueText>
              <Stat.HelpText fontSize="xs">
                Response time
              </Stat.HelpText>
            </Stat.Root>
          </Card.Body>
        </Card.Root>

        <Card.Root variant="elevated" size="sm">
          <Card.Body>
            <Stat.Root>
              <Stat.Label fontSize="sm" color="neutral.600">
                <Flex align="center" gap={1}>
                  <TrendingUpIcon style={{ fontSize: 14 }} />
                  Success Rate
                </Flex>
              </Stat.Label>
              <Stat.ValueText fontSize="2xl" fontWeight="bold" color={`${getSuccessRateColor()}.600`}>
                {formatSuccessRate(connectionMetrics.overallSuccessRate)}
              </Stat.ValueText>
              <Stat.HelpText fontSize="xs">
                Overall performance
              </Stat.HelpText>
            </Stat.Root>
          </Card.Body>
        </Card.Root>

        <Card.Root variant="elevated" size="sm">
          <Card.Body>
            <Stat.Root>
              <Stat.Label fontSize="sm" color="neutral.600">
                Data Points
              </Stat.Label>
              <Stat.ValueText fontSize="2xl" fontWeight="bold" color="brand.600">
                {formatDataPoints(connectionMetrics.totalDataPoints)}
              </Stat.ValueText>
              <Stat.HelpText fontSize="xs">
                Total received
              </Stat.HelpText>
            </Stat.Root>
          </Card.Body>
        </Card.Root>
      </Grid>

      {/* Real-time Analysis */}
      <Card.Root variant="elevated">
        <Card.Header>
          <Text textStyle="heading.md">Real-time Analysis</Text>
          <Text fontSize="sm" color="neutral.500">
            Last updated: {formatTime(realtimeAnalysis.lastAnalysisUpdate)}
          </Text>
        </Card.Header>
        <Card.Body>
          <Grid templateColumns={{ base: '1fr', lg: 'repeat(2, 1fr)' }} gap={6}>
            {/* Connection Uptime */}
            <Box>
              <Flex justify="space-between" align="center" mb={2}>
                <Text fontSize="sm" fontWeight="medium">Connection Uptime</Text>
                <Text fontSize="sm" color={`${getUptimeColor()}.600`} fontWeight="bold">
                  {(realtimeAnalysis.connectionUptime * 100).toFixed(1)}%
                </Text>
              </Flex>
              <Progress.Root 
                value={realtimeAnalysis.connectionUptime * 100} 
                colorPalette={getUptimeColor()}
                size="md"
              >
                <Progress.Track>
                  <Progress.Range />
                </Progress.Track>
              </Progress.Root>
            </Box>

            {/* Error Rate */}
            <Box>
              <Flex justify="space-between" align="center" mb={2}>
                <Text fontSize="sm" fontWeight="medium">Error Rate</Text>
                <Text fontSize="sm" color="danger.600" fontWeight="bold">
                  {(realtimeAnalysis.errorRate * 100).toFixed(2)}%
                </Text>
              </Flex>
              <Progress.Root 
                value={realtimeAnalysis.errorRate * 100} 
                colorPalette="red"
                size="md"
              >
                <Progress.Track>
                  <Progress.Range />
                </Progress.Track>
              </Progress.Root>
            </Box>
          </Grid>

          {/* Data Flow Metrics */}
          <Box mt={6}>
            <Text fontSize="sm" fontWeight="medium" mb={3}>Data Flow Metrics</Text>
            <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={4}>
              <Box p={3} bg="neutral.50" borderRadius="md">
                <Text fontSize="xs" color="neutral.600" mb={1}>Current Data Rate</Text>
                <Text fontSize="lg" fontWeight="bold" color="brand.600">
                  {realtimeAnalysis.dataFlowRate.toLocaleString()} pts/min
                </Text>
              </Box>
              <Box p={3} bg="neutral.50" borderRadius="md">
                <Text fontSize="xs" color="neutral.600" mb={1}>Peak Data Rate</Text>
                <Text fontSize="lg" fontWeight="bold" color="success.600">
                  {realtimeAnalysis.peakDataRate.toLocaleString()} pts/min
                </Text>
              </Box>
            </Grid>
          </Box>
        </Card.Body>
      </Card.Root>

      {/* Connection Status Summary */}
      <Card.Root variant="elevated">
        <Card.Header>
          <Text textStyle="heading.md">Connection Summary</Text>
        </Card.Header>
        <Card.Body>
          <Stack gap={3}>
            <Flex justify="space-between" align="center">
              <Text fontSize="sm">Total Connections</Text>
              <Badge colorPalette="blue" variant="subtle">
                {connectionMetrics.totalConnections}
              </Badge>
            </Flex>
            <Flex justify="space-between" align="center">
              <Text fontSize="sm">Active Connections</Text>
              <Badge colorPalette="green" variant="subtle">
                {connectionMetrics.activeConnections}
              </Badge>
            </Flex>
            <Flex justify="space-between" align="center">
              <Text fontSize="sm">Failed Connections</Text>
              <Badge colorPalette="red" variant="subtle">
                {connectionMetrics.failedConnections}
              </Badge>
            </Flex>
          </Stack>
        </Card.Body>
      </Card.Root>
    </Stack>
  );
};