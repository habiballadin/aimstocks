import React, { useState } from 'react';
import { 
  Card, 
  Box, 
  Text, 
  Button, 
  Badge, 
  Progress, 
  Stack, 
  Flex,
  Menu,
  IconButton,
  Grid
} from '@chakra-ui/react';
import { 
  BrokerType, 
  ConnectionStatus, 
  DataFlowStatus, 
  ConnectionHealth,
  BrokerService,
  SubscriptionPlan
} from '../../types/enums';
import { 
  formatBrokerName, 
  formatConnectionStatus, 
  formatLatency, 
  formatSuccessRate, 
  formatDataPoints,
  formatTime
} from '../../utils/formatters';
import { BrokerStatusIndicator } from './BrokerStatusIndicator';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import PollOutlinedIcon from '@mui/icons-material/PollOutlined';
import MoreVertIcon from '@mui/icons-material/MoreVert';

interface BrokerConnection {
  id: string;
  type: BrokerType;
  status: ConnectionStatus;
  dataFlow: DataFlowStatus;
  health: ConnectionHealth;
  connectedAt: string;
  lastDataReceived: string;
  latency: number;
  successRate: number;
  dataPointsReceived: number;
  failedRequests: number;
  services: BrokerService[];
  plan: SubscriptionPlan;
}

interface BrokerCardProps {
  broker: BrokerConnection;
  onConnect?: (brokerId: string) => void;
  onDisconnect?: (brokerId: string) => void;
  onReconnect?: (brokerId: string) => void;
  onSettings?: (brokerId: string) => void;
  onAnalytics?: (brokerId: string) => void;
}

