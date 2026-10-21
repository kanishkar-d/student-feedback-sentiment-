import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health_endpoint():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"

def test_live_analyzer_endpoint():
    payload = {
        "text": "The lectures are very clear and helpful!",
        "force_model": "vader"
    }
    response = client.post("/api/v1/analyze", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["sentiment"] == "Positive"
    assert "aspects" in data
    assert "keywords" in data

def test_login_admin():
    response = client.post(
        "/api/v1/auth/login",
        data={"username": "admin@feedbackiq.edu", "password": "adminpassword123"}
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data

def test_model_insights_endpoint():
    response = client.get("/api/v1/model-insights")
    assert response.status_code == 200
    data = response.json()
    assert "models" in data
    assert len(data["models"]) >= 2
