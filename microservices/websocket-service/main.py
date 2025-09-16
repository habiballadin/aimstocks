from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

import asyncio
import json
import httpx
from typing import Dict, List, Set
import logging

logger = logging.getLogger(__name__)

app = FastAPI(title="WebSocket Service", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Service URLs
MARKET_DATA_SERVICE_URL = os.getenv("MARKET_DATA_SERVICE_URL", "http://localhost:8005")
ORDER_SERVICE_URL = os.getenv("ORDER_SERVICE_URL", "http://localhost:8004")
ALERT_SERVICE_URL = os.getenv("ALERT_SERVICE_URL", "http://localhost:8007")

class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []
        self.user_connections: Dict[int, List[WebSocket]] = {}
        self.subscriptions: Dict[WebSocket, Set[str]] = {}
    
    async def connect(self, websocket: WebSocket, user_id: int = None):
        await websocket.accept()
        self.active_connections.append(websocket)
        
        if user_id:
            if user_id not in self.user_connections:
                self.user_connections[user_id] = []
            self.user_connections[user_id].append(websocket)
        
        self.subscriptions[websocket] = set()
        logger.info(f"WebSocket connected. Total connections: {len(self.active_connections)}")
    
    def disconnect(self, websocket: WebSocket, user_id: int = None):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
        
        if user_id and user_id in self.user_connections:
            if websocket in self.user_connections[user_id]:
                self.user_connections[user_id].remove(websocket)
            if not self.user_connections[user_id]:
                del self.user_connections[user_id]
        
        if websocket in self.subscriptions:
            del self.subscriptions[websocket]
        
        logger.info(f"WebSocket disconnected. Total connections: {len(self.active_connections)}")
    
    async def send_personal_message(self, message: str, websocket: WebSocket):
        try:
            await websocket.send_text(message)
        except Exception as e:
            logger.error(f"Error sending personal message: {str(e)}")
    
    async def send_to_user(self, message: str, user_id: int):
        if user_id in self.user_connections:
            disconnected = []
            for websocket in self.user_connections[user_id]:
                try:
                    await websocket.send_text(message)
                except Exception as e:
                    logger.error(f"Error sending to user {user_id}: {str(e)}")
                    disconnected.append(websocket)
            
            # Remove disconnected websockets
            for ws in disconnected:
                self.disconnect(ws, user_id)
    
    async def broadcast(self, message: str):
        disconnected = []
        for connection in self.active_connections:
            try:
                await connection.send_text(message)
            except Exception as e:
                logger.error(f"Error broadcasting: {str(e)}")
                disconnected.append(connection)
        
        # Remove disconnected websockets
        for ws in disconnected:
            self.disconnect(ws)
    
    async def broadcast_to_subscribers(self, message: str, symbol: str):
        disconnected = []
        for websocket, subscriptions in self.subscriptions.items():
            if symbol in subscriptions:
                try:
                    await websocket.send_text(message)
                except Exception as e:
                    logger.error(f"Error broadcasting to subscriber: {str(e)}")
                    disconnected.append(websocket)
        
        # Remove disconnected websockets
        for ws in disconnected:
            self.disconnect(ws)
    
    def subscribe_to_symbol(self, websocket: WebSocket, symbol: str):
        if websocket in self.subscriptions:
            self.subscriptions[websocket].add(symbol)
    
    def unsubscribe_from_symbol(self, websocket: WebSocket, symbol: str):
        if websocket in self.subscriptions:
            self.subscriptions[websocket].discard(symbol)

manager = ConnectionManager()

class DataStreamer:
    def __init__(self):
        self.streaming = True
        self.market_data_cache = {}
    
    async def start_streaming(self):
        """Start streaming market data"""
        while self.streaming:
            try:
                await self.fetch_and_broadcast_market_data()
                await asyncio.sleep(5)  # Update every 5 seconds
            except Exception as e:
                logger.error(f"Error in data streaming: {str(e)}")
                await asyncio.sleep(10)
    
    async def fetch_and_broadcast_market_data(self):
        """Fetch market data and broadcast to subscribers"""
        try:
            # Get all unique subscribed symbols
            all_symbols = set()
            for subscriptions in manager.subscriptions.values():
                all_symbols.update(subscriptions)
            
            if not all_symbols:
                return
            
            # Fetch market data for subscribed symbols
            symbols_str = ",".join(all_symbols)
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"{MARKET_DATA_SERVICE_URL}/api/market-data/quotes/{symbols_str}",
                    timeout=5.0
                )
                
                if response.status_code == 200:
                    result = response.json()
                    if result.get("success") and result.get("data", {}).get("quotes"):
                        quotes = result["data"]["quotes"]
                        
                        for quote in quotes:
                            symbol = quote.get("symbol")
                            if symbol:
                                # Check if data has changed
                                if symbol not in self.market_data_cache or self.market_data_cache[symbol] != quote:
                                    self.market_data_cache[symbol] = quote
                                    
                                    # Broadcast to subscribers
                                    message = json.dumps({
                                        "type": "market_data",
                                        "symbol": symbol,
                                        "data": quote,
                                        "timestamp": asyncio.get_event_loop().time()
                                    })
                                    
                                    await manager.broadcast_to_subscribers(message, symbol)
        
        except Exception as e:
            logger.error(f"Error fetching market data: {str(e)}")

