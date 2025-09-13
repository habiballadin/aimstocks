import { BrokerType, ConnectionStatus, DataFlowStatus, ConnectionHealth, BrokerService, SubscriptionPlan } from '../types/enums';

const API_BASE_URL = 'http://127.0.0.1:5000/api';

export interface ConnectedBroker {
  id: string;
  type: BrokerType;
  status: ConnectionStatus;
  dataFlow: DataFlowStatus;
  health: ConnectionHealth;
  connectedAt: string;
  lastDataReceived: string;
  latency: number;
  successRate: number;
  dataPointsReceived: number;
  failedRequests: number;
  services: BrokerService[];
  plan: SubscriptionPlan;
}

export interface BrokerMetrics {
  totalConnections: number;
  activeConnections: number;
  failedConnections: number;
  avgLatency: number;
  totalDataPoints: number;
  overallSuccessRate: number;
}

class BrokerServiceAPI {
  private baseUrl = API_BASE_URL;

  async getConnectedBrokers(): Promise<ConnectedBroker[]> {
    try {
      const response = await fetch(`${this.baseUrl}/brokers/connected`);
      if (!response.ok) {
        throw new Error('Failed to fetch connected brokers');
      }
      const data = await response.json();
      return data.brokers || [];
    } catch (error) {
      console.error('Error fetching connected brokers:', error);
      return this.getFallbackBrokers();
    }
  }

  async getBrokerMetrics(): Promise<BrokerMetrics> {
    try {
      const response = await fetch(`${this.baseUrl}/brokers/metrics`);
      if (!response.ok) {
        throw new Error('Failed to fetch broker metrics');
      }
      const data = await response.json();
      return data.metrics;
    } catch (error) {
      console.error('Error fetching broker metrics:', error);
      return this.getFallbackMetrics();
    }
  }

  async checkFyersConnection(): Promise<ConnectedBroker | null> {
    try {
      const response = await fetch(`${this.baseUrl}/fyers/profile`);
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          return {
            id: "broker_fyers_live",
            type: BrokerType.FYERS,
            status: ConnectionStatus.CONNECTED,
            dataFlow: DataFlowStatus.STREAMING,
            health: ConnectionHealth.HEALTHY,
            connectedAt: new Date().toISOString(),
            lastDataReceived: new Date().toISOString(),
            latency: 45,
            successRate: 0.99,
            dataPointsReceived: Math.floor(Math.random() * 10000),
            failedRequests: Math.floor(Math.random() * 10),
            services: [BrokerService.MARKET_DATA, BrokerService.ORDER_MANAGEMENT, BrokerService.REAL_TIME_QUOTES],
            plan: SubscriptionPlan.PRO
          };
        }
      }
      return null;
    } catch (error) {
      // Silently handle CORS/network errors - backend not available
      return null;
    }
  }

  private getFallbackBrokers(): ConnectedBroker[] {
    return [
      {
        id: "broker_demo_001",
        type: BrokerType.FYERS,
        status: ConnectionStatus.DISCONNECTED,
        dataFlow: DataFlowStatus.INACTIVE,
        health: ConnectionHealth.WARNING,
        connectedAt: new Date().toISOString(),
        lastDataReceived: new Date().toISOString(),
        latency: 0,
        successRate: 0,
        dataPointsReceived: 0,
        failedRequests: 0,
        services: [],
        plan: SubscriptionPlan.BASIC
      }
    ];
  }

  private getFallbackMetrics(): BrokerMetrics {
    return {
      totalConnections: 0,
      activeConnections: 0,
      failedConnections: 0,
      avgLatency: 0,
      totalDataPoints: 0,
      overallSuccessRate: 0
    };
  }
}

export const brokerService = new BrokerServiceAPI();