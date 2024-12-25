from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from .. import models, schemas, auth
from ..database import get_db
from ..auth import get_current_user
from typing import List

router = APIRouter()


@router.post("/users/", response_model=schemas.User)
def create_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email уже зарегистрирован")

    hashed_password = auth.get_password_hash(user.password)
    db_user = models.User(email=user.email, hashed_password=hashed_password)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


@router.get("/users/me/", response_model=schemas.User)
def read_user_me(current_user: models.User = Depends(get_current_user)):
    return current_user


@router.get("/users/me/results", response_model=List[schemas.TestResult])
def read_user_results(
    current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)
):
    return (
        db.query(models.TestResult)
        .filter(models.TestResult.user_id == current_user.id)
        .all()
    )
