import os
import json
import random
from typing import List, Dict
from langchain_community.vectorstores import FAISS
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_community.embeddings import OllamaEmbeddings
from langchain_core.output_parsers import JsonOutputParser
from langchain_core.prompts import PromptTemplate
from pydantic import ValidationError

from ..schemas.quiz_schemas import (
    QuizGenerationRequest, GeneratedQuiz,
    QuizGradingRequest, QuizGradingResponse, GradedQuestion
)
from .rag_service import VECTOR_STORE_DIR

# --- Model Initialization (Hybrid) ---
# Use the full, correct model name from your list
llm = ChatGoogleGenerativeAI(model="models/gemini-pro-latest", temperature=0.3)
# Use local Ollama for loading/retrieving embeddings
embeddings = OllamaEmbeddings(model="nomic-embed-text")

def get_context_from_pdfs(pdf_ids: List[str]) -> str:
    all_docs = []
    for pdf_id in pdf_ids:
        vector_store_path = os.path.join(VECTOR_STORE_DIR, f"{pdf_id}.faiss")
        if not os.path.exists(vector_store_path):
            raise FileNotFoundError(f"Vector store not found for PDF ID: {pdf_id}.")
        store = FAISS.load_local(vector_store_path, embeddings, allow_dangerous_deserialization=True)
        all_docs.extend(list(store.docstore._dict.values()))

    num_samples = min(15, len(all_docs))
    sampled_docs = random.sample(all_docs, num_samples)
    return "\n\n".join(
        f"Content from page {doc.metadata.get('page', 'N/A')}:\n{doc.page_content}"
        for doc in sampled_docs
    )

def fix_quiz_json(data: Dict) -> Dict:
    if all(k in data for k in ['mcqs', 'saqs', 'laqs']): return data
    if 'questions' in data and isinstance(data['questions'], dict):
        d = data['questions']
        return {
            'mcqs': next((v for k,v in d.items() if k.lower()=='mcqs'),[]),
            'saqs': next((v for k,v in d.items() if k.lower()=='saqs'),[]),
            'laqs': next((v for k,v in d.items() if k.lower()=='laqs'),[])
        }
    if 'questions' in data and isinstance(data['questions'], list):
        return {
            'mcqs': [q for q in data['questions'] if q.get('question_type')=='mcq'],
            'saqs': [q for q in data['questions'] if q.get('question_type')=='saq'],
            'laqs': [q for q in data['questions'] if q.get('question_type')=='laq']
        }
    mcqs=next((v for k,v in data.items() if k.lower()=='mcqs'),None)
    saqs=next((v for k,v in data.items() if k.lower()=='saqs'),None)
    laqs=next((v for k,v in data.items() if k.lower()=='laqs'),None)
    if all([mcqs, saqs, laqs]): return {'mcqs':mcqs,'saqs':saqs,'laqs':laqs}
    raise ValueError("LLM output is in an unknown format and could not be corrected.")

async def generate_quiz_from_pdfs(request: QuizGenerationRequest) -> GeneratedQuiz:
    context = get_context_from_pdfs(request.pdfIds)
    parser = JsonOutputParser(pydantic_object=GeneratedQuiz)
    prompt = PromptTemplate(
        template="""You are an expert quiz creator. Based *only* on the provided context, generate a quiz.
{format_instructions}
CONTEXT:
{context}
Generate a quiz with: {numMCQs} MCQs, {numSAQs} SAQs, {numLAQs} LAQs.""",
        input_variables=["context", "numMCQs", "numSAQs", "numLAQs"],
        partial_variables={"format_instructions": parser.get_format_instructions()}
    )
    chain = prompt | llm | parser
    try:
        raw_result = await chain.ainvoke({
            "context": context, "numMCQs": request.numMCQs,
            "numSAQs": request.numSAQs, "numLAQs": request.numLAQs
        })
        return GeneratedQuiz(**fix_quiz_json(raw_result))
    except (ValueError, ValidationError) as e:
        print(f"Error parsing/validating LLM output: {e}")
        raise ValueError("Failed to generate a valid quiz from the AI service.")

async def grade_quiz_submission(request: QuizGradingRequest) -> QuizGradingResponse:
    graded_questions, total_score = [], 0
    parser = JsonOutputParser(pydantic_object=GradedQuestion)
    prompt = PromptTemplate(
        template="""Grade the student's answer based on the ideal answer. Provide a score and brief explanation.
Max score SAQ=3, LAQ=5.
{format_instructions}
QUESTION: {question}
IDEAL ANSWER: {ideal_answer}
STUDENT'S ANSWER: {user_answer}""",
        input_variables=["question", "ideal_answer", "user_answer"],
        partial_variables={"format_instructions": parser.get_format_instructions()}
    )
    chain = prompt | llm | parser
    for item in request.questions_to_grade:
        if item.question_type == 'mcq':
            score = 1 if item.user_answer.strip().lower() == item.ideal_answer.strip().lower() else 0
            explanation = "Correct!" if score == 1 else f"Incorrect. The correct answer is: {item.ideal_answer}"
            graded_questions.append(GradedQuestion(question=item.question, score=score, explanation=explanation))
            total_score += score
        else:
            try:
                res=await chain.ainvoke({
                    "question": item.question, "ideal_answer": item.ideal_answer,
                    "user_answer": item.user_answer
                })
                graded_questions.append(GradedQuestion(**res))
                total_score += res.get('score', 0)
            except Exception as e:
                graded_questions.append(GradedQuestion(question=item.question, score=0,
                    explanation=f"AI error during grading: {e}"))
    return QuizGradingResponse(graded_questions=graded_questions, total_score=total_score)