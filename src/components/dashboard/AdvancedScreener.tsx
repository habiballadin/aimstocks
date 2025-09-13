import React, { useState } from 'react';
import { 
  Card, 
  Text, 
  Box, 
  Flex, 
  Table,
  Icon,
  Button,
  Badge,
  Input,
  Stack,
  SimpleGrid,
  Slider,
  Checkbox,
  Accordion,
  NumberInput
} from '@chakra-ui/react';
import { 
  Search, 
  Filter, 
  Download,
  Bookmark,
  BarChart3,
  DollarSign,
  Percent,
  Activity
} from 'lucide-react';
import { PriceDisplay } from '../common/PriceDisplay';
import { formatCurrency, formatPercentage } from '../../utils/formatters';

interface ScreenerCriteria {
  marketCap: { min: number; max: number };
  price: { min: number; max: number };
  volume: { min: number; max: number };
  peRatio: { min: number; max: number };
  pbRatio: { min: number; max: number };
  roe: { min: number; max: number };
  debtToEquity: { min: number; max: number };
  dividendYield: { min: number; max: number };
  revenueGrowth: { min: number; max: number };
  profitGrowth: { min: number; max: number };
  sectors: string[];
  exchanges: string[];
}

interface ScreenerResult {
  symbol: string;
  companyName: string;
  sector: string;
  currentPrice: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap: number;
  peRatio: number;
  pbRatio: number;
  roe: number;
  debtToEquity: number;
  dividendYield: number;
  revenueGrowth: number;
  profitGrowth: number;
  aiScore: number;
  recommendation: 'STRONG_BUY' | 'BUY' | 'HOLD' | 'SELL' | 'STRONG_SELL';
}

