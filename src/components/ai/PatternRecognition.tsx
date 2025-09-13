import React from 'react';
import { Card, Text, Badge } from '@chakra-ui/react';
import { Eye } from 'lucide-react';

export const PatternRecognition: React.FC = () => {
  return (
    <Card.Root>
      <Card.Body>
        <div className="text-center py-12">
          <Eye size={48} className="mx-auto mb-4" color="#a0aec0" />
          <Text className="text-lg font-semibold mb-2">Pattern Recognition</Text>
          <Text className="text-neutral-600">
            Advanced pattern recognition features coming soon
          </Text>
          <div className="mt-4">
            <Badge colorPalette="ai" variant="outline">
              Under Development
            </Badge>
          </div>
        </div>
      </Card.Body>
    </Card.Root>
  );
};