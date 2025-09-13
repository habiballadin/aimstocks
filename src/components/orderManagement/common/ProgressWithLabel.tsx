import React from 'react';
import { Box, LinearProgress, Typography, Stack } from '@mui/material';

interface ProgressWithLabelProps {
  value: number;
  label?: string;
  color?: 'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'info';
  showPercentage?: boolean;
  height?: number;
}

export const ProgressWithLabel: React.FC<ProgressWithLabelProps> = ({
  value,
  label,
  color = 'primary',
  showPercentage = true,
  height = 6
}) => {
  return (
    <Box>
      {(label || showPercentage) && (
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
          {label && (
            <Typography variant="body2" color="textSecondary">
              {label}
            </Typography>
          )}
          {showPercentage && (
            <Typography variant="body2" fontWeight="bold">
              {value.toFixed(1)}%
            </Typography>
          )}
        </Stack>
      )}
      <LinearProgress
        variant="determinate"
        value={value}
        color={color}
        sx={{ height, borderRadius: height / 2 }}
      />
    </Box>
  );
};