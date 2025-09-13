import React from 'react';
import { Card, Grid, Text, Badge, Button, Progress } from '@chakra-ui/react';
import { Lightbulb, TrendingUp, TrendingDown, Target, Star } from 'lucide-react';

interface RecommendationData {
  symbol: string;
  action: string;
  confidence: number;
  reasoning: string;
}

interface SmartRecommendationsProps {
  data: RecommendationData[];
}

export const SmartRecommendations: React.FC<SmartRecommendationsProps> = ({ data }) => {
  const getActionColor = (action: string) => {
    switch (action) {
      case 'BUY': return 'success';
      case 'SELL': return 'danger';
      case 'HOLD': return 'warning';
      default: return 'neutral';
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'BUY': return <TrendingUp size={16} />;
      case 'SELL': return <TrendingDown size={16} />;
      case 'HOLD': return <Target size={16} />;
      default: return <Target size={16} />;
    }
  };

  return (
    <div className="space-y-6">
      {/* AI Recommendations */}
      <div className="space-y-4">
        {data.map((recommendation, index) => (
          <Card.Root key={index} className="hover:shadow-lg transition-shadow">
            <Card.Body>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-ai-400 to-ai-600 rounded-lg flex items-center justify-center text-white font-bold">
                    {recommendation.symbol.slice(0, 2)}
                  </div>
                  <div>
                    <Text className="font-semibold text-lg">{recommendation.symbol}</Text>
                    <div className="flex items-center gap-2">
                      <Badge 
                        colorPalette={getActionColor(recommendation.action)} 
                        variant="solid"
                        className="flex items-center gap-1"
                      >
                        {getActionIcon(recommendation.action)}
                        {recommendation.action}
                      </Badge>
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, starIndex) => (
                          <Star 
                            key={starIndex}
                            size={14}
                            color={starIndex < Math.floor(recommendation.confidence / 20) ? '#d69e2e' : '#a0aec0'}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <Text className="text-sm text-neutral-600">Confidence</Text>
                  <Text className="text-2xl font-bold text-ai-600">{recommendation.confidence}%</Text>
                </div>
              </div>

              <div className="mb-4">
                <Text className="text-sm font-medium mb-2">AI Reasoning</Text>
                <Text className="text-sm text-neutral-700 bg-neutral-50 p-3 rounded-lg">
                  {recommendation.reasoning}
                </Text>
              </div>

              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <Text className="text-sm font-medium">Confidence Level</Text>
                  <Text className="text-sm text-neutral-600">{recommendation.confidence}%</Text>
                </div>
                <Progress.Root 
                  value={recommendation.confidence} 
                  max={100}
                  colorPalette={getActionColor(recommendation.action)}
                >
                  <Progress.Track>
                    <Progress.Range />
                  </Progress.Track>
                </Progress.Root>
              </div>

              <div className="flex gap-2">
                <Button size="sm" variant="outline" className="flex-1">
                  View Analysis
                </Button>
                <Button 
                  size="sm" 
                  colorPalette={getActionColor(recommendation.action)} 
                  className="flex-1"
                >
                  Execute {recommendation.action}
                </Button>
              </div>
            </Card.Body>
          </Card.Root>
        ))}
      </div>

      {/* Recommendation Categories */}
      <Grid templateColumns={{ base: '1fr', md: 'repeat(3, 1fr)' }} gap={6}>
        <Card.Root>
          <Card.Body>
            <div className="flex items-center gap-3 mb-4">
              <TrendingUp size={20} color="#38a169" />
              <Text className="font-semibold">Growth Opportunities</Text>
            </div>
            <div className="space-y-3">
              {[
                { symbol: 'NVDA', potential: '+25%', risk: 'Medium' },
                { symbol: 'TSLA', potential: '+18%', risk: 'High' },
                { symbol: 'AMZN', potential: '+12%', risk: 'Low' }
              ].map((stock, index) => (
                <div key={index} className="flex justify-between items-center p-2 bg-success-50 rounded">
                  <Text className="font-medium">{stock.symbol}</Text>
                  <div className="text-right">
                    <Text className="text-sm font-semibold text-success-600">{stock.potential}</Text>
                    <Text className="text-xs text-neutral-600">{stock.risk} risk</Text>
                  </div>
                </div>
              ))}
            </div>
          </Card.Body>
        </Card.Root>

        <Card.Root>
          <Card.Body>
            <div className="flex items-center gap-3 mb-4">
              <Target size={20} color="#d69e2e" />
              <Text className="font-semibold">Value Picks</Text>
            </div>
            <div className="space-y-3">
              {[
                { symbol: 'MSFT', discount: '15%', score: 8.5 },
                { symbol: 'GOOGL', discount: '12%', score: 8.2 },
                { symbol: 'AAPL', discount: '8%', score: 7.9 }
              ].map((stock, index) => (
                <div key={index} className="flex justify-between items-center p-2 bg-warning-50 rounded">
                  <Text className="font-medium">{stock.symbol}</Text>
                  <div className="text-right">
                    <Text className="text-sm font-semibold text-warning-600">{stock.discount} below fair</Text>
                    <Text className="text-xs text-neutral-600">Score: {stock.score}</Text>
                  </div>
                </div>
              ))}
            </div>
          </Card.Body>
        </Card.Root>

        <Card.Root>
          <Card.Body>
            <div className="flex items-center gap-3 mb-4">
              <TrendingDown size={20} color="#e53e3e" />
              <Text className="font-semibold">Risk Alerts</Text>
            </div>
            <div className="space-y-3">
              {[
                { symbol: 'META', risk: 'Overvalued', level: 'High' },
                { symbol: 'NFLX', risk: 'Earnings risk', level: 'Medium' },
                { symbol: 'SNAP', risk: 'Technical breakdown', level: 'High' }
              ].map((stock, index) => (
                <div key={index} className="flex justify-between items-center p-2 bg-danger-50 rounded">
                  <Text className="font-medium">{stock.symbol}</Text>
                  <div className="text-right">
                    <Text className="text-sm font-semibold text-danger-600">{stock.risk}</Text>
                    <Text className="text-xs text-neutral-600">{stock.level} risk</Text>
                  </div>
                </div>
              ))}
            </div>
          </Card.Body>
        </Card.Root>
      </Grid>

      {/* AI Insights */}
      <Card.Root>
        <Card.Body>
          <div className="flex items-center gap-3 mb-6">
            <Lightbulb size={24} color="#3182ce" />
            <div>
              <Text className="text-lg font-semibold">AI Market Insights</Text>
              <Text className="text-sm text-neutral-600">
                Key market insights and recommendations from our AI models
              </Text>
            </div>
          </div>

          <div className="space-y-4">
            <div className="p-4 bg-ai-50 border border-ai-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Lightbulb size={16} color="#3182ce" />
                <Text className="font-medium text-ai-800">Market Opportunity</Text>
              </div>
              <Text className="text-sm text-ai-700">
                Tech sector showing strong momentum with 78% of AI models predicting continued growth. 
                Consider increasing exposure to cloud computing and AI infrastructure stocks.
              </Text>
            </div>

            <div className="p-4 bg-warning-50 border border-warning-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Target size={16} color="#d69e2e" />
                <Text className="font-medium text-warning-800">Portfolio Rebalancing</Text>
              </div>
              <Text className="text-sm text-warning-700">
                Your portfolio shows high correlation risk in tech holdings. Consider diversifying 
                into defensive sectors like utilities and consumer staples.
              </Text>
            </div>

            <div className="p-4 bg-success-50 border border-success-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp size={16} color="#38a169" />
                <Text className="font-medium text-success-800">Earnings Season</Text>
              </div>
              <Text className="text-sm text-success-700">
                Q4 earnings season approaching with 85% of tracked companies expected to beat estimates. 
                Focus on quality growth stocks with strong fundamentals.
              </Text>
            </div>
          </div>
        </Card.Body>
      </Card.Root>
    </div>
  );
};