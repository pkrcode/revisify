from fastapi import FastAPI
from dotenv import load_dotenv
import os

# Load environment variables at the very beginning
load_dotenv()

# Import routers after loading env vars
from app.api import pdf_api, chat_api, quiz_api, youtube_api # Import the new youtube_api

app = FastAPI(title="AI Microservice for Study App")

# Include the API routers
app.include_router(pdf_api.router, prefix="/api/v1", tags=["PDF Processing"])
app.include_router(chat_api.router, prefix="/api/v1", tags=["Chat & RAG"])
app.include_router(quiz_api.router, prefix="/api/v1", tags=["Quiz Generation & Grading"])

@app.get("/", tags=["Root"])
def read_root():
    return {"message": "AI service is running."}