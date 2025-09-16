from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from shared.database.connections import db
from fyers_auth import router as fyers_router
from user_tokens import router as tokens_router
from user_profiles import router as profiles_router
from funds import router as funds_router
from holdings import router as holdings_router
from token_refresh import router as refresh_router
from user_details import router as user_details_router

app = FastAPI(title="User Service", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup():
    await db.init_postgres()
    await db.init_redis()

app.include_router(fyers_router, prefix="/api/v1/auth", tags=["Fyers Authentication"])
app.include_router(tokens_router, prefix="/api", tags=["User Tokens"])
app.include_router(profiles_router, prefix="/api", tags=["User Profiles"])
app.include_router(funds_router, prefix="/api", tags=["Funds"])
app.include_router(holdings_router, prefix="/api", tags=["Holdings"])
app.include_router(refresh_router, prefix="/api/v1/auth", tags=["Token Refresh"])
app.include_router(user_details_router, prefix="/api", tags=["User Details"])

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "user-service"}