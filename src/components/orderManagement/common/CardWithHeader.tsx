import React from 'react';
import { Card, CardContent, Typography, Stack, Box, Chip } from '@mui/material';

interface CardWithHeaderProps {
  title: string;
  subtitle?: string;
  status?: {
    label: string;
    color: 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning';
    variant?: 'filled' | 'outlined';
  };
  headerAction?: React.ReactNode;
  children: React.ReactNode;
  variant?: 'elevation' | 'outlined';
}

export const CardWithHeader: React.FC<CardWithHeaderProps> = ({
  title,
  subtitle,
  status,
  headerAction,
  children,
  variant = 'outlined'
}) => {
  return (
    <Card variant={variant}>
      <CardContent>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={2}>
          <Box>
            <Typography variant="h6" fontWeight="bold">
              {title}
            </Typography>
            {subtitle && (
              <Typography variant="body2" color="textSecondary">
                {subtitle}
              </Typography>
            )}
          </Box>
          <Stack direction="row" alignItems="center" spacing={1}>
            {status && (
              <Chip
                label={status.label}
                color={status.color}
                size="small"
                variant={status.variant || 'filled'}
              />
            )}
            {headerAction}
          </Stack>
        </Stack>
        {children}
      </CardContent>
    </Card>
  );
};