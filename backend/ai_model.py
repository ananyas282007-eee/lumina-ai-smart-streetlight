"""
LUMINA AI – Random Forest AI Model
====================================
Generates synthetic training data and trains a Random Forest
to recommend streetlight brightness based on:
  - Ambient light (lux)
  - Motion detection (0/1)
  - Traffic density (0.0 - 1.0)
  - Hour of day (0 - 23)
  - Time-of-day fraction (0.0 - 1.0)

Output: Recommended brightness percentage (0 - 100 %)

All training data is SYNTHETIC – no real-world measurements.
"""

# pyrefly: ignore [missing-import]
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error, r2_score
# pyrefly: ignore [missing-import]
import joblib
import os
import math

# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------
MODEL_PATH = os.path.join(os.path.dirname(__file__), "model", "rf_model.joblib")
SCALER_PATH = os.path.join(os.path.dirname(__file__), "model", "feature_info.joblib")
RANDOM_SEED = 42
N_SAMPLES = 10_000   # Synthetic training samples


# ---------------------------------------------------------------------------
# Synthetic data generation
# ---------------------------------------------------------------------------
def _generate_synthetic_data(n_samples: int = N_SAMPLES) -> pd.DataFrame:
    """
    Creates a realistic synthetic dataset for training.
    
    Rules encoded in the labels:
      - Daytime (lux > 5000):           brightness = 0  (lights off)
      - Night, no motion, low traffic:  brightness = 20-40 %  (energy saving)
      - Night, motion detected:          brightness += 30 %   (safety boost)
      - Night, high traffic:             brightness = 70-90 %
      - Night baseline:                  brightness = 50-60 %
    """
    rng = np.random.default_rng(RANDOM_SEED)

    # Feature arrays
    ambient_lux      = rng.uniform(0, 80_000, n_samples)
    motion_detected  = rng.integers(0, 2, n_samples)       # 0 or 1
    traffic_density  = rng.uniform(0.0, 1.0, n_samples)
    hour_of_day      = rng.integers(0, 24, n_samples)
    tod_fraction     = np.array([
        max(0.0, min(1.0, (math.sin(math.pi * (h - 6) / 12) + 1) / 2))
        for h in hour_of_day
    ])

    # Label generation (ground-truth brightness recommendations)
    brightness = np.zeros(n_samples)
    for i in range(n_samples):
        lux   = ambient_lux[i]
        mot   = motion_detected[i]
        traf  = traffic_density[i]

        if lux > 5_000:
            # Daytime – lights off
            brightness[i] = 0.0
        else:
            # Night-time baseline
            base = 50.0

            # Adjust by traffic
            if traf > 0.7:
                base = rng.uniform(70, 90)
            elif traf < 0.3:
                base = rng.uniform(20, 40)
            else:
                base = rng.uniform(45, 65)

            # Motion boost
            if mot == 1:
                base = min(100.0, base + rng.uniform(20, 35))

            # Clamp to safe minimum at night
            brightness[i] = max(20.0, min(100.0, base))

    # Add small Gaussian noise so the model generalises better
    noise = rng.normal(0, 2.5, n_samples)
    brightness = np.clip(brightness + noise, 0.0, 100.0)

    df = pd.DataFrame({
        "ambient_lux": ambient_lux,
        "motion_detected": motion_detected.astype(float),
        "traffic_density": traffic_density,
        "hour_of_day": hour_of_day.astype(float),
        "time_of_day_fraction": tod_fraction,
        "brightness": brightness,
    })
    return df


# ---------------------------------------------------------------------------
# Training
# ---------------------------------------------------------------------------
def train_model() -> dict:
    """
    Generates synthetic data, trains a RandomForestRegressor,
    evaluates it and saves the model to disk.

    Returns a dict with training metrics.
    """
    print("[LUMINA AI] Generating synthetic training data ...")
    df = _generate_synthetic_data()

    feature_cols = [
        "ambient_lux",
        "motion_detected",
        "traffic_density",
        "hour_of_day",
        "time_of_day_fraction",
    ]
    X = df[feature_cols].values
    y = df["brightness"].values

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=RANDOM_SEED
    )

    print("[LUMINA AI] Training Random Forest model ...")
    model = RandomForestRegressor(
        n_estimators=100,
        max_depth=12,
        min_samples_split=5,
        random_state=RANDOM_SEED,
        n_jobs=-1,
    )
    model.fit(X_train, y_train)

    # Evaluate
    y_pred = model.predict(X_test)
    mae = mean_absolute_error(y_test, y_pred)
    r2  = r2_score(y_test, y_pred)

    # Save model and feature column list
    os.makedirs(os.path.dirname(MODEL_PATH), exist_ok=True)
    joblib.dump(model, MODEL_PATH)
    joblib.dump(feature_cols, SCALER_PATH)

    metrics = {
        "samples_trained": len(X_train),
        "samples_tested": len(X_test),
        "mae": round(float(mae), 4),
        "r2_score": round(float(r2), 4),
        "model_path": MODEL_PATH,
        "feature_columns": feature_cols,
        "note": "Trained on synthetic data only – not real-world measurements.",
    }
    print(f"[LUMINA AI] Training complete. MAE={mae:.2f}  R2={r2:.4f}")
    return metrics


# ---------------------------------------------------------------------------
# Inference
# ---------------------------------------------------------------------------
def load_model():
    """Load the trained model from disk. Returns (model, feature_cols)."""
    if not os.path.exists(MODEL_PATH):
        raise FileNotFoundError(
            f"Model not found at {MODEL_PATH}. Run train_model() first."
        )
    model = joblib.load(MODEL_PATH)
    feature_cols = joblib.load(SCALER_PATH)
    return model, feature_cols


def predict_brightness(feature_vectors: list) -> dict:
    """
    Accepts a list of dicts (each with the 5 feature keys) and
    returns a dict mapping node_id -> predicted brightness %.
    """
    model, feature_cols = load_model()

    results = {}
    for fv in feature_vectors:
        node_id = fv.get("node_id", "unknown")
        row = np.array([[fv[col] for col in feature_cols]])
        pred = float(model.predict(row)[0])
        pred = max(0.0, min(100.0, pred))   # Safety clamp
        results[node_id] = round(pred, 1)

    return results


# ---------------------------------------------------------------------------
# Entry point: train when executed directly
# ---------------------------------------------------------------------------
if __name__ == "__main__":
    metrics = train_model()
    print("\n=== Training Metrics ===")
    for k, v in metrics.items():
        print(f"  {k}: {v}")
