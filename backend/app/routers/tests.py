import json
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from .. import models, schemas, auth
from ..database import get_db

router = APIRouter()
@router.get(
    "/tests/", response_model=List[schemas.TestBase], response_model_exclude_none=True
)
def get_tests(
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db),
):
    tests = db.query(models.Test).all()
    print("Tests from DB:", tests)  # Добавляем отладочный вывод
    return tests


@router.get("/tests/{test_id}", response_model=schemas.TestBase)
def get_test(
    test_id: int,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db),
):
    test = db.query(models.Test).filter(models.Test.id == test_id).first()
    if not test:
        raise HTTPException(status_code=404, detail="Тест не найден")
    return test


@router.post("/tests/", response_model=schemas.TestWithQuestions)
def create_test(
    test: schemas.TestCreate,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db),
):
    try:
        db_test = models.Test(title=test.title, description=test.description)
        db.add(db_test)
        db.commit()
        db.refresh(db_test)
        for question in test.questions:
            db_question = models.Question(
                test_id=db_test.id,
                question_text=question.question_text,
                options=json.dumps(question.options),
                correct_answer=question.correct_answer,
            )
            db.add(db_question)
        db.commit()
        db_test = db.query(models.Test).filter(models.Test.id == db_test.id).first()
        for question in db_test.questions:
            question.options = json.loads(question.options)
        return db_test
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.get("/tests/{test_id}/questions", response_model=List[schemas.QuestionResponse])
def get_test_questions(
    test_id: int,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db),
):
    questions = (
        db.query(models.Question).filter(models.Question.test_id == test_id).all()
    )
    if not questions:
        return []
    for question in questions:
        question.options = json.loads(question.options)
    return questions


@router.post("/tests/{test_id}/submit", response_model=schemas.TestResult)
def submit_test(
    test_id: int,
    submission: schemas.TestSubmission,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db),
):
    questions = (
        db.query(models.Question).filter(models.Question.test_id == test_id).all()
    )
    if not questions:
        raise HTTPException(status_code=404, detail="Тест не найден")

    correct_answers = 0
    total_questions = len(questions)
    for question in questions:
        user_answer = submission.answers.get(question.id)
        if user_answer is not None and user_answer == question.correct_answer:
            correct_answers += 1
    score = int((correct_answers / total_questions) * 100)
    test_result = models.TestResult(
        user_id=current_user.id, test_id=test_id, score=score
    )
    db.add(test_result)
    db.commit()
    db.refresh(test_result)
    return test_result


@router.delete("/tests/all", status_code=status.HTTP_204_NO_CONTENT)
def delete_all_tests(
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db),
):
    try:
        db.query(models.TestResult).delete()

        db.query(models.Question).delete()

        db.query(models.Test).delete()

        db.commit()
        return {"message": "Все тесты успешно удалены"}

    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e)
        )
