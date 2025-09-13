import React, { useState, useEffect } from 'react';
import { BrokerDashboard } from '../broker/BrokerDashboard';
import { BrokerType } from '../../types/enums';
import { brokerService, ConnectedBroker, BrokerMetrics } from '../../services/brokerService';
import { realtimeBrokerService } from '../../services/realtimeBrokerService';

interface BrokerCredentials {
  clientId: string;
  apiSecret: string;
  appId?: string;
  accessToken?: string;
}

interface BrokerSettings {
  autoReconnect: boolean;
  enableNotifications: boolean;
  dataRefreshRate: number;
  timeoutSettings: number;
  retryAttempts: number;
}

export const BrokerManagement: React.FC = () => {
  const [connectedBrokers, setConnectedBrokers] = useState<ConnectedBroker[]>([]);
  const [metrics, setMetrics] = useState<BrokerMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  // Real available brokers (configuration data)
  const availableBrokers = [
    { type: BrokerType.FYERS, name: "Fyers", supported: true },
    { type: BrokerType.ZERODHA, name: "Zerodha", supported: true },
    { type: BrokerType.UPSTOX, name: "Upstox", supported: true },
    { type: BrokerType.ICICI_DIRECT, name: "ICICI Direct", supported: true },
    { type: BrokerType.ANGEL_ONE, name: "Angel One", supported: true },
    { type: BrokerType.FIVEPAISA, name: "5paisa", supported: true },
    { type: BrokerType.KOTAK, name: "Kotak Securities", supported: true },
    { type: BrokerType.HDFC, name: "HDFC Securities", supported: false },
    { type: BrokerType.SHAREKHAN, name: "Sharekhan", supported: false }
  ];

  // Default settings
  const defaultSettings: BrokerSettings = {
    autoReconnect: true,
    enableNotifications: true,
    dataRefreshRate: 1000,
    timeoutSettings: 30000,
    retryAttempts: 3
  };

  // Real-time analysis data (simplified)
  const realtimeAnalysis = {
    dataFlowRate: metrics ? Math.floor(metrics.totalDataPoints / 100) : 0,
    peakDataRate: metrics ? Math.floor(metrics.totalDataPoints / 50) : 0,
    connectionUptime: metrics ? (metrics.activeConnections / metrics.totalConnections) || 0 : 0,
    errorRate: metrics ? (1 - metrics.overallSuccessRate) : 0,
    lastAnalysisUpdate: new Date().toISOString()
  };

  const fetchBrokerData = async () => {
    try {
      setLoading(true);
      
      // Get real-time broker data
      const realtimeBrokers = realtimeBrokerService.getConnectedBrokers();
      const realtimeMetrics = realtimeBrokerService.getBrokerMetrics();
      
      // Try to check for live Fyers connection, but handle CORS gracefully
      try {
        const fyersConnection = await brokerService.checkFyersConnection();
        let finalBrokers = [...realtimeBrokers];
        
        if (fyersConnection) {
          // Remove any existing Fyers connection and add the live one
          finalBrokers = finalBrokers.filter(b => b.type !== BrokerType.FYERS);
          finalBrokers.push(fyersConnection);
        }
        setConnectedBrokers(finalBrokers);
      } catch {
        // CORS or network error - use fallback data
        setConnectedBrokers(realtimeBrokers);
      }
      
      setMetrics(realtimeMetrics);
    } catch (error) {
      console.error('Error fetching broker data:', error);
      // Fallback to real-time service data
      setConnectedBrokers(realtimeBrokerService.getConnectedBrokers());
      setMetrics(realtimeBrokerService.getBrokerMetrics());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBrokerData();
    
    // Subscribe to real-time updates
    const unsubscribe = realtimeBrokerService.subscribe((brokers) => {
      setConnectedBrokers(brokers);
      setMetrics(realtimeBrokerService.getBrokerMetrics());
    });
    
    // Check for Fyers connection periodically (with CORS handling)
    const fyersInterval = setInterval(async () => {
      try {
        const fyersConnection = await brokerService.checkFyersConnection();
        if (fyersConnection) {
          setConnectedBrokers(prev => {
            const filtered = prev.filter(b => b.type !== BrokerType.FYERS);
            return [...filtered, fyersConnection];
          });
        }
      } catch {
        // Silently handle CORS/network errors for periodic checks
      }
    }, 10000);
    
    return () => {
      unsubscribe();
      clearInterval(fyersInterval);
    };
  }, []);

  const handleConnect = async (brokerType: BrokerType, credentials: BrokerCredentials): Promise<void> => {
    try {
      setLoading(true);

      if (brokerType === BrokerType.FYERS) {
        // Handle Fyers authentication
        if (!credentials?.clientId || !credentials?.apiSecret || !credentials?.appId) {
          throw new Error('Fyers requires Client ID, API Secret, and App ID');
        }

        // Step 1: Send credentials and get authentication URL
        let authUrlResponse;
        try {
          authUrlResponse = await fetch('http://127.0.0.1:5000/api/fyers/auth-url', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              client_id: credentials.clientId,
              secret_key: credentials.apiSecret,
              app_id: credentials.appId
            })
          });
        } catch {
          throw new Error('Backend server not available. Please ensure the Python backend is running on port 5000.');
        }

        if (!authUrlResponse.ok) {
          const errorData = await authUrlResponse.json().catch(() => ({ error: 'Unknown error' }));
          throw new Error(`Failed to get authentication URL: ${errorData.error || 'Server error'}`);
        }

        const authData = await authUrlResponse.json();
        if (!authData.success) {
          throw new Error(`Failed to initialize Fyers authentication: ${authData.error || 'Unknown error'}`);
        }

        // Step 2: Open authentication URL in new window
        const authWindow = window.open(authData.auth_url, '_blank', 'width=600,height=700');

        if (!authWindow) {
          throw new Error('Failed to open authentication window. Please allow popups for this site.');
        }

        // Step 3: Wait for authentication callback
        await new Promise<void>((resolve, reject) => {
          const checkAuth = setInterval(async () => {
            try {
              // Check if auth window is closed
              if (authWindow.closed) {
                clearInterval(checkAuth);

                // Step 4: Check if authentication was successful
                try {
                  const profileResponse = await fetch('http://127.0.0.1:5000/api/fyers/profile', {
                    method: 'GET',
                    headers: {
                      'Content-Type': 'application/json',
                    },
                  });

                  if (profileResponse.ok) {
                    const profileData = await profileResponse.json();
                    if (profileData.success) {
                      // Authentication successful
                      realtimeBrokerService.addBroker(brokerType);
                      console.log('Successfully connected to Fyers');
                      resolve();
                    } else {
                      throw new Error('Authentication failed');
                    }
                  } else {
                    throw new Error('Failed to verify authentication');
                  }
                } catch {
                  throw new Error('Backend server not available during authentication verification');
                }
              }
            } catch (error) {
              clearInterval(checkAuth);
              reject(error);
            }
          }, 2000);

          // Timeout after 5 minutes
          setTimeout(() => {
            clearInterval(checkAuth);
            if (!authWindow.closed) {
              authWindow.close();
            }
            reject(new Error('Authentication timeout'));
          }, 300000);
        });

      } else {
        // Handle other brokers (for now, just simulate)
        await new Promise(resolve => setTimeout(resolve, 2000));
        const success = realtimeBrokerService.addBroker(brokerType);
        if (success) {
          console.log('Connected to broker:', brokerType);
        } else {
          console.log('Broker already connected:', brokerType);
        }
      }
    } catch (error) {
      console.error('Connection error:', error);
      throw error; // Re-throw to be handled by the modal
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = async (brokerId: string) => {
    try {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Extract broker type from ID
      const brokerType = connectedBrokers.find(b => b.id === brokerId)?.type;
      if (brokerType) {
        const success = realtimeBrokerService.removeBroker(brokerType);
        console.log(success ? 'Disconnected broker:' : 'Failed to disconnect:', brokerId);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleReconnect = async (brokerId: string) => {
    try {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const broker = connectedBrokers.find(b => b.id === brokerId);
      if (broker) {
        // Simulate reconnection by removing and adding back
        realtimeBrokerService.removeBroker(broker.type);
        setTimeout(() => {
          realtimeBrokerService.addBroker(broker.type);
        }, 500);
        console.log('Reconnecting broker:', brokerId);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSettings = async (settings: BrokerSettings) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    console.log('Updating settings:', settings);
  };

  if (loading) {
    return <div>Loading broker data...</div>;
  }

  return (
    <BrokerDashboard
      connectedBrokers={connectedBrokers}
      availableBrokers={availableBrokers}
      settings={defaultSettings}
      connectionMetrics={metrics || {
        totalConnections: 0,
        activeConnections: 0,
        failedConnections: 0,
        avgLatency: 0,
        totalDataPoints: 0,
        overallSuccessRate: 0
      }}
      realtimeAnalysis={realtimeAnalysis}
      onConnect={handleConnect}
      onDisconnect={handleDisconnect}
      onReconnect={handleReconnect}
      onUpdateSettings={handleUpdateSettings}
    />
  );
};