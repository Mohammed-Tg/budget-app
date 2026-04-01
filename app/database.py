from sqlalchemy.pool import StaticPool
from sqlmodel import SQLModel, create_engine
from app.core.config import DATABASE_URL, SQL_ECHO

if DATABASE_URL == "sqlite:///:memory:":
    engine = create_engine(
        DATABASE_URL,
        echo=SQL_ECHO,
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
else:
    engine = create_engine(DATABASE_URL, echo=SQL_ECHO)

def create_db():
    SQLModel.metadata.create_all(engine)
