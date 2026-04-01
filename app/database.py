from sqlmodel import SQLModel, create_engine
from app.core.config import DATABASE_URL, SQL_ECHO

engine = create_engine(DATABASE_URL, echo=SQL_ECHO)

def create_db():
    SQLModel.metadata.create_all(engine)
