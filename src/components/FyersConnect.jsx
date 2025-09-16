import React, { useState, useEffect } from 'react';
import { fyersService } from '../services/fyersService';
import FyersAuth from './FyersAuth';
import './FyersConnect.css';

const FyersConnect = ({ userId, onConnectionSuccess }) => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [accessToken, setAccessToken] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('checking...');

  useEffect(() => {
    checkConnectionStatus();
  }, [userId]);

  const checkConnectionStatus = async () => {
    try {
      const status = await fyersService.checkConnection(userId);
      setIsConnected(status.connected);
      setConnectionStatus(status.connected ? 'Connected' : 'Not Connected');
    } catch (error) {
      setConnectionStatus('Backend not available');
    }
  };

  const handleConnect = async () => {
    if (!accessToken.trim()) {
      alert('Please enter your Fyers access token');
      return;
    }

    setIsConnecting(true);
    try {
      const result = await fyersService.connectFyers(userId, accessToken);
      
      if (result.success) {
        alert('Successfully connected to Fyers!');
        setIsConnected(true);
        setConnectionStatus('Connected');
        onConnectionSuccess(result.profile);
        setAccessToken('');
      } else {
        alert('Failed to connect: ' + result.message);
      }
    } catch (error) {
      alert('Connection failed: ' + error.message);
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <div className="fyers-connect-container">
      <div className="broker-status">
        <h3>{isConnected ? 'Broker Connected' : 'Broker Not Connected'}</h3>
        <p>{isConnected ? 'Ready for trading' : 'Connect to Fyers to start trading'}</p>
        <p className="status-text">{connectionStatus}</p>
      </div>
      
      {!isConnected && (
        <div className="connection-form">
          <FyersAuth onTokenReceived={(token) => {
            setAccessToken(token);
            handleConnect();
          }} />
          
          <div className="manual-token">
            <input
              type="text"
              placeholder="Or enter token manually"
              value={accessToken}
              onChange={(e) => setAccessToken(e.target.value)}
              className="token-input"
            />
            
            <button 
              onClick={handleConnect}
              disabled={isConnecting}
              className="connect-button"
            >
              {isConnecting ? 'Connecting...' : 'Connect Manually'}
            </button>
          </div>
        </div>
      )}
      
      {isConnected && (
        <div className="connected-info">
          <p>✅ Successfully connected to Fyers</p>
          <button onClick={checkConnectionStatus} className="refresh-button">
            Refresh Status
          </button>
        </div>
      )}
    </div>
  );
};

export default FyersConnect;