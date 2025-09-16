from fyers_apiv3 import fyersModel
from typing import Dict, List, Optional, Any
import os
from datetime import datetime, timedelta
import logging
from dotenv import load_dotenv

logger = logging.getLogger(__name__)

class FyersClient:
    def __init__(self):
        load_dotenv()
        self.client_id = os.getenv('FYERS_CLIENT_ID')
        self.secret_key = os.getenv('FYERS_SECRET_KEY')
        self.redirect_uri = os.getenv('FYERS_REDIRECT_URI', 'http://127.0.0.1:5000/fyers/callback')
        self.access_token = None
        self.fyers = None
        
    def get_auth_url(self) -> str:
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
        if not self.fyers:
            return {'success': False, 'error': 'Not authenticated'}
        
        try:
            if not from_date:
                from_timestamp = str(int((datetime.now() - timedelta(days=30)).timestamp()))
            else:
                from_timestamp = str(int(datetime.strptime(from_date, "%Y-%m-%d").timestamp()))
                
            if not to_date:
                current_time = datetime.now()
                if resolution in ['1', '2', '3', '5', '10', '15', '20', '30', '45', '60', '120', '180', '240']:
                    minutes_to_subtract = int(resolution) if resolution.isdigit() else 1
                    adjusted_time = current_time - timedelta(minutes=minutes_to_subtract)
                else:
                    adjusted_time = current_time - timedelta(days=1)
                to_timestamp = str(int(adjusted_time.timestamp()))
            else:
                to_timestamp = str(int(datetime.strptime(to_date, "%Y-%m-%d").timestamp()))
            
            data = {
                "symbol": symbol,
                "resolution": resolution,
                "date_format": "0",
                "range_from": from_timestamp,
                "range_to": to_timestamp,
                "cont_flag": "1"
            }
            
            response = self.fyers.history(data=data)
            return {'success': True, 'data': response}
        except Exception as e:
            logger.error(f"Historical data error: {str(e)}")
            return {'success': False, 'error': str(e)}
    
    def get_quotes(self, symbols: List[str]) -> Dict[str, Any]:
        if not self.fyers:
            return {'success': False, 'error': 'Not authenticated'}
        
        try:
            if len(symbols) > 50:
                symbols = symbols[:50]
                
            data = {"symbols": ",".join(symbols)}
            response = self.fyers.quotes(data=data)
            return {'success': True, 'data': response}
        except Exception as e:
            logger.error(f"Quotes error: {str(e)}")
            return {'success': False, 'error': str(e)}
    
    def get_market_status(self) -> Dict[str, Any]:
        if not self.fyers:
            from datetime import datetime, time
            import pytz
            
            ist = pytz.timezone('Asia/Kolkata')
            now = datetime.now(ist)
            current_time = now.time()
            
            market_open = time(9, 15)
            market_close = time(15, 30)
            
            is_weekday = now.weekday() < 5
            
            if is_weekday and market_open <= current_time <= market_close:
                status = "OPEN"
            else:
                status = "CLOSED"
            
            return {
                "success": True,
                "marketStatus": [
                    {"exchange": 10, "segment": 10, "market_type": "NORMAL", "status": status},
                    {"exchange": 12, "segment": 10, "market_type": "NORMAL", "status": status}
                ]
            }
        
        try:
            response = self.fyers.market_status()
            return {'success': True, 'marketStatus': response.get('marketStatus', [])}
        except Exception as e:
            logger.error(f"Market status error: {str(e)}")
            return {'success': False, 'error': str(e)}
    
    def get_option_chain(self, symbol: str, strike_count: int = 5, timestamp: str = None) -> Dict[str, Any]:
        if not self.fyers:
            return {'success': False, 'error': 'Not authenticated'}

        try:
            data = {
                "symbol": symbol,
                "strikecount": strike_count
            }
            if timestamp:
                data["timestamp"] = timestamp

            response = self.fyers.optionchain(data=data)
            return {'success': True, 'data': response}
        except Exception as e:
            logger.error(f"Option chain error: {str(e)}")
            return {'success': False, 'error': str(e)}

    def get_funds(self) -> Dict[str, Any]:
        if not self.fyers:
            return {'success': False, 'error': 'Not authenticated'}

        try:
            response = self.fyers.funds()
            return {'success': True, 'data': response}
        except Exception as e:
            logger.error(f"Funds error: {str(e)}")
            return {'success': False, 'error': str(e)}

    def get_holdings(self) -> Dict[str, Any]:
        if not self.fyers:
            return {'success': False, 'error': 'Not authenticated'}

        try:
            response = self.fyers.holdings()
            return {'success': True, 'data': response}
        except Exception as e:
            logger.error(f"Holdings error: {str(e)}")
            return {'success': False, 'error': str(e)}
