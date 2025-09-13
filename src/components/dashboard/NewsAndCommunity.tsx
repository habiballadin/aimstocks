import React, { useState } from 'react';
import { 
  Card, 
  Text, 
  Box, 
  Flex, 
  Stack,

  Badge,
  Button,
  Tabs
} from '@chakra-ui/react';
import { Users, Newspaper, MessageCircle, ThumbsUp } from 'lucide-react';
import { mockQuery } from '../../data/stockTradingMockData';

export const NewsAndCommunity: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const { newsUpdates } = mockQuery;

  const communityPosts = [
    {
      id: '1',
      author: 'TraderPro',
      content: 'Strong breakout in IT sector today. INFY looking bullish above 1850 levels.',
      timestamp: '2025-01-27T10:30:00.000Z',
      likes: 24,
      comments: 8,
      sentiment: 'BULLISH'
    },
    {
      id: '2',
      author: 'MarketGuru',
      content: 'Banking stocks showing weakness. Keep an eye on support levels.',
      timestamp: '2025-01-27T09:15:00.000Z',
      likes: 18,
      comments: 12,
      sentiment: 'BEARISH'
    },
    {
      id: '3',
      author: 'AITrader',
      content: 'AI signals suggest accumulation in pharma sector. Good time for long positions.',
      timestamp: '2025-01-27T08:45:00.000Z',
      likes: 31,
      comments: 15,
      sentiment: 'BULLISH'
    }
  ];

  return (
    <Card.Root h="600px">
      <Card.Body>
        <Flex align="center" gap={3} mb={4}>
          <Users size={24} color="#3182ce" />
          <Box>
            <Text textStyle="heading.md" color="neutral.900">
              Market Pulse
            </Text>
            <Text fontSize="sm" color="neutral.600">
              News and community insights
            </Text>
          </Box>
        </Flex>

        <Tabs.Root
          value={activeTab.toString()}
          onValueChange={(e) => setActiveTab(parseInt(e.value))}
        >
          <Tabs.List mb={4}>
            <Tabs.Trigger value="0">
              <Newspaper size={16} />
              News
            </Tabs.Trigger>
            <Tabs.Trigger value="1">
              <MessageCircle size={16} />
              Community
            </Tabs.Trigger>
          </Tabs.List>

          <Tabs.Content value="0">
            <Stack gap={4} maxH="450px" overflowY="auto">
              {newsUpdates.map((news) => (
                <Box
                  key={news.id}
                  p={4}
                  bg="neutral.50"
                  borderRadius="md"
                  border="1px solid"
                  borderColor="neutral.200"
                  _hover={{ borderColor: 'neutral.300' }}
                  cursor="pointer"
                >
                  <Flex justify="space-between" align="flex-start" mb={2}>
                    <Text fontWeight="semibold" color="neutral.900" fontSize="sm">
                      {news.headline}
                    </Text>
                    <Badge 
                      colorPalette={
                        news.sentiment === 'POSITIVE' ? 'green' :
                        news.sentiment === 'NEUTRAL' ? 'neutral' : 'red'
                      }
                      size="sm"
                    >
                      {news.sentiment}
                    </Badge>
                  </Flex>
                  
                  <Text fontSize="xs" color="neutral.600" mb={2}>
                    {news.summary}
                  </Text>
                  
                  <Flex justify="space-between" align="center">
                    <Text fontSize="xs" color="neutral.500">
                      {news.source} • {new Date(news.timestamp).toLocaleString()}
                    </Text>
                    <Flex gap={1}>
                      {news.relevantStocks.map((stock) => (
                        <Badge key={stock} variant="outline" size="sm">
                          {stock}
                        </Badge>
                      ))}
                    </Flex>
                  </Flex>
                </Box>
              ))}
            </Stack>
          </Tabs.Content>

          <Tabs.Content value="1">
            <Stack gap={4} maxH="450px" overflowY="auto">
              {communityPosts.map((post) => (
                <Box
                  key={post.id}
                  p={4}
                  bg="neutral.50"
                  borderRadius="md"
                  border="1px solid"
                  borderColor="neutral.200"
                  _hover={{ borderColor: 'neutral.300' }}
                >
                  <Flex justify="space-between" align="flex-start" mb={2}>
                    <Text fontWeight="semibold" color="neutral.900" fontSize="sm">
                      @{post.author}
                    </Text>
                    <Badge 
                      colorPalette={post.sentiment === 'BULLISH' ? 'green' : 'red'}
                      size="sm"
                    >
                      {post.sentiment}
                    </Badge>
                  </Flex>
                  
                  <Text fontSize="sm" color="neutral.700" mb={3}>
                    {post.content}
                  </Text>
                  
                  <Flex justify="space-between" align="center">
                    <Text fontSize="xs" color="neutral.500">
                      {new Date(post.timestamp).toLocaleString()}
                    </Text>
                    <Flex gap={3}>
                      <Button variant="ghost" size="sm" p={1}>
                        <ThumbsUp size={14} color="#718096" />
                        <Text fontSize="xs" ml={1}>{post.likes}</Text>
                      </Button>
                      <Button variant="ghost" size="sm" p={1}>
                        <MessageCircle size={14} color="#718096" />
                        <Text fontSize="xs" ml={1}>{post.comments}</Text>
                      </Button>
                    </Flex>
                  </Flex>
                </Box>
              ))}
            </Stack>
          </Tabs.Content>
        </Tabs.Root>
      </Card.Body>
    </Card.Root>
  );
};