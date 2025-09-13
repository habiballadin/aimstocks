import React from 'react';
import { Box, Typography } from '@mui/material';

interface MetricDisplayProps {
  label: string;
  value: string | number;
  color?: string;
  size?: 'small' | 'medium' | 'large';
  fontWeight?: 'normal' | 'bold';
}

export const MetricDisplay: React.FC<MetricDisplayProps> = ({
  label,
  value,
  color = 'inherit',
  size = 'medium',
  fontWeight = 'bold'
}) => {
  const getValueVariant = () => {
    switch (size) {
      case 'small': return 'body2';
      case 'large': return 'h6';
      default: return 'body1';
    }
  };

  return (
    <Box>
      <Typography variant="body2" color="textSecondary">
        {label}
      </Typography>
      <Typography 
        variant={getValueVariant()} 
        fontWeight={fontWeight}
        color={color}
      >
        {value}
      </Typography>
    </Box>
  );
};