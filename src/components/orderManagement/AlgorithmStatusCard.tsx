import React from 'react';
import { 
  Stack,
  Chip
} from '@mui/material';
import { AlgorithmStatus, ConnectionHealth } from '../../types/enums';
import { 
  formatCurrency, 
  formatRiskScore,
  formatAlgorithmUptime,
  formatResourceUsage
} from '../../utils/formatters';
import { getAlgorithmStatusColor, getConnectionHealthColor } from './utils/StatusUtils';
import { MetricDisplay } from './common/MetricDisplay';
import { ProgressWithLabel } from './common/ProgressWithLabel';
import { ActionButtonGroup } from './common/ActionButtonGroup';
import { CardWithHeader } from './common/CardWithHeader';

interface AlgorithmStatusCardProps {
  algorithm: {
    id: string;
    name: string;
    status: AlgorithmStatus;
    health: ConnectionHealth;
    uptime: number;
    lastHeartbeat: string;
    ordersGenerated: number;
    ordersExecuted: number;
    ordersFailed: number;
    successRate: number;
    avgExecutionTime: number;
    currentPositions: number;
    unrealizedPnL: number;
    realizedPnL: number;
    riskScore: number;
    cpuUsage: number;
    memoryUsage: number;
    networkLatency: number;
  };
  onStart?: (id: string) => void;
  onPause?: (id: string) => void;
  onStop?: (id: string) => void;
  onSettings?: (id: string) => void;
}

export const AlgorithmStatusCard: React.FC<AlgorithmStatusCardProps> = ({ 
  algorithm,
  onStart,
  onPause,
  onStop,
  onSettings
}) => {
  return (
    <CardWithHeader
      title={algorithm.name}
      subtitle={`ID: ${algorithm.id}`}
      status={{
        label: algorithm.status,
        color: getAlgorithmStatusColor(algorithm.status)
      }}
      headerAction={
        <Stack direction="row" spacing={1}>
          <Chip
            label={algorithm.health}
            color={getConnectionHealthColor(algorithm.health)}
            size="small"
            variant="outlined"
          />
        </Stack>
      }
    >
      <Stack spacing={2} mb={3}>
        <ProgressWithLabel
          value={algorithm.successRate * 100}
          label="Success Rate"
          color="success"
        />

        <Stack direction="row" spacing={2}>
          <MetricDisplay
            label="Orders Generated"
            value={algorithm.ordersGenerated}
            size="medium"
          />
          <MetricDisplay
            label="Orders Executed"
            value={algorithm.ordersExecuted}
            color="success.main"
            size="medium"
          />
        </Stack>

        <Stack direction="row" spacing={2}>
          <MetricDisplay
            label="Realized P&L"
            value={formatCurrency(algorithm.realizedPnL)}
            color="success.main"
            size="medium"
          />
          <MetricDisplay
            label="Risk Score"
            value={formatRiskScore(algorithm.riskScore)}
            size="medium"
          />
        </Stack>

        <Stack direction="row" spacing={2}>
          <MetricDisplay
            label="CPU Usage"
            value={formatResourceUsage(algorithm.cpuUsage, '%')}
            size="medium"
          />
          <MetricDisplay
            label="Memory"
            value={formatResourceUsage(algorithm.memoryUsage, 'MB')}
            size="medium"
          />
        </Stack>

        <Stack direction="row" spacing={2}>
          <MetricDisplay
            label="Uptime"
            value={formatAlgorithmUptime(algorithm.uptime)}
            size="medium"
          />
          <MetricDisplay
            label="Latency"
            value={`${algorithm.networkLatency}ms`}
            size="medium"
          />
        </Stack>
      </Stack>

      <ActionButtonGroup
        type="algorithm"
        status={algorithm.status}
        onStart={() => onStart?.(algorithm.id)}
        onPause={() => onPause?.(algorithm.id)}
        onStop={() => onStop?.(algorithm.id)}
        onSettings={() => onSettings?.(algorithm.id)}
      />
    </CardWithHeader>
  );
};