import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Typography,
  Alert,
  Box
} from '@mui/material';
import { OrderSide, OrderType, ExecutionVenue, OrderTimeInForce } from '../../types/enums';

interface OrderData {
  symbol: string;
  side: OrderSide;
  orderType: OrderType;
  quantity: number;
  price: number | null;
  stopPrice: number | null;
  venue: ExecutionVenue;
  timeInForce: OrderTimeInForce;
  algorithmId: string | null;
}

interface OrderFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (orderData: OrderData) => void;
  editOrder?: Partial<OrderData> & { algorithmId?: string };
}

export const OrderFormDialog: React.FC<OrderFormDialogProps> = ({
  open,
  onClose,
  onSubmit,
  editOrder
}) => {
  const [formData, setFormData] = useState({
    symbol: editOrder?.symbol || '',
    side: editOrder?.side || OrderSide.BUY,
    orderType: editOrder?.orderType || OrderType.LIMIT,
    quantity: editOrder?.quantity || '',
    price: editOrder?.price || '',
    stopPrice: editOrder?.stopPrice || '',
    venue: editOrder?.venue || ExecutionVenue.NSE,
    timeInForce: editOrder?.timeInForce || OrderTimeInForce.DAY,
    isAlgorithmic: editOrder?.algorithmId ? true : false,
    algorithmId: editOrder?.algorithmId || ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.symbol.trim()) {
      newErrors.symbol = 'Symbol is required';
    }
    if (!formData.quantity || Number(formData.quantity) <= 0) {
      newErrors.quantity = 'Valid quantity is required';
    }
    if (formData.orderType === OrderType.LIMIT && (!formData.price || Number(formData.price) <= 0)) {
      newErrors.price = 'Valid price is required for limit orders';
    }
    if (formData.orderType === OrderType.STOP_LOSS && (!formData.stopPrice || Number(formData.stopPrice) <= 0)) {
      newErrors.stopPrice = 'Valid stop price is required for stop loss orders';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      const orderData = {
        ...formData,
        quantity: Number(formData.quantity),
        price: formData.price ? Number(formData.price) : null,
        stopPrice: formData.stopPrice ? Number(formData.stopPrice) : null,
        algorithmId: formData.isAlgorithmic ? formData.algorithmId : null
      };
      onSubmit(orderData);
      onClose();
    }
  };

  const handleChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {editOrder ? 'Edit Order' : 'Create New Order'}
      </DialogTitle>
      <DialogContent>
        <Stack spacing={3} sx={{ mt: 1 }}>
          <Alert severity="info">
            {editOrder ? 'Modify the order details below' : 'Enter order details to place a new order'}
          </Alert>

          <Stack direction="row" spacing={2}>
            <TextField
              label="Symbol"
              value={formData.symbol}
              onChange={(e) => handleChange('symbol', e.target.value.toUpperCase())}
              error={!!errors.symbol}
              helperText={errors.symbol}
              placeholder="e.g., RELIANCE, TCS"
              fullWidth
            />
            <FormControl fullWidth>
              <InputLabel>Side</InputLabel>
              <Select
                value={formData.side}
                onChange={(e) => handleChange('side', e.target.value)}
                label="Side"
              >
                <MenuItem value={OrderSide.BUY}>Buy</MenuItem>
                <MenuItem value={OrderSide.SELL}>Sell</MenuItem>
              </Select>
            </FormControl>
          </Stack>

          <Stack direction="row" spacing={2}>
            <FormControl fullWidth>
              <InputLabel>Order Type</InputLabel>
              <Select
                value={formData.orderType}
                onChange={(e) => handleChange('orderType', e.target.value)}
                label="Order Type"
              >
                <MenuItem value={OrderType.MARKET}>Market</MenuItem>
                <MenuItem value={OrderType.LIMIT}>Limit</MenuItem>
                <MenuItem value={OrderType.STOP_LOSS}>Stop Loss</MenuItem>
                <MenuItem value={OrderType.STOP_LOSS_MARKET}>Stop Loss Market</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="Quantity"
              type="number"
              value={formData.quantity}
              onChange={(e) => handleChange('quantity', e.target.value)}
              error={!!errors.quantity}
              helperText={errors.quantity}
              fullWidth
            />
          </Stack>

          <Stack direction="row" spacing={2}>
            {(formData.orderType === OrderType.LIMIT) && (
              <TextField
                label="Price"
                type="number"
                value={formData.price}
                onChange={(e) => handleChange('price', e.target.value)}
                error={!!errors.price}
                helperText={errors.price}
                InputProps={{ startAdornment: '₹' }}
                fullWidth
              />
            )}
            {(formData.orderType === OrderType.STOP_LOSS || formData.orderType === OrderType.STOP_LOSS_MARKET) && (
              <TextField
                label="Stop Price"
                type="number"
                value={formData.stopPrice}
                onChange={(e) => handleChange('stopPrice', e.target.value)}
                error={!!errors.stopPrice}
                helperText={errors.stopPrice}
                InputProps={{ startAdornment: '₹' }}
                fullWidth
              />
            )}
          </Stack>

          <Stack direction="row" spacing={2}>
            <FormControl fullWidth>
              <InputLabel>Venue</InputLabel>
              <Select
                value={formData.venue}
                onChange={(e) => handleChange('venue', e.target.value)}
                label="Venue"
              >
                <MenuItem value={ExecutionVenue.NSE}>NSE</MenuItem>
                <MenuItem value={ExecutionVenue.BSE}>BSE</MenuItem>
                <MenuItem value={ExecutionVenue.MCX}>MCX</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Time in Force</InputLabel>
              <Select
                value={formData.timeInForce}
                onChange={(e) => handleChange('timeInForce', e.target.value)}
                label="Time in Force"
              >
                <MenuItem value={OrderTimeInForce.DAY}>Day</MenuItem>
                <MenuItem value={OrderTimeInForce.IOC}>IOC</MenuItem>
                <MenuItem value={OrderTimeInForce.FOK}>FOK</MenuItem>
                <MenuItem value={OrderTimeInForce.GTC}>GTC</MenuItem>
              </Select>
            </FormControl>
          </Stack>

          <Box>
            <FormControlLabel
              control={
                <Switch
                  checked={formData.isAlgorithmic}
                  onChange={(e) => handleChange('isAlgorithmic', e.target.checked)}
                />
              }
              label="Algorithmic Order"
            />
            {formData.isAlgorithmic && (
              <TextField
                label="Algorithm ID"
                value={formData.algorithmId}
                onChange={(e) => handleChange('algorithmId', e.target.value)}
                placeholder="e.g., algo1, momentum_strategy"
                fullWidth
                sx={{ mt: 2 }}
              />
            )}
          </Box>

          {formData.quantity && formData.price && (
            <Box sx={{ p: 2, bgcolor: 'background.paper', borderRadius: 1, border: '1px solid', borderColor: 'divider' }}>
              <Typography variant="body2" color="textSecondary">Order Value</Typography>
              <Typography variant="h6" fontWeight="bold">
                ₹{(Number(formData.quantity) * Number(formData.price)).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </Typography>
            </Box>
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained">
          {editOrder ? 'Update Order' : 'Place Order'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};