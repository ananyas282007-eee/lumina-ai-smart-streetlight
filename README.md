# LUMINA AI

**AI-Based Smart Streetlight Energy Optimisation System** — a software-only prototype that simulates streetlight sensors, predicts recommended brightness, and visualises energy use in a live dashboard.

> **Prototype notice:** Sensor readings and streetlight activity are simulated. This project does not connect to physical LDR/PIR sensors, Arduino, ESP32, or streetlight hardware.

## Features

- FastAPI backend for node, sensor, energy, prediction, and simulation data
- React and Vite dashboard with charts, node status, sensor readings, and AI insights
- Random Forest brightness recommendations with safety rules applied to the simulation
- Windows setup and startup scripts
- Included trained model artifacts and a prebuilt frontend bundle

## Project layout

```text
backend/                 FastAPI API, simulator, model code, and trained artifacts
frontend/src/             React dashboard source
frontend/dist/            Prebuilt dashboard bundle
setup.bat                 Windows setup helper
```

## Quick start (Windows)

### Automated setup

Run `setup.bat` from the project folder. It creates the Python environment and installs backend and frontend dependencies.

### Manual setup

1. Install Python 3 and Node.js (npm included).
2. In a terminal, install and start the backend:

   ```powershell
   cd backend
   py -3 -m venv venv
   .\venv\Scripts\Activate.ps1
   pip install -r requirements.txt
   uvicorn main:app --host 127.0.0.1 --port 8000 --reload
   ```

3. In a second terminal, install and start the frontend:

   ```powershell
   cd frontend
   npm install
   npm run dev
   ```

4. Open the dashboard at <http://localhost:5173>.

The API documentation is available at <http://localhost:8000/docs>, and the health endpoint is <http://localhost:8000/api/health>.

## API overview

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/api/health` | Service health |
| `GET` | `/api/dashboard` | Dashboard summary |
| `GET` | `/api/nodes` | All simulated streetlight nodes |
| `GET` | `/api/nodes/{node_id}` | One node |
| `GET` | `/api/sensors` | Sensor readings |
| `GET` | `/api/predictions` | Brightness predictions |
| `GET` | `/api/energy` | Energy estimates |
| `GET` | `/api/model/info` | Model details |
| `POST` | `/api/simulation/update` | Advance the simulation |
| `POST` | `/api/simulation/train` | Train the model |

## Model and simulation

The backend uses a Scikit-learn Random Forest Regressor. It consumes simulated ambient light, motion, traffic, and time features to recommend brightness from 0–100%. Safety rules adjust recommendations for daylight, nighttime minimum brightness, detected motion, and traffic conditions. Energy figures are estimates for the simulated lights, not measurements from deployed equipment.

## Tech stack

- **Backend:** Python, FastAPI, Uvicorn, NumPy, Pandas, Scikit-learn, Joblib
- **Frontend:** React, Vite, Recharts, Axios

See `backend/requirements.txt` and `frontend/package.json` for dependency details.

## License

This project is distributed under the MIT License. See [LICENSE](LICENSE).
