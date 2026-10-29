# LUMINA AI — Smart Streetlight Energy Optimisation

A hardware-free software prototype for an AI-assisted smart streetlight system. It simulates ambient light, motion, traffic and time, predicts a suitable dimming level, and estimates energy use against a fixed-brightness baseline.

> **Prototype note:** Sensor values and energy figures are simulated. The first model is trained on synthetic data and is not a substitute for field calibration, road-lighting standards, or safety validation.

## Features
- Simulated streetlight nodes and sensor readings
- Random Forest brightness recommendation model
- Motion-aware brightness override
- Estimated energy use and savings versus a fixed 100% baseline
- React dashboard with live polling and manual simulation controls

## Requirements
- Python 3.10+
- Node.js 18+ (includes npm)

## Run on Windows

### 1. Start the backend
Open PowerShell in this project folder:

```powershell
cd backend
py -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
py train_model.py
py -m uvicorn app:app --reload --port 8000
```

If PowerShell blocks activation, run:
```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
.\.venv\Scripts\Activate.ps1
```

Backend API: http://127.0.0.1:8000  
API docs: http://127.0.0.1:8000/docs

### 2. Start the frontend
Open a **second** PowerShell window in the project folder:

```powershell
cd frontend
npm install
npm run dev
```

Open the local URL printed by Vite, usually http://localhost:5173.

## Project structure

```text
lumina-ai/
├── backend/
│   ├── app.py
│   ├── ai_model.py
│   ├── simulator.py
│   ├── train_model.py
│   └── requirements.txt
├── frontend/
│   ├── index.html
│   ├── package.json
│   └── src/
│       ├── App.jsx
│       ├── main.jsx
│       └── style.css
├── .gitignore
├── LICENSE
└── README.md
```

## Model inputs
- `ambient_lux`: simulated ambient light level
- `motion`: whether movement is detected
- `traffic`: simulated traffic density from 0 to 1
- `hour`: hour of day from 0 to 23

The initial model predicts a brightness percentage. A controller then applies a daytime-off rule, a minimum night-time level and a motion override.

## Energy estimate
The prototype assumes one 100 W equivalent LED lamp per node and uses:
`energy_kwh = rated_power_kw × brightness_fraction × elapsed_hours × node_count`.

The baseline assumes every lamp runs at 100% for the same elapsed period. Savings are estimates within this simulation only.

## Next milestones
1. Validate and improve the simulator and dashboard.
2. Add CSV logging, model evaluation and explainable AI outputs.
3. Add an optional MQTT/ESP32 integration layer when hardware is available.
4. Document test cases and publish screenshots/demo on GitHub.

## License
MIT — see `LICENSE`.
