//import enums.ts if any
import { OrderType, OrderSide, ProductType, MarketStatus, TrendDirection, RiskLevel, InvestorType, SupportedLanguage } from '../types/enums';
import { getRealtimeQuote } from '../services/realtimeDataService';

// Data for global state store - now using real-time data
export const mockStore = {
  async getUser() {
    return {
      id: "user123" as const,
      name: "Rajesh Kumar" as const,
      email: "rajesh.kumar@email.com" as const,
      phone: "+91-9876543210" as const,
      investorType: InvestorType.INTERMEDIATE,
      riskProfile: RiskLevel.MODERATE,
      preferredLanguage: SupportedLanguage.ENGLISH,
      isKYCCompleted: true,
      totalInvestment: 500000,
      currentValue: 547500,
      availableBalance: 125000,
      daysPnL: 12500,
      overallPnL: 47500
    };
  },
  
  async getMarket() {
    return {
      status: MarketStatus.OPEN,
      nifty50: {
        value: 24850.75,
        change: 185.25,
        changePercent: 0.75
      },
      sensex: {
        value: 81245.30,
        change: 245.80,
        changePercent: 0.30
      }
    };
  },
  
  getPreferences() {
    return {
      theme: "light" as const,
      notifications: true,
      priceAlerts: true,
      newsAlerts: true,
      language: SupportedLanguage.ENGLISH
    };
  },
  
  // Static fallback data
  user: {
    id: "user123" as const,
    name: "Rajesh Kumar" as const,
    email: "rajesh.kumar@email.com" as const,
    phone: "+91-9876543210" as const,
    investorType: InvestorType.INTERMEDIATE,
    riskProfile: RiskLevel.MODERATE,
    preferredLanguage: SupportedLanguage.ENGLISH,
    isKYCCompleted: true,
    totalInvestment: 500000,
    currentValue: 547500,
    availableBalance: 125000,
    daysPnL: 12500,
    overallPnL: 47500
  },
  market: {
    status: MarketStatus.OPEN,
    nifty50: {
      value: 24850.75,
      change: 185.25,
      changePercent: 0.75
    },
    sensex: {
      value: 81245.30,
      change: 245.80,
      changePercent: 0.30
    }
  },
  preferences: {
    theme: "light" as const,
    notifications: true,
    priceAlerts: true,
    newsAlerts: true,
    language: SupportedLanguage.ENGLISH
  }
};

