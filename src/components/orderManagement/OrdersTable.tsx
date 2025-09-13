import React from 'react';
import { 
  Box, 
  Typography, 
  Chip, 
  LinearProgress
} from '@mui/material';
import { DataGrid, GridColDef, GridRowsProp } from '@mui/x-data-grid';
import { OrderSide, OrderStatus } from '../../types/enums';
import { formatCurrency, formatOrderId } from '../../utils/formatters';
import { getOrderStatusColor, getOrderSideColor } from './utils/StatusUtils';
import { ActionButtonGroup } from './common/ActionButtonGroup';

interface Order {
  id: string;
  symbol: string;
  side: OrderSide;
  orderType: string;
  quantity: number;
  price: number | null;
  filledQuantity: number;
  remainingQuantity: number;
  status: OrderStatus;
  venue: string;
  createdAt: string;
  estimatedValue: number;
}

interface OrdersTableProps {
  orders: Order[];
  onOrderSelect?: (orderIds: string[]) => void;
  selectedOrders?: string[];
}

export const OrdersTable: React.FC<OrdersTableProps> = ({ 
  orders, 
  onOrderSelect,
  selectedOrders = []
}) => {

  const columns: GridColDef[] = [
    {
      field: 'id',
      headerName: 'Order ID',
      width: 120,
      renderCell: (params) => (
        <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
          {formatOrderId(params.value)}
        </Typography>
      )
    },
    {
      field: 'symbol',
      headerName: 'Symbol',
      width: 100,
      renderCell: (params) => (
        <Typography variant="body2" fontWeight="bold">
          {params.value}
        </Typography>
      )
    },
    {
      field: 'side',
      headerName: 'Side',
      width: 80,
      renderCell: (params) => (
        <Chip
          label={params.value}
          color={getOrderSideColor(params.value)}
          size="small"
          variant="filled"
        />
      )
    },
    {
      field: 'orderType',
      headerName: 'Type',
      width: 100
    },
    {
      field: 'quantity',
      headerName: 'Quantity',
      width: 100,
      renderCell: (params) => (
        <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
          {params.value.toLocaleString()}
        </Typography>
      )
    },
    {
      field: 'price',
      headerName: 'Price',
      width: 120,
      renderCell: (params) => (
        <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
          {params.value ? formatCurrency(params.value) : 'Market'}
        </Typography>
      )
    },
    {
      field: 'filledQuantity',
      headerName: 'Filled',
      width: 100,
      renderCell: (params) => {
        const row = params.row;
        const fillPercentage = (params.value / row.quantity) * 100;
        return (
          <Box>
            <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
              {params.value}/{row.quantity}
            </Typography>
            <LinearProgress 
              variant="determinate" 
              value={fillPercentage} 
              sx={{ mt: 0.5, height: 4 }}
              color={fillPercentage === 100 ? 'success' : 'primary'}
            />
          </Box>
        );
      }
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 130,
      renderCell: (params) => (
        <Chip
          label={params.value}
          color={getOrderStatusColor(params.value)}
          size="small"
          variant="outlined"
        />
      )
    },
    {
      field: 'venue',
      headerName: 'Venue',
      width: 80
    },
    {
      field: 'createdAt',
      headerName: 'Created',
      width: 120,
      renderCell: (params) => (
        <Typography variant="body2" color="textSecondary">
          {new Date(params.value).toLocaleTimeString()}
        </Typography>
      )
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 120,
      renderCell: (params) => (
        <ActionButtonGroup
          type="order"
          onSettings={() => console.log('Settings for order:', params.row.id)}
          onStop={() => console.log('Cancel order:', params.row.id)}
          onMore={() => console.log('More actions for order:', params.row.id)}
        />
      )
    }
  ];

  const rows: GridRowsProp = orders.map(order => ({
    id: order.id,
    symbol: order.symbol,
    side: order.side,
    orderType: order.orderType,
    quantity: order.quantity,
    price: order.price,
    filledQuantity: order.filledQuantity,
    remainingQuantity: order.remainingQuantity,
    status: order.status,
    venue: order.venue,
    createdAt: order.createdAt,
    estimatedValue: order.estimatedValue
  }));

  return (
    <Box sx={{ height: 600, width: '100%' }}>
      <DataGrid
        rows={rows}
        columns={columns}
        checkboxSelection
        disableRowSelectionOnClick
        onRowSelectionModelChange={(newSelection) => {
          onOrderSelect?.(newSelection as unknown as string[]);
        }}
        rowSelectionModel={{ type: 'include', ids: new Set(selectedOrders) }}
        pageSizeOptions={[10, 25, 50]}
        initialState={{
          pagination: {
            paginationModel: { page: 0, pageSize: 10 }
          }
        }}
      />
    </Box>
  );
};