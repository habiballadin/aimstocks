export interface Symbol {
  symbol_ticker: string;
  fy_token: string;
  ex_symbol: string;
  sym_details: string;
  exchange_name: string;
  ex_series: string;
  previous_close: number;
  upper_price: number;
  lower_price: number;
  min_lot_size: number;
  tick_size: number;
  trade_status: number;
}

class SymbolService {
  private baseUrl = 'http://localhost:8000';

  async searchSymbols(query: string, exchange?: string): Promise<Symbol[]> {
    const params = new URLSearchParams({ q: query });
    if (exchange) params.append('exchange', exchange);
    
    const response = await fetch(`${this.baseUrl}/symbols/search?${params}`);
    return response.json();
  }

  async getPopularStocks(): Promise<Symbol[]> {
    const response = await fetch(`${this.baseUrl}/symbols/popular`);
    return response.json();
  }

  async updateSymbolMaster(): Promise<void> {
    await fetch(`${this.baseUrl}/symbols/update`, { method: 'POST' });
  }

  formatSymbolForFyers(symbol: Symbol): string {
    return symbol.ex_symbol;
  }

  isSymbolTradeable(symbol: Symbol): boolean {
    return symbol.trade_status === 1;
  }

  getSymbolLimits(symbol: Symbol) {
    return {
      upperLimit: symbol.upper_price,
      lowerLimit: symbol.lower_price,
      minLotSize: symbol.min_lot_size,
      tickSize: symbol.tick_size
    };
  }
}

export const symbolService = new SymbolService();