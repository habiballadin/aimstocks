from pydantic import BaseModel
from typing import Dict, List, Optional, Any
from datetime import datetime
from enum import Enum

# Common Enums
class OrderType(str, Enum):
    BUY = "BUY"
    SELL = "SELL"

class OrderStatus(str, Enum):
    PENDING = "PENDING"
    OPEN = "OPEN"
    COMPLETE = "COMPLETE"
    CANCELLED = "CANCELLED"
    REJECTED = "REJECTED"

class AlgorithmStatus(str, Enum):
    STOPPED = "STOPPED"
    RUNNING = "RUNNING"
    PAUSED = "PAUSED"

# User Models
class User(BaseModel):
    id: Optional[int] = None
    email: str
    name: str
    phone: Optional[str] = None
    pan: Optional[str] = None
    is_active: bool = True

class UserCreate(BaseModel):
    email: str
    password: str
    name: str
    phone: Optional[str] = None
    pan: Optional[str] = None

# Broker Models
class BrokerConnection(BaseModel):
    id: Optional[int] = None
    user_id: int
    broker_name: str
    client_id: Optional[str] = None
    access_token: Optional[str] = None
    is_active: bool = True

# Portfolio Models
class Portfolio(BaseModel):
    id: Optional[int] = None
    user_id: int
    name: str
    total_value: float = 0
    day_change: float = 0
    day_change_percent: float = 0
    is_default: bool = False

class Holding(BaseModel):
    id: Optional[int] = None
    portfolio_id: int
    symbol: str
    exchange: str
    quantity: int
    avg_price: float
    current_price: Optional[float] = None
    market_value: Optional[float] = None
    pnl: Optional[float] = None
    pnl_percent: Optional[float] = None

# Order Models
class Order(BaseModel):
    id: Optional[int] = None
    user_id: int
    broker_order_id: Optional[str] = None
    symbol: str
    exchange: str
    order_type: OrderType
    product_type: str = "CNC"
    price_type: str = "MARKET"
    quantity: int
    price: Optional[float] = None
    trigger_price: Optional[float] = None
    filled_quantity: int = 0
    avg_fill_price: Optional[float] = None
    status: OrderStatus = OrderStatus.PENDING
    validity: str = "DAY"

class OrderCreate(BaseModel):
    symbol: str
    exchange: str = "NSE"
    order_type: OrderType
    quantity: int
    price: Optional[float] = None
    product_type: str = "CNC"
    price_type: str = "MARKET"

# Market Data Models
class MarketData(BaseModel):
    symbol: str
    exchange: str
    ltp: Optional[float] = None
    open_price: Optional[float] = None
    high_price: Optional[float] = None
    low_price: Optional[float] = None
    prev_close: Optional[float] = None
    volume: Optional[int] = None
    change_value: Optional[float] = None
    change_percent: Optional[float] = None

# Algorithm Models
class Algorithm(BaseModel):
    id: Optional[int] = None
    user_id: int
    name: str
    description: Optional[str] = None
    type: str
    category: Optional[str] = None
    python_code: Optional[str] = None
    parameters: Dict[str, Any] = {}
    status: AlgorithmStatus = AlgorithmStatus.STOPPED
    is_active: bool = False

class AlgorithmCreate(BaseModel):
    name: str
    type: str
    category: str
    description: str
    python_code: Optional[str] = None
    parameters: Dict[str, Any]

class AlgorithmExecution(BaseModel):
    id: Optional[int] = None
    algorithm_id: int
    symbol: str
    action: str
    quantity: Optional[int] = None
    price: Optional[float] = None
    confidence: Optional[float] = None
    reason: Optional[str] = None
    status: str = "PENDING"

# Alert Models
class Alert(BaseModel):
    id: Optional[int] = None
    user_id: int
    symbol: str
    alert_type: str
    condition_value: Optional[float] = None
    message: Optional[str] = None
    is_triggered: bool = False
    is_active: bool = True

# News Models
class News(BaseModel):
    id: Optional[int] = None
    title: str
    content: Optional[str] = None
    source: Optional[str] = None
    category: Optional[str] = None
    symbols: Optional[List[str]] = None
    sentiment: Optional[str] = None
    published_at: Optional[datetime] = None

# Response Models
class APIResponse(BaseModel):
    success: bool
    message: Optional[str] = None
    data: Optional[Any] = None
    error: Optional[str] = None