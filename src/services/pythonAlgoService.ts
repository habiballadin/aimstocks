interface AlgorithmExecution {
  algorithmId: string;
  symbol: string;
  action: 'BUY' | 'SELL' | 'HOLD';
  quantity: number;
  confidence: number;
  reason: string;
  timestamp: string;
}

interface BacktestResult {
  algorithmId: string;
  startDate: string;
  endDate: string;
  initialCapital: number;
  finalValue: number;
  totalReturn: number;
  sharpeRatio: number;
  maxDrawdown: number;
  totalTrades: number;
  winRate: number;
  trades: Array<{
    date: string;
    action: string;
    symbol: string;
    price: number;
    quantity: number;
    pnl: number;
  }>;
}

interface PythonEnvironmentStatus {
  status: 'CONNECTED' | 'DISCONNECTED' | 'ERROR';
  version: string;
  libraries: string[];
  cpuUsage: number;
  memoryUsage: number;
  activeAlgorithms: number;
}

class PythonAlgoService {
  private baseUrl: string;
  private wsConnection: WebSocket | null = null;

  constructor() {
    // In production, this would be your Python backend URL
    this.baseUrl = process.env.REACT_APP_PYTHON_API_URL || 'http://localhost:8000';
  }

  // Connect to Python backend WebSocket for real-time updates
  connectWebSocket(onMessage: (data: unknown) => void): void {
    try {
      this.wsConnection = new WebSocket(`ws://localhost:8000/ws/algo-trading`);
      
      this.wsConnection.onopen = () => {
        console.log('Connected to Python algorithm service');
      };

      this.wsConnection.onmessage = (event) => {
        const data = JSON.parse(event.data);
        onMessage(data);
      };

      this.wsConnection.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

      this.wsConnection.onclose = () => {
        console.log('WebSocket connection closed');
        // Attempt to reconnect after 5 seconds
        setTimeout(() => this.connectWebSocket(onMessage), 5000);
      };
    } catch (error) {
      console.error('Failed to connect to WebSocket:', error);
    }
  }

  // Disconnect WebSocket
  disconnectWebSocket(): void {
    if (this.wsConnection) {
      this.wsConnection.close();
      this.wsConnection = null;
    }
  }

  // Create a new algorithm
  async createAlgorithm(algorithmData: {
    name: string;
    type: 'PREDEFINED' | 'CUSTOM';
    category: string;
    description: string;
    pythonCode?: string;
    parameters: Record<string, unknown>;
  }): Promise<{ success: boolean; algorithmId?: string; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/api/algorithms`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(algorithmData),
      });

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error creating algorithm:', error);
      return { success: false, error: 'Failed to create algorithm' };
    }
  }

  // Update algorithm code
  async updateAlgorithm(algorithmId: string, updates: {
    pythonCode?: string;
    parameters?: Record<string, unknown>;
    isActive?: boolean;
  }): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/api/algorithms/${algorithmId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error updating algorithm:', error);
      return { success: false, error: 'Failed to update algorithm' };
    }
  }

  // Start algorithm execution
  async startAlgorithm(algorithmId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/api/algorithms/${algorithmId}/start`, {
        method: 'POST',
      });

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error starting algorithm:', error);
      return { success: false, error: 'Failed to start algorithm' };
    }
  }

  // Stop algorithm execution
  async stopAlgorithm(algorithmId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/api/algorithms/${algorithmId}/stop`, {
        method: 'POST',
      });

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error stopping algorithm:', error);
      return { success: false, error: 'Failed to stop algorithm' };
    }
  }

  // Run backtest
  async runBacktest(algorithmId: string, config: {
    startDate: string;
    endDate: string;
    initialCapital: number;
    symbols?: string[];
  }): Promise<{ success: boolean; result?: BacktestResult; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/api/algorithms/${algorithmId}/backtest`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(config),
      });

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error running backtest:', error);
      return { success: false, error: 'Failed to run backtest' };
    }
  }

  // Get algorithm performance
  async getAlgorithmPerformance(algorithmId: string, period: string = '30d'): Promise<{
    success: boolean;
    performance?: {
      totalReturn: number;
      sharpeRatio: number;
      maxDrawdown: number;
      winRate: number;
      totalTrades: number;
      profitFactor: number;
      dailyReturns: Array<{ date: string; return: number }>;
    };
    error?: string;
  }> {
    try {
      const response = await fetch(`${this.baseUrl}/api/algorithms/${algorithmId}/performance?period=${period}`);
      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error getting algorithm performance:', error);
      return { success: false, error: 'Failed to get performance data' };
    }
  }

  // Get live executions
  async getLiveExecutions(limit: number = 50): Promise<{
    success: boolean;
    executions?: AlgorithmExecution[];
    error?: string;
  }> {
    try {
      const response = await fetch(`${this.baseUrl}/api/executions?limit=${limit}`);
      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error getting live executions:', error);
      return { success: false, error: 'Failed to get executions' };
    }
  }

  // Get Python environment status
  async getEnvironmentStatus(): Promise<{
    success: boolean;
    status?: PythonEnvironmentStatus;
    error?: string;
  }> {
    try {
      const response = await fetch(`${this.baseUrl}/api/environment/status`);
      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error getting environment status:', error);
      return { success: false, error: 'Failed to get environment status' };
    }
  }

  // Validate Python code
  async validateCode(pythonCode: string): Promise<{
    success: boolean;
    isValid?: boolean;
    errors?: string[];
    warnings?: string[];
  }> {
    try {
      const response = await fetch(`${this.baseUrl}/api/algorithms/validate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code: pythonCode }),
      });

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error validating code:', error);
      return { success: false, isValid: false, errors: ['Failed to validate code'] };
    }
  }

  // Get algorithm logs
  async getAlgorithmLogs(algorithmId: string, limit: number = 100): Promise<{
    success: boolean;
    logs?: Array<{
      timestamp: string;
      level: 'INFO' | 'WARNING' | 'ERROR';
      message: string;
    }>;
    error?: string;
  }> {
    try {
      const response = await fetch(`${this.baseUrl}/api/algorithms/${algorithmId}/logs?limit=${limit}`);
      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error getting algorithm logs:', error);
      return { success: false, error: 'Failed to get logs' };
    }
  }

  // Install Python library
  async installLibrary(libraryName: string): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/api/environment/install`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ library: libraryName }),
      });

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error installing library:', error);
      return { success: false, error: 'Failed to install library' };
    }
  }

  // Get market data for algorithm
  async getMarketData(symbol: string, period: string = '1d', interval: string = '1m'): Promise<{
    success: boolean;
    data?: Array<{
      timestamp: string;
      open: number;
      high: number;
      low: number;
      close: number;
      volume: number;
    }>;
    error?: string;
  }> {
    try {
      const response = await fetch(`${this.baseUrl}/api/market-data/${symbol}?period=${period}&interval=${interval}`);
      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error getting market data:', error);
      return { success: false, error: 'Failed to get market data' };
    }
  }
}

export const pythonAlgoService = new PythonAlgoService();
export type { AlgorithmExecution, BacktestResult, PythonEnvironmentStatus };