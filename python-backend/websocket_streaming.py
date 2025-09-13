import yfinance as yf
import asyncio
import websockets
import json
import logging
from datetime import datetime
from typing import Set, Dict, List
import threading
import time

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class YFinanceWebSocketServer:
    def __init__(self, host='localhost', port=8765):
        self.host = host
        self.port = port
        self.clients: Set[websockets.WebSocketServerProtocol] = set()
        self.subscribed_symbols: Set[str] = set()
        self.symbol_mapping = {
            'NIFTY50': '^NSEI',
            'BANKNIFTY': '^NSEBANK',
            'RELIANCE': 'RELIANCE.NS',
            'TCS': 'TCS.NS',
            'INFY': 'INFY.NS',
            'HDFCBANK': 'HDFCBANK.NS',
            'ICICIBANK': 'ICICIBANK.NS'
        }
        self.running = False
        
    async def register_client(self, websocket):
        """Register a new WebSocket client"""
        self.clients.add(websocket)
        logger.info(f"Client connected. Total clients: {len(self.clients)}")
        
    async def unregister_client(self, websocket):
        """Unregister a WebSocket client"""
        self.clients.discard(websocket)
        logger.info(f"Client disconnected. Total clients: {len(self.clients)}")
        
    async def handle_client_message(self, websocket, message):
        """Handle incoming messages from clients"""
        try:
            data = json.loads(message)
            
            if data.get('type') == 'subscribe':
                symbols = data.get('symbols', [])
                for symbol in symbols:
                    yf_symbol = self.symbol_mapping.get(symbol, symbol)
                    self.subscribed_symbols.add(yf_symbol)
                    
                await websocket.send(json.dumps({
                    'type': 'subscription_confirmed',
                    'symbols': symbols
                }))
                logger.info(f"Client subscribed to: {symbols}")
                
            elif data.get('type') == 'unsubscribe':
                symbols = data.get('symbols', [])
                for symbol in symbols:
                    yf_symbol = self.symbol_mapping.get(symbol, symbol)
                    self.subscribed_symbols.discard(yf_symbol)
                    
                await websocket.send(json.dumps({
                    'type': 'unsubscription_confirmed',
                    'symbols': symbols
                }))
                
        except json.JSONDecodeError:
            await websocket.send(json.dumps({
                'type': 'error',
                'message': 'Invalid JSON format'
            }))
        except Exception as e:
            logger.error(f"Error handling client message: {e}")
            
    async def broadcast_market_data(self, data):
        """Broadcast market data to all connected clients"""
        if not self.clients:
            return
            
        message = json.dumps({
            'type': 'market_data',
            'data': data,
            'timestamp': datetime.now().isoformat()
        })
        
        # Send to all clients
        disconnected_clients = set()
        for client in self.clients:
            try:
                await client.send(message)
            except websockets.exceptions.ConnectionClosed:
                disconnected_clients.add(client)
            except Exception as e:
                logger.error(f"Error sending to client: {e}")
                disconnected_clients.add(client)
                
        # Remove disconnected clients
        for client in disconnected_clients:
            self.clients.discard(client)
            
    def fetch_market_data(self):
        """Fetch market data using yfinance"""
        try:
            if not self.subscribed_symbols:
                return {}
                
            symbols_list = list(self.subscribed_symbols)
            
            # Use yfinance download for multiple symbols
            data = yf.download(symbols_list, period="1d", interval="1m", progress=False)
            
            if data.empty:
                return {}
                
            result = {}
            
            # Process data for each symbol
            for symbol in symbols_list:
                try:
                    if len(symbols_list) == 1:
                        symbol_data = data
                    else:
                        symbol_data = data[symbol] if symbol in data.columns.levels[1] else None
                        
                    if symbol_data is not None and not symbol_data.empty:
                        latest = symbol_data.iloc[-1]
                        prev = symbol_data.iloc[-2] if len(symbol_data) > 1 else latest
                        
                        # Map back to original symbol name
                        original_symbol = None
                        for orig, yf_sym in self.symbol_mapping.items():
                            if yf_sym == symbol:
                                original_symbol = orig
                                break
                        
                        result[original_symbol or symbol] = {
                            'symbol': original_symbol or symbol,
                            'ltp': float(latest['Close']),
                            'open': float(latest['Open']),
                            'high': float(latest['High']),
                            'low': float(latest['Low']),
                            'volume': int(latest['Volume']),
                            'change': float(latest['Close'] - prev['Close']),
                            'change_percent': float((latest['Close'] - prev['Close']) / prev['Close'] * 100),
                            'timestamp': datetime.now().isoformat()
                        }
                        
                except Exception as e:
                    logger.error(f"Error processing {symbol}: {e}")
                    continue
                    
            return result
            
        except Exception as e:
            logger.error(f"Error fetching market data: {e}")
            return {}
            
    async def market_data_loop(self):
        """Continuous market data fetching loop"""
        while self.running:
            try:
                if self.subscribed_symbols and self.clients:
                    market_data = self.fetch_market_data()
                    
                    if market_data:
                        for symbol, data in market_data.items():
                            await self.broadcast_market_data(data)
                            
                await asyncio.sleep(5)  # Update every 5 seconds
                
            except Exception as e:
                logger.error(f"Error in market data loop: {e}")
                await asyncio.sleep(5)
                
    async def handle_client(self, websocket, path):
        """Handle individual client connections"""
        await self.register_client(websocket)
        
        try:
            async for message in websocket:
                await self.handle_client_message(websocket, message)
        except websockets.exceptions.ConnectionClosed:
            pass
        except Exception as e:
            logger.error(f"Error handling client: {e}")
        finally:
            await self.unregister_client(websocket)
            
    async def start_server(self):
        """Start the WebSocket server"""
        self.running = True
        
        # Start market data loop
        asyncio.create_task(self.market_data_loop())
        
        # Start WebSocket server
        server = await websockets.serve(
            self.handle_client,
            self.host,
            self.port
        )
        
        logger.info(f"WebSocket server started on ws://{self.host}:{self.port}")
        
        # Keep server running
        await server.wait_closed()
        
    def stop_server(self):
        """Stop the server"""
        self.running = False

async def main():
    """Main function to start WebSocket server"""
    server = YFinanceWebSocketServer()
    
    try:
        await server.start_server()
    except KeyboardInterrupt:
        logger.info("Server stopped by user")
        server.stop_server()

if __name__ == "__main__":
    asyncio.run(main())