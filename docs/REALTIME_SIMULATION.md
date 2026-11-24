# JalRakshak Real-Time Simulation Integration

## 1. Overview
The JalRakshak simulation architecture connects the browser 3D environment directly to the authoritative backend Central Ground Water Board (CGWB) mathematical engine (`POST /api/v1/simulations/run`).

All calculations, boundary enforcement, conservation factors, and water quality indices originate from the backend Phase 7 engine. The frontend React/Three.js client never computes disparate or unverified hydrological values.

---

## 2. End-to-End Simulation Lifecycle
The student simulation journey transitions through five discrete lifecycle states:

```
[IDLE] ──(Open Modal)──> [CONFIGURING] ──(Submit Parameters)──> [RUNNING]
                                                                   │
                                                   ┌───────────────┴───────────────┐
                                                   ▼                               ▼
                                             [COMPLETED]                        [FAILED]
                                                   │
                                        (Update 3D Aquifer & HUD)
```

1. **`IDLE`**: Player explores the 3D village, inspecting open wells, farms, check dams, and dwellings.
2. **`CONFIGURING`**: Player triggers the simulation modal. Real-time parameter sliders allow adjusting:
   - Monsoon precipitation (mm)
   - Irrigation practice (Flood vs Sprinkler vs Subsurface Drip)
   - Cropping pattern (Millets, Pulses, Wheat, Sugarcane) and acreage
   - Artificial recharge interventions (Check dams, Percolation tanks, Rooftop RWH units)
   - Organic farming & wastewater management
3. **`RUNNING`**: The frontend issues `POST /api/v1/simulations/run`. Concurrent duplicate requests are rejected at the service layer with HTTP `409 Conflict`.
4. **`COMPLETED`**: Authoritative simulation outputs are returned and broadcast via Socket.IO. The Zustand `gameStore` updates:
   - Saturated aquifer mesh elevation ($Y$-axis in 3D scene)
   - Color-coded condition glow (`CRITICAL`, `SEMI_CRITICAL`, `SAFE`, `OPTIMAL`)
   - Water table depth indicator in the Top HUD
   - Sustainability score and XP progress
5. **`FAILED`**: Actionable error banner rendered with graceful retry options.

---

## 3. Canonical Hydrological Thresholds
Both frontend visual layers and backend models share identical, strict boundary definitions:

| Condition Category | Aquifer Storage Threshold | Hydrological Real-World Significance | Visual Feedback Color |
|---|---|---|---|
| **CRITICAL** | Storage $< 20.0\%$ | Shallow open wells dry; severe borewell yield collapse; acute agricultural deficit. | Crimson Red (`#ef4444`) |
| **SEMI_CRITICAL** | $20.0\% \le \text{Storage} < 40.0\%$ | Water table receding; seasonal dry spells observed; strict rationing advised. | Amber Orange (`#f97316`) |
| **SAFE** | $40.0\% \le \text{Storage} \le 70.0\%$ | Sustainable extraction; balanced recharge; stable domestic and irrigation supply. | Cobalt Blue (`#0284c7`) |
| **OPTIMAL** | Storage $> 70.0\%$ | Abundant groundwater reserves; natural baseflow feeds surface streams and springs. | Turquoise Cyan (`#06b6d4`) |

---

## 4. 3D Village Synchronization & Visual Feedback
When a simulation response arrives:
1. **Vertical Water Table Elevation**:
   $$Y = -18.0 + \left(\frac{\text{storagePercentage}}{100.0}\right) \times 14.0\text{ meters}$$
   `useFrame` in `GroundwaterLayer.tsx` applies linear interpolation ($0.05$ factor) for smooth, non-jarring transitions.
2. **Cone of Depression**:
   When agricultural extraction exceeds $250,000\text{ m}^3$, the inverted cone mesh beneath the motorized borewell becomes highlighted in orange/red wireframe.
3. **Infiltration Particles**:
   Downward particle velocity dynamically accelerates when artificial recharge structures (check dams and percolation tanks) are active.
