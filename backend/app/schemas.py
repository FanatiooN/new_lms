from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime


class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    email: Optional[str] = None

class UserBase(BaseModel):
    email: str

class UserCreate(UserBase):
    password: str


class User(UserBase):
    id: int
    is_active: bool

    class Config:
        from_attributes = True


class TestBase(BaseModel):
    id: int
    title: str
    description: str

    class Config:
        from_attributes = True
        populate_by_name = True
        json_schema_extra = {
            "example": {
                "id": 1,
                "title": "Test Title",
                "description": "Test Description",
            }
        }


class TestResult(BaseModel):
    id: int
    test_id: int
    score: int
    completed_at: datetime

    class Config:
        from_attributes = True


class QuestionCreate(BaseModel):
    question_text: str
    options: List[str]
    correct_answer: int


class QuestionResponse(BaseModel):
    id: int
    question_text: str
    options: List[str]

    class Config:
        from_attributes = True


class TestCreate(BaseModel):
    title: str
    description: str
    questions: List[QuestionCreate]


class TestWithQuestions(TestBase):
    id: int
    questions: List[QuestionResponse]

    class Config:
        from_attributes = True


class TestSubmission(BaseModel):
    answers: dict[int, int]
