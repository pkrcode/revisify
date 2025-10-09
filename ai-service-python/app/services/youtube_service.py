import os
from typing import List, Dict
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.output_parsers import JsonOutputParser
from langchain_core.prompts import PromptTemplate
from pydantic import BaseModel, Field

from .quiz_service import get_context_from_pdfs # Reuse the context function

# --- Model Initialization ---
llm = ChatGoogleGenerativeAI(model="models/gemini-pro-latest", temperature=0.5)

# --- Pydantic model for structured output ---
class TopicList(BaseModel):
    """A Pydantic model to structure the LLM's output."""
    topics: List[str] = Field(description="A list of exactly two YouTube search topics.")

async def generate_youtube_topics(pdf_ids: List[str]) -> Dict[str, List[str]]:
    """
    For each PDF, generates two relevant YouTube search topics using an LLM.
    """
    print(f"Generating YouTube topics for PDFs: {pdf_ids}")
    
    parser = JsonOutputParser(pydantic_object=TopicList)
    
    prompt = PromptTemplate(
        template="""You are a helpful academic tutor.
Based on the following text from a document, suggest exactly two concise and relevant YouTube video search topics that would help a student understand this content better.

{format_instructions}

CONTEXT FROM DOCUMENT:
{context}
""",
        input_variables=["context"],
        partial_variables={"format_instructions": parser.get_format_instructions()}
    )
    
    chain = prompt | llm | parser
    
    results: Dict[str, List[str]] = {}
    
    for pdf_id in pdf_ids:
        try:
            # Get a small amount of context from the specific PDF
            context = get_context_from_pdfs([pdf_id])
            
            print(f"Invoking LLM for YouTube topics for PDF: {pdf_id}")
            response = await chain.ainvoke({"context": context})
            
            # The parser gives us a dict {'topics': ['topic1', 'topic2']}
            results[pdf_id] = response.get('topics', [])
            
        except Exception as e:
            print(f"Error generating topics for PDF {pdf_id}: {e}")
            results[pdf_id] = [] # Return empty list on error
            
    return results