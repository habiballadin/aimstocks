from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

from shared.database import db
from shared.models import Order, OrderCreate, OrderStatus, APIResponse
import httpx
import logging

logger = logging.getLogger(__name__)

app = FastAPI(title="Order Service", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

BROKER_SERVICE_URL = os.getenv("BROKER_SERVICE_URL", "http://localhost:8002")

@app.post("/api/orders")
async def place_order(order_data: OrderCreate, user_id: int = 1):  # Get user_id from JWT in production
    try:
        # Create order in database
        order_id = db.execute_query(
            """INSERT INTO orders (user_id, symbol, exchange, order_type, product_type, 
                                 price_type, quantity, price, status) 
               VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)""",
            (user_id, order_data.symbol, order_data.exchange, order_data.order_type.value,
             order_data.product_type, order_data.price_type, order_data.quantity, 
             order_data.price, OrderStatus.PENDING.value)
        )
        
        # Try to place order with broker
        try:
            async with httpx.AsyncClient() as client:
                broker_order_data = {
                    "symbol": order_data.symbol,
                    "qty": order_data.quantity,
                    "type": 2 if order_data.price_type == "MARKET" else 1,  # 1=Limit, 2=Market
                    "side": 1 if order_data.order_type.value == "BUY" else -1,  # 1=Buy, -1=Sell
                    "product_type": order_data.product_type,
                    "limit_price": order_data.price or 0.0
                }
                
                response = await client.post(
                    f"{BROKER_SERVICE_URL}/api/fyers/order",
                    json=broker_order_data,
                    timeout=10.0
                )
                
                if response.status_code == 200:
                    result = response.json()
                    if result.get("success"):
                        # Update order with broker order ID
                        broker_order_id = result.get("data", {}).get("id")
                        if broker_order_id:
                            db.execute_query(
                                "UPDATE orders SET broker_order_id = %s, status = %s WHERE id = %s",
                                (broker_order_id, OrderStatus.OPEN.value, order_id)
                            )
                    else:
                        # Mark order as rejected
                        db.execute_query(
                            "UPDATE orders SET status = %s WHERE id = %s",
                            (OrderStatus.REJECTED.value, order_id)
                        )
                else:
                    # Mark order as rejected
                    db.execute_query(
                        "UPDATE orders SET status = %s WHERE id = %s",
                        (OrderStatus.REJECTED.value, order_id)
                    )
        except Exception as broker_error:
            logger.error(f"Broker order placement failed: {str(broker_error)}")
            # Mark order as rejected
            db.execute_query(
                "UPDATE orders SET status = %s WHERE id = %s",
                (OrderStatus.REJECTED.value, order_id)
            )
        
        # Get created order
        order = db.execute_query(
            "SELECT * FROM orders WHERE id = %s",
            (order_id,)
        )[0]
        
        return APIResponse(success=True, data={"order": order}, message="Order placed successfully")
        
    except Exception as e:
        logger.error(f"Place order error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to place order")

@app.get("/api/orders/{user_id}")
async def get_user_orders(user_id: int, status: str = None, limit: int = 50):
    try:
        query = "SELECT * FROM orders WHERE user_id = %s"
        params = [user_id]
        
        if status:
            query += " AND status = %s"
            params.append(status)
        
        query += " ORDER BY created_at DESC LIMIT %s"
        params.append(limit)
        
        orders = db.execute_query(query, tuple(params))
        
        return APIResponse(success=True, data={"orders": orders})
        
    except Exception as e:
        logger.error(f"Get orders error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to get orders")

@app.get("/api/orders/order/{order_id}")
async def get_order(order_id: int):
    try:
        order = db.execute_query(
            "SELECT * FROM orders WHERE id = %s",
            (order_id,)
        )
        
        if not order:
            raise HTTPException(status_code=404, detail="Order not found")
        
        return APIResponse(success=True, data={"order": order[0]})
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Get order error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to get order")

@app.put("/api/orders/{order_id}/cancel")
async def cancel_order(order_id: int):
    try:
        # Get order details
        order = db.execute_query(
            "SELECT * FROM orders WHERE id = %s",
            (order_id,)
        )
        
        if not order:
            raise HTTPException(status_code=404, detail="Order not found")
        
        order_data = order[0]
        
        # Try to cancel with broker if broker_order_id exists
        if order_data["broker_order_id"]:
            try:
                async with httpx.AsyncClient() as client:
                    response = await client.delete(
                        f"{BROKER_SERVICE_URL}/api/fyers/orders/{order_data['broker_order_id']}",
                        timeout=10.0
                    )
                    # Continue with local cancellation regardless of broker response
            except Exception as broker_error:
                logger.error(f"Broker order cancellation failed: {str(broker_error)}")
        
        # Update order status
        db.execute_query(
            "UPDATE orders SET status = %s WHERE id = %s",
            (OrderStatus.CANCELLED.value, order_id)
        )
        
        return APIResponse(success=True, message="Order cancelled successfully")
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Cancel order error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to cancel order")

@app.get("/api/orders/stats/{user_id}")
async def get_order_stats(user_id: int):
    try:
        # Get order statistics
        stats = db.execute_query(
            """SELECT 
                COUNT(*) as total_orders,
                COUNT(CASE WHEN status = 'COMPLETE' THEN 1 END) as completed_orders,
                COUNT(CASE WHEN status = 'PENDING' OR status = 'OPEN' THEN 1 END) as pending_orders,
                COUNT(CASE WHEN status = 'CANCELLED' THEN 1 END) as cancelled_orders,
                COUNT(CASE WHEN status = 'REJECTED' THEN 1 END) as rejected_orders,
                COALESCE(SUM(CASE WHEN status = 'COMPLETE' THEN quantity * COALESCE(avg_fill_price, price) END), 0) as total_value
               FROM orders WHERE user_id = %s""",
            (user_id,)
        )
        
        # Get recent orders
        recent_orders = db.execute_query(
            """SELECT symbol, order_type, quantity, price, status, created_at 
               FROM orders 
               WHERE user_id = %s 
               ORDER BY created_at DESC 
               LIMIT 10""",
            (user_id,)
        )
        
        return APIResponse(success=True, data={
            "stats": stats[0] if stats else {},
            "recentOrders": recent_orders
        })
        
    except Exception as e:
        logger.error(f"Get order stats error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to get order statistics")

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "order-service"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8004)