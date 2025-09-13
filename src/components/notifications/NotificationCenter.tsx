import React, { useState } from 'react';
import { Box, Tabs, Heading, Icon, Badge } from '@chakra-ui/react';
import { Bell } from 'lucide-react';
import { NotificationList } from './NotificationList';
import { NotificationPreferences } from './NotificationPreferences';
import { mockNotifications } from '../../data/optionsAndAnalyticsMockData';

export const NotificationCenter: React.FC = () => {
  const [activeTab, setActiveTab] = useState('notifications');
  const unreadCount = mockNotifications.filter(n => !n.read).length;

  return (
    <Box className="p-6 min-h-screen bg-neutral-50">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="relative">
            <Icon color="brand.600">
              <Bell size={28} />
            </Icon>
            {unreadCount > 0 && (
              <Badge 
                colorPalette="danger" 
                variant="solid" 
                className="absolute -top-2 -right-2 min-w-6 h-6 flex items-center justify-center text-xs"
              >
                {unreadCount}
              </Badge>
            )}
          </div>
          <div>
            <Heading size="2xl" color="neutral.900">
              Notification Center
            </Heading>
            <div className="text-neutral-600">
              {unreadCount} unread notifications
            </div>
          </div>
        </div>

        {/* Main Content */}
        <Tabs.Root 
          value={activeTab} 
          onValueChange={(e) => setActiveTab(e.value)}
        >
          <Tabs.List className="mb-6 bg-white p-1 rounded-lg shadow-sm">
            <Tabs.Trigger value="notifications">
              Notifications
              {unreadCount > 0 && (
                <Badge colorPalette="danger" variant="solid" size="sm" className="ml-2">
                  {unreadCount}
                </Badge>
              )}
            </Tabs.Trigger>
            <Tabs.Trigger value="preferences">Preferences</Tabs.Trigger>
          </Tabs.List>

          <Tabs.Content value="notifications">
            <NotificationList 
              notifications={[...mockNotifications]}
            />
          </Tabs.Content>

          <Tabs.Content value="preferences">
            <NotificationPreferences />
          </Tabs.Content>
        </Tabs.Root>
      </div>
    </Box>
  );
};