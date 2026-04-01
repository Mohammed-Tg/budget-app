import pytest
from fastapi.testclient import TestClient


def test_register_user(client: TestClient):
    """Test user registration."""
    user_data = {
        "email": "newuser@example.com",
        "password": "password123"
    }

    response = client.post("/auth/register", json=user_data)
    assert response.status_code == 200
    assert response.json() == {"message": "User created"}


def test_register_duplicate_user(client: TestClient):
    """Test registering user with existing email."""
    user_data = {
        "email": "duplicate@example.com",
        "password": "password123"
    }

    # First registration should succeed
    response1 = client.post("/auth/register", json=user_data)
    assert response1.status_code == 200

    # Second registration should fail
    response2 = client.post("/auth/register", json=user_data)
    assert response2.status_code == 400
    assert "already exists" in response2.json()["detail"]


def test_login_success(client: TestClient):
    """Test successful login."""
    user_data = {
        "email": "loginuser@example.com",
        "password": "password123"
    }

    # Register first
    client.post("/auth/register", json=user_data)

    # Login
    response = client.post("/auth/login", json=user_data)
    assert response.status_code == 200

    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert "message" in data


def test_login_invalid_credentials(client: TestClient):
    """Test login with invalid credentials."""
    user_data = {
        "email": "nonexistent@example.com",
        "password": "wrongpassword"
    }

    response = client.post("/auth/login", json=user_data)
    assert response.status_code == 401
    assert "Invalid credentials" in response.json()["detail"]


def test_login_wrong_password(client: TestClient):
    """Test login with wrong password."""
    user_data = {
        "email": "wrongpass@example.com",
        "password": "correctpassword"
    }

    # Register with correct password
    response = client.post("/auth/register", json=user_data)
    assert response.status_code == 200

    # Try login with wrong password
    wrong_data = {
        "email": "wrongpass@example.com",
        "password": "wrongpassword123"
    }

    response = client.post("/auth/login", json=wrong_data)
    assert response.status_code == 401
    assert "Invalid credentials" in response.json()["detail"]