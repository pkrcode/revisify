from fastapi import APIRouter, HTTPException
from ..schemas.youtube_schemas import YouTubeTopicsRequest, YouTubeTopicsResponse
from ..services.youtube_service import generate_youtube_topics

router = APIRouter()

@router.post("/youtube/generate-topics", response_model=YouTubeTopicsResponse)
async def handle_youtube_topics_request(request: YouTubeTopicsRequest):
    """
    Endpoint to generate YouTube search topics from a list of PDF documents.
    """
    try:
        topics_dict = await generate_youtube_topics(request.pdfIds)
        return YouTubeTopicsResponse(topics=topics_dict)
    except Exception as e:
        print(f"An unexpected error occurred during topic generation: {e}")
        raise HTTPException(status_code=500, detail="An internal error occurred while generating topics.")