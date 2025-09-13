from fyers_apiv3.FyersWebsocket import data_ws, order_ws
import logging
from typing import Dict, Any, Optional, List

logger = logging.getLogger(__name__)

class FyersWebSocketClient:
    def __init__(self, access_token: str):
        self.access_token = access_token
        self.data_socket = None
        self.order_socket = None
        self.subscribed_symbols = []
        
    def create_data_socket(self, lite_mode: bool = True):
        """Create data WebSocket for market data"""
        try:
            self.data_socket = data_ws.FyersDataSocket(
                access_token=self.access_token,
                log_path="",
                litemode=lite_mode,
                write_to_file=False,
                reconnect=True,
                on_connect=self._on_data_connect,
                on_close=self._on_data_close,
                on_error=self._on_data_error,
                on_message=self._on_data_message,
                reconnect_retry=10
            )
            logger.info("Data WebSocket created successfully")
        except Exception as e:
            logger.error(f"Error creating data WebSocket: {str(e)}")
            
    def create_order_socket(self):
        """Create order WebSocket for order updates"""
        try:
            self.order_socket = order_ws.FyersOrderSocket(
                access_token=self.access_token,
                write_to_file=False,
                log_path="",
                on_connect=self._on_order_connect,
                on_close=self._on_order_close,
                on_error=self._on_order_error,
                on_orders=self._on_order_update,
                on_trades=self._on_trade_update,
                on_positions=self._on_position_update
            )
            logger.info("Order WebSocket created successfully")
        except Exception as e:
            logger.error(f"Error creating order WebSocket: {str(e)}")
    
    def connect_data_socket(self):
        """Connect data WebSocket"""
        if self.data_socket:
            try:
                self.data_socket.connect()
                logger.info("Data WebSocket connected")
            except Exception as e:
                logger.error(f"Error connecting data WebSocket: {str(e)}")
    
    def connect_order_socket(self):
        """Connect order WebSocket"""
        if self.order_socket:
            try:
                self.order_socket.connect()
                logger.info("Order WebSocket connected")
            except Exception as e:
                logger.error(f"Error connecting order WebSocket: {str(e)}")
    
    def subscribe_to_symbols(self, symbols: List[str]):
        """Subscribe to market data for symbols"""
        if self.data_socket and symbols:
            try:
                # Limit to 5000 subscriptions as per API documentation
                if len(symbols) > 5000:
                    symbols = symbols[:5000]
                    
                self.subscribed_symbols = symbols
                self.data_socket.subscribe(symbols=symbols)
                logger.info(f"Subscribed to {len(symbols)} symbols")
            except Exception as e:
                logger.error(f"Error subscribing to symbols: {str(e)}")
    
    def subscribe_to_orders(self):
        """Subscribe to order updates"""
        if self.order_socket:
            try:
                self.order_socket.subscribe(data_type="OnOrders")
                logger.info("Subscribed to order updates")
            except Exception as e:
                logger.error(f"Error subscribing to orders: {str(e)}")
    
    def subscribe_to_trades(self):
        """Subscribe to trade updates"""
        if self.order_socket:
            try:
                self.order_socket.subscribe(data_type="OnTrades")
                logger.info("Subscribed to trade updates")
            except Exception as e:
                logger.error(f"Error subscribing to trades: {str(e)}")
    
    def subscribe_to_positions(self):
        """Subscribe to position updates"""
        if self.order_socket:
            try:
                self.order_socket.subscribe(data_type="OnPositions")
                logger.info("Subscribed to position updates")
            except Exception as e:
                logger.error(f"Error subscribing to positions: {str(e)}")
    
    def subscribe_to_all_updates(self):
        """Subscribe to all order, trade, position, and general updates"""
        if self.order_socket:
            try:
                self.order_socket.subscribe(data_type="OnOrders,OnTrades,OnPositions,OnGeneral")
                logger.info("Subscribed to all updates")
            except Exception as e:
                logger.error(f"Error subscribing to all updates: {str(e)}")
    
    def disconnect_all(self):
        """Disconnect all WebSocket connections"""
        try:
            if self.data_socket:
                self.data_socket.close()
                logger.info("Data WebSocket disconnected")
            if self.order_socket:
                self.order_socket.close()
                logger.info("Order WebSocket disconnected")
        except Exception as e:
            logger.error(f"Error disconnecting WebSockets: {str(e)}")
    
    # Callback functions for data WebSocket
    def _on_data_connect(self):
        """Data WebSocket connection callback"""
        logger.info("Data WebSocket connected successfully")
        # Auto-subscribe to previously subscribed symbols
        if self.subscribed_symbols:
            self.subscribe_to_symbols(self.subscribed_symbols)
    
    def _on_data_close(self, message):
        """Data WebSocket close callback"""
        logger.info(f"Data WebSocket closed: {message}")
    
    def _on_data_error(self, message):
        """Data WebSocket error callback"""
        logger.error(f"Data WebSocket error: {message}")
    
    def _on_data_message(self, message):
        """Data WebSocket message callback"""
        logger.debug(f"Data WebSocket message: {message}")
        # Here you can process and broadcast the message to frontend
    
    # Callback functions for order WebSocket
    def _on_order_connect(self):
        """Order WebSocket connection callback"""
        logger.info("Order WebSocket connected successfully")
        # Subscribe to all updates by default
        self.subscribe_to_all_updates()
    
    def _on_order_close(self, message):
        """Order WebSocket close callback"""
        logger.info(f"Order WebSocket closed: {message}")
    
    def _on_order_error(self, message):
        """Order WebSocket error callback"""
        logger.error(f"Order WebSocket error: {message}")
    
    def _on_order_update(self, message):
        """Order WebSocket update callback"""
        logger.info(f"Order update: {message}")
        # Here you can process and broadcast the order update to frontend
    
    def _on_trade_update(self, message):
        """Trade WebSocket update callback"""
        logger.info(f"Trade update: {message}")
        # Here you can process and broadcast the trade update to frontend
    
    def _on_position_update(self, message):
        """Position WebSocket update callback"""
        logger.info(f"Position update: {message}")
        # Here you can process and broadcast the position update to frontend

# Global WebSocket client instance
_websocket_client: Optional[FyersWebSocketClient] = None

def initialize_websocket(access_token: str) -> FyersWebSocketClient:
    """Initialize WebSocket client"""
    global _websocket_client
    _websocket_client = FyersWebSocketClient(access_token)
    return _websocket_client

def get_websocket_client() -> Optional[FyersWebSocketClient]:
    """Get current WebSocket client instance"""
    return _websocket_client