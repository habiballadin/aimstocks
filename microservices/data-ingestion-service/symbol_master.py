import requests
import json
import os
import sys
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))
from shared.database import db
from typing import List, Dict

class SymbolMasterService:
    def __init__(self):
        self.symbol_urls = {
            "NSE_CD": "https://public.fyers.in/sym_details/NSE_CD_sym_master.json",
            "NSE_FO": "https://public.fyers.in/sym_details/NSE_FO_sym_master.json",
            "NSE_COM": "https://public.fyers.in/sym_details/NSE_COM_sym_master.json",
            "NSE_CM": "https://public.fyers.in/sym_details/NSE_CM_sym_master.json",
            "BSE_CM": "https://public.fyers.in/sym_details/BSE_CM_sym_master.json",
            "BSE_FO": "https://public.fyers.in/sym_details/BSE_FO_sym_master.json",
            "MCX_COM": "https://public.fyers.in/sym_details/MCX_COM_sym_master.json"
        }

    def get_db_connection(self):
        return db.get_connection()
    
    def fetch_symbols(self, exchange: str) -> List[Dict]:
        """Fetch symbols from Fyers symbol master"""
        if exchange not in self.symbol_urls:
            return []
        
        try:
            response = requests.get(self.symbol_urls[exchange])
            if response.status_code == 200:
                return response.json()
        except Exception as e:
            print(f"Error fetching {exchange}: {e}")
        
        return []
    
    def create_symbol_table(self):
        """Create symbol master table"""
        conn = self.get_db_connection()
        cursor = conn.cursor()

        cursor.execute("""
            CREATE TABLE IF NOT EXISTS symbol_master (
                symbol_ticker VARCHAR(50) PRIMARY KEY,
                fy_token VARCHAR(20),
                isin VARCHAR(20),
                ex_symbol VARCHAR(100),
                sym_details VARCHAR(200),
                exchange_id INT,
                segment INT,
                ex_sym_name VARCHAR(100),
                ex_token INT,
                ex_series VARCHAR(10),
                opt_type VARCHAR(5),
                under_sym VARCHAR(50),
                under_fy_tok VARCHAR(20),
                ex_inst_type INT,
                min_lot_size INT,
                tick_size DECIMAL(10,4),
                trading_session VARCHAR(50),
                last_update VARCHAR(20),
                expiry_date VARCHAR(20),
                strike_price DECIMAL(15,2),
                qty_freeze VARCHAR(20),
                trade_status INT,
                currency_code VARCHAR(10),
                upper_price DECIMAL(15,2),
                lower_price DECIMAL(15,2),
                face_value DECIMAL(15,2),
                qty_multiplier DECIMAL(10,2),
                previous_close DECIMAL(15,2),
                previous_oi DECIMAL(15,2),
                asm_gsm_val VARCHAR(50),
                exchange_name VARCHAR(20),
                symbol_desc VARCHAR(200),
                original_exp_date VARCHAR(20),
                is_mtf_tradable INT,
                mtf_margin DECIMAL(10,2),
                stream VARCHAR(20),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)

        conn.commit()
        db.pool.putconn(conn)
    
    def save_symbols(self, symbols: Dict, exchange: str):
        """Save symbols to database"""
        if not symbols:
            return

        conn = self.get_db_connection()
        cursor = conn.cursor()

        for ticker, data in symbols.items():
            cursor.execute("""
                INSERT INTO symbol_master
                (symbol_ticker, fy_token, isin, ex_symbol, sym_details, exchange_id,
                 segment, ex_sym_name, ex_token, ex_series, opt_type, under_sym,
                 under_fy_tok, ex_inst_type, min_lot_size, tick_size, trading_session,
                 last_update, expiry_date, strike_price, qty_freeze, trade_status,
                 currency_code, upper_price, lower_price, face_value, qty_multiplier,
                 previous_close, previous_oi, asm_gsm_val, exchange_name, symbol_desc,
                 original_exp_date, is_mtf_tradable, mtf_margin, stream)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                ON CONFLICT (symbol_ticker) DO UPDATE SET
                fy_token=EXCLUDED.fy_token, sym_details=EXCLUDED.sym_details,
                last_update=EXCLUDED.last_update, previous_close=EXCLUDED.previous_close
            """, (
                ticker, data.get('fyToken'), data.get('isin'), data.get('exSymbol'),
                data.get('symDetails'), data.get('exchange'), data.get('segment'),
                data.get('exSymName'), data.get('exToken'), data.get('exSeries'),
                data.get('optType'), data.get('underSym'), data.get('underFyTok'),
                data.get('exInstType'), data.get('minLotSize'), data.get('tickSize'),
                data.get('tradingSession'), data.get('lastUpdate'), data.get('expiryDate'),
                data.get('strikePrice'), data.get('qtyFreeze'), data.get('tradeStatus'),
                data.get('currencyCode'), data.get('upperPrice'), data.get('lowerPrice'),
                data.get('faceValue'), data.get('qtyMultiplier'), data.get('previousClose'),
                data.get('previousOi'), data.get('asmGsmVal'), data.get('exchangeName'),
                data.get('symbolDesc'), data.get('originalExpDate'), data.get('is_mtf_tradable'),
                data.get('mtf_margin'), data.get('stream')
            ))

        conn.commit()
        db.pool.putconn(conn)
    
    def update_all_symbols(self):
        """Update all exchange symbols"""
        self.create_symbol_table()
        
        for exchange in self.symbol_urls.keys():
            print(f"Fetching {exchange} symbols...")
            symbols = self.fetch_symbols(exchange)
            self.save_symbols(symbols, exchange)
            print(f"Saved {len(symbols)} symbols for {exchange}")
    
    def search_symbols(self, query: str, exchange: str = None, limit: int = 50):
        """Search symbols by name"""
        conn = self.get_db_connection()

        if exchange:
            sql = """
                SELECT * FROM symbol_master
                WHERE (sym_details LIKE %s OR symbol_ticker LIKE %s)
                AND exchange_name = %s
                LIMIT %s
            """
            cursor = conn.cursor()
            cursor.execute(sql, (f"%{query}%", f"%{query}%", exchange, limit))
        else:
            sql = """
                SELECT * FROM symbol_master
                WHERE sym_details LIKE %s OR symbol_ticker LIKE %s
                LIMIT %s
            """
            cursor = conn.cursor()
            cursor.execute(sql, (f"%{query}%", f"%{query}%", limit))

        result = cursor.fetchall()
        db.pool.putconn(conn)
        return result
    
    def get_popular_stocks(self):
        """Get popular NSE stocks"""
        conn = self.get_db_connection()

        popular_symbols = [
            "RELIANCE", "TCS", "HDFCBANK", "INFY", "ICICIBANK",
            "HINDUNILVR", "ITC", "SBIN", "BHARTIARTL", "KOTAKBANK"
        ]

        placeholders = ",".join(["%s"] * len(popular_symbols))
        sql = f"""
            SELECT * FROM symbol_master
            WHERE symbol_ticker IN ({placeholders})
            AND exchange_name = 'NSE'
            AND ex_series = 'EQ'
        """

        cursor = conn.cursor()
        cursor.execute(sql, popular_symbols)
        result = cursor.fetchall()
        db.pool.putconn(conn)
        return result
