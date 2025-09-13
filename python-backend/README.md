# Python Algorithmic Trading Backend

This is the Python backend service that powers the algorithmic trading features in the stock prediction app.

## Features

- **Custom Algorithm Execution**: Run user-defined Python trading algorithms
- **Predefined Strategies**: Built-in trading strategies (MA Crossover, RSI, Bollinger Bands, etc.)
- **Real-time Data**: Live market data integration using yfinance
- **Backtesting**: Historical strategy performance testing
- **WebSocket Support**: Real-time algorithm execution updates
- **Code Validation**: Python code syntax and logic validation
- **Performance Monitoring**: System resource monitoring

## Setup

### 1. Install Python Dependencies

```bash
cd python-backend
pip install -r requirements.txt
```

### 2. Install TA-Lib (Technical Analysis Library)

**On Ubuntu/Debian:**
```bash
sudo apt-get install build-essential
wget http://prdownloads.sourceforge.net/ta-lib/ta-lib-0.4.0-src.tar.gz
tar -xzf ta-lib-0.4.0-src.tar.gz
cd ta-lib/
./configure --prefix=/usr
make
sudo make install
pip install ta-lib
```

**On macOS:**
```bash
brew install ta-lib
pip install ta-lib
```

**On Windows:**
```bash
# Download pre-compiled wheel from: https://www.lfd.uci.edu/~gohlke/pythonlibs/#ta-lib
pip install TA_Lib-0.4.28-cp39-cp39-win_amd64.whl  # Adjust for your Python version
```

### 3. Run the Server

```bash
uvicorn main:app --reload --port 8000
```

The API will be available at `http://localhost:8000`

## API Endpoints

### Algorithms
- `POST /api/algorithms` - Create new algorithm
- `PUT /api/algorithms/{id}` - Update algorithm
- `POST /api/algorithms/{id}/start` - Start algorithm
- `POST /api/algorithms/{id}/stop` - Stop algorithm
- `POST /api/algorithms/{id}/backtest` - Run backtest

### Data & Execution
- `GET /api/executions` - Get recent executions
- `GET /api/market-data/{symbol}` - Get market data
- `POST /api/algorithms/validate` - Validate Python code

### Environment
- `GET /api/environment/status` - Get system status

### WebSocket
- `WS /ws/algo-trading` - Real-time updates

## Algorithm Development

### Basic Algorithm Structure

```python
import pandas as pd
import numpy as np
import ta

class MyTradingAlgorithm:
    def __init__(self, symbol='RELIANCE', quantity=10):
        self.symbol = symbol
        self.quantity = quantity
        self.position = 0  # 0: no position, 1: long, -1: short
        
    def generate_signal(self, data):
        """
        Generate trading signal based on market data
        
        Args:
            data (pd.DataFrame): OHLCV data with columns: open, high, low, close, volume
            
        Returns:
            tuple: (action, confidence, reason)
                action: 'BUY', 'SELL', or 'HOLD'
                confidence: float between 0 and 1
                reason: string explaining the signal
        """
        
        # Your algorithm logic here
        # Example: Simple moving average crossover
        if len(data) < 50:
            return 'HOLD', 0.0, "Insufficient data"
            
        data['sma_20'] = data['close'].rolling(20).mean()
        data['sma_50'] = data['close'].rolling(50).mean()
        
        current_sma20 = data['sma_20'].iloc[-1]
        current_sma50 = data['sma_50'].iloc[-1]
        prev_sma20 = data['sma_20'].iloc[-2]
        prev_sma50 = data['sma_50'].iloc[-2]
        
        # Bullish crossover
        if prev_sma20 <= prev_sma50 and current_sma20 > current_sma50:
            return 'BUY', 0.8, "SMA bullish crossover"
            
        # Bearish crossover
        elif prev_sma20 >= prev_sma50 and current_sma20 < current_sma50:
            return 'SELL', 0.8, "SMA bearish crossover"
            
        return 'HOLD', 0.5, "No clear signal"
        
    def update_position(self, action):
        """Update position after trade execution"""
        if action == 'BUY':
            self.position = 1
        elif action == 'SELL':
            self.position = -1
```

### Available Libraries

The backend comes with these pre-installed libraries:

- **pandas**: Data manipulation and analysis
- **numpy**: Numerical computing
- **ta-lib**: Technical analysis indicators
- **ta**: Alternative technical analysis library
- **scikit-learn**: Machine learning
- **yfinance**: Yahoo Finance data
- **psutil**: System monitoring

### Technical Indicators

You can use various technical indicators:

```python
import ta

# RSI
data['rsi'] = ta.momentum.RSIIndicator(data['close']).rsi()

# MACD
macd = ta.trend.MACD(data['close'])
data['macd'] = macd.macd()
data['macd_signal'] = macd.macd_signal()

# Bollinger Bands
bb = ta.volatility.BollingerBands(data['close'])
data['bb_upper'] = bb.bollinger_hband()
data['bb_lower'] = bb.bollinger_lband()

# Moving Averages
data['sma_20'] = data['close'].rolling(20).mean()
data['ema_20'] = data['close'].ewm(span=20).mean()
```

## Configuration

Create a `.env` file for configuration:

```env
# API Configuration
API_HOST=0.0.0.0
API_PORT=8000

# Database (optional)
DATABASE_URL=sqlite:///./algorithms.db

# External APIs
ALPHA_VANTAGE_API_KEY=your_key_here
```

## Production Deployment

### Using Docker

```dockerfile
FROM python:3.9-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Using Gunicorn

```bash
pip install gunicorn
gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```

## Security Considerations

1. **Code Execution**: Custom algorithms execute arbitrary Python code. In production:
   - Use sandboxed environments (Docker containers)
   - Implement code review processes
   - Limit available imports and functions
   - Set execution timeouts

2. **API Security**: 
   - Add authentication (JWT tokens)
   - Rate limiting
   - Input validation
   - HTTPS in production

3. **Data Security**:
   - Encrypt sensitive algorithm code
   - Secure database connections
   - Audit logs for all operations

## Monitoring

The backend provides system monitoring:

- CPU and memory usage
- Active algorithm count
- Execution success rates
- Error logging

## Troubleshooting

### Common Issues

1. **TA-Lib Installation**: Follow platform-specific instructions above
2. **Market Data**: Some symbols may require `.NS` suffix for Indian stocks
3. **Memory Usage**: Large datasets may require optimization
4. **WebSocket Connections**: Check firewall settings for real-time updates

### Logs

Check application logs for debugging:

```bash
tail -f logs/app.log
```

## Contributing

1. Follow PEP 8 style guidelines
2. Add tests for new features
3. Update documentation
4. Test with sample algorithms

## License

This project is licensed under the MIT License.