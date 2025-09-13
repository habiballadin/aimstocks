"use client"

import React, { useState, useEffect } from 'react';
import {
  Box,
  Text,
  Button,
  Input,
  Badge,
  Spinner,
  Flex,
} from '@chakra-ui/react';

import { fyersService, FyersOrder } from '../../services/fyersService';

const OrdersView: React.FC = () => {
  const [orders, setOrders] = useState<FyersOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [orderId, setOrderId] = useState('');
  const [orderTag, setOrderTag] = useState('');


  const fetchOrders = async (id?: string, tag?: string) => {
    setLoading(true);
    try {
      const data = await fyersService.getOrders(id, tag);
      setOrders(data);
    } catch (error) {
      console.error(error instanceof Error ? error.message : 'Failed to fetch orders');
      alert(error instanceof Error ? error.message : 'Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const getStatusBadge = (status: number) => {
    const statusMap = {
      1: { label: 'Canceled', color: 'red' },
      2: { label: 'Filled', color: 'green' },
      4: { label: 'Transit', color: 'yellow' },
      5: { label: 'Rejected', color: 'red' },
      6: { label: 'Pending', color: 'blue' },
      7: { label: 'Expired', color: 'gray' },
    };
    const statusInfo = statusMap[status as keyof typeof statusMap] || { label: 'Unknown', color: 'gray' };
    return <Badge colorScheme={statusInfo.color}>{statusInfo.label}</Badge>;
  };

  const getSideBadge = (side: number) => {
    return <Badge colorScheme={side === 1 ? 'green' : 'red'}>{side === 1 ? 'BUY' : 'SELL'}</Badge>;
  };

  return (
    <Box p={6}>
      <Box>
        <Box mb={6}>
          <Text fontSize="2xl" fontWeight="bold">Orders</Text>
        </Box>
        
        <Flex gap={4} mb={6}>
          <Box>
            <Text fontSize="sm" mb={1}>Order ID</Text>
            <Input
              size="sm"
              maxW="200px"
              placeholder="Enter order ID"
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
            />
          </Box>
          
          <Box>
            <Text fontSize="sm" mb={1}>Order Tag</Text>
            <Input
              size="sm"
              maxW="200px"
              placeholder="Enter order tag"
              value={orderTag}
              onChange={(e) => setOrderTag(e.target.value)}
            />
          </Box>
          
          <Button
            size="sm"
            colorScheme="blue"
            onClick={() => fetchOrders(orderId || undefined, orderTag || undefined)}
            disabled={loading}
          >
            Filter
          </Button>
          
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setOrderId('');
              setOrderTag('');
              fetchOrders();
            }}
          >
            Clear
          </Button>
        </Flex>

        {loading ? (
          <Box textAlign="center" py={8}>
            <Spinner size="lg" />
          </Box>
        ) : (
          <Box overflowX="auto">
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{ padding: '8px', textAlign: 'left', borderBottom: '1px solid #e2e8f0' }}>Order ID</th>
                  <th style={{ padding: '8px', textAlign: 'left', borderBottom: '1px solid #e2e8f0' }}>Symbol</th>
                  <th style={{ padding: '8px', textAlign: 'left', borderBottom: '1px solid #e2e8f0' }}>Side</th>
                  <th style={{ padding: '8px', textAlign: 'left', borderBottom: '1px solid #e2e8f0' }}>Qty</th>
                  <th style={{ padding: '8px', textAlign: 'left', borderBottom: '1px solid #e2e8f0' }}>Price</th>
                  <th style={{ padding: '8px', textAlign: 'left', borderBottom: '1px solid #e2e8f0' }}>Status</th>
                  <th style={{ padding: '8px', textAlign: 'left', borderBottom: '1px solid #e2e8f0' }}>Date/Time</th>
                  <th style={{ padding: '8px', textAlign: 'left', borderBottom: '1px solid #e2e8f0' }}>Tag</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id}>
                    <td style={{ padding: '8px', borderBottom: '1px solid #e2e8f0' }}>{order.id}</td>
                    <td style={{ padding: '8px', borderBottom: '1px solid #e2e8f0' }}>{order.symbol}</td>
                    <td style={{ padding: '8px', borderBottom: '1px solid #e2e8f0' }}>{getSideBadge(order.side)}</td>
                    <td style={{ padding: '8px', borderBottom: '1px solid #e2e8f0' }}>{order.qty}</td>
                    <td style={{ padding: '8px', borderBottom: '1px solid #e2e8f0' }}>₹{order.limitPrice || order.tradedPrice}</td>
                    <td style={{ padding: '8px', borderBottom: '1px solid #e2e8f0' }}>{getStatusBadge(order.status)}</td>
                    <td style={{ padding: '8px', borderBottom: '1px solid #e2e8f0' }}>{order.orderDateTime}</td>
                    <td style={{ padding: '8px', borderBottom: '1px solid #e2e8f0' }}>{order.orderTag}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {orders.length === 0 && (
              <Box textAlign="center" py={8}>
                <Text color="gray.500">No orders found</Text>
              </Box>
            )}
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default OrdersView;