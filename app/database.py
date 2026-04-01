from sqlalchemy.pool import StaticPool
from sqlmodel import SQLModel, create_engine
from app.core.config import DATABASE_URL, SQL_ECHO

# Schema migration is managed by Alembic migrations.
# Avoid parallel runtime create_all() usage in production.
if DATABASE_URL == "sqlite:///:memory:":
    engine = create_engine(
        DATABASE_URL,
        echo=SQL_ECHO,
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
else:
    engine = create_engine(DATABASE_URL, echo=SQL_ECHO)
