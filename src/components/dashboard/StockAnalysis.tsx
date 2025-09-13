import React, { useState } from 'react';
import { 
  Card, 
  Text, 
  Box, 
  Flex, 
  SimpleGrid,
  Icon,
  Button,
  Badge,
  Progress,
  Stack,
  Tabs,
  Table,
  Stat,
  Select,
  createListCollection
} from '@chakra-ui/react';
import { 
  BarChart3, 
  TrendingUp, 
  DollarSign,
  PieChart,
  Activity,
  Target,
  AlertTriangle,
  Calendar,
  Users,
  Building,
  Search
} from 'lucide-react';
import { PriceDisplay } from '../common/PriceDisplay';
import { AIConfidenceIndicator } from '../common/AIConfidenceIndicator';
import { formatCurrency, formatPercentage } from '../../utils/formatters';

interface StockData {
  symbol: string;
  companyName: string;
  sector: string;
  industry: string;
  currentPrice: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap: number;
  sharesOutstanding: number;
  
  // Fundamental Data
  peRatio: number;
  pbRatio: number;
  psRatio: number;
  pegRatio: number;
  roe: number;
  roa: number;
  roic: number;
  debtToEquity: number;
  currentRatio: number;
  quickRatio: number;
  dividendYield: number;
  payoutRatio: number;
  
  // Growth Metrics
  revenueGrowth: number;
  profitGrowth: number;
  epsGrowth: number;
  bookValueGrowth: number;
  
  // Technical Indicators
  rsi: number;
  macd: number;
  sma20: number;
  sma50: number;
  sma200: number;
  bollingerUpper: number;
  bollingerLower: number;
  
  // AI Analysis
  aiScore: number;
  recommendation: 'STRONG_BUY' | 'BUY' | 'HOLD' | 'SELL' | 'STRONG_SELL';
  targetPrice: number;
  stopLoss: number;
  
  // News Sentiment
  newsSentiment: number;
  analystRating: number;
  institutionalHolding: number;
}

