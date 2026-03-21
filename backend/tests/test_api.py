import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"

def test_parse_missing_data():
    response = client.post("/api/parse", data={})
    assert response.status_code == 422
    assert "Please provide a resume" in response.json()["detail"]

def test_parse_plain_text():

    response = client.post("/api/parse", data={"resume_text": "Sample Resume"})
    assert response.status_code == 422 
    assert "Please provide a job description" in response.json()["detail"]

def test_analyze_missing_body():
    response = client.post("/api/analyze", json={})
    assert response.status_code == 422

def test_analyze_empty_lists():
    response = client.post("/api/analyze", json={
        "candidate_skills": [],
        "role_requirements": []
    })
    assert response.status_code == 422
    assert "candidate_skills cannot be empty" in response.json()["detail"]

def test_pathway_missing_body():
    response = client.post("/api/pathway", json={})
    assert response.status_code == 422
