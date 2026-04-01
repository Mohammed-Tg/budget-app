import pytest
from fastapi.testclient import TestClient


def test_empty_summary(client: TestClient, auth_headers):
    """Test summary with no transactions."""
    response = client.get("/summary/", headers=auth_headers)
    assert response.status_code == 200

    data = response.json()
    assert data["income"] == 0
    assert data["expense"] == 0
    assert data["balance"] == 0


def test_summary_with_transactions(client: TestClient, auth_headers):
    """Test summary calculation with transactions."""
    # Create some transactions
    transactions = [
        {"amount": 100.0, "type": "income", "category": "salary"},
        {"amount": 50.0, "type": "income", "category": "bonus"},
        {"amount": 30.0, "type": "expense", "category": "food"},
        {"amount": 20.0, "type": "expense", "category": "transport"},
    ]

    for tx in transactions:
        client.post("/transactions/", json=tx, headers=auth_headers)

    # Get summary
    response = client.get("/summary/", headers=auth_headers)
    assert response.status_code == 200

    data = response.json()
    assert data["income"] == 150.0  # 100 + 50
    assert data["expense"] == 50.0  # 30 + 20
    assert data["balance"] == 100.0  # 150 - 50


def test_summary_only_user_transactions(client: TestClient, auth_headers):
    """Test that summary only includes current user's transactions."""
    # Create transaction for current user
    tx_data = {"amount": 200.0, "type": "income", "category": "salary"}
    client.post("/transactions/", json=tx_data, headers=auth_headers)

    # Create another user and transaction
    other_user_data = {"email": "other@example.com", "password": "password123"}
    client.post("/auth/register", json=other_user_data)

    other_login = client.post("/auth/login", json=other_user_data)
    other_token = other_login.json()["access_token"]
    other_headers = {"Authorization": f"Bearer {other_token}"}

    # Other user creates transaction
    other_tx = {"amount": 500.0, "type": "income", "category": "salary"}
    client.post("/transactions/", json=other_tx, headers=other_headers)

    # Current user's summary should only show their transaction
    response = client.get("/summary/", headers=auth_headers)
    assert response.status_code == 200

    data = response.json()
    assert data["income"] == 200.0  # Only current user's transaction
    assert data["expense"] == 0
    assert data["balance"] == 200.0

    # Other user's summary should only show their transaction
    other_response = client.get("/summary/", headers=other_headers)
    other_data = other_response.json()
    assert other_data["income"] == 500.0
    assert other_data["expense"] == 0
    assert other_data["balance"] == 500.0


def test_summary_unauthorized(client: TestClient):
    """Test that summary requires authentication."""
    response = client.get("/summary/")
    assert response.status_code == 401
    assert "Not authenticated" in response.json()["detail"] or "Invalid token" in response.json()["detail"]