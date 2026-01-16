import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

# Import Routers directly from endpoints (Correct Structure)
from app.api.endpoints import ingest
from app.api.endpoints import chat
from app.core.config import settings

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="A production-grade RAG backend for Video Q&A with Timestamp Retrieval.",
    version="1.0.0"
)

# --- CORS Configuration ---
# Allow all origins for development flexibility
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"]
)

# --- Static File Serving ---
# This mounts the 'temp_uploads' directory to '/static'
# Allows frontend to access videos via http://localhost:8001/static/filename.mp4
TEMP_UPLOAD_DIR = "temp_uploads"
os.makedirs(TEMP_UPLOAD_DIR, exist_ok=True)

app.mount("/static", StaticFiles(directory=TEMP_UPLOAD_DIR), name="static")

# --- Router Registration ---
app.include_router(ingest.router, prefix=settings.API_V1_STR, tags=["Ingestion"])
app.include_router(chat.router, prefix=settings.API_V1_STR, tags=["Chat"])

@app.get("/")
async def root():
    return {"status": "active", "message": "Video RAG Agent API is running."}

if __name__ == "__main__":
    import uvicorn
    # Use port 8001 to avoid conflicts with other local services
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)