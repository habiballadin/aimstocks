import React, { useState } from 'react';
import {
  Popover,
  Text,
  Box,
  Flex,
  Stack,
  Badge,
  Button,
  IconButton
} from '@chakra-ui/react';
import { Bell, X, TrendingUp, AlertTriangle, Newspaper, Settings } from 'lucide-react';

interface Notification {
  id: string;
  type: 'price_alert' | 'news' | 'ai_signal' | 'order_update';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  priority: 'high' | 'medium' | 'low';
}

export const NotificationCenter: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'price_alert',
      title: 'Price Alert: RELIANCE',
      message: 'RELIANCE has crossed your target price of ₹2850',
      timestamp: '2025-01-27T11:30:00.000Z',
      read: false,
      priority: 'high'
    },
    {
      id: '2',
      type: 'ai_signal',
      title: 'AI Signal: Strong Buy',
      message: 'AI detected strong bullish signal for INFY with 85% confidence',
      timestamp: '2025-01-27T10:45:00.000Z',
      read: false,
      priority: 'high'
    },
    {
      id: '3',
      type: 'news',
      title: 'Market News',
      message: 'RBI announces new monetary policy decisions',
      timestamp: '2025-01-27T09:15:00.000Z',
      read: false,
      priority: 'medium'
    },
    {
      id: '4',
      type: 'order_update',
      title: 'Order Executed',
      message: 'Your buy order for 10 shares of TCS has been executed',
      timestamp: '2025-01-27T08:30:00.000Z',
      read: true,
      priority: 'medium'
    }
  ]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const getHexColor = (chakraColor: string) => {
    switch (chakraColor) {
      case 'success.600': return '#38A169';
      case 'ai.600': return '#4A5568';
      case 'brand.600': return '#3182ce';
      case 'warning.600': return '#D69E2E';
      case 'danger.600': return '#E53E3E';
      case 'neutral.600': return '#4A5568';
      case 'neutral.400': return '#A0AEC0';
      default: return '#4A5568';
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'price_alert': return TrendingUp;
      case 'ai_signal': return AlertTriangle;
      case 'news': return Newspaper;
      case 'order_update': return Settings;
      default: return Bell;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'price_alert': return 'success.600';
      case 'ai_signal': return 'ai.600';
      case 'news': return 'brand.600';
      case 'order_update': return 'warning.600';
      default: return 'neutral.600';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'red';
      case 'medium': return 'yellow';
      case 'low': return 'green';
      default: return 'gray';
    }
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <Box position="relative">
          <IconButton variant="ghost" size="sm">
            <Bell size={20} color={getHexColor('neutral.600')} />
          </IconButton>
          {unreadCount > 0 && (
            <Badge 
              position="absolute" 
              top="-1" 
              right="-1" 
              colorPalette="red"
              size="sm"
            >
              {unreadCount}
            </Badge>
          )}
        </Box>
      </Popover.Trigger>

      <Popover.Content w="400px" maxH="500px">
        <Box p={4}>
          <Flex justify="space-between" align="center" mb={4}>
            <Text textStyle="heading.sm" color="neutral.900">
              Notifications
            </Text>
            {unreadCount > 0 && (
              <Button variant="ghost" size="sm" onClick={markAllAsRead}>
                Mark all read
              </Button>
            )}
          </Flex>

          <Stack gap={3} maxH="350px" overflowY="auto">
            {notifications.length === 0 ? (
              <Box textAlign="center" py={8}>
                <Bell size={32} color={getHexColor('neutral.400')} style={{ marginBottom: '0.5rem' }} />
                <Text color="neutral.600" fontSize="sm">
                  No notifications yet
                </Text>
              </Box>
            ) : (
              notifications.map((notification) => (
                <Box
                  key={notification.id}
                  p={3}
                  bg={notification.read ? 'neutral.50' : 'brand.50'}
                  borderRadius="md"
                  border="1px solid"
                  borderColor={notification.read ? 'neutral.200' : 'brand.200'}
                  cursor="pointer"
                  onClick={() => markAsRead(notification.id)}
                  _hover={{ borderColor: 'brand.300' }}
                >
                  <Flex justify="space-between" align="flex-start" mb={2}>
                    <Flex align="center" gap={2}>
                      {React.createElement(getNotificationIcon(notification.type), { size: 16, color: getHexColor(getNotificationColor(notification.type)) })}
                      <Text fontWeight="semibold" fontSize="sm" color="neutral.900">
                        {notification.title}
                      </Text>
                      <Badge 
                        colorPalette={getPriorityColor(notification.priority)} 
                        size="sm"
                        variant="outline"
                      >
                        {notification.priority}
                      </Badge>
                    </Flex>
                    <IconButton
                      variant="ghost"
                      size="sm"
                      p={1}
                      onClick={(e) => {
                        e.stopPropagation();
                        removeNotification(notification.id);
                      }}
                    >
                      <X size={12} color={getHexColor('neutral.400')} />
                    </IconButton>
                  </Flex>
                  
                  <Text fontSize="sm" color="neutral.700" mb={2}>
                    {notification.message}
                  </Text>
                  
                  <Text fontSize="xs" color="neutral.500">
                    {new Date(notification.timestamp).toLocaleString()}
                  </Text>
                </Box>
              ))
            )}
          </Stack>

          {notifications.length > 0 && (
            <Box mt={4} pt={3} borderTop="1px solid" borderColor="neutral.200">
              <Button variant="outline" size="sm" w="full">
                View All Notifications
              </Button>
            </Box>
          )}
        </Box>
      </Popover.Content>
    </Popover.Root>
  );
};