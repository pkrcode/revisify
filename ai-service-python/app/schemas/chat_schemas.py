from pydantic import BaseModel
from typing import List

class ChatRequest(BaseModel):
    """
    Defines the data model for a user's chat query.
    It includes the question and a list of PDF IDs for context.
    """
    query: str
    pdfIds: List[str]
