import React, { useState } from 'react';
import { Card, Grid, Input, Select, Button, Progress, Text, Heading, Flex, createListCollection } from '@chakra-ui/react';
import { SquareSigma, Calculator, TrendingUp, TrendingDown } from 'lucide-react';
import { formatGreek, formatCurrency } from '../../utils/formatters';

interface GreekValues {
  delta: number;
  gamma: number;
  theta: number;
  vega: number;
  rho: number;
}

export const GreeksCalculator: React.FC = () => {
  const [optionType, setOptionType] = useState('call');
  const [strike, setStrike] = useState('150');
  const [currentPrice, setCurrentPrice] = useState('185.50');
  const [timeToExpiry, setTimeToExpiry] = useState('15');
  const [volatility, setVolatility] = useState('28');
  const [riskFreeRate, setRiskFreeRate] = useState('5.25');

  const optionTypeOptions = createListCollection({
    items: [
      { value: 'call', label: 'Call Option' },
      { value: 'put', label: 'Put Option' }
    ]
  });

  // Mock calculated Greeks - in real app, this would call a pricing model
  const greeks: GreekValues = {
    delta: optionType === 'call' ? 0.6547 : -0.3453,
    gamma: 0.0234,
    theta: -0.1567,
    vega: 0.1823,
    rho: 0.0789
  };

  const getGreekColor = (greek: string, value: number) => {
    switch (greek) {
      case 'delta':
        return value > 0 ? 'success.600' : 'danger.600';
      case 'gamma':
        return 'ai.600';
      case 'theta':
        return value < 0 ? 'danger.600' : 'success.600';
      case 'vega':
        return 'warning.600';
      case 'rho':
        return value > 0 ? 'success.600' : 'danger.600';
      default:
        return 'neutral.600';
    }
  };

  const getGreekDescription = (greek: string) => {
    switch (greek) {
      case 'delta':
        return 'Price sensitivity to underlying movement';
      case 'gamma':
        return 'Rate of change of delta';
      case 'theta':
        return 'Time decay per day';
      case 'vega':
        return 'Sensitivity to volatility changes';
      case 'rho':
        return 'Sensitivity to interest rate changes';
      default:
        return '';
    }
  };

  const getGreekIcon = (greek: string, value: number) => {
    if (greek === 'delta') {
      return value > 0 ? <TrendingUp size={24} /> : <TrendingDown size={24} />;
    }
    return <SquareSigma size={24} />;
  };

  const GreekCard: React.FC<{ greek: string; value: number; label: string }> = ({ greek, value, label }) => (
    <Card.Root className="text-center">
      <Card.Body>
        <div className="flex items-center justify-center mb-3">
          <div style={{ color: getGreekColor(greek, value) }}>
            {getGreekIcon(greek, value)}
          </div>
        </div>
        <Heading size="sm" className="mb-1">{label}</Heading>
        <Text 
          className="text-2xl font-bold mb-2"
          style={{ color: getGreekColor(greek, value) }}
        >
          {formatGreek(value, greek)}
        </Text>
        <Text className="text-xs text-neutral-600">
          {getGreekDescription(greek)}
        </Text>
        
        {/* Visual indicator */}
        <div className="mt-3">
          <Progress.Root 
            value={Math.abs(value) * 100} 
            max={100}
            size="sm"
            colorPalette={value > 0 ? 'green' : 'red'}
          >
            <Progress.Track>
              <Progress.Range />
            </Progress.Track>
          </Progress.Root>
        </div>
      </Card.Body>
    </Card.Root>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Calculator size={24} color="#3182ce" />
        <Heading size="lg">Greeks Calculator</Heading>
      </div>

      <Grid templateColumns={{ base: '1fr', lg: '1fr 2fr' }} gap={6}>
        {/* Input Parameters */}
        <Card.Root>
          <Card.Body>
            <Heading size="md" className="mb-4">Option Parameters</Heading>
            
            <div className="space-y-4">
              <div>
                <Text className="text-sm font-medium mb-2">Option Type</Text>
                <Select.Root collection={optionTypeOptions} value={[optionType]} onValueChange={(e) => setOptionType(e.value[0])}>
                  <Select.Trigger>
                    <Select.ValueText />
                  </Select.Trigger>
                  <Select.Content>
                    {optionTypeOptions.items.map((option) => (
                      <Select.Item key={option.value} item={option}>
                        {option.label}
                      </Select.Item>
                    ))}
                  </Select.Content>
                </Select.Root>
              </div>

              <div>
                <Text className="text-sm font-medium mb-2">Strike Price</Text>
                <Input
                  value={strike}
                  onChange={(e) => setStrike(e.target.value)}
                  placeholder={formatCurrency(150.00)}
                />
              </div>

              <div>
                <Text className="text-sm font-medium mb-2">Current Price</Text>
                <Input
                  value={currentPrice}
                  onChange={(e) => setCurrentPrice(e.target.value)}
                  placeholder={formatCurrency(185.50)}
                />
              </div>

              <div>
                <Text className="text-sm font-medium mb-2">Days to Expiry</Text>
                <Input
                  value={timeToExpiry}
                  onChange={(e) => setTimeToExpiry(e.target.value)}
                  placeholder="15"
                />
              </div>

              <div>
                <Text className="text-sm font-medium mb-2">Implied Volatility (%)</Text>
                <Input
                  value={volatility}
                  onChange={(e) => setVolatility(e.target.value)}
                  placeholder="28"
                />
              </div>

              <div>
                <Text className="text-sm font-medium mb-2">Risk-Free Rate (%)</Text>
                <Input
                  value={riskFreeRate}
                  onChange={(e) => setRiskFreeRate(e.target.value)}
                  placeholder="5.25"
                />
              </div>

              <Button colorPalette="brand" className="w-full mt-4">
                <Calculator size={16} />
                Calculate Greeks
              </Button>
            </div>
          </Card.Body>
        </Card.Root>

        {/* Greeks Display */}
        <div className="space-y-6">
          {/* Greeks Grid */}
          <Grid templateColumns={{ base: '1fr', md: 'repeat(3, 1fr)' }} gap={4}>
            <div className="md:col-span-3">
              <Grid templateColumns="repeat(2, 1fr)" gap={4}>
                <GreekCard greek="delta" value={greeks.delta} label="Delta (Δ)" />
                <GreekCard greek="gamma" value={greeks.gamma} label="Gamma (Γ)" />
              </Grid>
            </div>
            <GreekCard greek="theta" value={greeks.theta} label="Theta (Θ)" />
            <GreekCard greek="vega" value={greeks.vega} label="Vega (ν)" />
            <GreekCard greek="rho" value={greeks.rho} label="Rho (ρ)" />
          </Grid>

          {/* Scenario Analysis */}
          <Card.Root>
            <Card.Body>
              <Heading size="md" className="mb-4">Scenario Analysis</Heading>
              
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div className="font-medium">Scenario</div>
                  <div className="font-medium">Price Change</div>
                  <div className="font-medium">Option P&L</div>
                </div>
                
                {[
                  { scenario: '+5% Stock Move', change: 9.28, pnl: 6.07, positive: true },
                  { scenario: '+2% Stock Move', change: 3.71, pnl: 2.43, positive: true },
                  { scenario: 'No Change', change: 0.00, pnl: -0.16, positive: false },
                  { scenario: '-2% Stock Move', change: -3.71, pnl: -2.59, positive: false },
                  { scenario: '-5% Stock Move', change: -9.28, pnl: -6.35, positive: false }
                ].map((item, index) => (
                  <div key={index} className="grid grid-cols-3 gap-4 py-2 border-b border-neutral-100 last:border-b-0">
                    <div className="text-sm">{item.scenario}</div>
                    <div className="text-sm font-mono">
                      <Flex align="center" gap={1}>
                        <div style={{ color: item.change >= 0 ? '#38a169' : '#e53e3e' }}>
                          {item.change >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                        </div>
                        {formatCurrency(Math.abs(item.change))}
                      </Flex>
                    </div>
                    <div className={`text-sm font-mono font-semibold ${item.positive ? 'text-success-600' : 'text-danger-600'}`}>
                      <Flex align="center" gap={1}>
                        <div style={{ color: item.positive ? '#38a169' : '#e53e3e' }}>
                          {item.positive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                        </div>
                        {formatCurrency(Math.abs(item.pnl))}
                      </Flex>
                    </div>
                  </div>
                ))}
              </div>
            </Card.Body>
          </Card.Root>
        </div>
      </Grid>
    </div>
  );
};