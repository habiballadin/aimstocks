import React from 'react';
import { 
  Stack, 
  Button,
  Alert,
  Box,
  Typography
} from '@mui/material';
import { BulkOrderStatus } from '../../types/enums';
import { formatBatchProgress } from '../../utils/formatters';
import { getBulkOrderStatusColor } from './utils/StatusUtils';
import { MetricDisplay } from './common/MetricDisplay';
import { ProgressWithLabel } from './common/ProgressWithLabel';
import { CardWithHeader } from './common/CardWithHeader';

interface BulkOrderBatchCardProps {
  batch: {
    id: string;
    name: string;
    totalOrders: number;
    processedOrders: number;
    successfulOrders: number;
    failedOrders: number;
    status: BulkOrderStatus;
    uploadedAt: string;
    processedAt: string | null;
    totalValue: number;
    fileName: string;
    validationErrors: string[];
  };
  onViewDetails?: (id: string) => void;
  onDownloadReport?: (id: string) => void;
}

export const BulkOrderBatchCard: React.FC<BulkOrderBatchCardProps> = ({ 
  batch,
  onViewDetails,
  onDownloadReport
}) => {
  return (
    <CardWithHeader
      title={batch.name}
      subtitle={batch.fileName}
      status={{
        label: batch.status,
        color: getBulkOrderStatusColor(batch.status),
        variant: 'filled'
      }}
    >
      <Stack direction="row" spacing={3} mb={2}>
        <MetricDisplay
          label="Total Orders"
          value={batch.totalOrders}
          size="large"
        />
        <MetricDisplay
          label="Processed"
          value={batch.processedOrders}
          color="info.main"
          size="large"
        />
        <MetricDisplay
          label="Successful"
          value={batch.successfulOrders}
          color="success.main"
          size="large"
        />
        <MetricDisplay
          label="Failed"
          value={batch.failedOrders}
          color="error.main"
          size="large"
        />
      </Stack>

      <Box mb={2}>
        <ProgressWithLabel
          value={(batch.processedOrders / batch.totalOrders) * 100}
          label="Progress"
          showPercentage={false}
          height={8}
        />
        <Box textAlign="right" mt={1}>
          <Typography variant="body2" fontWeight="bold">
            {formatBatchProgress(batch.processedOrders, batch.totalOrders)}
          </Typography>
        </Box>
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
          <Button 
            size="small" 
            variant="outlined"
            onClick={() => onViewDetails?.(batch.id)}
          >
            View Details
          </Button>
          <Button 
            size="small" 
            variant="outlined"
            onClick={() => onDownloadReport?.(batch.id)}
          >
            Download Report
          </Button>
        </Stack>
      </Stack>
    </CardWithHeader>
  );
};