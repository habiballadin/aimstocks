const API_BASE_URL = 'http://127.0.0.1:5000/api';

export interface FyersProfile {
  fy_id: string;
  name: string;
  display_name: string;
  email_id: string;
  mobile_number: string;
  PAN: string;
  image?: string;
  pin_change_date?: string;
  pwd_change_date?: string;
  totp?: boolean;
  pwd_to_expire?: number;
  ddpi_enabled?: boolean;
  mtf_enabled?: boolean;
}

export interface FyersQuote {
  symbol: string;
  lp: number; // Last traded price
  open_price: number;
  high_price: number;
  low_price: number;
  prev_close_price: number;
  ch: number; // Change value
  chp: number; // Change percentage
  volume: number;
  ask: number; // Asking price
  bid: number; // Bidding price
  spread: number; // Difference between ask and bid
  atp: number; // Average traded price
  short_name: string;
  exchange: string;
  description: string;
  fyToken: string;
  tt: string; // Today's time
}

export interface FyersOrder {
  id: string;
  exchOrdId: string;
  symbol: string;
  qty: number;
  remainingQuantity: number;
  filledQty: number;
  status: number; // 1=Canceled, 2=Traded/Filled, 4=Transit, 5=Rejected, 6=Pending, 7=Expired
  limitPrice: number;
  stopPrice: number;
  productType: string;
  type: number; // 1=Limit, 2=Market, 3=Stop, 4=StopLimit
  side: number; // 1=Buy, -1=Sell
  orderDateTime: string;
  tradedPrice: number;
  message: string;
  segment: number; // 10=Equity, 11=F&O, 12=Currency, 20=Commodity
  orderValidity: string;
  fytoken: string;
  source: string;
  clientId: string;
  exchange: number;
  orderTag?: string;
}

export interface HistoricalData {
  timestamp: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface FyersFunds {
  id: number;
  title: string;
  equityAmount: number;
  commodityAmount: number;
}

export interface FyersMarketStatus {
  exchange: number; // 10=NSE, 11=MCX, 12=BSE
  segment: number; // 10=Equity, 11=F&O, 12=Currency, 20=Commodity
  market_type: string; // NORMAL, ODD_LOT, CALL_AUCTION2, AUCTION, SPECIAL
  status: string; // CLOSE, OPEN, POSTCLOSE_START, POSTCLOSE_CLOSED, PREOPEN, PREOPEN_CLOSED
}

export interface FyersMarketDepth {
  totalbuyqty: number;
  totalsellqty: number;
  bids: Array<{ price: number; volume: number; ord: number }>;
  ask: Array<{ price: number; volume: number; ord: number }>;
  o: number; // Open price
  h: number; // High price
  l: number; // Low price
  c: number; // Close price
  chp: number; // Change percentage
  tick_Size: number;
  ch: number; // Change value
  ltq: number; // Last traded quantity
  ltt: number; // Last traded time
  ltp: number; // Last traded price
  v: number; // Volume
  atp: number; // Average traded price
  lower_ckt: number; // Lower circuit
  upper_ckt: number; // Upper circuit
  expiry: string;
  oi: number; // Open interest
  oiflag: boolean;
  pdoi: number; // Previous day OI
  oipercent: number; // OI change percentage
}

export interface FyersOptionChain {
  callOi: number;
  putOi: number;
  expiryData: Array<{ date: string; expiry: string }>;
  indiavixData: {
    ask: number;
    bid: number;
    description: string;
    ex_symbol: string;
    exchange: string;
    fyToken: string;
    ltp: number;
    ltpch: number;
    ltpchp: number;
    option_type: string;
    strike_price: number;
    symbol: string;
  };
  optionsChain: Array<{
    ask: number;
    bid: number;
    description?: string;
    ex_symbol?: string;
    exchange?: string;
    fp?: number; // Future price
    fpch?: number; // Future price change
    fpchp?: number; // Future price change %
    fyToken: string;
    ltp: number;
    ltpch: number;
    ltpchp: number;
    oi?: number; // Open interest
    oich?: number; // OI change
    oichp?: number; // OI change %
    option_type: string; // CE, PE, or empty for underlying
    prev_oi?: number;
    strike_price: number;
    symbol: string;
    volume?: number;
  }>;
}

export interface FyersTradeUpdate {
  symbol: string;
  id: string;
  orderDateTime: string;
  orderNumber: string;
  tradeNumber: string;
  tradePrice: number;
  tradeValue: number;
  tradedQty: number;
  side: number; // 1=Buy, -1=Sell
  productType: string;
  exchangeOrderNo: string;
  segment: number;
  exchange: number;
  fyToken: string;
}

export interface FyersPosition {
  symbol: string;
  id: string;
  buyAvg: number;
  buyQty: number;
  sellAvg: number;
  sellQty: number;
  netAvg: number;
  netQty: number;
  side: number; // 0=Flat, 1=Long, -1=Short
  qty: number; // Absolute value of net qty
  productType: string;
  realized_profit: number;
  crossCurrency: string; // Y/N
  rbiRefRate: number;
  qtyMulti_com: number;
  segment: number;
  exchange: number;
  slNo: number;
  fytoken: string;
  cfBuyQty: number; // Carry forward buy quantity
  cfSellQty: number; // Carry forward sell quantity
  dayBuyQty: number; // Day buy quantity
  daySellQty: number; // Day sell quantity
  buyVal: number; // Total buy value
  sellVal: number; // Total sell value
}

interface QuoteItem {
  n: string;
  s: string;
  v: FyersQuote;
}

class FyersService {
  private baseUrl = API_BASE_URL;

