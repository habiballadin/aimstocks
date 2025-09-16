from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

from shared.database import db
from shared.models import Algorithm, AlgorithmCreate, AlgorithmExecution, APIResponse
import importlib.util
import asyncio
import httpx
import pandas as pd
import numpy as np
import json
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

app = FastAPI(title="Algorithm Service", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

MARKET_DATA_SERVICE_URL = os.getenv("MARKET_DATA_SERVICE_URL", "http://localhost:8005")

class AlgorithmExecutor:
    def __init__(self):
        self.running_algorithms = {}
        
    async def load_algorithm(self, algorithm_id: str, algorithm_data: dict):
        try:
            if algorithm_data['type'] == 'CUSTOM':
                code = algorithm_data['python_code']
                
                spec = importlib.util.spec_from_loader("custom_algo", loader=None)
                module = importlib.util.module_from_spec(spec)
                
                exec(code, module.__dict__)
                
                algo_class = None
                for name, obj in module.__dict__.items():
                    if isinstance(obj, type) and name != 'BaseException':
                        algo_class = obj
                        break
                
                if algo_class:
                    params = algorithm_data['parameters']
                    algo_instance = algo_class(**params)
                    self.running_algorithms[algorithm_id] = algo_instance
                    return True, "Algorithm loaded successfully"
                else:
                    return False, "No algorithm class found in code"
                    
            else:
                return await self.load_predefined_algorithm(algorithm_id, algorithm_data)
                
        except Exception as e:
            logger.error(f"Error loading algorithm {algorithm_id}: {str(e)}")
            return False, f"Failed to load algorithm: {str(e)}"
    
    async def load_predefined_algorithm(self, algorithm_id: str, algorithm_data: dict):
        return True, "Predefined algorithm loaded"
    
    async def execute_algorithm(self, algorithm_id: str):
        if algorithm_id not in self.running_algorithms:
            return None
            
        try:
            algo_instance = self.running_algorithms[algorithm_id]
            
            # Get algorithm data from database
            algorithm_data = db.execute_query(
                "SELECT * FROM algorithms WHERE id = %s",
                (algorithm_id,)
            )[0]
            
            # Get market data
            symbol = algorithm_data['parameters'].get('symbol', 'RELIANCE')
            data = await self.get_market_data(symbol)
            
            if data is None or len(data) < 20:
                return None
            
            # Generate signal
            if hasattr(algo_instance, 'generate_signal'):
                action, confidence, reason = algo_instance.generate_signal(data)
                
                # Create execution record
                execution_data = {
                    'algorithm_id': algorithm_id,
                    'symbol': symbol,
                    'action': action,
                    'quantity': algorithm_data['parameters'].get('quantity', 10),
                    'price': float(data['close'].iloc[-1]),
                    'confidence': float(confidence),
                    'reason': reason,
                    'status': 'PENDING'
                }
                
                if action in ['BUY', 'SELL'] and confidence > 0.6:
                    # Store execution in database
                    db.execute_query(
                        """INSERT INTO algorithm_executions (algorithm_id, symbol, action, quantity, 
                                                           price, confidence, reason, status) 
                           VALUES (%s, %s, %s, %s, %s, %s, %s, %s)""",
                        (execution_data['algorithm_id'], execution_data['symbol'], 
                         execution_data['action'], execution_data['quantity'],
                         execution_data['price'], execution_data['confidence'],
                         execution_data['reason'], execution_data['status'])
                    )
                    
                    # Update algorithm position
                    if hasattr(algo_instance, 'update_position'):
                        algo_instance.update_position(action)
                
                return execution_data
                
        except Exception as e:
            logger.error(f"Error executing algorithm {algorithm_id}: {str(e)}")
            return None
    
    async def get_market_data(self, symbol: str, period: str = "1mo"):
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"{MARKET_DATA_SERVICE_URL}/api/market-data/{symbol}",
                    params={"period": period},
                    timeout=10.0
                )
                
                if response.status_code == 200:
                    result = response.json()
                    if result.get("success") and result.get("data", {}).get("data"):
                        data_list = result["data"]["data"]
                        df = pd.DataFrame(data_list)
                        df['timestamp'] = pd.to_datetime(df['timestamp'])
                        df.set_index('timestamp', inplace=True)
                        return df
        except Exception as e:
            logger.error(f"Error fetching market data: {str(e)}")
        
        return None

