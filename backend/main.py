"""
LUMINA AI – FastAPI Backend Server
====================================
Exposes REST API endpoints consumed by the React dashboard.

All simulated sensor data and AI predictions are SOFTWARE-ONLY estimates.
No physical hardware (LDR, PIR, Arduino, ESP32) is connected.

Run with:
    uvicorn main:app --host 0.0.0.0 --port 8000 --reload
"""

# pyrefly: ignore [missing-import]
from fastapi import FastAPI, HTTPException, BackgroundTasks
# pyrefly: ignore [missing-import]
from fastapi.middleware.cors import CORSMiddleware
# pyrefly: ignore [missing-import]
from pydantic import BaseModel
from datetime import datetime
import threading
import time
import os

from simulator import simulator
from ai_model import train_model, predict_brightness, MODEL_PATH

# ---------------------------------------------------------------------------
# App setup
# ---------------------------------------------------------------------------
app = FastAPI(
    title="LUMINA AI API",
    description=(
        "AI-Based Smart Streetlight Energy Optimisation System – "
        "Software-only prototype. All sensor values are simulated."
    ),
    version="1.0.0",
)

# CORS – allow the React dev server (port 5173) and any other origin in dev
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],          # Restrict in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------------
# State tracking
# ---------------------------------------------------------------------------
_model_ready = False       # Becomes True once training completes
_training_metrics = {}     # Populated after training
_auto_update_active = True # Background simulation-update loop flag


def _training_done():
    """Called after model training; triggers first AI-powered update."""
    global _model_ready, _training_metrics
    try:
        _training_metrics = train_model()
        _model_ready = True
        _run_ai_update()    # Immediately refresh nodes with AI predictions
        print("[LUMINA AI] Model ready and applied.")
    except Exception as exc:
        print(f"[LUMINA AI] Training failed: {exc}")


def _run_ai_update():
    """Get AI predictions and update the simulator."""
    if not _model_ready:
        simulator.update_all()
        return
    try:
        fv = simulator.get_feature_vectors()
        preds = predict_brightness(fv)
        simulator.update_all(ai_recommendations=preds)
    except Exception as exc:
        print(f"[LUMINA AI] AI update error: {exc}")
        simulator.update_all()


def _auto_update_loop():
    """Background thread: refreshes simulation every 30 seconds."""
    while _auto_update_active:
        _run_ai_update()
        time.sleep(30)


# ---------------------------------------------------------------------------
# Startup / shutdown
# ---------------------------------------------------------------------------
@app.on_event("startup")
def on_startup():
    """Train the model in a background thread so the API responds instantly."""
    global _model_ready
    # Check if a saved model already exists
    if os.path.exists(MODEL_PATH):
        _model_ready = True
        print("[LUMINA AI] Pre-trained model found. Skipping training.")
    else:
        print("[LUMINA AI] No saved model found. Starting background training ...")
        threading.Thread(target=_training_done, daemon=True).start()

    # Start the auto-update loop
    threading.Thread(target=_auto_update_loop, daemon=True).start()


@app.on_event("shutdown")
def on_shutdown():
    global _auto_update_active
    _auto_update_active = False


# ---------------------------------------------------------------------------
# Request / Response models
# ---------------------------------------------------------------------------
class SimulationControlRequest(BaseModel):
    action: str   # "update" | "reset"


# ---------------------------------------------------------------------------
# Health endpoint
# ---------------------------------------------------------------------------
@app.get("/api/health", tags=["System"])
def health_check():
    """Returns system health and model status."""
    return {
        "status": "online",
        "model_ready": _model_ready,
        "system_name": "LUMINA AI",
        "version": "1.0.0",
        "timestamp": datetime.now().isoformat(timespec="seconds"),
        "note": "Software-only prototype. All sensors simulated.",
    }


# ---------------------------------------------------------------------------
# Streetlight node endpoints
# ---------------------------------------------------------------------------
@app.get("/api/nodes", tags=["Nodes"])
def get_all_nodes():
    """Returns current status of all simulated streetlight nodes."""
    _run_ai_update()   # Ensure fresh data on each request
    return {
        "nodes": simulator.get_all_nodes(),
        "count": len(simulator.nodes),
        "timestamp": datetime.now().isoformat(timespec="seconds"),
    }


@app.get("/api/nodes/{node_id}", tags=["Nodes"])
def get_node(node_id: str):
    """Returns detailed status for a single node."""
    node = simulator.get_node(node_id)
    if node is None:
        raise HTTPException(status_code=404, detail=f"Node '{node_id}' not found.")
    return node


