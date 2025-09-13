import React from 'react';
import { 
  Card, 
  CardContent, 
  Typography, 
  Stack, 
  Chip, 
  Box 
} from '@mui/material';
import { BrainCircuit } from 'lucide-react';
import { OrderSide } from '../../types/enums';
import { 
  formatCurrency, 
  formatExecutionTime, 
  formatSlippage, 
  formatExecutionSpeed, 
  formatOrderId 
} from '../../utils/formatters';

interface ExecutionCardProps {
  execution: {
    id: string;
    orderId: string;
    symbol: string;
    side: OrderSide;
    quantity: number;
    price: number;
    executionTime: string;
    venue: string;
    commission: number;
    tax: number;
    netAmount: number;
    slippage: number;
    executionSpeed: number;
    algorithmId?: string | null;
    confidence?: number | null;
    reason: string;
  };
}

export const ExecutionCard: React.FC<ExecutionCardProps> = ({ execution }) => {
  const getSideColor = (side: OrderSide) => {
    return side === OrderSide.BUY ? 'success' : 'error';
  };

  return (
    <Card variant="outlined">
      <CardContent>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
          <Stack spacing={1}>
            <Stack direction="row" alignItems="center" spacing={2}>
              <Typography variant="h6" fontWeight="bold">
                {execution.symbol}
              </Typography>
              <Chip
                label={execution.side}
                color={getSideColor(execution.side)}
                size="small"
              />
              <Typography variant="body2" color="textSecondary">
                {formatExecutionTime(execution.executionTime)}
              </Typography>
            </Stack>
            
            <Stack direction="row" spacing={4}>
              <Box>
                <Typography variant="body2" color="textSecondary">Quantity</Typography>
                <Typography variant="body1" fontWeight="bold">
                  {execution.quantity.toLocaleString()}
                </Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="textSecondary">Price</Typography>
                <Typography variant="body1" fontWeight="bold">
                  {formatCurrency(execution.price)}
                </Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="textSecondary">Net Amount</Typography>
                <Typography variant="body1" fontWeight="bold">
                  {formatCurrency(execution.netAmount)}
                </Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="textSecondary">Slippage</Typography>
                <Typography 
                  variant="body1" 
                  fontWeight="bold"
                  color={execution.slippage >= 0 ? 'error.main' : 'success.main'}
                >
                  {formatSlippage(execution.slippage)}
                </Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="textSecondary">Speed</Typography>
                <Typography variant="body1" fontWeight="bold">
                  {formatExecutionSpeed(execution.executionSpeed)}
                </Typography>
              </Box>
            </Stack>
            
            {execution.algorithmId && (
              <Stack direction="row" alignItems="center" spacing={1}>
                <BrainCircuit size={16} />
                <Typography variant="body2">
                  Algorithm: {execution.algorithmId}
                </Typography>
                {execution.confidence && (
                  <Chip 
                    label={`${(execution.confidence * 100).toFixed(1)}% confidence`}
                    size="small" 
                    variant="outlined"
                    color="info"
                  />
                )}
              </Stack>
            )}
          </Stack>
          
          <Stack alignItems="flex-end" spacing={1}>
            <Chip label={execution.venue} size="small" variant="outlined" />
            <Typography variant="body2" color="textSecondary">
              Order: {formatOrderId(execution.orderId)}
            </Typography>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
};