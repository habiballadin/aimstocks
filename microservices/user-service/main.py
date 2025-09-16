from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

from shared.database import db
from shared.models import User, UserCreate, APIResponse
import bcrypt
import jwt
from datetime import datetime, timedelta
import logging

logger = logging.getLogger(__name__)

app = FastAPI(title="User Service", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

SECRET_KEY = os.getenv("JWT_SECRET", "your-secret-key")

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

def create_access_token(user_id: int) -> str:
    payload = {
        "user_id": user_id,
        "exp": datetime.utcnow() + timedelta(hours=24)
    }
    return jwt.encode(payload, SECRET_KEY, algorithm="HS256")

@app.post("/api/auth/register")
async def register(user_data: UserCreate):
    try:
        # Check if user exists
        existing_user = db.execute_query(
            "SELECT id FROM users WHERE email = %s",
            (user_data.email,)
        )
        
        if existing_user:
            raise HTTPException(status_code=400, detail="Email already registered")
        
        # Hash password
        password_hash = hash_password(user_data.password)
        
        # Create user
        db.execute_query(
            """INSERT INTO users (email, password_hash, name, phone, pan) 
               VALUES (%s, %s, %s, %s, %s)""",
            (user_data.email, password_hash, user_data.name, user_data.phone, user_data.pan)
        )
        
        # Get created user
        user = db.execute_query(
            "SELECT id, email, name, phone, pan FROM users WHERE email = %s",
            (user_data.email,)
        )[0]
        
        # Create default portfolio
        db.execute_query(
            "INSERT INTO portfolios (user_id, name, is_default) VALUES (%s, %s, %s)",
            (user["id"], "Main Portfolio", True)
        )
        
        token = create_access_token(user["id"])
        
        return APIResponse(
            success=True,
            message="User registered successfully",
            data={"user": user, "token": token}
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Registration error: {str(e)}")
        raise HTTPException(status_code=500, detail="Registration failed")

@app.post("/api/auth/login")
async def login(credentials: dict):
    try:
        email = credentials.get("email")
        password = credentials.get("password")
        
        if not email or not password:
            raise HTTPException(status_code=400, detail="Email and password required")
        
        # Get user
        user = db.execute_query(
            "SELECT id, email, name, password_hash FROM users WHERE email = %s AND is_active = TRUE",
            (email,)
        )
        
        if not user or not verify_password(password, user[0]["password_hash"]):
            raise HTTPException(status_code=401, detail="Invalid credentials")
        
        user_data = user[0]
        token = create_access_token(user_data["id"])
        
        return APIResponse(
            success=True,
            message="Login successful",
            data={
                "user": {
                    "id": user_data["id"],
                    "email": user_data["email"],
                    "name": user_data["name"]
                },
                "token": token
            }
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Login error: {str(e)}")
        raise HTTPException(status_code=500, detail="Login failed")

@app.get("/api/users/{user_id}")
async def get_user(user_id: int):
    try:
        user = db.execute_query(
            "SELECT id, email, name, phone, pan, created_at FROM users WHERE id = %s AND is_active = TRUE",
            (user_id,)
        )
        
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        return APIResponse(success=True, data=user[0])
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Get user error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to get user")

@app.put("/api/users/{user_id}")
async def update_user(user_id: int, user_data: dict):
    try:
        # Build update query dynamically
        update_fields = []
        params = []
        
        for field in ["name", "phone", "pan"]:
            if field in user_data:
                update_fields.append(f"{field} = %s")
                params.append(user_data[field])
        
        if not update_fields:
            raise HTTPException(status_code=400, detail="No fields to update")
        
        params.append(user_id)
        
        db.execute_query(
            f"UPDATE users SET {', '.join(update_fields)} WHERE id = %s",
            tuple(params)
        )
        
        return APIResponse(success=True, message="User updated successfully")
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Update user error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to update user")

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "user-service"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)