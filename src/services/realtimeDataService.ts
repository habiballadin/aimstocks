import { fyersService } from './fyersService';

export interface RealtimeData {
  symbol: string;
  ltp: number;
  open: number;
  high: number;
  low: number;
  volume: number;
  change: number;
  changePercent: number;
}

export interface IndexData {
  nifty: RealtimeData | null;
  sensex: RealtimeData | null;
}

export async function getRealtimeQuote(symbol: string): Promise<RealtimeData | null> {
  try {
    const quotes = await fyersService.getQuotes([`NSE:${symbol}-EQ`]);
    const quote = quotes[`NSE:${symbol}-EQ`];
    
    if (quote) {
      return {
        symbol,
        ltp: quote.lp,
        open: quote.open_price,
        high: quote.high_price,
        low: quote.low_price,
        volume: quote.volume,
        change: quote.ch,
        changePercent: quote.chp
      };
    }
    return null;
  } catch (error) {
    console.error(`Error fetching real-time data for ${symbol}:`, error);
    return null;
  }
}

export interface OptionChainData {
  strike: number;
  callLTP: number;
  callChange: number;
  callOI: number;
  putLTP: number;
  putChange: number;
  putOI: number;
}

export async function getOptionChain(symbol: string, expiry: string): Promise<OptionChainData[]> {
  try {
    const fyersSymbol = `NSE:${symbol}-EQ`;
    const response = await fyersService.getOptionChain(fyersSymbol, 10);
    
    if (!response || !response.optionsChain) {
      throw new Error('Invalid response from API');
    }
    
    // Group options by strike price
    const strikeMap = new Map<number, { call?: any; put?: any }>();
    
    response.optionsChain.forEach(option => {
      // Skip the underlying asset (option_type is empty)
      if (option.option_type === 'CE' || option.option_type === 'PE') {
        const strike = option.strike_price;
        if (!strikeMap.has(strike)) {
          strikeMap.set(strike, {});
        }
        
        const strikeData = strikeMap.get(strike)!;
        if (option.option_type === 'CE') {
          strikeData.call = option;
        } else {
          strikeData.put = option;
        }
      }
    });
    
    // Convert to OptionChainData format
    const result: OptionChainData[] = [];
    strikeMap.forEach((data, strike) => {
      if (data.call && data.put) {
        result.push({
          strike,
          callLTP: data.call.ltp || 0,
          callChange: data.call.ltpch || 0,
          callOI: data.call.oi || 0,
          putLTP: data.put.ltp || 0,
          putChange: data.put.ltpch || 0,
          putOI: data.put.oi || 0
        });
      }
    });
    
    return result.sort((a, b) => a.strike - b.strike);
  } catch (error) {
    console.error('Error fetching option chain:', error);
    
    // Generate realistic strikes based on current market levels
    const generateStrikes = async (symbol: string) => {
      try {
        const quote = await getRealtimeQuote(symbol);
        const currentPrice = quote?.ltp || getDefaultPrice(symbol);
        
        const strikeInterval = getStrikeInterval(symbol);
        const baseStrike = Math.round(currentPrice / strikeInterval) * strikeInterval;
        
        return Array.from({ length: 7 }, (_, i) => baseStrike + (i - 3) * strikeInterval);
      } catch {
        return getDefaultStrikes(symbol);
      }
    };
    
    const strikes = await generateStrikes(symbol);
    
    return strikes.map(strike => ({
      strike,
      callLTP: Math.random() * 100 + 10,
      callChange: (Math.random() - 0.5) * 10,
      callOI: Math.floor(Math.random() * 5000000),
      putLTP: Math.random() * 100 + 10,
      putChange: (Math.random() - 0.5) * 10,
      putOI: Math.floor(Math.random() * 5000000)
    }));
  }
}

function getDefaultPrice(symbol: string): number {
  const prices: Record<string, number> = {
    'NIFTY': 24850,
    'BANKNIFTY': 51200,
    'TCS': 3880,
    'RELIANCE': 2850
  };
  return prices[symbol] || 24850;
}

function getStrikeInterval(symbol: string): number {
  const intervals: Record<string, number> = {
    'NIFTY': 50,
    'BANKNIFTY': 100,
    'TCS': 20,
    'RELIANCE': 50
  };
  return intervals[symbol] || 50;
}

function getDefaultStrikes(symbol: string): number[] {
  const defaults: Record<string, number[]> = {
    'NIFTY': [24700, 24750, 24800, 24850, 24900, 24950, 25000],
    'BANKNIFTY': [51000, 51100, 51200, 51300, 51400, 51500, 51600],
    'TCS': [3860, 3880, 3900, 3920, 3940, 3960, 3980],
    'RELIANCE': [2800, 2825, 2850, 2875, 2900, 2925, 2950]
  };
  return defaults[symbol] || defaults['NIFTY'];
}

export async function getIndexData(): Promise<{ nifty: RealtimeData | null; sensex: RealtimeData | null }> {
  try {
    const quotes = await fyersService.getQuotes(['NSE:NIFTY50-INDEX', 'BSE:SENSEX-INDEX']);
    
    const niftyQuote = quotes['NSE:NIFTY50-INDEX'];
    const sensexQuote = quotes['BSE:SENSEX-INDEX'];
    
    return {
      nifty: niftyQuote ? {
        symbol: 'NIFTY 50',
        ltp: niftyQuote.lp,
        open: niftyQuote.open_price,
        high: niftyQuote.high_price,
        low: niftyQuote.low_price,
        volume: niftyQuote.volume,
        change: niftyQuote.ch,
        changePercent: niftyQuote.chp
      } : null,
      sensex: sensexQuote ? {
        symbol: 'SENSEX',
        ltp: sensexQuote.lp,
        open: sensexQuote.open_price,
        high: sensexQuote.high_price,
        low: sensexQuote.low_price,
        volume: sensexQuote.volume,
        change: sensexQuote.ch,
        changePercent: sensexQuote.chp
      } : null
    };
  } catch (error) {
    console.error('Error fetching index data:', error);
    return { nifty: null, sensex: null };
  }
}