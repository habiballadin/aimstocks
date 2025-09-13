import React from 'react';
import { Card, Grid, Text, Progress, Badge } from '@chakra-ui/react';
import { Activity, TrendingUp, MessageSquare, Newspaper } from 'lucide-react';

interface SentimentData {
  overall: string;
  score: number;
  sources: {
    news: number;
    social: number;
    analyst: number;
  };
}

interface SentimentAnalysisProps {
  data: SentimentData;
}

export const SentimentAnalysis: React.FC<SentimentAnalysisProps> = ({ data }) => {
  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'VERY_BULLISH': return 'success';
      case 'BULLISH': return 'success';
      case 'NEUTRAL': return 'warning';
      case 'BEARISH': return 'danger';
      case 'VERY_BEARISH': return 'danger';
      default: return 'neutral';
    }
  };

  const getSentimentEmoji = (sentiment: string) => {
    switch (sentiment) {
      case 'VERY_BULLISH': return '🚀';
      case 'BULLISH': return '📈';
      case 'NEUTRAL': return '➡️';
      case 'BEARISH': return '📉';
      case 'VERY_BEARISH': return '💥';
      default: return '❓';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 70) return 'success';
    if (score >= 50) return 'warning';
    return 'danger';
  };

  return (
    <div className="space-y-6">
      {/* Overall Sentiment */}
      <Card.Root>
        <Card.Body>
          <div className="flex items-center gap-3 mb-6">
            <Activity size={24} color="#3182ce" />
            <div>
              <Text className="text-lg font-semibold">Market Sentiment Overview</Text>
              <Text className="text-sm text-neutral-600">
                Real-time sentiment analysis from multiple sources
              </Text>
            </div>
          </div>

          <Grid templateColumns={{ base: '1fr', lg: 'repeat(2, 1fr)' }} gap={6}>
            {/* Overall Sentiment Score */}
            <div className="text-center p-6 bg-gradient-to-br from-ai-50 to-ai-100 rounded-xl">
              <div className="text-6xl mb-2">{getSentimentEmoji(data.overall)}</div>
              <Badge colorPalette={getSentimentColor(data.overall)} variant="solid" size="lg" className="mb-2">
                {data.overall.replace('_', ' ')}
              </Badge>
              <div className="text-4xl font-bold text-ai-600 mb-2">
                {data.score}
              </div>
              <Text className="text-sm text-ai-600">Sentiment Score</Text>
              
              <div className="mt-4">
                <Progress.Root 
                  value={data.score} 
                  max={100}
                  colorPalette={getScoreColor(data.score)}
                  size="lg"
                >
                  <Progress.Track>
                    <Progress.Range />
                  </Progress.Track>
                </Progress.Root>
              </div>
            </div>

            {/* Source Breakdown */}
            <div className="space-y-4">
              <Text className="font-semibold mb-4">Sentiment by Source</Text>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Newspaper size={20} color="#718096" />
                    <div>
                      <Text className="font-medium">News Sentiment</Text>
                      <Text className="text-sm text-neutral-600">Financial news analysis</Text>
                    </div>
                  </div>
                  <div className="text-right">
                    <Text className="font-bold text-lg">{data.sources.news}</Text>
                    <Badge colorPalette={getScoreColor(data.sources.news)} variant="subtle" size="sm">
                      {data.sources.news >= 70 ? 'Positive' : data.sources.news >= 50 ? 'Neutral' : 'Negative'}
                    </Badge>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <MessageSquare size={20} color="#718096" />
                    <div>
                      <Text className="font-medium">Social Media</Text>
                      <Text className="text-sm text-neutral-600">Twitter, Reddit, forums</Text>
                    </div>
                  </div>
                  <div className="text-right">
                    <Text className="font-bold text-lg">{data.sources.social}</Text>
                    <Badge colorPalette={getScoreColor(data.sources.social)} variant="subtle" size="sm">
                      {data.sources.social >= 70 ? 'Positive' : data.sources.social >= 50 ? 'Neutral' : 'Negative'}
                    </Badge>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <TrendingUp size={20} color="#718096" />
                    <div>
                      <Text className="font-medium">Analyst Reports</Text>
                      <Text className="text-sm text-neutral-600">Professional analysis</Text>
                    </div>
                  </div>
                  <div className="text-right">
                    <Text className="font-bold text-lg">{data.sources.analyst}</Text>
                    <Badge colorPalette={getScoreColor(data.sources.analyst)} variant="subtle" size="sm">
                      {data.sources.analyst >= 70 ? 'Positive' : data.sources.analyst >= 50 ? 'Neutral' : 'Negative'}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </Grid>
        </Card.Body>
      </Card.Root>

      {/* Trending Topics */}
      <Grid templateColumns={{ base: '1fr', lg: 'repeat(2, 1fr)' }} gap={6}>
        <Card.Root>
          <Card.Body>
            <Text className="text-lg font-semibold mb-4">Trending Positive</Text>
            <div className="space-y-3">
              {[
                { topic: 'AI Revolution', mentions: 2847, sentiment: 85 },
                { topic: 'Green Energy', mentions: 1923, sentiment: 78 },
                { topic: 'Tech Innovation', mentions: 1654, sentiment: 82 },
                { topic: 'Market Recovery', mentions: 1432, sentiment: 76 }
              ].map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-success-50 rounded-lg">
                  <div>
                    <Text className="font-medium text-success-800">{item.topic}</Text>
                    <Text className="text-sm text-success-600">{item.mentions} mentions</Text>
                  </div>
                  <Badge colorPalette="success" variant="solid">
                    {item.sentiment}
                  </Badge>
                </div>
              ))}
            </div>
          </Card.Body>
        </Card.Root>

        <Card.Root>
          <Card.Body>
            <Text className="text-lg font-semibold mb-4">Trending Negative</Text>
            <div className="space-y-3">
              {[
                { topic: 'Inflation Concerns', mentions: 3241, sentiment: 25 },
                { topic: 'Supply Chain Issues', mentions: 2156, sentiment: 32 },
                { topic: 'Interest Rate Hikes', mentions: 1987, sentiment: 28 },
                { topic: 'Geopolitical Tensions', mentions: 1743, sentiment: 22 }
              ].map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-danger-50 rounded-lg">
                  <div>
                    <Text className="font-medium text-danger-800">{item.topic}</Text>
                    <Text className="text-sm text-danger-600">{item.mentions} mentions</Text>
                  </div>
                  <Badge colorPalette="danger" variant="solid">
                    {item.sentiment}
                  </Badge>
                </div>
              ))}
            </div>
          </Card.Body>
        </Card.Root>
      </Grid>

      {/* Sentiment Timeline */}
      <Card.Root>
        <Card.Body>
          <Text className="text-lg font-semibold mb-4">Sentiment Timeline</Text>
          <div className="h-64 bg-neutral-100 rounded-lg flex items-center justify-center">
            <div className="text-center text-neutral-500">
              <Activity size={32} className="mx-auto mb-2" />
              <Text>Sentiment timeline chart would be rendered here</Text>
              <Text className="text-sm">Line chart showing sentiment changes over time</Text>
            </div>
          </div>
        </Card.Body>
      </Card.Root>
    </div>
  );
};