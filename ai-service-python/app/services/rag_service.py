import os
from typing import List, AsyncGenerator
from langchain_community.vectorstores import FAISS
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_community.embeddings import OllamaEmbeddings
from langchain.prompts import PromptTemplate
from langchain_core.runnables import RunnablePassthrough
from langchain_core.output_parsers import StrOutputParser
from langchain_core.documents import Document
import google.generativeai as genai

if "GOOGLE_API_KEY" not in os.environ:
    raise ValueError("GOOGLE_API_KEY environment variable not set.")
genai.configure(api_key=os.environ["GOOGLE_API_KEY"])

VECTOR_STORE_DIR = "vector_store"

# CORRECTED MODEL NAME
llm = ChatGoogleGenerativeAI(model="models/gemini-pro-latest", temperature=0.3)
embeddings = OllamaEmbeddings(model="nomic-embed-text")

prompt_template = """
You are a helpful study assistant. Answer the user's question based exclusively on the provided context.
If the answer is not in the context, say so. You MUST cite the source page number.
CONTEXT:
{context}
QUESTION:
{question}
ANSWER:
"""
prompt = PromptTemplate(template=prompt_template, input_variables=["context", "question"])

def format_docs(docs: List[Document]) -> str:
    return "\n\n".join(
        f"Content from page {doc.metadata.get('page', 'N/A')}:\n{doc.page_content}"
        for doc in docs
    )

async def generate_rag_response(query: str, pdf_ids: List[str]) -> AsyncGenerator[str, None]:
    if not pdf_ids:
        raise ValueError("No PDF IDs provided for context.")
    merged_store = None
    for i, pdf_id in enumerate(pdf_ids):
        vector_store_path = os.path.join(VECTOR_STORE_DIR, f"{pdf_id}.faiss")
        if not os.path.exists(vector_store_path):
            raise FileNotFoundError(f"Vector store not found for PDF ID: {pdf_id}.")
        store = FAISS.load_local(vector_store_path, embeddings, allow_dangerous_deserialization=True)
        if i == 0:
            merged_store = store
        else:
            merged_store.merge_from(store)
    if not merged_store:
        raise ValueError("Failed to load any vector stores.")
    retriever = merged_store.as_retriever(search_kwargs={"k": 4})
    rag_chain = (
        {"context": retriever, "question": RunnablePassthrough()}
        | prompt
        | llm
        | StrOutputParser()
    )
    async for chunk in rag_chain.astream(query):
        yield chunk