export const StockAnalysis: React.FC = () => {
  const [selectedStock, setSelectedStock] = useState('RELIANCE');
  const [activeTab, setActiveTab] = useState('overview');

  const stockOptions = createListCollection({
    items: [
      { value: 'RELIANCE', label: 'Reliance Industries' },
      { value: 'TCS', label: 'Tata Consultancy Services' },
      { value: 'INFY', label: 'Infosys Limited' },
      { value: 'HDFCBANK', label: 'HDFC Bank' },
      { value: 'ICICIBANK', label: 'ICICI Bank' }
    ]
  });

  // Mock stock data - in real app, this would come from API
  const stockData: StockData = {
    symbol: 'RELIANCE',
    companyName: 'Reliance Industries Limited',
    sector: 'Energy',
    industry: 'Oil & Gas Refining',
    currentPrice: 2847.65,
    change: 45.20,
    changePercent: 1.61,
    volume: 2547890,
    marketCap: 19250000000000,
    sharesOutstanding: 6765000000,
    
    peRatio: 25.4,
    pbRatio: 2.8,
    psRatio: 1.9,
    pegRatio: 1.2,
    roe: 12.5,
    roa: 8.3,
    roic: 10.7,
    debtToEquity: 0.35,
    currentRatio: 1.8,
    quickRatio: 1.2,
    dividendYield: 0.8,
    payoutRatio: 15.2,
    
    revenueGrowth: 15.2,
    profitGrowth: 18.7,
    epsGrowth: 19.3,
    bookValueGrowth: 12.1,
    
    rsi: 65.4,
    macd: 12.5,
    sma20: 2820.45,
    sma50: 2756.30,
    sma200: 2654.80,
    bollingerUpper: 2890.20,
    bollingerLower: 2750.10,
    
    aiScore: 8.5,
    recommendation: 'BUY',
    targetPrice: 3100.00,
    stopLoss: 2650.00,
    
    newsSentiment: 0.72,
    analystRating: 4.2,
    institutionalHolding: 68.5
  };



  const getRecommendationColor = (recommendation: string) => {
    switch (recommendation) {
      case 'STRONG_BUY': return 'success';
      case 'BUY': return 'success';
      case 'HOLD': return 'warning';
      case 'SELL': return 'danger';
      case 'STRONG_SELL': return 'danger';
      default: return 'neutral';
    }
  };

  const getTechnicalSignal = (value: number, upper: number, lower: number) => {
    if (value > upper) return { signal: 'Overbought', color: 'danger' };
    if (value < lower) return { signal: 'Oversold', color: 'success' };
    return { signal: 'Neutral', color: 'warning' };
  };

  return (
    <Box>
      {/* Stock Selector */}
      <Card.Root mb={4}>
        <Card.Body>
          <Flex align="center" gap={4}>
            <Icon color="brand.600"><Search size={20} /></Icon>
            <Text fontWeight="semibold">Select Stock:</Text>
            <Select.Root collection={stockOptions} value={[selectedStock]} onValueChange={(e) => setSelectedStock(e.value[0])} width="300px">
              <Select.Trigger>
                <Select.ValueText placeholder="Choose a stock" />
              </Select.Trigger>
              <Select.Content>
                {stockOptions.items.map((stock) => (
                  <Select.Item key={stock.value} item={stock}>
                    {stock.label}
                  </Select.Item>
                ))}
              </Select.Content>
            </Select.Root>
            <Button colorPalette="brand" size="sm">
              <Icon><BarChart3 size={16} /></Icon>
              Analyze
            </Button>
          </Flex>
        </Card.Body>
      </Card.Root>

      {/* Stock Header */}
      <Card.Root mb={6}>
        <Card.Body>
          <Flex justify="space-between" align="center" mb={4}>
            <Flex align="center" gap={4}>
              <Icon color="brand.600">
                <Building size={32} />
              </Icon>
              <Box>
                <Flex align="center" gap={3}>
                  <Text textStyle="heading.lg" color="neutral.900">
                    {stockData.symbol}
                  </Text>
                  <Badge colorPalette={getRecommendationColor(stockData.recommendation)}>
                    {stockData.recommendation}
                  </Badge>
                </Flex>
                <Text fontSize="sm" color="neutral.600" mb={1}>
                  {stockData.companyName}
                </Text>
                <Text fontSize="xs" color="neutral.500">
                  {stockData.sector} • {stockData.industry}
                </Text>
              </Box>
            </Flex>
            
            <Flex align="center" gap={6}>
              <Box textAlign="right">
                <PriceDisplay 
                  price={stockData.currentPrice}
                  change={stockData.change}
                  changePercent={stockData.changePercent}
                  size="lg"
                />
              </Box>
              <Box textAlign="right">
                <Flex align="center" gap={2} mb={1}>
                  <Icon color="success.600"><Target size={16} /></Icon>
                  <Text fontSize="sm" color="neutral.600">AI Target</Text>
                </Flex>
                <Text textStyle="price.md" color="success.700">
                  {formatCurrency(stockData.targetPrice)}
                </Text>
                <Flex align="center" gap={1}>
                  <Icon color="danger.600"><AlertTriangle size={12} /></Icon>
                  <Text fontSize="xs" color="danger.600">
                    Stop Loss: {formatCurrency(stockData.stopLoss)}
                  </Text>
                </Flex>
              </Box>
            </Flex>
          </Flex>

          {/* Quick Stats */}
          <SimpleGrid columns={5} gap={4}>
            <Stat.Root>
              <Stat.Label>
                <Flex align="center" gap={1}>
                  <Icon color="brand.600"><DollarSign size={14} /></Icon>
                  Market Cap
                </Flex>
              </Stat.Label>
              <Stat.ValueText>
                {formatCurrency(stockData.marketCap / 10000000)}
              </Stat.ValueText>
              <Text fontSize="xs" color="neutral.600">Crores</Text>
            </Stat.Root>
            
            <Stat.Root>
              <Stat.Label>
                <Flex align="center" gap={1}>
                  <Icon color="brand.600"><PieChart size={14} /></Icon>
                  P/E Ratio
                </Flex>
              </Stat.Label>
              <Stat.ValueText>
                {stockData.peRatio}
              </Stat.ValueText>
            </Stat.Root>
            
            <Stat.Root>
              <Stat.Label>
                <Flex align="center" gap={1}>
                  <Icon color="success.600"><TrendingUp size={14} /></Icon>
                  ROE
                </Flex>
              </Stat.Label>
              <Stat.ValueText>
                {formatPercentage(stockData.roe)}
              </Stat.ValueText>
            </Stat.Root>
            
            <Stat.Root>
              <Stat.Label>Debt/Equity</Stat.Label>
              <Stat.ValueText>
                {stockData.debtToEquity}
              </Stat.ValueText>
            </Stat.Root>
            
            <Stat.Root>
              <Stat.Label>Dividend Yield</Stat.Label>
              <Stat.ValueText>
                {formatPercentage(stockData.dividendYield)}
              </Stat.ValueText>
            </Stat.Root>
          </SimpleGrid>
        </Card.Body>
      </Card.Root>

      {/* Analysis Tabs */}
      <Tabs.Root value={activeTab} onValueChange={(e) => setActiveTab(e.value)}>
        <Tabs.List mb={6}>
          <Tabs.Trigger value="overview">Overview</Tabs.Trigger>
          <Tabs.Trigger value="fundamental">Fundamental</Tabs.Trigger>
          <Tabs.Trigger value="technical">Technical</Tabs.Trigger>
          <Tabs.Trigger value="ai-analysis">AI Analysis</Tabs.Trigger>
          <Tabs.Trigger value="news-sentiment">News & Sentiment</Tabs.Trigger>
        </Tabs.List>

        {/* Overview Tab */}
        <Tabs.Content value="overview">
          <SimpleGrid columns={{ base: 1, lg: 3 }} gap={6}>
            {/* Key Metrics */}
            <Card.Root>
              <Card.Body>
                <Flex align="center" gap={2} mb={4}>
                  <Icon color="brand.600"><BarChart3 size={20} /></Icon>
                  <Text fontWeight="semibold">Key Metrics</Text>
                </Flex>
                <Stack gap={3}>
                  <Flex justify="space-between">
                    <Text fontSize="sm" color="neutral.600">Market Cap</Text>
                    <Text fontSize="sm" fontWeight="medium">
                      ₹{(stockData.marketCap / 10000000).toFixed(0)}Cr
                    </Text>
                  </Flex>
                  <Flex justify="space-between">
                    <Text fontSize="sm" color="neutral.600">Enterprise Value</Text>
                    <Text fontSize="sm" fontWeight="medium">₹20.5L Cr</Text>
                  </Flex>
                  <Flex justify="space-between">
                    <Text fontSize="sm" color="neutral.600">Shares Outstanding</Text>
                    <Text fontSize="sm" fontWeight="medium">
                      {(stockData.sharesOutstanding / 1000000).toFixed(0)}M
                    </Text>
                  </Flex>
                  <Flex justify="space-between">
                    <Text fontSize="sm" color="neutral.600">Float</Text>
                    <Text fontSize="sm" fontWeight="medium">4.2B</Text>
                  </Flex>
                  <Flex justify="space-between">
                    <Text fontSize="sm" color="neutral.600">52W High</Text>
                    <Text fontSize="sm" fontWeight="medium">₹3,024</Text>
                  </Flex>
                  <Flex justify="space-between">
                    <Text fontSize="sm" color="neutral.600">52W Low</Text>
                    <Text fontSize="sm" fontWeight="medium">₹2,220</Text>
                  </Flex>
                </Stack>
              </Card.Body>
            </Card.Root>

            {/* Performance Score */}
            <Card.Root>
              <Card.Body>
                <Flex align="center" gap={2} mb={4}>
                  <Icon color="ai.600"><Target size={20} /></Icon>
                  <Text fontWeight="semibold">Performance Score</Text>
                </Flex>
                <Stack gap={4}>
                  <Box>
                    <Flex justify="space-between" mb={1}>
                      <Text fontSize="sm">Overall Score</Text>
                      <Text fontSize="sm" fontWeight="bold" color="success.600">
                        {stockData.aiScore}/10
                      </Text>
                    </Flex>
                    <Progress.Root value={stockData.aiScore * 10} colorPalette="success">
                      <Progress.Track><Progress.Range /></Progress.Track>
                    </Progress.Root>
                  </Box>
                  
                  <Box>
                    <Flex justify="space-between" mb={1}>
                      <Text fontSize="sm">Financial Health</Text>
                      <Text fontSize="sm" fontWeight="bold" color="success.600">8.2/10</Text>
                    </Flex>
                    <Progress.Root value={82} colorPalette="success">
                      <Progress.Track><Progress.Range /></Progress.Track>
                    </Progress.Root>
                  </Box>
                  
                  <Box>
                    <Flex justify="space-between" mb={1}>
                      <Text fontSize="sm">Growth Potential</Text>
                      <Text fontSize="sm" fontWeight="bold" color="warning.600">7.8/10</Text>
                    </Flex>
                    <Progress.Root value={78} colorPalette="warning">
                      <Progress.Track><Progress.Range /></Progress.Track>
                    </Progress.Root>
                  </Box>
                  
                  <Box>
                    <Flex justify="space-between" mb={1}>
                      <Text fontSize="sm">Valuation</Text>
                      <Text fontSize="sm" fontWeight="bold" color="warning.600">6.5/10</Text>
                    </Flex>
                    <Progress.Root value={65} colorPalette="warning">
                      <Progress.Track><Progress.Range /></Progress.Track>
                    </Progress.Root>
                  </Box>
                </Stack>
              </Card.Body>
            </Card.Root>

            {/* Recent Events */}
            <Card.Root>
              <Card.Body>
                <Flex align="center" gap={2} mb={4}>
                  <Icon color="warning.600"><Calendar size={20} /></Icon>
                  <Text fontWeight="semibold">Recent Events</Text>
                </Flex>
                <Stack gap={3}>
                  <Box p={3} bg="success.50" borderRadius="md" borderLeft="3px solid" borderColor="success.500">
                    <Text fontSize="sm" fontWeight="medium" color="success.800">Q3 Results Beat</Text>
                    <Text fontSize="xs" color="success.700">Revenue up 18.5% YoY</Text>
                    <Text fontSize="xs" color="neutral.600">2 days ago</Text>
                  </Box>
                  
                  <Box p={3} bg="brand.50" borderRadius="md" borderLeft="3px solid" borderColor="brand.500">
                    <Text fontSize="sm" fontWeight="medium" color="brand.800">Dividend Announced</Text>
                    <Text fontSize="xs" color="brand.700">₹8 per share interim dividend</Text>
                    <Text fontSize="xs" color="neutral.600">1 week ago</Text>
                  </Box>
                  
                  <Box p={3} bg="warning.50" borderRadius="md" borderLeft="3px solid" borderColor="warning.500">
                    <Text fontSize="sm" fontWeight="medium" color="warning.800">Analyst Upgrade</Text>
                    <Text fontSize="xs" color="warning.700">Morgan Stanley raises target to ₹3200</Text>
                    <Text fontSize="xs" color="neutral.600">2 weeks ago</Text>
                  </Box>
                </Stack>
              </Card.Body>
            </Card.Root>
          </SimpleGrid>
        </Tabs.Content>

        {/* Fundamental Analysis Tab */}
        <Tabs.Content value="fundamental">
          <SimpleGrid columns={{ base: 1, lg: 2 }} gap={6}>
            {/* Valuation Ratios */}
            <Card.Root>
              <Card.Body>
                <Text fontWeight="semibold" mb={4}>Valuation Ratios</Text>
                <Table.Root variant="outline" size="sm">
                  <Table.Body>
                    <Table.Row>
                      <Table.Cell>P/E Ratio</Table.Cell>
                      <Table.Cell fontWeight="medium">{stockData.peRatio}</Table.Cell>
                      <Table.Cell>
                        <Badge colorPalette={stockData.peRatio < 20 ? 'success' : stockData.peRatio < 30 ? 'warning' : 'danger'} size="sm">
                          {stockData.peRatio < 20 ? 'Attractive' : stockData.peRatio < 30 ? 'Fair' : 'Expensive'}
                        </Badge>
                      </Table.Cell>
                    </Table.Row>
                    <Table.Row>
                      <Table.Cell>P/B Ratio</Table.Cell>
                      <Table.Cell fontWeight="medium">{stockData.pbRatio}</Table.Cell>
                      <Table.Cell>
                        <Badge colorPalette={stockData.pbRatio < 2 ? 'success' : stockData.pbRatio < 4 ? 'warning' : 'danger'} size="sm">
                          {stockData.pbRatio < 2 ? 'Undervalued' : stockData.pbRatio < 4 ? 'Fair' : 'Overvalued'}
                        </Badge>
                      </Table.Cell>
                    </Table.Row>
                    <Table.Row>
                      <Table.Cell>P/S Ratio</Table.Cell>
                      <Table.Cell fontWeight="medium">{stockData.psRatio}</Table.Cell>
                      <Table.Cell>
                        <Badge colorPalette="success" size="sm">Good</Badge>
                      </Table.Cell>
                    </Table.Row>
                    <Table.Row>
                      <Table.Cell>PEG Ratio</Table.Cell>
                      <Table.Cell fontWeight="medium">{stockData.pegRatio}</Table.Cell>
                      <Table.Cell>
                        <Badge colorPalette={stockData.pegRatio < 1 ? 'success' : stockData.pegRatio < 2 ? 'warning' : 'danger'} size="sm">
                          {stockData.pegRatio < 1 ? 'Undervalued' : stockData.pegRatio < 2 ? 'Fair' : 'Overvalued'}
                        </Badge>
                      </Table.Cell>
                    </Table.Row>
                  </Table.Body>
                </Table.Root>
              </Card.Body>
            </Card.Root>

            {/* Profitability Ratios */}
            <Card.Root>
              <Card.Body>
                <Text fontWeight="semibold" mb={4}>Profitability Ratios</Text>
                <Table.Root variant="outline" size="sm">
                  <Table.Body>
                    <Table.Row>
                      <Table.Cell>ROE</Table.Cell>
                      <Table.Cell fontWeight="medium">{stockData.roe}%</Table.Cell>
                      <Table.Cell>
                        <Badge colorPalette={stockData.roe > 15 ? 'success' : stockData.roe > 10 ? 'warning' : 'danger'} size="sm">
                          {stockData.roe > 15 ? 'Excellent' : stockData.roe > 10 ? 'Good' : 'Poor'}
                        </Badge>
                      </Table.Cell>
                    </Table.Row>
                    <Table.Row>
                      <Table.Cell>ROA</Table.Cell>
                      <Table.Cell fontWeight="medium">{stockData.roa}%</Table.Cell>
                      <Table.Cell>
                        <Badge colorPalette="success" size="sm">Good</Badge>
                      </Table.Cell>
                    </Table.Row>
                    <Table.Row>
                      <Table.Cell>ROIC</Table.Cell>
                      <Table.Cell fontWeight="medium">{stockData.roic}%</Table.Cell>
                      <Table.Cell>
                        <Badge colorPalette="success" size="sm">Strong</Badge>
                      </Table.Cell>
                    </Table.Row>
                  </Table.Body>
                </Table.Root>
              </Card.Body>
            </Card.Root>

            {/* Financial Health */}
            <Card.Root>
              <Card.Body>
                <Text fontWeight="semibold" mb={4}>Financial Health</Text>
                <Table.Root variant="outline" size="sm">
                  <Table.Body>
                    <Table.Row>
                      <Table.Cell>Debt/Equity</Table.Cell>
                      <Table.Cell fontWeight="medium">{stockData.debtToEquity}</Table.Cell>
                      <Table.Cell>
                        <Badge colorPalette={stockData.debtToEquity < 0.5 ? 'success' : stockData.debtToEquity < 1 ? 'warning' : 'danger'} size="sm">
                          {stockData.debtToEquity < 0.5 ? 'Low Risk' : stockData.debtToEquity < 1 ? 'Moderate' : 'High Risk'}
                        </Badge>
                      </Table.Cell>
                    </Table.Row>
                    <Table.Row>
                      <Table.Cell>Current Ratio</Table.Cell>
                      <Table.Cell fontWeight="medium">{stockData.currentRatio}</Table.Cell>
                      <Table.Cell>
                        <Badge colorPalette="success" size="sm">Healthy</Badge>
                      </Table.Cell>
                    </Table.Row>
                    <Table.Row>
                      <Table.Cell>Quick Ratio</Table.Cell>
                      <Table.Cell fontWeight="medium">{stockData.quickRatio}</Table.Cell>
                      <Table.Cell>
                        <Badge colorPalette="success" size="sm">Good</Badge>
                      </Table.Cell>
                    </Table.Row>
                  </Table.Body>
                </Table.Root>
              </Card.Body>
            </Card.Root>

            {/* Growth Metrics */}
            <Card.Root>
              <Card.Body>
                <Text fontWeight="semibold" mb={4}>Growth Metrics (YoY)</Text>
                <Stack gap={3}>
                  <Box>
                    <Flex justify="space-between" mb={1}>
                      <Text fontSize="sm">Revenue Growth</Text>
                      <Text fontSize="sm" fontWeight="bold" color="success.600">
                        {formatPercentage(stockData.revenueGrowth)}
                      </Text>
                    </Flex>
                    <Progress.Root value={Math.min(stockData.revenueGrowth * 2, 100)} colorPalette="success">
                      <Progress.Track><Progress.Range /></Progress.Track>
                    </Progress.Root>
                  </Box>
                  
                  <Box>
                    <Flex justify="space-between" mb={1}>
                      <Text fontSize="sm">Profit Growth</Text>
                      <Text fontSize="sm" fontWeight="bold" color="success.600">
                        {formatPercentage(stockData.profitGrowth)}
                      </Text>
                    </Flex>
                    <Progress.Root value={Math.min(stockData.profitGrowth * 2, 100)} colorPalette="success">
                      <Progress.Track><Progress.Range /></Progress.Track>
                    </Progress.Root>
                  </Box>
                  
                  <Box>
                    <Flex justify="space-between" mb={1}>
                      <Text fontSize="sm">EPS Growth</Text>
                      <Text fontSize="sm" fontWeight="bold" color="success.600">
                        {formatPercentage(stockData.epsGrowth)}
                      </Text>
                    </Flex>
                    <Progress.Root value={Math.min(stockData.epsGrowth * 2, 100)} colorPalette="success">
                      <Progress.Track><Progress.Range /></Progress.Track>
                    </Progress.Root>
                  </Box>
                </Stack>
              </Card.Body>
            </Card.Root>
          </SimpleGrid>
        </Tabs.Content>

        {/* Technical Analysis Tab */}
        <Tabs.Content value="technical">
          <SimpleGrid columns={{ base: 1, lg: 2 }} gap={6}>
            {/* Technical Indicators */}
            <Card.Root>
              <Card.Body>
                <Text fontWeight="semibold" mb={4}>Technical Indicators</Text>
                <Stack gap={4}>
                  <Box>
                    <Flex justify="space-between" mb={2}>
                      <Text fontSize="sm">RSI (14)</Text>
                      <Flex align="center" gap={2}>
                        <Text fontSize="sm" fontWeight="medium">{stockData.rsi.toFixed(1)}</Text>
                        <Badge colorPalette={getTechnicalSignal(stockData.rsi, 70, 30).color} size="sm">
                          {getTechnicalSignal(stockData.rsi, 70, 30).signal}
                        </Badge>
                      </Flex>
                    </Flex>
                    <Progress.Root value={stockData.rsi} colorPalette="brand">
                      <Progress.Track><Progress.Range /></Progress.Track>
                    </Progress.Root>
                  </Box>
                  
                  <Box>
                    <Flex justify="space-between" mb={1}>
                      <Text fontSize="sm">MACD</Text>
                      <Text fontSize="sm" fontWeight="medium" color={stockData.macd > 0 ? 'success.600' : 'danger.600'}>
                        {stockData.macd.toFixed(2)}
                      </Text>
                    </Flex>
                  </Box>
                </Stack>
              </Card.Body>
            </Card.Root>

            {/* Moving Averages */}
            <Card.Root>
              <Card.Body>
                <Text fontWeight="semibold" mb={4}>Moving Averages</Text>
                <Table.Root variant="outline" size="sm">
                  <Table.Body>
                    <Table.Row>
                      <Table.Cell>SMA 20</Table.Cell>
                      <Table.Cell fontWeight="medium">₹{stockData.sma20.toFixed(2)}</Table.Cell>
                      <Table.Cell>
                        <Badge colorPalette={stockData.currentPrice > stockData.sma20 ? 'success' : 'danger'} size="sm">
                          {stockData.currentPrice > stockData.sma20 ? 'Above' : 'Below'}
                        </Badge>
                      </Table.Cell>
                    </Table.Row>
                    <Table.Row>
                      <Table.Cell>SMA 50</Table.Cell>
                      <Table.Cell fontWeight="medium">₹{stockData.sma50.toFixed(2)}</Table.Cell>
                      <Table.Cell>
                        <Badge colorPalette={stockData.currentPrice > stockData.sma50 ? 'success' : 'danger'} size="sm">
                          {stockData.currentPrice > stockData.sma50 ? 'Above' : 'Below'}
                        </Badge>
                      </Table.Cell>
                    </Table.Row>
                    <Table.Row>
                      <Table.Cell>SMA 200</Table.Cell>
                      <Table.Cell fontWeight="medium">₹{stockData.sma200.toFixed(2)}</Table.Cell>
                      <Table.Cell>
                        <Badge colorPalette={stockData.currentPrice > stockData.sma200 ? 'success' : 'danger'} size="sm">
                          {stockData.currentPrice > stockData.sma200 ? 'Above' : 'Below'}
                        </Badge>
                      </Table.Cell>
                    </Table.Row>
                  </Table.Body>
                </Table.Root>
              </Card.Body>
            </Card.Root>

            {/* Support & Resistance */}
            <Card.Root>
              <Card.Body>
                <Text fontWeight="semibold" mb={4}>Support & Resistance</Text>
                <Stack gap={3}>
                  <Flex justify="space-between" align="center">
                    <Text fontSize="sm" color="danger.600">Resistance 1</Text>
                    <Text fontSize="sm" fontWeight="medium">₹{stockData.bollingerUpper.toFixed(2)}</Text>
                  </Flex>
                  <Flex justify="space-between" align="center">
                    <Text fontSize="sm" color="neutral.600">Current Price</Text>
                    <Text fontSize="sm" fontWeight="bold">₹{stockData.currentPrice.toFixed(2)}</Text>
                  </Flex>
                  <Flex justify="space-between" align="center">
                    <Text fontSize="sm" color="success.600">Support 1</Text>
                    <Text fontSize="sm" fontWeight="medium">₹{stockData.bollingerLower.toFixed(2)}</Text>
                  </Flex>
                </Stack>
              </Card.Body>
            </Card.Root>

            {/* Technical Summary */}
            <Card.Root>
              <Card.Body>
                <Text fontWeight="semibold" mb={4}>Technical Summary</Text>
                <Stack gap={3}>
                  <Flex justify="space-between" align="center">
                    <Text fontSize="sm">Short Term (1-5 days)</Text>
                    <Badge colorPalette="success" size="sm">Bullish</Badge>
                  </Flex>
                  <Flex justify="space-between" align="center">
                    <Text fontSize="sm">Medium Term (1-4 weeks)</Text>
                    <Badge colorPalette="success" size="sm">Bullish</Badge>
                  </Flex>
                  <Flex justify="space-between" align="center">
                    <Text fontSize="sm">Long Term (1-6 months)</Text>
                    <Badge colorPalette="warning" size="sm">Neutral</Badge>
                  </Flex>
                </Stack>
              </Card.Body>
            </Card.Root>
          </SimpleGrid>
        </Tabs.Content>

        {/* AI Analysis Tab */}
        <Tabs.Content value="ai-analysis">
          <SimpleGrid columns={{ base: 1, lg: 2 }} gap={6}>
            <Card.Root layerStyle="card.ai">
              <Card.Body>
                <Flex align="center" gap={2} mb={4}>
                  <Icon color="ai.600"><Activity size={20} /></Icon>
                  <Text fontWeight="semibold">AI Investment Analysis</Text>
                </Flex>
                
                <AIConfidenceIndicator 
                  confidence={stockData.aiScore / 10}
                />
                
                <Stack gap={3} mt={4}>
                  <Box p={3} bg="ai.50" borderRadius="md">
                    <Text fontSize="sm" fontWeight="medium" color="ai.800" mb={1}>
                      Price Prediction
                    </Text>
                    <Text fontSize="xs" color="ai.700">
                      AI models predict 12-month target of ₹{stockData.targetPrice} with 78% confidence
                    </Text>
                  </Box>
                  
                  <Box p={3} bg="success.50" borderRadius="md">
                    <Text fontSize="sm" fontWeight="medium" color="success.800" mb={1}>
                      Key Strengths
                    </Text>
                    <Text fontSize="xs" color="success.700">
                      Strong fundamentals, consistent growth, market leadership
                    </Text>
                  </Box>
                  
                  <Box p={3} bg="warning.50" borderRadius="md">
                    <Text fontSize="sm" fontWeight="medium" color="warning.800" mb={1}>
                      Risk Factors
                    </Text>
                    <Text fontSize="xs" color="warning.700">
                      Cyclical industry, regulatory changes, commodity price volatility
                    </Text>
                  </Box>
                </Stack>
              </Card.Body>
            </Card.Root>

            <Card.Root>
              <Card.Body>
                <Text fontWeight="semibold" mb={4}>AI Scoring Breakdown</Text>
                <Stack gap={4}>
                  <Box>
                    <Flex justify="space-between" mb={1}>
                      <Text fontSize="sm">Financial Strength</Text>
                      <Text fontSize="sm" fontWeight="bold" color="success.600">9.2/10</Text>
                    </Flex>
                    <Progress.Root value={92} colorPalette="success">
                      <Progress.Track><Progress.Range /></Progress.Track>
                    </Progress.Root>
                  </Box>
                  
                  <Box>
                    <Flex justify="space-between" mb={1}>
                      <Text fontSize="sm">Growth Prospects</Text>
                      <Text fontSize="sm" fontWeight="bold" color="success.600">8.5/10</Text>
                    </Flex>
                    <Progress.Root value={85} colorPalette="success">
                      <Progress.Track><Progress.Range /></Progress.Track>
                    </Progress.Root>
                  </Box>
                  
                  <Box>
                    <Flex justify="space-between" mb={1}>
                      <Text fontSize="sm">Valuation</Text>
                      <Text fontSize="sm" fontWeight="bold" color="warning.600">7.2/10</Text>
                    </Flex>
                    <Progress.Root value={72} colorPalette="warning">
                      <Progress.Track><Progress.Range /></Progress.Track>
                    </Progress.Root>
                  </Box>
                  
                  <Box>
                    <Flex justify="space-between" mb={1}>
                      <Text fontSize="sm">Technical Momentum</Text>
                      <Text fontSize="sm" fontWeight="bold" color="success.600">8.8/10</Text>
                    </Flex>
                    <Progress.Root value={88} colorPalette="success">
                      <Progress.Track><Progress.Range /></Progress.Track>
                    </Progress.Root>
                  </Box>
                  
                  <Box>
                    <Flex justify="space-between" mb={1}>
                      <Text fontSize="sm">Market Sentiment</Text>
                      <Text fontSize="sm" fontWeight="bold" color="success.600">8.1/10</Text>
                    </Flex>
                    <Progress.Root value={81} colorPalette="success">
                      <Progress.Track><Progress.Range /></Progress.Track>
                    </Progress.Root>
                  </Box>
                </Stack>
              </Card.Body>
            </Card.Root>
          </SimpleGrid>
        </Tabs.Content>

        {/* News & Sentiment Tab */}
        <Tabs.Content value="news-sentiment">
          <SimpleGrid columns={{ base: 1, lg: 2 }} gap={6}>
            <Card.Root>
              <Card.Body>
                <Flex align="center" gap={2} mb={4}>
                  <Icon color="brand.600"><Users size={20} /></Icon>
                  <Text fontWeight="semibold">Market Sentiment</Text>
                </Flex>
                
                <Stack gap={4}>
                  <Box>
                    <Flex justify="space-between" mb={1}>
                      <Text fontSize="sm">News Sentiment</Text>
                      <Text fontSize="sm" fontWeight="bold" color="success.600">
                        {(stockData.newsSentiment * 100).toFixed(0)}% Positive
                      </Text>
                    </Flex>
                    <Progress.Root value={stockData.newsSentiment * 100} colorPalette="success">
                      <Progress.Track><Progress.Range /></Progress.Track>
                    </Progress.Root>
                  </Box>
                  
                  <Box>
                    <Flex justify="space-between" mb={1}>
                      <Text fontSize="sm">Analyst Rating</Text>
                      <Text fontSize="sm" fontWeight="bold" color="success.600">
                        {stockData.analystRating.toFixed(1)}/5.0
                      </Text>
                    </Flex>
                    <Progress.Root value={stockData.analystRating * 20} colorPalette="success">
                      <Progress.Track><Progress.Range /></Progress.Track>
                    </Progress.Root>
                  </Box>
                  
                  <Box>
                    <Flex justify="space-between" mb={1}>
                      <Text fontSize="sm">Institutional Holding</Text>
                      <Text fontSize="sm" fontWeight="bold" color="brand.600">
                        {stockData.institutionalHolding.toFixed(1)}%
                      </Text>
                    </Flex>
                    <Progress.Root value={stockData.institutionalHolding} colorPalette="brand">
                      <Progress.Track><Progress.Range /></Progress.Track>
                    </Progress.Root>
                  </Box>
                </Stack>
              </Card.Body>
            </Card.Root>

            <Card.Root>
              <Card.Body>
                <Text fontWeight="semibold" mb={4}>Recent News</Text>
                <Stack gap={3}>
                  <Box p={3} bg="success.50" borderRadius="md" borderLeft="3px solid" borderColor="success.500">
                    <Text fontSize="sm" fontWeight="medium" color="success.800">
                      Q3 Results Beat Estimates
                    </Text>
                    <Text fontSize="xs" color="success.700" mb={1}>
                      Revenue grows 18.5% YoY, profit margin expands
                    </Text>
                    <Text fontSize="xs" color="neutral.600">Economic Times • 2 hours ago</Text>
                  </Box>
                  
                  <Box p={3} bg="brand.50" borderRadius="md" borderLeft="3px solid" borderColor="brand.500">
                    <Text fontSize="sm" fontWeight="medium" color="brand.800">
                      New Expansion Plans Announced
                    </Text>
                    <Text fontSize="xs" color="brand.700" mb={1}>
                      Company to invest ₹50,000 Cr in renewable energy
                    </Text>
                    <Text fontSize="xs" color="neutral.600">Business Standard • 1 day ago</Text>
                  </Box>
                  
                  <Box p={3} bg="warning.50" borderRadius="md" borderLeft="3px solid" borderColor="warning.500">
                    <Text fontSize="sm" fontWeight="medium" color="warning.800">
                      Analyst Upgrades Target Price
                    </Text>
                    <Text fontSize="xs" color="warning.700" mb={1}>
                      Morgan Stanley raises target to ₹3,200 from ₹2,950
                    </Text>
                    <Text fontSize="xs" color="neutral.600">Moneycontrol • 3 days ago</Text>
                  </Box>
                </Stack>
              </Card.Body>
            </Card.Root>
          </SimpleGrid>
        </Tabs.Content>
      </Tabs.Root>
    </Box>
  );
};