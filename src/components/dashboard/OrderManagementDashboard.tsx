import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Tabs,
  Tab,
  Stack,
  Button,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  LinearProgress,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Switch,
  FormControlLabel,
  Alert
} from '@mui/material';
import { Grid } from '@mui/system';
import { DataGrid, GridColDef, GridRowsProp } from '@mui/x-data-grid';
import { LineChart } from '@mui/x-charts/LineChart';

import { 
  ShoppingCart, 
  Zap, 
  Layers, 
  BrainCircuit, 
  BookOpenText,
  ChartColumnIncreasing,
  Shield,
  Play,
  Pause,
  Square,
  Settings,
  RefreshCw,
  Plus,
  Upload,
  Download,
  Filter,
  Search,
  MoreHorizontal
} from 'lucide-react';
import { mockOrderManagementData, mockPerformanceData } from '../../data/orderManagementMockData';
import {
  OrderStatus,
  OrderSide,
  BulkOrderStatus,
  AlgorithmStatus
} from '../../types/enums';
import { 
  formatCurrency, 
  formatPercentage, 
  formatOrderId, 
  formatExecutionTime, 
  formatSlippage,
  formatExecutionSpeed,
  formatRiskScore
} from '../../utils/formatters';
import { AIConfidenceIndicator } from '../common/AIConfidenceIndicator';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`order-tabpanel-${index}`}
      aria-labelledby={`order-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

export const OrderManagementDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [isCreateOrderOpen, setIsCreateOrderOpen] = useState(false);
  const [isBulkUploadOpen, setIsBulkUploadOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [autoRefresh, setAutoRefresh] = useState(true);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const getStatusColor = (status: OrderStatus | BulkOrderStatus | AlgorithmStatus) => {
    switch (status) {
      case OrderStatus.FILLED:
      case BulkOrderStatus.COMPLETED:
      case AlgorithmStatus.RUNNING:
        return 'success';
      case OrderStatus.PENDING:
      case OrderStatus.SUBMITTED:
      case BulkOrderStatus.PROCESSING:
      case AlgorithmStatus.INITIALIZING:
        return 'warning';
      case OrderStatus.CANCELLED:
      case OrderStatus.REJECTED:
      case OrderStatus.FAILED:
      case BulkOrderStatus.FAILED:
      case AlgorithmStatus.ERROR:
        return 'error';
      case OrderStatus.PARTIALLY_FILLED:
      case BulkOrderStatus.PARTIALLY_PROCESSED:
      case AlgorithmStatus.PAUSED:
        return 'info';
      default:
        return 'default';
    }
  };

  const getSideColor = (side: OrderSide) => {
    return side === OrderSide.BUY ? 'success' : 'error';
  };

  // Order Management Table Columns
  const orderColumns: GridColDef[] = [
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
          color={getSideColor(params.value)}
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
          color={getStatusColor(params.value)}
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
      renderCell: () => (
        <Stack direction="row" spacing={1}>
          <IconButton size="small" color="primary">
            <Settings size={16} />
          </IconButton>
          <IconButton size="small" color="error">
            <Square size={16} />
          </IconButton>
          <IconButton size="small">
            <MoreHorizontal size={16} />
          </IconButton>
        </Stack>
      )
    }
  ];

  const orderRows: GridRowsProp = mockOrderManagementData.activeOrders.map(order => ({
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
    <Box>
      {/* Header */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
            <Stack direction="row" alignItems="center" spacing={2}>
              <ShoppingCart size={24} color="#1976d2" />
              <Box>
                <Typography variant="h5" fontWeight="bold">
                  Order Management Dashboard
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Comprehensive order tracking, execution monitoring, and algorithmic trading control
                </Typography>
              </Box>
            </Stack>
            
            <Stack direction="row" spacing={2}>
              <FormControlLabel
                control={
                  <Switch 
                    checked={autoRefresh} 
                    onChange={(e) => setAutoRefresh(e.target.checked)}
                    size="small"
                  />
                }
                label="Auto Refresh"
              />
              <Button
                variant="outlined"
                startIcon={<Upload size={16} />}
                onClick={() => setIsBulkUploadOpen(true)}
              >
                Bulk Upload
              </Button>
              <Button
                variant="contained"
                startIcon={<Plus size={16} />}
                onClick={() => setIsCreateOrderOpen(true)}
              >
                Create Order
              </Button>
            </Stack>
          </Stack>

          {/* Quick Stats */}
          <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
            <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
              <Card variant="outlined">
                <CardContent sx={{ textAlign: 'center', py: 2 }}>
                  <Typography variant="h4" color="primary" fontWeight="bold">
                    {mockOrderManagementData.activeOrders.length}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Active Orders
                  </Typography>
                </CardContent>
              </Card>
            </Box>
            <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
              <Card variant="outlined">
                <CardContent sx={{ textAlign: 'center', py: 2 }}>
                  <Typography variant="h4" color="success.main" fontWeight="bold">
                    {mockOrderManagementData.liveExecutions.length}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Executions Today
                  </Typography>
                </CardContent>
              </Card>
            </Box>
            <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
              <Card variant="outlined">
                <CardContent sx={{ textAlign: 'center', py: 2 }}>
                  <Typography variant="h4" color="warning.main" fontWeight="bold">
                    {mockOrderManagementData.algorithmStatuses.filter(a => a.status === AlgorithmStatus.RUNNING).length}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Running Algorithms
                  </Typography>
                </CardContent>
              </Card>
            </Box>
            <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
              <Card variant="outlined">
                <CardContent sx={{ textAlign: 'center', py: 2 }}>
                  <Typography variant="h4" color="info.main" fontWeight="bold">
                    {formatCurrency(mockOrderManagementData.riskMetrics.portfolioValue)}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Portfolio Value
                  </Typography>
                </CardContent>
              </Card>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Main Tabs */}
      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={activeTab} onChange={handleTabChange} aria-label="order management tabs">
            <Tab icon={<ShoppingCart size={20} />} label="Orders" />
            <Tab icon={<Zap size={20} />} label="Executions" />
            <Tab icon={<Layers size={20} />} label="Bulk Orders" />
            <Tab icon={<BrainCircuit size={20} />} label="Algorithms" />
            <Tab icon={<BookOpenText size={20} />} label="Order Book" />
            <Tab icon={<Shield size={20} />} label="Risk" />
            <Tab icon={<ChartColumnIncreasing size={20} />} label="Analytics" />
          </Tabs>
        </Box>

        {/* Orders Tab */}
        <TabPanel value={activeTab} index={0}>
          <Stack spacing={2} mb={3}>
            <Stack direction="row" spacing={2} alignItems="center">
              <TextField
                size="small"
                placeholder="Search orders..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: <Search size={20} />
                }}
                sx={{ minWidth: 200 }}
              />
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Status</InputLabel>
                <Select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  label="Status"
                >
                  <MenuItem value="all">All</MenuItem>
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="filled">Filled</MenuItem>
                  <MenuItem value="cancelled">Cancelled</MenuItem>
                </Select>
              </FormControl>
              <Button
                variant="outlined"
                startIcon={<Filter size={16} />}
              >
                More Filters
              </Button>
              <Button
                variant="outlined"
                startIcon={<Download size={16} />}
              >
                Export
              </Button>
            </Stack>
          </Stack>

          <Box sx={{ height: 600, width: '100%' }}>
            <DataGrid
              rows={orderRows}
              columns={orderColumns}
              checkboxSelection
              disableRowSelectionOnClick
              onRowSelectionModelChange={(newSelection) => {
                setSelectedOrders(Array.from(newSelection as unknown as string[]));
              }}
              pageSizeOptions={[10, 25, 50]}
              initialState={{
                pagination: {
                  paginationModel: { page: 0, pageSize: 10 }
                }
              }}
            />
          </Box>
        </TabPanel>

        {/* Executions Tab */}
        <TabPanel value={activeTab} index={1}>
          <Stack spacing={3}>
            <Alert severity="info">
              Real-time execution monitoring with detailed fill information and quality metrics
            </Alert>
            
            {mockOrderManagementData.liveExecutions.map((execution) => (
              <Card key={execution.id} variant="outlined">
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
                            <AIConfidenceIndicator 
                              confidence={execution.confidence} 
                              size="sm" 
                              showLabel={false}
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
            ))}
          </Stack>
        </TabPanel>

        {/* Bulk Orders Tab */}
        <TabPanel value={activeTab} index={2}>
          <Stack spacing={3}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="h6">Bulk Order Batches</Typography>
              <Button
                variant="contained"
                startIcon={<Upload size={16} />}
                onClick={() => setIsBulkUploadOpen(true)}
              >
                Upload New Batch
              </Button>
            </Stack>

            {mockOrderManagementData.bulkOrderBatches.map((batch) => (
              <Card key={batch.id} variant="outlined">
                <CardContent>
                  <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={2}>
                    <Box>
                      <Typography variant="h6" fontWeight="bold">
                        {batch.name}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        {batch.fileName}
                      </Typography>
                    </Box>
                    <Chip
                      label={batch.status}
                      color={getStatusColor(batch.status)}
                      variant="filled"
                    />
                  </Stack>

                  <Grid sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 3, mb: 2 }}>
                    <Grid sx={{ gridColumn: 'span 1' }}>
                      <Typography variant="body2" color="textSecondary">Total Orders</Typography>
                      <Typography variant="h6" fontWeight="bold">
                        {batch.totalOrders}
                      </Typography>
                    </Grid>
                    <Grid sx={{ gridColumn: 'span 1' }}>
                      <Typography variant="body2" color="textSecondary">Processed</Typography>
                      <Typography variant="h6" fontWeight="bold" color="info.main">
                        {batch.processedOrders}
                      </Typography>
                    </Grid>
                    <Grid sx={{ gridColumn: 'span 1' }}>
                      <Typography variant="body2" color="textSecondary">Successful</Typography>
                      <Typography variant="h6" fontWeight="bold" color="success.main">
                        {batch.successfulOrders}
                      </Typography>
                    </Grid>
                    <Grid sx={{ gridColumn: 'span 1' }}>
                      <Typography variant="body2" color="textSecondary">Failed</Typography>
                      <Typography variant="h6" fontWeight="bold" color="error.main">
                        {batch.failedOrders}
                      </Typography>
                    </Grid>
                  </Grid>

                  <Box mb={2}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
                      <Typography variant="body2">Progress</Typography>
                      <Typography variant="body2">
                        {((batch.processedOrders / batch.totalOrders) * 100).toFixed(1)}%
                      </Typography>
                    </Stack>
                    <LinearProgress
                      variant="determinate"
                      value={(batch.processedOrders / batch.totalOrders) * 100}
                      sx={{ height: 8, borderRadius: 4 }}
                    />
                  </Box>

                  {batch.validationErrors.length > 0 && (
                    <Alert severity="warning" sx={{ mt: 2 }}>
                      <Typography variant="body2" fontWeight="bold" mb={1}>
                        Validation Errors:
                      </Typography>
                      {batch.validationErrors.map((error, index) => (
                        <Typography key={index} variant="body2">
                          • {error}
                        </Typography>
                      ))}
                    </Alert>
                  )}

                  <Stack direction="row" justifyContent="space-between" alignItems="center" mt={2}>
                    <Typography variant="body2" color="textSecondary">
                      Uploaded: {new Date(batch.uploadedAt).toLocaleString()}
                    </Typography>
                    <Stack direction="row" spacing={1}>
                      <Button size="small" variant="outlined">
                        View Details
                      </Button>
                      <Button size="small" variant="outlined">
                        Download Report
                      </Button>
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>
            ))}
          </Stack>
        </TabPanel>

        {/* Algorithms Tab */}
        <TabPanel value={activeTab} index={3}>
          <Grid sx={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: 3 }}>
            {mockOrderManagementData.algorithmStatuses.map((algo) => (
              <Grid key={algo.id} sx={{ gridColumn: { xs: 'span 12', md: 'span 6', lg: 'span 4' } }}>
                <Card variant="outlined">
                  <CardContent>
                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={2}>
                      <Box>
                        <Typography variant="h6" fontWeight="bold">
                          {algo.name}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          ID: {algo.id}
                        </Typography>
                      </Box>
                      <Chip
                        label={algo.status}
                        color={getStatusColor(algo.status)}
                        size="small"
                      />
                    </Stack>

                    <Stack spacing={2} mb={3}>
                      <Box>
                        <Stack direction="row" justifyContent="space-between">
                          <Typography variant="body2" color="textSecondary">Success Rate</Typography>
                          <Typography variant="body2" fontWeight="bold">
                            {formatPercentage(algo.successRate * 100)}
                          </Typography>
                        </Stack>
                        <LinearProgress
                          variant="determinate"
                          value={algo.successRate * 100}
                          color="success"
                          sx={{ mt: 0.5 }}
                        />
                      </Box>

                      <Grid sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2 }}>
                        <Grid sx={{ gridColumn: 'span 1' }}>
                          <Typography variant="body2" color="textSecondary">Orders Generated</Typography>
                          <Typography variant="body1" fontWeight="bold">
                            {algo.ordersGenerated}
                          </Typography>
                        </Grid>
                        <Grid sx={{ gridColumn: 'span 1' }}>
                          <Typography variant="body2" color="textSecondary">Orders Executed</Typography>
                          <Typography variant="body1" fontWeight="bold" color="success.main">
                            {algo.ordersExecuted}
                          </Typography>
                        </Grid>
                        <Grid sx={{ gridColumn: 'span 1' }}>
                          <Typography variant="body2" color="textSecondary">Realized P&L</Typography>
                          <Typography variant="body1" fontWeight="bold" color="success.main">
                            {formatCurrency(algo.realizedPnL)}
                          </Typography>
                        </Grid>
                        <Grid sx={{ gridColumn: 'span 1' }}>
                          <Typography variant="body2" color="textSecondary">Risk Score</Typography>
                          <Typography variant="body1" fontWeight="bold">
                            {formatRiskScore(algo.riskScore)}
                          </Typography>
                        </Grid>
                      </Grid>
                    </Stack>

                    <Stack direction="row" spacing={1} justifyContent="center">
                      {algo.status === AlgorithmStatus.RUNNING ? (
                        <IconButton color="warning">
                          <Pause size={20} />
                        </IconButton>
                      ) : (
                        <IconButton color="success">
                          <Play size={20} />
                        </IconButton>
                      )}
                      <IconButton color="error">
                        <Square size={20} />
                      </IconButton>
                      <IconButton>
                        <Settings size={20} />
                      </IconButton>
                      <IconButton>
                        <RefreshCw size={20} />
                      </IconButton>
                    </Stack>

                    <Typography variant="body2" color="textSecondary" textAlign="center" mt={1}>
                      Last heartbeat: {new Date(algo.lastHeartbeat).toLocaleTimeString()}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </TabPanel>

        {/* Order Book Tab */}
        <TabPanel value={activeTab} index={4}>
          <Grid sx={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: 3 }}>
            <Grid sx={{ gridColumn: { xs: 'span 12', md: 'span 8' } }}>
              <Card>
                <CardContent>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
                    <Typography variant="h6">
                      Order Book - {mockOrderManagementData.orderBookData.symbol}
                    </Typography>
                    <Stack direction="row" alignItems="center" spacing={2}>
                      <Typography variant="body2" color="textSecondary">
                        Spread: {formatCurrency(mockOrderManagementData.orderBookData.spread)}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Mid: {formatCurrency(mockOrderManagementData.orderBookData.midPrice)}
                      </Typography>
                    </Stack>
                  </Stack>

                  <Grid sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2 }}>
                    <Grid sx={{ gridColumn: 'span 1' }}>
                      <Typography variant="subtitle2" color="success.main" mb={1}>
                        Bids
                      </Typography>
                      <TableContainer>
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell>Price</TableCell>
                              <TableCell>Quantity</TableCell>
                              <TableCell>Orders</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {mockOrderManagementData.orderBookData.bids.map((bid, index) => (
                              <TableRow key={index}>
                                <TableCell sx={{ color: 'success.main', fontFamily: 'monospace' }}>
                                  {formatCurrency(bid.price)}
                                </TableCell>
                                <TableCell sx={{ fontFamily: 'monospace' }}>
                                  {bid.quantity.toLocaleString()}
                                </TableCell>
                                <TableCell>{bid.orders}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </Grid>

                    <Grid sx={{ gridColumn: 'span 1' }}>
                      <Typography variant="subtitle2" color="error.main" mb={1}>
                        Asks
                      </Typography>
                      <TableContainer>
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell>Price</TableCell>
                              <TableCell>Quantity</TableCell>
                              <TableCell>Orders</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {mockOrderManagementData.orderBookData.asks.map((ask, index) => (
                              <TableRow key={index}>
                                <TableCell sx={{ color: 'error.main', fontFamily: 'monospace' }}>
                                  {formatCurrency(ask.price)}
                                </TableCell>
                                <TableCell sx={{ fontFamily: 'monospace' }}>
                                  {ask.quantity.toLocaleString()}
                                </TableCell>
                                <TableCell>{ask.orders}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            <Grid sx={{ gridColumn: { xs: 'span 12', md: 'span 4' } }}>
              <Stack spacing={3}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" mb={2}>Market Depth</Typography>
                    <Stack spacing={2}>
                      <Box>
                        <Typography variant="body2" color="textSecondary">Total Bid Volume</Typography>
                        <Typography variant="h6" color="success.main">
                          {mockOrderManagementData.orderBookData.totalBidVolume.toLocaleString()}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="body2" color="textSecondary">Total Ask Volume</Typography>
                        <Typography variant="h6" color="error.main">
                          {mockOrderManagementData.orderBookData.totalAskVolume.toLocaleString()}
                        </Typography>
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent>
                    <Typography variant="h6" mb={2}>Order Flow</Typography>
                    <Alert severity="info">
                      Real-time order flow visualization would be displayed here with live updates.
                    </Alert>
                  </CardContent>
                </Card>
              </Stack>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Risk Tab */}
        <TabPanel value={activeTab} index={5}>
          <Grid sx={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: 3 }}>
            <Grid sx={{ gridColumn: { xs: 'span 12', md: 'span 6' } }}>
              <Card>
                <CardContent>
                  <Typography variant="h6" mb={3}>Portfolio Risk Metrics</Typography>
                  <Stack spacing={3}>
                    <Box>
                      <Stack direction="row" justifyContent="space-between" mb={1}>
                        <Typography variant="body2">Margin Utilization</Typography>
                        <Typography variant="body2" fontWeight="bold">
                          {formatPercentage(mockOrderManagementData.riskMetrics.marginUtilization * 100)}
                        </Typography>
                      </Stack>
                      <LinearProgress
                        variant="determinate"
                        value={mockOrderManagementData.riskMetrics.marginUtilization * 100}
                        color={mockOrderManagementData.riskMetrics.marginUtilization > 0.8 ? 'error' : 'primary'}
                        sx={{ height: 8, borderRadius: 4 }}
                      />
                    </Box>

                    <Grid sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2 }}>
                      <Grid sx={{ gridColumn: 'span 1' }}>
                        <Typography variant="body2" color="textSecondary">Portfolio Value</Typography>
                        <Typography variant="h6" fontWeight="bold">
                          {formatCurrency(mockOrderManagementData.riskMetrics.portfolioValue)}
                        </Typography>
                      </Grid>
                      <Grid sx={{ gridColumn: 'span 1' }}>
                        <Typography variant="body2" color="textSecondary">Total Exposure</Typography>
                        <Typography variant="h6" fontWeight="bold">
                          {formatCurrency(mockOrderManagementData.riskMetrics.totalExposure)}
                        </Typography>
                      </Grid>
                      <Grid sx={{ gridColumn: 'span 1' }}>
                        <Typography variant="body2" color="textSecondary">Available Margin</Typography>
                        <Typography variant="h6" fontWeight="bold" color="success.main">
                          {formatCurrency(mockOrderManagementData.riskMetrics.availableMargin)}
                        </Typography>
                      </Grid>
                      <Grid sx={{ gridColumn: 'span 1' }}>
                        <Typography variant="body2" color="textSecondary">Used Margin</Typography>
                        <Typography variant="h6" fontWeight="bold" color="warning.main">
                          {formatCurrency(mockOrderManagementData.riskMetrics.usedMargin)}
                        </Typography>
                      </Grid>
                    </Grid>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>

            <Grid sx={{ gridColumn: { xs: 'span 12', md: 'span 6' } }}>
              <Card>
                <CardContent>
                  <Typography variant="h6" mb={3}>Risk Indicators</Typography>
                  <Stack spacing={2}>
                    <Box>
                      <Typography variant="body2" color="textSecondary">Overall Risk Score</Typography>
                      <Typography variant="h4" fontWeight="bold" color="warning.main">
                        {formatRiskScore(mockOrderManagementData.riskMetrics.overallRiskScore)}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" color="textSecondary">VaR (95%)</Typography>
                      <Typography variant="h6" fontWeight="bold" color="error.main">
                        {formatCurrency(mockOrderManagementData.riskMetrics.var95)}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" color="textSecondary">Max Drawdown</Typography>
                      <Typography variant="h6" fontWeight="bold" color="error.main">
                        {formatCurrency(mockOrderManagementData.riskMetrics.maxDrawdown)}
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Analytics Tab */}
        <TabPanel value={activeTab} index={6}>
          <Grid sx={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: 3 }}>
            <Grid sx={{ gridColumn: { xs: 'span 12', md: 'span 8' } }}>
              <Card>
                <CardContent>
                  <Typography variant="h6" mb={3}>Daily P&L Performance</Typography>
                  <Box sx={{ height: 300 }}>
                    <LineChart
                      dataset={mockPerformanceData.dailyPnL}
                      xAxis={[{ dataKey: 'date' }]}
                      series={[{ dataKey: 'pnl', color: '#1976d2' }]}
                      width={800}
                      height={300}
                    />
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid sx={{ gridColumn: { xs: 'span 12', md: 'span 4' } }}>
              <Card>
                <CardContent>
                  <Typography variant="h6" mb={3}>Execution Quality</Typography>
                  <Stack spacing={2}>
                    <Box>
                      <Typography variant="body2" color="textSecondary">Average Slippage</Typography>
                      <Typography variant="h6" fontWeight="bold">
                        {formatSlippage(mockPerformanceData.executionQuality.avgSlippage)}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" color="textSecondary">Fill Rate</Typography>
                      <Typography variant="h6" fontWeight="bold" color="success.main">
                        {formatPercentage(mockPerformanceData.executionQuality.fillRate * 100)}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" color="textSecondary">Avg Execution Speed</Typography>
                      <Typography variant="h6" fontWeight="bold">
                        {formatExecutionSpeed(mockPerformanceData.executionQuality.avgExecutionSpeed)}
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>
      </Card>

      {/* Create Order Dialog */}
      <Dialog open={isCreateOrderOpen} onClose={() => setIsCreateOrderOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Create New Order</DialogTitle>
        <DialogContent>
          <Grid sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2, mt: 1 }}>
            <Grid sx={{ gridColumn: 'span 1' }}>
              <TextField
                fullWidth
                label="Symbol"
                placeholder="e.g., RELIANCE"
              />
            </Grid>
            <Grid sx={{ gridColumn: 'span 1' }}>
              <FormControl fullWidth>
                <InputLabel>Side</InputLabel>
                <Select label="Side">
                  <MenuItem value="BUY">Buy</MenuItem>
                  <MenuItem value="SELL">Sell</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid sx={{ gridColumn: 'span 1' }}>
              <FormControl fullWidth>
                <InputLabel>Order Type</InputLabel>
                <Select label="Order Type">
                  <MenuItem value="MARKET">Market</MenuItem>
                  <MenuItem value="LIMIT">Limit</MenuItem>
                  <MenuItem value="STOP_LOSS">Stop Loss</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid sx={{ gridColumn: 'span 1' }}>
              <TextField
                fullWidth
                label="Quantity"
                type="number"
              />
            </Grid>
            <Grid sx={{ gridColumn: 'span 1' }}>
              <TextField
                fullWidth
                label="Price"
                type="number"
                inputProps={{ step: '0.01' }}
              />
            </Grid>
            <Grid sx={{ gridColumn: 'span 1' }}>
              <FormControl fullWidth>
                <InputLabel>Venue</InputLabel>
                <Select label="Venue">
                  <MenuItem value="NSE">NSE</MenuItem>
                  <MenuItem value="BSE">BSE</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsCreateOrderOpen(false)}>Cancel</Button>
          <Button variant="contained">Create Order</Button>
        </DialogActions>
      </Dialog>

      {/* Bulk Upload Dialog */}
      <Dialog open={isBulkUploadOpen} onClose={() => setIsBulkUploadOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Bulk Order Upload</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 2 }}>
            <Alert severity="info">
              Upload a CSV file with columns: Symbol, Side, OrderType, Quantity, Price, Venue
            </Alert>
            <Button
              variant="outlined"
              component="label"
              startIcon={<Upload size={16} />}
              sx={{ height: 100, borderStyle: 'dashed' }}
            >
              Choose CSV File
              <input type="file" accept=".csv" hidden />
            </Button>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsBulkUploadOpen(false)}>Cancel</Button>
          <Button variant="contained">Upload & Validate</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};