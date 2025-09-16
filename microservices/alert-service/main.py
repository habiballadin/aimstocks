from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

from shared.database import db
from shared.models import Alert, APIResponse
import asyncio
import httpx
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

app = FastAPI(title="Alert Service", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

MARKET_DATA_SERVICE_URL = os.getenv("MARKET_DATA_SERVICE_URL", "http://localhost:8005")

class AlertMonitor:
    def __init__(self):
        self.monitoring = True
    
    async def check_alerts(self):
        """Check all active alerts against current market data"""
        try:
            # Get all active alerts
            alerts = db.execute_query(
                "SELECT * FROM alerts WHERE is_active = TRUE AND is_triggered = FALSE"
            )
            
            for alert in alerts:
                await self.check_single_alert(alert)
                
        except Exception as e:
            logger.error(f"Error checking alerts: {str(e)}")
    
    async def check_single_alert(self, alert: dict):
        """Check a single alert condition"""
        try:
            # Get current market data for the symbol
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"{MARKET_DATA_SERVICE_URL}/api/market-data/quotes/{alert['symbol']}",
                    timeout=5.0
                )
                
                if response.status_code == 200:
                    result = response.json()
                    if result.get("success") and result.get("data", {}).get("quotes"):
                        quotes = result["data"]["quotes"]
                        if quotes:
                            current_price = quotes[0].get("ltp")
                            if current_price:
                                await self.evaluate_alert_condition(alert, float(current_price))
        except Exception as e:
            logger.error(f"Error checking alert {alert['id']}: {str(e)}")
    
    async def evaluate_alert_condition(self, alert: dict, current_price: float):
        """Evaluate if alert condition is met"""
        try:
            triggered = False
            condition_value = float(alert['condition_value']) if alert['condition_value'] else 0.0
            
            if alert['alert_type'] == 'PRICE_ABOVE' and current_price > condition_value:
                triggered = True
            elif alert['alert_type'] == 'PRICE_BELOW' and current_price < condition_value:
                triggered = True
            elif alert['alert_type'] == 'VOLUME_SPIKE':
                # Volume spike logic would go here
                pass
            
            if triggered:
                # Mark alert as triggered
                db.execute_query(
                    "UPDATE alerts SET is_triggered = TRUE, triggered_at = %s WHERE id = %s",
                    (datetime.now(), alert['id'])
                )
                
                # Send notification (implement notification service call here)
                await self.send_notification(alert, current_price)
                
        except Exception as e:
            logger.error(f"Error evaluating alert condition: {str(e)}")
    
    async def send_notification(self, alert: dict, current_price: float):
        """Send notification for triggered alert"""
        try:
            # This would integrate with notification service
            logger.info(f"Alert triggered: {alert['symbol']} - {alert['message']} at price {current_price}")
        except Exception as e:
            logger.error(f"Error sending notification: {str(e)}")

alert_monitor = AlertMonitor()

async def alert_monitoring_task():
    """Background task for monitoring alerts"""
    while alert_monitor.monitoring:
        try:
            await alert_monitor.check_alerts()
            await asyncio.sleep(10)  # Check every 10 seconds
        except Exception as e:
            logger.error(f"Error in alert monitoring task: {str(e)}")
            await asyncio.sleep(30)

@app.on_event("startup")
async def startup_event():
    asyncio.create_task(alert_monitoring_task())

@app.post("/api/alerts")
async def create_alert(alert_data: dict, user_id: int = 1):
    try:
        required_fields = ["symbol", "alert_type", "condition_value"]
        for field in required_fields:
            if field not in alert_data:
                raise HTTPException(status_code=400, detail=f"{field} is required")
        
        # Create alert
        db.execute_query(
            """INSERT INTO alerts (user_id, symbol, alert_type, condition_value, message, is_active) 
               VALUES (%s, %s, %s, %s, %s, %s)""",
            (user_id, alert_data["symbol"], alert_data["alert_type"],
             alert_data["condition_value"], alert_data.get("message", ""), True)
        )
        
        return APIResponse(success=True, message="Alert created successfully")
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creating alert: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to create alert")

