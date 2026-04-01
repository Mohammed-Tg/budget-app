import pytest
from fastapi.testclient import TestClient


def test_create_transaction(client: TestClient, auth_headers):
    """Test creating a transaction."""
    tx_data = {
        "amount": 50.0,
        "type": "expense",
        "category": "food"
    }

    response = client.post("/transactions/", json=tx_data, headers=auth_headers)
    assert response.status_code == 200

    data = response.json()
    assert data["amount"] == 50.0
    assert data["type"] == "expense"
    assert data["category"] == "food"
    assert "id" in data
    assert "user_id" in data
    assert "date" in data


def test_create_transaction_validation(client: TestClient, auth_headers):
    """Test transaction validation."""
    # Test negative amount
    tx_data = {
        "amount": -10.0,
        "type": "expense",
        "category": "food"
    }

    response = client.post("/transactions/", json=tx_data, headers=auth_headers)
    assert response.status_code == 422  # Validation error

    # Test invalid type
    tx_data = {
        "amount": 10.0,
        "type": "invalid_type",
        "category": "food"
    }

    response = client.post("/transactions/", json=tx_data, headers=auth_headers)
    assert response.status_code == 422


def test_get_transactions(client: TestClient, auth_headers):
    """Test getting user's transactions."""
    # Create a transaction first
    tx_data = {
        "amount": 25.0,
        "type": "income",
        "category": "salary"
    }
    client.post("/transactions/", json=tx_data, headers=auth_headers)

    # Get transactions
    response = client.get("/transactions/", headers=auth_headers)
    assert response.status_code == 200

    data = response.json()
    assert isinstance(data, list)
    assert len(data) >= 1

    # Check the transaction we created
    tx = data[-1]  # Last transaction
    assert tx["amount"] == 25.0
    assert tx["type"] == "income"
    assert tx["category"] == "salary"


def test_get_single_transaction(client: TestClient, auth_headers):
    """Test getting a single transaction."""
    # Create a transaction first
    tx_data = {
        "amount": 100.0,
        "type": "income",
        "category": "bonus"
    }
    create_response = client.post("/transactions/", json=tx_data, headers=auth_headers)
    tx_id = create_response.json()["id"]

    # Get the specific transaction
    response = client.get(f"/transactions/{tx_id}", headers=auth_headers)
    assert response.status_code == 200

    data = response.json()
    assert data["id"] == tx_id
    assert data["amount"] == 100.0
    assert data["type"] == "income"
    assert data["category"] == "bonus"


def test_get_nonexistent_transaction(client: TestClient, auth_headers):
    """Test getting a transaction that doesn't exist."""
    response = client.get("/transactions/99999", headers=auth_headers)
    assert response.status_code == 404
    assert "not found" in response.json()["detail"].lower()


def test_update_transaction(client: TestClient, auth_headers):
    """Test updating a transaction."""
    # Create a transaction first
    tx_data = {
        "amount": 30.0,
        "type": "expense",
        "category": "transport"
    }
    create_response = client.post("/transactions/", json=tx_data, headers=auth_headers)
    tx_id = create_response.json()["id"]

    # Update the transaction
    update_data = {
        "amount": 45.0,
        "category": "taxi"
    }
    response = client.put(f"/transactions/{tx_id}", json=update_data, headers=auth_headers)
    assert response.status_code == 200

    data = response.json()
    assert data["id"] == tx_id
    assert data["amount"] == 45.0
    assert data["type"] == "expense"  # Should remain unchanged
    assert data["category"] == "taxi"  # Should be updated


def test_update_nonexistent_transaction(client: TestClient, auth_headers):
    """Test updating a transaction that doesn't exist."""
    update_data = {"amount": 50.0}
    response = client.put("/transactions/99999", json=update_data, headers=auth_headers)
    assert response.status_code == 404


def test_delete_transaction(client: TestClient, auth_headers):
    """Test deleting a transaction."""
    # Create a transaction first
    tx_data = {
        "amount": 20.0,
        "type": "expense",
        "category": "coffee"
    }
    create_response = client.post("/transactions/", json=tx_data, headers=auth_headers)
    tx_id = create_response.json()["id"]

    # Delete the transaction
    response = client.delete(f"/transactions/{tx_id}", headers=auth_headers)
    assert response.status_code == 200
    assert response.json() == {"message": "Transaction deleted successfully"}

    # Try to get the deleted transaction
    get_response = client.get(f"/transactions/{tx_id}", headers=auth_headers)
    assert get_response.status_code == 404


def test_delete_nonexistent_transaction(client: TestClient, auth_headers):
    """Test deleting a transaction that doesn't exist."""
    response = client.delete("/transactions/99999", headers=auth_headers)
    assert response.status_code == 404


def test_unauthorized_access(client: TestClient):
    """Test that unauthenticated requests are rejected."""
    tx_data = {
        "amount": 10.0,
        "type": "expense",
        "category": "test"
    }

    # Try to create without auth
    response = client.post("/transactions/", json=tx_data)
    assert response.status_code == 401

    # Try to get without auth
    response = client.get("/transactions/")
    assert response.status_code == 401