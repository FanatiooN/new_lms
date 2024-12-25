from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from .routers import auth, users, tests
from .database import engine
from . import models
from .auth import get_current_user

# Создаем таблицы
models.Base.metadata.create_all(bind=engine)

app = FastAPI()

# Настройка CORS с явным указанием заголовков авторизации
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*", "Authorization"],
)

# Подключаем роутеры
app.include_router(auth.router, tags=["auth"])
app.include_router(users.router, tags=["users"])
app.include_router(tests.router, tags=["tests"])


# Добавим тестовый эндпоинт для проверки авторизации
@app.get("/test-auth")
async def test_auth(current_user=Depends(get_current_user)):
    return {"message": "Successfully authenticated", "user": current_user.email}
