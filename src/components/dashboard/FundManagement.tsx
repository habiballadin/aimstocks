import React, { useState, useEffect } from 'react';
import { FyersFunds } from '../../services/fyersService';
import { 
  Card, 
  Text, 
  Box, 
  Flex, 
  SimpleGrid,
  Icon,
  Button,
  Badge,
  Stack,
  Input,
  Select,
  Progress,
  Alert,
  Stat,
  Switch,
  createListCollection
} from '@chakra-ui/react';
import { 
  Wallet, 
  ArrowUpDown,
  Settings,
  RefreshCw
} from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';
import { FundType } from '../../types/enums';

interface FundAccount {
  id: string;
  name: string;
  type: FundType;
  balance: number;
  allocated: number;
  available: number;
  pnl: number;
  pnlPercent: number;
  riskLevel: 'LOW' | 'MODERATE' | 'HIGH';
  isActive: boolean;
}

interface FundTransfer {
  id: string;
  fromAccount: string;
  toAccount: string;
  amount: number;
  status: 'PENDING' | 'COMPLETED' | 'FAILED';
  timestamp: string;
  reason: string;
}

export const FundManagement: React.FC = () => {
  const [selectedAccount, setSelectedAccount] = useState<string>('virtual1');
  const [transferAmount, setTransferAmount] = useState('');
  const [transferFrom, setTransferFrom] = useState('virtual1');
  const [transferTo, setTransferTo] = useState('real1');
  const [realFunds, setRealFunds] = useState<FyersFunds[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchRealFunds = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://127.0.0.1:5000/api/fyers/funds');
      const data = await response.json();
      if (data.success) {
        setRealFunds(data.data.fund_limit || []);
      }
    } catch (error) {
      console.error('Failed to fetch funds:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRealFunds();
  }, []);

  const getRealBalance = () => {
    const totalBalance = realFunds.find(f => f.id === 1)?.equityAmount || 0;
    const availableBalance = realFunds.find(f => f.id === 10)?.equityAmount || 0;
    const utilizedAmount = realFunds.find(f => f.id === 2)?.equityAmount || 0;
    const realizedPnL = realFunds.find(f => f.id === 4)?.equityAmount || 0;
    return { totalBalance, availableBalance, utilizedAmount, realizedPnL };
  };

  const { totalBalance, availableBalance, utilizedAmount, realizedPnL } = getRealBalance();

  const [fundAccounts] = useState<FundAccount[]>([
    {
      id: 'virtual1',
      name: 'Virtual Trading Account',
      type: FundType.VIRTUAL,
      balance: 1550000,
      allocated: 1425000,
      available: 125000,
      pnl: 47500,
      pnlPercent: 3.16,
      riskLevel: 'MODERATE',
      isActive: true
    },
    {
      id: 'real1',
      name: 'Live Trading Account (Fyers)',
      type: FundType.REAL,
      balance: totalBalance || 850000,
      allocated: utilizedAmount || 785000,
      available: availableBalance || 65000,
      pnl: realizedPnL || 28400,
      pnlPercent: totalBalance ? ((totalBalance - 850000) / 850000) * 100 : 3.45,
      riskLevel: 'LOW',
      isActive: true
    },
    {
      id: 'mixed1',
      name: 'Mixed Strategy Account',
      type: FundType.MIXED,
      balance: 500000,
      allocated: 450000,
      available: 50000,
      pnl: -5200,
      pnlPercent: -1.03,
      riskLevel: 'HIGH',
      isActive: false
    }
  ]);

  const [recentTransfers] = useState<FundTransfer[]>([
    {
      id: 'transfer1',
      fromAccount: 'Virtual Trading Account',
      toAccount: 'Live Trading Account',
      amount: 50000,
      status: 'COMPLETED',
      timestamp: '2025-01-27T10:30:00Z',
      reason: 'Strategy performance validation'
    },
    {
      id: 'transfer2',
      fromAccount: 'Live Trading Account',
      toAccount: 'Virtual Trading Account',
      amount: 25000,
      status: 'PENDING',
      timestamp: '2025-01-27T11:15:00Z',
      reason: 'Risk management adjustment'
    }
  ]);

  const totalVirtual = fundAccounts.filter(a => a.type === FundType.VIRTUAL).reduce((sum, account) => sum + account.balance, 0);
  // const totalPnL = fundAccounts.reduce((sum, account) => sum + account.pnl, 0);

  const selectedAccountData = fundAccounts.find(a => a.id === selectedAccount) || fundAccounts[0];

  const getFundTypeColor = (type: FundType) => {
    switch (type) {
      case FundType.VIRTUAL: return 'blue';
      case FundType.REAL: return 'green';
      case FundType.MIXED: return 'purple';
      default: return 'neutral';
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'LOW': return 'success.600';
      case 'MODERATE': return 'warning.600';
      case 'HIGH': return 'danger.600';
      default: return 'neutral.600';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'success';
      case 'PENDING': return 'warning';
      case 'FAILED': return 'danger';
      default: return 'neutral';
    }
  };

  const handleTransfer = () => {
    console.log('Transferring', transferAmount, 'from', transferFrom, 'to', transferTo);
    // Implementation for fund transfer
  };

  return (
    <Box>
      {/* Header */}
      <Card.Root mb={6}>
        <Card.Body>
          <Flex justify="space-between" align="center" mb={4}>
            <Flex align="center" gap={3}>
              <Icon color="brand.600">
                <Wallet size={24} />
              </Icon>
              <Box>
                <Text textStyle="heading.md" color="neutral.900">
                  Fund Management
                </Text>
                <Text fontSize="sm" color="neutral.600">
                  Manage virtual and real trading funds
                </Text>
              </Box>
            </Flex>
            
            <Flex align="center" gap={3}>
              <Button variant="outline" onClick={fetchRealFunds} loading={loading}>
                <Icon><RefreshCw size={16} /></Icon>
                Sync Balances
              </Button>
              <Button colorPalette="brand">
                <Icon><Settings size={16} /></Icon>
                Settings
              </Button>
            </Flex>
          </Flex>

          {/* Fund Overview */}
          <SimpleGrid columns={{ base: 2, md: 4 }} gap={4}>
            <Stat.Root>
              <Stat.Label>Total Funds</Stat.Label>
              <Stat.ValueText fontSize="2xl" fontWeight="bold" color="brand.600">
                ₹{(totalBalance).toFixed(2)}
              </Stat.ValueText>
            </Stat.Root>
            
            <Stat.Root>
              <Stat.Label>Virtual Funds</Stat.Label>
              <Stat.ValueText fontSize="2xl" fontWeight="bold" color="blue.600">
                {formatCurrency(totalVirtual)}
              </Stat.ValueText>
            </Stat.Root>
            
            <Stat.Root>
              <Stat.Label>Real Funds (Fyers)</Stat.Label>
              <Stat.ValueText fontSize="2xl" fontWeight="bold" color="green.600">
                ₹{totalBalance.toFixed(2)}
              </Stat.ValueText>
            </Stat.Root>
            
            <Stat.Root>
              <Stat.Label>Total P&L (Fyers)</Stat.Label>
              <Stat.ValueText 
                fontSize="2xl" 
                fontWeight="bold" 
                color={realizedPnL >= 0 ? 'success.600' : 'danger.600'}
              >
                ₹{realizedPnL.toFixed(2)}
              </Stat.ValueText>
            </Stat.Root>
          </SimpleGrid>
          
          {/* Detailed Fund Breakdown */}
          {realFunds.length > 0 && (
            <Box mt={6}>
              <Text fontWeight="semibold" color="neutral.900" mb={4}>
                Fyers Account Details
              </Text>
              <SimpleGrid columns={{ base: 2, md: 5 }} gap={3}>
                {realFunds.map((fund) => (
                  <Box key={fund.id} p={3} bg="neutral.50" borderRadius="md">
                    <Text fontSize="xs" color="neutral.600" mb={1}>
                      {fund.title}
                    </Text>
                    <Text fontSize="sm" fontWeight="bold" color="neutral.900">
                      ₹{fund.equityAmount.toFixed(2)}
                    </Text>
                  </Box>
                ))}
              </SimpleGrid>
            </Box>
          )}
        </Card.Body>
      </Card.Root>

      <SimpleGrid columns={{ base: 1, lg: 3 }} gap={6}>
        {/* Fund Accounts */}
        <Box gridColumn={{ lg: 'span 2' }}>
          <Card.Root>
            <Card.Body>
              <Text fontWeight="semibold" color="neutral.900" mb={4}>
                Fund Accounts
              </Text>
              
              <Stack gap={4}>
                {fundAccounts.map((account) => (
                  <Box 
                    key={account.id}
                    p={4} 
                    bg={account.id === selectedAccount ? 'brand.50' : 'neutral.50'}
                    borderRadius="md"
                    border="1px solid"
                    borderColor={account.id === selectedAccount ? 'brand.200' : 'neutral.200'}
                    cursor="pointer"
                    onClick={() => setSelectedAccount(account.id)}
                  >
                    <Flex justify="space-between" align="center" mb={3}>
                      <Flex align="center" gap={3}>
                        <Icon color={`${getFundTypeColor(account.type)}.600`}>
                          <Wallet size={20} />
                        </Icon>
                        <Box>
                          <Text fontWeight="medium" color="neutral.900">
                            {account.name}
                          </Text>
                          <Flex align="center" gap={2}>
                            <Badge colorPalette={getFundTypeColor(account.type)} size="sm">
                              {account.type}
                            </Badge>
                            <Badge colorPalette={account.riskLevel === 'LOW' ? 'success' : account.riskLevel === 'MODERATE' ? 'warning' : 'danger'} size="sm">
                              {account.riskLevel} RISK
                            </Badge>
                          </Flex>
                        </Box>
                      </Flex>
                      
                      <Switch.Root checked={account.isActive} size="sm">
                        <Switch.Control>
                          <Switch.Thumb />
                        </Switch.Control>
                      </Switch.Root>
                    </Flex>

                    <SimpleGrid columns={3} gap={4}>
                      <Box>
                        <Text fontSize="xs" color="neutral.600">Balance</Text>
                        <Text fontSize="sm" fontWeight="bold" color="neutral.900">
                          {account.id === 'real1' ? `₹${totalBalance.toFixed(2)}` : formatCurrency(account.balance)}
                        </Text>
                      </Box>
                      <Box>
                        <Text fontSize="xs" color="neutral.600">Available</Text>
                        <Text fontSize="sm" fontWeight="bold" color="success.600">
                          {account.id === 'real1' ? `₹${availableBalance.toFixed(2)}` : formatCurrency(account.available)}
                        </Text>
                      </Box>
                      <Box>
                        <Text fontSize="xs" color="neutral.600">P&L</Text>
                        <Text 
                          fontSize="sm" 
                          fontWeight="bold" 
                          color={account.id === 'real1' ? (realizedPnL >= 0 ? 'success.600' : 'danger.600') : (account.pnl >= 0 ? 'success.600' : 'danger.600')}
                        >
                          {account.id === 'real1' ? `₹${realizedPnL.toFixed(2)}` : formatCurrency(account.pnl)}
                        </Text>
                      </Box>
                    </SimpleGrid>

                    <Box mt={3}>
                      <Flex justify="space-between" align="center" mb={1}>
                        <Text fontSize="xs" color="neutral.600">Allocation</Text>
                        <Text fontSize="xs" color="neutral.700">
                          {((account.allocated / account.balance) * 100).toFixed(1)}%
                        </Text>
                      </Flex>
                      <Progress.Root 
                        value={(account.allocated / account.balance) * 100} 
                        colorPalette={getFundTypeColor(account.type)}
                      >
                        <Progress.Track>
                          <Progress.Range />
                        </Progress.Track>
                      </Progress.Root>
                    </Box>
                  </Box>
                ))}
              </Stack>
            </Card.Body>
          </Card.Root>
        </Box>

        {/* Fund Transfer & Details */}
        <Stack gap={6}>
          {/* Selected Account Details */}
          <Card.Root>
            <Card.Body>
              <Text fontWeight="semibold" color="neutral.900" mb={4}>
                Account Details
              </Text>
              
              <Box p={4} bg="neutral.50" borderRadius="md" mb={4}>
                <Text fontSize="sm" fontWeight="medium" color="neutral.800" mb={2}>
                  {selectedAccountData.name}
                </Text>
                <SimpleGrid columns={2} gap={3}>
                  <Box>
                    <Text fontSize="xs" color="neutral.600">Total Balance</Text>
                    <Text fontSize="lg" fontWeight="bold" color="brand.600">
                      {selectedAccountData.id === 'real1' ? `₹${totalBalance.toFixed(2)}` : formatCurrency(selectedAccountData.balance)}
                    </Text>
                  </Box>
                  <Box>
                    <Text fontSize="xs" color="neutral.600">Risk Level</Text>
                    <Text 
                      fontSize="lg" 
                      fontWeight="bold" 
                      color={getRiskColor(selectedAccountData.riskLevel)}
                    >
                      {selectedAccountData.riskLevel}
                    </Text>
                  </Box>
                </SimpleGrid>
              </Box>

              <SimpleGrid columns={2} gap={3}>
                <Box textAlign="center" p={3} bg="success.50" borderRadius="md">
                  <Text fontSize="lg" fontWeight="bold" color="success.700">
                    {selectedAccountData.id === 'real1' ? `₹${availableBalance.toFixed(2)}` : formatCurrency(selectedAccountData.available)}
                  </Text>
                  <Text fontSize="xs" color="success.600">Available</Text>
                </Box>
                <Box textAlign="center" p={3} bg="warning.50" borderRadius="md">
                  <Text fontSize="lg" fontWeight="bold" color="warning.700">
                    {selectedAccountData.id === 'real1' ? `₹${utilizedAmount.toFixed(2)}` : formatCurrency(selectedAccountData.allocated)}
                  </Text>
                  <Text fontSize="xs" color="warning.600">Allocated</Text>
                </Box>
              </SimpleGrid>
            </Card.Body>
          </Card.Root>

          {/* Fund Transfer */}
          <Card.Root>
            <Card.Body>
              <Text fontWeight="semibold" color="neutral.900" mb={4}>
                Transfer Funds
              </Text>
              
              <Stack gap={4}>
                <Box>
                  <Text fontSize="sm" fontWeight="medium" color="neutral.700" mb={2}>
                    From Account
                  </Text>
                  <Select.Root 
                    collection={createListCollection({
                      items: fundAccounts.map(account => ({ label: account.name, value: account.id }))
                    })}
                    value={[transferFrom]} 
                    onValueChange={(e) => setTransferFrom(e.value[0])}
                  >
                    <Select.Trigger>
                      <Select.ValueText />
                    </Select.Trigger>
                    <Select.Content>
                      {fundAccounts.map((account) => (
                        <Select.Item key={account.id} item={account.id}>
                          {account.name}
                        </Select.Item>
                      ))}
                    </Select.Content>
                  </Select.Root>
                </Box>

                <Box>
                  <Text fontSize="sm" fontWeight="medium" color="neutral.700" mb={2}>
                    To Account
                  </Text>
                  <Select.Root 
                    collection={createListCollection({
                      items: fundAccounts.map(account => ({ label: account.name, value: account.id }))
                    })}
                    value={[transferTo]} 
                    onValueChange={(e) => setTransferTo(e.value[0])}
                  >
                    <Select.Trigger>
                      <Select.ValueText />
                    </Select.Trigger>
                    <Select.Content>
                      {fundAccounts.map((account) => (
                        <Select.Item key={account.id} item={account.id}>
                          {account.name}
                        </Select.Item>
                      ))}
                    </Select.Content>
                  </Select.Root>
                </Box>

                <Box>
                  <Text fontSize="sm" fontWeight="medium" color="neutral.700" mb={2}>
                    Amount
                  </Text>
                  <Input 
                    type="number"
                    placeholder="Enter amount"
                    value={transferAmount}
                    onChange={(e) => setTransferAmount(e.target.value)}
                  />
                </Box>

                <Alert.Root status="info" size="sm">
                  <Alert.Indicator />
                  <Box>
                    <Alert.Title>Transfer Note</Alert.Title>
                    <Text fontSize="xs">
                      Transfers between virtual and real accounts are for tracking purposes only.
                    </Text>
                  </Box>
                </Alert.Root>

                <Button 
                  colorPalette="brand" 
                  onClick={handleTransfer}
                  disabled={!transferAmount || transferFrom === transferTo}
                >
                  <Icon><ArrowUpDown size={16} /></Icon>
                  Transfer Funds
                </Button>
              </Stack>
            </Card.Body>
          </Card.Root>

          {/* Recent Transfers */}
          <Card.Root>
            <Card.Body>
              <Text fontWeight="semibold" color="neutral.900" mb={4}>
                Recent Transfers
              </Text>
              
              <Stack gap={3}>
                {recentTransfers.map((transfer) => (
                  <Box key={transfer.id} p={3} bg="neutral.50" borderRadius="md">
                    <Flex justify="space-between" align="center" mb={2}>
                      <Text fontSize="sm" fontWeight="medium" color="neutral.900">
                        {formatCurrency(transfer.amount)}
                      </Text>
                      <Badge colorPalette={getStatusColor(transfer.status)} size="sm">
                        {transfer.status}
                      </Badge>
                    </Flex>
                    <Text fontSize="xs" color="neutral.600" mb={1}>
                      {transfer.fromAccount} → {transfer.toAccount}
                    </Text>
                    <Text fontSize="xs" color="neutral.500">
                      {new Date(transfer.timestamp).toLocaleString()}
                    </Text>
                  </Box>
                ))}
              </Stack>
            </Card.Body>
          </Card.Root>
        </Stack>
      </SimpleGrid>
    </Box>
  );
};