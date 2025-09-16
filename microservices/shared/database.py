import psycopg2
from psycopg2 import pool
import psycopg2.extras
import os
from typing import Optional, Dict, Any
import logging

logger = logging.getLogger(__name__)

class DatabaseManager:
    def __init__(self):
        self.config = {
            'host': os.getenv('DB_HOST', 'localhost'),
            'port': int(os.getenv('DB_PORT', 5432)),
            'user': os.getenv('DB_USER', 'postgres'),
            'password': os.getenv('DB_PASSWORD', 'postgres'),
            'database': os.getenv('DB_NAME', 'stockmarket'),
            'minconn': 1,
            'maxconn': 10
        }
        self.pool = None
        self._create_pool()

    def _create_pool(self):
        try:
            self.pool = psycopg2.pool.SimpleConnectionPool(**self.config)
            logger.info("Database connection pool created successfully")
        except Exception as e:
            logger.error(f"Error creating database pool: {str(e)}")
            raise
    
    def get_connection(self):
        try:
            return self.pool.getconn()
        except Exception as e:
            logger.error(f"Error getting database connection: {str(e)}")
            raise
    
    def execute_query(self, query: str, params: tuple = None) -> Optional[list]:
        connection = None
        cursor = None
        try:
            connection = self.get_connection()
            cursor = connection.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
            cursor.execute(query, params)

            if query.strip().upper().startswith('SELECT'):
                return cursor.fetchall()
            else:
                connection.commit()
                return cursor.rowcount
        except Exception as e:
            if connection:
                connection.rollback()
            logger.error(f"Database query error: {str(e)}")
            raise
        finally:
            if cursor:
                cursor.close()
            if connection:
                self.pool.putconn(connection)
    
    def execute_transaction(self, queries: list) -> bool:
        connection = None
        cursor = None
        try:
            connection = self.get_connection()
            connection.autocommit = False
            cursor = connection.cursor()

            for query, params in queries:
                cursor.execute(query, params)

            connection.commit()
            return True
        except Exception as e:
            if connection:
                connection.rollback()
            logger.error(f"Transaction error: {str(e)}")
            return False
        finally:
            if cursor:
                cursor.close()
            if connection:
                self.pool.putconn(connection)

# Global database instance
db = DatabaseManager()