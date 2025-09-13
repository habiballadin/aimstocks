// Frontend service to consume real-time market data

const API_BASE_URL = 'http://127.0.0.1:5000/api';

export interface MarketDataPoint {
  symbol: string;
  exchange: string;
  ltp: number;
  open: number;
  high: number;
  low: number;
  volume: number;
  change: number;
  changePercent: number;
  updatedAt: string;
}

export interface MarketStatus {
  isOpen: boolean;
  nextOpen?: string;
  nextClose?: string;
}

class MarketDataService {
  private ws: WebSocket | null = null;
  private subscribers: Map<string, Set<(data: MarketDataPoint) => void>> = new Map();

  async getMarketData(symbols?: string[]): Promise<MarketDataPoint[]> {
    try {
      const url = symbols 
        ? `${API_BASE_URL}/market-data?symbols=${symbols.join(',')}`
        : `${API_BASE_URL}/market-data`;
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.success) {
        return data.data;
      }
      throw new Error(data.error || 'Failed to fetch market data');
    } catch (error) {
      console.error('Market data fetch error:', error);
      return [];
    }
  }

  async getMarketStatus(): Promise<MarketStatus> {
    try {
      const response = await fetch(`${API_BASE_URL}/market-status`);
      const data = await response.json();
      
      if (data.success) {
        return {
          isOpen: data.isOpen,
          nextOpen: data.nextOpen,
          nextClose: data.nextClose
        };
      }
      return { isOpen: false };
    } catch (error) {
      console.error('Market status fetch error:', error);
      return { isOpen: false };
    }
  }

  subscribeToSymbol(symbol: string, callback: (data: MarketDataPoint) => void) {
    if (!this.subscribers.has(symbol)) {
      this.subscribers.set(symbol, new Set());
    }
    this.subscribers.get(symbol)!.add(callback);
    
    // Initialize WebSocket if not already connected
    if (!this.ws) {
      this.initializeWebSocket();
    }
  }

  unsubscribeFromSymbol(symbol: string, callback: (data: MarketDataPoint) => void) {
    const symbolSubscribers = this.subscribers.get(symbol);
    if (symbolSubscribers) {
      symbolSubscribers.delete(callback);
      if (symbolSubscribers.size === 0) {
        this.subscribers.delete(symbol);
      }
    }
  }

  private initializeWebSocket() {
    try {
      this.ws = new WebSocket('ws://127.0.0.1:5000/ws/market-data');
      
      this.ws.onopen = () => {
        console.log('Market data WebSocket connected');
        // Subscribe to symbols
        const symbols = Array.from(this.subscribers.keys());
        if (symbols.length > 0) {
          this.ws?.send(JSON.stringify({
            type: 'subscribe',
            symbols
          }));
        }
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'market_data') {
            const marketData: MarketDataPoint = data.data;
            const symbolSubscribers = this.subscribers.get(marketData.symbol);
            if (symbolSubscribers) {
              symbolSubscribers.forEach(callback => callback(marketData));
            }
          }
        } catch (error) {
          console.error('WebSocket message parse error:', error);
        }
      };

      this.ws.onclose = () => {
        console.log('Market data WebSocket disconnected');
        this.ws = null;
        // Reconnect after 5 seconds
        setTimeout(() => {
          if (this.subscribers.size > 0) {
            this.initializeWebSocket();
          }
        }, 5000);
      };

      this.ws.onerror = (error) => {
        console.error('Market data WebSocket error:', error);
      };
    } catch (error) {
      console.error('WebSocket initialization error:', error);
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.subscribers.clear();
  }
}

export const marketDataService = new MarketDataService();