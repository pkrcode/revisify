from fastapi import APIRouter, HTTPException, BackgroundTasks
from ..schemas.pdf_schemas import PDFProcessRequest
from ..services.pdf_processor import process_pdf_and_store

router = APIRouter()

@router.post("/process-pdf", status_code=202)
async def handle_pdf_processing(
    request: PDFProcessRequest,
    background_tasks: BackgroundTasks # Inject BackgroundTasks
):
    """
    Accepts a PDF processing request and runs the process in the background.
    Responds immediately with a 202 Accepted status.
    """
    print(f"Received request to process PDF ID: {request.pdfId}")
    
    # Add the long-running async task to the background
    background_tasks.add_task(
        process_pdf_and_store,
        pdf_id=request.pdfId,
        pdf_url=request.pdfUrl
    )
    
    return {"message": "PDF processing has been accepted and started in the background."}