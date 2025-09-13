import React, { useState } from 'react';
import { Card, Grid, Select, Button, Badge, Table, Text, Heading, createListCollection } from '@chakra-ui/react';
import { LayoutGrid, Plus, Trash2, BarChart3 } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

interface StrategyLeg {
  id: string;
  type: 'call' | 'put';
  action: 'buy' | 'sell';
  strike: number;
  quantity: number;
  premium: number;
}

const STRATEGY_TEMPLATES = createListCollection({
  items: [
    { value: 'long_call', label: 'Long Call', description: 'Bullish strategy with unlimited upside' },
    { value: 'long_put', label: 'Long Put', description: 'Bearish strategy with high downside potential' },
    { value: 'covered_call', label: 'Covered Call', description: 'Income generation on existing stock position' },
    { value: 'bull_call_spread', label: 'Bull Call Spread', description: 'Limited risk bullish strategy' },
    { value: 'bear_put_spread', label: 'Bear Put Spread', description: 'Limited risk bearish strategy' },
    { value: 'iron_condor', label: 'Iron Condor', description: 'Neutral strategy for range-bound markets' },
    { value: 'straddle', label: 'Long Straddle', description: 'High volatility play' },
    { value: 'strangle', label: 'Long Strangle', description: 'Lower cost volatility play' }
  ]
});

