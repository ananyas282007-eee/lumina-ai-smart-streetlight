"""
Verification script for LUMINA AI FastAPI endpoints.
Tests all /api/* routes exposed by main.py.
"""
from fastapi.testclient import TestClient
from main import app, on_startup

# Run startup hook so model is loaded into state
on_startup()

client = TestClient(app)

def test_endpoints():
    print("Testing /api/health ...")
    r = client.get("/api/health")
    assert r.status_code == 200, f"/api/health failed: {r.status_code} {r.text}"
    health_data = r.json()
    print("  Health OK! Model ready:", health_data.get("model_ready"), "Status:", health_data.get("status"))

    print("Testing /api/nodes ...")
    r = client.get("/api/nodes")
    assert r.status_code == 200, f"/api/nodes failed: {r.status_code}"
    nodes_data = r.json()
    print("  Nodes OK! Total nodes:", nodes_data.get("count"))

    print("Testing /api/sensors ...")
    r = client.get("/api/sensors")
    assert r.status_code == 200, f"/api/sensors failed: {r.status_code}"
    sensors_data = r.json()
    print("  Sensors OK! Ambient lux:", sensors_data.get("average_ambient_lux"), "Motion count:", sensors_data.get("motion_detected_count"))

    print("Testing /api/energy ...")
    r = client.get("/api/energy")
    assert r.status_code == 200, f"/api/energy failed: {r.status_code}"
    energy_data = r.json()
    print("  Energy OK! Savings %:", energy_data.get("savings_percentage"), "Total baseline kW:", energy_data.get("baseline_total_kw"))

    print("Testing /api/dashboard ...")
    r = client.get("/api/dashboard")
    assert r.status_code == 200, f"/api/dashboard failed: {r.status_code}"
    dash_data = r.json()
    print("  Dashboard OK! Insights count:", len(dash_data.get("insights", [])))

    print("Testing /api/model/info ...")
    r = client.get("/api/model/info")
    assert r.status_code == 200, f"/api/model/info failed: {r.status_code}"
    model_data = r.json()
    print("  Model Info OK! Model ready:", model_data.get("ready"), "Type:", model_data.get("model_type"))

    print("Testing /api/simulation/update ...")
    r = client.post("/api/simulation/update")
    assert r.status_code == 200, f"/api/simulation/update failed: {r.status_code}"
    sim_data = r.json()
    print("  Simulation update OK! Status:", sim_data.get("status"))

    print("\n>>> ALL LUMINA AI API ENDPOINTS PASSED VERIFICATION WITH 100% SUCCESS! <<<")

if __name__ == "__main__":
    test_endpoints()