export const AdvancedScreener: React.FC = () => {
  const [criteria, setCriteria] = useState<ScreenerCriteria>({
    marketCap: { min: 0, max: 1000000 },
    price: { min: 0, max: 10000 },
    volume: { min: 0, max: 10000000 },
    peRatio: { min: 0, max: 100 },
    pbRatio: { min: 0, max: 10 },
    roe: { min: 0, max: 50 },
    debtToEquity: { min: 0, max: 5 },
    dividendYield: { min: 0, max: 10 },
    revenueGrowth: { min: -50, max: 100 },
    profitGrowth: { min: -50, max: 100 },
    sectors: [],
    exchanges: ['NSE', 'BSE']
  });

  const [results] = useState<ScreenerResult[]>([
    {
      symbol: 'RELIANCE',
      companyName: 'Reliance Industries Limited',
      sector: 'Energy',
      currentPrice: 2847.65,
      change: 45.20,
      changePercent: 1.61,
      volume: 2547890,
      marketCap: 19250000000000,
      peRatio: 25.4,
      pbRatio: 2.8,
      roe: 12.5,
      debtToEquity: 0.35,
      dividendYield: 0.8,
      revenueGrowth: 15.2,
      profitGrowth: 18.7,
      aiScore: 8.5,
      recommendation: 'BUY'
    },
    {
      symbol: 'TCS',
      companyName: 'Tata Consultancy Services',
      sector: 'Technology',
      currentPrice: 4125.30,
      change: -25.70,
      changePercent: -0.62,
      volume: 1234567,
      marketCap: 15100000000000,
      peRatio: 28.9,
      pbRatio: 12.4,
      roe: 42.8,
      debtToEquity: 0.05,
      dividendYield: 2.1,
      revenueGrowth: 12.8,
      profitGrowth: 14.3,
      aiScore: 9.2,
      recommendation: 'STRONG_BUY'
    },
    {
      symbol: 'HDFC',
      companyName: 'HDFC Bank Limited',
      sector: 'Financial Services',
      currentPrice: 1654.75,
      change: -12.30,
      changePercent: -0.74,
      volume: 4567890,
      marketCap: 12500000000000,
      peRatio: 19.2,
      pbRatio: 2.9,
      roe: 16.8,
      debtToEquity: 0.12,
      dividendYield: 1.5,
      revenueGrowth: 18.5,
      profitGrowth: 22.1,
      aiScore: 8.8,
      recommendation: 'BUY'
    }
  ]);

  const [savedScreens, setSavedScreens] = useState<string[]>([]);
  const [screenName, setScreenName] = useState('');

  const sectors = [
    'Technology', 'Financial Services', 'Energy', 'Healthcare', 
    'Consumer Goods', 'Industrials', 'Materials', 'Telecommunications',
    'Utilities', 'Real Estate'
  ];

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

  const runScreen = () => {
    // In a real app, this would make an API call with the criteria
    console.log('Running screen with criteria:', criteria);
    // Use setResults in a real implementation
    // setResults(filteredResults);
  };

  const saveScreen = () => {
    if (screenName.trim()) {
      setSavedScreens([...savedScreens, screenName]);
      setScreenName('');
    }
  };

  const exportResults = () => {
    // In a real app, this would export to CSV/Excel
    console.log('Exporting results:', results);
  };

  return (
    <Card.Root>
      <Card.Body>
        <Flex justify="space-between" align="center" mb={6}>
          <Flex align="center" gap={3}>
            <Icon color="brand.600">
              <Search size={24} />
            </Icon>
            <Box>
              <Text textStyle="heading.md" color="neutral.900">
                Advanced Stock Screener
              </Text>
              <Text fontSize="sm" color="neutral.600">
                Filter stocks by fundamental and technical criteria
              </Text>
            </Box>
          </Flex>
          <Flex gap={2}>
            <Button size="sm" variant="outline" onClick={exportResults}>
              <Icon><Download size={16} /></Icon>
              Export
            </Button>
            <Button size="sm" colorPalette="brand" onClick={runScreen}>
              <Icon><Filter size={16} /></Icon>
              Run Screen
            </Button>
          </Flex>
        </Flex>

        <SimpleGrid columns={{ base: 1, lg: 4 }} gap={6}>
          {/* Screening Criteria */}
          <Box gridColumn={{ base: 1, lg: '1 / 2' }}>
            <Card.Root variant="outline">
              <Card.Body>
                <Text fontWeight="semibold" color="neutral.900" mb={4}>
                  Screening Criteria
                </Text>

                <Accordion.Root multiple>
                  {/* Market Data Filters */}
                  <Accordion.Item value="market">
                    <Accordion.ItemTrigger>
                      <Icon><BarChart3 size={16} /></Icon>
                      Market Data
                    </Accordion.ItemTrigger>
                    <Accordion.ItemContent>
                      <Stack gap={4}>
                        <Box>
                          <Text fontSize="sm" fontWeight="medium" mb={2}>Market Cap (Cr)</Text>
                          <Flex gap={2}>
                            <NumberInput.Root 
                              value={criteria.marketCap.min.toString()}
                              onValueChange={(e) => setCriteria(prev => ({
                                ...prev,
                                marketCap: { ...prev.marketCap, min: parseFloat(e.value) || 0 }
                              }))}
                              size="sm"
                            >
                              <NumberInput.Input placeholder="Min" />
                            </NumberInput.Root>
                            <NumberInput.Root 
                              value={criteria.marketCap.max.toString()}
                              onValueChange={(e) => setCriteria(prev => ({
                                ...prev,
                                marketCap: { ...prev.marketCap, max: parseFloat(e.value) || 0 }
                              }))}
                              size="sm"
                            >
                              <NumberInput.Input placeholder="Max" />
                            </NumberInput.Root>
                          </Flex>
                        </Box>

                        <Box>
                          <Text fontSize="sm" fontWeight="medium" mb={2}>Price Range (₹)</Text>
                          <Flex gap={2}>
                            <NumberInput.Root 
                              value={criteria.price.min.toString()}
                              onValueChange={(e) => setCriteria(prev => ({
                                ...prev,
                                price: { ...prev.price, min: parseFloat(e.value) || 0 }
                              }))}
                              size="sm"
                            >
                              <NumberInput.Input placeholder="Min" />
                            </NumberInput.Root>
                            <NumberInput.Root 
                              value={criteria.price.max.toString()}
                              onValueChange={(e) => setCriteria(prev => ({
                                ...prev,
                                price: { ...prev.price, max: parseFloat(e.value) || 0 }
                              }))}
                              size="sm"
                            >
                              <NumberInput.Input placeholder="Max" />
                            </NumberInput.Root>
                          </Flex>
                        </Box>

                        <Box>
                          <Text fontSize="sm" fontWeight="medium" mb={2}>Volume</Text>
                          <Flex gap={2}>
                            <NumberInput.Root 
                              value={criteria.volume.min.toString()}
                              onValueChange={(e) => setCriteria(prev => ({
                                ...prev,
                                volume: { ...prev.volume, min: parseFloat(e.value) || 0 }
                              }))}
                              size="sm"
                            >
                              <NumberInput.Input placeholder="Min" />
                            </NumberInput.Root>
                            <NumberInput.Root 
                              value={criteria.volume.max.toString()}
                              onValueChange={(e) => setCriteria(prev => ({
                                ...prev,
                                volume: { ...prev.volume, max: parseFloat(e.value) || 0 }
                              }))}
                              size="sm"
                            >
                              <NumberInput.Input placeholder="Max" />
                            </NumberInput.Root>
                          </Flex>
                        </Box>
                      </Stack>
                    </Accordion.ItemContent>
                  </Accordion.Item>

                  {/* Fundamental Filters */}
                  <Accordion.Item value="fundamental">
                    <Accordion.ItemTrigger>
                      <Icon><DollarSign size={16} /></Icon>
                      Fundamental Ratios
                    </Accordion.ItemTrigger>
                    <Accordion.ItemContent>
                      <Stack gap={4}>
                        <Box>
                          <Text fontSize="sm" fontWeight="medium" mb={2}>P/E Ratio</Text>
                          <Slider.Root
                            value={[criteria.peRatio.min, criteria.peRatio.max]}
                            onValueChange={(e) => setCriteria(prev => ({
                              ...prev,
                              peRatio: { min: e.value[0], max: e.value[1] }
                            }))}
                            min={0}
                            max={100}
                            step={1}
                          >
                            <Slider.Control>
                              <Slider.Track>
                                <Slider.Range />
                              </Slider.Track>
                              <Slider.Thumb index={0} />
                              <Slider.Thumb index={1} />
                            </Slider.Control>
                          </Slider.Root>
                          <Flex justify="space-between" fontSize="xs" color="neutral.600">
                            <Text>{criteria.peRatio.min}</Text>
                            <Text>{criteria.peRatio.max}</Text>
                          </Flex>
                        </Box>

                        <Box>
                          <Text fontSize="sm" fontWeight="medium" mb={2}>P/B Ratio</Text>
                          <Slider.Root
                            value={[criteria.pbRatio.min, criteria.pbRatio.max]}
                            onValueChange={(e) => setCriteria(prev => ({
                              ...prev,
                              pbRatio: { min: e.value[0], max: e.value[1] }
                            }))}
                            min={0}
                            max={10}
                            step={0.1}
                          >
                            <Slider.Control>
                              <Slider.Track>
                                <Slider.Range />
                              </Slider.Track>
                              <Slider.Thumb index={0} />
                              <Slider.Thumb index={1} />
                            </Slider.Control>
                          </Slider.Root>
                          <Flex justify="space-between" fontSize="xs" color="neutral.600">
                            <Text>{criteria.pbRatio.min.toFixed(1)}</Text>
                            <Text>{criteria.pbRatio.max.toFixed(1)}</Text>
                          </Flex>
                        </Box>

                        <Box>
                          <Text fontSize="sm" fontWeight="medium" mb={2}>ROE (%)</Text>
                          <Slider.Root
                            value={[criteria.roe.min, criteria.roe.max]}
                            onValueChange={(e) => setCriteria(prev => ({
                              ...prev,
                              roe: { min: e.value[0], max: e.value[1] }
                            }))}
                            min={0}
                            max={50}
                            step={1}
                          >
                            <Slider.Control>
                              <Slider.Track>
                                <Slider.Range />
                              </Slider.Track>
                              <Slider.Thumb index={0} />
                              <Slider.Thumb index={1} />
                            </Slider.Control>
                          </Slider.Root>
                          <Flex justify="space-between" fontSize="xs" color="neutral.600">
                            <Text>{criteria.roe.min}%</Text>
                            <Text>{criteria.roe.max}%</Text>
                          </Flex>
                        </Box>
                      </Stack>
                    </Accordion.ItemContent>
                  </Accordion.Item>

                  {/* Growth Filters */}
                  <Accordion.Item value="growth">
                    <Accordion.ItemTrigger>
                      <Icon><Percent size={16} /></Icon>
                      Growth Metrics
                    </Accordion.ItemTrigger>
                    <Accordion.ItemContent>
                      <Stack gap={4}>
                        <Box>
                          <Text fontSize="sm" fontWeight="medium" mb={2}>Revenue Growth (%)</Text>
                          <Slider.Root
                            value={[criteria.revenueGrowth.min, criteria.revenueGrowth.max]}
                            onValueChange={(e) => setCriteria(prev => ({
                              ...prev,
                              revenueGrowth: { min: e.value[0], max: e.value[1] }
                            }))}
                            min={-50}
                            max={100}
                            step={1}
                          >
                            <Slider.Control>
                              <Slider.Track>
                                <Slider.Range />
                              </Slider.Track>
                              <Slider.Thumb index={0} />
                              <Slider.Thumb index={1} />
                            </Slider.Control>
                          </Slider.Root>
                          <Flex justify="space-between" fontSize="xs" color="neutral.600">
                            <Text>{criteria.revenueGrowth.min}%</Text>
                            <Text>{criteria.revenueGrowth.max}%</Text>
                          </Flex>
                        </Box>

                        <Box>
                          <Text fontSize="sm" fontWeight="medium" mb={2}>Profit Growth (%)</Text>
                          <Slider.Root
                            value={[criteria.profitGrowth.min, criteria.profitGrowth.max]}
                            onValueChange={(e) => setCriteria(prev => ({
                              ...prev,
                              profitGrowth: { min: e.value[0], max: e.value[1] }
                            }))}
                            min={-50}
                            max={100}
                            step={1}
                          >
                            <Slider.Control>
                              <Slider.Track>
                                <Slider.Range />
                              </Slider.Track>
                              <Slider.Thumb index={0} />
                              <Slider.Thumb index={1} />
                            </Slider.Control>
                          </Slider.Root>
                          <Flex justify="space-between" fontSize="xs" color="neutral.600">
                            <Text>{criteria.profitGrowth.min}%</Text>
                            <Text>{criteria.profitGrowth.max}%</Text>
                          </Flex>
                        </Box>
                      </Stack>
                    </Accordion.ItemContent>
                  </Accordion.Item>

                  {/* Sector Filter */}
                  <Accordion.Item value="sector">
                    <Accordion.ItemTrigger>
                      <Icon><Activity size={16} /></Icon>
                      Sectors
                    </Accordion.ItemTrigger>
                    <Accordion.ItemContent>
                      <Stack gap={2}>
                        {sectors.map((sector) => (
                          <Checkbox.Root
                            key={sector}
                            checked={criteria.sectors.includes(sector)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setCriteria(prev => ({
                                  ...prev,
                                  sectors: [...prev.sectors, sector]
                                }));
                              } else {
                                setCriteria(prev => ({
                                  ...prev,
                                  sectors: prev.sectors.filter(s => s !== sector)
                                }));
                              }
                            }}
                            size="sm"
                          >
                            <Checkbox.Control>
                              <Checkbox.Indicator />
                            </Checkbox.Control>
                            <Checkbox.Label fontSize="sm">{sector}</Checkbox.Label>
                          </Checkbox.Root>
                        ))}
                      </Stack>
                    </Accordion.ItemContent>
                  </Accordion.Item>
                </Accordion.Root>

                {/* Save Screen */}
                <Box mt={6} pt={4} borderTop="1px solid" borderColor="neutral.200">
                  <Text fontSize="sm" fontWeight="medium" mb={2}>Save Screen</Text>
                  <Flex gap={2}>
                    <Input 
                      placeholder="Screen name"
                      value={screenName}
                      onChange={(e) => setScreenName(e.target.value)}
                      size="sm"
                    />
                    <Button size="sm" onClick={saveScreen}>
                      <Icon><Bookmark size={14} /></Icon>
                    </Button>
                  </Flex>
                </Box>
              </Card.Body>
            </Card.Root>
          </Box>

          {/* Results */}
          <Box gridColumn={{ base: 1, lg: '2 / 5' }}>
            <Text fontWeight="semibold" color="neutral.900" mb={4}>
              Screening Results ({results.length} stocks found)
            </Text>

            <Table.Root size="sm">
              <Table.Header>
                <Table.Row>
                  <Table.ColumnHeader>Stock</Table.ColumnHeader>
                  <Table.ColumnHeader>Price</Table.ColumnHeader>
                  <Table.ColumnHeader>Change</Table.ColumnHeader>
                  <Table.ColumnHeader>Market Cap</Table.ColumnHeader>
                  <Table.ColumnHeader>P/E</Table.ColumnHeader>
                  <Table.ColumnHeader>ROE</Table.ColumnHeader>
                  <Table.ColumnHeader>Growth</Table.ColumnHeader>
                  <Table.ColumnHeader>AI Score</Table.ColumnHeader>
                  <Table.ColumnHeader>Recommendation</Table.ColumnHeader>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {results.map((result) => (
                  <Table.Row key={result.symbol} _hover={{ bg: 'neutral.50' }}>
                    <Table.Cell>
                      <Box>
                        <Text fontWeight="semibold" color="neutral.900">
                          {result.symbol}
                        </Text>
                        <Text fontSize="xs" color="neutral.600">
                          {result.sector}
                        </Text>
                      </Box>
                    </Table.Cell>
                    <Table.Cell>
                      <PriceDisplay 
                        price={result.currentPrice}
                        change={0}
                        changePercent={0}
                        size="sm"
                        showIcon={false}
                      />
                    </Table.Cell>
                    <Table.Cell>
                      <PriceDisplay 
                        price={0}
                        change={result.change}
                        changePercent={result.changePercent}
                        size="sm"
                      />
                    </Table.Cell>
                    <Table.Cell>
                      <Text fontSize="sm" color="neutral.700">
                        {formatCurrency(result.marketCap / 10000000)}Cr
                      </Text>
                    </Table.Cell>
                    <Table.Cell>
                      <Text fontSize="sm" color="neutral.700">
                        {result.peRatio.toFixed(1)}
                      </Text>
                    </Table.Cell>
                    <Table.Cell>
                      <Text fontSize="sm" color="neutral.700">
                        {result.roe.toFixed(1)}%
                      </Text>
                    </Table.Cell>
                    <Table.Cell>
                      <Stack gap={0}>
                        <Text fontSize="xs" color="success.600">
                          Rev: {formatPercentage(result.revenueGrowth)}
                        </Text>
                        <Text fontSize="xs" color="success.600">
                          Profit: {formatPercentage(result.profitGrowth)}
                        </Text>
                      </Stack>
                    </Table.Cell>
                    <Table.Cell>
                      <Text 
                        fontSize="sm" 
                        fontWeight="bold"
                        color={result.aiScore >= 8 ? 'success.600' : 
                               result.aiScore >= 6 ? 'warning.600' : 'danger.600'}
                      >
                        {result.aiScore.toFixed(1)}/10
                      </Text>
                    </Table.Cell>
                    <Table.Cell>
                      <Badge 
                        colorPalette={getRecommendationColor(result.recommendation)}
                        size="sm"
                      >
                        {result.recommendation}
                      </Badge>
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table.Root>
          </Box>
        </SimpleGrid>
      </Card.Body>
    </Card.Root>
  );
};