import { OrderSide, OrderType, OrderStatus, OrderPriority, OrderTimeInForce, ExecutionVenue, BulkOrderStatus, AlgorithmStatus, ConnectionHealth } from '../types/enums';

// Mock data for comprehensive order management and execution system

export const mockOrderManagementData = {
  // Active orders across all types
  activeOrders: [
    {
      id: "ORD001234567" as const,
      symbol: "RELIANCE" as const,
      side: OrderSide.BUY,
      orderType: OrderType.LIMIT,
      quantity: 100,
      price: 2850.00,
      filledQuantity: 0,
      remainingQuantity: 100,
      status: OrderStatus.PENDING,
      priority: OrderPriority.NORMAL,
      timeInForce: OrderTimeInForce.DAY,
      venue: ExecutionVenue.NSE,
      algorithmId: null,
      parentOrderId: null,
      createdAt: "2025-01-27T09:30:00.000Z" as const,
      updatedAt: "2025-01-27T09:30:00.000Z" as const,
      estimatedValue: 285000,
      commission: 20.00,
      tags: ["manual", "equity"]
    },
    {
      id: "ORD001234568" as const,
      symbol: "TCS" as const,
      side: OrderSide.SELL,
      orderType: OrderType.MARKET,
      quantity: 50,
      price: null,
      filledQuantity: 25,
      remainingQuantity: 25,
      status: OrderStatus.PARTIALLY_FILLED,
      priority: OrderPriority.HIGH,
      timeInForce: OrderTimeInForce.IOC,
      venue: ExecutionVenue.NSE,
      algorithmId: "algo1" as const,
      parentOrderId: null,
      createdAt: "2025-01-27T10:15:00.000Z" as const,
      updatedAt: "2025-01-27T10:16:30.245Z" as const,
      estimatedValue: 206265,
      commission: 15.00,
      tags: ["algo", "equity"]
    }
  ],

  // Live executions with detailed information
  liveExecutions: [
    {
      id: "EXEC_789123" as const,
      orderId: "ORD001234568" as const,
      symbol: "TCS" as const,
      side: OrderSide.SELL,
      quantity: 25,
      price: 4125.30,
      executionTime: "2025-01-27T10:16:30.245Z" as const,
      venue: ExecutionVenue.NSE,
      counterparty: "INST_BUYER_001" as const,
      commission: 7.50,
      tax: 2.15,
      netAmount: 103125.65,
      slippage: -0.0002,
      marketImpact: 0.0001,
      executionSpeed: 245,
      algorithmId: "algo1" as const,
      confidence: 0.82,
      reason: "Moving average crossover signal" as const
    },
    {
      id: "EXEC_789124" as const,
      orderId: "ORD001234567" as const,
      symbol: "RELIANCE" as const,
      side: OrderSide.BUY,
      quantity: 50,
      price: 2849.95,
      executionTime: "2025-01-27T10:18:45.123Z" as const,
      venue: ExecutionVenue.NSE,
      counterparty: "INST_SELLER_002" as const,
      commission: 8.25,
      tax: 2.35,
      netAmount: 142497.50,
      slippage: 0.0001,
      marketImpact: 0.0002,
      executionSpeed: 312,
      algorithmId: null,
      confidence: 0.95,
      reason: "Manual order execution" as const
    }
  ],

  // Bulk order batches
  bulkOrderBatches: [
    {
      id: "BULK_001" as const,
      name: "Portfolio Rebalancing Batch" as const,
      totalOrders: 25,
      processedOrders: 25,
      successfulOrders: 23,
      failedOrders: 2,
      status: BulkOrderStatus.COMPLETED,
      uploadedAt: "2025-01-27T08:00:00.000Z" as const,
      processedAt: "2025-01-27T08:05:30.000Z" as const,
      totalValue: 2500000,
      fileName: "rebalancing_orders_20250127.csv" as const,
      validationErrors: [
        "Row 15: Invalid symbol 'INVALIDSTOCK'",
        "Row 22: Quantity exceeds position limit"
      ]
    },
    {
      id: "BULK_002" as const,
      name: "EOD Hedging Batch" as const,
      totalOrders: 15,
      processedOrders: 12,
      successfulOrders: 10,
      failedOrders: 2,
      status: BulkOrderStatus.IN_PROGRESS,
      uploadedAt: "2025-01-27T15:45:00.000Z" as const,
      processedAt: "2025-01-27T15:47:30.000Z" as const,
      totalValue: 1500000,
      fileName: "hedging_orders_20250127.csv" as const,
      validationErrors: [
        "Row 8: Price exceeds daily limit",
        "Row 13: Invalid order type for symbol"
      ]
    }
  ],

  // Algorithm execution status
  algorithmStatuses: [
    {
      id: "algo1" as const,
      name: "Moving Average Crossover" as const,
      status: AlgorithmStatus.RUNNING,
      health: ConnectionHealth.HEALTHY,
      uptime: 14400000, // 4 hours in milliseconds
      lastHeartbeat: "2025-01-27T11:30:00.000Z" as const,
      ordersGenerated: 45,
      ordersExecuted: 42,
      ordersFailed: 3,
      successRate: 0.933,
      avgExecutionTime: 180,
      currentPositions: 3,
      unrealizedPnL: 12500.75,
      realizedPnL: 8750.25,
      riskScore: 0.35,
      cpuUsage: 15.2,
      memoryUsage: 128.5,
      networkLatency: 45
    },
    {
      id: "algo2" as const,
      name: "Mean Reversion Strategy" as const,
      status: AlgorithmStatus.PAUSED,
      health: ConnectionHealth.WARNING,
      uptime: 7200000, // 2 hours in milliseconds
      lastHeartbeat: "2025-01-27T11:29:55.000Z" as const,
      ordersGenerated: 28,
      ordersExecuted: 25,
      ordersFailed: 3,
      successRate: 0.892,
      avgExecutionTime: 220,
      currentPositions: 2,
      unrealizedPnL: -5250.50,
      realizedPnL: 15500.75,
      riskScore: 0.45,
      cpuUsage: 18.7,
      memoryUsage: 156.8,
      networkLatency: 52
    }
  ],

  // Order book data
  orderBookData: {
    symbol: "RELIANCE" as const,
    lastUpdated: "2025-01-27T11:30:00.000Z" as const,
    bids: [
      { price: 2847.65, quantity: 150, orders: 3 },
      { price: 2847.60, quantity: 200, orders: 5 },
      { price: 2847.55, quantity: 100, orders: 2 },
      { price: 2847.50, quantity: 300, orders: 8 },
      { price: 2847.45, quantity: 175, orders: 4 }
    ],
    asks: [
      { price: 2847.70, quantity: 125, orders: 2 },
      { price: 2847.75, quantity: 180, orders: 4 },
      { price: 2847.80, quantity: 220, orders: 6 },
      { price: 2847.85, quantity: 160, orders: 3 },
      { price: 2847.90, quantity: 240, orders: 7 }
    ],
    spread: 0.05,
    midPrice: 2847.675,
    totalBidVolume: 925,
    totalAskVolume: 925
  },

  // Risk management metrics
  riskMetrics: {
    portfolioValue: 5475000,
    totalExposure: 4250000,
    availableMargin: 1225000,
    usedMargin: 3250000,
    marginUtilization: 0.726,
    maxDrawdown: -125000,
    var95: -89500,
    expectedShortfall: -156000,
    betaToMarket: 1.15,
    correlationToNifty: 0.82,
    concentrationRisk: 0.35,
    liquidityRisk: 0.18,
    overallRiskScore: 0.42
  }
};

