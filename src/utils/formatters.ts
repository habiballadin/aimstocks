import { ConnectionStatus, DataFlowStatus, ConnectionHealth, BrokerType } from '../types/enums';

// Existing formatters
export const formatCurrency = (amount: number, currency = '₹'): string => {
  return `${currency}${amount.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;
};

export const formatPercentage = (value: number): string => {
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(2)}%`;
};

export const formatNumber = (value: number): string => {
  if (value >= 10000000) {
    return `${(value / 10000000).toFixed(2)}Cr`;
  } else if (value >= 100000) {
    return `${(value / 100000).toFixed(2)}L`;
  } else if (value >= 1000) {
    return `${(value / 1000).toFixed(2)}K`;
  }
  return value.toString();
};

export const formatDate = (date: string | Date): string => {
  const d = new Date(date);
  return d.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
};

export const formatTime = (date: string | Date): string => {
  const d = new Date(date);
  return d.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Broker connection status and data formatters
export const formatConnectionStatus = (status: ConnectionStatus): string => {
  switch (status) {
    case ConnectionStatus.CONNECTED:
      return 'Connected';
    case ConnectionStatus.DISCONNECTED:
      return 'Disconnected';
    case ConnectionStatus.CONNECTING:
      return 'Connecting...';
    case ConnectionStatus.RECONNECTING:
      return 'Reconnecting...';
    case ConnectionStatus.ERROR:
      return 'Connection Error';
    default:
      return 'Unknown';
  }
};

export const formatDataFlowStatus = (status: DataFlowStatus): string => {
  switch (status) {
    case DataFlowStatus.ACTIVE:
      return 'Data Streaming';
    case DataFlowStatus.INACTIVE:
      return 'No Data Flow';
    case DataFlowStatus.STREAMING:
      return 'Live Streaming';
    case DataFlowStatus.NO_DATA:
      return 'No Data';
    case DataFlowStatus.LIMITED:
      return 'Limited Data';
    default:
      return 'Unknown';
  }
};

export const formatConnectionHealth = (health: ConnectionHealth): string => {
  switch (health) {
    case ConnectionHealth.HEALTHY:
      return 'Healthy';
    case ConnectionHealth.WARNING:
      return 'Warning';
    case ConnectionHealth.CRITICAL:
      return 'Critical';
    case ConnectionHealth.UNKNOWN:
      return 'Unknown';
    default:
      return 'Unknown';
  }
};

export const formatLatency = (latency: number): string => {
  if (latency < 100) return `${latency}ms`;
  if (latency < 1000) return `${latency}ms`;
  return `${(latency / 1000).toFixed(1)}s`;
};

export const formatSuccessRate = (rate: number): string => {
  return `${(rate * 100).toFixed(1)}%`;
};

export const formatDataPoints = (count: number): string => {
  if (count < 1000) return count.toString();
  if (count < 1000000) return `${(count / 1000).toFixed(1)}K`;
  return `${(count / 1000000).toFixed(1)}M`;
};

export const formatBrokerName = (brokerType: BrokerType): string => {
  switch (brokerType) {
    case BrokerType.FYERS:
      return 'Fyers';
    case BrokerType.ICICI_DIRECT:
      return 'ICICI Direct';
    case BrokerType.UPSTOX:
      return 'Upstox';
    case BrokerType.ZERODHA:
      return 'Zerodha Kite';
    case BrokerType.ANGEL_ONE:
      return 'Angel One';
    case BrokerType.FIVEPAISA:
      return '5paisa';
    case BrokerType.KOTAK:
      return 'Kotak Securities';
    case BrokerType.HDFC:
      return 'HDFC Securities';
    case BrokerType.SHAREKHAN:
      return 'Sharekhan';
    case BrokerType.MOTILAL_OSWAL:
      return 'Motilal Oswal';
    default:
      return 'Unknown Broker';
  }
};

// Order management specific formatters
export const formatOrderId = (orderId: string): string => {
  return `#${orderId.slice(-8).toUpperCase()}`;
};

export const formatExecutionTime = (timestamp: string): string => {
  const date = new Date(timestamp);
  return date.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    fractionalSecondDigits: 3
  } as Intl.DateTimeFormatOptions & { fractionalSecondDigits?: number });
};

export const formatOrderSize = (quantity: number, symbol: string): string => {
  if (quantity >= 1000000) {
    return `${(quantity / 1000000).toFixed(2)}M ${symbol}`;
  } else if (quantity >= 1000) {
    return `${(quantity / 1000).toFixed(2)}K ${symbol}`;
  }
  return `${quantity} ${symbol}`;
};