export const StrategyBuilder: React.FC = () => {
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [legs, setLegs] = useState<StrategyLeg[]>([]);
  const [showPayoffChart, setShowPayoffChart] = useState(false);

  const addLeg = () => {
    const newLeg: StrategyLeg = {
      id: Math.random().toString(36).substr(2, 9),
      type: 'call',
      action: 'buy',
      strike: 150,
      quantity: 1,
      premium: 5.25
    };
    setLegs([...legs, newLeg]);
  };

  const removeLeg = (id: string) => {
    setLegs(legs.filter(leg => leg.id !== id));
  };



  const loadTemplate = (template: string) => {
    let newLegs: StrategyLeg[] = [];
    
    switch (template) {
      case 'long_call':
        newLegs = [{
          id: '1', type: 'call', action: 'buy', strike: 150, quantity: 1, premium: 5.25
        }];
        break;
      case 'bull_call_spread':
        newLegs = [
          { id: '1', type: 'call', action: 'buy', strike: 150, quantity: 1, premium: 5.25 },
          { id: '2', type: 'call', action: 'sell', strike: 155, quantity: 1, premium: 3.80 }
        ];
        break;
      case 'iron_condor':
        newLegs = [
          { id: '1', type: 'put', action: 'sell', strike: 145, quantity: 1, premium: 1.50 },
          { id: '2', type: 'put', action: 'buy', strike: 140, quantity: 1, premium: 0.75 },
          { id: '3', type: 'call', action: 'sell', strike: 160, quantity: 1, premium: 2.25 },
          { id: '4', type: 'call', action: 'buy', strike: 165, quantity: 1, premium: 1.10 }
        ];
        break;
      case 'straddle':
        newLegs = [
          { id: '1', type: 'call', action: 'buy', strike: 150, quantity: 1, premium: 5.25 },
          { id: '2', type: 'put', action: 'buy', strike: 150, quantity: 1, premium: 2.15 }
        ];
        break;
    }
    
    setLegs(newLegs);
  };

  const calculateNetPremium = () => {
    return legs.reduce((total, leg) => {
      const premium = leg.action === 'buy' ? -leg.premium : leg.premium;
      return total + (premium * leg.quantity);
    }, 0);
  };

  const calculateMaxProfit = () => {
    // Simplified calculation - in real app would be more complex
    const netPremium = calculateNetPremium();
    if (legs.length === 1) {
      return legs[0].action === 'buy' ? Infinity : netPremium;
    }
    return 500; // Placeholder for complex strategies
  };

  const calculateMaxLoss = () => {
    const netPremium = calculateNetPremium();
    if (legs.length === 1 && legs[0].action === 'buy') {
      return Math.abs(netPremium);
    }
    return 300; // Placeholder for complex strategies
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <LayoutGrid size={24} color="#3182ce" />
          <Heading size="lg">Strategy Builder</Heading>
        </div>
        <Button 
          colorPalette="brand" 
          onClick={() => setShowPayoffChart(!showPayoffChart)}
        >
          <BarChart3 size={16} />
          {showPayoffChart ? 'Hide' : 'Show'} Payoff Chart
        </Button>
      </div>

      <Grid templateColumns={{ base: '1fr', lg: '1fr 1fr' }} gap={6}>
        {/* Strategy Builder */}
        <div className="space-y-6">
          {/* Template Selector */}
          <Card.Root>
            <Card.Body>
              <Heading size="md" className="mb-4">Strategy Templates</Heading>
              <Select.Root 
                collection={STRATEGY_TEMPLATES}
                value={[selectedTemplate]} 
                onValueChange={(e) => {
                  setSelectedTemplate(e.value[0]);
                  loadTemplate(e.value[0]);
                }}
              >
                <Select.Trigger>
                  <Select.ValueText placeholder="Select a strategy template" />
                </Select.Trigger>
                <Select.Content>
                  {STRATEGY_TEMPLATES.items.map(template => (
                    <Select.Item key={template.value} item={template}>
                      <div>
                        <div className="font-medium">{template.label}</div>
                        <div className="text-xs text-neutral-600">{template.description}</div>
                      </div>
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select.Root>
            </Card.Body>
          </Card.Root>

          {/* Strategy Legs */}
          <Card.Root>
            <Card.Body>
              <div className="flex items-center justify-between mb-4">
                <Heading size="md">Strategy Legs</Heading>
                <Button size="sm" onClick={addLeg}>
                  <Plus size={16} />
                  Add Leg
                </Button>
              </div>

              {legs.length === 0 ? (
                <div className="text-center py-8 text-neutral-500">
                  <LayoutGrid size={32} className="mx-auto mb-2" />
                  <Text>No legs added yet. Select a template or add a leg manually.</Text>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table.Root size="sm">
                    <Table.Header>
                      <Table.Row>
                        <Table.ColumnHeader>Type</Table.ColumnHeader>
                        <Table.ColumnHeader>Action</Table.ColumnHeader>
                        <Table.ColumnHeader>Strike</Table.ColumnHeader>
                        <Table.ColumnHeader>Qty</Table.ColumnHeader>
                        <Table.ColumnHeader>Premium</Table.ColumnHeader>
                        <Table.ColumnHeader>Total</Table.ColumnHeader>
                        <Table.ColumnHeader></Table.ColumnHeader>
                      </Table.Row>
                    </Table.Header>
                    <Table.Body>
                      {legs.map((leg) => (
                        <Table.Row key={leg.id}>
                          <Table.Cell>
                            <Badge 
                              colorPalette={leg.type === 'call' ? 'green' : 'red'}
                              variant="subtle"
                            >
                              {leg.type.toUpperCase()}
                            </Badge>
                          </Table.Cell>
                          <Table.Cell>
                            <Badge 
                              colorPalette={leg.action === 'buy' ? 'blue' : 'orange'}
                              variant="outline"
                            >
                              {leg.action.toUpperCase()}
                            </Badge>
                          </Table.Cell>
                          <Table.Cell className="font-mono">
                            ${leg.strike}
                          </Table.Cell>
                          <Table.Cell className="font-mono">
                            {leg.quantity}
                          </Table.Cell>
                          <Table.Cell className="font-mono">
                            {formatCurrency(leg.premium)}
                          </Table.Cell>
                          <Table.Cell className={`font-mono font-semibold ${
                            leg.action === 'buy' ? 'text-danger-600' : 'text-success-600'
                          }`}>
                            {leg.action === 'buy' ? '-' : '+'}{formatCurrency(leg.premium * leg.quantity)}
                          </Table.Cell>
                          <Table.Cell>
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              colorPalette="red"
                              onClick={() => removeLeg(leg.id)}
                            >
                              <Trash2 size={14} />
                            </Button>
                          </Table.Cell>
                        </Table.Row>
                      ))}
                    </Table.Body>
                  </Table.Root>
                </div>
              )}
            </Card.Body>
          </Card.Root>
        </div>

        {/* Strategy Analysis */}
        <div className="space-y-6">
          {/* Risk/Reward Summary */}
          <Card.Root>
            <Card.Body>
              <Heading size="md" className="mb-4">Risk/Reward Analysis</Heading>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-neutral-100">
                  <span className="text-neutral-600">Net Premium</span>
                  <span className={`font-mono font-semibold ${
                    calculateNetPremium() >= 0 ? 'text-success-600' : 'text-danger-600'
                  }`}>
                    {calculateNetPremium() >= 0 ? '+' : ''}{formatCurrency(calculateNetPremium())}
                  </span>
                </div>
                
                <div className="flex justify-between items-center py-2 border-b border-neutral-100">
                  <span className="text-neutral-600">Max Profit</span>
                  <span className="font-mono font-semibold text-success-600">
                    {calculateMaxProfit() === Infinity ? 'Unlimited' : formatCurrency(calculateMaxProfit())}
                  </span>
                </div>
                
                <div className="flex justify-between items-center py-2 border-b border-neutral-100">
                  <span className="text-neutral-600">Max Loss</span>
                  <span className="font-mono font-semibold text-danger-600">
                    -{formatCurrency(calculateMaxLoss())}
                  </span>
                </div>
                
                <div className="flex justify-between items-center py-2 border-b border-neutral-100">
                  <span className="text-neutral-600">Breakeven</span>
                  <span className="font-mono font-semibold">
                    $152.40
                  </span>
                </div>
                
                <div className="flex justify-between items-center py-2">
                  <span className="text-neutral-600">Risk/Reward Ratio</span>
                  <span className="font-mono font-semibold">
                    1:2.3
                  </span>
                </div>
              </div>
            </Card.Body>
          </Card.Root>

          {/* Greeks Summary */}
          <Card.Root>
            <Card.Body>
              <Heading size="md" className="mb-4">Portfolio Greeks</Heading>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-neutral-50 rounded-lg">
                  <div className="text-sm text-neutral-600">Net Delta</div>
                  <div className="font-mono font-semibold text-lg">+0.32</div>
                </div>
                <div className="text-center p-3 bg-neutral-50 rounded-lg">
                  <div className="text-sm text-neutral-600">Net Gamma</div>
                  <div className="font-mono font-semibold text-lg">+0.05</div>
                </div>
                <div className="text-center p-3 bg-neutral-50 rounded-lg">
                  <div className="text-sm text-neutral-600">Net Theta</div>
                  <div className="font-mono font-semibold text-lg text-danger-600">-0.23</div>
                </div>
                <div className="text-center p-3 bg-neutral-50 rounded-lg">
                  <div className="text-sm text-neutral-600">Net Vega</div>
                  <div className="font-mono font-semibold text-lg">+0.18</div>
                </div>
              </div>
            </Card.Body>
          </Card.Root>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button colorPalette="brand" className="flex-1">
              Execute Strategy
            </Button>
            <Button variant="outline" className="flex-1">
              Save Template
            </Button>
          </div>
        </div>
      </Grid>

      {/* Payoff Chart Placeholder */}
      {showPayoffChart && (
        <Card.Root>
          <Card.Body>
            <Heading size="md" className="mb-4">Payoff Diagram</Heading>
            <div className="h-64 bg-neutral-100 rounded-lg flex items-center justify-center">
              <div className="text-center text-neutral-500">
                <BarChart3 size={32} className="mx-auto mb-2" />
                <Text>Payoff chart would be rendered here</Text>
                <Text className="text-sm">Interactive chart showing P&L at different stock prices</Text>
              </div>
            </div>
          </Card.Body>
        </Card.Root>
      )}
    </div>
  );
};