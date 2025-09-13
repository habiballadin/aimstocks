// Mock data for options trading, analytics, reports, profile, AI features, and notifications

// Mock data for options trading
export const mockOptionsChain = {
  calls: [
    {
      strike: 150,
      lastPrice: 5.25,
      bid: 5.20,
      ask: 5.30,
      volume: 1250,
      openInterest: 5680,
      impliedVolatility: 0.28,
      delta: 0.65,
      gamma: 0.025,
      theta: -0.15,
      vega: 0.18,
      rho: 0.08,
      change: 0.15,
      changePercent: 2.94
    },
    {
      strike: 155,
      lastPrice: 3.80,
      bid: 3.75,
      ask: 3.85,
      volume: 890,
      openInterest: 3420,
      impliedVolatility: 0.26,
      delta: 0.52,
      gamma: 0.028,
      theta: -0.12,
      vega: 0.16,
      rho: 0.06,
      change: -0.05,
      changePercent: -1.30
    }
  ],
  puts: [
    {
      strike: 150,
      lastPrice: 2.15,
      bid: 2.10,
      ask: 2.20,
      volume: 760,
      openInterest: 2890,
      impliedVolatility: 0.25,
      delta: -0.35,
      gamma: 0.025,
      theta: -0.10,
      vega: 0.15,
      rho: -0.05,
      change: 0.08,
      changePercent: 3.87
    },
    {
      strike: 155,
      lastPrice: 4.25,
      bid: 4.20,
      ask: 4.30,
      volume: 1120,
      openInterest: 4560,
      impliedVolatility: 0.27,
      delta: -0.48,
      gamma: 0.028,
      theta: -0.13,
      vega: 0.17,
      rho: -0.07,
      change: 0.20,
      changePercent: 4.94
    }
  ]
} as const;

// Mock data for analytics
export const mockAnalyticsData = {
  performanceMetrics: {
    totalReturn: 15.8,
    annualizedReturn: 12.4,
    sharpeRatio: 1.85,
    maxDrawdown: -8.2,
    winRate: 68.5,
    profitFactor: 2.3,
    alpha: 3.2,
    beta: 1.15,
    volatility: 18.6
  },
  riskMetrics: {
    valueAtRisk: -15420.50,
    expectedShortfall: -22180.75,
    portfolioVolatility: 16.8,
    correlationMatrix: [
      [1.0, 0.65, 0.42, 0.28],
      [0.65, 1.0, 0.58, 0.35],
      [0.42, 0.58, 1.0, 0.71],
      [0.28, 0.35, 0.71, 1.0]
    ]
  },
  sectorAllocation: [
    { sector: 'Technology', percentage: 35.2, value: 87500 },
    { sector: 'Healthcare', percentage: 18.7, value: 46750 },
    { sector: 'Financial Services', percentage: 15.3, value: 38250 },
    { sector: 'Consumer Discretionary', percentage: 12.8, value: 32000 },
    { sector: 'Energy', percentage: 8.9, value: 22250 },
    { sector: 'Others', percentage: 9.1, value: 22750 }
  ]
} as const;

// Mock data for reports
export const mockReportsData = {
  balanceSheet: {
    totalAssets: 1250000,
    currentAssets: 850000,
    fixedAssets: 400000,
    totalLiabilities: 320000,
    currentLiabilities: 180000,
    longTermLiabilities: 140000,
    equity: 930000,
    retainedEarnings: 680000
  },
  incomeStatement: {
    revenue: 485000,
    grossProfit: 298000,
    operatingIncome: 185000,
    netIncome: 142000,
    eps: 2.84,
    dividends: 28400
  },
  heatmapData: [
    { symbol: 'AAPL', sector: 'Technology', performance: 8.5, volume: 45.2 },
    { symbol: 'GOOGL', sector: 'Technology', performance: 12.3, volume: 28.7 },
    { symbol: 'MSFT', sector: 'Technology', performance: 6.8, volume: 52.1 },
    { symbol: 'TSLA', sector: 'Consumer Discretionary', performance: -4.2, volume: 89.3 },
    { symbol: 'NVDA', sector: 'Technology', performance: 18.7, volume: 76.8 }
  ]
} as const;

// Mock data for user profile
export const mockUserProfile = {
  personalInfo: {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    phone: '+1-555-0123',
    dateOfBirth: '1985-06-15' as const,
    address: '123 Wall Street, New York, NY 10005'
  },
  tradingPreferences: {
    riskTolerance: 'MODERATE' as const,
    investmentGoals: ['WEALTH_BUILDING', 'INCOME_GENERATION'] as const,
    tradingExperience: 'INTERMEDIATE' as const,
    preferredBrokers: ['FYERS', 'ZERODHA'] as const,
    autoTradingEnabled: true,
    notificationsEnabled: true
  },
  subscription: {
    tier: 'PRO' as const,
    status: 'ACTIVE' as const,
    renewalDate: '2024-12-15' as const,
    features: ['Advanced Analytics', 'AI Predictions', 'Options Trading', 'Real-time Data']
  }
} as const;

// Mock data for AI features
export const mockAIFeatures = {
  predictions: [
    {
      symbol: 'AAPL',
      currentPrice: 185.50,
      predictedPrice: 195.25,
      confidence: 'HIGH' as const,
      timeframe: '1 week',
      factors: ['Earnings beat', 'Technical breakout', 'Positive sentiment']
    },
    {
      symbol: 'GOOGL',
      currentPrice: 142.30,
      predictedPrice: 138.75,
      confidence: 'MEDIUM' as const,
      timeframe: '1 week',
      factors: ['Regulatory concerns', 'Market volatility']
    }
  ],
  sentimentAnalysis: {
    overall: 'BULLISH' as const,
    score: 72,
    sources: {
      news: 68,
      social: 75,
      analyst: 74
    }
  },
  recommendations: [
    {
      symbol: 'MSFT',
      action: 'BUY' as const,
      confidence: 85,
      reasoning: 'Strong fundamentals and technical momentum'
    },
    {
      symbol: 'TSLA',
      action: 'HOLD' as const,
      confidence: 62,
      reasoning: 'Mixed signals, wait for clearer direction'
    }
  ]
} as const;

// Mock data for notifications
export const mockNotifications = [
  {
    id: '1',
    type: 'SUCCESS' as const,
    category: 'TRADING' as const,
    title: 'Order Executed',
    message: 'Your buy order for 100 shares of AAPL has been executed at $185.50',
    timestamp: new Date(Date.now() - 300000),
    read: false,
    priority: 'HIGH' as const
  },
  {
    id: '2',
    type: 'INFO' as const,
    category: 'MARKET' as const,
    title: 'Market Alert',
    message: 'NASDAQ has reached a new all-time high',
    timestamp: new Date(Date.now() - 900000),
    read: false,
    priority: 'MEDIUM' as const
  },
  {
    id: '3',
    type: 'WARNING' as const,
    category: 'PORTFOLIO' as const,
    title: 'Risk Alert',
    message: 'Your portfolio concentration in tech sector exceeds 40%',
    timestamp: new Date(Date.now() - 1800000),
    read: true,
    priority: 'HIGH' as const
  }
] as const;