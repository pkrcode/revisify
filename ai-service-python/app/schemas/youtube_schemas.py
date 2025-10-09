from pydantic import BaseModel, Field
from typing import List, Dict

class YouTubeTopicsRequest(BaseModel):
    """Request model for generating YouTube topics."""
    pdfIds: List[str] = Field(..., description="A list of PDF IDs to generate topics for.")

class YouTubeTopicsResponse(BaseModel):
    """Response model containing the generated topics for each PDF."""
    topics: Dict[str, List[str]] = Field(..., description="A dictionary mapping each PDF ID to a list of YouTube search topics.")