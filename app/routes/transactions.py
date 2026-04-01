from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select

from app.core.deps import get_current_user
from app.database import engine
from app.models import Transaction
from app.schemas import MessageResponse, TransactionCreate, TransactionOut, TransactionUpdate

router = APIRouter()


@router.post("/", response_model=TransactionOut)
def add_transaction(tx_data: TransactionCreate, current_user=Depends(get_current_user)):
    with Session(engine) as session:
        tx = Transaction(
            user_id=current_user.id,
            amount=tx_data.amount,
            type=tx_data.type,
            category=tx_data.category,
            date=tx_data.date,
        )
        session.add(tx)
        session.commit()
        session.refresh(tx)
        return tx


@router.get("/", response_model=list[TransactionOut])
def get_transactions(current_user=Depends(get_current_user)):
    with Session(engine) as session:
        statement = (
            select(Transaction)
            .where(Transaction.user_id == current_user.id)
            .order_by(Transaction.date.desc(), Transaction.id.desc())
        )
        return session.exec(statement).all()


@router.get("/{transaction_id}", response_model=TransactionOut)
def get_transaction(transaction_id: int, current_user=Depends(get_current_user)):
    with Session(engine) as session:
        tx = session.get(Transaction, transaction_id)
        if not tx:
            raise HTTPException(status_code=404, detail="Transaction not found")
        if tx.user_id != current_user.id:
            raise HTTPException(status_code=403, detail="Not authorized to view this transaction")
        return tx


@router.put("/{transaction_id}", response_model=TransactionOut)
def update_transaction(
    transaction_id: int,
    tx_data: TransactionUpdate,
    current_user=Depends(get_current_user),
):
    with Session(engine) as session:
        tx = session.get(Transaction, transaction_id)
        if not tx:
            raise HTTPException(status_code=404, detail="Transaction not found")
        if tx.user_id != current_user.id:
            raise HTTPException(status_code=403, detail="Not authorized to update this transaction")

        update_data = tx_data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(tx, field, value)

        session.add(tx)
        session.commit()
        session.refresh(tx)
        return tx


@router.delete("/{transaction_id}", response_model=MessageResponse)
def delete_transaction(transaction_id: int, current_user=Depends(get_current_user)):
    with Session(engine) as session:
        tx = session.get(Transaction, transaction_id)
        if not tx:
            raise HTTPException(status_code=404, detail="Transaction not found")
        if tx.user_id != current_user.id:
            raise HTTPException(status_code=403, detail="Not authorized to delete this transaction")

        session.delete(tx)
        session.commit()
        return {"message": "Transaction deleted successfully"}
