import React, { useState } from 'react';
import { Card, Grid, Text, Switch, Button, Icon, Field } from '@chakra-ui/react';
import { Bell, Mail, Smartphone, Save } from 'lucide-react';
import { useToast } from '../common/ToastProvider';

export const NotificationPreferences: React.FC = () => {
  const [preferences, setPreferences] = useState({
    pushEnabled: true,
    emailEnabled: true,
    smsEnabled: false,
    tradingAlerts: true,
    marketAlerts: true,
    portfolioAlerts: true,
    systemAlerts: true,
    securityAlerts: true,
    socialAlerts: false,
    quietHours: {
      enabled: true,
      start: '22:00',
      end: '08:00'
    }
  });

  const { showToast } = useToast();

  const handleSave = () => {
    showToast({
      type: 'success',
      title: 'Preferences Saved',
      message: 'Your notification preferences have been updated successfully.'
    });
  };

  const handleToggle = (key: string, value: boolean) => {
    setPreferences(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleQuietHoursToggle = (enabled: boolean) => {
    setPreferences(prev => ({
      ...prev,
      quietHours: {
        ...prev.quietHours,
        enabled
      }
    }));
  };

  const handleQuietHoursChange = (field: 'start' | 'end', value: string) => {
    setPreferences(prev => ({
      ...prev,
      quietHours: {
        ...prev.quietHours,
        [field]: value
      }
    }));
  };

  return (
    <div className="space-y-6">
      {/* Delivery Methods */}
      <Card.Root>
        <Card.Body>
          <div className="flex items-center gap-3 mb-6">
            <Icon as={Bell} color="brand.600" boxSize={24} />
            <div>
              <Text className="text-lg font-semibold">Delivery Methods</Text>
              <Text className="text-sm text-neutral-600">
                Choose how you want to receive notifications
              </Text>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-lg">
              <div className="flex items-center gap-3">
                <Icon as={Bell} color="brand.600" boxSize={20} />
                <div>
                  <Text className="font-medium">Push Notifications</Text>
                  <Text className="text-sm text-neutral-600">
                    Receive notifications in your browser or mobile app
                  </Text>
                </div>
              </div>
              <Switch.Root
                checked={preferences.pushEnabled}
                onCheckedChange={(details) => handleToggle('pushEnabled', details.checked)}
              >
                <Switch.Control>
                  <Switch.Thumb />
                </Switch.Control>
              </Switch.Root>
            </div>

            <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-lg">
              <div className="flex items-center gap-3">
                <Icon as={Mail} color="brand.600" boxSize={20} />
                <div>
                  <Text className="font-medium">Email Notifications</Text>
                  <Text className="text-sm text-neutral-600">
                    Get important updates via email
                  </Text>
                </div>
              </div>
              <Switch.Root
                checked={preferences.emailEnabled}
                onCheckedChange={(details) => handleToggle('emailEnabled', details.checked)}
              >
                <Switch.Control>
                  <Switch.Thumb />
                </Switch.Control>
              </Switch.Root>
            </div>

            <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-lg">
              <div className="flex items-center gap-3">
                <Icon as={Smartphone} color="brand.600" boxSize={20} />
                <div>
                  <Text className="font-medium">SMS Notifications</Text>
                  <Text className="text-sm text-neutral-600">
                    Receive critical alerts via text message
                  </Text>
                </div>
              </div>
              <Switch.Root
                checked={preferences.smsEnabled}
                onCheckedChange={(details) => handleToggle('smsEnabled', details.checked)}
              >
                <Switch.Control>
                  <Switch.Thumb />
                </Switch.Control>
              </Switch.Root>
            </div>
          </div>
        </Card.Body>
      </Card.Root>

      {/* Notification Categories */}
      <Card.Root>
        <Card.Body>
          <Text className="text-lg font-semibold mb-6">Notification Categories</Text>
          
          <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={4}>
            <div className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
              <div>
                <Text className="font-medium">Trading Alerts</Text>
                <Text className="text-sm text-neutral-600">Order executions, fills, rejections</Text>
              </div>
              <Switch.Root
                checked={preferences.tradingAlerts}
                onCheckedChange={(details) => handleToggle('tradingAlerts', details.checked)}
              >
                <Switch.Control>
                  <Switch.Thumb />
                </Switch.Control>
              </Switch.Root>
            </div>

            <div className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
              <div>
                <Text className="font-medium">Market Alerts</Text>
                <Text className="text-sm text-neutral-600">Price movements, market news</Text>
              </div>
              <Switch.Root
                checked={preferences.marketAlerts}
                onCheckedChange={(details) => handleToggle('marketAlerts', details.checked)}
              >
                <Switch.Control>
                  <Switch.Thumb />
                </Switch.Control>
              </Switch.Root>
            </div>

            <div className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
              <div>
                <Text className="font-medium">Portfolio Alerts</Text>
                <Text className="text-sm text-neutral-600">Performance, risk warnings</Text>
              </div>
              <Switch.Root
                checked={preferences.portfolioAlerts}
                onCheckedChange={(details) => handleToggle('portfolioAlerts', details.checked)}
              >
                <Switch.Control>
                  <Switch.Thumb />
                </Switch.Control>
              </Switch.Root>
            </div>

            <div className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
              <div>
                <Text className="font-medium">System Alerts</Text>
                <Text className="text-sm text-neutral-600">Maintenance, updates, outages</Text>
              </div>
              <Switch.Root
                checked={preferences.systemAlerts}
                onCheckedChange={(details) => handleToggle('systemAlerts', details.checked)}
              >
                <Switch.Control>
                  <Switch.Thumb />
                </Switch.Control>
              </Switch.Root>
            </div>

            <div className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
              <div>
                <Text className="font-medium">Security Alerts</Text>
                <Text className="text-sm text-neutral-600">Login attempts, password changes</Text>
              </div>
              <Switch.Root
                checked={preferences.securityAlerts}
                onCheckedChange={(details) => handleToggle('securityAlerts', details.checked)}
              >
                <Switch.Control>
                  <Switch.Thumb />
                </Switch.Control>
              </Switch.Root>
            </div>

            <div className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
              <div>
                <Text className="font-medium">Social Alerts</Text>
                <Text className="text-sm text-neutral-600">Community posts, mentions</Text>
              </div>
              <Switch.Root
                checked={preferences.socialAlerts}
                onCheckedChange={(details) => handleToggle('socialAlerts', details.checked)}
              >
                <Switch.Control>
                  <Switch.Thumb />
                </Switch.Control>
              </Switch.Root>
            </div>
          </Grid>
        </Card.Body>
      </Card.Root>

      {/* Quiet Hours */}
      <Card.Root>
        <Card.Body>
          <Text className="text-lg font-semibold mb-6">Quiet Hours</Text>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-lg">
              <div>
                <Text className="font-medium">Enable Quiet Hours</Text>
                <Text className="text-sm text-neutral-600">
                  Pause non-critical notifications during specified hours
                </Text>
              </div>
              <Switch.Root
                checked={preferences.quietHours.enabled}
                onCheckedChange={(details) => handleQuietHoursToggle(details.checked)}
              >
                <Switch.Control>
                  <Switch.Thumb />
                </Switch.Control>
              </Switch.Root>
            </div>

            {preferences.quietHours.enabled && (
              <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={4}>
                <Field.Root>
                  <Field.Label>Start Time</Field.Label>
                  <input
                    type="time"
                    value={preferences.quietHours.start}
                    onChange={(e) => handleQuietHoursChange('start', e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </Field.Root>

                <Field.Root>
                  <Field.Label>End Time</Field.Label>
                  <input
                    type="time"
                    value={preferences.quietHours.end}
                    onChange={(e) => handleQuietHoursChange('end', e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </Field.Root>
              </Grid>
            )}
          </div>
        </Card.Body>
      </Card.Root>

      {/* Save Button */}
      <div className="flex justify-end">
          <Button colorPalette="brand" onClick={handleSave}>
            <Icon as={Save} boxSize={16} />
            Save Preferences
          </Button>
      </div>
    </div>
  );
};