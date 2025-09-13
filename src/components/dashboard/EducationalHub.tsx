import React, { useState } from 'react';
import { 
  Card, 
  Text, 
  Box, 
  Flex, 
  Stack,
  Icon,
  Badge,
  Button,
  Progress,
  Tabs,
  SimpleGrid
} from '@chakra-ui/react';
import { BookOpenText, Play, Award, Target, CheckCircle } from 'lucide-react';

interface Course {
  id: string;
  title: string;
  description: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  progress: number;
  duration: string;
  lessons: number;
  completed: boolean;
}

interface Quiz {
  id: string;
  title: string;
  questions: number;
  score?: number;
  maxScore: number;
  completed: boolean;
}

export const EducationalHub: React.FC = () => {
  const [activeTab, setActiveTab] = useState('courses');

  const courses: Course[] = [
    {
      id: '1',
      title: 'Stock Market Basics',
      description: 'Learn fundamental concepts of stock trading and investment',
      level: 'Beginner',
      progress: 75,
      duration: '2 hours',
      lessons: 8,
      completed: false
    },
    {
      id: '2',
      title: 'Technical Analysis',
      description: 'Master chart patterns and technical indicators',
      level: 'Intermediate',
      progress: 45,
      duration: '4 hours',
      lessons: 12,
      completed: false
    },
    {
      id: '3',
      title: 'AI Trading Strategies',
      description: 'Understand how AI enhances trading decisions',
      level: 'Advanced',
      progress: 100,
      duration: '3 hours',
      lessons: 10,
      completed: true
    }
  ];

  const quizzes: Quiz[] = [
    {
      id: '1',
      title: 'Market Fundamentals Quiz',
      questions: 10,
      score: 8,
      maxScore: 10,
      completed: true
    },
    {
      id: '2',
      title: 'Risk Management Assessment',
      questions: 15,
      maxScore: 15,
      completed: false
    },
    {
      id: '3',
      title: 'AI Trading Concepts',
      questions: 12,
      score: 11,
      maxScore: 12,
      completed: true
    }
  ];

  const achievements = [
    { id: '1', title: 'First Trade', description: 'Completed your first trade', earned: true },
    { id: '2', title: 'Portfolio Builder', description: 'Built a diversified portfolio', earned: true },
    { id: '3', title: 'AI Expert', description: 'Mastered AI trading concepts', earned: false },
    { id: '4', title: 'Risk Manager', description: 'Demonstrated good risk management', earned: false }
  ];

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'Beginner': return 'green';
      case 'Intermediate': return 'yellow';
      case 'Advanced': return 'red';
      default: return 'gray';
    }
  };

  return (
    <Card.Root>
      <Card.Body>
        <Flex align="center" gap={3} mb={6}>
          <Icon color="brand.600">
            <BookOpenText size={24} />
          </Icon>
          <Box>
            <Text textStyle="heading.md" color="neutral.900">
              Learning Hub
            </Text>
            <Text fontSize="sm" color="neutral.600">
              Enhance your trading knowledge
            </Text>
          </Box>
        </Flex>

        <Tabs.Root value={activeTab} onValueChange={(e) => setActiveTab(e.value)}>
          <Tabs.List mb={6}>
            <Tabs.Trigger value="courses">
              <Icon><BookOpenText size={16} /></Icon>
              Courses
            </Tabs.Trigger>
            <Tabs.Trigger value="quizzes">
              <Icon><Target size={16} /></Icon>
              Quizzes
            </Tabs.Trigger>
            <Tabs.Trigger value="achievements">
              <Icon><Award size={16} /></Icon>
              Achievements
            </Tabs.Trigger>
          </Tabs.List>

          <Tabs.Content value="courses">
            <Stack gap={4}>
              {courses.map((course) => (
                <Box
                  key={course.id}
                  p={4}
                  bg="neutral.50"
                  borderRadius="md"
                  border="1px solid"
                  borderColor="neutral.200"
                  _hover={{ borderColor: 'brand.300', shadow: 'sm' }}
                >
                  <Flex justify="space-between" align="flex-start" mb={3}>
                    <Box flex={1}>
                      <Flex align="center" gap={2} mb={2}>
                        <Text fontWeight="semibold" color="neutral.900">
                          {course.title}
                        </Text>
                        {course.completed && (
                          <Icon color="success.600">
                            <CheckCircle size={16} />
                          </Icon>
                        )}
                      </Flex>
                      <Text fontSize="sm" color="neutral.600" mb={2}>
                        {course.description}
                      </Text>
                      <Flex align="center" gap={4} mb={3}>
                        <Badge colorPalette={getLevelColor(course.level)} size="sm">
                          {course.level}
                        </Badge>
                        <Text fontSize="xs" color="neutral.600">
                          {course.duration} • {course.lessons} lessons
                        </Text>
                      </Flex>
                    </Box>
                    <Button size="sm" colorPalette="brand">
                      <Icon><Play size={14} /></Icon>
                      {course.completed ? 'Review' : 'Continue'}
                    </Button>
                  </Flex>
                  
                  <Box>
                    <Flex justify="space-between" align="center" mb={1}>
                      <Text fontSize="xs" color="neutral.600">Progress</Text>
                      <Text fontSize="xs" color="neutral.600">{course.progress}%</Text>
                    </Flex>
                    <Progress.Root value={course.progress} colorPalette="brand" size="sm">
                      <Progress.Track>
                        <Progress.Range />
                      </Progress.Track>
                    </Progress.Root>
                  </Box>
                </Box>
              ))}
            </Stack>
          </Tabs.Content>

          <Tabs.Content value="quizzes">
            <Stack gap={4}>
              {quizzes.map((quiz) => (
                <Box
                  key={quiz.id}
                  p={4}
                  bg="neutral.50"
                  borderRadius="md"
                  border="1px solid"
                  borderColor="neutral.200"
                  _hover={{ borderColor: 'brand.300', shadow: 'sm' }}
                >
                  <Flex justify="space-between" align="center">
                    <Box>
                      <Flex align="center" gap={2} mb={1}>
                        <Text fontWeight="semibold" color="neutral.900">
                          {quiz.title}
                        </Text>
                        {quiz.completed && (
                          <Icon color="success.600">
                            <CheckCircle size={16} />
                          </Icon>
                        )}
                      </Flex>
                      <Text fontSize="sm" color="neutral.600">
                        {quiz.questions} questions
                      </Text>
                      {quiz.completed && quiz.score && (
                        <Text fontSize="sm" color="success.600" fontWeight="medium">
                          Score: {quiz.score}/{quiz.maxScore}
                        </Text>
                      )}
                    </Box>
                    <Button 
                      size="sm" 
                      colorPalette={quiz.completed ? 'gray' : 'brand'}
                      variant={quiz.completed ? 'outline' : 'solid'}
                    >
                      {quiz.completed ? 'Retake' : 'Start Quiz'}
                    </Button>
                  </Flex>
                </Box>
              ))}
            </Stack>
          </Tabs.Content>

          <Tabs.Content value="achievements">
            <SimpleGrid columns={2} gap={4}>
              {achievements.map((achievement) => (
                <Box
                  key={achievement.id}
                  p={4}
                  bg={achievement.earned ? 'success.50' : 'neutral.50'}
                  borderRadius="md"
                  border="1px solid"
                  borderColor={achievement.earned ? 'success.200' : 'neutral.200'}
                  opacity={achievement.earned ? 1 : 0.6}
                >
                  <Flex align="center" gap={3} mb={2}>
                    <Icon color={achievement.earned ? 'success.600' : 'neutral.400'}>
                      <Award size={20} />
                    </Icon>
                    <Text fontWeight="semibold" color="neutral.900" fontSize="sm">
                      {achievement.title}
                    </Text>
                  </Flex>
                  <Text fontSize="xs" color="neutral.600">
                    {achievement.description}
                  </Text>
                </Box>
              ))}
            </SimpleGrid>
          </Tabs.Content>
        </Tabs.Root>
      </Card.Body>
    </Card.Root>
  );
};