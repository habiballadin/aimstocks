import React, { useState } from 'react';
import { Card, Table, Badge, Input, Select, Text, createListCollection } from '@chakra-ui/react';
import { Search, Filter } from 'lucide-react';
import { formatCurrency, formatPercentage, formatGreek } from '../../utils/formatters';

interface OptionData {
  strike: number;
  lastPrice: number;
  bid: number;
  ask: number;
  volume: number;
  openInterest: number;
  impliedVolatility: number;
  delta: number;
  gamma: number;
  theta: number;
  vega: number;
  rho: number;
  change: number;
  changePercent: number;
}

interface OptionsChainProps {
  symbol: string;
  optionsData: {
    calls: OptionData[];
    puts: OptionData[];
  };
}

export const OptionsChain: React.FC<OptionsChainProps> = ({ optionsData }) => {
  const [filterStrike, setFilterStrike] = useState('');
  const [sortBy, setSortBy] = useState('strike');
  const [selectedExpiry, setSelectedExpiry] = useState('2024-01-19');

  const expiryDates = createListCollection({
    items: [
      { value: '2024-01-19', label: 'Jan 19, 2024 (15 days)' },
      { value: '2024-02-16', label: 'Feb 16, 2024 (43 days)' },
      { value: '2024-03-15', label: 'Mar 15, 2024 (71 days)' }
    ]
  });

  const sortOptions = createListCollection({
    items: [
      { value: 'strike', label: 'Strike' },
      { value: 'volume', label: 'Volume' },
      { value: 'iv', label: 'IV' },
      { value: 'delta', label: 'Delta' }
    ]
  });

  const getMoneyness = (strike: number, currentPrice: number = 185.50) => {
    const diff = Math.abs(strike - currentPrice);
    if (diff < 2.5) return 'ATM';
    return strike < currentPrice ? 'ITM' : 'OTM';
  };

  const getMoneynessColor = (moneyness: string) => {
    switch (moneyness) {
      case 'ITM': return 'options.itm';
      case 'ATM': return 'options.atm';
      case 'OTM': return 'options.otm';
      default: return 'neutral.500';
    }
  };

  const OptionRow: React.FC<{ option: OptionData; type: 'call' | 'put' }> = ({ option, type }) => {
    const moneyness = getMoneyness(option.strike);
    const isPositive = option.change >= 0;
    
    return (
      <Table.Row className="hover:bg-neutral-50 cursor-pointer">
        <Table.Cell>
          <div className="flex items-center gap-2">
            <Badge 
              colorPalette={type === 'call' ? 'green' : 'red'}
              variant="subtle"
              size="sm"
            >
              {type.toUpperCase()}
            </Badge>
            <Badge 
              style={{ color: getMoneynessColor(moneyness) }}
              variant="outline"
              size="sm"
            >
              {moneyness}
            </Badge>
          </div>
        </Table.Cell>
        <Table.Cell className="font-mono font-semibold">
          {formatCurrency(option.strike)}
        </Table.Cell>
        <Table.Cell className="font-mono">
          {formatCurrency(option.lastPrice)}
        </Table.Cell>
        <Table.Cell className="font-mono text-sm">
          {formatCurrency(option.bid)} / {formatCurrency(option.ask)}
        </Table.Cell>
        <Table.Cell className="font-mono">
          <div className="text-right">
            <div className="font-semibold">{option.volume.toLocaleString()}</div>
            <div className="text-xs text-neutral-500">OI: {option.openInterest.toLocaleString()}</div>
          </div>
        </Table.Cell>
        <Table.Cell className="font-mono">
          {(option.impliedVolatility * 100).toFixed(1)}%
        </Table.Cell>
        <Table.Cell className="font-mono text-sm">
          <div className="space-y-1">
            <div>Δ {formatGreek(option.delta, 'DELTA')}</div>
            <div>Γ {formatGreek(option.gamma, 'GAMMA')}</div>
          </div>
        </Table.Cell>
        <Table.Cell className="font-mono text-sm">
          <div className="space-y-1">
            <div>Θ {formatGreek(option.theta, 'THETA')}</div>
            <div>ν {formatGreek(option.vega, 'VEGA')}</div>
          </div>
        </Table.Cell>
        <Table.Cell>
          <div className={`font-mono text-right ${isPositive ? 'text-success-600' : 'text-danger-600'}`}>
            <div className="font-semibold">
              {isPositive ? '+' : ''}{formatCurrency(option.change)}
            </div>
            <div className="text-sm">
              ({formatPercentage(option.changePercent)})
            </div>
          </div>
        </Table.Cell>
      </Table.Row>
    );
  };

  return (
    <Card.Root>
      <Card.Body>
        {/* Header Controls */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <Select.Root collection={expiryDates} value={[selectedExpiry]} onValueChange={(e) => setSelectedExpiry(e.value[0])}>
              <Select.Trigger className="min-w-48">
                <Select.ValueText placeholder="Select expiry" />
              </Select.Trigger>
              <Select.Content>
                {expiryDates.items.map(date => (
                  <Select.Item key={date.value} item={date}>
                    {date.label}
                  </Select.Item>
                ))}
              </Select.Content>
            </Select.Root>

            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400" />
              <Input
                placeholder="Filter by strike..."
                value={filterStrike}
                onChange={(e) => setFilterStrike(e.target.value)}
                className="pl-10 w-40"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Filter size={16} color="#718096" />
            <Select.Root collection={sortOptions} value={[sortBy]} onValueChange={(e) => setSortBy(e.value[0])}>
              <Select.Trigger className="min-w-32">
                <Select.ValueText />
              </Select.Trigger>
              <Select.Content>
                {sortOptions.items.map(option => (
                  <Select.Item key={option.value} item={option}>
                    {option.label}
                  </Select.Item>
                ))}
              </Select.Content>
            </Select.Root>
          </div>
        </div>

        {/* Options Chain Table */}
        <div className="overflow-x-auto">
          <Table.Root variant="outline" size="sm">
            <Table.Header>
              <Table.Row>
                <Table.ColumnHeader>Type</Table.ColumnHeader>
                <Table.ColumnHeader>Strike</Table.ColumnHeader>
                <Table.ColumnHeader>Last</Table.ColumnHeader>
                <Table.ColumnHeader>Bid/Ask</Table.ColumnHeader>
                <Table.ColumnHeader className="text-right">Volume/OI</Table.ColumnHeader>
                <Table.ColumnHeader>IV</Table.ColumnHeader>
                <Table.ColumnHeader>Delta/Gamma</Table.ColumnHeader>
                <Table.ColumnHeader>Theta/Vega</Table.ColumnHeader>
                <Table.ColumnHeader className="text-right">Change</Table.ColumnHeader>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {/* Calls */}
              {optionsData.calls.map((call, index) => (
                <OptionRow key={`call-${index}`} option={call} type="call" />
              ))}
              
              {/* Separator */}
              <Table.Row>
                <Table.Cell colSpan={9} className="bg-neutral-100 text-center py-2">
                  <Text className="font-semibold text-neutral-600">Current Price: $185.50</Text>
                </Table.Cell>
              </Table.Row>
              
              {/* Puts */}
              {optionsData.puts.map((put, index) => (
                <OptionRow key={`put-${index}`} option={put} type="put" />
              ))}
            </Table.Body>
          </Table.Root>
        </div>

        {/* Summary Stats */}
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-neutral-200">
          <div className="text-center">
            <div className="text-sm text-neutral-600">Total Volume</div>
            <div className="font-semibold text-lg">2,140</div>
          </div>
          <div className="text-center">
            <div className="text-sm text-neutral-600">Put/Call Ratio</div>
            <div className="font-semibold text-lg">0.68</div>
          </div>
          <div className="text-center">
            <div className="text-sm text-neutral-600">Avg IV</div>
            <div className="font-semibold text-lg">26.5%</div>
          </div>
          <div className="text-center">
            <div className="text-sm text-neutral-600">Max Pain</div>
            <div className="font-semibold text-lg">$152.50</div>
          </div>
        </div>
      </Card.Body>
    </Card.Root>
  );
};