  async getAuthUrl(): Promise<string> {
    const response = await fetch(`${this.baseUrl}/fyers/auth-url`);
    const data = await response.json();

    if (!data.success) {
      throw new Error(data.error || 'Failed to get auth URL');
    }

    return data.auth_url;
  }

  async authenticate(authCode: string): Promise<{ success: boolean; access_token?: string; error?: string }> {
    const response = await fetch(`${this.baseUrl}/fyers/authenticate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ auth_code: authCode }),
    });

    return await response.json();
  }

  async getProfile(): Promise<FyersProfile> {
    const response = await fetch(`${this.baseUrl}/fyers/profile`);
    const result = await response.json();

    if (!result.success) {
      throw new Error(result.error || 'Not authenticated');
    }

    // Handle nested response structure from Fyers API
    const profileData = result.data?.data || result.data;
    if (!profileData) {
      throw new Error('Invalid profile data received');
    }

    return profileData;
  }

  async getHistoricalData(
    symbol: string,
    resolution: string = 'D',
    fromDate?: string,
    toDate?: string
  ): Promise<HistoricalData[]> {
    const params = new URLSearchParams({
      resolution,
      ...(fromDate && { from_date: fromDate }),
      ...(toDate && { to_date: toDate }),
    });

    const response = await fetch(`${this.baseUrl}/fyers/historical/${symbol}?${params}`);
    const data = await response.json();

    if (!data.success) {
      throw new Error(data.error || 'Failed to get historical data');
    }

    // Handle the response format: candles array contains [timestamp, open, high, low, close, volume]
    return data.data.candles?.map((candle: number[]) => ({
      timestamp: new Date(candle[0] * 1000).toISOString(),
      open: candle[1],
      high: candle[2],
      low: candle[3],
      close: candle[4],
      volume: candle[5],
    })) || [];
  }

  async getQuotes(symbols: string[]): Promise<Record<string, FyersQuote>> {
    // Limit to 50 symbols as per API documentation
    if (symbols.length > 50) {
      symbols = symbols.slice(0, 50);
    }
    const response = await fetch(`${this.baseUrl}/fyers/quotes?symbols=${symbols.join(',')}`);
    const data = await response.json();

    if (!data.success) {
      throw new Error(data.error || 'Failed to get quotes');
    }

    // Transform the response format: d array contains objects with n (symbol) and v (values)
    const quotes: Record<string, FyersQuote> = {};
    if (data.data?.d) {
      data.data.d.forEach((item: QuoteItem) => {
        if (item.s === 'ok' && item.n && item.v) {
          quotes[item.n] = item.v;
        }
      });
    }
    return quotes;
  }

  async placeOrder(order: {
    symbol: string;
    qty: number;
    type: number; // 1=Limit, 2=Market
    side: number; // 1=Buy, -1=Sell
    product_type?: string;
    limit_price?: number;
  }): Promise<{ success: boolean; order_id?: string; error?: string }> {
    const response = await fetch(`${this.baseUrl}/fyers/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(order),
    });

    return await response.json();
  }

