import React from 'react';
import { Card, Grid, Text, Badge, Progress, Button } from '@chakra-ui/react';
import { TrendingUp, TrendingDown, Target, Zap } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

interface PredictionData {
  symbol: string;
  currentPrice: number;
  predictedPrice: number;
  confidence: string;
  timeframe: string;
  factors: string[];
}

interface PredictiveAnalyticsProps {
  data: PredictionData[];
}

export const PredictiveAnalytics: React.FC<PredictiveAnalyticsProps> = ({ data }) => {
  const getConfidenceColor = (confidence: string) => {
    switch (confidence) {
      case 'VERY_HIGH': return 'success';
      case 'HIGH': return 'success';
      case 'MEDIUM': return 'warning';
      case 'LOW': return 'orange';
      case 'VERY_LOW': return 'danger';
      default: return 'neutral';
    }
  };

  const getConfidenceValue = (confidence: string) => {
    switch (confidence) {
      case 'VERY_HIGH': return 95;
      case 'HIGH': return 80;
      case 'MEDIUM': return 60;
      case 'LOW': return 40;
      case 'VERY_LOW': return 20;
      default: return 50;
    }
  };

  const getPredictionDirection = (current: number, predicted: number) => {
    return predicted > current ? 'up' : 'down';
  };

  const getPredictionChange = (current: number, predicted: number) => {
    return ((predicted - current) / current) * 100;
  };

  return (
    <div className="space-y-6">
      {/* Predictions Grid */}
      <Grid templateColumns={{ base: '1fr', lg: 'repeat(2, 1fr)' }} gap={6}>
        {data.map((prediction, index) => {
          const direction = getPredictionDirection(prediction.currentPrice, prediction.predictedPrice);
          const change = getPredictionChange(prediction.currentPrice, prediction.predictedPrice);
          
          return (
            <Card.Root key={index} className="hover:shadow-lg transition-shadow">
              <Card.Body>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-ai-400 to-ai-600 rounded-lg flex items-center justify-center text-white font-bold">
                      {prediction.symbol.slice(0, 2)}
                    </div>
                    <div>
                      <Text className="font-semibold text-lg">{prediction.symbol}</Text>
                      <Text className="text-sm text-neutral-600">{prediction.timeframe} prediction</Text>
                    </div>
                  </div>
                  
                  <Badge colorPalette={getConfidenceColor(prediction.confidence)} variant="solid">
                    {prediction.confidence}
                  </Badge>
                </div>

                <Grid templateColumns="repeat(2, 1fr)" gap={4} className="mb-4">
                  <div className="text-center p-3 bg-neutral-50 rounded-lg">
                    <Text className="text-sm text-neutral-600">Current Price</Text>
                    <Text className="text-xl font-bold">{formatCurrency(prediction.currentPrice)}</Text>
                  </div>
                  <div className="text-center p-3 bg-ai-50 rounded-lg">
                    <Text className="text-sm text-ai-600">Predicted Price</Text>
                    <Text className="text-xl font-bold text-ai-700">{formatCurrency(prediction.predictedPrice)}</Text>
                  </div>
                </Grid>

                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <Text className="text-sm font-medium">Price Movement</Text>
                    <div className={`flex items-center gap-1 ${
                      direction === 'up' ? 'text-success-600' : 'text-danger-600'
                    }`}>
                      {direction === 'up' ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                      <Text className="font-semibold">
                        {direction === 'up' ? '+' : ''}{change.toFixed(2)}%
                      </Text>
                    </div>
                  </div>
                  
                  <div className="mb-2">
                    <Text className="text-sm text-neutral-600">Confidence Level</Text>
                  </div>
                  <Progress.Root 
                    value={getConfidenceValue(prediction.confidence)} 
                    max={100}
                    colorPalette={getConfidenceColor(prediction.confidence)}
                  >
                    <Progress.Track>
                      <Progress.Range />
                    </Progress.Track>
                  </Progress.Root>
                </div>

                <div className="mb-4">
                  <Text className="text-sm font-medium mb-2">Key Factors</Text>
                  <div className="flex flex-wrap gap-1">
                    {prediction.factors.map((factor, factorIndex) => (
                      <Badge key={factorIndex} variant="outline" size="sm">
                        {factor}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="flex-1">
                    View Details
                  </Button>
                  <Button size="sm" colorPalette="ai" className="flex-1">
                    <Target size={14} />
                    Set Alert
                  </Button>
                </div>
              </Card.Body>
            </Card.Root>
          );
        })}
      </Grid>

      {/* Model Performance */}
      <Card.Root>
        <Card.Body>
          <div className="flex items-center gap-3 mb-6">
            <Zap size={24} />
            <div>
              <Text className="text-lg font-semibold">Model Performance</Text>
              <Text className="text-sm text-neutral-600">
                AI prediction accuracy and reliability metrics
              </Text>
            </div>
          </div>

          <Grid templateColumns={{ base: '1fr', md: 'repeat(4, 1fr)' }} gap={6}>
            <div className="text-center p-4 bg-success-50 rounded-lg">
              <div className="text-2xl font-bold text-success-600">94.2%</div>
              <div className="text-sm text-success-700">Overall Accuracy</div>
              <div className="text-xs text-neutral-600 mt-1">Last 30 days</div>
            </div>
            
            <div className="text-center p-4 bg-ai-50 rounded-lg">
              <div className="text-2xl font-bold text-ai-600">87.5%</div>
              <div className="text-sm text-ai-700">Direction Accuracy</div>
              <div className="text-xs text-neutral-600 mt-1">Price movement</div>
            </div>
            
            <div className="text-center p-4 bg-warning-50 rounded-lg">
              <div className="text-2xl font-bold text-warning-600">2.3%</div>
              <div className="text-sm text-warning-700">Avg Error Rate</div>
              <div className="text-xs text-neutral-600 mt-1">Price variance</div>
            </div>
            
            <div className="text-center p-4 bg-brand-50 rounded-lg">
              <div className="text-2xl font-bold text-brand-600">1,247</div>
              <div className="text-sm text-brand-700">Predictions Made</div>
              <div className="text-xs text-neutral-600 mt-1">This month</div>
            </div>
          </Grid>

          {/* Recent Performance Chart Placeholder */}
          <div className="mt-6">
            <Text className="font-medium mb-4">Accuracy Trend</Text>
            <div className="h-48 bg-neutral-100 rounded-lg flex items-center justify-center">
              <div className="text-center text-neutral-500">
                <TrendingUp size={32} className="mx-auto mb-2" />
                <Text>Model accuracy chart would be rendered here</Text>
                <Text className="text-sm">Line chart showing prediction accuracy over time</Text>
              </div>
            </div>
          </div>
        </Card.Body>
      </Card.Root>
    </div>
  );
};