const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

export const fyersService = {
  async connectFyers(userId, accessToken) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/auth/connect-fyers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId,
          access_token: accessToken
        })
      });

      if (!response.ok) {
        throw new Error('Failed to connect to Fyers');
      }

      return await response.json();
    } catch (error) {
      console.error('Fyers connection error:', error);
      throw error;
    }
  },

  async checkConnection(userId) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/auth/fyers-status/${userId}`);
      return await response.json();
    } catch (error) {
      console.error('Fyers status check error:', error);
      return { connected: false };
    }
  },

  async getQuotes(symbols) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/market/quotes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ symbols })
      });
      return await response.json();
    } catch (error) {
      console.error('Get quotes error:', error);
      throw error;
    }
  },

  async getHistoricalData(symbol, resolution = '1D', days = 30) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/market/historical?symbol=${symbol}&resolution=${resolution}&days=${days}`);
      return await response.json();
    } catch (error) {
      console.error('Get historical data error:', error);
      throw error;
    }
  },

  async getMarketStatus() {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/market/status`);
      return await response.json();
    } catch (error) {
      console.error('Get market status error:', error);
      throw error;
    }
  },

  getAuthUrl() {
    const APP_ID = "BAEK2YCN6R-100";
    const REDIRECT_URI = "http://localhost:5173/auth/callback";
    return `https://api-t2.fyers.in/vagator/v2/auth?client_id=${APP_ID}&redirect_uri=${REDIRECT_URI}&response_type=code&state=sample_state`;
  },

  async exchangeAuthCode(authCode) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/auth/exchange-code`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ auth_code: authCode, user_id: 1 })
      });
      return await response.json();
    } catch (error) {
      console.error('Auth code exchange error:', error);
      throw error;
    }
  }
};