// Data returned by API queries - now using real-time data
export const mockQuery = {
  async getWatchlistStocks() {
    const symbols = ['RELIANCE', 'TCS', 'INFY', 'HDFC', 'ICICIBANK'];
    const realtimeStocks = [];
    
    for (const symbol of symbols) {
      const realtimeData = await getRealtimeQuote(symbol);
      if (realtimeData) {
        realtimeStocks.push({
          symbol: symbol as const,
          companyName: `${symbol} Ltd` as const,
          currentPrice: realtimeData.ltp,
          change: realtimeData.change,
          changePercent: realtimeData.changePercent,
          volume: realtimeData.volume,
          marketCap: 19250000000000,
          high52Week: realtimeData.high * 1.2,
          low52Week: realtimeData.low * 0.8,
          peRatio: 25.4,
          trend: realtimeData.change > 0 ? TrendDirection.BULLISH : TrendDirection.BEARISH,
          aiConfidence: 0.78,
          aiRecommendation: realtimeData.change > 0 ? "BUY" : "SELL"
        });
      }
    }
    
    return realtimeStocks.length > 0 ? realtimeStocks : mockQuery.watchlistStocks;
  },
  
  watchlistStocks: [
    {
      symbol: "RELIANCE" as const,
      companyName: "Reliance Industries Ltd" as const,
      currentPrice: 2847.65,
      change: 45.20,
      changePercent: 1.61,
      volume: 2547890,
      marketCap: 19250000000000,
      high52Week: 3024.90,
      low52Week: 2220.30,
      peRatio: 25.4,
      trend: TrendDirection.BULLISH,
      aiConfidence: 0.78,
      aiRecommendation: "BUY" as const
    }
  ],
  aiInsights: [
    {
      id: "insight1" as const,
      type: "MARKET_SENTIMENT" as const,
      title: "Bullish Sentiment Detected" as const,
      description: "AI analysis shows strong bullish sentiment in IT sector with 78% confidence" as const,
      confidence: 0.78,
      timestamp: "2025-01-27T10:30:00.000Z" as const,
      impact: "HIGH" as const
    },
    {
      id: "insight2" as const,
      type: "PRICE_PREDICTION" as const,
      title: "RELIANCE Price Target" as const,
      description: "AI predicts RELIANCE may reach ₹2950 in next 5 trading sessions" as const,
      confidence: 0.72,
      timestamp: "2025-01-27T09:45:00.000Z" as const,
      impact: "MEDIUM" as const
    },
    {
      id: "insight3" as const,
      type: "SECTOR_ANALYSIS" as const,
      title: "Banking Sector Momentum" as const,
      description: "Strong momentum detected in banking stocks with institutional buying" as const,
      confidence: 0.69,
      timestamp: "2025-01-27T11:15:00.000Z" as const,
      impact: "HIGH" as const
    }
  ],
  async getPortfolio() {
    const realtimeData = await getRealtimeQuote('RELIANCE');
    if (realtimeData) {
      const quantity = 50;
      const avgPrice = 2650.00;
      const currentValue = realtimeData.ltp * quantity;
      const investedValue = avgPrice * quantity;
      
      return [{
        symbol: "RELIANCE" as const,
        quantity,
        avgPrice,
        currentPrice: realtimeData.ltp,
        investedValue,
        currentValue,
        pnl: currentValue - investedValue,
        pnlPercent: ((currentValue - investedValue) / investedValue) * 100
      }];
    }
    return mockQuery.portfolio;
  },
  
  portfolio: [
    {
      symbol: "RELIANCE" as const,
      quantity: 50,
      avgPrice: 2650.00,
      currentPrice: 2847.65,
      investedValue: 132500,
      currentValue: 142382.50,
      pnl: 9882.50,
      pnlPercent: 7.46
    }
  ],
  async getRecentOrders() {
    return mockQuery.recentOrders;
  },
  
  recentOrders: [
    {
      id: "order1" as const,
      symbol: "INFY" as const,
      side: OrderSide.BUY,
      quantity: 10,
      price: 1830.00,
      orderType: OrderType.LIMIT,
      productType: ProductType.DELIVERY,
      status: "EXECUTED" as const,
      timestamp: "2025-01-27T11:15:00.000Z" as const
    }
  ],
  newsUpdates: [
    {
      id: "news1" as const,
      headline: "IT Sector Shows Strong Q3 Results" as const,
      summary: "Major IT companies report better than expected quarterly results" as const,
      timestamp: "2025-01-27T08:30:00.000Z" as const,
      source: "Economic Times" as const,
      sentiment: "POSITIVE" as const,
      relevantStocks: ["TCS", "INFY", "WIPRO"]
    },
    {
      id: "news2" as const,
      headline: "RBI Maintains Repo Rate at 6.5%" as const,
      summary: "Reserve Bank of India keeps key policy rates unchanged in monetary policy review" as const,
      timestamp: "2025-01-27T07:15:00.000Z" as const,
      source: "Business Standard" as const,
      sentiment: "NEUTRAL" as const,
      relevantStocks: ["HDFC", "ICICIBANK", "SBIN"]
    }
  ],
  async getMarketOverview() {
    const niftyData = await getRealtimeQuote('NIFTY');
    const sensexData = await getRealtimeQuote('SENSEX');
    
    if (niftyData || sensexData) {
      return {
        indices: [
          { 
            name: "NIFTY 50", 
            value: niftyData?.ltp || 24850.75, 
            change: niftyData?.change || 185.25, 
            changePercent: niftyData?.changePercent || 0.75 
          },
          { 
            name: "SENSEX", 
            value: sensexData?.ltp || 81245.30, 
            change: sensexData?.change || 245.80, 
            changePercent: sensexData?.changePercent || 0.30 
          },
          { name: "BANK NIFTY", value: 52347.85, change: 412.60, changePercent: 0.80 }
        ],
        topGainers: [
          { symbol: "ICICIBANK", change: 1.92 },
          { symbol: "RELIANCE", change: 1.61 },
          { symbol: "INFY", change: 1.01 }
        ],
        topLosers: [
          { symbol: "HDFC", change: -0.74 },
          { symbol: "TCS", change: -0.62 },
          { symbol: "WIPRO", change: -1.23 }
        ]
      };
    }
    return mockQuery.marketOverview;
  },
  
  marketOverview: {
    indices: [
      { name: "NIFTY 50", value: 24850.75, change: 185.25, changePercent: 0.75 },
      { name: "SENSEX", value: 81245.30, change: 245.80, changePercent: 0.30 },
      { name: "BANK NIFTY", value: 52347.85, change: 412.60, changePercent: 0.80 }
    ],
    topGainers: [
      { symbol: "ICICIBANK", change: 1.92 },
      { symbol: "RELIANCE", change: 1.61 },
      { symbol: "INFY", change: 1.01 }
    ],
    topLosers: [
      { symbol: "HDFC", change: -0.74 },
      { symbol: "TCS", change: -0.62 },
      { symbol: "WIPRO", change: -1.23 }
    ]
  }
};

// Data passed as props to the root component
export const mockRootProps = {
  initialTab: "dashboard" as const,
  showTutorial: false,
  enableNotifications: true,
  marketHours: {
    start: "09:15" as const,
    end: "15:30" as const,
    timezone: "Asia/Kolkata" as const
  }
};