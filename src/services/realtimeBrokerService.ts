import { BrokerType, ConnectionStatus, DataFlowStatus, ConnectionHealth, BrokerService, SubscriptionPlan } from '../types/enums';
import { ConnectedBroker, BrokerMetrics } from './brokerService';

class RealtimeBrokerService {
  private connections: Map<BrokerType, ConnectedBroker> = new Map();
  private updateInterval: NodeJS.Timeout | null = null;
  private subscribers: ((brokers: ConnectedBroker[]) => void)[] = [];

  constructor() {
    this.startRealtimeUpdates();
  }

  subscribe(callback: (brokers: ConnectedBroker[]) => void) {
    this.subscribers.push(callback);
    return () => {
      this.subscribers = this.subscribers.filter(sub => sub !== callback);
    };
  }

  private notifySubscribers() {
    const brokers = Array.from(this.connections.values());
    this.subscribers.forEach(callback => callback(brokers));
  }

  private generateRealtimeData(broker: ConnectedBroker): ConnectedBroker {
    const now = new Date().toISOString();
    const latencyVariation = Math.random() * 20 - 10; // ±10ms variation
    const dataPointsIncrease = Math.floor(Math.random() * 50) + 10;
    const failureChance = Math.random() < 0.05; // 5% chance of failure

    return {
      ...broker,
      lastDataReceived: now,
      latency: Math.max(20, broker.latency + latencyVariation),
      dataPointsReceived: broker.dataPointsReceived + dataPointsIncrease,
      failedRequests: failureChance ? broker.failedRequests + 1 : broker.failedRequests,
      successRate: Math.min(0.999, Math.max(0.900, broker.successRate + (Math.random() * 0.002 - 0.001))),
      status: failureChance && Math.random() < 0.3 ? ConnectionStatus.RECONNECTING : ConnectionStatus.CONNECTED,
      dataFlow: failureChance ? DataFlowStatus.INACTIVE : DataFlowStatus.STREAMING,
      health: failureChance ? ConnectionHealth.WARNING : ConnectionHealth.HEALTHY
    };
  }

  private initializeBrokers() {
    // Initialize with realistic broker connections
    const brokers: ConnectedBroker[] = [
      {
        id: "broker_zerodha_live",
        type: BrokerType.ZERODHA,
        status: ConnectionStatus.CONNECTED,
        dataFlow: DataFlowStatus.STREAMING,
        health: ConnectionHealth.HEALTHY,
        connectedAt: new Date(Date.now() - 3600000).toISOString(),
        lastDataReceived: new Date().toISOString(),
        latency: 45,
        successRate: 0.995,
        dataPointsReceived: 15420,
        failedRequests: 3,
        services: [BrokerService.MARKET_DATA, BrokerService.ORDER_MANAGEMENT, BrokerService.PORTFOLIO_SYNC],
        plan: SubscriptionPlan.ENTERPRISE
      },
      {
        id: "broker_angel_live",
        type: BrokerType.ANGEL_ONE,
        status: ConnectionStatus.CONNECTED,
        dataFlow: DataFlowStatus.ACTIVE,
        health: ConnectionHealth.HEALTHY,
        connectedAt: new Date(Date.now() - 7200000).toISOString(),
        lastDataReceived: new Date().toISOString(),
        latency: 62,
        successRate: 0.992,
        dataPointsReceived: 23890,
        failedRequests: 8,
        services: [BrokerService.MARKET_DATA, BrokerService.ORDER_MANAGEMENT, BrokerService.REAL_TIME_QUOTES],
        plan: SubscriptionPlan.PRO
      },
      {
        id: "broker_upstox_live",
        type: BrokerType.UPSTOX,
        status: ConnectionStatus.CONNECTED,
        dataFlow: DataFlowStatus.STREAMING,
        health: ConnectionHealth.HEALTHY,
        connectedAt: new Date(Date.now() - 1800000).toISOString(),
        lastDataReceived: new Date().toISOString(),
        latency: 78,
        successRate: 0.988,
        dataPointsReceived: 8750,
        failedRequests: 12,
        services: [BrokerService.MARKET_DATA, BrokerService.REAL_TIME_QUOTES],
        plan: SubscriptionPlan.BASIC
      }
    ];

    brokers.forEach(broker => {
      this.connections.set(broker.type, broker);
    });
  }

  private startRealtimeUpdates() {
    this.initializeBrokers();
    
    this.updateInterval = setInterval(() => {
      this.connections.forEach((broker, type) => {
        const updatedBroker = this.generateRealtimeData(broker);
        this.connections.set(type, updatedBroker);
      });
      
      this.notifySubscribers();
    }, 2000); // Update every 2 seconds
  }

  getConnectedBrokers(): ConnectedBroker[] {
    return Array.from(this.connections.values());
  }

  getBrokerMetrics(): BrokerMetrics {
    const brokers = this.getConnectedBrokers();
    const activeConnections = brokers.filter(b => b.status === ConnectionStatus.CONNECTED).length;
    const totalDataPoints = brokers.reduce((sum, b) => sum + b.dataPointsReceived, 0);
    const avgLatency = brokers.reduce((sum, b) => sum + b.latency, 0) / brokers.length;
    const avgSuccessRate = brokers.reduce((sum, b) => sum + b.successRate, 0) / brokers.length;

    return {
      totalConnections: brokers.length,
      activeConnections,
      failedConnections: brokers.length - activeConnections,
      avgLatency: Math.round(avgLatency * 100) / 100,
      totalDataPoints,
      overallSuccessRate: Math.round(avgSuccessRate * 1000) / 1000
    };
  }

  addBroker(brokerType: BrokerType): boolean {
    if (this.connections.has(brokerType)) {
      return false; // Already connected
    }

    const newBroker: ConnectedBroker = {
      id: `broker_${brokerType.toLowerCase()}_live`,
      type: brokerType,
      status: ConnectionStatus.CONNECTED,
      dataFlow: DataFlowStatus.STREAMING,
      health: ConnectionHealth.HEALTHY,
      connectedAt: new Date().toISOString(),
      lastDataReceived: new Date().toISOString(),
      latency: Math.floor(Math.random() * 50) + 30,
      successRate: 0.99 + Math.random() * 0.009,
      dataPointsReceived: 0,
      failedRequests: 0,
      services: [BrokerService.MARKET_DATA, BrokerService.ORDER_MANAGEMENT],
      plan: SubscriptionPlan.PRO
    };

    this.connections.set(brokerType, newBroker);
    this.notifySubscribers();
    return true;
  }

  removeBroker(brokerType: BrokerType): boolean {
    const removed = this.connections.delete(brokerType);
    if (removed) {
      this.notifySubscribers();
    }
    return removed;
  }

  destroy() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
    this.connections.clear();
    this.subscribers = [];
  }
}

export const realtimeBrokerService = new RealtimeBrokerService();