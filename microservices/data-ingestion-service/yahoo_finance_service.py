import yfinance as yf
import pandas as pd
from datetime import datetime, timedelta
import psycopg2
import psycopg2.extras
import os
import logging
from typing import List, Dict, Any, Optional
import asyncio
import json

logger = logging.getLogger(__name__)

class YahooFinanceService:
    def __init__(self):
        self.db_config = {
            'host': os.getenv('DB_HOST', 'timescaledb'),
            'port': int(os.getenv('DB_PORT', 5432)),
            'user': os.getenv('DB_USER', 'apiuser'),
            'password': os.getenv('DB_PASSWORD', 'apipass'),
            'database': os.getenv('DB_NAME', 'stockmarket')
        }

        # Default symbols for Indian market
        self.default_symbols = [
            'RELIANCE.NS', 'TCS.NS', 'INFY.NS', 'HDFCBANK.NS', 'ICICIBANK.NS',
            'HINDUNILVR.NS', 'ITC.NS', 'KOTAKBANK.NS', 'LT.NS', 'AXISBANK.NS',
            'MARUTI.NS', 'BAJFINANCE.NS', 'BAJAJ-AUTO.NS', 'WIPRO.NS', 'ONGC.NS'
        ]

    def get_db_connection(self):
        """Get database connection"""
        return psycopg2.connect(**self.db_config)

    def get_symbols_from_master(self, limit: int = 100) -> List[str]:
        """Get symbols from symbol_master table and convert to Yahoo format"""
        conn = self.get_db_connection()
        try:
            with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cursor:
                cursor.execute("""
                    SELECT ex_symbol, exchange_name
                    FROM symbol_master
                    WHERE exchange_name = 'NSE' AND ex_series = 'EQ'
                    LIMIT %s
                """, (limit,))

                symbols = []
                for row in cursor.fetchall():
                    # Convert NSE format to Yahoo format
                    symbol = row['ex_symbol'].replace('NSE:', '').replace('-EQ', '.NS')
                    symbols.append(symbol)

                return symbols
        finally:
            conn.close()

    def fetch_historical_data(self, symbol: str, period: str = "1y", interval: str = "1d") -> pd.DataFrame:
        """Fetch historical data from Yahoo Finance"""
        try:
            ticker = yf.Ticker(symbol)
            data = ticker.history(period=period, interval=interval)

            if data.empty:
                logger.warning(f"No data found for {symbol}")
                return pd.DataFrame()

            # Reset index to make timestamp a column
            data = data.reset_index()

            # Add symbol column
            data['symbol'] = symbol.replace('.NS', '')

            # Rename columns to match our schema
            data = data.rename(columns={
                'Date': 'timestamp',
                'Open': 'open',
                'High': 'high',
                'Low': 'low',
                'Close': 'close',
                'Adj Close': 'adj_close',
                'Volume': 'volume'
            })

            # Convert timestamp to UTC
            data['timestamp'] = pd.to_datetime(data['timestamp'], utc=True)

            return data

        except Exception as e:
            logger.error(f"Error fetching historical data for {symbol}: {str(e)}")
            return pd.DataFrame()

    def fetch_dividends(self, symbol: str) -> pd.DataFrame:
        """Fetch dividend history from Yahoo Finance"""
        try:
            ticker = yf.Ticker(symbol)
            dividends = ticker.dividends

            if dividends.empty:
                return pd.DataFrame()

            dividends = dividends.reset_index()
            dividends['symbol'] = symbol.replace('.NS', '')

            # Rename columns
            dividends = dividends.rename(columns={
                'Date': 'ex_dividend_date',
                'Dividends': 'dividend_amount'
            })

            return dividends

        except Exception as e:
            logger.error(f"Error fetching dividends for {symbol}: {str(e)}")
            return pd.DataFrame()

    def fetch_splits(self, symbol: str) -> pd.DataFrame:
        """Fetch stock split history from Yahoo Finance"""
        try:
            ticker = yf.Ticker(symbol)
            splits = ticker.splits

            if splits.empty:
                return pd.DataFrame()

            splits = splits.reset_index()
            splits['symbol'] = symbol.replace('.NS', '')

            # Process split ratios
            splits_data = []
            for _, row in splits.iterrows():
                ratio = str(row['Stock Splits'])
                if ':' in ratio:
                    num, den = ratio.split(':')
                    numerator = int(num)
                    denominator = int(den)
                else:
                    numerator = int(float(ratio))
                    denominator = 1

                splits_data.append({
                    'symbol': row['symbol'],
                    'split_date': row['Date'].date(),
                    'split_ratio': ratio,
                    'numerator': numerator,
                    'denominator': denominator
                })

            return pd.DataFrame(splits_data)

        except Exception as e:
            logger.error(f"Error fetching splits for {symbol}: {str(e)}")
            return pd.DataFrame()

    def fetch_company_info(self, symbol: str) -> Dict[str, Any]:
        """Fetch company information from Yahoo Finance"""
        try:
            ticker = yf.Ticker(symbol)
            info = ticker.info

            if not info:
                return {}

            # Map Yahoo info to our schema
            company_data = {
                'symbol': symbol.replace('.NS', ''),
                'company_name': info.get('longName'),
                'sector': info.get('sector'),
                'industry': info.get('industry'),
                'country': info.get('country'),
                'website': info.get('website'),
                'business_summary': info.get('longBusinessSummary'),
                'market_cap': info.get('marketCap'),
                'enterprise_value': info.get('enterpriseValue'),
                'trailing_pe': info.get('trailingPE'),
                'forward_pe': info.get('forwardPE'),
                'peg_ratio': info.get('pegRatio'),
                'price_to_sales': info.get('priceToSalesTrailing12Months'),
                'price_to_book': info.get('priceToBook'),
                'enterprise_to_revenue': info.get('enterpriseToRevenue'),
                'enterprise_to_ebitda': info.get('enterpriseToEbitda'),
                'beta': info.get('beta'),
                'fifty_two_week_high': info.get('fiftyTwoWeekHigh'),
                'fifty_two_week_low': info.get('fiftyTwoWeekLow'),
                'fifty_day_moving_average': info.get('fiftyDayAverage'),
                'two_hundred_day_moving_average': info.get('twoHundredDayAverage'),
                'shares_outstanding': info.get('sharesOutstanding'),
                'shares_float': info.get('floatShares'),
                'percent_held_by_insiders': info.get('heldPercentInsiders'),
                'percent_held_by_institutions': info.get('heldPercentInstitutions'),
                'short_ratio': info.get('shortRatio'),
                'short_percent_of_float': info.get('shortPercentOfFloat'),
                'shares_short': info.get('sharesShort'),
                'book_value': info.get('bookValue'),
                'trailing_eps': info.get('trailingEps'),
                'forward_eps': info.get('forwardEps'),
                'last_dividend_value': info.get('lastDividendValue'),
                'last_dividend_date': info.get('lastDividendDate'),
                'dividend_yield': info.get('dividendYield'),
                'five_year_avg_dividend_yield': info.get('fiveYearAvgDividendYield'),
                'payout_ratio': info.get('payoutRatio'),
                'currency': info.get('currency', 'INR')
            }

            return company_data

        except Exception as e:
            logger.error(f"Error fetching company info for {symbol}: {str(e)}")
            return {}

    def fetch_earnings(self, symbol: str) -> List[Dict[str, Any]]:
        """Fetch earnings data from Yahoo Finance"""
        try:
            ticker = yf.Ticker(symbol)
            earnings = ticker.earnings_history

            if earnings is None or earnings.empty:
                return []

            earnings_data = []
            for _, row in earnings.iterrows():
                earnings_data.append({
                    'symbol': symbol.replace('.NS', ''),
                    'quarter': row.get('Quarter'),
                    'year': row.get('Year'),
                    'eps_estimate': row.get('Estimate'),
                    'eps_actual': row.get('Actual'),
                    'eps_difference': row.get('Difference'),
                    'surprise_percent': row.get('Surprise(%)'),
                    'earnings_date': row.get('Earnings Date')
                })

            return earnings_data

        except Exception as e:
            logger.error(f"Error fetching earnings for {symbol}: {str(e)}")
            return []

    def fetch_financial_statements(self, symbol: str) -> Dict[str, Any]:
        """Fetch financial statements (income statement, balance sheet, cash flow)"""
        try:
            ticker = yf.Ticker(symbol)

            financial_data = {
                'income_statement': [],
                'balance_sheet': [],
                'cash_flow': []
            }

            # Income Statement
            try:
                income_stmt = ticker.income_stmt
                if income_stmt is not None and not income_stmt.empty:
                    for period in income_stmt.columns:
                        year = period.year
                        period_type = 'annual'
                        row_data = {
                            'symbol': symbol.replace('.NS', ''),
                            'fiscal_year': year,
                            'period_type': period_type,
                            'total_revenue': income_stmt.loc['Total Revenue', period] if 'Total Revenue' in income_stmt.index else None,
                            'cost_of_revenue': income_stmt.loc['Cost Of Revenue', period] if 'Cost Of Revenue' in income_stmt.index else None,
                            'gross_profit': income_stmt.loc['Gross Profit', period] if 'Gross Profit' in income_stmt.index else None,
                            'operating_expense': income_stmt.loc['Operating Expense', period] if 'Operating Expense' in income_stmt.index else None,
                            'operating_income': income_stmt.loc['Operating Income', period] if 'Operating Income' in income_stmt.index else None,
                            'net_income': income_stmt.loc['Net Income', period] if 'Net Income' in income_stmt.index else None,
                            'ebit': income_stmt.loc['EBIT', period] if 'EBIT' in income_stmt.index else None,
                            'ebitda': income_stmt.loc['EBITDA', period] if 'EBITDA' in income_stmt.index else None,
                            'interest_expense': income_stmt.loc['Interest Expense', period] if 'Interest Expense' in income_stmt.index else None,
                            'income_before_tax': income_stmt.loc['Pretax Income', period] if 'Pretax Income' in income_stmt.index else None,
                            'income_tax_expense': income_stmt.loc['Tax Provision', period] if 'Tax Provision' in income_stmt.index else None,
                            'research_development': income_stmt.loc['Research And Development', period] if 'Research And Development' in income_stmt.index else None,
                            'selling_general_admin': income_stmt.loc['Selling General And Administration', period] if 'Selling General And Administration' in income_stmt.index else None
                        }
                        financial_data['income_statement'].append(row_data)
            except Exception as e:
                logger.warning(f"Error fetching income statement for {symbol}: {str(e)}")

            # Balance Sheet
            try:
                balance_sheet = ticker.balance_sheet
                if balance_sheet is not None and not balance_sheet.empty:
                    for period in balance_sheet.columns:
                        year = period.year
                        period_type = 'annual'
                        row_data = {
                            'symbol': symbol.replace('.NS', ''),
                            'fiscal_year': year,
                            'period_type': period_type,
                            'total_assets': balance_sheet.loc['Total Assets', period] if 'Total Assets' in balance_sheet.index else None,
                            'current_assets': balance_sheet.loc['Current Assets', period] if 'Current Assets' in balance_sheet.index else None,
                            'cash': balance_sheet.loc['Cash And Cash Equivalents', period] if 'Cash And Cash Equivalents' in balance_sheet.index else None,
                            'total_liabilities': balance_sheet.loc['Total Liabilities Net Minority Interest', period] if 'Total Liabilities Net Minority Interest' in balance_sheet.index else None,
                            'current_liabilities': balance_sheet.loc['Current Liabilities', period] if 'Current Liabilities' in balance_sheet.index else None,
                            'total_stockholder_equity': balance_sheet.loc['Total Equity Gross Minority Interest', period] if 'Total Equity Gross Minority Interest' in balance_sheet.index else None,
                            'retained_earnings': balance_sheet.loc['Retained Earnings', period] if 'Retained Earnings' in balance_sheet.index else None,
                            'property_plant_equipment': balance_sheet.loc['Property Plant And Equipment Net', period] if 'Property Plant And Equipment Net' in balance_sheet.index else None,
                            'net_receivables': balance_sheet.loc['Receivables', period] if 'Receivables' in balance_sheet.index else None,
                            'inventory': balance_sheet.loc['Inventory', period] if 'Inventory' in balance_sheet.index else None,
                            'accounts_payable': balance_sheet.loc['Payables', period] if 'Payables' in balance_sheet.index else None
                        }
                        financial_data['balance_sheet'].append(row_data)
            except Exception as e:
                logger.warning(f"Error fetching balance sheet for {symbol}: {str(e)}")

            # Cash Flow Statement
            try:
                cash_flow = ticker.cash_flow
                if cash_flow is not None and not cash_flow.empty:
                    for period in cash_flow.columns:
                        year = period.year
                        period_type = 'annual'
                        row_data = {
                            'symbol': symbol.replace('.NS', ''),
                            'fiscal_year': year,
                            'period_type': period_type,
                            'operating_cash_flow': cash_flow.loc['Operating Cash Flow', period] if 'Operating Cash Flow' in cash_flow.index else None,
                            'investing_cash_flow': cash_flow.loc['Investing Cash Flow', period] if 'Investing Cash Flow' in cash_flow.index else None,
                            'financing_cash_flow': cash_flow.loc['Financing Cash Flow', period] if 'Financing Cash Flow' in cash_flow.index else None,
                            'net_income': cash_flow.loc['Net Income', period] if 'Net Income' in cash_flow.index else None,
                            'depreciation': cash_flow.loc['Depreciation', period] if 'Depreciation' in cash_flow.index else None,
                            'change_in_receivables': cash_flow.loc['Change In Receivables', period] if 'Change In Receivables' in cash_flow.index else None,
                            'change_in_liabilities': cash_flow.loc['Change In Payables And Accrued Expense', period] if 'Change In Payables And Accrued Expense' in cash_flow.index else None,
                            'change_in_inventory': cash_flow.loc['Change In Inventory', period] if 'Change In Inventory' in cash_flow.index else None,
                            'capital_expenditures': cash_flow.loc['Capital Expenditure', period] if 'Capital Expenditure' in cash_flow.index else None,
                            'dividends_paid': cash_flow.loc['Dividends Paid', period] if 'Dividends Paid' in cash_flow.index else None
                        }
                        financial_data['cash_flow'].append(row_data)
            except Exception as e:
                logger.warning(f"Error fetching cash flow for {symbol}: {str(e)}")

            return financial_data

        except Exception as e:
            logger.error(f"Error fetching financial statements for {symbol}: {str(e)}")
            return {'income_statement': [], 'balance_sheet': [], 'cash_flow': []}

    def fetch_options_data(self, symbol: str) -> List[Dict[str, Any]]:
        """Fetch options data from Yahoo Finance"""
        try:
            ticker = yf.Ticker(symbol)
            options = ticker.options

            if not options:
                return []

            options_data = []
            for expiration_date in options[:5]:  # Limit to first 5 expiration dates
                try:
                    opt = ticker.option_chain(expiration_date)

                    # Calls
                    if opt.calls is not None and not opt.calls.empty:
                        for _, row in opt.calls.iterrows():
                            options_data.append({
                                'symbol': symbol.replace('.NS', ''),
                                'option_symbol': row.get('contractSymbol'),
                                'strike': row.get('strike'),
                                'last_price': row.get('lastPrice'),
                                'bid': row.get('bid'),
                                'ask': row.get('ask'),
                                'change': row.get('change'),
                                'change_percent': row.get('percentChange'),
                                'volume': row.get('volume'),
                                'open_interest': row.get('openInterest'),
                                'implied_volatility': row.get('impliedVolatility'),
                                'in_the_money': row.get('inTheMoney'),
                                'option_type': 'CALL',
                                'expiration_date': expiration_date,
                                'data_date': datetime.now().date()
                            })

                    # Puts
                    if opt.puts is not None and not opt.puts.empty:
                        for _, row in opt.puts.iterrows():
                            options_data.append({
                                'symbol': symbol.replace('.NS', ''),
                                'option_symbol': row.get('contractSymbol'),
                                'strike': row.get('strike'),
                                'last_price': row.get('lastPrice'),
                                'bid': row.get('bid'),
                                'ask': row.get('ask'),
                                'change': row.get('change'),
                                'change_percent': row.get('percentChange'),
                                'volume': row.get('volume'),
                                'open_interest': row.get('openInterest'),
                                'implied_volatility': row.get('impliedVolatility'),
                                'in_the_money': row.get('inTheMoney'),
                                'option_type': 'PUT',
                                'expiration_date': expiration_date,
                                'data_date': datetime.now().date()
                            })

                except Exception as e:
                    logger.warning(f"Error fetching options for {symbol} exp {expiration_date}: {str(e)}")
                    continue

            return options_data

        except Exception as e:
            logger.error(f"Error fetching options data for {symbol}: {str(e)}")
            return []

    def fetch_analyst_recommendations(self, symbol: str) -> List[Dict[str, Any]]:
        """Fetch analyst recommendations from Yahoo Finance"""
        try:
            ticker = yf.Ticker(symbol)
            recommendations = ticker.recommendations

            if recommendations is None or recommendations.empty:
                return []

            # Group by period and aggregate
            rec_data = []
            for period in recommendations['period'].unique():
                period_data = recommendations[recommendations['period'] == period]
                rec_data.append({
                    'symbol': symbol.replace('.NS', ''),
                    'period': period,
                    'strong_buy': (period_data['strongBuy'] == 'strongBuy').sum(),
                    'buy': (period_data['buy'] == 'buy').sum(),
                    'hold': (period_data['hold'] == 'hold').sum(),
                    'sell': (period_data['sell'] == 'sell').sum(),
                    'strong_sell': (period_data['strongSell'] == 'strongSell').sum(),
                    'total_ratings': len(period_data),
                    'average_rating': period_data['ratingScore'].mean() if 'ratingScore' in period_data.columns else None,
                    'data_date': datetime.now().date()
                })

            return rec_data

        except Exception as e:
            logger.error(f"Error fetching analyst recommendations for {symbol}: {str(e)}")
            return []

    def fetch_institutional_holders(self, symbol: str) -> List[Dict[str, Any]]:
        """Fetch institutional holdings from Yahoo Finance"""
        try:
            ticker = yf.Ticker(symbol)
            holders = ticker.institutional_holders

            if holders is None or holders.empty:
                return []

            holders_data = []
            for _, row in holders.iterrows():
                holders_data.append({
                    'symbol': symbol.replace('.NS', ''),
                    'holder_name': row.get('Holder'),
                    'shares_held': row.get('Shares'),
                    'shares_change': row.get('SharesChange'),
                    'percent_held': row.get('pctHeld'),
                    'value_held': row.get('Value'),
                    'date_reported': row.get('Date Reported')
                })

            return holders_data

        except Exception as e:
            logger.error(f"Error fetching institutional holders for {symbol}: {str(e)}")
            return []

    def fetch_insider_transactions(self, symbol: str) -> List[Dict[str, Any]]:
        """Fetch insider transactions from Yahoo Finance"""
        try:
            ticker = yf.Ticker(symbol)
            insiders = ticker.insider_transactions

            if insiders is None or insiders.empty:
                return []

            insider_data = []
            for _, row in insiders.iterrows():
                insider_data.append({
                    'symbol': symbol.replace('.NS', ''),
                    'insider_name': row.get('Insider Name'),
                    'relation': row.get('Position'),
                    'transaction_date': row.get('Transaction Date'),
                    'transaction_type': row.get('Transaction Type'),
                    'owner_type': row.get('Owner Type'),
                    'shares_traded': row.get('Shares Traded'),
                    'last_price': row.get('Last Price'),
                    'shares_held': row.get('Shares Held')
                })

            return insider_data

        except Exception as e:
            logger.error(f"Error fetching insider transactions for {symbol}: {str(e)}")
            return []

    def fetch_news(self, symbol: str) -> List[Dict[str, Any]]:
        """Fetch news articles from Yahoo Finance"""
        try:
            ticker = yf.Ticker(symbol)
            news = ticker.news

            if not news:
                return []

            news_data = []
            for article in news:
                news_data.append({
                    'symbol': symbol.replace('.NS', ''),
                    'title': article.get('title'),
                    'publisher': article.get('publisher'),
                    'link': article.get('link'),
                    'provider_publish_time': datetime.fromtimestamp(article.get('providerPublishTime', 0), tz=datetime.timezone.utc) if article.get('providerPublishTime') else None,
                    'type': article.get('type'),
                    'related_tickers': article.get('relatedTickers', []),
                    'summary': article.get('summary'),
                    'thumbnail_url': article.get('thumbnail', {}).get('resolutions', [{}])[0].get('url') if article.get('thumbnail') else None
                })

            return news_data

        except Exception as e:
            logger.error(f"Error fetching news for {symbol}: {str(e)}")
            return []

    def save_historical_data(self, data: pd.DataFrame, interval: str = "1d"):
        """Save historical data to database"""
        if data.empty:
            return 0

        conn = self.get_db_connection()
        try:
            with conn.cursor() as cursor:
                records = 0
                for _, row in data.iterrows():
                    cursor.execute("""
                        INSERT INTO yahoo_historical_data
                        (timestamp, symbol, interval, open, high, low, close, adj_close, volume)
                        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
                        ON CONFLICT (symbol, timestamp, interval) DO UPDATE SET
                        open = EXCLUDED.open,
                        high = EXCLUDED.high,
                        low = EXCLUDED.low,
                        close = EXCLUDED.close,
                        adj_close = EXCLUDED.adj_close,
                        volume = EXCLUDED.volume,
                        updated_at = CURRENT_TIMESTAMP
                    """, (
                        row['timestamp'], row['symbol'], interval,
                        row.get('open'), row.get('high'), row.get('low'),
                        row.get('close'), row.get('adj_close'), row.get('volume')
                    ))
                    records += 1

                conn.commit()
                return records

        except Exception as e:
            conn.rollback()
            logger.error(f"Error saving historical data: {str(e)}")
            raise
        finally:
            conn.close()

    def save_dividends(self, data: pd.DataFrame):
        """Save dividend data to database"""
        if data.empty:
            return 0

        conn = self.get_db_connection()
        try:
            with conn.cursor() as cursor:
                records = 0
                for _, row in data.iterrows():
                    cursor.execute("""
                        INSERT INTO yahoo_dividends
                        (symbol, ex_dividend_date, dividend_amount)
                        VALUES (%s, %s, %s)
                        ON CONFLICT (symbol, ex_dividend_date) DO UPDATE SET
                        dividend_amount = EXCLUDED.dividend_amount,
                        updated_at = CURRENT_TIMESTAMP
                    """, (
                        row['symbol'], row['ex_dividend_date'], row['dividend_amount']
                    ))
                    records += 1

                conn.commit()
                return records

        except Exception as e:
            conn.rollback()
            logger.error(f"Error saving dividend data: {str(e)}")
            raise
        finally:
            conn.close()

    def save_splits(self, data: pd.DataFrame):
        """Save stock split data to database"""
        if data.empty:
            return 0

        conn = self.get_db_connection()
        try:
            with conn.cursor() as cursor:
                records = 0
                for _, row in data.iterrows():
                    cursor.execute("""
                        INSERT INTO yahoo_stock_splits
                        (symbol, split_date, split_ratio, numerator, denominator)
                        VALUES (%s, %s, %s, %s, %s)
                        ON CONFLICT (symbol, split_date) DO UPDATE SET
                        split_ratio = EXCLUDED.split_ratio,
                        numerator = EXCLUDED.numerator,
                        denominator = EXCLUDED.denominator,
                        updated_at = CURRENT_TIMESTAMP
                    """, (
                        row['symbol'], row['split_date'], row['split_ratio'],
                        row['numerator'], row['denominator']
                    ))
                    records += 1

                conn.commit()
                return records

        except Exception as e:
            conn.rollback()
            logger.error(f"Error saving split data: {str(e)}")
            raise
        finally:
            conn.close()

    def save_company_info(self, data: Dict[str, Any]):
        """Save company information to database"""
        if not data:
            return 0

        conn = self.get_db_connection()
        try:
            with conn.cursor() as cursor:
                cursor.execute("""
                    INSERT INTO yahoo_company_info
                    (symbol, company_name, sector, industry, country, website, business_summary,
                     market_cap, enterprise_value, trailing_pe, forward_pe, peg_ratio,
                     price_to_sales, price_to_book, enterprise_to_revenue, enterprise_to_ebitda,
                     beta, fifty_two_week_high, fifty_two_week_low, fifty_day_moving_average,
                     two_hundred_day_moving_average, shares_outstanding, shares_float,
                     percent_held_by_insiders, percent_held_by_institutions, short_ratio,
                     short_percent_of_float, shares_short, book_value, price_to_book,
                     trailing_eps, forward_eps, last_dividend_value, last_dividend_date,
                     dividend_yield, five_year_avg_dividend_yield, payout_ratio, currency)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s,
                            %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s,
                            %s, %s, %s, %s, %s, %s)
                    ON CONFLICT (symbol) DO UPDATE SET
                    company_name = EXCLUDED.company_name,
                    sector = EXCLUDED.sector,
                    industry = EXCLUDED.industry,
                    market_cap = EXCLUDED.market_cap,
                    trailing_pe = EXCLUDED.trailing_pe,
                    dividend_yield = EXCLUDED.dividend_yield,
                    fifty_two_week_high = EXCLUDED.fifty_two_week_high,
                    fifty_two_week_low = EXCLUDED.fifty_two_week_low,
                    last_updated = CURRENT_TIMESTAMP,
                    updated_at = CURRENT_TIMESTAMP
                """, (
                    data.get('symbol'), data.get('company_name'), data.get('sector'),
                    data.get('industry'), data.get('country'), data.get('website'),
                    data.get('business_summary'), data.get('market_cap'), data.get('enterprise_value'),
                    data.get('trailing_pe'), data.get('forward_pe'), data.get('peg_ratio'),
                    data.get('price_to_sales'), data.get('price_to_book'), data.get('enterprise_to_revenue'),
                    data.get('enterprise_to_ebitda'), data.get('beta'), data.get('fifty_two_week_high'),
                    data.get('fifty_two_week_low'), data.get('fifty_day_moving_average'),
                    data.get('two_hundred_day_moving_average'), data.get('shares_outstanding'),
                    data.get('shares_float'), data.get('percent_held_by_insiders'),
                    data.get('percent_held_by_institutions'), data.get('short_ratio'),
                    data.get('short_percent_of_float'), data.get('shares_short'), data.get('book_value'),
                    data.get('price_to_book'), data.get('trailing_eps'), data.get('forward_eps'),
                    data.get('last_dividend_value'), data.get('last_dividend_date'),
                    data.get('dividend_yield'), data.get('five_year_avg_dividend_yield'),
                    data.get('payout_ratio'), data.get('currency')
                ))

                conn.commit()
                return 1

        except Exception as e:
            conn.rollback()
            logger.error(f"Error saving company info: {str(e)}")
            raise
        finally:
            conn.close()

    def save_earnings(self, data: List[Dict[str, Any]]):
        """Save earnings data to database"""
        if not data:
            return 0

        conn = self.get_db_connection()
        try:
            with conn.cursor() as cursor:
                records = 0
                for item in data:
                    cursor.execute("""
                        INSERT INTO yahoo_earnings
                        (symbol, quarter, year, eps_estimate, eps_actual, eps_difference,
                         surprise_percent, earnings_date)
                        VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                        ON CONFLICT (symbol, quarter, year) DO UPDATE SET
                        eps_estimate = EXCLUDED.eps_estimate,
                        eps_actual = EXCLUDED.eps_actual,
                        eps_difference = EXCLUDED.eps_difference,
                        surprise_percent = EXCLUDED.surprise_percent,
                        earnings_date = EXCLUDED.earnings_date,
                        updated_at = CURRENT_TIMESTAMP
                    """, (
                        item.get('symbol'), item.get('quarter'), item.get('year'),
                        item.get('eps_estimate'), item.get('eps_actual'), item.get('eps_difference'),
                        item.get('surprise_percent'), item.get('earnings_date')
                    ))
                    records += 1

                conn.commit()
                return records

        except Exception as e:
            conn.rollback()
            logger.error(f"Error saving earnings data: {str(e)}")
            raise
        finally:
            conn.close()

    def save_news(self, data: List[Dict[str, Any]]):
        """Save news data to database"""
        if not data:
            return 0

        conn = self.get_db_connection()
        try:
            with conn.cursor() as cursor:
                records = 0
                for item in data:
                    cursor.execute("""
                        INSERT INTO yahoo_news
                        (symbol, title, publisher, link, provider_publish_time, type,
                         related_tickers, summary, thumbnail_url)
                        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
                        ON CONFLICT (link) DO NOTHING
                    """, (
                        item.get('symbol'), item.get('title'), item.get('publisher'),
                        item.get('link'), item.get('provider_publish_time'), item.get('type'),
                        item.get('related_tickers'), item.get('summary'), item.get('thumbnail_url')
                    ))
                    records += 1

                conn.commit()
                return records

        except Exception as e:
            conn.rollback()
            logger.error(f"Error saving news data: {str(e)}")
            raise
        finally:
            conn.close()

    def save_financial_statements(self, data: Dict[str, Any]):
        """Save financial statements to database"""
        records_saved = {'income_statement': 0, 'balance_sheet': 0, 'cash_flow': 0}

        conn = self.get_db_connection()
        try:
            with conn.cursor() as cursor:
                # Income Statement
                for item in data.get('income_statement', []):
                    cursor.execute("""
                        INSERT INTO yahoo_income_statement
                        (symbol, fiscal_year, period_type, total_revenue, cost_of_revenue,
                         gross_profit, operating_expense, operating_income, net_income,
                         ebit, ebitda, interest_expense, income_before_tax, income_tax_expense,
                         research_development, selling_general_admin)
                        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                        ON CONFLICT (symbol, fiscal_year, period_type) DO UPDATE SET
                        total_revenue = EXCLUDED.total_revenue,
                        cost_of_revenue = EXCLUDED.cost_of_revenue,
                        gross_profit = EXCLUDED.gross_profit,
                        operating_expense = EXCLUDED.operating_expense,
                        operating_income = EXCLUDED.operating_income,
                        net_income = EXCLUDED.net_income,
                        ebit = EXCLUDED.ebit,
                        ebitda = EXCLUDED.ebitda,
                        interest_expense = EXCLUDED.interest_expense,
                        income_before_tax = EXCLUDED.income_before_tax,
                        income_tax_expense = EXCLUDED.income_tax_expense,
                        research_development = EXCLUDED.research_development,
                        selling_general_admin = EXCLUDED.selling_general_admin,
                        updated_at = CURRENT_TIMESTAMP
                    """, (
                        item.get('symbol'), item.get('fiscal_year'), item.get('period_type'),
                        item.get('total_revenue'), item.get('cost_of_revenue'), item.get('gross_profit'),
                        item.get('operating_expense'), item.get('operating_income'), item.get('net_income'),
                        item.get('ebit'), item.get('ebitda'), item.get('interest_expense'),
                        item.get('income_before_tax'), item.get('income_tax_expense'),
                        item.get('research_development'), item.get('selling_general_admin')
                    ))
                    records_saved['income_statement'] += 1

                # Balance Sheet
                for item in data.get('balance_sheet', []):
                    cursor.execute("""
                        INSERT INTO yahoo_balance_sheet
                        (symbol, fiscal_year, period_type, total_assets, current_assets, cash,
                         total_liabilities, current_liabilities, total_stockholder_equity,
                         retained_earnings, property_plant_equipment, net_receivables,
                         inventory, accounts_payable)
                        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                        ON CONFLICT (symbol, fiscal_year, period_type) DO UPDATE SET
                        total_assets = EXCLUDED.total_assets,
                        current_assets = EXCLUDED.current_assets,
                        cash = EXCLUDED.cash,
                        total_liabilities = EXCLUDED.total_liabilities,
                        current_liabilities = EXCLUDED.current_liabilities,
                        total_stockholder_equity = EXCLUDED.total_stockholder_equity,
                        retained_earnings = EXCLUDED.retained_earnings,
                        property_plant_equipment = EXCLUDED.property_plant_equipment,
                        net_receivables = EXCLUDED.net_receivables,
                        inventory = EXCLUDED.inventory,
                        accounts_payable = EXCLUDED.accounts_payable,
                        updated_at = CURRENT_TIMESTAMP
                    """, (
                        item.get('symbol'), item.get('fiscal_year'), item.get('period_type'),
                        item.get('total_assets'), item.get('current_assets'), item.get('cash'),
                        item.get('total_liabilities'), item.get('current_liabilities'),
                        item.get('total_stockholder_equity'), item.get('retained_earnings'),
                        item.get('property_plant_equipment'), item.get('net_receivables'),
                        item.get('inventory'), item.get('accounts_payable')
                    ))
                    records_saved['balance_sheet'] += 1

                # Cash Flow
                for item in data.get('cash_flow', []):
                    cursor.execute("""
                        INSERT INTO yahoo_cash_flow
                        (symbol, fiscal_year, period_type, operating_cash_flow, investing_cash_flow,
                         financing_cash_flow, net_income, depreciation, change_in_receivables,
                         change_in_liabilities, change_in_inventory, capital_expenditures, dividends_paid)
                        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                        ON CONFLICT (symbol, fiscal_year, period_type) DO UPDATE SET
                        operating_cash_flow = EXCLUDED.operating_cash_flow,
                        investing_cash_flow = EXCLUDED.investing_cash_flow,
                        financing_cash_flow = EXCLUDED.financing_cash_flow,
                        net_income = EXCLUDED.net_income,
                        depreciation = EXCLUDED.depreciation,
                        change_in_receivables = EXCLUDED.change_in_receivables,
                        change_in_liabilities = EXCLUDED.change_in_liabilities,
                        change_in_inventory = EXCLUDED.change_in_inventory,
                        capital_expenditures = EXCLUDED.capital_expenditures,
                        dividends_paid = EXCLUDED.dividends_paid,
                        updated_at = CURRENT_TIMESTAMP
                    """, (
                        item.get('symbol'), item.get('fiscal_year'), item.get('period_type'),
                        item.get('operating_cash_flow'), item.get('investing_cash_flow'),
                        item.get('financing_cash_flow'), item.get('net_income'), item.get('depreciation'),
                        item.get('change_in_receivables'), item.get('change_in_liabilities'),
                        item.get('change_in_inventory'), item.get('capital_expenditures'),
                        item.get('dividends_paid')
                    ))
                    records_saved['cash_flow'] += 1

                conn.commit()
                return records_saved

        except Exception as e:
            conn.rollback()
            logger.error(f"Error saving financial statements: {str(e)}")
            raise
        finally:
            conn.close()

    def save_options_data(self, data: List[Dict[str, Any]]):
        """Save options data to database"""
        if not data:
            return 0

        conn = self.get_db_connection()
        try:
            with conn.cursor() as cursor:
                records = 0
                for item in data:
                    cursor.execute("""
                        INSERT INTO yahoo_options_data
                        (symbol, option_symbol, strike, last_price, bid, ask, change,
                         change_percent, volume, open_interest, implied_volatility,
                         in_the_money, option_type, expiration_date, data_date)
                        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                        ON CONFLICT (option_symbol, data_date) DO UPDATE SET
                        last_price = EXCLUDED.last_price,
                        bid = EXCLUDED.bid,
                        ask = EXCLUDED.ask,
                        change = EXCLUDED.change,
                        change_percent = EXCLUDED.change_percent,
                        volume = EXCLUDED.volume,
                        open_interest = EXCLUDED.open_interest,
                        implied_volatility = EXCLUDED.implied_volatility,
                        in_the_money = EXCLUDED.in_the_money,
                        updated_at = CURRENT_TIMESTAMP
                    """, (
                        item.get('symbol'), item.get('option_symbol'), item.get('strike'),
                        item.get('last_price'), item.get('bid'), item.get('ask'), item.get('change'),
                        item.get('change_percent'), item.get('volume'), item.get('open_interest'),
                        item.get('implied_volatility'), item.get('in_the_money'), item.get('option_type'),
                        item.get('expiration_date'), item.get('data_date')
                    ))
                    records += 1

                conn.commit()
                return records

        except Exception as e:
            conn.rollback()
            logger.error(f"Error saving options data: {str(e)}")
            raise
        finally:
            conn.close()

    def save_analyst_recommendations(self, data: List[Dict[str, Any]]):
        """Save analyst recommendations to database"""
        if not data:
            return 0

        conn = self.get_db_connection()
        try:
            with conn.cursor() as cursor:
                records = 0
                for item in data:
                    cursor.execute("""
                        INSERT INTO yahoo_analyst_recommendations
                        (symbol, period, strong_buy, buy, hold, sell, strong_sell,
                         total_ratings, average_rating, data_date)
                        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                        ON CONFLICT (symbol, period, data_date) DO UPDATE SET
                        strong_buy = EXCLUDED.strong_buy,
                        buy = EXCLUDED.buy,
                        hold = EXCLUDED.hold,
                        sell = EXCLUDED.sell,
                        strong_sell = EXCLUDED.strong_sell,
                        total_ratings = EXCLUDED.total_ratings,
                        average_rating = EXCLUDED.average_rating,
                        updated_at = CURRENT_TIMESTAMP
                    """, (
                        item.get('symbol'), item.get('period'), item.get('strong_buy'),
                        item.get('buy'), item.get('hold'), item.get('sell'), item.get('strong_sell'),
                        item.get('total_ratings'), item.get('average_rating'), item.get('data_date')
                    ))
                    records += 1

                conn.commit()
                return records

        except Exception as e:
            conn.rollback()
            logger.error(f"Error saving analyst recommendations: {str(e)}")
            raise
        finally:
            conn.close()

    def save_institutional_holders(self, data: List[Dict[str, Any]]):
        """Save institutional holdings to database"""
        if not data:
            return 0

        conn = self.get_db_connection()
        try:
            with conn.cursor() as cursor:
                records = 0
                for item in data:
                    cursor.execute("""
                        INSERT INTO yahoo_institutional_holders
                        (symbol, holder_name, shares_held, shares_change, percent_held,
                         value_held, date_reported)
                        VALUES (%s, %s, %s, %s, %s, %s, %s)
                        ON CONFLICT (symbol, holder_name, date_reported) DO UPDATE SET
                        shares_held = EXCLUDED.shares_held,
                        shares_change = EXCLUDED.shares_change,
                        percent_held = EXCLUDED.percent_held,
                        value_held = EXCLUDED.value_held,
                        updated_at = CURRENT_TIMESTAMP
                    """, (
                        item.get('symbol'), item.get('holder_name'), item.get('shares_held'),
                        item.get('shares_change'), item.get('percent_held'), item.get('value_held'),
                        item.get('date_reported')
                    ))
                    records += 1

                conn.commit()
                return records

        except Exception as e:
            conn.rollback()
            logger.error(f"Error saving institutional holders: {str(e)}")
            raise
        finally:
            conn.close()

    def save_insider_transactions(self, data: List[Dict[str, Any]]):
        """Save insider transactions to database"""
        if not data:
            return 0

        conn = self.get_db_connection()
        try:
            with conn.cursor() as cursor:
                records = 0
                for item in data:
                    cursor.execute("""
                        INSERT INTO yahoo_insider_transactions
                        (symbol, insider_name, relation, transaction_date, transaction_type,
                         owner_type, shares_traded, last_price, shares_held)
                        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
                        ON CONFLICT (symbol, insider_name, transaction_date, transaction_type) DO UPDATE SET
                        owner_type = EXCLUDED.owner_type,
                        shares_traded = EXCLUDED.shares_traded,
                        last_price = EXCLUDED.last_price,
                        shares_held = EXCLUDED.shares_held,
                        updated_at = CURRENT_TIMESTAMP
                    """, (
                        item.get('symbol'), item.get('insider_name'), item.get('relation'),
                        item.get('transaction_date'), item.get('transaction_type'), item.get('owner_type'),
                        item.get('shares_traded'), item.get('last_price'), item.get('shares_held')
                    ))
                    records += 1

                conn.commit()
                return records

        except Exception as e:
            conn.rollback()
            logger.error(f"Error saving insider transactions: {str(e)}")
            raise
        finally:
            conn.close()

    def log_ingestion(self, symbol: str, data_type: str, records_processed: int,
                     status: str = "success", error_message: str = None,
                     execution_time: float = None, interval: str = None,
                     start_date: datetime = None, end_date: datetime = None):
        """Log ingestion activity"""
        conn = self.get_db_connection()
        try:
            with conn.cursor() as cursor:
                cursor.execute("""
                    INSERT INTO yahoo_ingestion_logs
                    (symbol, data_type, interval, start_date, end_date, records_processed,
                     status, error_message, execution_time_seconds)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
                """, (
                    symbol, data_type, interval, start_date, end_date, records_processed,
                    status, error_message, execution_time
                ))
                conn.commit()
        except Exception as e:
            logger.error(f"Error logging ingestion: {str(e)}")
        finally:
            conn.close()

    def ingest_symbol_data(self, symbol: str, historical_period: str = "2y",
                          historical_interval: str = "1d", include_extended: bool = True,
                          include_ai_data: bool = True) -> Dict[str, int]:
        """Ingest all available data for a symbol for comprehensive AI analysis"""
        results = {
            'historical': 0,
            'dividends': 0,
            'splits': 0,
            'company_info': 0,
            'earnings': 0,
            'news': 0,
            'financial_statements': {'income_statement': 0, 'balance_sheet': 0, 'cash_flow': 0},
            'options': 0,
            'analyst_recommendations': 0,
            'institutional_holders': 0,
            'insider_transactions': 0
        }

        try:
            # Historical data
            start_time = datetime.now()
            hist_data = self.fetch_historical_data(symbol, historical_period, historical_interval)
            if not hist_data.empty:
                results['historical'] = self.save_historical_data(hist_data, historical_interval)
            execution_time = (datetime.now() - start_time).total_seconds()
            self.log_ingestion(symbol, 'historical', results['historical'], 'success',
                             execution_time=execution_time, interval=historical_interval)

            # Dividends
            start_time = datetime.now()
            div_data = self.fetch_dividends(symbol)
            if not div_data.empty:
                results['dividends'] = self.save_dividends(div_data)
            execution_time = (datetime.now() - start_time).total_seconds()
            self.log_ingestion(symbol, 'dividends', results['dividends'], 'success',
                             execution_time=execution_time)

            # Stock splits
            start_time = datetime.now()
            split_data = self.fetch_splits(symbol)
            if not split_data.empty:
                results['splits'] = self.save_splits(split_data)
            execution_time = (datetime.now() - start_time).total_seconds()
            self.log_ingestion(symbol, 'splits', results['splits'], 'success',
                             execution_time=execution_time)

            if include_extended:
                # Company info
                start_time = datetime.now()
                info_data = self.fetch_company_info(symbol)
                if info_data:
                    results['company_info'] = self.save_company_info(info_data)
                execution_time = (datetime.now() - start_time).total_seconds()
                self.log_ingestion(symbol, 'company_info', results['company_info'], 'success',
                                 execution_time=execution_time)

                # Earnings
                start_time = datetime.now()
                earnings_data = self.fetch_earnings(symbol)
                if earnings_data:
                    results['earnings'] = self.save_earnings(earnings_data)
                execution_time = (datetime.now() - start_time).total_seconds()
                self.log_ingestion(symbol, 'earnings', results['earnings'], 'success',
                                 execution_time=execution_time)

                # News
                start_time = datetime.now()
                news_data = self.fetch_news(symbol)
                if news_data:
                    results['news'] = self.save_news(news_data)
                execution_time = (datetime.now() - start_time).total_seconds()
                self.log_ingestion(symbol, 'news', results['news'], 'success',
                                 execution_time=execution_time)

            if include_ai_data:
                # Financial Statements (for AI analysis)
                start_time = datetime.now()
                financial_data = self.fetch_financial_statements(symbol)
                if financial_data:
                    results['financial_statements'] = self.save_financial_statements(financial_data)
                execution_time = (datetime.now() - start_time).total_seconds()
                total_financial_records = sum(results['financial_statements'].values())
                self.log_ingestion(symbol, 'financial_statements', total_financial_records, 'success',
                                 execution_time=execution_time)

                # Options Data (for AI analysis)
                start_time = datetime.now()
                options_data = self.fetch_options_data(symbol)
                if options_data:
                    results['options'] = self.save_options_data(options_data)
                execution_time = (datetime.now() - start_time).total_seconds()
                self.log_ingestion(symbol, 'options', results['options'], 'success',
                                 execution_time=execution_time)

                # Analyst Recommendations (for AI analysis)
                start_time = datetime.now()
                recommendations_data = self.fetch_analyst_recommendations(symbol)
                if recommendations_data:
                    results['analyst_recommendations'] = self.save_analyst_recommendations(recommendations_data)
                execution_time = (datetime.now() - start_time).total_seconds()
                self.log_ingestion(symbol, 'analyst_recommendations', results['analyst_recommendations'], 'success',
                                 execution_time=execution_time)

                # Institutional Holders (for AI analysis)
                start_time = datetime.now()
                holders_data = self.fetch_institutional_holders(symbol)
                if holders_data:
                    results['institutional_holders'] = self.save_institutional_holders(holders_data)
                execution_time = (datetime.now() - start_time).total_seconds()
                self.log_ingestion(symbol, 'institutional_holders', results['institutional_holders'], 'success',
                                 execution_time=execution_time)

                # Insider Transactions (for AI analysis)
                start_time = datetime.now()
                insider_data = self.fetch_insider_transactions(symbol)
                if insider_data:
                    results['insider_transactions'] = self.save_insider_transactions(insider_data)
                execution_time = (datetime.now() - start_time).total_seconds()
                self.log_ingestion(symbol, 'insider_transactions', results['insider_transactions'], 'success',
                                 execution_time=execution_time)

        except Exception as e:
            logger.error(f"Error ingesting data for {symbol}: {str(e)}")
            self.log_ingestion(symbol, 'error', 0, 'failed', str(e))

        return results

    def ingest_all_symbols(self, symbols: List[str] = None, historical_period: str = "2y",
                          historical_interval: str = "1d", include_extended: bool = True,
                          include_ai_data: bool = True) -> Dict[str, Any]:
        """Ingest data for all symbols with comprehensive AI analysis data"""
        if symbols is None:
            symbols = self.get_symbols_from_master()

        total_results = {
            'total_symbols': len(symbols),
            'successful_symbols': 0,
            'failed_symbols': 0,
            'total_records': 0,
            'details': []
        }

        for symbol in symbols:
            logger.info(f"Processing {symbol} for comprehensive AI analysis...")
            try:
                results = self.ingest_symbol_data(symbol, historical_period, historical_interval,
                                                include_extended, include_ai_data)

                # Calculate total records including nested financial statements
                total_records = (results['historical'] + results['dividends'] + results['splits'] +
                               results['company_info'] + results['earnings'] + results['news'] +
                               results['options'] + results['analyst_recommendations'] +
                               results['institutional_holders'] + results['insider_transactions'] +
                               sum(results['financial_statements'].values()))

                total_results['details'].append({
                    'symbol': symbol,
                    'status': 'success',
                    'records': total_records,
                    'breakdown': results
                })

                total_results['successful_symbols'] += 1
                total_results['total_records'] += total_records

                logger.info(f"Successfully processed {symbol}: {total_records} records for AI analysis")

            except Exception as e:
                logger.error(f"Failed to process {symbol}: {str(e)}")
                total_results['details'].append({
                    'symbol': symbol,
                    'status': 'failed',
                    'error': str(e)
                })
                total_results['failed_symbols'] += 1

        return total_results

    def get_ingestion_status(self) -> Dict[str, Any]:
        """Get current ingestion status"""
        conn = self.get_db_connection()
        try:
            with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cursor:
                # Get latest ingestion logs
                cursor.execute("""
                    SELECT symbol, data_type, records_processed, status, created_at
                    FROM yahoo_ingestion_logs
                    ORDER BY created_at DESC
                    LIMIT 10
                """)
                recent_logs = cursor.fetchall()

                # Get data counts
                cursor.execute("""
                    SELECT
                        (SELECT COUNT(*) FROM yahoo_historical_data) as historical_records,
                        (SELECT COUNT(*) FROM yahoo_dividends) as dividend_records,
                        (SELECT COUNT(*) FROM yahoo_stock_splits) as split_records,
                        (SELECT COUNT(*) FROM yahoo_company_info) as company_info_records,
                        (SELECT COUNT(*) FROM yahoo_earnings) as earnings_records,
                        (SELECT COUNT(*) FROM yahoo_news) as news_records,
                        (SELECT COUNT(DISTINCT symbol) FROM yahoo_historical_data) as symbols_count
                """)
                counts = cursor.fetchone()

                return {
                    'recent_activity': recent_logs,
                    'data_counts': dict(counts) if counts else {},
                    'last_updated': datetime.now().isoformat()
                }

        finally:
            conn.close()

    def get_latest_data(self, symbol: str = None, limit: int = 30) -> List[Dict[str, Any]]:
        """Get latest market data"""
        conn = self.get_db_connection()
        try:
            with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cursor:
                if symbol:
                    cursor.execute("""
                        SELECT * FROM yahoo_historical_data
                        WHERE symbol = %s AND interval = '1d'
                        ORDER BY timestamp DESC
                        LIMIT %s
                    """, (symbol, limit))
                else:
                    cursor.execute("""
                        SELECT DISTINCT ON (symbol) symbol, timestamp, close as last_price,
                               volume, adj_close
                        FROM yahoo_historical_data
                        WHERE interval = '1d'
                        ORDER BY symbol, timestamp DESC
                        LIMIT %s
                    """, (limit,))

                return [dict(row) for row in cursor.fetchall()]

        finally:
            conn.close()
