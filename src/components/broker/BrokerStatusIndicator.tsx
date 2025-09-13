import React from 'react';
import { Box, Badge } from '@chakra-ui/react';
import { keyframes } from '@emotion/react';
import { ConnectionStatus, DataFlowStatus, ConnectionHealth } from '../../types/enums';
import FiberManualRecordOutlinedIcon from '@mui/icons-material/FiberManualRecordOutlined';
import SyncOutlinedIcon from '@mui/icons-material/SyncOutlined';
import FavoriteOutlinedIcon from '@mui/icons-material/FavoriteOutlined';

interface BrokerStatusIndicatorProps {
  status: ConnectionStatus;
  dataFlow?: DataFlowStatus;
  health?: ConnectionHealth;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  animated?: boolean;
}

const pulse = keyframes`
  0% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.7; transform: scale(1.1); }
  100% { opacity: 1; transform: scale(1); }
`;

const spin = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

export const BrokerStatusIndicator: React.FC<BrokerStatusIndicatorProps> = ({
  status,
  dataFlow,
  health,
  size = 'md',
  showLabel = false,
  animated = true
}) => {
  const getStatusColor = () => {
    switch (status) {
      case ConnectionStatus.CONNECTED:
        return 'green.500';
      case ConnectionStatus.CONNECTING:
      case ConnectionStatus.RECONNECTING:
        return 'yellow.500';
      case ConnectionStatus.ERROR:
        return 'red.500';
      case ConnectionStatus.DISCONNECTED:
      default:
        return 'gray.400';
    }
  };

  const getDataFlowColor = () => {
    switch (dataFlow) {
      case DataFlowStatus.STREAMING:
      case DataFlowStatus.ACTIVE:
        return 'blue.500';
      case DataFlowStatus.LIMITED:
        return 'yellow.500';
      case DataFlowStatus.INACTIVE:
      case DataFlowStatus.NO_DATA:
      default:
        return 'gray.400';
    }
  };

  const getHealthColor = () => {
    switch (health) {
      case ConnectionHealth.HEALTHY:
        return 'green.500';
      case ConnectionHealth.WARNING:
        return 'yellow.500';
      case ConnectionHealth.CRITICAL:
        return 'red.500';
      case ConnectionHealth.UNKNOWN:
      default:
        return 'gray.400';
    }
  };

  const getStatusLabel = () => {
    switch (status) {
      case ConnectionStatus.CONNECTED:
        return 'Connected';
      case ConnectionStatus.CONNECTING:
        return 'Connecting';
      case ConnectionStatus.RECONNECTING:
        return 'Reconnecting';
      case ConnectionStatus.ERROR:
        return 'Error';
      case ConnectionStatus.DISCONNECTED:
      default:
        return 'Disconnected';
    }
  };

  const iconSize = {
    sm: 12,
    md: 16,
    lg: 20
  }[size];

  const shouldAnimate = animated && (
    status === ConnectionStatus.CONNECTING ||
    status === ConnectionStatus.RECONNECTING ||
    dataFlow === DataFlowStatus.STREAMING
  );

  return (
    <Box display="flex" alignItems="center" gap={2}>
      {/* Connection Status */}
      <Box position="relative">
        <FiberManualRecordOutlinedIcon
          style={{
            fontSize: iconSize,
            color: getStatusColor(),
            animation: shouldAnimate && status !== ConnectionStatus.CONNECTED ? `${pulse} 2s infinite` : undefined
          }}
        />
      </Box>

      {/* Data Flow Indicator */}
      {dataFlow && (
        <Box position="relative">
          <SyncOutlinedIcon
            style={{
              fontSize: iconSize,
              color: getDataFlowColor(),
              animation: dataFlow === DataFlowStatus.STREAMING ? `${spin} 2s linear infinite` : undefined
            }}
          />
        </Box>
      )}

      {/* Health Indicator */}
      {health && (
        <Box position="relative">
          <FavoriteOutlinedIcon
            style={{
              fontSize: iconSize,
              color: getHealthColor(),
              animation: health === ConnectionHealth.HEALTHY && animated ? `${pulse} 3s infinite` : undefined
            }}
          />
        </Box>
      )}

      {/* Status Label */}
      {showLabel && (
        <Badge
          colorScheme={status === ConnectionStatus.CONNECTED ? 'green' : 
                       status === ConnectionStatus.ERROR ? 'red' : 'yellow'}
          variant="subtle"
          size={size}
        >
          {getStatusLabel()}
        </Badge>
      )}
    </Box>
  );
};
