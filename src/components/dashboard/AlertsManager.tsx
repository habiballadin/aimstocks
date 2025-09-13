import React, { useState } from 'react';
import { 
  Card, 
  Text, 
  Box, 
  Flex, 
  Table,
  Icon,
  Button,
  Badge,
  Switch,
  Dialog,
  Input,
  Select,
  Stack,
  createListCollection
} from '@chakra-ui/react';
import { 
  Bell, 
  Plus, 
  Edit,
  Trash2,
  TrendingUp,
  TrendingDown,
  Volume2,
  Newspaper
} from 'lucide-react';
import { AlertType } from '../../types/enums';
import { formatCurrency } from '../../utils/formatters';

interface PriceAlert {
  id: string;
  symbol: string;
  type: AlertType;
  condition: 'above' | 'below';
  targetPrice: number;
  currentPrice: number;
  isActive: boolean;
  createdAt: string;
  triggeredAt?: string;
}

export const AlertsManager: React.FC = () => {
  const [alerts, setAlerts] = useState<PriceAlert[]>([
    {
      id: '1',
      symbol: 'RELIANCE',
      type: AlertType.PRICE_ABOVE,
      condition: 'above',
      targetPrice: 2900,
      currentPrice: 2847.65,
      isActive: true,
      createdAt: '2025-01-27T09:00:00.000Z'
    },
    {
      id: '2',
      symbol: 'TCS',
      type: AlertType.PRICE_BELOW,
      condition: 'below',
      targetPrice: 4000,
      currentPrice: 4125.30,
      isActive: true,
      createdAt: '2025-01-27T08:30:00.000Z'
    },
    {
      id: '3',
      symbol: 'INFY',
      type: AlertType.VOLUME_SPIKE,
      condition: 'above',
      targetPrice: 0, // Not applicable for volume alerts
      currentPrice: 1847.90,
      isActive: false,
      createdAt: '2025-01-26T15:45:00.000Z',
      triggeredAt: '2025-01-27T10:15:00.000Z'
    }
  ]);

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newAlert, setNewAlert] = useState({
    symbol: '',
    type: AlertType.PRICE_ABOVE,
    condition: 'above' as 'above' | 'below',
    targetPrice: ''
  });

  const getAlertIcon = (type: AlertType) => {
    switch (type) {
      case AlertType.PRICE_ABOVE: return <TrendingUp size={14} />;
      case AlertType.PRICE_BELOW: return <TrendingDown size={14} />;
      case AlertType.VOLUME_SPIKE: return <Volume2 size={14} />;
      case AlertType.NEWS_ALERT: return <Newspaper size={14} />;
      default: return <Bell size={14} />;
    }
  };

  const getAlertColor = (type: AlertType) => {
    switch (type) {
      case AlertType.PRICE_ABOVE: return 'success';
      case AlertType.PRICE_BELOW: return 'danger';
      case AlertType.VOLUME_SPIKE: return 'brand';
      case AlertType.NEWS_ALERT: return 'warning';
      default: return 'neutral';
    }
  };

  const getAlertStatus = (alert: PriceAlert) => {
    if (alert.triggeredAt) return 'triggered';
    if (!alert.isActive) return 'inactive';
    
    if (alert.type === AlertType.PRICE_ABOVE) {
      return alert.currentPrice >= alert.targetPrice ? 'triggered' : 'active';
    } else if (alert.type === AlertType.PRICE_BELOW) {
      return alert.currentPrice <= alert.targetPrice ? 'triggered' : 'active';
    }
    
    return 'active';
  };

  const toggleAlert = (id: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === id ? { ...alert, isActive: !alert.isActive } : alert
    ));
  };

  const deleteAlert = (id: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== id));
  };

  const createAlert = () => {
    if (!newAlert.symbol || !newAlert.targetPrice) return;

    const alert: PriceAlert = {
      id: Date.now().toString(),
      symbol: newAlert.symbol.toUpperCase(),
      type: newAlert.type,
      condition: newAlert.condition,
      targetPrice: parseFloat(newAlert.targetPrice),
      currentPrice: 0, // Would be fetched from API
      isActive: true,
      createdAt: new Date().toISOString()
    };

    setAlerts(prev => [...prev, alert]);
    setNewAlert({ symbol: '', type: AlertType.PRICE_ABOVE, condition: 'above', targetPrice: '' });
    setIsCreateDialogOpen(false);
  };

  const activeAlerts = alerts.filter(alert => alert.isActive && !alert.triggeredAt);
  const triggeredAlerts = alerts.filter(alert => alert.triggeredAt);

  return (
    <Card.Root>
      <Card.Body>
        <Flex justify="space-between" align="center" mb={6}>
          <Flex align="center" gap={3}>
            <Icon as={Bell} color="warning.600" boxSize={6} />
            <Box>
              <Text textStyle="heading.md" color="neutral.900">
                Price Alerts
              </Text>
              <Text fontSize="sm" color="neutral.600">
                {activeAlerts.length} active • {triggeredAlerts.length} triggered
              </Text>
            </Box>
          </Flex>
          <Button 
            size="sm" 
            colorPalette="brand"
            onClick={() => setIsCreateDialogOpen(true)}
          >
            <Icon as={Plus} boxSize={4} />
            Create Alert
          </Button>
        </Flex>

        {/* Alerts Table */}
        <Table.Root size="sm">
          <Table.Header>
            <Table.Row>
              <Table.ColumnHeader>Stock</Table.ColumnHeader>
              <Table.ColumnHeader>Alert Type</Table.ColumnHeader>
              <Table.ColumnHeader>Target</Table.ColumnHeader>
              <Table.ColumnHeader>Current</Table.ColumnHeader>
              <Table.ColumnHeader>Status</Table.ColumnHeader>
              <Table.ColumnHeader>Active</Table.ColumnHeader>
              <Table.ColumnHeader>Actions</Table.ColumnHeader>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {alerts.map((alert) => {
              const status = getAlertStatus(alert);
              return (
                <Table.Row key={alert.id} _hover={{ bg: 'neutral.50' }}>
                  <Table.Cell>
                    <Text fontWeight="semibold" color="neutral.900">
                      {alert.symbol}
                    </Text>
                  </Table.Cell>
                  <Table.Cell>
                    <Flex align="center" gap={2}>
                      <Icon as={getAlertIcon(alert.type).type} color={`${getAlertColor(alert.type)}.600`} boxSize={4} />
                      <Text fontSize="sm" color="neutral.700">
                        {alert.condition === 'above' ? 'Above' : 'Below'}
                      </Text>
                    </Flex>
                  </Table.Cell>
                  <Table.Cell>
                    {alert.type === AlertType.VOLUME_SPIKE ? (
                      <Text fontSize="sm" color="neutral.700">Volume Spike</Text>
                    ) : (
                      <Text fontSize="sm" color="neutral.700">
                        {formatCurrency(alert.targetPrice)}
                      </Text>
                    )}
                  </Table.Cell>
                  <Table.Cell>
                    <Text fontSize="sm" color="neutral.700">
                      {formatCurrency(alert.currentPrice)}
                    </Text>
                  </Table.Cell>
                  <Table.Cell>
                    <Badge 
                      colorPalette={
                        status === 'triggered' ? 'red' : 
                        status === 'active' ? 'green' : 'gray'
                      }
                      size="sm"
                    >
                      {status.toUpperCase()}
                    </Badge>
                  </Table.Cell>
                  <Table.Cell>
                    <Switch.Root
                      checked={alert.isActive}
                      onCheckedChange={() => toggleAlert(alert.id)}
                      size="sm"
                    >
                      <Switch.Control>
                        <Switch.Thumb />
                      </Switch.Control>
                    </Switch.Root>
                  </Table.Cell>
                  <Table.Cell>
                    <Flex gap={1}>
                      <Button variant="ghost" size="sm" p={1}>
                      <Icon as={Edit} color="neutral.600" boxSize={3.5} />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        p={1}
                        onClick={() => deleteAlert(alert.id)}
                      >
                        <Icon as={Trash2} color="danger.600" boxSize={3.5} />
                      </Button>
                    </Flex>
                  </Table.Cell>
                </Table.Row>
              );
            })}
          </Table.Body>
        </Table.Root>

        {alerts.length === 0 && (
          <Box textAlign="center" py={8}>
            <Icon as={Bell} color="neutral.400" mb={2} boxSize={8} />
            <Text color="neutral.600" fontSize="sm" mb={3}>
              No alerts created yet
            </Text>
            <Button 
              size="sm" 
              colorPalette="brand"
              onClick={() => setIsCreateDialogOpen(true)}
            >
              Create Your First Alert
            </Button>
          </Box>
        )}

        {/* Create Alert Dialog */}
        <Dialog.Root open={isCreateDialogOpen} onOpenChange={(details) => setIsCreateDialogOpen(details.open)}>
          <Dialog.Content>
            <Dialog.Header>
              <Dialog.Title>Create Price Alert</Dialog.Title>
            </Dialog.Header>
            <Dialog.Body>
              <Stack gap={4}>
                <Box>
                  <Text fontSize="sm" fontWeight="medium" color="neutral.700" mb={2}>
                    Stock Symbol
                  </Text>
                  <Input 
                    placeholder="e.g., RELIANCE"
                    value={newAlert.symbol}
                    onChange={(e) => setNewAlert(prev => ({ ...prev, symbol: e.target.value }))}
                  />
                </Box>

                <Box>
                  <Text fontSize="sm" fontWeight="medium" color="neutral.700" mb={2}>
                    Alert Type
                  </Text>
                  <Select.Root 
                    collection={createListCollection({ items: [
                      { value: AlertType.PRICE_ABOVE, label: 'Price Above' },
                      { value: AlertType.PRICE_BELOW, label: 'Price Below' },
                      { value: AlertType.VOLUME_SPIKE, label: 'Volume Spike' }
                    ] })}
                    value={[newAlert.type]} 
                    onValueChange={(e) => setNewAlert(prev => ({ ...prev, type: e.value[0] as AlertType }))}
                  >
                    <Select.Trigger>
                      <Select.ValueText />
                    </Select.Trigger>
                    <Select.Content>
                      <Select.Item item={AlertType.PRICE_ABOVE}>Price Above</Select.Item>
                      <Select.Item item={AlertType.PRICE_BELOW}>Price Below</Select.Item>
                      <Select.Item item={AlertType.VOLUME_SPIKE}>Volume Spike</Select.Item>
                    </Select.Content>
                  </Select.Root>
                </Box>

                {newAlert.type !== AlertType.VOLUME_SPIKE && (
                  <Box>
                    <Text fontSize="sm" fontWeight="medium" color="neutral.700" mb={2}>
                      Target Price
                    </Text>
                    <Input 
                      type="number"
                      step="0.01"
                      placeholder="Enter target price"
                      value={newAlert.targetPrice}
                      onChange={(e) => setNewAlert(prev => ({ ...prev, targetPrice: e.target.value }))}
                    />
                  </Box>
                )}
              </Stack>
            </Dialog.Body>
            <Dialog.Footer>
              <Button 
                variant="outline" 
                onClick={() => setIsCreateDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button 
                colorPalette="brand"
                onClick={createAlert}
              >
                Create Alert
              </Button>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Root>
      </Card.Body>
    </Card.Root>
  );
};