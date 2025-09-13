import { OrderStatus, OrderSide, AlgorithmStatus, BulkOrderStatus, ConnectionHealth } from '../../../types/enums';

export const getOrderStatusColor = (status: OrderStatus) => {
  switch (status) {
    case OrderStatus.FILLED:
      return 'success';
    case OrderStatus.PENDING:
    case OrderStatus.SUBMITTED:
      return 'warning';
    case OrderStatus.CANCELLED:
    case OrderStatus.REJECTED:
    case OrderStatus.FAILED:
      return 'error';
    case OrderStatus.PARTIALLY_FILLED:
      return 'info';
    default:
      return 'default';
  }
};

export const getOrderSideColor = (side: OrderSide) => {
  return side === OrderSide.BUY ? 'success' : 'error';
};

export const getAlgorithmStatusColor = (status: AlgorithmStatus) => {
  switch (status) {
    case AlgorithmStatus.RUNNING:
      return 'success';
    case AlgorithmStatus.INITIALIZING:
      return 'warning';
    case AlgorithmStatus.PAUSED:
      return 'info';
    case AlgorithmStatus.STOPPED:
      return 'default';
    case AlgorithmStatus.ERROR:
      return 'error';
    default:
      return 'default';
  }
};

export const getBulkOrderStatusColor = (status: BulkOrderStatus) => {
  switch (status) {
    case BulkOrderStatus.COMPLETED:
      return 'success';
    case BulkOrderStatus.PROCESSING:
      return 'warning';
    case BulkOrderStatus.FAILED:
      return 'error';
    case BulkOrderStatus.PARTIALLY_PROCESSED:
      return 'info';
    default:
      return 'default';
  }
};

export const getConnectionHealthColor = (health: ConnectionHealth) => {
  switch (health) {
    case ConnectionHealth.HEALTHY:
      return 'success';
    case ConnectionHealth.WARNING:
      return 'warning';
    case ConnectionHealth.CRITICAL:
      return 'error';
    default:
      return 'default';
  }
};

export const getRiskLevelColor = (score: number) => {
  if (score <= 0.3) return 'success';
  if (score <= 0.6) return 'warning';
  return 'error';
};

export const getRiskLevelText = (score: number) => {
  if (score <= 0.2) return 'Very Low';
  if (score <= 0.4) return 'Low';
  if (score <= 0.6) return 'Moderate';
  if (score <= 0.8) return 'High';
  return 'Very High';
};