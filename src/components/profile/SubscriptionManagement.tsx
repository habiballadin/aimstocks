import React from 'react';
import { Card, Grid, Text, Button, Badge, Progress } from '@chakra-ui/react';
import { Crown, CreditCard, Calendar, Check } from 'lucide-react';
import { useToast } from '../common/ToastProvider';

interface SubscriptionData {
  tier: string;
  status: string;
  renewalDate: string;
  features: string[];
}

interface SubscriptionManagementProps {
  data: SubscriptionData;
}

export const SubscriptionManagement: React.FC<SubscriptionManagementProps> = ({ data }) => {
  const { showToast } = useToast();

  const plans = [
    {
      name: 'Basic',
      price: '$9.99',
      period: 'month',
      features: [
        'Basic portfolio tracking',
        'Market data (15min delay)',
        'Email notifications',
        'Basic analytics'
      ],
      current: data.tier === 'BASIC'
    },
    {
      name: 'Pro',
      price: '$29.99',
      period: 'month',
      features: [
        'Real-time market data',
        'Advanced analytics',
        'AI predictions',
        'Options trading',
        'Push notifications',
        'Priority support'
      ],
      current: data.tier === 'PRO',
      popular: true
    },
    {
      name: 'Enterprise',
      price: '$99.99',
      period: 'month',
      features: [
        'Everything in Pro',
        'Institutional data feeds',
        'Advanced AI models',
        'Custom algorithms',
        'API access',
        'Dedicated support',
        'White-label options'
      ],
      current: data.tier === 'ENTERPRISE'
    }
  ];

  const handleUpgrade = (planName: string) => {
    showToast({
      type: 'info',
      title: 'Upgrade Initiated',
      message: `Upgrading to ${planName} plan. You will be redirected to payment.`
    });
  };

  const handleCancelSubscription = () => {
    showToast({
      type: 'warning',
      title: 'Cancellation Request',
      message: 'Your cancellation request has been submitted. Support will contact you soon.'
    });
  };

  return (
    <div className="space-y-6">
      {/* Current Subscription */}
      <Card.Root>
        <Card.Body>
          <div className="flex items-center gap-3 mb-6">
            <Crown size={24} color="#3182ce" />
            <div>
              <Text className="text-lg font-semibold">Current Subscription</Text>
              <Text className="text-sm text-neutral-600">
                Manage your subscription and billing details
              </Text>
            </div>
          </div>

          <Grid templateColumns={{ base: '1fr', md: 'repeat(3, 1fr)' }} gap={6}>
            <div className="p-4 bg-brand-50 border border-brand-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Crown size={16} color="#3182ce" />
                <Text className="font-medium">Current Plan</Text>
              </div>
              <Text className="text-2xl font-bold text-brand-600">{data.tier}</Text>
              <Badge colorPalette="success" variant="subtle" className="mt-2">
                {data.status}
              </Badge>
            </div>

            <div className="p-4 bg-neutral-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Calendar size={16} color="#718096" />
                <Text className="font-medium">Next Billing</Text>
              </div>
              <Text className="text-lg font-semibold">{data.renewalDate}</Text>
              <Text className="text-sm text-neutral-600 mt-1">Auto-renewal enabled</Text>
            </div>

            <div className="p-4 bg-neutral-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <CreditCard size={16} color="#718096" />
                <Text className="font-medium">Payment Method</Text>
              </div>
              <Text className="text-lg font-semibold">•••• 4242</Text>
              <Text className="text-sm text-neutral-600 mt-1">Visa ending in 4242</Text>
            </div>
          </Grid>

          {/* Usage Stats */}
          <div className="mt-6 p-4 bg-neutral-50 rounded-lg">
            <Text className="font-medium mb-4">Monthly Usage</Text>
            <Grid templateColumns={{ base: '1fr', md: 'repeat(3, 1fr)' }} gap={4}>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <Text className="text-sm">API Calls</Text>
                  <Text className="text-sm font-semibold">8,450 / 10,000</Text>
                </div>
                <Progress.Root value={84.5} max={100} colorPalette="blue">
                  <Progress.Track>
                    <Progress.Range />
                  </Progress.Track>
                </Progress.Root>
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <Text className="text-sm">AI Predictions</Text>
                  <Text className="text-sm font-semibold">156 / 200</Text>
                </div>
                <Progress.Root value={78} max={100} colorPalette="green">
                  <Progress.Track>
                    <Progress.Range />
                  </Progress.Track>
                </Progress.Root>
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <Text className="text-sm">Data Exports</Text>
                  <Text className="text-sm font-semibold">23 / 50</Text>
                </div>
                <Progress.Root value={46} max={100} colorPalette="orange">
                  <Progress.Track>
                    <Progress.Range />
                  </Progress.Track>
                </Progress.Root>
              </div>
            </Grid>
          </div>
        </Card.Body>
      </Card.Root>

      {/* Available Plans */}
      <div>
        <Text className="text-lg font-semibold mb-4">Available Plans</Text>
        <Grid templateColumns={{ base: '1fr', md: 'repeat(3, 1fr)' }} gap={6}>
          {plans.map((plan, index) => (
            <Card.Root 
              key={index}
              className={`relative ${plan.current ? 'border-brand-500 bg-brand-50' : ''} ${
                plan.popular ? 'border-ai-500' : ''
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge colorPalette="ai" variant="solid" className="px-3 py-1">
                    Most Popular
                  </Badge>
                </div>
              )}
              
              <Card.Body>
                <div className="text-center mb-4">
                  <Text className="text-xl font-bold">{plan.name}</Text>
                  <div className="mt-2">
                    <span className="text-3xl font-bold">{plan.price}</span>
                    <span className="text-neutral-600">/{plan.period}</span>
                  </div>
                </div>

                <div className="space-y-3 mb-6">
                  {plan.features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-center gap-2">
                      <Check size={16} color="#38a169" />
                      <Text className="text-sm">{feature}</Text>
                    </div>
                  ))}
                </div>

                <Button
                  colorPalette={plan.current ? 'neutral' : plan.popular ? 'ai' : 'brand'}
                  variant={plan.current ? 'outline' : 'solid'}
                  className="w-full"
                  disabled={plan.current}
                  onClick={() => handleUpgrade(plan.name)}
                >
                  {plan.current ? 'Current Plan' : `Upgrade to ${plan.name}`}
                </Button>
              </Card.Body>
            </Card.Root>
          ))}
        </Grid>
      </div>

      {/* Billing History */}
      <Card.Root>
        <Card.Body>
          <Text className="text-lg font-semibold mb-4">Billing History</Text>
          <div className="space-y-3">
            {[
              { date: '2023-12-01', amount: '$29.99', status: 'Paid', invoice: 'INV-001' },
              { date: '2023-11-01', amount: '$29.99', status: 'Paid', invoice: 'INV-002' },
              { date: '2023-10-01', amount: '$29.99', status: 'Paid', invoice: 'INV-003' }
            ].map((bill, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
                <div className="flex items-center gap-4">
                  <Check size={16} color="#38a169" />
                  <div>
                    <Text className="font-medium">{bill.invoice}</Text>
                    <Text className="text-sm text-neutral-600">{bill.date}</Text>
                  </div>
                </div>
                <div className="text-right">
                  <Text className="font-semibold">{bill.amount}</Text>
                  <Badge colorPalette="success" variant="subtle" size="sm">
                    {bill.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </Card.Body>
      </Card.Root>

      {/* Danger Zone */}
      <Card.Root className="border-danger-200">
        <Card.Body>
          <Text className="text-lg font-semibold text-danger-600 mb-4">Danger Zone</Text>
          <div className="flex items-center justify-between p-4 bg-danger-50 border border-danger-200 rounded-lg">
            <div>
              <Text className="font-medium text-danger-800">Cancel Subscription</Text>
              <Text className="text-sm text-danger-600">
                This will cancel your subscription at the end of the current billing period
              </Text>
            </div>
            <Button 
              colorPalette="danger" 
              variant="outline"
              onClick={handleCancelSubscription}
            >
              Cancel Subscription
            </Button>
          </div>
        </Card.Body>
      </Card.Root>
    </div>
  );
};