export const formatSlippage = (slippage: number): string => {
  const sign = slippage >= 0 ? '+' : '';
  return `${sign}${(slippage * 10000).toFixed(2)} bps`;
};

export const formatExecutionSpeed = (speedMs: number): string => {
  if (speedMs < 1000) {
    return `${speedMs.toFixed(0)}ms`;
  } else {
    return `${(speedMs / 1000).toFixed(2)}s`;
  }
};

export const formatRiskScore = (score: number): string => {
  return `${(score * 100).toFixed(1)}/100`;
};

export const formatMarginUsage = (used: number, total: number): string => {
  const percentage = (used / total) * 100;
  return `${formatCurrency(used)} / ${formatCurrency(total)} (${percentage.toFixed(1)}%)`;
};

export const formatOrderRate = (ordersPerSecond: number): string => {
  if (ordersPerSecond < 1) {
    return `${(ordersPerSecond * 60).toFixed(1)}/min`;
  }
  return `${ordersPerSecond.toFixed(1)}/sec`;
};

// Additional formatters for order management dashboard
export const formatOrderValue = (quantity: number, price: number): string => {
  const value = quantity * price;
  return formatCurrency(value);
};

export const formatFillPercentage = (filled: number, total: number): string => {
  const percentage = (filled / total) * 100;
  return `${percentage.toFixed(1)}%`;
};

export const formatAlgorithmUptime = (uptimeMs: number): string => {
  const hours = Math.floor(uptimeMs / (1000 * 60 * 60));
  const minutes = Math.floor((uptimeMs % (1000 * 60 * 60)) / (1000 * 60));
  return `${hours}h ${minutes}m`;
};

export const formatResourceUsage = (usage: number, unit: string): string => {
  return `${usage.toFixed(1)}${unit}`;
};

export const formatOrderBookPrice = (price: number): string => {
  return price.toFixed(2);
};

export const formatOrderBookQuantity = (quantity: number): string => {
  if (quantity >= 1000) {
    return `${(quantity / 1000).toFixed(1)}K`;
  }
  return quantity.toString();
};

export const formatBatchProgress = (processed: number, total: number): string => {
  const percentage = (processed / total) * 100;
  return `${processed}/${total} (${percentage.toFixed(1)}%)`;
};

// Additional formatters for new features
export const formatGreek = (value: number, type: string): string => {
  switch (type) {
    case 'DELTA':
    case 'GAMMA':
      return value.toFixed(4);
    case 'THETA':
      return value.toFixed(2);
    case 'VEGA':
      return value.toFixed(3);
    case 'RHO':
      return value.toFixed(4);
    default:
      return value.toFixed(2);
  }
};

export const formatOptionStrike = (strike: number): string => {
  return strike.toFixed(2);
};

export const formatImpliedVolatility = (iv: number): string => {
  return `${(iv * 100).toFixed(2)}%`;
};

export const formatRiskMetric = (value: number, metric: string): string => {
  switch (metric) {
    case 'SHARPE_RATIO':
    case 'SORTINO_RATIO':
      return value.toFixed(2);
    case 'MAX_DRAWDOWN':
    case 'VOLATILITY':
      return formatPercentage(value);
    case 'VAR':
    case 'EXPECTED_SHORTFALL':
      return formatCurrency(value);
    default:
      return formatNumber(value);
  }
};

export const formatNotificationTime = (date: Date): string => {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  
  return formatDate(date);
};

// Volume formatter
export const formatVolume = (volume: number): string => {
  if (volume >= 10000000) {
    return `${(volume / 10000000).toFixed(2)}Cr`;
  } else if (volume >= 100000) {
    return `${(volume / 100000).toFixed(2)}L`;
  } else if (volume >= 1000) {
    return `${(volume / 1000).toFixed(2)}K`;
  }
  return volume.toString();
};

// Order type formatter
export const formatOrderType = (orderType: string): string => {
  switch (orderType.toUpperCase()) {
    case 'MARKET':
      return 'Market';
    case 'LIMIT':
      return 'Limit';
    case 'STOP_LOSS':
      return 'Stop Loss';
    case 'STOP_LOSS_MARKET':
      return 'SL-M';
    case 'STOP_LOSS_LIMIT':
      return 'SL-L';
    case 'BRACKET_ORDER':
      return 'BO';
    case 'COVER_ORDER':
      return 'CO';
    case 'ICEBERG':
      return 'Iceberg';
    case 'AUCTION':
      return 'Auction';
    default:
      return orderType;
  }
};