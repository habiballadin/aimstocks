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
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Switch,
  FormControlLabel,
  Alert
} from '@mui/material';
import { 
  ShoppingCart, 
  Zap, 
  Layers, 
  BrainCircuit, 
  ChartCandlestick,
  Shield,
  ChartColumnIncreasing,
  Plus,
  Upload,
  Search,
  Filter,
  Download
} from 'lucide-react';

// Import custom components
import { OrdersTable } from './OrdersTable';
import { ExecutionCard } from './ExecutionCard';
import { AlgorithmStatusCard } from './AlgorithmStatusCard';
import { BulkOrderBatchCard } from './BulkOrderBatchCard';
import { OrderBookTable } from './OrderBookTable';
import { RiskMetricsCard } from './RiskMetricsCard';
import { PerformanceChart } from './PerformanceChart';
import { OrderFormDialog } from './OrderFormDialog';
import { BulkUploadDialog } from './BulkUploadDialog';

// Import mock data and types
import { mockOrderManagementData, mockPerformanceData } from '../../data/orderManagementMockData';
import { AlgorithmStatus } from '../../types/enums';
import { formatCurrency } from '../../utils/formatters';

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
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [isCreateOrderOpen, setIsCreateOrderOpen] = useState(false);
  const [isBulkUploadOpen, setIsBulkUploadOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [autoRefresh, setAutoRefresh] = useState(true);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleCreateOrder = (orderData: { symbol: string; side: string; orderType: string; quantity: number; price: number | null; stopPrice: number | null; venue: string; timeInForce: string; algorithmId: string | null }) => {
    console.log('Creating order:', orderData);
    // Here you would typically call an API to create the order
  };

  const handleBulkUpload = (file: File, batchName: string) => {
    console.log('Uploading bulk orders:', { file, batchName });
    // Here you would typically call an API to upload the bulk orders
  };

  const handleAlgorithmControl = (algorithmId: string, action: string) => {
    console.log('Algorithm control:', { algorithmId, action });
    // Here you would typically call an API to control the algorithm
  };

  // Filter orders based on search term and status
  const filteredOrders = mockOrderManagementData.activeOrders.filter(order => {
    const matchesSearch = order.symbol.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || order.status.toLowerCase() === filterStatus.toLowerCase();
    return matchesSearch && matchesStatus;
  });

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
          <Stack direction="row" spacing={3}>
            <Card variant="outlined" sx={{ flex: 1 }}>
              <CardContent sx={{ textAlign: 'center', py: 2 }}>
                <Typography variant="h4" color="primary" fontWeight="bold">
                  {mockOrderManagementData.activeOrders.length}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Active Orders
                </Typography>
              </CardContent>
            </Card>
            <Card variant="outlined" sx={{ flex: 1 }}>
              <CardContent sx={{ textAlign: 'center', py: 2 }}>
                <Typography variant="h4" color="success.main" fontWeight="bold">
                  {mockOrderManagementData.liveExecutions.length}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Executions Today
                </Typography>
              </CardContent>
            </Card>
            <Card variant="outlined" sx={{ flex: 1 }}>
              <CardContent sx={{ textAlign: 'center', py: 2 }}>
                <Typography variant="h4" color="warning.main" fontWeight="bold">
                  {mockOrderManagementData.algorithmStatuses.filter(a => a.status === AlgorithmStatus.RUNNING).length}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Running Algorithms
                </Typography>
              </CardContent>
            </Card>
            <Card variant="outlined" sx={{ flex: 1 }}>
              <CardContent sx={{ textAlign: 'center', py: 2 }}>
                <Typography variant="h4" color="info.main" fontWeight="bold">
                  {formatCurrency(mockOrderManagementData.riskMetrics.portfolioValue)}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Portfolio Value
                </Typography>
              </CardContent>
            </Card>
          </Stack>
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
            <Tab icon={<ChartCandlestick size={20} />} label="Order Book" />
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

          <OrdersTable
            orders={filteredOrders}
            onOrderSelect={setSelectedOrders}
            selectedOrders={selectedOrders}
          />
        </TabPanel>

        {/* Executions Tab */}
        <TabPanel value={activeTab} index={1}>
          <Stack spacing={3}>
            <Alert severity="info">
              Real-time execution monitoring with detailed fill information and quality metrics
            </Alert>
            
            {mockOrderManagementData.liveExecutions.map((execution) => (
              <ExecutionCard key={execution.id} execution={execution} />
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
              <BulkOrderBatchCard 
                key={batch.id} 
                batch={batch}
                onViewDetails={(id) => console.log('View details:', id)}
                onDownloadReport={(id) => console.log('Download report:', id)}
              />
            ))}
          </Stack>
        </TabPanel>

        {/* Algorithms Tab */}
        <TabPanel value={activeTab} index={3}>
          <Stack direction="row" flexWrap="wrap" spacing={3}>
            {mockOrderManagementData.algorithmStatuses.map((algo) => (
              <Box key={algo.id} sx={{ minWidth: 350, maxWidth: 400 }}>
                <AlgorithmStatusCard 
                  algorithm={algo}
                  onStart={(id) => handleAlgorithmControl(id, 'start')}
                  onPause={(id) => handleAlgorithmControl(id, 'pause')}
                  onStop={(id) => handleAlgorithmControl(id, 'stop')}
                  onSettings={(id) => handleAlgorithmControl(id, 'settings')}
                />
              </Box>
            ))}
          </Stack>
        </TabPanel>

        {/* Order Book Tab */}
        <TabPanel value={activeTab} index={4}>
          <OrderBookTable orderBook={mockOrderManagementData.orderBookData} />
        </TabPanel>

        {/* Risk Tab */}
        <TabPanel value={activeTab} index={5}>
          <RiskMetricsCard riskMetrics={mockOrderManagementData.riskMetrics} />
        </TabPanel>

        {/* Analytics Tab */}
        <TabPanel value={activeTab} index={6}>
          <PerformanceChart performanceData={mockPerformanceData} />
        </TabPanel>
      </Card>

      {/* Dialogs */}
      <OrderFormDialog
        open={isCreateOrderOpen}
        onClose={() => setIsCreateOrderOpen(false)}
        onSubmit={handleCreateOrder}
      />

      <BulkUploadDialog
        open={isBulkUploadOpen}
        onClose={() => setIsBulkUploadOpen(false)}
        onUpload={handleBulkUpload}
      />
    </Box>
  );
};