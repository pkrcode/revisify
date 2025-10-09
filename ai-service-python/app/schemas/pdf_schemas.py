from pydantic import BaseModel, HttpUrl

class PDFProcessRequest(BaseModel):
    """
    Defines the expected request body for the PDF processing endpoint.
    """
    pdfId: str
    pdfUrl: HttpUrl

