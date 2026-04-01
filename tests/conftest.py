import os

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import delete

os.environ["SECRET_KEY"] = "test-secret-key"
os.environ["DATABASE_URL"] = "sqlite:///:memory:"

from app.main import app
from app.database import engine
from sqlmodel import Session, SQLModel
from app.models import User, Transaction


@pytest.fixture(scope="session", autouse=True)
def setup_database():
    SQLModel.metadata.create_all(engine)
    yield
    engine.dispose()


@pytest.fixture
def client():
    return TestClient(app)


@pytest.fixture(autouse=True)
def clean_database():
    with Session(engine) as session:
        session.exec(delete(Transaction))
        session.exec(delete(User))
        session.commit()


@pytest.fixture
def test_user_data():
    return {
        "email": "test@example.com",
        "password": "password123"
    }


@pytest.fixture
def auth_headers(client, test_user_data):
    client.post("/auth/register", json=test_user_data)
    response = client.post("/auth/login", json=test_user_data)
    token = response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}
