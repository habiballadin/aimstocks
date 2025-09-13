import React, { useState } from 'react';
import { Card, Grid, Field, Button, Text, Switch, Badge, Input } from '@chakra-ui/react';
import { Shield, Key, Smartphone, Eye, EyeOff } from 'lucide-react';
import { useToast } from '../common/ToastProvider';

export const SecuritySettings: React.FC = () => {
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [loginAlerts, setLoginAlerts] = useState(true);
  const { showToast } = useToast();

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handlePasswordChange = () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      showToast({
        type: 'error',
        title: 'Password Mismatch',
        message: 'New password and confirmation do not match.'
      });
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      showToast({
        type: 'error',
        title: 'Weak Password',
        message: 'Password must be at least 8 characters long.'
      });
      return;
    }

    showToast({
      type: 'success',
      title: 'Password Updated',
      message: 'Your password has been changed successfully.'
    });

    setPasswordForm({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
  };

  const handleTwoFactorToggle = (details: { checked: boolean }) => {
    const enabled = details.checked;
    setTwoFactorEnabled(enabled);
    showToast({
      type: enabled ? 'success' : 'warning',
      title: enabled ? '2FA Enabled' : '2FA Disabled',
      message: enabled 
        ? 'Two-factor authentication has been enabled for your account.'
        : 'Two-factor authentication has been disabled. Your account is less secure.'
    });
  };

  return (
    <div className="space-y-6">
      {/* Password Change */}
      <Card.Root>
        <Card.Body>
          <div className="flex items-center gap-3 mb-6">
            <Key size={24} color="#3182ce" />
            <div>
              <Text className="text-lg font-semibold">Change Password</Text>
              <Text className="text-sm text-neutral-600">
                Update your password to keep your account secure
              </Text>
            </div>
          </div>

          <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={6}>
            <div className="md:col-span-2">
              <Field.Root required>
                <Field.Label>Current Password</Field.Label>
                <div className="relative">
                  <Input
                    type={showCurrentPassword ? 'text' : 'password'}
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                    placeholder="Enter current password"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  >
                    {showCurrentPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </Button>
                </div>
              </Field.Root>
            </div>

            <Field.Root required>
              <Field.Label>New Password</Field.Label>
              <div className="relative">
                <Input
                  type={showNewPassword ? 'text' : 'password'}
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                  placeholder="Enter new password"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                >
                  {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </Button>
              </div>
              <Field.HelperText>
                Password must be at least 8 characters long
              </Field.HelperText>
            </Field.Root>

            <Field.Root required>
              <Field.Label>Confirm New Password</Field.Label>
              <Input
                type="password"
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                placeholder="Confirm new password"
              />
            </Field.Root>

            <div className="md:col-span-2">
              <Button 
                colorPalette="brand" 
                onClick={handlePasswordChange}
                disabled={!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword}
              >
                Update Password
              </Button>
            </div>
          </Grid>
        </Card.Body>
      </Card.Root>

      {/* Two-Factor Authentication */}
      <Card.Root>
        <Card.Body>
          <div className="flex items-center gap-3 mb-6">
            <Smartphone size={24} color="#38a169" />
            <div>
              <Text className="text-lg font-semibold">Two-Factor Authentication</Text>
              <Text className="text-sm text-neutral-600">
                Add an extra layer of security to your account
              </Text>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-lg">
              <div>
                <Text className="font-medium">SMS Authentication</Text>
                <Text className="text-sm text-neutral-600">
                  Receive verification codes via SMS
                </Text>
                <div className="mt-2">
                  <Badge colorPalette={twoFactorEnabled ? 'success' : 'neutral'} variant="subtle">
                    {twoFactorEnabled ? 'Enabled' : 'Disabled'}
                  </Badge>
                </div>
              </div>
              <Switch.Root
                checked={twoFactorEnabled}
                onCheckedChange={handleTwoFactorToggle}
              >
                <Switch.Control>
                  <Switch.Thumb />
                </Switch.Control>
              </Switch.Root>
            </div>

            {twoFactorEnabled && (
              <div className="p-4 bg-success-50 border border-success-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Shield size={16} color="#38a169" />
                  <Text className="font-medium text-success-800">2FA Configuration</Text>
                </div>
                <div className="text-sm text-success-700 space-y-1">
                  <div>• Phone number: +1-555-0123</div>
                  <div>• Backup codes: 8 remaining</div>
                  <div>• Last used: 2 days ago</div>
                </div>
                <div className="mt-3 flex gap-2">
                  <Button size="sm" variant="outline" colorPalette="success">
                    Update Phone
                  </Button>
                  <Button size="sm" variant="outline" colorPalette="success">
                    Generate Backup Codes
                  </Button>
                </div>
              </div>
            )}
          </div>
        </Card.Body>
      </Card.Root>

      {/* Security Preferences */}
      <Card.Root>
        <Card.Body>
          <div className="flex items-center gap-3 mb-6">
            <Shield size={24} color="#d69e2e" />
            <div>
              <Text className="text-lg font-semibold">Security Preferences</Text>
              <Text className="text-sm text-neutral-600">
                Configure security notifications and alerts
              </Text>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-lg">
              <div>
                <Text className="font-medium">Email Security Notifications</Text>
                <Text className="text-sm text-neutral-600">
                  Get notified about important security events
                </Text>
              </div>
              <Switch.Root
                checked={emailNotifications}
                onCheckedChange={(details) => setEmailNotifications(details.checked)}
              >
                <Switch.Control>
                  <Switch.Thumb />
                </Switch.Control>
              </Switch.Root>
            </div>

            <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-lg">
              <div>
                <Text className="font-medium">Login Alerts</Text>
                <Text className="text-sm text-neutral-600">
                  Get alerted when someone logs into your account
                </Text>
              </div>
              <Switch.Root
                checked={loginAlerts}
                onCheckedChange={(details) => setLoginAlerts(details.checked)}
              >
                <Switch.Control>
                  <Switch.Thumb />
                </Switch.Control>
              </Switch.Root>
            </div>
          </div>
        </Card.Body>
      </Card.Root>

      {/* Recent Activity */}
      <Card.Root>
        <Card.Body>
          <Text className="text-lg font-semibold mb-4">Recent Security Activity</Text>
          <div className="space-y-3">
            {[
              { 
                action: 'Password changed', 
                time: '2 hours ago', 
                location: 'New York, US',
                status: 'success'
              },
              { 
                action: 'Login from new device', 
                time: '1 day ago', 
                location: 'San Francisco, US',
                status: 'warning'
              },
              { 
                action: '2FA enabled', 
                time: '3 days ago', 
                location: 'New York, US',
                status: 'success'
              }
            ].map((activity, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Shield size={16} color={activity.status === 'success' ? '#38a169' : '#d69e2e'} />
                  <div>
                    <Text className="font-medium">{activity.action}</Text>
                    <Text className="text-sm text-neutral-600">{activity.location}</Text>
                  </div>
                </div>
                <Text className="text-sm text-neutral-600">{activity.time}</Text>
              </div>
            ))}
          </div>
        </Card.Body>
      </Card.Root>
    </div>
  );
};