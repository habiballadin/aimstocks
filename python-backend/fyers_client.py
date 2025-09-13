from fyers_apiv3 import fyersModel
from typing import Dict, List, Optional, Any
import os
from datetime import datetime, timedelta
import logging
from dotenv import load_dotenv

logger = logging.getLogger(__name__)

class FyersClient:
    def __init__(self):
        # Reload environment variables
        load_dotenv()
        self.client_id = os.getenv('FYERS_CLIENT_ID')
        self.secret_key = os.getenv('FYERS_SECRET_KEY')
        self.redirect_uri = os.getenv('FYERS_REDIRECT_URI', 'http://127.0.0.1:5000/fyers/callback')
        self.access_token = None
        self.fyers = None
        
        # Debug print
        print(f"FyersClient initialized with client_id: {self.client_id}")
        
    def get_auth_url(self) -> str:
        """Generate Fyers authentication URL"""
        session = fyersModel.SessionModel(
            client_id=self.client_id,
            secret_key=self.secret_key,
            redirect_uri=self.redirect_uri,
            response_type="code",
            state="sample",
            grant_type="authorization_code"
        )
        return session.generate_authcode()
    
    def authenticate(self, auth_code: str) -> Dict[str, Any]:
        """Authenticate with Fyers using auth code"""
        try:
            session = fyersModel.SessionModel(
                client_id=self.client_id,
                secret_key=self.secret_key,
                redirect_uri=self.redirect_uri,
                response_type="code",
                state="sample",
                grant_type="authorization_code"
            )
            
            session.set_token(auth_code)
            response = session.generate_token()
            
            if 'access_token' in response:
                self.access_token = response['access_token']
                self.fyers = fyersModel.FyersModel(
                    token=self.access_token,
                    is_async=False,
                    client_id=self.client_id,
                    log_path=""
                )
                return {'success': True, 'access_token': self.access_token}
            else:
                return {'success': False, 'error': response.get('message', 'Authentication failed')}
                
        except Exception as e:
            logger.error(f"Authentication error: {str(e)}")
            return {'success': False, 'error': str(e)}
    
    def get_profile(self) -> Dict[str, Any]:
        """Get user profile"""
        if not self.fyers:
            return {'success': False, 'error': 'Not authenticated'}
        
        try:
            response = self.fyers.get_profile()
            return {'success': True, 'data': response}
        except Exception as e:
            logger.error(f"Profile error: {str(e)}")
            return {'success': False, 'error': str(e)}
    
    def get_historical_data(self, symbol: str, resolution: str = "D", 
                          from_date: str = None, to_date: str = None) -> Dict[str, Any]:
        """Get historical data for a symbol"""
        if not self.fyers:
            return {'success': False, 'error': 'Not authenticated'}
        
        try:
            # Calculate timestamps
            if not from_date:
                from_timestamp = str(int((datetime.now() - timedelta(days=30)).timestamp()))
            else:
                from_timestamp = str(int(datetime.strptime(from_date, "%Y-%m-%d").timestamp()))
                
            if not to_date:
                # For partial candle handling, subtract 1 minute from current time
                current_time = datetime.now()
                if resolution in ['1', '2', '3', '5', '10', '15', '20', '30', '45', '60', '120', '180', '240']:
                    # For minute resolutions, subtract resolution minutes
                    minutes_to_subtract = int(resolution) if resolution.isdigit() else 1
                    adjusted_time = current_time - timedelta(minutes=minutes_to_subtract)
                else:
                    # For daily or other resolutions
                    adjusted_time = current_time - timedelta(days=1)
                to_timestamp = str(int(adjusted_time.timestamp()))
            else:
                to_timestamp = str(int(datetime.strptime(to_date, "%Y-%m-%d").timestamp()))
            
            data = {
                "symbol": symbol,
                "resolution": resolution,
                "date_format": "0",  # Use epoch format
                "range_from": from_timestamp,
                "range_to": to_timestamp,
                "cont_flag": "1"  # For continuous data
            }
            
            response = self.fyers.history(data=data)
            return {'success': True, 'data': response}
        except Exception as e:
            logger.error(f"Historical data error: {str(e)}")
            return {'success': False, 'error': str(e)}
    
    def get_quotes(self, symbols: List[str]) -> Dict[str, Any]:
        """Get real-time quotes for up to 50 symbols"""
        if not self.fyers:
            return {'success': False, 'error': 'Not authenticated'}
        
        try:
            # Limit to 50 symbols as per API documentation
            if len(symbols) > 50:
                symbols = symbols[:50]
                
            data = {"symbols": ",".join(symbols)}
            response = self.fyers.quotes(data=data)
            return {'success': True, 'data': response}
        except Exception as e:
            logger.error(f"Quotes error: {str(e)}")
            return {'success': False, 'error': str(e)}
    
    def place_order(self, symbol: str, qty: int, type: int, side: int, 
                   product_type: str = "INTRADAY", limit_price: float = 0.0) -> Dict[str, Any]:
        """Place an order"""
        if not self.fyers:
            return {'success': False, 'error': 'Not authenticated'}
        
        try:
            data = {
                "symbol": symbol,
                "qty": qty,
                "type": type,  # 1=Limit, 2=Market, 3=SL, 4=SL-M
                "side": side,  # 1=Buy, -1=Sell
                "productType": product_type,
                "limitPrice": limit_price,
                "stopPrice": 0,
                "validity": "DAY",
                "disclosedQty": 0,
                "offlineOrder": False,
                "stopLoss": 0,
                "takeProfit": 0
            }
            
            response = self.fyers.place_order(data)
            return {'success': True, 'data': response}
        except Exception as e:
            logger.error(f"Order placement error: {str(e)}")
            return {'success': False, 'error': str(e)}
    
    def get_orders(self, order_id: str = None, order_tag: str = None) -> Dict[str, Any]:
        """Get order book, optionally filtered by order ID or order tag"""
        if not self.fyers:
            return {'success': False, 'error': 'Not authenticated'}
        
        try:
            data = None
            if order_id:
                data = {"id": order_id}
            elif order_tag:
                data = {"orderTag": order_tag}
            
            response = self.fyers.orderbook(data=data)
            return {'success': True, 'data': response}
        except Exception as e:
            logger.error(f"Orders error: {str(e)}")
            return {'success': False, 'error': str(e)}
    
    def get_positions(self) -> Dict[str, Any]:
        """Get positions"""
        if not self.fyers:
            return {'success': False, 'error': 'Not authenticated'}
        
        try:
            response = self.fyers.positions()
            return {'success': True, 'data': response}
        except Exception as e:
            logger.error(f"Positions error: {str(e)}")
            return {'success': False, 'error': str(e)}
    
    def get_holdings(self) -> Dict[str, Any]:
        """Get holdings"""
        if not self.fyers:
            return {'success': False, 'error': 'Not authenticated'}
        
        try:
            response = self.fyers.holdings()
            return {'success': True, 'data': response}
        except Exception as e:
            logger.error(f"Holdings error: {str(e)}")
            return {'success': False, 'error': str(e)}
    
    def get_funds(self) -> Dict[str, Any]:
        """Get funds/balance"""
        if not self.fyers:
            return {'success': False, 'error': 'Not authenticated'}
        
        try:
            response = self.fyers.funds()
            return {'success': True, 'data': response}
        except Exception as e:
            logger.error(f"Funds error: {str(e)}")
            return {'success': False, 'error': str(e)}
    
    def get_market_status(self) -> Dict[str, Any]:
        """Get market status"""
        if not self.fyers:
            return {'success': False, 'error': 'Not authenticated'}
        
        try:
            response = self.fyers.market_status()
            return {'success': True, 'marketStatus': response.get('marketStatus', [])}
        except Exception as e:
            logger.error(f"Market status error: {str(e)}")
            return {'success': False, 'error': str(e)}
    
    def get_market_depth(self, symbol: str, ohlcv_flag: str = "1") -> Dict[str, Any]:
        """Get market depth for a symbol"""
        if not self.fyers:
            return {'success': False, 'error': 'Not authenticated'}
        
        try:
            data = {
                "symbol": symbol,
                "ohlcv_flag": ohlcv_flag
            }
            
            response = self.fyers.depth(data=data)
            return {'success': True, 'data': response}
        except Exception as e:
            logger.error(f"Market depth error: {str(e)}")
            return {'success': False, 'error': str(e)}
    
    def get_option_chain(self, symbol: str, strike_count: int = 5, timestamp: str = "") -> Dict[str, Any]:
        """Get option chain for a symbol"""
        if not self.fyers:
            return {'success': False, 'error': 'Not authenticated'}
        
        try:
            # Limit strike count to maximum 50 as per API documentation
            if strike_count > 50:
                strike_count = 50
                
            data = {
                "symbol": symbol,
                "strikecount": strike_count,
                "timestamp": timestamp
            }
            
            response = self.fyers.optionchain(data=data)
            return {'success': True, 'data': response}
        except Exception as e:
            logger.error(f"Option chain error: {str(e)}")
            return {'success': False, 'error': str(e)}
    
    def logout(self) -> Dict[str, Any]:
        """Logout from Fyers"""
        if not self.fyers:
            return {'success': False, 'error': 'Not authenticated'}
        
        try:
            response = self.fyers.logout()
            # Clear local session data
            self.access_token = None
            self.fyers = None
            return {'success': True, 'data': response}
        except Exception as e:
            logger.error(f"Logout error: {str(e)}")
            return {'success': False, 'error': str(e)}

# Global Fyers client instance
fyers_client = FyersClient()