# ---------------------------------------------------------------------------
# Sensor readings
# ---------------------------------------------------------------------------
@app.get("/api/sensors", tags=["Sensors"])
def get_sensor_readings():
    """Returns aggregated sensor readings across all nodes."""
    return simulator.get_sensor_readings()


# ---------------------------------------------------------------------------
# AI predictions
# ---------------------------------------------------------------------------
@app.get("/api/predictions", tags=["AI"])
def get_predictions():
    """
    Runs the AI model on current sensor readings and returns
    brightness recommendations for each node.
    """
    if not _model_ready:
        return {
            "status": "training",
            "message": "AI model is still training. Using heuristic fallback.",
            "predictions": {n["node_id"]: n["recommended_brightness"] for n in simulator.get_all_nodes()},
        }
    try:
        fv = simulator.get_feature_vectors()
        preds = predict_brightness(fv)
        return {
            "status": "ready",
            "predictions": preds,
            "model_info": _training_metrics,
            "timestamp": datetime.now().isoformat(timespec="seconds"),
        }
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


# ---------------------------------------------------------------------------
# Energy statistics
# ---------------------------------------------------------------------------
@app.get("/api/energy", tags=["Energy"])
def get_energy_stats():
    """
    Returns estimated energy consumption and savings.
    All values are simulated estimates – assumes 100 W equivalent per node.
    """
    return simulator.get_energy_stats()


# ---------------------------------------------------------------------------
# Simulation control
# ---------------------------------------------------------------------------
@app.post("/api/simulation/update", tags=["Simulation"])
def trigger_simulation_update():
    """Manually trigger a simulation update cycle."""
    _run_ai_update()
    return {
        "status": "updated",
        "nodes": simulator.get_all_nodes(),
        "energy": simulator.get_energy_stats(),
        "timestamp": datetime.now().isoformat(timespec="seconds"),
    }


@app.post("/api/simulation/train", tags=["Simulation"])
def trigger_training(background_tasks: BackgroundTasks):
    """
    (Re-)trains the Random Forest model in the background.
    The previous model continues serving predictions until training finishes.
    """
    global _model_ready
    _model_ready = False
    background_tasks.add_task(_training_done)
    return {
        "status": "training_started",
        "message": "Model re-training has begun in the background.",
    }


# ---------------------------------------------------------------------------
# Dashboard summary (single endpoint for the dashboard to call)
# ---------------------------------------------------------------------------
@app.get("/api/dashboard", tags=["Dashboard"])
def get_dashboard_summary():
    """
    Aggregated endpoint: returns everything the dashboard needs in one call.
    """
    _run_ai_update()
    nodes = simulator.get_all_nodes()
    energy = simulator.get_energy_stats()
    sensors = simulator.get_sensor_readings()

    # AI insights derived from node data
    insights = []
    active = [n for n in nodes if n["current_brightness"] > 0]
    motion_nodes = [n for n in nodes if n["motion_detected"]]
    if motion_nodes:
        insights.append({
            "type": "motion",
            "message": f"Motion detected at {len(motion_nodes)} node(s). Brightness increased for safety.",
        })
    if energy["savings_percentage"] > 0:
        insights.append({
            "type": "saving",
            "message": (
                f"AI optimisation saving an estimated {energy['savings_percentage']:.1f}% "
                f"energy vs. full-brightness baseline."
            ),
        })
    avg_brightness = (
        sum(n["current_brightness"] for n in nodes) / len(nodes) if nodes else 0
    )
    insights.append({
        "type": "avg_brightness",
        "message": f"Average system brightness: {avg_brightness:.1f}%",
    })
    if not _model_ready:
        insights.append({
            "type": "model_status",
            "message": "AI model is training. Heuristic control active.",
        })

    return {
        "system_name": "LUMINA AI",
        "model_ready": _model_ready,
        "nodes": nodes,
        "energy": energy,
        "sensors": sensors,
        "insights": insights,
        "timestamp": datetime.now().isoformat(timespec="seconds"),
        "note": "Software-only prototype. All sensor values are simulated estimates.",
    }


# ---------------------------------------------------------------------------
# Model info endpoint
# ---------------------------------------------------------------------------
@app.get("/api/model/info", tags=["AI"])
def get_model_info():
    """Returns information about the trained AI model."""
    return {
        "model_type": "RandomForestRegressor",
        "ready": _model_ready,
        "metrics": _training_metrics if _model_ready else {},
        "features": [
            "ambient_lux",
            "motion_detected",
            "traffic_density",
            "hour_of_day",
            "time_of_day_fraction",
        ],
        "output": "Recommended brightness percentage (0-100%)",
        "training_data": "Synthetic – 10,000 samples generated by rule-based simulation",
    }