data_streamer = DataStreamer()

@app.on_event("startup")
async def startup_event():
    asyncio.create_task(data_streamer.start_streaming())

@app.websocket("/ws/market-data")
async def websocket_market_data(websocket: WebSocket, user_id: int = None):
    await manager.connect(websocket, user_id)
    
    try:
        while True:
            data = await websocket.receive_text()
            message = json.loads(data)
            
            if message.get("type") == "subscribe":
                symbols = message.get("symbols", [])
                for symbol in symbols:
                    manager.subscribe_to_symbol(websocket, symbol)
                
                await manager.send_personal_message(
                    json.dumps({
                        "type": "subscription_confirmed",
                        "symbols": symbols
                    }),
                    websocket
                )
            
            elif message.get("type") == "unsubscribe":
                symbols = message.get("symbols", [])
                for symbol in symbols:
                    manager.unsubscribe_from_symbol(websocket, symbol)
                
                await manager.send_personal_message(
                    json.dumps({
                        "type": "unsubscription_confirmed",
                        "symbols": symbols
                    }),
                    websocket
                )
    
    except WebSocketDisconnect:
        manager.disconnect(websocket, user_id)
    except Exception as e:
        logger.error(f"WebSocket error: {str(e)}")
        manager.disconnect(websocket, user_id)

@app.websocket("/ws/algo-trading")
async def websocket_algo_trading(websocket: WebSocket, user_id: int = None):
    await manager.connect(websocket, user_id)
    
    try:
        while True:
            data = await websocket.receive_text()
            # Keep connection alive
            await manager.send_personal_message(
                json.dumps({"type": "ping", "timestamp": asyncio.get_event_loop().time()}),
                websocket
            )
    
    except WebSocketDisconnect:
        manager.disconnect(websocket, user_id)
    except Exception as e:
        logger.error(f"Algo trading WebSocket error: {str(e)}")
        manager.disconnect(websocket, user_id)

@app.websocket("/ws/notifications")
async def websocket_notifications(websocket: WebSocket, user_id: int):
    await manager.connect(websocket, user_id)
    
    try:
        while True:
            data = await websocket.receive_text()
            # Handle notification preferences or keep alive
            await manager.send_personal_message(
                json.dumps({"type": "notification_service_ready"}),
                websocket
            )
    
    except WebSocketDisconnect:
        manager.disconnect(websocket, user_id)
    except Exception as e:
        logger.error(f"Notifications WebSocket error: {str(e)}")
        manager.disconnect(websocket, user_id)

# API endpoints for sending messages
@app.post("/api/websocket/broadcast")
async def broadcast_message(message_data: dict):
    try:
        message = json.dumps(message_data)
        await manager.broadcast(message)
        return {"success": True, "message": "Message broadcasted"}
    except Exception as e:
        logger.error(f"Error broadcasting message: {str(e)}")
        return {"success": False, "error": str(e)}

@app.post("/api/websocket/send-to-user")
async def send_to_user(message_data: dict):
    try:
        user_id = message_data.get("user_id")
        message = json.dumps(message_data.get("message", {}))
        
        if not user_id:
            return {"success": False, "error": "User ID required"}
        
        await manager.send_to_user(message, user_id)
        return {"success": True, "message": f"Message sent to user {user_id}"}
    except Exception as e:
        logger.error(f"Error sending message to user: {str(e)}")
        return {"success": False, "error": str(e)}

@app.post("/api/websocket/notify-execution")
async def notify_execution(execution_data: dict):
    """Notify about algorithm execution"""
    try:
        user_id = execution_data.get("user_id")
        if user_id:
            message = json.dumps({
                "type": "execution",
                "data": execution_data,
                "timestamp": asyncio.get_event_loop().time()
            })
            await manager.send_to_user(message, user_id)
        
        return {"success": True, "message": "Execution notification sent"}
    except Exception as e:
        logger.error(f"Error sending execution notification: {str(e)}")
        return {"success": False, "error": str(e)}

@app.post("/api/websocket/notify-alert")
async def notify_alert(alert_data: dict):
    """Notify about triggered alert"""
    try:
        user_id = alert_data.get("user_id")
        if user_id:
            message = json.dumps({
                "type": "alert",
                "data": alert_data,
                "timestamp": asyncio.get_event_loop().time()
            })
            await manager.send_to_user(message, user_id)
        
        return {"success": True, "message": "Alert notification sent"}
    except Exception as e:
        logger.error(f"Error sending alert notification: {str(e)}")
        return {"success": False, "error": str(e)}

@app.get("/api/websocket/stats")
async def get_websocket_stats():
    try:
        stats = {
            "total_connections": len(manager.active_connections),
            "user_connections": len(manager.user_connections),
            "total_subscriptions": sum(len(subs) for subs in manager.subscriptions.values()),
            "unique_symbols": len(set().union(*manager.subscriptions.values())) if manager.subscriptions else 0
        }
        
        return {"success": True, "stats": stats}
    except Exception as e:
        logger.error(f"Error getting WebSocket stats: {str(e)}")
        return {"success": False, "error": str(e)}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "websocket-service"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8009)