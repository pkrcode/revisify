from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse
from ..schemas.quiz_schemas import QuizGenerationRequest, GeneratedQuiz, QuizGradingRequest, QuizGradingResponse
from ..services.quiz_service import generate_quiz_from_pdfs, grade_quiz_submission

router = APIRouter()

@router.post("/generate-quiz", response_model=GeneratedQuiz)
async def handle_generate_quiz(request: QuizGenerationRequest):
    """
    Endpoint to generate a quiz from a list of PDF documents.
    """
    try:
        quiz = await generate_quiz_from_pdfs(request)
        return quiz
    except FileNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        print(f"An unexpected error occurred during quiz generation: {e}")
        # Return a proper JSONResponse to avoid the FastAPI crash
        return JSONResponse(
            status_code=500,
            content={"detail": "An internal error occurred while generating the quiz."}
        )

@router.post("/grade-quiz", response_model=QuizGradingResponse)
async def handle_grade_quiz(request: QuizGradingRequest):
    """
    Endpoint to grade a user's quiz submission.
    """
    try:
        grading_result = await grade_quiz_submission(request)
        return grading_result
    except Exception as e:
        print(f"An unexpected error occurred during quiz grading: {e}")
        raise HTTPException(status_code=500, detail="An internal error occurred during quiz grading.")