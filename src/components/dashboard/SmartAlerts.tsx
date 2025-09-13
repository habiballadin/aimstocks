import React, { useState } from 'react';
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
  createListCollection,
  Alert,
  Table,
} from '@chakra-ui/react';
import { 
  Bell, 
  TrendingUp,
  Volume2,
  MessageSquare,
  Brain,
  Plus,
  Edit,
  Trash2
} from 'lucide-react';
import { AlertType } from '../../types/enums';

interface SmartAlert {
  id: string;
  name: string;
  type: AlertType;
  symbol: string;
  condition: {
    parameter: string;
    operator: string;
    value: number;
    timeframe?: string;
  };
  isActive: boolean;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  actions: Array<{
    type: 'NOTIFICATION' | 'EMAIL' | 'SMS' | 'AUTO_TRADE';
    config: Record<string, unknown>;
  }>;
  triggeredCount: number;
  lastTriggered?: string;
  createdAt: string;
}

interface ConditionalOrder {
  id: string;
  name: string;
  symbol: string;
  conditions: Array<{
    parameter: string;
    operator: string;
    value: number;
    logicalOperator?: 'AND' | 'OR';
  }>;
  action: {
    type: 'BUY' | 'SELL';
    quantity: number;
    orderType: 'MARKET' | 'LIMIT';
    price?: number;
  };
  isActive: boolean;
  status: 'PENDING' | 'TRIGGERED' | 'EXECUTED' | 'CANCELLED';
  createdAt: string;
}

interface SentimentAlert {
  id: string;
  source: 'NEWS' | 'SOCIAL' | 'ANALYST';
  symbol: string;
  sentiment: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL';
  score: number;
  impact: 'HIGH' | 'MEDIUM' | 'LOW';
  content: string;
  timestamp: string;
}

