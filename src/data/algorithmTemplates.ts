export interface AlgorithmTemplate {
  id: string;
  name: string;
  category: 'MOMENTUM' | 'MEAN_REVERSION' | 'ARBITRAGE' | 'ML_BASED' | 'CUSTOM';
  description: string;
  difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  pythonCode: string;
  parameters: Record<string, {
    type: 'number' | 'string' | 'boolean';
    default: number | string | boolean;
    description: string;
    min?: number;
    max?: number;
  }>;
  requiredLibraries: string[];
  expectedReturn: string;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
}

export const algorithmTemplates: AlgorithmTemplate[] = [
  {
    id: 'ma_crossover',
    name: 'Moving Average Crossover',
    category: 'MOMENTUM',
    description: 'Classic strategy that buys when short MA crosses above long MA and sells when it crosses below',
    difficulty: 'BEGINNER',
    pythonCode: `
import pandas as pd
import numpy as np
import ta

class MovingAverageCrossover:
    def __init__(self, short_period=20, long_period=50, symbol='RELIANCE', quantity=10):
        self.short_period = short_period
        self.long_period = long_period
        self.symbol = symbol
        self.quantity = quantity
        self.position = 0  # 0: no position, 1: long, -1: short
        
    def calculate_indicators(self, data):
        """Calculate moving averages"""
        data['short_ma'] = data['close'].rolling(window=self.short_period).mean()
        data['long_ma'] = data['close'].rolling(window=self.long_period).mean()
        return data
        
    def generate_signal(self, data):
        """Generate trading signals based on MA crossover"""
        if len(data) < self.long_period:
            return 'HOLD', 0.0, "Insufficient data"
            
        data = self.calculate_indicators(data)
        
        current_short_ma = data['short_ma'].iloc[-1]
        current_long_ma = data['long_ma'].iloc[-1]
        prev_short_ma = data['short_ma'].iloc[-2]
        prev_long_ma = data['long_ma'].iloc[-2]
        
        # Check for crossover
        bullish_crossover = (prev_short_ma <= prev_long_ma) and (current_short_ma > current_long_ma)
        bearish_crossover = (prev_short_ma >= prev_long_ma) and (current_short_ma < current_long_ma)
        
        if bullish_crossover and self.position <= 0:
            confidence = min(0.8, abs(current_short_ma - current_long_ma) / current_long_ma * 10)
            return 'BUY', confidence, f"Bullish crossover: Short MA ({current_short_ma:.2f}) > Long MA ({current_long_ma:.2f})"
            
        elif bearish_crossover and self.position >= 0:
            confidence = min(0.8, abs(current_short_ma - current_long_ma) / current_long_ma * 10)
            return 'SELL', confidence, f"Bearish crossover: Short MA ({current_short_ma:.2f}) < Long MA ({current_long_ma:.2f})"
            
        return 'HOLD', 0.5, "No crossover signal"
        
    def update_position(self, action):
        """Update position after trade execution"""
        if action == 'BUY':
            self.position = 1
        elif action == 'SELL':
            self.position = -1
`,
    parameters: {
      short_period: {
        type: 'number',
        default: 20,
        description: 'Short moving average period',
        min: 5,
        max: 50
      },
      long_period: {
        type: 'number',
        default: 50,
        description: 'Long moving average period',
        min: 20,
        max: 200
      },
      symbol: {
        type: 'string',
        default: 'RELIANCE',
        description: 'Stock symbol to trade'
      },
      quantity: {
        type: 'number',
        default: 10,
        description: 'Quantity to trade',
        min: 1,
        max: 1000
      }
    },
    requiredLibraries: ['pandas', 'numpy', 'ta'],
    expectedReturn: '12-18% annually',
    riskLevel: 'MEDIUM'
  },
  {
    id: 'rsi_mean_reversion',
    name: 'RSI Mean Reversion',
    category: 'MEAN_REVERSION',
    description: 'Trades based on RSI overbought/oversold levels with mean reversion principle',
    difficulty: 'BEGINNER',
    pythonCode: `
import pandas as pd
import numpy as np
import ta

class RSIMeanReversion:
    def __init__(self, rsi_period=14, oversold_level=30, overbought_level=70, 
                 symbol='TCS', quantity=10):
        self.rsi_period = rsi_period
        self.oversold_level = oversold_level
        self.overbought_level = overbought_level
        self.symbol = symbol
        self.quantity = quantity
        self.position = 0
        
    def calculate_indicators(self, data):
        """Calculate RSI indicator"""
        data['rsi'] = ta.momentum.RSIIndicator(data['close'], window=self.rsi_period).rsi()
        return data
        
    def generate_signal(self, data):
        """Generate trading signals based on RSI levels"""
        if len(data) < self.rsi_period + 1:
            return 'HOLD', 0.0, "Insufficient data for RSI calculation"
            
        data = self.calculate_indicators(data)
        current_rsi = data['rsi'].iloc[-1]
        current_price = data['close'].iloc[-1]
        
        # RSI-based signals
        if current_rsi < self.oversold_level and self.position <= 0:
            # Oversold condition - potential buy signal
            confidence = min(0.9, (self.oversold_level - current_rsi) / self.oversold_level)
            return 'BUY', confidence, f"RSI oversold: {current_rsi:.2f} < {self.oversold_level}"
            
        elif current_rsi > self.overbought_level and self.position >= 0:
            # Overbought condition - potential sell signal
            confidence = min(0.9, (current_rsi - self.overbought_level) / (100 - self.overbought_level))
            return 'SELL', confidence, f"RSI overbought: {current_rsi:.2f} > {self.overbought_level}"
            
        # Additional exit conditions
        elif self.position > 0 and current_rsi > 60:
            # Exit long position when RSI moves back to neutral/high
            return 'SELL', 0.6, f"RSI exit signal: {current_rsi:.2f}"
            
        elif self.position < 0 and current_rsi < 40:
            # Exit short position when RSI moves back to neutral/low
            return 'BUY', 0.6, f"RSI cover signal: {current_rsi:.2f}"
            
        return 'HOLD', 0.5, f"RSI neutral: {current_rsi:.2f}"
        
    def update_position(self, action):
        """Update position after trade execution"""
        if action == 'BUY':
            self.position = 1
        elif action == 'SELL':
            self.position = -1
`,
    parameters: {
      rsi_period: {
        type: 'number',
        default: 14,
        description: 'RSI calculation period',
        min: 7,
        max: 30
      },
      oversold_level: {
        type: 'number',
        default: 30,
        description: 'RSI oversold threshold',
        min: 15,
        max: 35
      },
      overbought_level: {
        type: 'number',
        default: 70,
        description: 'RSI overbought threshold',
        min: 65,
        max: 85
      },
      symbol: {
        type: 'string',
        default: 'TCS',
        description: 'Stock symbol to trade'
      },
      quantity: {
        type: 'number',
        default: 10,
        description: 'Quantity to trade',
        min: 1,
        max: 1000
      }
    },
    requiredLibraries: ['pandas', 'numpy', 'ta'],
    expectedReturn: '10-15% annually',
    riskLevel: 'MEDIUM'
  },
  {
    id: 'bollinger_bands',
    name: 'Bollinger Bands Strategy',
    category: 'MEAN_REVERSION',
    description: 'Trades based on price touching Bollinger Bands with mean reversion logic',
    difficulty: 'INTERMEDIATE',
    pythonCode: `
import pandas as pd
import numpy as np
import ta

class BollingerBandsStrategy:
    def __init__(self, period=20, std_dev=2, symbol='HDFC', quantity=15):
        self.period = period
        self.std_dev = std_dev
        self.symbol = symbol
        self.quantity = quantity
        self.position = 0
        
    def calculate_indicators(self, data):
        """Calculate Bollinger Bands"""
        bb_indicator = ta.volatility.BollingerBands(data['close'], window=self.period, window_dev=self.std_dev)
        data['bb_upper'] = bb_indicator.bollinger_hband()
        data['bb_middle'] = bb_indicator.bollinger_mavg()
        data['bb_lower'] = bb_indicator.bollinger_lband()
        data['bb_width'] = (data['bb_upper'] - data['bb_lower']) / data['bb_middle']
        return data
        
    def generate_signal(self, data):
        """Generate trading signals based on Bollinger Bands"""
        if len(data) < self.period + 1:
            return 'HOLD', 0.0, "Insufficient data for Bollinger Bands"
            
        data = self.calculate_indicators(data)
        
        current_price = data['close'].iloc[-1]
        bb_upper = data['bb_upper'].iloc[-1]
        bb_lower = data['bb_lower'].iloc[-1]
        bb_middle = data['bb_middle'].iloc[-1]
        bb_width = data['bb_width'].iloc[-1]
        
        # Calculate position relative to bands
        upper_distance = (bb_upper - current_price) / (bb_upper - bb_middle)
        lower_distance = (current_price - bb_lower) / (bb_middle - bb_lower)
        
        # Only trade when bands are not too narrow (avoid low volatility periods)
        if bb_width < 0.02:  # 2% width threshold
            return 'HOLD', 0.3, f"Low volatility: BB width {bb_width:.3f}"
        
        # Buy signal: price near or below lower band
        if current_price <= bb_lower * 1.01 and self.position <= 0:
            confidence = min(0.85, lower_distance * 0.8 + 0.2)
            return 'BUY', confidence, f"Price near lower BB: {current_price:.2f} vs {bb_lower:.2f}"
            
        # Sell signal: price near or above upper band
        elif current_price >= bb_upper * 0.99 and self.position >= 0:
            confidence = min(0.85, upper_distance * 0.8 + 0.2)
            return 'SELL', confidence, f"Price near upper BB: {current_price:.2f} vs {bb_upper:.2f}"
            
        # Exit long position when price crosses back above middle band
        elif self.position > 0 and current_price > bb_middle:
            return 'SELL', 0.6, f"Exit long: price above middle BB"
            
        # Exit short position when price crosses back below middle band
        elif self.position < 0 and current_price < bb_middle:
            return 'BUY', 0.6, f"Cover short: price below middle BB"
            
        return 'HOLD', 0.5, f"Price in middle range: {current_price:.2f}"
        
    def update_position(self, action):
        """Update position after trade execution"""
        if action == 'BUY':
            self.position = 1
        elif action == 'SELL':
            self.position = -1
`,
    parameters: {
      period: {
        type: 'number',
        default: 20,
        description: 'Bollinger Bands period',
        min: 10,
        max: 50
      },
      std_dev: {
        type: 'number',
        default: 2,
        description: 'Standard deviation multiplier',
        min: 1.5,
        max: 3
      },
      symbol: {
        type: 'string',
        default: 'HDFC',
        description: 'Stock symbol to trade'
      },
      quantity: {
        type: 'number',
        default: 15,
        description: 'Quantity to trade',
        min: 1,
        max: 1000
      }
    },
    requiredLibraries: ['pandas', 'numpy', 'ta'],
    expectedReturn: '8-14% annually',
    riskLevel: 'MEDIUM'
  },
  {
    id: 'ml_sentiment_trading',
    name: 'ML Sentiment Trading',
    category: 'ML_BASED',
    description: 'Advanced ML model combining technical indicators with sentiment analysis',
    difficulty: 'ADVANCED',
    pythonCode: `
import pandas as pd
import numpy as np
import ta
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import StandardScaler
import joblib

class MLSentimentTrading:
    def __init__(self, symbol='INFY', quantity=20, retrain_days=30):
        self.symbol = symbol
        self.quantity = quantity
        self.retrain_days = retrain_days
        self.model = RandomForestClassifier(n_estimators=100, random_state=42)
        self.scaler = StandardScaler()
        self.position = 0
        self.is_trained = False
        
    def calculate_features(self, data, sentiment_score=0.0):
        """Calculate technical features for ML model"""
        # Technical indicators
        data['rsi'] = ta.momentum.RSIIndicator(data['close']).rsi()
        data['macd'] = ta.trend.MACD(data['close']).macd()
        data['macd_signal'] = ta.trend.MACD(data['close']).macd_signal()
        data['bb_upper'] = ta.volatility.BollingerBands(data['close']).bollinger_hband()
        data['bb_lower'] = ta.volatility.BollingerBands(data['close']).bollinger_lband()
        data['atr'] = ta.volatility.AverageTrueRange(data['high'], data['low'], data['close']).average_true_range()
        
        # Price-based features
        data['price_change'] = data['close'].pct_change()
        data['volume_ratio'] = data['volume'] / data['volume'].rolling(20).mean()
        data['high_low_ratio'] = (data['high'] - data['low']) / data['close']
        
        # Moving averages
        data['sma_20'] = data['close'].rolling(20).mean()
        data['sma_50'] = data['close'].rolling(50).mean()
        data['price_to_sma20'] = data['close'] / data['sma_20']
        data['price_to_sma50'] = data['close'] / data['sma_50']
        
        # Bollinger Bands position
        data['bb_position'] = (data['close'] - data['bb_lower']) / (data['bb_upper'] - data['bb_lower'])
        
        # Create feature vector for latest data point
        features = {
            'rsi': data['rsi'].iloc[-1],
            'macd': data['macd'].iloc[-1],
            'macd_signal': data['macd_signal'].iloc[-1],
            'price_change': data['price_change'].iloc[-1],
            'volume_ratio': data['volume_ratio'].iloc[-1],
            'high_low_ratio': data['high_low_ratio'].iloc[-1],
            'price_to_sma20': data['price_to_sma20'].iloc[-1],
            'price_to_sma50': data['price_to_sma50'].iloc[-1],
            'bb_position': data['bb_position'].iloc[-1],
            'atr': data['atr'].iloc[-1],
            'sentiment_score': sentiment_score
        }
        
        return features
        
    def prepare_training_data(self, historical_data, sentiment_data):
        """Prepare training data with labels"""
        # This would typically use historical price movements as labels
        # For demonstration, we'll create synthetic labels based on future returns
        features_list = []
        labels = []
        
        for i in range(50, len(historical_data) - 5):  # Leave room for future returns
            data_slice = historical_data.iloc[:i+1]
            sentiment = sentiment_data.get(i, 0.0) if sentiment_data else 0.0
            
            features = self.calculate_features(data_slice, sentiment)
            
            # Label based on future 5-day return
            future_return = (historical_data['close'].iloc[i+5] - historical_data['close'].iloc[i]) / historical_data['close'].iloc[i]
            
            if future_return > 0.02:  # 2% gain
                label = 1  # Buy
            elif future_return < -0.02:  # 2% loss
                label = -1  # Sell
            else:
                label = 0  # Hold
                
            features_list.append(list(features.values()))
            labels.append(label)
            
        return np.array(features_list), np.array(labels)
        
    def train_model(self, historical_data, sentiment_data=None):
        """Train the ML model"""
        try:
            X, y = self.prepare_training_data(historical_data, sentiment_data)
            
            # Scale features
            X_scaled = self.scaler.fit_transform(X)
            
            # Train model
            self.model.fit(X_scaled, y)
            self.is_trained = True
            
            return True, "Model trained successfully"
        except Exception as e:
            return False, f"Training failed: {str(e)}"
            
    def generate_signal(self, data, sentiment_score=0.0):
        """Generate trading signals using ML model"""
        if not self.is_trained:
            return 'HOLD', 0.0, "Model not trained yet"
            
        if len(data) < 50:
            return 'HOLD', 0.0, "Insufficient data for feature calculation"
            
        try:
            # Calculate features
            features = self.calculate_features(data, sentiment_score)
            
            # Handle NaN values
            feature_values = []
            for value in features.values():
                if pd.isna(value):
                    feature_values.append(0.0)
                else:
                    feature_values.append(value)
            
            # Scale features
            X = self.scaler.transform([feature_values])
            
            # Get prediction and probability
            prediction = self.model.predict(X)[0]
            probabilities = self.model.predict_proba(X)[0]
            
            # Convert to trading signal
            if prediction == 1 and self.position <= 0:  # Buy signal
                confidence = max(probabilities) * 0.9  # Scale down confidence
                return 'BUY', confidence, f"ML Buy signal (prob: {max(probabilities):.3f})"
                
            elif prediction == -1 and self.position >= 0:  # Sell signal
                confidence = max(probabilities) * 0.9
                return 'SELL', confidence, f"ML Sell signal (prob: {max(probabilities):.3f})"
                
            else:
                return 'HOLD', 0.5, f"ML Hold signal (prob: {max(probabilities):.3f})"
                
        except Exception as e:
            return 'HOLD', 0.0, f"ML prediction error: {str(e)}"
            
    def update_position(self, action):
        """Update position after trade execution"""
        if action == 'BUY':
            self.position = 1
        elif action == 'SELL':
            self.position = -1
`,
    parameters: {
      symbol: {
        type: 'string',
        default: 'INFY',
        description: 'Stock symbol to trade'
      },
      quantity: {
        type: 'number',
        default: 20,
        description: 'Quantity to trade',
        min: 1,
        max: 1000
      },
      retrain_days: {
        type: 'number',
        default: 30,
        description: 'Days between model retraining',
        min: 7,
        max: 90
      }
    },
    requiredLibraries: ['pandas', 'numpy', 'ta', 'scikit-learn', 'joblib'],
    expectedReturn: '15-25% annually',
    riskLevel: 'HIGH'
  }
];

export const getTemplateByCategory = (category: string): AlgorithmTemplate[] => {
  return algorithmTemplates.filter(template => template.category === category);
};

export const getTemplateById = (id: string): AlgorithmTemplate | undefined => {
  return algorithmTemplates.find(template => template.id === id);
};