// Performance analytics data
export const mockPerformanceData = {
  dailyPnL: [
    { date: "2025-01-20", pnl: 15750.25, trades: 12 },
    { date: "2025-01-21", pnl: -8250.75, trades: 8 },
    { date: "2025-01-22", pnl: 22500.50, trades: 15 },
    { date: "2025-01-23", pnl: 12750.25, trades: 10 },
    { date: "2025-01-24", pnl: 18250.75, trades: 14 },
    { date: "2025-01-25", pnl: -5500.25, trades: 6 },
    { date: "2025-01-26", pnl: 28750.50, trades: 18 },
    { date: "2025-01-27", pnl: 16500.25, trades: 11 }
  ],
  
  executionQuality: {
    avgSlippage: -0.0002,
    avgExecutionSpeed: 185,
    fillRate: 0.945,
    rejectionRate: 0.025,
    partialFillRate: 0.030,
    marketImpact: 0.0001,
    implementationShortfall: 0.0003
  }
};

// Enhanced mock data for comprehensive order management system
export const mockStore = {
  user: {
    id: 'user123',
    name: 'John Trader',
    permissions: ['ORDER_CREATE', 'ORDER_MODIFY', 'ORDER_CANCEL', 'BULK_UPLOAD', 'ALGO_CONTROL']
  },
  settings: {
    autoRefresh: true,
    refreshInterval: 5000,
    defaultOrderSize: 100,
    riskLimits: {
      maxOrderValue: 1000000,
      maxDailyLoss: 50000,
      maxPositionSize: 500000
    }
  }
};

export const mockQuery = {
  orderManagement: mockOrderManagementData,
  performance: mockPerformanceData,
  realTimeData: {
    timestamp: '2025-01-27T11:30:00.000Z' as const,
    activeOrdersCount: 15,
    todayExecutionsCount: 42,
    runningAlgorithmsCount: 3,
    portfolioValue: 5475000,
    dailyPnL: 16500.25,
    marginUtilization: 0.726
  }
};

export const mockRootProps = {
  initialTab: 0,
  enableAutoRefresh: true,
  showAdvancedFeatures: true,
  permissions: {
    canCreateOrders: true,
    canModifyOrders: true,
    canCancelOrders: true,
    canUploadBulk: true,
    canControlAlgorithms: true,
    canViewRisk: true,
    canExportData: true
  }
};