export const SmartAlerts: React.FC = () => {
  const [activeTab, setActiveTab] = useState('alerts');
  const [newAlertType, setNewAlertType] = useState<AlertType>(AlertType.PRICE_ABOVE);

  const [smartAlerts] = useState<SmartAlert[]>([
    {
      id: 'alert1',
      name: 'RELIANCE Breakout Alert',
      type: AlertType.PRICE_ABOVE,
      symbol: 'RELIANCE',
      condition: {
        parameter: 'price',
        operator: '>',
        value: 2875,
        timeframe: '5m'
      },
      isActive: true,
      priority: 'HIGH',
      actions: [
        { type: 'NOTIFICATION', config: { message: 'RELIANCE broke resistance!' } },
        { type: 'EMAIL', config: { recipient: 'user@email.com' } }
      ],
      triggeredCount: 3,
      lastTriggered: '2025-01-27T10:30:00Z',
      createdAt: '2025-01-25T09:00:00Z'
    },
    {
      id: 'alert2',
      name: 'Volume Spike - IT Sector',
      type: AlertType.VOLUME_SPIKE,
      symbol: 'TCS',
      condition: {
        parameter: 'volume',
        operator: '>',
        value: 200,
        timeframe: '1h'
      },
      isActive: true,
      priority: 'MEDIUM',
      actions: [
        { type: 'NOTIFICATION', config: { message: 'Unusual volume in TCS' } }
      ],
      triggeredCount: 1,
      lastTriggered: '2025-01-27T09:15:00Z',
      createdAt: '2025-01-26T14:30:00Z'
    },
    {
      id: 'alert3',
      name: 'AI Signal - INFY',
      type: AlertType.AI_SIGNAL,
      symbol: 'INFY',
      condition: {
        parameter: 'ai_confidence',
        operator: '>',
        value: 0.85
      },
      isActive: true,
      priority: 'HIGH',
      actions: [
        { type: 'NOTIFICATION', config: { message: 'Strong AI buy signal for INFY' } },
        { type: 'AUTO_TRADE', config: { action: 'BUY', quantity: 10 } }
      ],
      triggeredCount: 0,
      createdAt: '2025-01-27T08:00:00Z'
    }
  ]);

  const [conditionalOrders] = useState<ConditionalOrder[]>([
    {
      id: 'order1',
      name: 'HDFC Dip Buy',
      symbol: 'HDFC',
      conditions: [
        { parameter: 'price', operator: '<', value: 1620 },
        { parameter: 'rsi', operator: '<', value: 30, logicalOperator: 'AND' }
      ],
      action: {
        type: 'BUY',
        quantity: 20,
        orderType: 'LIMIT',
        price: 1615
      },
      isActive: true,
      status: 'PENDING',
      createdAt: '2025-01-27T09:00:00Z'
    },
    {
      id: 'order2',
      name: 'Profit Taking - RELIANCE',
      symbol: 'RELIANCE',
      conditions: [
        { parameter: 'price', operator: '>', value: 2950 },
        { parameter: 'profit_percent', operator: '>', value: 15, logicalOperator: 'OR' }
      ],
      action: {
        type: 'SELL',
        quantity: 25,
        orderType: 'MARKET'
      },
      isActive: true,
      status: 'PENDING',
      createdAt: '2025-01-26T16:30:00Z'
    }
  ]);

  const [sentimentAlerts] = useState<SentimentAlert[]>([
    {
      id: 'sent1',
      source: 'NEWS',
      symbol: 'RELIANCE',
      sentiment: 'POSITIVE',
      score: 0.82,
      impact: 'HIGH',
      content: 'Reliance announces major expansion in renewable energy sector',
      timestamp: '2025-01-27T08:30:00Z'
    },
    {
      id: 'sent2',
      source: 'SOCIAL',
      symbol: 'TCS',
      sentiment: 'NEGATIVE',
      score: -0.65,
      impact: 'MEDIUM',
      content: 'Concerns about TCS client concentration on social media',
      timestamp: '2025-01-27T10:15:00Z'
    },
    {
      id: 'sent3',
      source: 'ANALYST',
      symbol: 'INFY',
      sentiment: 'POSITIVE',
      score: 0.78,
      impact: 'HIGH',
      content: 'Multiple analysts upgrade INFY target price',
      timestamp: '2025-01-27T11:00:00Z'
    }
  ]);

  const getAlertTypeIcon = (type: AlertType) => {
    switch (type) {
      case AlertType.PRICE_ABOVE:
      case AlertType.PRICE_BELOW:
        return <TrendingUp size={16} />;
      case AlertType.VOLUME_SPIKE:
        return <Volume2 size={16} />;
      case AlertType.NEWS_ALERT:
        return <MessageSquare size={16} />;
      case AlertType.AI_SIGNAL:
        return <Brain size={16} />;
      default:
        return <Bell size={16} />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HIGH': return 'danger';
      case 'MEDIUM': return 'warning';
      default: return 'neutral';
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'POSITIVE': return 'success';
      case 'NEGATIVE': return 'danger';
      default: return 'warning';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'warning';
      case 'TRIGGERED': return 'ai';
      case 'EXECUTED': return 'success';
      case 'CANCELLED': return 'danger';
      default: return 'neutral';
    }
  };



  return (
    <Box>
      {/* Header */}
      <Card.Root mb={6}>
        <Card.Body>
          <Flex justify="space-between" align="center" mb={4}>
            <Flex align="center" gap={3}>
              <Icon color="ai.600">
                <Bell size={24} />
              </Icon>
              <Box>
                <Text textStyle="heading.md" color="neutral.900">
                  Smart Alerts & Automation
                </Text>
                <Text fontSize="sm" color="neutral.600">
                  AI-powered alerts and conditional trading automation
                </Text>
              </Box>
            </Flex>
            
            <Flex align="center" gap={2}>
              <Select.Root 
                collection={createListCollection({
                  items: [
                    { label: 'Price Above', value: 'PRICE_ABOVE' },
                    { label: 'Price Below', value: 'PRICE_BELOW' },
                    { label: 'Volume Spike', value: 'VOLUME_SPIKE' },
                    { label: 'AI Signal', value: 'AI_SIGNAL' },
                    { label: 'News Alert', value: 'NEWS_ALERT' }
                  ]
                })}
                value={[newAlertType]} 
                onValueChange={(e) => setNewAlertType(e.value[0] as AlertType)}
              >
                <Select.Trigger minW="140px">
                  <Select.ValueText />
                </Select.Trigger>
                <Select.Content>
                  <Select.Item item="PRICE_ABOVE">Price Above</Select.Item>
                  <Select.Item item="PRICE_BELOW">Price Below</Select.Item>
                  <Select.Item item="VOLUME_SPIKE">Volume Spike</Select.Item>
                  <Select.Item item="AI_SIGNAL">AI Signal</Select.Item>
                  <Select.Item item="NEWS_ALERT">News Alert</Select.Item>
                </Select.Content>
              </Select.Root>
              <Button colorPalette="ai">
                <Icon><Plus size={16} /></Icon>
                Create Alert
              </Button>
            </Flex>
          </Flex>

          {/* Quick Stats */}
          <SimpleGrid columns={{ base: 2, md: 4 }} gap={4}>
            <Box textAlign="center">
              <Text fontSize="2xl" fontWeight="bold" color="ai.600">12</Text>
              <Text fontSize="sm" color="neutral.600">Active Alerts</Text>
            </Box>
            <Box textAlign="center">
              <Text fontSize="2xl" fontWeight="bold" color="success.600">8</Text>
              <Text fontSize="sm" color="neutral.600">Triggered Today</Text>
            </Box>
            <Box textAlign="center">
              <Text fontSize="2xl" fontWeight="bold" color="warning.600">3</Text>
              <Text fontSize="sm" color="neutral.600">Pending Orders</Text>
            </Box>
            <Box textAlign="center">
              <Text fontSize="2xl" fontWeight="bold" color="danger.600">2</Text>
              <Text fontSize="sm" color="neutral.600">High Priority</Text>
            </Box>
          </SimpleGrid>
        </Card.Body>
      </Card.Root>

      <Tabs.Root value={activeTab} onValueChange={(e) => setActiveTab(e.value)}>
        <Tabs.List mb={6}>
          <Tabs.Trigger value="alerts">Smart Alerts</Tabs.Trigger>
          <Tabs.Trigger value="conditional">Conditional Orders</Tabs.Trigger>
          <Tabs.Trigger value="sentiment">Sentiment Alerts</Tabs.Trigger>
          <Tabs.Trigger value="automation">Automation Rules</Tabs.Trigger>
        </Tabs.List>

        {/* Smart Alerts Tab */}
        <Tabs.Content value="alerts">
          <Card.Root>
            <Card.Body>
              <Text fontWeight="semibold" color="neutral.900" mb={4}>
                Active Smart Alerts
              </Text>
              
              <Table.Root variant="outline">
                <Table.Header>
                  <Table.Row>
                    <Table.ColumnHeader>Alert</Table.ColumnHeader>
                    <Table.ColumnHeader>Condition</Table.ColumnHeader>
                    <Table.ColumnHeader>Priority</Table.ColumnHeader>
                    <Table.ColumnHeader>Status</Table.ColumnHeader>
                    <Table.ColumnHeader>Triggered</Table.ColumnHeader>
                    <Table.ColumnHeader>Actions</Table.ColumnHeader>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {smartAlerts.map((alert) => (
                    <Table.Row key={alert.id}>
                      <Table.Cell>
                        <Flex align="center" gap={3}>
                          <Icon color="ai.600">
                            {getAlertTypeIcon(alert.type)}
                          </Icon>
                          <Box>
                            <Text fontWeight="medium" fontSize="sm">
                              {alert.name}
                            </Text>
                            <Text fontSize="xs" color="neutral.600">
                              {alert.symbol}
                            </Text>
                          </Box>
                        </Flex>
                      </Table.Cell>
                      <Table.Cell>
                        <Text fontSize="sm">
                          {alert.condition.parameter} {alert.condition.operator} {alert.condition.value}
                        </Text>
                        {alert.condition.timeframe && (
                          <Text fontSize="xs" color="neutral.600">
                            {alert.condition.timeframe}
                          </Text>
                        )}
                      </Table.Cell>
                      <Table.Cell>
                        <Badge colorPalette={getPriorityColor(alert.priority)} size="sm">
                          {alert.priority}
                        </Badge>
                      </Table.Cell>
                      <Table.Cell>
                        <Flex align="center" gap={2}>
                          <Box 
                            w={8} 
                            h={4} 
                            bg={alert.isActive ? 'success.500' : 'neutral.300'} 
                            borderRadius="full"
                          />
                          <Text fontSize="xs" color={alert.isActive ? 'success.600' : 'neutral.500'}>
                            {alert.isActive ? 'Active' : 'Inactive'}
                          </Text>
                        </Flex>
                      </Table.Cell>
                      <Table.Cell>
                        <Box>
                          <Text fontSize="sm" fontWeight="medium">
                            {alert.triggeredCount}x
                          </Text>
                          {alert.lastTriggered && (
                            <Text fontSize="xs" color="neutral.600">
                              {new Date(alert.lastTriggered).toLocaleString()}
                            </Text>
                          )}
                        </Box>
                      </Table.Cell>
                      <Table.Cell>
                        <Flex gap={2}>
                          <Button size="sm" variant="outline">
                            <Icon><Edit size={14} /></Icon>
                          </Button>
                          <Button size="sm" variant="outline" colorPalette="danger">
                            <Icon><Trash2 size={14} /></Icon>
                          </Button>
                        </Flex>
                      </Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table.Root>
            </Card.Body>
          </Card.Root>
        </Tabs.Content>

        {/* Conditional Orders Tab */}
        <Tabs.Content value="conditional">
          <SimpleGrid columns={{ base: 1, lg: 2 }} gap={6}>
            <Card.Root>
              <Card.Body>
                <Text fontWeight="semibold" color="neutral.900" mb={4}>
                  Conditional Orders
                </Text>
                
                <Stack gap={4}>
                  {conditionalOrders.map((order) => (
                    <Box
                      key={order.id}
                      p={4}
                      bg="ai.50"
                      borderRadius="md"
                      border="1px solid"
                      borderColor="ai.200"
                    >
                      <Flex justify="space-between" align="flex-start" mb={3}>
                        <Box>
                          <Text fontWeight="semibold" color="ai.800" mb={1}>
                            {order.name}
                          </Text>
                          <Text fontSize="sm" color="neutral.700">
                            {order.symbol} • {order.action.type} {order.action.quantity} shares
                          </Text>
                        </Box>
                        <Badge colorPalette={getStatusColor(order.status)} size="sm">
                          {order.status}
                        </Badge>
                      </Flex>

                      <Box mb={3}>
                        <Text fontSize="sm" color="neutral.600" mb={2}>Conditions:</Text>
                        {order.conditions.map((condition, index) => (
                          <Flex key={index} align="center" gap={2} mb={1}>
                            {index > 0 && (
                              <Badge size="xs" colorPalette="neutral">
                                {condition.logicalOperator}
                              </Badge>
                            )}
                            <Text fontSize="sm">
                              {condition.parameter} {condition.operator} {condition.value}
                            </Text>
                          </Flex>
                        ))}
                      </Box>

                      <Flex justify="space-between" align="center">
                        <Text fontSize="xs" color="neutral.500">
                          Created: {new Date(order.createdAt).toLocaleDateString()}
                        </Text>
                        <Flex gap={2}>
                          <Button size="sm" variant="outline">
                            Edit
                          </Button>
                          <Button size="sm" variant="outline" colorPalette="danger">
                            Cancel
                          </Button>
                        </Flex>
                      </Flex>
                    </Box>
                  ))}
                </Stack>
              </Card.Body>
            </Card.Root>

            <Card.Root>
              <Card.Body>
                <Text fontWeight="semibold" color="neutral.900" mb={4}>
                  Create Conditional Order
                </Text>
                
                <Stack gap={4}>
                  <Box>
                    <Text fontSize="sm" fontWeight="medium" color="neutral.700" mb={2}>
                      Stock Symbol
                    </Text>
                    <Input placeholder="Enter symbol (e.g., RELIANCE)" />
                  </Box>

                  <Box>
                    <Text fontSize="sm" fontWeight="medium" color="neutral.700" mb={2}>
                      Action
                    </Text>
                    <Select.Root collection={createListCollection({
                      items: [
                        { label: 'Buy', value: 'BUY' },
                        { label: 'Sell', value: 'SELL' }
                      ]
                    })}>
                      <Select.Trigger>
                        <Select.ValueText placeholder="Select action" />
                      </Select.Trigger>
                      <Select.Content>
                        <Select.Item item="BUY">Buy</Select.Item>
                        <Select.Item item="SELL">Sell</Select.Item>
                      </Select.Content>
                    </Select.Root>
                  </Box>

                  <Box>
                    <Text fontSize="sm" fontWeight="medium" color="neutral.700" mb={2}>
                      Quantity
                    </Text>
                    <Input type="number" placeholder="Enter quantity" />
                  </Box>

                  <Box>
                    <Text fontSize="sm" fontWeight="medium" color="neutral.700" mb={2}>
                      Condition
                    </Text>
                    <Flex gap={2}>
                      <Select.Root collection={createListCollection({
                        items: [
                          { label: 'Price', value: 'price' },
                          { label: 'RSI', value: 'rsi' },
                          { label: 'Volume', value: 'volume' }
                        ]
                      })}>
                        <Select.Trigger>
                          <Select.ValueText placeholder="Parameter" />
                        </Select.Trigger>
                        <Select.Content>
                          <Select.Item item="price">Price</Select.Item>
                          <Select.Item item="rsi">RSI</Select.Item>
                          <Select.Item item="volume">Volume</Select.Item>
                        </Select.Content>
                      </Select.Root>
                      <Select.Root collection={createListCollection({
                        items: [
                          { label: 'Greater than', value: '>' },
                          { label: 'Less than', value: '<' },
                          { label: 'Equal to', value: '=' }
                        ]
                      })}>
                        <Select.Trigger>
                          <Select.ValueText placeholder="Operator" />
                        </Select.Trigger>
                        <Select.Content>
                          <Select.Item item=">">Greater than</Select.Item>
                          <Select.Item item="<">Less than</Select.Item>
                          <Select.Item item="=">Equal to</Select.Item>
                        </Select.Content>
                      </Select.Root>
                      <Input placeholder="Value" />
                    </Flex>
                  </Box>

                  <Button colorPalette="ai">
                    Create Order
                  </Button>
                </Stack>
              </Card.Body>
            </Card.Root>
          </SimpleGrid>
        </Tabs.Content>

        {/* Sentiment Alerts Tab */}
        <Tabs.Content value="sentiment">
          <Card.Root>
            <Card.Body>
              <Text fontWeight="semibold" color="neutral.900" mb={4}>
                Real-time Sentiment Alerts
              </Text>
              
              <Stack gap={4}>
                {sentimentAlerts.map((alert) => (
                  <Box
                    key={alert.id}
                    p={4}
                    bg={`${getSentimentColor(alert.sentiment)}.50`}
                    borderRadius="md"
                    border="1px solid"
                    borderColor={`${getSentimentColor(alert.sentiment)}.200`}
                  >
                    <Flex justify="space-between" align="flex-start" mb={2}>
                      <Flex align="center" gap={3}>
                        <Icon color={`${getSentimentColor(alert.sentiment)}.600`}>
                          {alert.source === 'NEWS' ? <MessageSquare size={16} /> : 
                           alert.source === 'SOCIAL' ? <MessageSquare size={16} /> : 
                           <TrendingUp size={16} />}
                        </Icon>
                        <Box>
                          <Text fontWeight="semibold" color={`${getSentimentColor(alert.sentiment)}.800`}>
                            {alert.symbol} - {alert.source} Alert
                          </Text>
                          <Text fontSize="sm" color="neutral.700">
                            {alert.content}
                          </Text>
                        </Box>
                      </Flex>
                      <Badge colorPalette={getSentimentColor(alert.sentiment)} size="sm">
                        {alert.sentiment}
                      </Badge>
                    </Flex>

                    <Flex justify="space-between" align="center">
                      <Flex align="center" gap={4}>
                        <Box>
                          <Text fontSize="xs" color="neutral.600">Sentiment Score</Text>
                          <Text fontSize="sm" fontWeight="bold" color={`${getSentimentColor(alert.sentiment)}.600`}>
                            {alert.score.toFixed(2)}
                          </Text>
                        </Box>
                        <Box>
                          <Text fontSize="xs" color="neutral.600">Impact</Text>
                          <Text fontSize="sm" fontWeight="bold">
                            {alert.impact}
                          </Text>
                        </Box>
                      </Flex>
                      <Text fontSize="xs" color="neutral.500">
                        {new Date(alert.timestamp).toLocaleString()}
                      </Text>
                    </Flex>
                  </Box>
                ))}
              </Stack>
            </Card.Body>
          </Card.Root>
        </Tabs.Content>

        {/* Automation Rules Tab */}
        <Tabs.Content value="automation">
          <SimpleGrid columns={{ base: 1, lg: 2 }} gap={6}>
            <Card.Root>
              <Card.Body>
                <Text fontWeight="semibold" color="neutral.900" mb={4}>
                  Automation Settings
                </Text>
                
                <Stack gap={4}>
                  <Box p={4} bg="neutral.50" borderRadius="md">
                    <Flex justify="space-between" align="center" mb={2}>
                      <Text fontWeight="medium">Auto-execute AI signals</Text>
                      <Box w={8} h={4} bg="neutral.300" borderRadius="full" />
                    </Flex>
                    <Text fontSize="sm" color="neutral.600">
                      Automatically execute trades when AI confidence &gt; 85%
                    </Text>
                  </Box>

                  <Box p={4} bg="neutral.50" borderRadius="md">
                    <Flex justify="space-between" align="center" mb={2}>
                      <Text fontWeight="medium">Smart stop-loss</Text>
                      <Box w={8} h={4} bg="success.500" borderRadius="full" />
                    </Flex>
                    <Text fontSize="sm" color="neutral.600">
                      Dynamically adjust stop-loss based on volatility
                    </Text>
                  </Box>

                  <Box p={4} bg="neutral.50" borderRadius="md">
                    <Flex justify="space-between" align="center" mb={2}>
                      <Text fontWeight="medium">Portfolio rebalancing</Text>
                      <Box w={8} h={4} bg="success.500" borderRadius="full" />
                    </Flex>
                    <Text fontSize="sm" color="neutral.600">
                      Auto-rebalance when allocation deviates &gt; 5%
                    </Text>
                  </Box>

                  <Box p={4} bg="neutral.50" borderRadius="md">
                    <Flex justify="space-between" align="center" mb={2}>
                      <Text fontWeight="medium">News-based trading</Text>
                      <Box w={8} h={4} bg="neutral.300" borderRadius="full" />
                    </Flex>
                    <Text fontSize="sm" color="neutral.600">
                      Execute trades based on news sentiment analysis
                    </Text>
                  </Box>
                </Stack>
              </Card.Body>
            </Card.Root>

            <Card.Root>
              <Card.Body>
                <Text fontWeight="semibold" color="neutral.900" mb={4}>
                  Automation Statistics
                </Text>
                
                <Stack gap={4}>
                  <Box textAlign="center" p={4} bg="success.50" borderRadius="md">
                    <Text fontSize="2xl" fontWeight="bold" color="success.600">
                      156
                    </Text>
                    <Text fontSize="sm" color="success.700">
                      Successful automated trades
                    </Text>
                  </Box>

                  <Box textAlign="center" p={4} bg="ai.50" borderRadius="md">
                    <Text fontSize="2xl" fontWeight="bold" color="ai.600">
                      92.3%
                    </Text>
                    <Text fontSize="sm" color="ai.700">
                      Automation success rate
                    </Text>
                  </Box>

                  <Box textAlign="center" p={4} bg="warning.50" borderRadius="md">
                    <Text fontSize="2xl" fontWeight="bold" color="warning.600">
                      ₹47,500
                    </Text>
                    <Text fontSize="sm" color="warning.700">
                      Profit from automation
                    </Text>
                  </Box>
                </Stack>

                <Alert.Root status="info" mt={4}>
                  <Alert.Indicator />
                  <Box>
                    <Alert.Title>Smart Automation Active</Alert.Title>
                    <Text fontSize="sm">
                      Your automation rules are working 24/7 to optimize your portfolio
                    </Text>
                  </Box>
                </Alert.Root>
              </Card.Body>
            </Card.Root>
          </SimpleGrid>
        </Tabs.Content>
      </Tabs.Root>
    </Box>
  );
};