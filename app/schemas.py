from datetime import UTC, datetime
from decimal import Decimal
from typing import Literal, Optional

from pydantic import BaseModel, ConfigDict, Field, field_serializer, field_validator


class UserCreate(BaseModel):
    email: str
    password: str = Field(min_length=8, max_length=128)

    @field_validator("email", mode="before")
    @classmethod
    def normalize_email(cls, value: str) -> str:
        email = value.strip().lower()
        if "@" not in email or "." not in email.split("@")[-1]:
            raise ValueError("Invalid email address")
        return email


class UserLogin(BaseModel):
    email: str
    password: str = Field(min_length=8, max_length=128)

    @field_validator("email", mode="before")
    @classmethod
    def normalize_email(cls, value: str) -> str:
        email = value.strip().lower()
        if "@" not in email or "." not in email.split("@")[-1]:
            raise ValueError("Invalid email address")
        return email


class TransactionCreate(BaseModel):
    amount: Decimal = Field(gt=Decimal("0"), description="Amount must be positive")
    type: Literal["income", "expense"]
    category: str = Field(min_length=1, max_length=50)
    date: datetime = Field(default_factory=lambda: datetime.now(UTC))


class TransactionUpdate(BaseModel):
    amount: Optional[Decimal] = Field(None, gt=Decimal("0"), description="Amount must be positive")
    type: Optional[Literal["income", "expense"]] = None
    category: Optional[str] = Field(None, min_length=1, max_length=50)
    date: Optional[datetime] = None


class MessageResponse(BaseModel):
    message: str


class TokenResponse(BaseModel):
    message: str
    access_token: str
    token_type: Literal["bearer"]


class TransactionOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    amount: Decimal
    type: Literal["income", "expense"]
    category: str
    date: datetime

    @field_serializer("amount")
    def serialize_amount(self, value: Decimal) -> float:
        return float(value)


class SummaryOut(BaseModel):
    income: Decimal
    expense: Decimal
    balance: Decimal

    @field_serializer("income", "expense", "balance")
    def serialize_decimal(self, value: Decimal) -> float:
        return float(value)
