from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from app.services.rag_service import generate_rag_response
from app.schemas.chat_schemas import ChatRequest

router = APIRouter()

@router.post("/chat")
async def handle_chat_request(request: ChatRequest):
    """
    Handles a chat request by calling the RAG service and streaming the response.
    """
    try:
        # The generate_rag_response function returns an async generator.
        response_generator = generate_rag_response(request.query, request.pdfIds)
        
        # We wrap this generator in a StreamingResponse.
        # This tells FastAPI to stream the output of the generator as it's produced,
        # rather than waiting for it to finish and trying to convert it to JSON.
        return StreamingResponse(response_generator, media_type="text/plain")

    except FileNotFoundError as e:
        return {"error": str(e)}, 404
    except ValueError as e:
        return {"error": str(e)}, 400
    except Exception as e:
        print(f"An unexpected error occurred in chat API: {e}")
        return {"error": "An internal error occurred in the AI service."}, 500

