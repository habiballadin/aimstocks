import React from 'react';
import { 
  Box, 
  Typography, 
  Stack, 
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import { formatOrderBookPrice, formatOrderBookQuantity } from '../../utils/formatters';

interface OrderBookTableProps {
  orderBook: {
    symbol: string;
    lastUpdated: string;
    bids: Array<{ price: number; quantity: number; orders: number }>;
    asks: Array<{ price: number; quantity: number; orders: number }>;
    spread: number;
    midPrice: number;
    totalBidVolume: number;
    totalAskVolume: number;
  };
}

export const OrderBookTable: React.FC<OrderBookTableProps> = ({ orderBook }) => {
  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6" fontWeight="bold">
          {orderBook.symbol} Order Book
        </Typography>
        <Typography variant="body2" color="textSecondary">
          Last Updated: {new Date(orderBook.lastUpdated).toLocaleTimeString()}
        </Typography>
      </Stack>

      <Stack direction="row" spacing={2} mb={3}>
        <Box>
          <Typography variant="body2" color="textSecondary">Spread</Typography>
          <Typography variant="h6" fontWeight="bold">
            ₹{orderBook.spread.toFixed(2)}
          </Typography>
        </Box>
        <Box>
          <Typography variant="body2" color="textSecondary">Mid Price</Typography>
          <Typography variant="h6" fontWeight="bold">
            ₹{formatOrderBookPrice(orderBook.midPrice)}
          </Typography>
        </Box>
        <Box>
          <Typography variant="body2" color="textSecondary">Total Bid Volume</Typography>
          <Typography variant="h6" fontWeight="bold" color="success.main">
            {formatOrderBookQuantity(orderBook.totalBidVolume)}
          </Typography>
        </Box>
        <Box>
          <Typography variant="body2" color="textSecondary">Total Ask Volume</Typography>
          <Typography variant="h6" fontWeight="bold" color="error.main">
            {formatOrderBookQuantity(orderBook.totalAskVolume)}
          </Typography>
        </Box>
      </Stack>

      <Stack direction="row" spacing={2}>
        {/* Bids Table */}
        <Box flex={1}>
          <Typography variant="subtitle1" fontWeight="bold" color="success.main" mb={1}>
            Bids
          </Typography>
          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Price</TableCell>
                  <TableCell>Quantity</TableCell>
                  <TableCell>Orders</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {orderBook.bids.map((bid, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <Typography variant="body2" fontWeight="bold" color="success.main">
                        ₹{formatOrderBookPrice(bid.price)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {formatOrderBookQuantity(bid.quantity)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="textSecondary">
                        {bid.orders}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>

        {/* Asks Table */}
        <Box flex={1}>
          <Typography variant="subtitle1" fontWeight="bold" color="error.main" mb={1}>
            Asks
          </Typography>
          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Price</TableCell>
                  <TableCell>Quantity</TableCell>
                  <TableCell>Orders</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {orderBook.asks.map((ask, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <Typography variant="body2" fontWeight="bold" color="error.main">
                        ₹{formatOrderBookPrice(ask.price)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {formatOrderBookQuantity(ask.quantity)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="textSecondary">
                        {ask.orders}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </Stack>
    </Box>
  );
};