from fastapi import APIRouter, HTTPException
from sqlalchemy.exc import IntegrityError
from sqlmodel import Session, select

from app.core.security import create_access_token, hash_password, verify_password
from app.crud.user import get_user_by_email
from app.database import engine
from app.models import User
from app.schemas import MessageResponse, TokenResponse, UserCreate, UserLogin

router = APIRouter()


@router.post("/register", response_model=MessageResponse)
def register(user: UserCreate):
    with Session(engine) as session:
        existing = session.exec(
            select(User).where(User.email == user.email)
        ).first()

        if existing:
            raise HTTPException(status_code=400, detail="User already exists")

        new_user = User(
            email=user.email,
            password_hash=hash_password(user.password),
        )

        session.add(new_user)
        try:
            session.commit()
        except IntegrityError as exc:
            session.rollback()
            raise HTTPException(status_code=400, detail="User already exists") from exc

        return {"message": "User created"}


@router.post("/login", response_model=TokenResponse)
def login(data: UserLogin):
    user = get_user_by_email(data.email)

    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    if not verify_password(data.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = create_access_token({"sub": str(user.id)})
    return {
        "message": "Login success",
        "access_token": token,
        "token_type": "bearer",
    }
