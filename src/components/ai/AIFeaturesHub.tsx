import React, { useState } from 'react';
import { Box, Card, Tabs, Grid, Heading, Badge } from '@chakra-ui/react';
import { BrainCircuit } from 'lucide-react';
import { PredictiveAnalytics } from './PredictiveAnalytics';
import { SentimentAnalysis } from './SentimentAnalysis';
import { SmartRecommendations } from './SmartRecommendations';
import { PatternRecognition } from './PatternRecognition';
import { mockAIFeatures } from '../../data/optionsAndAnalyticsMockData';

export const AIFeaturesHub: React.FC = () => {
  const [activeTab, setActiveTab] = useState('predictions');

  return (
    <Box className="p-6 min-h-screen bg-neutral-50">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <BrainCircuit size={28} color="#3182ce" />
            <div>
              <Heading size="2xl" color="neutral.900">
                AI Features Hub
              </Heading>
              <div className="flex items-center gap-2 mt-1">
                <Badge colorPalette="ai" variant="solid" size="sm">
                  AI Powered
                </Badge>
                <Badge colorPalette="success" variant="outline" size="sm">
                  Real-time
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* AI Status Overview */}
        <Grid templateColumns={{ base: '1fr', md: 'repeat(4, 1fr)' }} gap={4} className="mb-6">
          <Card.Root>
            <Card.Body className="text-center">
              <div className="text-2xl font-bold text-ai-600">94%</div>
              <div className="text-sm text-neutral-600">Model Accuracy</div>
            </Card.Body>
          </Card.Root>
          <Card.Root>
            <Card.Body className="text-center">
              <div className="text-2xl font-bold text-success-600">156</div>
              <div className="text-sm text-neutral-600">Predictions Today</div>
            </Card.Body>
          </Card.Root>
          <Card.Root>
            <Card.Body className="text-center">
              <div className="text-2xl font-bold text-warning-600">72</div>
              <div className="text-sm text-neutral-600">Sentiment Score</div>
            </Card.Body>
          </Card.Root>
          <Card.Root>
            <Card.Body className="text-center">
              <div className="text-2xl font-bold text-brand-600">23</div>
              <div className="text-sm text-neutral-600">Active Signals</div>
            </Card.Body>
          </Card.Root>
        </Grid>

        {/* Main Content */}
        <Tabs.Root 
          value={activeTab} 
          onValueChange={(e) => setActiveTab(e.value)}
        >
          <Tabs.List className="mb-6 bg-white p-1 rounded-lg shadow-sm">
            <Tabs.Trigger value="predictions">Price Predictions</Tabs.Trigger>
            <Tabs.Trigger value="sentiment">Sentiment Analysis</Tabs.Trigger>
            <Tabs.Trigger value="recommendations">Smart Recommendations</Tabs.Trigger>
            <Tabs.Trigger value="patterns">Pattern Recognition</Tabs.Trigger>
          </Tabs.List>

          <Tabs.Content value="predictions">
            <PredictiveAnalytics 
              data={mockAIFeatures.predictions.map(p => ({ ...p, factors: [...p.factors] }))}
            />
          </Tabs.Content>

          <Tabs.Content value="sentiment">
            <SentimentAnalysis 
              data={mockAIFeatures.sentimentAnalysis}
            />
          </Tabs.Content>

          <Tabs.Content value="recommendations">
            <SmartRecommendations 
              data={[...mockAIFeatures.recommendations]}
            />
          </Tabs.Content>

          <Tabs.Content value="patterns">
            <PatternRecognition />
          </Tabs.Content>
        </Tabs.Root>
      </div>
    </Box>
  );
};