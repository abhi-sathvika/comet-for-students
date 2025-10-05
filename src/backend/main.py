from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from supabase import create_client, Client
import os
from datetime import datetime
from typing import Optional

app = FastAPI(title="Comet A/B Test Backend", version="1.0.0")

# CORS middleware for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",  # Next.js dev server
        "https://*.vercel.app",   # Vercel deployments
        "https://comet-for-students.vercel.app",  # Your Vercel app domain
        "https://comet-for-students-git-main.vercel.app",  # Vercel preview deployments
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# Supabase configuration
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_ANON_KEY")

# Initialize Supabase client
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

class ClickLog(BaseModel):
    user_id: int
    group_id: int
    user_agent: Optional[str] = None
    ip_address: Optional[str] = None

class UserRegistration(BaseModel):
    name: str
    email: str
    group_id: int

@app.get("/")
async def root():
    return {"message": "Comet A/B Test API is running"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.utcnow()}

@app.post("/log-click")
async def log_click(click_data: ClickLog):
    """Log a click event to the database"""
    try:
        # Insert click data into Supabase
        result = supabase.table("clicks").insert({
            "user_id": click_data.user_id,
            "group_id": click_data.group_id,
            "timestamp": datetime.utcnow().isoformat(),
            "user_agent": click_data.user_agent,
            "ip_address": click_data.ip_address
        }).execute()

        if result.data:
            return {"success": True, "click_id": result.data[0]["id"]}
        else:
            raise HTTPException(status_code=500, detail="Failed to log click")

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@app.post("/register-user")
async def register_user(user_data: UserRegistration):
    """Register a new user and assign them to a test group"""
    try:
        # Insert user data into Supabase
        result = supabase.table("users").insert({
            "name": user_data.name,
            "email": user_data.email,
            "created_at": datetime.utcnow().isoformat()
        }).execute()

        if result.data:
            user_id = result.data[0]["id"]

            # Log initial assignment click
            click_result = supabase.table("clicks").insert({
                "user_id": user_id,
                "group_id": user_data.group_id,
                "timestamp": datetime.utcnow().isoformat()
            }).execute()

            return {
                "success": True,
                "user_id": user_id,
                "group_id": user_data.group_id
            }
        else:
            raise HTTPException(status_code=500, detail="Failed to register user")

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@app.get("/stats/group/{group_id}")
async def get_group_stats(group_id: int):
    """Get click statistics for a specific group"""
    try:
        # Get total clicks for the group
        clicks_result = supabase.table("clicks").select("*").eq("group_id", group_id).execute()

        # Get unique users who clicked
        users_result = supabase.table("clicks").select("user_id").eq("group_id", group_id).execute()
        unique_users = len(set([click["user_id"] for click in users_result.data]))

        # Get total users in group (assuming all users who have clicks are in the group)
        total_users_result = supabase.table("users").select("id").execute()
        total_users = len(total_users_result.data) if total_users_result.data else 0

        total_clicks = len(clicks_result.data)
        ctr = total_clicks / total_users if total_users > 0 else 0
        conversion_rate = unique_users / total_users if total_users > 0 else 0

        return {
            "group_id": group_id,
            "total_clicks": total_clicks,
            "unique_users": unique_users,
            "total_users": total_users,
            "ctr": ctr,
            "conversion_rate": conversion_rate
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@app.get("/stats/all")
async def get_all_stats():
    """Get statistics for all groups"""
    try:
        groups_result = supabase.table("groups").select("*").execute()
        stats = []

        for group in groups_result.data:
            group_id = group["id"]
            group_stats = await get_group_stats(group_id)
            group_stats["group_name"] = group["group_name"]
            stats.append(group_stats)

        return {"stats": stats}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

# For deployment instructions
@app.get("/deployment-info")
async def deployment_info():
    return {
        "message": "FastAPI backend for Comet A/B Testing",
        "deployment_platforms": [
            "Railway: Connect GitHub repo and deploy",
            "Vercel: Use vercel.json for deployment",
            "Heroku: Add Procfile with 'web: uvicorn main:app --host=0.0.0.0 --port=$PORT'",
            "AWS Lambda: Use Mangum for ASGI adapter"
        ],
        "environment_variables": [
            "SUPABASE_URL: Your Supabase project URL",
            "SUPABASE_ANON_KEY: Your Supabase anonymous key"
        ]
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)