# JalRakshak Frontend API Integration

## 1. Overview
The JalRakshak frontend communicates with the Express ESM backend via RESTful endpoints configured with Axios interceptors and optional WebSocket streaming.

To ensure resilience, seamless offline demonstrations, and zero blocking when the local database service is paused, every client service implements high-fidelity deterministic fallbacks adhering to the official Central Ground Water Board (CGWB) hydrological parameters.

---

## 2. API Endpoints Consumed

### A. Groundwater & Village Intelligence
- `GET /api/v1/groundwater/villages/:villageId`
  - Fetches village metadata, static water table depth, storage capacity %, net draft ratio, and 6-month historical trend.
  - Consumed by `frontend/src/services/groundwater.service.ts`.

### B. Scientific Simulation Engine
- `POST /api/v1/simulations/run`
  - Request body:
    ```json
    {
      "rainfallMultiplier": 1.2,
      "irrigationMethod": "DRIP",
      "rwhCoveragePercentage": 70,
      "cropPattern": "BALANCED",
      "borewellPumpingHours": 5,
      "checkDamDesilted": true
    }
    ```
  - Response payload:
    ```json
    {
      "success": true,
      "data": {
        "deltaWaterTableMeters": 1.8,
        "newStoragePercentage": 76.4,
        "condition": "SAFE",
        "rechargeGainM3": 445000,
        "extractionM3": 210000,
        "sustainabilityIndex": 88,
        "educationalFeedback": [
          "Adopting drip irrigation cut agricultural water loss by up to 55%.",
          "Rooftop rainwater harvesting channeled +56,000 m³ directly into percolation shafts."
        ]
      }
    }
    ```
  - Consumed by `frontend/src/services/simulation.service.ts` & `SimulationModal.tsx`.

### C. Student Progression & Gamification
- `GET /api/v1/progression/me`
  - Fetches student Level, XP progress, sustainability rating, and unlocked badges.
- `GET /api/v1/missions`
  - Fetches active and completed missions.
- `GET /api/v1/leaderboard`
  - Fetches anonymized ranking of top groundwater student stewards.

---

## 3. Real-Time 3D Reactive Synchronization
When a student completes a simulation or inspects a conservation structure:
1. The `simulationService` computes the water balance.
2. The result updates Zustand's `groundwaterData.metrics`.
3. In `GroundwaterLayer.tsx`, `useFrame` smoothly interpolates the 3D water table mesh along the vertical $Y$-axis:
   ```ts
   const targetWaterY = -18.0 + (metrics.storagePercentage / 100) * 14.0;
   waterSurfaceRef.current.position.y += (targetWaterY - waterSurfaceRef.current.position.y) * 0.05;
   ```
4. Color properties transition across `CRITICAL` (crimson), `SEMI_CRITICAL` (orange), `SAFE` (blue), and `OPTIMAL` (cyan).
