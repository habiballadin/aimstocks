//import enums.ts if any
import { BrokerType, ConnectionStatus, DataFlowStatus, ConnectionHealth, BrokerService, SubscriptionPlan } from '../types/enums';

// Data for global state store
export const mockBrokerStore = {
  connectedBrokers: [
    {
      id: "broker_fyers_001" as const,
      type: BrokerType.FYERS,
      status: ConnectionStatus.CONNECTED,
      dataFlow: DataFlowStatus.STREAMING,
      health: ConnectionHealth.HEALTHY,
      connectedAt: "2025-01-27T09:15:00.000Z" as const,
      lastDataReceived: "2025-01-27T11:30:00.000Z" as const,
      latency: 45,
      successRate: 0.987,
      dataPointsReceived: 15420,
      failedRequests: 12,
      services: [BrokerService.MARKET_DATA, BrokerService.ORDER_MANAGEMENT, BrokerService.REAL_TIME_QUOTES],
      plan: SubscriptionPlan.PRO
    },
    {
      id: "broker_zerodha_001" as const,
      type: BrokerType.ZERODHA,
      status: ConnectionStatus.CONNECTED,
      dataFlow: DataFlowStatus.ACTIVE,
      health: ConnectionHealth.HEALTHY,
      connectedAt: "2025-01-27T08:45:00.000Z" as const,
      lastDataReceived: "2025-01-27T11:29:00.000Z" as const,
      latency: 62,
      successRate: 0.994,
      dataPointsReceived: 23890,
      failedRequests: 8,
      services: [BrokerService.MARKET_DATA, BrokerService.ORDER_MANAGEMENT, BrokerService.PORTFOLIO_SYNC, BrokerService.HISTORICAL_DATA],
      plan: SubscriptionPlan.ENTERPRISE
    },
    {
      id: "broker_upstox_001" as const,
      type: BrokerType.UPSTOX,
      status: ConnectionStatus.RECONNECTING,
      dataFlow: DataFlowStatus.INACTIVE,
      health: ConnectionHealth.WARNING,
      connectedAt: "2025-01-27T10:20:00.000Z" as const,
      lastDataReceived: "2025-01-27T11:15:00.000Z" as const,
      latency: 156,
      successRate: 0.923,
      dataPointsReceived: 8750,
      failedRequests: 34,
      services: [BrokerService.MARKET_DATA, BrokerService.REAL_TIME_QUOTES],
      plan: SubscriptionPlan.BASIC
    },
    {
      id: "broker_icici_001" as const,
      type: BrokerType.ICICI_DIRECT,
      status: ConnectionStatus.CONNECTED,
      dataFlow: DataFlowStatus.ACTIVE,
      health: ConnectionHealth.HEALTHY,
      connectedAt: "2025-01-27T07:30:00.000Z" as const,
      lastDataReceived: "2025-01-27T11:28:00.000Z" as const,
      latency: 78,
      successRate: 0.991,
      dataPointsReceived: 18650,
      failedRequests: 5,
      services: [BrokerService.MARKET_DATA, BrokerService.ORDER_MANAGEMENT, BrokerService.PORTFOLIO_SYNC],
      plan: SubscriptionPlan.PRO
    },
    {
      id: "broker_angel_001" as const,
      type: BrokerType.ANGEL_ONE,
      status: ConnectionStatus.CONNECTED,
      dataFlow: DataFlowStatus.STREAMING,
      health: ConnectionHealth.HEALTHY,
      connectedAt: "2025-01-27T09:00:00.000Z" as const,
      lastDataReceived: "2025-01-27T11:31:00.000Z" as const,
      latency: 52,
      successRate: 0.989,
      dataPointsReceived: 21340,
      failedRequests: 7,
      services: [BrokerService.MARKET_DATA, BrokerService.ORDER_MANAGEMENT, BrokerService.REAL_TIME_QUOTES, BrokerService.HISTORICAL_DATA],
      plan: SubscriptionPlan.ENTERPRISE
    },
    {
      id: "broker_5paisa_001" as const,
      type: BrokerType.FIVEPAISA,
      status: ConnectionStatus.CONNECTED,
      dataFlow: DataFlowStatus.ACTIVE,
      health: ConnectionHealth.HEALTHY,
      connectedAt: "2025-01-27T08:20:00.000Z" as const,
      lastDataReceived: "2025-01-27T11:27:00.000Z" as const,
      latency: 89,
      successRate: 0.976,
      dataPointsReceived: 12890,
      failedRequests: 15,
      services: [BrokerService.MARKET_DATA, BrokerService.ORDER_MANAGEMENT],
      plan: SubscriptionPlan.BASIC
    },
    {
      id: "broker_kotak_001" as const,
      type: BrokerType.KOTAK,
      status: ConnectionStatus.CONNECTED,
      dataFlow: DataFlowStatus.ACTIVE,
      health: ConnectionHealth.HEALTHY,
      connectedAt: "2025-01-27T06:45:00.000Z" as const,
      lastDataReceived: "2025-01-27T11:26:00.000Z" as const,
      latency: 95,
      successRate: 0.985,
      dataPointsReceived: 16780,
      failedRequests: 9,
      services: [BrokerService.MARKET_DATA, BrokerService.ORDER_MANAGEMENT, BrokerService.PORTFOLIO_SYNC],
      plan: SubscriptionPlan.PRO
    }
  ],
  availableBrokers: [
    { type: BrokerType.FYERS, name: "Fyers", supported: true },
    { type: BrokerType.ZERODHA, name: "Zerodha", supported: true },
    { type: BrokerType.UPSTOX, name: "Upstox", supported: true },
    { type: BrokerType.ICICI_DIRECT, name: "ICICI Direct", supported: true },
    { type: BrokerType.ANGEL_ONE, name: "Angel One", supported: true },
    { type: BrokerType.FIVEPAISA, name: "5paisa", supported: true },
    { type: BrokerType.KOTAK, name: "Kotak Securities", supported: true },
    { type: BrokerType.HDFC, name: "HDFC Securities", supported: false },
    { type: BrokerType.SHAREKHAN, name: "Sharekhan", supported: false }
  ],
  settings: {
    autoReconnect: true,
    enableNotifications: true,
    dataRefreshRate: 1000,
    timeoutSettings: 30000,
    retryAttempts: 3
  }
};

// Data returned by API queries
export const mockBrokerQuery = {
  connectionMetrics: {
    totalConnections: 7,
    activeConnections: 6,
    failedConnections: 1,
    avgLatency: 68.14,
    totalDataPoints: 108930,
    overallSuccessRate: 0.986
  },
  realtimeAnalysis: {
    dataFlowRate: 1250,
    peakDataRate: 2890,
    connectionUptime: 0.967,
    errorRate: 0.033,
    lastAnalysisUpdate: "2025-01-27T11:30:00.000Z" as const
  }
};

// Data passed as props to the root component
export const mockBrokerRootProps = {
  showAddBrokerModal: false,
  selectedBroker: null as string | null,
  enableRealTimeUpdates: true,
  refreshInterval: 2000
};