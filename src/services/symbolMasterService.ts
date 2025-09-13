interface SymbolMaster {
  fyToken: string;
  isin: string;
  exSymbol: string;
  symDetails: string;
  symTicker: string;
  exchange: number;
  segment: number;
  exSymName: string;
  exToken: number;
  exSeries: string;
  optType: string;
  underSym: string;
  underFyTok: string;
  exInstType: number;
  minLotSize: number;
  tickSize: number;
  tradingSession: string;
  lastUpdate: string;
  expiryDate: string;
  strikePrice: number;
  qtyFreeze: string;
  tradeStatus: number;
  currencyCode: string;
  upperPrice: number;
  lowerPrice: number;
  faceValue: number;
  qtyMultiplier: number;
  previousClose: number;
  previousOi: number;
  asmGsmVal: string;
  exchangeName: string;
  symbolDesc: string;
  originalExpDate: string;
  is_mtf_tradable: number;
  mtf_margin: number;
  stream: string;
}

class SymbolMasterService {
  private symbolCache: Record<string, SymbolMaster> = {};
  private lastUpdated: Date | null = null;
  private readonly CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

  async loadSymbolMaster(): Promise<void> {
    if (this.isCacheValid()) {
      return;
    }

    try {
      const response = await fetch('https://public.fyers.in/sym_details/NSE_CM_sym_master.json');
      const data = await response.json();
      this.symbolCache = data;
      this.lastUpdated = new Date();
    } catch (error) {
      console.error('Failed to load symbol master:', error);
    }
  }

  private isCacheValid(): boolean {
    if (!this.lastUpdated) return false;
    return Date.now() - this.lastUpdated.getTime() < this.CACHE_DURATION;
  }

  getSymbolDetails(symbol: string): SymbolMaster | null {
    return this.symbolCache[symbol] || null;
  }

  getCompanyName(symbol: string): string {
    const details = this.getSymbolDetails(symbol);
    return details?.symDetails || symbol;
  }

  searchSymbols(query: string, limit: number = 10): SymbolMaster[] {
    const results: SymbolMaster[] = [];
    const queryLower = query.toLowerCase();

    for (const [ticker, details] of Object.entries(this.symbolCache)) {
      if (results.length >= limit) break;
      
      if (
        ticker.toLowerCase().includes(queryLower) ||
        details.symDetails.toLowerCase().includes(queryLower) ||
        details.exSymName.toLowerCase().includes(queryLower)
      ) {
        results.push(details);
      }
    }

    return results;
  }

  getPopularStocks(): string[] {
    return [
      'NSE:RELIANCE-EQ',
      'NSE:TCS-EQ', 
      'NSE:INFY-EQ',
      'NSE:HDFCBANK-EQ',
      'NSE:ICICIBANK-EQ',
      'NSE:HINDUNILVR-EQ',
      'NSE:ITC-EQ',
      'NSE:KOTAKBANK-EQ',
      'NSE:LT-EQ',
      'NSE:BHARTIARTL-EQ'
    ];
  }

  formatSymbolForFyers(symbol: string): string {
    // Convert simple symbol to Fyers format
    if (!symbol.includes(':')) {
      return `NSE:${symbol}-EQ`;
    }
    return symbol;
  }
}

export const symbolMasterService = new SymbolMasterService();