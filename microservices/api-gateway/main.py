from fastapi import FastAPI, HTTPException, Request, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, Response
import httpx
import os
import logging
from typing import Dict, Any

logger = logging.getLogger(__name__)

app = FastAPI(title="AimStocks API Gateway", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Service URLs
SERVICES = {
    "user": os.getenv("USER_SERVICE_URL", "http://localhost:8001"),
    "broker": os.getenv("BROKER_SERVICE_URL", "http://localhost:8002"),
    "portfolio": os.getenv("PORTFOLIO_SERVICE_URL", "http://localhost:8003"),
    "order": os.getenv("ORDER_SERVICE_URL", "http://localhost:8004"),
    "market-data": os.getenv("MARKET_DATA_SERVICE_URL", "http://localhost:8005"),
    "algorithm": os.getenv("ALGORITHM_SERVICE_URL", "http://localhost:8006"),
    "alert": os.getenv("ALERT_SERVICE_URL", "http://localhost:8007"),
    "news": os.getenv("NEWS_SERVICE_URL", "http://localhost:8008"),
    "websocket": os.getenv("WEBSOCKET_SERVICE_URL", "http://localhost:8009"),
    "data-ingestion": os.getenv("DATA_INGESTION_SERVICE_URL", "http://localhost:8010"),
    "database": os.getenv("DATABASE_SERVICE_URL", "http://postgres-db:5432"),
}

async def forward_request(service_url: str, path: str, method: str, request: Request):
    """Forward request to appropriate microservice"""
    try:
        async with httpx.AsyncClient() as client:
            url = f"{service_url}{path}"

            # Get request body if present
            body = None
            if method in ["POST", "PUT", "PATCH"]:
                body = await request.body()

            # Forward the request
            response = await client.request(
                method=method,
                url=url,
                headers=dict(request.headers),
                params=dict(request.query_params),
                content=body,
                timeout=30.0
            )

            # Return the response as is, preserving content type
            return Response(
                content=response.content,
                status_code=response.status_code,
                headers=dict(response.headers)
            )
    except Exception as e:
        logger.error(f"Error forwarding request: {str(e)}")
        raise HTTPException(status_code=500, detail="Service unavailable")

# User Service Routes
@app.api_route("/api/users/{path:path}", methods=["GET", "POST", "PUT", "DELETE"])
async def user_service(path: str, request: Request):
    return await forward_request(SERVICES["user"], f"/api/users/{path}", request.method, request)

@app.api_route("/api/auth/{path:path}", methods=["GET", "POST"])
async def auth_service(path: str, request: Request):
    return await forward_request(SERVICES["user"], f"/api/auth/{path}", request.method, request)

# Broker Service Routes
@app.api_route("/api/brokers/{path:path}", methods=["GET", "POST", "PUT", "DELETE"])
async def broker_service(path: str, request: Request):
    return await forward_request(SERVICES["broker"], f"/api/brokers/{path}", request.method, request)

@app.get("/api/fyers/optionchain")
async def fyers_optionchain(request: Request):
    return await forward_request(SERVICES["broker"], "/api/fyers/optionchain", "GET", request)

@app.api_route("/api/fyers/{path:path}", methods=["GET", "POST", "PUT", "DELETE"])
async def fyers_service(path: str, request: Request):
    return await forward_request(SERVICES["broker"], f"/api/fyers/{path}", request.method, request)

@app.get("/fyers/callback")
async def fyers_callback(request: Request):
    return await forward_request(SERVICES["broker"], "/fyers/callback", "GET", request)

@app.api_route("/fyers/callback", methods=["GET", "POST"])
async def fyers_callback_all(request: Request):
    return await forward_request(SERVICES["broker"], "/fyers/callback", request.method, request)

# Portfolio Service Routes
@app.api_route("/api/portfolios/{path:path}", methods=["GET", "POST", "PUT", "DELETE"])
async def portfolio_service(path: str, request: Request):
    return await forward_request(SERVICES["portfolio"], f"/api/portfolios/{path}", request.method, request)

@app.api_route("/api/holdings/{path:path}", methods=["GET", "POST", "PUT", "DELETE"])
async def holdings_service(path: str, request: Request):
    return await forward_request(SERVICES["portfolio"], f"/api/holdings/{path}", request.method, request)

# Order Service Routes
@app.api_route("/api/orders/{path:path}", methods=["GET", "POST", "PUT", "DELETE"])
async def order_service(path: str, request: Request):
    return await forward_request(SERVICES["order"], f"/api/orders/{path}", request.method, request)

# Market Data Service Routes
@app.api_route("/api/market-data/{path:path}", methods=["GET", "POST"])
async def market_data_service(path: str, request: Request):
    return await forward_request(SERVICES["market-data"], f"/api/market-data/{path}", request.method, request)

# Algorithm Service Routes
@app.api_route("/api/algorithms/{path:path}", methods=["GET", "POST", "PUT", "DELETE"])
async def algorithm_service(path: str, request: Request):
    return await forward_request(SERVICES["algorithm"], f"/api/algorithms/{path}", request.method, request)

@app.api_route("/api/executions/{path:path}", methods=["GET", "POST"])
async def executions_service(path: str, request: Request):
    return await forward_request(SERVICES["algorithm"], f"/api/executions/{path}", request.method, request)

@app.api_route("/api/environment/{path:path}", methods=["GET"])
async def environment_service(path: str, request: Request):
    return await forward_request(SERVICES["algorithm"], f"/api/environment/{path}", request.method, request)

# Alert Service Routes
@app.api_route("/api/alerts/{path:path}", methods=["GET", "POST", "PUT", "DELETE"])
async def alert_service(path: str, request: Request):
    return await forward_request(SERVICES["alert"], f"/api/alerts/{path}", request.method, request)

# News Service Routes
@app.api_route("/api/news/{path:path}", methods=["GET", "POST"])
async def news_service(path: str, request: Request):
    return await forward_request(SERVICES["news"], f"/api/news/{path}", request.method, request)

# WebSocket Service Routes
@app.api_route("/ws/{path:path}", methods=["GET"])
async def websocket_service(path: str, request: Request):
    return await forward_request(SERVICES["websocket"], f"/ws/{path}", request.method, request)

# Data Ingestion Service Routes
@app.api_route("/user-tokens", methods=["POST"])
async def user_tokens_post(request: Request):
    return await forward_request(SERVICES["data-ingestion"], "/user-tokens", request.method, request)

@app.api_route("/user-tokens/{user_id}", methods=["GET"])
async def user_tokens_get(user_id: str, request: Request):
    return await forward_request(SERVICES["data-ingestion"], f"/user-tokens/{user_id}", request.method, request)

@app.api_route("/user-details", methods=["POST"])
async def user_details_post(request: Request):
    return await forward_request(SERVICES["data-ingestion"], "/user-details", request.method, request)

@app.api_route("/user-details/{user_id}", methods=["GET"])
async def user_details_get(user_id: str, request: Request):
    return await forward_request(SERVICES["data-ingestion"], f"/user-details/{user_id}", request.method, request)

@app.api_route("/market-summary", methods=["GET"])
async def market_summary(request: Request):
    return await forward_request(SERVICES["data-ingestion"], "/market-summary", request.method, request)

@app.api_route("/stock/{symbol}", methods=["GET"])
async def stock_data(symbol: str, request: Request):
    return await forward_request(SERVICES["data-ingestion"], f"/stock/{symbol}", request.method, request)

@app.api_route("/volatility", methods=["GET"])
async def volatility(request: Request):
    return await forward_request(SERVICES["data-ingestion"], "/volatility", request.method, request)

@app.api_route("/trends", methods=["GET"])
async def trends(request: Request):
    return await forward_request(SERVICES["data-ingestion"], "/trends", request.method, request)

@app.api_route("/fyers/{path:path}", methods=["GET", "POST"])
async def fyers_endpoints(path: str, request: Request):
    return await forward_request(SERVICES["data-ingestion"], f"/fyers/{path}", request.method, request)

@app.api_route("/ingestion/{path:path}", methods=["GET", "POST"])
async def ingestion_endpoints(path: str, request: Request):
    return await forward_request(SERVICES["data-ingestion"], f"/ingestion/{path}", request.method, request)

@app.api_route("/symbols/{path:path}", methods=["GET", "POST"])
async def symbols_endpoints(path: str, request: Request):
    return await forward_request(SERVICES["data-ingestion"], f"/symbols/{path}", request.method, request)

@app.api_route("/yahoo/{path:path}", methods=["GET", "POST"])
async def yahoo_endpoints(path: str, request: Request):
    return await forward_request(SERVICES["data-ingestion"], f"/yahoo/{path}", request.method, request)

# AI Analysis Data Ingestion Routes
@app.api_route("/ai/ingest/yahoo", methods=["POST"])
async def ai_ingest_yahoo_data(request: Request):
    return await forward_request(SERVICES["data-ingestion"], "/yahoo/ingest/ai-analysis", request.method, request)

@app.api_route("/ai/ingest/yahoo/{symbol}", methods=["POST"])
async def ai_ingest_single_symbol(symbol: str, request: Request):
    return await forward_request(SERVICES["data-ingestion"], f"/yahoo/ingest/{symbol}/ai-analysis", request.method, request)

@app.api_route("/ai/data/{path:path}", methods=["GET", "POST"])
async def ai_data_endpoints(path: str, request: Request):
    return await forward_request(SERVICES["data-ingestion"], f"/yahoo/{path}", request.method, request)

# Health Check
@app.get("/health")
async def health_check():
    service_health = {}
    
    async with httpx.AsyncClient() as client:
        for service_name, service_url in SERVICES.items():
            try:
                response = await client.get(f"{service_url}/health", timeout=5.0)
                service_health[service_name] = {
                    "status": "healthy" if response.status_code == 200 else "unhealthy",
                    "response_time": response.elapsed.total_seconds()
                }
            except Exception as e:
                service_health[service_name] = {
                    "status": "unhealthy",
                    "error": str(e)
                }
    
    overall_status = "healthy" if all(
        service["status"] == "healthy" for service in service_health.values()
    ) else "degraded"
    
    return {
        "status": overall_status,
        "services": service_health,
        "message": "API Gateway is running"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=5000)