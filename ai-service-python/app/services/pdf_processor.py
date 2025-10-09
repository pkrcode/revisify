import os
import requests
from langchain_community.document_loaders import PyPDFLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.embeddings import OllamaEmbeddings
from langchain_community.vectorstores import FAISS

# NEW: Import the YouTube topic generation service
from .youtube_service import generate_youtube_topics

NODE_BACKEND_URL = os.getenv("NODE_BACKEND_URL", "http://localhost:5000")
VECTOR_STORE_DIR = "vector_store"
os.makedirs(VECTOR_STORE_DIR, exist_ok=True)

# UPDATED: The callback now accepts an optional dictionary of topics
def notify_backend(pdf_id: str, status: str, vector_store_path: str | None = None, youtube_topics: list | None = None):
    """Calls back to the Node.js backend with the processing status and any generated data."""
    callback_url = f"{NODE_BACKEND_URL}/api/v1/pdfs/update-status"
    payload = { "pdfId": pdf_id, "status": status }
    if vector_store_path:
        payload["vectorStorePath"] = vector_store_path
    if youtube_topics:
        payload["youtubeTopics"] = youtube_topics # Add topics to the payload
    
    try:
        print(f"[{pdf_id}] Notifying backend with status: {status}")
        response = requests.post(callback_url, json=payload)
        response.raise_for_status()
        print(f"[{pdf_id}] Backend notified successfully.")
    except requests.exceptions.RequestException as e:
        print(f"[{pdf_id}] ERROR: Failed to notify backend: {e}")

# NOTE: We need an async function to call the async youtube service
async def process_pdf_and_store(pdf_id: str, pdf_url: str):
    """
    Downloads a PDF, creates a vector store, generates YouTube topics, and notifies the backend.
    """
    temp_pdf_path = f"temp_{pdf_id}.pdf"
    vector_store_path = os.path.join(VECTOR_STORE_DIR, f"{pdf_id}.faiss")

    try:
        # Steps 1 & 2: Download, Load, and Chunk (No change)
        print(f"[{pdf_id}] Downloading PDF from: {pdf_url}")
        response = requests.get(pdf_url, stream=True)
        response.raise_for_status()
        with open(temp_pdf_path, 'wb') as f:
            for chunk in response.iter_content(chunk_size=8192):
                f.write(chunk)
        print(f"[{pdf_id}] PDF downloaded successfully.")

        print(f"[{pdf_id}] Loading and chunking PDF...")
        loader = PyPDFLoader(temp_pdf_path)
        documents = loader.load()
        text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=150)
        chunks = text_splitter.split_documents(documents)
        print(f"[{pdf_id}] PDF split into {len(chunks)} chunks.")

        # Step 3: Create Embeddings and Vector Store (No change)
        print(f"[{pdf_id}] Creating embeddings with local nomic-embed-text...")
        embeddings = OllamaEmbeddings(model="nomic-embed-text")
        vector_store = FAISS.from_documents(chunks, embeddings)
        vector_store.save_local(vector_store_path)
        print(f"[{pdf_id}] Vector store saved to: {vector_store_path}")

        # NEW Step 4: Generate YouTube Topics
        print(f"[{pdf_id}] Generating YouTube topics...")
        # The service expects a dict, we get back a dict of {pdf_id: [topics]}
        topics_result = await generate_youtube_topics([pdf_id])
        # Extract the list of topics for our current PDF
        generated_topics = topics_result.get(pdf_id, [])
        print(f"[{pdf_id}] Generated topics: {generated_topics}")

        # Step 5: Notify backend of success with ALL the data
        notify_backend(pdf_id, "ready", vector_store_path, generated_topics)

    except Exception as e:
        print(f"[{pdf_id}] ERROR during processing: {e}")
        notify_backend(pdf_id, "failed")
    
    finally:
        if os.path.exists(temp_pdf_path):
            os.remove(temp_pdf_path)
            print(f"[{pdf_id}] Cleaned up temporary file: {temp_pdf_path}")