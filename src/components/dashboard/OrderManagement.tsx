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
  Menu,
  Tabs,
  Input,
  Select,
  createListCollection
} from '@chakra-ui/react';
import { 
  FileText, 
  Search, 
  Filter,
  MoreHorizontal,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { mockQuery } from '../../data/stockTradingMockData';
import { OrderType, OrderSide, ProductType } from '../../types/enums';
import { formatCurrency, formatOrderType } from '../../utils/formatters';

interface Order {
  id: string;
  symbol: string;
  side: OrderSide;
  quantity: number;
  price: number;
  orderType: OrderType;
  productType: ProductType;
  status: 'PENDING' | 'EXECUTED' | 'CANCELLED' | 'REJECTED';
  timestamp: string;
  executedPrice?: number;
  executedQuantity?: number;
}

export const OrderManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Extended mock orders data
  const orders: Order[] = [
    ...mockQuery.recentOrders.map(order => ({
      ...order,
      executedPrice: order.status === 'EXECUTED' ? order.price : undefined,
      executedQuantity: order.status === 'EXECUTED' ? order.quantity : undefined
    })),
    {
      id: 'order3',
      symbol: 'HDFC',
      side: OrderSide.SELL,
      quantity: 20,
      price: 1660.00,
      orderType: OrderType.LIMIT,
      productType: ProductType.DELIVERY,
      status: 'CANCELLED',
      timestamp: '2025-01-27T09:30:00.000Z'
    },
    {
      id: 'order4',
      symbol: 'ICICIBANK',
      side: OrderSide.BUY,
      quantity: 15,
      price: 1250.00,
      orderType: OrderType.MARKET,
      productType: ProductType.INTRADAY,
      status: 'REJECTED',
      timestamp: '2025-01-27T08:15:00.000Z'
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING': return <Clock size={14} />;
      case 'EXECUTED': return <CheckCircle size={14} />;
      case 'CANCELLED': return <XCircle size={14} />;
      case 'REJECTED': return <AlertCircle size={14} />;
      default: return <Clock size={14} />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'yellow';
      case 'EXECUTED': return 'green';
      case 'CANCELLED': return 'gray';
      case 'REJECTED': return 'red';
      default: return 'gray';
    }
  };

  const getSideColor = (side: OrderSide) => {
    return side === OrderSide.BUY ? 'green' : 'red';
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.symbol.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.status.toLowerCase() === statusFilter.toLowerCase();
    const matchesTab = activeTab === 'all' || 
      (activeTab === 'pending' && order.status === 'PENDING') ||
      (activeTab === 'executed' && order.status === 'EXECUTED') ||
      (activeTab === 'cancelled' && ['CANCELLED', 'REJECTED'].includes(order.status));
    
    return matchesSearch && matchesStatus && matchesTab;
  });

  const orderCounts = {
    all: orders.length,
    pending: orders.filter(o => o.status === 'PENDING').length,
    executed: orders.filter(o => o.status === 'EXECUTED').length,
    cancelled: orders.filter(o => ['CANCELLED', 'REJECTED'].includes(o.status)).length
  };

  return (
    <Card.Root>
      <Card.Body>
        <Flex justify="space-between" align="center" mb={6}>
          <Flex align="center" gap={3}>
            <Icon color="brand.600">
              <FileText size={24} />
            </Icon>
            <Box>
              <Text textStyle="heading.md" color="gray.900">
                Order Management
              </Text>
              <Text fontSize="sm" color="gray.600">
                Track and manage your orders
              </Text>
            </Box>
          </Flex>
          <Button size="sm" colorScheme="brand">
            Export Orders
          </Button>
        </Flex>

        {/* Filters */}
        <Flex gap={3} mb={4}>
          <Box position="relative" flex={1}>
            <Icon
              position="absolute"
              left={3}
              top="50%"
              transform="translateY(-50%)"
              color="gray.400"
            >
              <Search size={16} />
            </Icon>
            <Input
              pl={10}
              placeholder="Search orders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </Box>
          <Select.Root
            collection={createListCollection({
              items: [
                { label: 'All Status', value: 'all' },
                { label: 'Pending', value: 'pending' },
                { label: 'Executed', value: 'executed' },
                { label: 'Cancelled', value: 'cancelled' },
                { label: 'Rejected', value: 'rejected' }
              ]
            })}
            value={[statusFilter]}
            onValueChange={(e) => setStatusFilter(e.value[0])}
          >
            <Select.Trigger minW="150px">
              <Icon color="gray.600">
                <Filter size={16} />
              </Icon>
              <Select.ValueText />
            </Select.Trigger>
            <Select.Content>
              <Select.Item item="all">All Status</Select.Item>
              <Select.Item item="pending">Pending</Select.Item>
              <Select.Item item="executed">Executed</Select.Item>
              <Select.Item item="cancelled">Cancelled</Select.Item>
              <Select.Item item="rejected">Rejected</Select.Item>
            </Select.Content>
          </Select.Root>
        </Flex>

        {/* Order Tabs */}
        <Tabs.Root value={activeTab} onValueChange={(e) => setActiveTab(e.value)} mb={4}>
          <Tabs.List>
            <Tabs.Trigger value="all">
              All Orders ({orderCounts.all})
            </Tabs.Trigger>
            <Tabs.Trigger value="pending">
              Pending ({orderCounts.pending})
            </Tabs.Trigger>
            <Tabs.Trigger value="executed">
              Executed ({orderCounts.executed})
            </Tabs.Trigger>
            <Tabs.Trigger value="cancelled">
              Cancelled ({orderCounts.cancelled})
            </Tabs.Trigger>
          </Tabs.List>
        </Tabs.Root>

        {/* Orders Table */}
        <Table.Root size="sm">
          <Table.Header>
            <Table.Row>
              <Table.ColumnHeader>Order ID</Table.ColumnHeader>
              <Table.ColumnHeader>Stock</Table.ColumnHeader>
              <Table.ColumnHeader>Type</Table.ColumnHeader>
              <Table.ColumnHeader>Side</Table.ColumnHeader>
              <Table.ColumnHeader>Quantity</Table.ColumnHeader>
              <Table.ColumnHeader>Price</Table.ColumnHeader>
              <Table.ColumnHeader>Status</Table.ColumnHeader>
              <Table.ColumnHeader>Time</Table.ColumnHeader>
              <Table.ColumnHeader>Actions</Table.ColumnHeader>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {filteredOrders.map((order) => (
              <Table.Row key={order.id} _hover={{ bg: 'gray.50' }}>
                <Table.Cell>
                  <Text fontSize="sm" fontFamily="mono" color="gray.700">
                    #{order.id.toUpperCase()}
                  </Text>
                </Table.Cell>
                <Table.Cell>
                  <Text fontWeight="semibold" color="gray.900">
                    {order.symbol}
                  </Text>
                  <Text fontSize="xs" color="gray.600">
                    {order.productType}
                  </Text>
                </Table.Cell>
                <Table.Cell>
                  <Text fontSize="sm" color="gray.700">
                    {formatOrderType(order.orderType)}
                  </Text>
                </Table.Cell>
                <Table.Cell>
                  <Text
                    fontSize="sm"
                    fontWeight="medium"
                    color={getSideColor(order.side)}
                  >
                    {order.side}
                  </Text>
                </Table.Cell>
                <Table.Cell>
                  <Text fontSize="sm" color="gray.700">
                    {order.executedQuantity || order.quantity}
                    {order.executedQuantity && order.executedQuantity < order.quantity && (
                      <Text as="span" fontSize="xs" color="gray.500">
                        /{order.quantity}
                      </Text>
                    )}
                  </Text>
                </Table.Cell>
                <Table.Cell>
                  <Text fontSize="sm" color="gray.700">
                    {formatCurrency(order.executedPrice || order.price)}
                  </Text>
                </Table.Cell>
                <Table.Cell>
                  <Badge
                    colorScheme={getStatusColor(order.status)}
                    size="sm"
                    display="flex"
                    alignItems="center"
                    gap={1}
                  >
                    {getStatusIcon(order.status)}
                    {order.status}
                  </Badge>
                </Table.Cell>
                <Table.Cell>
                  <Text fontSize="xs" color="gray.600">
                    {new Date(order.timestamp).toLocaleString()}
                  </Text>
                </Table.Cell>
                <Table.Cell>
                  <Menu.Root>
                    <Menu.Trigger asChild>
                      <Button variant="ghost" size="sm" p={1}>
                        <Icon><MoreHorizontal size={16} /></Icon>
                      </Button>
                    </Menu.Trigger>
                    <Menu.Content>
                      <Menu.Item value="view">View Details</Menu.Item>
                      {order.status === 'PENDING' && (
                        <>
                          <Menu.Item value="modify">Modify Order</Menu.Item>
                          <Menu.Item value="cancel">Cancel Order</Menu.Item>
                        </>
                      )}
                      {order.status === 'EXECUTED' && (
                        <Menu.Item value="download">Download Contract</Menu.Item>
                      )}
                    </Menu.Content>
                  </Menu.Root>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Root>

        {filteredOrders.length === 0 && (
          <Box textAlign="center" py={8}>
            <Icon color="gray.400" mb={2}>
              <FileText size={32} />
            </Icon>
            <Text color="gray.600" fontSize="sm">
              No orders found matching your criteria
            </Text>
          </Box>
        )}
      </Card.Body>
    </Card.Root>
  );
};
