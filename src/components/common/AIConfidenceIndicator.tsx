import React from 'react';
import { Box, Text, Progress } from '@chakra-ui/react';

interface AIConfidenceIndicatorProps {
  confidence: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export const AIConfidenceIndicator: React.FC<AIConfidenceIndicatorProps> = ({
  confidence,
  size = 'md',
  showLabel = true
}) => {
  const getConfidenceColor = (conf: number) => {
    if (conf >= 0.8) return 'success';
    if (conf >= 0.6) return 'warning';
    return 'danger';
  };

  const getConfidenceText = (conf: number) => {
    if (conf >= 0.8) return 'High';
    if (conf >= 0.6) return 'Medium';
    return 'Low';
  };

  const progressSize = size === 'sm' ? 'sm' : size === 'lg' ? 'lg' : 'md';
  const textSize = size === 'sm' ? 'xs' : size === 'lg' ? 'sm' : 'xs';

  return (
    <Box>
      {showLabel && (
        <Text fontSize={textSize} color="neutral.600" mb={1}>
          AI Confidence: {getConfidenceText(confidence)}
        </Text>
      )}
      <Progress.Root 
        value={confidence * 100} 
        colorPalette={getConfidenceColor(confidence)}
        size={progressSize}
      >
        <Progress.Track>
          <Progress.Range />
        </Progress.Track>
      </Progress.Root>
      <Text fontSize={textSize} color={`${getConfidenceColor(confidence)}.600`} mt={1}>
        {(confidence * 100).toFixed(0)}%
      </Text>
    </Box>
  );
};