"""
LUMINA AI – Quick-start training script
Run once to pre-train the Random Forest model before starting the server.

Usage:
    python train.py
"""
from ai_model import train_model
import json

if __name__ == "__main__":
    print("=" * 60)
    print("  LUMINA AI – Random Forest Model Training")
    print("  Software-only prototype – synthetic data only")
    print("=" * 60)
    metrics = train_model()
    print("\nTraining complete. Metrics:")
    print(json.dumps(metrics, indent=2))
    print("\nModel saved. You can now start the FastAPI server.")
