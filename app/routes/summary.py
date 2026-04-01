from decimal import Decimal

from fastapi import APIRouter, Depends
from sqlalchemy import case, func
from sqlmodel import Session, select

from app.core.deps import get_current_user
from app.database import engine
from app.models import Transaction
from app.schemas import SummaryOut

router = APIRouter()


@router.get("/", response_model=SummaryOut)
def get_summary(current_user=Depends(get_current_user)):
    with Session(engine) as session:
        statement = select(
            func.coalesce(
                func.sum(case((Transaction.type == "income", Transaction.amount), else_=0)),
                0,
            ),
            func.coalesce(
                func.sum(case((Transaction.type == "expense", Transaction.amount), else_=0)),
                0,
            ),
        ).where(Transaction.user_id == current_user.id)

        income, expense = session.exec(statement).one()
        income = Decimal(income)
        expense = Decimal(expense)

        return {
            "income": income,
            "expense": expense,
            "balance": income - expense,
        }
