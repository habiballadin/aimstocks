from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

from shared.database import db
from shared.models import Portfolio, Holding, APIResponse
import logging

logger = logging.getLogger(__name__)

app = FastAPI(title="Portfolio Service", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/portfolios/{user_id}")
async def get_user_portfolios(user_id: int):
    try:
        portfolios = db.execute_query(
            """SELECT p.*, 
                      COUNT(h.id) as holdings_count,
                      COALESCE(SUM(h.market_value), 0) as total_value
               FROM portfolios p
               LEFT JOIN holdings h ON p.id = h.portfolio_id
               WHERE p.user_id = %s
               GROUP BY p.id
               ORDER BY p.is_default DESC, p.created_at""",
            (user_id,)
        )
        
        return APIResponse(success=True, data={"portfolios": portfolios})
        
    except Exception as e:
        logger.error(f"Get portfolios error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to get portfolios")

@app.get("/api/portfolios/{portfolio_id}/summary")
async def get_portfolio_summary(portfolio_id: int):
    try:
        # Get portfolio info
        portfolio = db.execute_query(
            "SELECT * FROM portfolios WHERE id = %s",
            (portfolio_id,)
        )
        
        if not portfolio:
            raise HTTPException(status_code=404, detail="Portfolio not found")
        
        # Get holdings summary
        holdings_summary = db.execute_query(
            """SELECT 
                COUNT(*) as total_holdings,
                COALESCE(SUM(market_value), 0) as total_value,
                COALESCE(SUM(pnl), 0) as total_pnl,
                COALESCE(AVG(pnl_percent), 0) as avg_pnl_percent
               FROM holdings WHERE portfolio_id = %s""",
            (portfolio_id,)
        )
        
        # Get top performers
        top_performers = db.execute_query(
            """SELECT symbol, pnl_percent, market_value 
               FROM holdings 
               WHERE portfolio_id = %s AND pnl_percent IS NOT NULL
               ORDER BY pnl_percent DESC 
               LIMIT 5""",
            (portfolio_id,)
        )
        
        # Get sector allocation (mock data for now)
        sector_allocation = [
            {"sector": "Technology", "percentage": 35.5, "value": 177500},
            {"sector": "Banking", "percentage": 28.2, "value": 141000},
            {"sector": "Healthcare", "percentage": 15.8, "value": 79000},
            {"sector": "Energy", "percentage": 12.3, "value": 61500},
            {"sector": "Others", "percentage": 8.2, "value": 41000}
        ]
        
        summary = {
            "portfolio": portfolio[0],
            "summary": holdings_summary[0] if holdings_summary else {},
            "topPerformers": top_performers,
            "sectorAllocation": sector_allocation
        }
        
        return APIResponse(success=True, data=summary)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Get portfolio summary error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to get portfolio summary")

@app.get("/api/holdings/{portfolio_id}")
async def get_portfolio_holdings(portfolio_id: int):
    try:
        holdings = db.execute_query(
            """SELECT h.*, m.ltp as current_price, m.change_percent as day_change_percent
               FROM holdings h
               LEFT JOIN market_data m ON h.symbol = m.symbol AND h.exchange = m.exchange
               WHERE h.portfolio_id = %s
               ORDER BY h.market_value DESC""",
            (portfolio_id,)
        )
        
        # Update current prices and calculate PnL
        for holding in holdings:
            if holding['current_price']:
                holding['market_value'] = holding['quantity'] * holding['current_price']
                holding['pnl'] = holding['market_value'] - (holding['quantity'] * holding['avg_price'])
                holding['pnl_percent'] = (holding['pnl'] / (holding['quantity'] * holding['avg_price'])) * 100
        
        return APIResponse(success=True, data={"holdings": holdings})
        
    except Exception as e:
        logger.error(f"Get holdings error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to get holdings")

@app.post("/api/portfolios")
async def create_portfolio(portfolio_data: dict):
    try:
        user_id = portfolio_data.get("user_id")
        name = portfolio_data.get("name")
        
        if not user_id or not name:
            raise HTTPException(status_code=400, detail="User ID and name required")
        
        # Check if this should be default
        is_default = portfolio_data.get("is_default", False)
        if is_default:
            # Unset other default portfolios
            db.execute_query(
                "UPDATE portfolios SET is_default = FALSE WHERE user_id = %s",
                (user_id,)
            )
        
        # Create portfolio
        db.execute_query(
            "INSERT INTO portfolios (user_id, name, is_default) VALUES (%s, %s, %s)",
            (user_id, name, is_default)
        )
        
        return APIResponse(success=True, message="Portfolio created successfully")
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Create portfolio error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to create portfolio")

@app.post("/api/holdings")
async def add_holding(holding_data: dict):
    try:
        required_fields = ["portfolio_id", "symbol", "exchange", "quantity", "avg_price"]
        for field in required_fields:
            if field not in holding_data:
                raise HTTPException(status_code=400, detail=f"{field} is required")
        
        # Check if holding already exists
        existing = db.execute_query(
            "SELECT id, quantity FROM holdings WHERE portfolio_id = %s AND symbol = %s AND exchange = %s",
            (holding_data["portfolio_id"], holding_data["symbol"], holding_data["exchange"])
        )
        
        if existing:
            # Update existing holding (average price calculation)
            old_qty = existing[0]["quantity"]
            new_qty = holding_data["quantity"]
            total_qty = old_qty + new_qty
            
            # Calculate new average price
            old_value = old_qty * holding_data["avg_price"]  # Assuming same price for simplicity
            new_value = new_qty * holding_data["avg_price"]
            new_avg_price = (old_value + new_value) / total_qty
            
            db.execute_query(
                "UPDATE holdings SET quantity = %s, avg_price = %s WHERE id = %s",
                (total_qty, new_avg_price, existing[0]["id"])
            )
        else:
            # Create new holding
            db.execute_query(
                """INSERT INTO holdings (portfolio_id, symbol, exchange, quantity, avg_price) 
                   VALUES (%s, %s, %s, %s, %s)""",
                (holding_data["portfolio_id"], holding_data["symbol"], 
                 holding_data["exchange"], holding_data["quantity"], holding_data["avg_price"])
            )
        
        return APIResponse(success=True, message="Holding added successfully")
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Add holding error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to add holding")

@app.delete("/api/holdings/{holding_id}")
async def remove_holding(holding_id: int):
    try:
        result = db.execute_query(
            "DELETE FROM holdings WHERE id = %s",
            (holding_id,)
        )
        
        if result == 0:
            raise HTTPException(status_code=404, detail="Holding not found")
        
        return APIResponse(success=True, message="Holding removed successfully")
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Remove holding error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to remove holding")

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "portfolio-service"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8003)