  async getOrders(orderId?: string, orderTag?: string): Promise<FyersOrder[]> {
    const params = new URLSearchParams();
    if (orderId) params.append('order_id', orderId);
    if (orderTag) params.append('order_tag', orderTag);

    const url = `${this.baseUrl}/fyers/orders${params.toString() ? '?' + params.toString() : ''}`;
    const response = await fetch(url);
    const data = await response.json();

    if (!data.success) {
      throw new Error(data.error || 'Failed to get orders');
    }

    return data.data?.orderBook || [];
  }

  async getPositions(): Promise<FyersPosition[]> {
    const response = await fetch(`${this.baseUrl}/fyers/positions`);
    const data = await response.json();

    if (!data.success) {
      throw new Error(data.error || 'Failed to get positions');
    }

    return data.data.netPositions || [];
  }

  async getHoldings(): Promise<unknown[]> {
    const response = await fetch(`${this.baseUrl}/fyers/holdings`);
    const data = await response.json();

    if (!data.success) {
      throw new Error(data.error || 'Failed to get holdings');
    }

    return data.data.holdings || [];
  }

  async getFunds(): Promise<FyersFunds[]> {
    const response = await fetch(`${this.baseUrl}/fyers/funds`);
    const data = await response.json();

    if (!data.success) {
      throw new Error(data.error || 'Failed to get funds');
    }

    return data.data.fund_limit || [];
  }

  async getMarketStatus(): Promise<FyersMarketStatus[]> {
    const response = await fetch(`${this.baseUrl}/fyers/market-status`);
    const data = await response.json();

    if (!data.success) {
      // Return default closed status when not authenticated or API fails
      return [
        { exchange: 10, segment: 10, market_type: 'NORMAL', status: 'CLOSED' },
        { exchange: 11, segment: 20, market_type: 'NORMAL', status: 'CLOSED' },
        { exchange: 12, segment: 10, market_type: 'NORMAL', status: 'CLOSED' }
      ];
    }

    return data.marketStatus || [];
  }

  async getMarketDepth(symbol: string, ohlcvFlag: boolean = true): Promise<FyersMarketDepth> {
    const params = new URLSearchParams({
      symbol,
      ohlcv_flag: ohlcvFlag ? '1' : '0'
    });

    const response = await fetch(`${this.baseUrl}/fyers/depth?${params}`);
    const data = await response.json();

    if (!data.success) {
      throw new Error(data.error || 'Failed to get market depth');
    }

    // Return the depth data for the symbol
    return data.data.d[symbol];
  }

  async getOptionChain(symbol: string, strikeCount: number = 5, timestamp?: string): Promise<FyersOptionChain> {
    const params = new URLSearchParams({
      symbol,
      strikecount: strikeCount.toString(),
      ...(timestamp && { timestamp })
    });

    const response = await fetch(`${this.baseUrl}/fyers/optionchain?${params}`);
    const data = await response.json();

    if (!data.success) {
      throw new Error(data.error || 'Failed to get option chain');
    }

    return data.data;
  }

  // WebSocket methods
  async startWebSocket(): Promise<{ success: boolean; message?: string; error?: string }> {
    const response = await fetch(`${this.baseUrl}/fyers/websocket/start`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    return await response.json();
  }

  async subscribeToSymbols(symbols: string[]): Promise<{ success: boolean; subscribed_symbols?: string[]; error?: string }> {
    const response = await fetch(`${this.baseUrl}/fyers/websocket/subscribe`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ symbols }),
    });

    return await response.json();
  }

  async subscribeToPositions(): Promise<void> {
    const response = await fetch(`${this.baseUrl}/fyers/websocket/subscribe-positions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ callback_url: window.location.origin })
    });

    const data = await response.json();
    if (!data.success) {
      throw new Error(data.error || 'Failed to subscribe to positions');
    }
  }

  async unsubscribeFromPositions(): Promise<void> {
    const response = await fetch(`${this.baseUrl}/fyers/websocket/unsubscribe-positions`, {
      method: 'POST'
    });

    const data = await response.json();
    if (!data.success) {
      throw new Error(data.error || 'Failed to unsubscribe from positions');
    }
  }

  async stopWebSocket(): Promise<{ success: boolean; message?: string; error?: string }> {
    const response = await fetch(`${this.baseUrl}/fyers/websocket/stop`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    return await response.json();
  }

  async logout(): Promise<{ success: boolean; message?: string; error?: string }> {
    const response = await fetch(`${this.baseUrl}/fyers/logout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    return await response.json();
  }
}

export const fyersService = new FyersService();
