import React, { useState } from 'react';
import { Card, Grid, Field, Select, Switch, Button, Text, Badge, createListCollection } from '@chakra-ui/react';
import { Save, Settings, TrendingUp } from 'lucide-react';
import { useToast } from '../common/ToastProvider';

interface TradingPreferencesData {
  riskTolerance: string;
  investmentGoals: string[];
  tradingExperience: string;
  preferredBrokers: string[];
  autoTradingEnabled: boolean;
  notificationsEnabled: boolean;
}

interface TradingPreferencesProps {
  data: TradingPreferencesData;
}

export const TradingPreferences: React.FC<TradingPreferencesProps> = ({ data }) => {
  const [formData, setFormData] = useState(data);
  const [hasChanges, setHasChanges] = useState(false);
  const { showToast } = useToast();

  const riskToleranceOptions = [
    { value: 'CONSERVATIVE', label: 'Conservative - Low risk, stable returns' },
    { value: 'MODERATE', label: 'Moderate - Balanced risk and return' },
    { value: 'AGGRESSIVE', label: 'Aggressive - High risk, high potential return' },
    { value: 'VERY_AGGRESSIVE', label: 'Very Aggressive - Maximum risk tolerance' }
  ];

  const experienceOptions = [
    { value: 'BEGINNER', label: 'Beginner - Less than 1 year' },
    { value: 'INTERMEDIATE', label: 'Intermediate - 1-5 years' },
    { value: 'ADVANCED', label: 'Advanced - 5-10 years' },
    { value: 'EXPERT', label: 'Expert - More than 10 years' }
  ];

  const investmentGoalOptions = [
    { value: 'WEALTH_BUILDING', label: 'Wealth Building' },
    { value: 'INCOME_GENERATION', label: 'Income Generation' },
    { value: 'CAPITAL_PRESERVATION', label: 'Capital Preservation' },
    { value: 'SPECULATION', label: 'Speculation' },
    { value: 'RETIREMENT', label: 'Retirement Planning' }
  ];

  const brokerOptions = [
    { value: 'FYERS', label: 'Fyers' },
    { value: 'ZERODHA', label: 'Zerodha' },
    { value: 'UPSTOX', label: 'Upstox' },
    { value: 'ANGEL_ONE', label: 'Angel One' },
    { value: 'ICICI_DIRECT', label: 'ICICI Direct' }
  ];

  const handleSave = () => {
    showToast({
      type: 'success',
      title: 'Preferences Updated',
      message: 'Your trading preferences have been saved successfully.'
    });
    setHasChanges(false);
  };

  const handleFieldChange = (field: keyof TradingPreferencesData, value: string | string[] | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'CONSERVATIVE': return 'success';
      case 'MODERATE': return 'warning';
      case 'AGGRESSIVE': return 'orange';
      case 'VERY_AGGRESSIVE': return 'danger';
      default: return 'neutral';
    }
  };

  return (
    <div className="space-y-6">
      <Card.Root>
        <Card.Body>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Settings size={24} color="#3182ce" />
              <div>
                <Text className="text-lg font-semibold">Trading Preferences</Text>
                <Text className="text-sm text-neutral-600">
                  Configure your trading style and risk preferences
                </Text>
              </div>
            </div>
            
            {hasChanges && (
              <Button colorPalette="brand" onClick={handleSave}>
                <Save size={16} />
                Save Changes
              </Button>
            )}
          </div>

          <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={6}>
            <Field.Root>
              <Field.Label>Risk Tolerance</Field.Label>
              <Select.Root 
                collection={createListCollection({ items: riskToleranceOptions })}
                value={[formData.riskTolerance]} 
                onValueChange={(e) => handleFieldChange('riskTolerance', e.value[0])}
              >
                <Select.Trigger>
                  <Select.ValueText />
                </Select.Trigger>
                <Select.Content>
                  {riskToleranceOptions.map(option => (
                    <Select.Item key={option.value} item={option}>
                      {option.label}
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select.Root>
              <Field.HelperText>
                Current: <Badge colorPalette={getRiskColor(formData.riskTolerance)} variant="subtle">
                  {formData.riskTolerance}
                </Badge>
              </Field.HelperText>
            </Field.Root>

            <Field.Root>
              <Field.Label>Trading Experience</Field.Label>
              <Select.Root 
                collection={createListCollection({ items: experienceOptions })}
                value={[formData.tradingExperience]} 
                onValueChange={(e) => handleFieldChange('tradingExperience', e.value[0])}
              >
                <Select.Trigger>
                  <Select.ValueText />
                </Select.Trigger>
                <Select.Content>
                  {experienceOptions.map(option => (
                    <Select.Item key={option.value} item={option}>
                      {option.label}
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select.Root>
            </Field.Root>

            <div className="md:col-span-2">
              <Field.Root>
                <Field.Label>Investment Goals</Field.Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {investmentGoalOptions.map(goal => (
                    <Badge
                      key={goal.value}
                      colorPalette={formData.investmentGoals.includes(goal.value) ? 'brand' : 'neutral'}
                      variant={formData.investmentGoals.includes(goal.value) ? 'solid' : 'outline'}
                      className="cursor-pointer"
                      onClick={() => {
                        const newGoals = formData.investmentGoals.includes(goal.value)
                          ? formData.investmentGoals.filter(g => g !== goal.value)
                          : [...formData.investmentGoals, goal.value];
                        handleFieldChange('investmentGoals', newGoals);
                      }}
                    >
                      {goal.label}
                    </Badge>
                  ))}
                </div>
                <Field.HelperText>
                  Click to select/deselect investment goals
                </Field.HelperText>
              </Field.Root>
            </div>

            <div className="md:col-span-2">
              <Field.Root>
                <Field.Label>Preferred Brokers</Field.Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {brokerOptions.map(broker => (
                    <Badge
                      key={broker.value}
                      colorPalette={formData.preferredBrokers.includes(broker.value) ? 'ai' : 'neutral'}
                      variant={formData.preferredBrokers.includes(broker.value) ? 'solid' : 'outline'}
                      className="cursor-pointer"
                      onClick={() => {
                        const newBrokers = formData.preferredBrokers.includes(broker.value)
                          ? formData.preferredBrokers.filter(b => b !== broker.value)
                          : [...formData.preferredBrokers, broker.value];
                        handleFieldChange('preferredBrokers', newBrokers);
                      }}
                    >
                      {broker.label}
                    </Badge>
                  ))}
                </div>
                <Field.HelperText>
                  Select your preferred trading platforms
                </Field.HelperText>
              </Field.Root>
            </div>
          </Grid>
        </Card.Body>
      </Card.Root>

      {/* Automation Settings */}
      <Card.Root>
        <Card.Body>
          <div className="flex items-center gap-3 mb-6">
            <TrendingUp size={24} color="#3182ce" />
            <div>
              <Text className="text-lg font-semibold">Automation Settings</Text>
              <Text className="text-sm text-neutral-600">
                Configure automated trading and notification preferences
              </Text>
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-lg">
              <div>
                <Text className="font-medium">Auto Trading</Text>
                <Text className="text-sm text-neutral-600">
                  Enable AI-powered automated trading based on your preferences
                </Text>
              </div>
              <Switch.Root
                checked={formData.autoTradingEnabled}
                onCheckedChange={(details) => handleFieldChange('autoTradingEnabled', details.checked)}
              >
                <Switch.Control>
                  <Switch.Thumb />
                </Switch.Control>
              </Switch.Root>
            </div>

            <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-lg">
              <div>
                <Text className="font-medium">Trading Notifications</Text>
                <Text className="text-sm text-neutral-600">
                  Receive alerts for trading opportunities and market updates
                </Text>
              </div>
              <Switch.Root
                checked={formData.notificationsEnabled}
                onCheckedChange={(details) => handleFieldChange('notificationsEnabled', details.checked)}
              >
                <Switch.Control>
                  <Switch.Thumb />
                </Switch.Control>
              </Switch.Root>
            </div>

            {formData.autoTradingEnabled && (
              <div className="p-4 bg-ai-50 border border-ai-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp size={16} color="#3182ce" />
                  <Text className="font-medium text-ai-800">Auto Trading Configuration</Text>
                </div>
                <div className="text-sm text-ai-700 space-y-1">
                  <div>• Maximum daily trading limit: $10,000</div>
                  <div>• Risk per trade: 2% of portfolio</div>
                  <div>• Stop loss: 5% below entry price</div>
                  <div>• Take profit: 10% above entry price</div>
                </div>
              </div>
            )}
          </div>
        </Card.Body>
      </Card.Root>
    </div>
  );
};