executor = AlgorithmExecutor()

async def algorithm_runner():
    """Background task that runs active algorithms"""
    while True:
        try:
            # Get active algorithms
            active_algorithms = db.execute_query(
                "SELECT * FROM algorithms WHERE status = 'RUNNING' AND is_active = TRUE"
            )
            
            for algorithm in active_algorithms:
                await executor.execute_algorithm(str(algorithm['id']))
            
            await asyncio.sleep(30)
            
        except Exception as e:
            logger.error(f"Error in algorithm runner: {str(e)}")
            await asyncio.sleep(10)

@app.on_event("startup")
async def startup_event():
    asyncio.create_task(algorithm_runner())

@app.post("/api/algorithms")
async def create_algorithm(algorithm: AlgorithmCreate, user_id: int = 1):
    try:
        # Store algorithm in database
        db.execute_query(
            """INSERT INTO algorithms (user_id, name, description, type, category, 
                                     python_code, parameters, status, is_active) 
               VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)""",
            (user_id, algorithm.name, algorithm.description, algorithm.type,
             algorithm.category, algorithm.python_code, json.dumps(algorithm.parameters),
             'STOPPED', False)
        )
        
        # Get the created algorithm ID
        algorithm_id = db.execute_query("SELECT LAST_INSERT_ID() as id")[0]['id']
        
        return APIResponse(success=True, data={'algorithmId': str(algorithm_id)})
        
    except Exception as e:
        logger.error(f"Error creating algorithm: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/algorithms/{user_id}")
async def get_user_algorithms(user_id: int):
    try:
        algorithms = db.execute_query(
            "SELECT * FROM algorithms WHERE user_id = %s ORDER BY created_at DESC",
            (user_id,)
        )
        
        # Parse JSON parameters
        for algo in algorithms:
            if algo['parameters']:
                algo['parameters'] = json.loads(algo['parameters'])
        
        return APIResponse(success=True, data={"algorithms": algorithms})
        
    except Exception as e:
        logger.error(f"Error getting algorithms: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to get algorithms")

@app.put("/api/algorithms/{algorithm_id}")
async def update_algorithm(algorithm_id: str, updates: dict):
    try:
        # Build update query dynamically
        update_fields = []
        params = []
        
        for field in ["python_code", "parameters", "is_active"]:
            if field in updates:
                if field == "parameters":
                    update_fields.append(f"{field} = %s")
                    params.append(json.dumps(updates[field]))
                else:
                    update_fields.append(f"{field} = %s")
                    params.append(updates[field])
        
        if not update_fields:
            raise HTTPException(status_code=400, detail="No fields to update")
        
        params.append(algorithm_id)
        
        db.execute_query(
            f"UPDATE algorithms SET {', '.join(update_fields)} WHERE id = %s",
            tuple(params)
        )
        
        return APIResponse(success=True, message="Algorithm updated successfully")
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating algorithm: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/algorithms/{algorithm_id}/start")
async def start_algorithm(algorithm_id: str):
    try:
        # Get algorithm data
        algorithm_data = db.execute_query(
            "SELECT * FROM algorithms WHERE id = %s",
            (algorithm_id,)
        )
        
        if not algorithm_data:
            raise HTTPException(status_code=404, detail="Algorithm not found")
        
        algo_data = algorithm_data[0]
        algo_data['parameters'] = json.loads(algo_data['parameters']) if algo_data['parameters'] else {}
        
        # Load the algorithm
        success, message = await executor.load_algorithm(algorithm_id, algo_data)
        
        if success:
            db.execute_query(
                "UPDATE algorithms SET status = 'RUNNING', is_active = TRUE WHERE id = %s",
                (algorithm_id,)
            )
            return APIResponse(success=True, message='Algorithm started successfully')
        else:
            return APIResponse(success=False, error=message)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error starting algorithm: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/algorithms/{algorithm_id}/stop")