export const BrokerCard: React.FC<BrokerCardProps> = ({
  broker,
  onConnect,
  onDisconnect,
  onReconnect,
  onSettings,
  onAnalytics
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const getCardVariant = () => {
    switch (broker.status) {
      case ConnectionStatus.CONNECTED:
        return 'elevated';
      case ConnectionStatus.ERROR:
        return 'outline';
      default:
        return 'elevated';
    }
  };

  const getHealthProgress = () => {
    switch (broker.health) {
      case ConnectionHealth.HEALTHY:
        return { value: 100, colorPalette: 'green' };
      case ConnectionHealth.WARNING:
        return { value: 60, colorPalette: 'yellow' };
      case ConnectionHealth.CRITICAL:
        return { value: 20, colorPalette: 'red' };
      default:
        return { value: 0, colorPalette: 'gray' };
    }
  };

  const getPlanBadgeColor = () => {
    switch (broker.plan) {
      case SubscriptionPlan.ENTERPRISE:
        return 'purple';
      case SubscriptionPlan.PRO:
        return 'blue';
      case SubscriptionPlan.BASIC:
      default:
        return 'gray';
    }
  };

  const handleAction = (action: string) => {
    switch (action) {
      case 'connect':
        onConnect?.(broker.id);
        break;
      case 'disconnect':
        onDisconnect?.(broker.id);
        break;
      case 'reconnect':
        onReconnect?.(broker.id);
        break;
      case 'settings':
        onSettings?.(broker.id);
        break;
      case 'analytics':
        onAnalytics?.(broker.id);
        break;
    }
  };

  return (
    <Card.Root
      variant={getCardVariant()}
      size="sm"
      transition="all 0.2s"
      _hover={{ transform: 'translateY(-2px)', shadow: 'lg' }}
      borderColor={broker.status === ConnectionStatus.CONNECTED ? 'success.200' : undefined}
    >
      <Card.Header pb={2}>
        <Flex justify="space-between" align="flex-start">
          <Box>
            <Flex align="center" gap={3} mb={2}>
              <Text textStyle="heading.md" color="neutral.900">
                {formatBrokerName(broker.type)}
              </Text>
              <BrokerStatusIndicator
                status={broker.status}
                dataFlow={broker.dataFlow}
                health={broker.health}
                size="md"
                animated
              />
            </Flex>
            <Flex align="center" gap={2}>
              <Badge colorPalette={getPlanBadgeColor()} variant="subtle" size="sm">
                {broker.plan}
              </Badge>
              <Text fontSize="xs" color="neutral.500">
                Status: {formatConnectionStatus(broker.status)}
              </Text>
            </Flex>
          </Box>
          
          <Menu.Root>
            <Menu.Trigger asChild>
              <IconButton variant="ghost" size="sm">
                <MoreVertIcon style={{ fontSize: 16 }} />
              </IconButton>
            </Menu.Trigger>
            <Menu.Content>
              {broker.status === ConnectionStatus.DISCONNECTED && (
                <Menu.Item value="connect" onClick={() => handleAction('connect')}>
                  Connect
                </Menu.Item>
              )}
              {broker.status === ConnectionStatus.CONNECTED && (
                <Menu.Item value="disconnect" onClick={() => handleAction('disconnect')}>
                  Disconnect
                </Menu.Item>
              )}
              {(broker.status === ConnectionStatus.ERROR || 
                broker.status === ConnectionStatus.DISCONNECTED) && (
                <Menu.Item value="reconnect" onClick={() => handleAction('reconnect')}>
                  Reconnect
                </Menu.Item>
              )}
              <Menu.Separator />
              <Menu.Item value="settings" onClick={() => handleAction('settings')}>
                <SettingsOutlinedIcon style={{ fontSize: 14, marginRight: 8 }} />
                Settings
              </Menu.Item>
              <Menu.Item value="analytics" onClick={() => handleAction('analytics')}>
                <PollOutlinedIcon style={{ fontSize: 14, marginRight: 8 }} />
                Analytics
              </Menu.Item>
            </Menu.Content>
          </Menu.Root>
        </Flex>
      </Card.Header>

      <Card.Body py={3}>
        {/* Connection Health */}
        <Box mb={4}>
          <Flex justify="space-between" align="center" mb={1}>
            <Text fontSize="sm" color="neutral.600">Connection Health</Text>
            <Text fontSize="sm" fontWeight="medium" color="neutral.800">
              {broker.health}
            </Text>
          </Flex>
          <Progress.Root {...getHealthProgress()} size="sm">
            <Progress.Track>
              <Progress.Range />
            </Progress.Track>
          </Progress.Root>
        </Box>

        {/* Key Metrics */}
        <Grid templateColumns="repeat(2, 1fr)" gap={3} mb={4}>
          <Box>
            <Text fontSize="xs" color="neutral.500">Latency</Text>
            <Text fontSize="sm" fontWeight="medium" color="neutral.800">
              {formatLatency(broker.latency)}
            </Text>
          </Box>
          <Box>
            <Text fontSize="xs" color="neutral.500">Success Rate</Text>
            <Text fontSize="sm" fontWeight="medium" color="neutral.800">
              {formatSuccessRate(broker.successRate)}
            </Text>
          </Box>
          <Box>
            <Text fontSize="xs" color="neutral.500">Data Points</Text>
            <Text fontSize="sm" fontWeight="medium" color="neutral.800">
              {formatDataPoints(broker.dataPointsReceived)}
            </Text>
          </Box>
          <Box>
            <Text fontSize="xs" color="neutral.500">Last Data</Text>
            <Text fontSize="sm" fontWeight="medium" color="neutral.800">
              {formatTime(broker.lastDataReceived)}
            </Text>
          </Box>
        </Grid>

        {/* Expandable Services Section */}
        <Box>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            width="full"
            justifyContent="space-between"
          >
            <Text fontSize="sm">Services ({broker.services.length})</Text>
            <Text fontSize="xs">{isExpanded ? '−' : '+'}</Text>
          </Button>
          
          {isExpanded && (
            <Box mt={2} p={3} bg="neutral.50" borderRadius="md">
              <Stack gap={1}>
                {broker.services.map((service) => (
                  <Flex key={service} align="center" gap={2}>
                    <Box w={2} h={2} bg="success.500" borderRadius="full" />
                    <Text fontSize="xs" color="neutral.600">
                      {service.replace('_', ' ')}
                    </Text>
                  </Flex>
                ))}
              </Stack>
            </Box>
          )}
        </Box>
      </Card.Body>

      <Card.Footer pt={2}>
        <Flex gap={2} width="full">
          {broker.status === ConnectionStatus.DISCONNECTED && (
            <Button
              colorPalette="brand"
              size="sm"
              flex={1}
              onClick={() => handleAction('connect')}
            >
              Connect
            </Button>
          )}
          {broker.status === ConnectionStatus.CONNECTED && (
            <Button
              colorPalette="red"
              variant="outline"
              size="sm"
              flex={1}
              onClick={() => handleAction('disconnect')}
            >
              Disconnect
            </Button>
          )}
          {(broker.status === ConnectionStatus.ERROR || 
            broker.status === ConnectionStatus.RECONNECTING) && (
            <Button
              colorPalette="yellow"
              size="sm"
              flex={1}
              onClick={() => handleAction('reconnect')}
            >
              Reconnect
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleAction('settings')}
          >
            <SettingsOutlinedIcon style={{ fontSize: 14 }} />
          </Button>
        </Flex>
      </Card.Footer>
    </Card.Root>
  );
};