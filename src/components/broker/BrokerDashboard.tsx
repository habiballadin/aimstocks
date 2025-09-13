import React, { useState } from 'react';
import { 
  Box, 
  Text, 
  Button, 
  Grid, 
  Flex,
  Input,
  Select,
  Badge,
  Tabs,
  createListCollection
} from '@chakra-ui/react';
import { 
  BrokerType, 
  ConnectionStatus, 
  DataFlowStatus, 
  ConnectionHealth,
  BrokerService,
  SubscriptionPlan
} from '../../types/enums';
import { BrokerCard } from './BrokerCard';
import { AddBrokerModal } from './AddBrokerModal';
import { BrokerAnalytics } from './BrokerAnalytics';
import { EmptyState } from '../common/EmptyState';
import { useRealTimeData } from '../../hooks/useRealTimeData';
import AddCircleOutlinedIcon from '@mui/icons-material/AddCircleOutlined';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';

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

interface BrokerCredentials {
  clientId: string;
  apiSecret: string;
  appId?: string;
  accessToken?: string;
}

interface AvailableBroker {
  type: BrokerType;
  name: string;
  supported: boolean;
}

interface BrokerSettings {
  autoReconnect: boolean;
  enableNotifications: boolean;
  dataRefreshRate: number;
  timeoutSettings: number;
  retryAttempts: number;
}

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

interface BrokerDashboardProps {
  connectedBrokers: BrokerConnection[];
  availableBrokers: AvailableBroker[];
  settings: BrokerSettings;
  connectionMetrics: ConnectionMetrics;
  realtimeAnalysis: RealtimeAnalysis;
  onConnect?: (brokerType: BrokerType, credentials: BrokerCredentials) => Promise<void>;
  onDisconnect?: (brokerId: string) => Promise<void>;
  onReconnect?: (brokerId: string) => Promise<void>;
  onUpdateSettings?: (settings: BrokerSettings) => Promise<void>;
}