@app.get("/api/alerts/{user_id}")
async def get_user_alerts(user_id: int, active_only: bool = False):
    try:
        query = "SELECT * FROM alerts WHERE user_id = %s"
        params = [user_id]
        
        if active_only:
            query += " AND is_active = TRUE"
        
        query += " ORDER BY created_at DESC"
        
        alerts = db.execute_query(query, tuple(params))
        
        return APIResponse(success=True, data={"alerts": alerts})
        
    except Exception as e:
        logger.error(f"Error getting alerts: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to get alerts")

@app.put("/api/alerts/{alert_id}")
async def update_alert(alert_id: int, alert_data: dict):
    try:
        # Build update query dynamically
        update_fields = []
        params = []
        
        for field in ["condition_value", "message", "is_active"]:
            if field in alert_data:
                update_fields.append(f"{field} = %s")
                params.append(alert_data[field])
        
        if not update_fields:
            raise HTTPException(status_code=400, detail="No fields to update")
        
        params.append(alert_id)
        
        db.execute_query(
            f"UPDATE alerts SET {', '.join(update_fields)} WHERE id = %s",
            tuple(params)
        )
        
        return APIResponse(success=True, message="Alert updated successfully")
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating alert: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to update alert")

@app.delete("/api/alerts/{alert_id}")
async def delete_alert(alert_id: int):
    try:
        result = db.execute_query(
            "DELETE FROM alerts WHERE id = %s",
            (alert_id,)
        )
        
        if result == 0:
            raise HTTPException(status_code=404, detail="Alert not found")
        
        return APIResponse(success=True, message="Alert deleted successfully")
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting alert: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to delete alert")

@app.get("/api/alerts/triggered/{user_id}")
async def get_triggered_alerts(user_id: int, limit: int = 20):
    try:
        alerts = db.execute_query(
            """SELECT * FROM alerts 
               WHERE user_id = %s AND is_triggered = TRUE 
               ORDER BY triggered_at DESC 
               LIMIT %s""",
            (user_id, limit)
        )
        
        return APIResponse(success=True, data={"alerts": alerts})
        
    except Exception as e:
        logger.error(f"Error getting triggered alerts: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to get triggered alerts")

@app.post("/api/alerts/{alert_id}/reset")
async def reset_alert(alert_id: int):
    try:
        # Reset alert to active state
        db.execute_query(
            "UPDATE alerts SET is_triggered = FALSE, triggered_at = NULL WHERE id = %s",
            (alert_id,)
        )
        
        return APIResponse(success=True, message="Alert reset successfully")
        
    except Exception as e:
        logger.error(f"Error resetting alert: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to reset alert")

@app.get("/api/alerts/stats/{user_id}")
async def get_alert_stats(user_id: int):
    try:
        stats = db.execute_query(
            """SELECT 
                COUNT(*) as total_alerts,
                COUNT(CASE WHEN is_active = TRUE THEN 1 END) as active_alerts,
                COUNT(CASE WHEN is_triggered = TRUE THEN 1 END) as triggered_alerts,
                COUNT(CASE WHEN is_active = FALSE THEN 1 END) as inactive_alerts
               FROM alerts WHERE user_id = %s""",
            (user_id,)
        )
        
        # Get recent triggered alerts
        recent_triggered = db.execute_query(
            """SELECT symbol, alert_type, condition_value, triggered_at 
               FROM alerts 
               WHERE user_id = %s AND is_triggered = TRUE 
               ORDER BY triggered_at DESC 
               LIMIT 5""",
            (user_id,)
        )
        
        return APIResponse(success=True, data={
            "stats": stats[0] if stats else {},
            "recentTriggered": recent_triggered
        })
        
    except Exception as e:
        logger.error(f"Error getting alert stats: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to get alert statistics")

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "alert-service"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8007)