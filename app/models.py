from datetime import UTC, datetime
from decimal import Decimal
from typing import Optional

from sqlalchemy import CheckConstraint, Column, Numeric
from sqlmodel import Field, SQLModel


class User(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    email: str = Field(index=True, unique=True)
    password_hash: str


class Transaction(SQLModel, table=True):
    __table_args__ = (
        CheckConstraint("amount > 0", name="ck_transaction_amount_positive"),
        CheckConstraint(
            "type IN ('income', 'expense')",
            name="ck_transaction_type_valid",
        ),
    )

    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id", index=True)
    amount: Decimal = Field(sa_column=Column(Numeric(12, 2), nullable=False))
    type: str
    category: str
    date: datetime = Field(default_factory=lambda: datetime.now(UTC))