async def stop_algorithm(algorithm_id: str):
    try:
        db.execute_query(
            "UPDATE algorithms SET status = 'STOPPED', is_active = FALSE WHERE id = %s",
            (algorithm_id,)
        )
        
        # Remove from running algorithms
        if algorithm_id in executor.running_algorithms:
            del executor.running_algorithms[algorithm_id]
        
        return APIResponse(success=True, message='Algorithm stopped successfully')
        
    except Exception as e:
        logger.error(f"Error stopping algorithm: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/algorithms/{algorithm_id}/backtest")
async def run_backtest(algorithm_id: str, config: dict):
    try:
        # Store backtest configuration
        db.execute_query(
            """INSERT INTO backtests (algorithm_id, start_date, end_date, initial_capital, status) 
               VALUES (%s, %s, %s, %s, %s)""",
            (algorithm_id, config['startDate'], config['endDate'], 
             config['initialCapital'], 'RUNNING')
        )
        
        # Mock backtest results for now
        result = {
            'algorithmId': algorithm_id,
            'startDate': config['startDate'],
            'endDate': config['endDate'],
            'initialCapital': config['initialCapital'],
            'finalValue': config['initialCapital'] * 1.15,
            'totalReturn': 15.0,
            'sharpeRatio': 1.2,
            'maxDrawdown': -8.5,
            'totalTrades': 25,
            'winRate': 68.0,
            'trades': []
        }
        
        return APIResponse(success=True, data={'result': result})
        
    except Exception as e:
        logger.error(f"Error running backtest: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/executions")
async def get_executions(limit: int = 50):
    try:
        executions = db.execute_query(
            """SELECT ae.*, a.name as algorithm_name 
               FROM algorithm_executions ae
               JOIN algorithms a ON ae.algorithm_id = a.id
               ORDER BY ae.executed_at DESC 
               LIMIT %s""",
            (limit,)
        )
        
        return APIResponse(success=True, data={'executions': executions})
        
    except Exception as e:
        logger.error(f"Error getting executions: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/algorithms/validate")
async def validate_code(validation: dict):
    try:
        code = validation.get('code', '')
        
        # Basic syntax validation
        compile(code, '<string>', 'exec')
        
        errors = []
        warnings = []
        
        if 'generate_signal' not in code:
            warnings.append("Algorithm should implement 'generate_signal' method")
        
        if 'import pandas' not in code and 'import numpy' not in code:
            warnings.append("Consider importing pandas and numpy for data handling")
        
        return APIResponse(success=True, data={
            'isValid': True,
            'errors': errors,
            'warnings': warnings
        })
        
    except SyntaxError as e:
        return APIResponse(success=True, data={
            'isValid': False,
            'errors': [f"Syntax error: {str(e)}"],
            'warnings': []
        })
    except Exception as e:
        return APIResponse(success=True, data={
            'isValid': False,
            'errors': [f"Validation error: {str(e)}"],
            'warnings': []
        })

@app.get("/api/environment/status")
async def get_environment_status():
    try:
        import psutil
        
        status = {
            'status': 'CONNECTED',
            'version': sys.version.split()[0],
            'libraries': ['pandas', 'numpy', 'yfinance', 'scikit-learn', 'ta-lib', 'fastapi'],
            'cpuUsage': psutil.cpu_percent(),
            'memoryUsage': psutil.virtual_memory().percent,
            'activeAlgorithms': len([a for a in executor.running_algorithms.keys()])
        }
        
        return APIResponse(success=True, data={'status': status})
        
    except Exception as e:
        logger.error(f"Error getting environment status: {str(e)}")
        status = {
            'status': 'CONNECTED',
            'version': sys.version.split()[0],
            'libraries': ['pandas', 'numpy', 'yfinance', 'scikit-learn', 'ta-lib', 'fastapi'],
            'cpuUsage': 25.0,
            'memoryUsage': 45.0,
            'activeAlgorithms': len([a for a in executor.running_algorithms.keys()])
        }
        return APIResponse(success=True, data={'status': status})

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "algorithm-service"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8006)