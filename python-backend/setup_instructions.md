# Fyers API v3 Integration Setup

## 1. Get Fyers API Credentials

1. Login to your Fyers account at https://myapi.fyers.in/dashboard/
2. Create a new APP in the API dashboard
3. Note down your `Client ID` (APP_ID) and `Secret Key` (APP_SECRET)
4. Set redirect URI as `http://localhost:8000/auth/callback`

## 2. Configure Environment Variables

Create a `.env` file in the backend directory:

```bash
FYERS_CLIENT_ID=your_app_id_here  # Format: XXXXXXXX-100
FYERS_SECRET_KEY=your_app_secret_here
FYERS_REDIRECT_URI=http://localhost:8000/auth/callback
```

## 3. Install Dependencies

```bash
pip install -r requirements.txt
```

## 4. Start Backend Server

```bash
uvicorn main:app --reload --port 8000
```

## 5. Authentication Flow (v3)

1. Frontend calls `/api/fyers/auth-url` to get login URL
2. User opens URL and logs into Fyers
3. User copies auth code from redirect URL
4. Frontend sends auth code to `/api/fyers/authenticate`
5. Backend exchanges code for access token (format: `appid:accesstoken`)
6. Now you can fetch live data, place orders, and use WebSockets

## v3 New Features

### Real-time Data Socket
- **SymbolUpdate**: Real-time price updates
- **DepthUpdate**: Market depth changes  
- **Lite Mode**: Optimized for LTP updates
- **200 Symbol Capacity**: Track up to 200 symbols

### Real-time Order Socket
- **OnOrders**: Real-time order updates
- **OnTrades**: Real-time trade updates
- **OnPositions**: Real-time position updates
- **OnGeneral**: General notifications

## Available Endpoints

### Authentication
- `GET /api/fyers/auth-url` - Get authentication URL
- `POST /api/fyers/authenticate` - Exchange auth code for token

### User Data  
- `GET /api/fyers/profile` - Get user profile
- `GET /api/fyers/funds` - Get funds/balance
- `GET /api/fyers/holdings` - Get holdings
- `GET /api/fyers/positions` - Get positions

### Market Data
- `GET /api/fyers/historical/{symbol}` - Get historical data
- `GET /api/fyers/quotes` - Get real-time quotes

### Trading
- `POST /api/fyers/orders` - Place order
- `GET /api/fyers/orders` - Get order book

### WebSocket (v3 New)
- `POST /api/fyers/websocket/start` - Start real-time streams
- `POST /api/fyers/websocket/subscribe` - Subscribe to symbols
- `POST /api/fyers/websocket/stop` - Stop WebSocket connections

## Symbol Formats
- NSE Equity: `NSE:RELIANCE-EQ`
- NSE Index: `NSE:NIFTY50-INDEX` 
- BSE Equity: `BSE:RELIANCE-EQ`
- MCX Commodity: `MCX:CRUDEOIL23NOVFUT`

## Order Parameters
- **Types**: `1`=Limit, `2`=Market, `3`=SL, `4`=SL-M
- **Sides**: `1`=Buy, `-1`=Sell
- **Products**: `INTRADAY`, `CNC`, `MARGIN`