export const BrokerDashboard: React.FC<BrokerDashboardProps> = ({
  connectedBrokers,
  availableBrokers,
  settings,
  connectionMetrics,
  realtimeAnalysis,
  onConnect,
  onDisconnect,
  onReconnect,
  onUpdateSettings
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<ConnectionStatus | 'ALL'>('ALL');
  const [selectedBroker, setSelectedBroker] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('connections');

  // Real-time data updates
  const { data: realtimeData, isConnected } = useRealTimeData('/api/broker/realtime');

  // Filter brokers based on search and status
  const filteredBrokers = connectedBrokers.filter(broker => {
    const matchesSearch = broker.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         broker.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || broker.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleConnect = async (brokerType: BrokerType, credentials: BrokerCredentials) => {
    await onConnect?.(brokerType, credentials);
  };

  const handleDisconnect = async (brokerId: string) => {
    try {
      await onDisconnect?.(brokerId);
    } catch (error) {
      console.error('Failed to disconnect broker:', error);
    }
  };

  const handleReconnect = async (brokerId: string) => {
    try {
      await onReconnect?.(brokerId);
    } catch (error) {
      console.error('Failed to reconnect broker:', error);
    }
  };

  const getStatusCounts = () => {
    return {
      connected: connectedBrokers.filter(b => b.status === ConnectionStatus.CONNECTED).length,
      disconnected: connectedBrokers.filter(b => b.status === ConnectionStatus.DISCONNECTED).length,
      error: connectedBrokers.filter(b => b.status === ConnectionStatus.ERROR).length,
      connecting: connectedBrokers.filter(b => 
        b.status === ConnectionStatus.CONNECTING || 
        b.status === ConnectionStatus.RECONNECTING
      ).length
    };
  };

  const statusCounts = getStatusCounts();

  return (
    <Box>
      {/* Header */}
      <Flex justify="space-between" align="center" mb={6}>
        <Box>
          <Text textStyle="heading.xl" mb={2}>Broker Connections</Text>
          <Flex align="center" gap={4}>
            <Badge colorPalette="green" variant="subtle">
              {statusCounts.connected} Connected
            </Badge>
            <Badge colorPalette="red" variant="subtle">
              {statusCounts.disconnected} Disconnected
            </Badge>
            {statusCounts.error > 0 && (
              <Badge colorPalette="red" variant="solid">
                {statusCounts.error} Errors
              </Badge>
            )}
            {statusCounts.connecting > 0 && (
              <Badge colorPalette="yellow" variant="subtle">
                {statusCounts.connecting} Connecting
              </Badge>
            )}
          </Flex>
        </Box>
        
        <Button
          colorPalette="brand"
          onClick={() => setShowAddModal(true)}
        >
          <AddCircleOutlinedIcon style={{ fontSize: 16, marginRight: 8 }} />
          Add Broker
        </Button>
      </Flex>

      {/* Tabs */}
      <Tabs.Root value={activeTab} onValueChange={(e) => setActiveTab(e.value)}>
        <Tabs.List mb={6}>
          <Tabs.Trigger value="connections">
            Connections ({connectedBrokers.length})
          </Tabs.Trigger>
          <Tabs.Trigger value="analytics">
            Analytics
          </Tabs.Trigger>
        </Tabs.List>

        <Tabs.Content value="connections">
          {/* Search and Filter */}
          <Flex gap={4} mb={6} wrap="wrap">
            <Box flex={1} maxW="300px" position="relative">
              <Input
                placeholder="Search brokers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <SearchIcon style={{ 
                fontSize: 16, 
                position: 'absolute', 
                right: 12, 
                top: '50%', 
                transform: 'translateY(-50%)',
                color: 'var(--chakra-colors-neutral-400)'
              }} />
            </Box>

            <Select.Root
              collection={createListCollection({ items: [
                { value: 'ALL', label: 'All Status' },
                { value: ConnectionStatus.CONNECTED, label: 'Connected' },
                { value: ConnectionStatus.DISCONNECTED, label: 'Disconnected' },
                { value: ConnectionStatus.ERROR, label: 'Error' },
                { value: ConnectionStatus.CONNECTING, label: 'Connecting' }
              ] })}
              value={[statusFilter]}
              onValueChange={(e) => setStatusFilter(e.value[0] as ConnectionStatus | 'ALL')}
              width="200px"
            >
              <Select.Trigger>
                <FilterListIcon style={{ fontSize: 14, marginRight: 8 }} />
                <Select.ValueText />
              </Select.Trigger>
              <Select.Content>
                <Select.Item item="ALL">All Status</Select.Item>
                <Select.Item item={ConnectionStatus.CONNECTED}>Connected</Select.Item>
                <Select.Item item={ConnectionStatus.DISCONNECTED}>Disconnected</Select.Item>
                <Select.Item item={ConnectionStatus.ERROR}>Error</Select.Item>
                <Select.Item item={ConnectionStatus.CONNECTING}>Connecting</Select.Item>
              </Select.Content>
            </Select.Root>
          </Flex>

          {/* Broker Cards */}
          {filteredBrokers.length === 0 ? (
            <EmptyState
              title={connectedBrokers.length === 0 ? "No Brokers Connected" : "No Brokers Found"}
              description={
                connectedBrokers.length === 0 
                  ? "Connect to your first broker to start receiving real-time market data"
                  : "Try adjusting your search or filter criteria"
              }
              actionLabel={connectedBrokers.length === 0 ? "Add First Broker" : undefined}
              onAction={connectedBrokers.length === 0 ? () => setShowAddModal(true) : undefined}
              icon="add"
            />
          ) : (
            <Grid 
              templateColumns={{ 
                base: '1fr', 
                md: 'repeat(2, 1fr)', 
                lg: 'repeat(3, 1fr)',
                xl: 'repeat(4, 1fr)' 
              }} 
              gap={6}
            >
              {filteredBrokers.map((broker) => (
                <BrokerCard
                  key={broker.id}
                  broker={broker}
                  onDisconnect={handleDisconnect}
                  onReconnect={handleReconnect}
                  onSettings={(brokerId) => setSelectedBroker(brokerId)}
                  onAnalytics={(brokerId) => {
                    setSelectedBroker(brokerId);
                    setActiveTab('analytics');
                  }}
                />
              ))}
            </Grid>
          )}
        </Tabs.Content>

        <Tabs.Content value="analytics">
          {selectedBroker && (
            <Text fontSize="sm" color="neutral.600" mb={4}>
              Analyzing broker: {selectedBroker}
            </Text>
          )}
          <BrokerAnalytics
            connectionMetrics={connectionMetrics}
            realtimeAnalysis={realtimeAnalysis}
          />
          {onUpdateSettings && (
            <Button
              size="sm"
              variant="outline"
              mt={4}
              onClick={() => onUpdateSettings(settings)}
            >
              Update Settings
            </Button>
          )}
        </Tabs.Content>
      </Tabs.Root>

      {/* Real-time Status Indicator */}
      {isConnected && (
        <Box
          position="fixed"
          bottom={4}
          right={4}
          p={2}
          bg="success.500"
          color="white"
          borderRadius="full"
          fontSize="xs"
          fontWeight="medium"
          shadow="lg"
          zIndex="toast"
          title={`Auto-reconnect: ${settings.autoReconnect ? 'On' : 'Off'} | Data points: ${realtimeData?.dataPoints || 0}`}
        >
          ● Live Updates Active
        </Box>
      )}

      {/* Add Broker Modal */}
      <AddBrokerModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onConnect={handleConnect}
        availableBrokers={availableBrokers}
      />
    </Box>
  );
};