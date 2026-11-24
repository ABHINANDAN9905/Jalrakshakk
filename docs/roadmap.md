# JalRakshak Development Roadmap

This document outlines the multi-phase engineering trajectory for JalRakshak, progressing from project initialization to an enterprise-ready, portfolio-grade educational platform.

---

## Roadmap Overview

```mermaid
flowchart LR
    P1["Phase 1: Project Foundation"] --> P2["Phase 2: Backend Core & DB"]
    P2 --> P3["Phase 3: Hydrology Engine"]
    P3 --> P4["Phase 4: Real-time & Sockets"]
    P4 --> P5["Phase 5: Frontend & 3D Village"]
    P5 --> P6["Phase 6: Analytics & Quests"]
    P6 --> P7["Phase 7: AI Water Mentor"]
    P7 --> P8["Phase 8: Hardening & Deploy"]
```

---

## Detailed Phase Breakdown

### Phase 1: Project Foundation & Architecture Blueprint (Current)
- [x] Inspect workspace and initialize foundational file trees.
- [x] Create root `README.md` and production `.gitignore`.
- [x] Generate environment variable templates (`backend/.env.example`, `frontend/.env.example`).
- [x] Author comprehensive architectural documentation (`docs/architecture.md`).
- [x] Author database strategy documentation (`docs/database-architecture.md`).
- [x] Author API endpoint and event contracts (`docs/api-architecture.md`).
- [x] Create development roadmap (`docs/roadmap.md`).
- **Milestone Outcome**: Comprehensive, verified engineering blueprint with zero technical debt or lingering prototype clutter.

---

### Phase 2: Backend Core, Database Infrastructure & Authentication
- Initialize Node.js ESM backend project (`backend/package.json`).
- Configure Express.js server, standard middlewares (`helmet`, `cors`, `morgan`, `express-rate-limit`).
- Set up PostgreSQL connection with **Prisma ORM**:
  - Define user, role, village, infrastructure, and mission models.
  - Run initial migrations and seed script for roles and default villages.
- Set up MongoDB connection with **Mongoose**:
  - Define telemetry snapshots, AI conversation history, and audit log schemas.
- Implement JWT Authentication and RBAC middleware (`student`, `teacher`, `admin`).
- Implement Auth controllers (`/register`, `/login`, `/me`, `/refresh-token`).
- Create unit/integration tests with Vitest/Supertest for Auth.
- **Milestone Outcome**: Functional, secure backend server with active connections to PostgreSQL and MongoDB.

---

### Phase 3: Hydrological Simulation Engine & Groundwater Modeling
- Build core domain math classes for groundwater calculations:
  - Darcy flux calculation.
  - Soil infiltration coefficients (Alluvial, Black Soil, Red Sandy Loam).
  - Aquifer unconfined vs. semi-confined storage capacity.
  - Crop evapotranspiration factors (Paddy, Sugarcane, Millets, Pulses).
- Build the `SimulationEngine`:
  - Time-step execution model (ticks representing days or months).
  - Intervention application mechanics (adding check dams, restricting borewell extraction, rainwater harvesting).
  - Internal event emissions via Node.js `EventEmitter`.
- Author comprehensive unit tests verifying simulation balance equations ($R - E = \Delta S$).
- **Milestone Outcome**: Standalone, mathematically sound hydrological simulation engine.

---

### Phase 4: Real-Time Infrastructure & Socket.IO State Synchronization
- Integrate Socket.IO server within Express HTTP server.
- Implement namespace and room partitioning (`/simulation` -> `village:<id>`).
- Connect `SimulationEngine` event bus to Socket.IO emitter.
- Build socket handlers:
  - `join_village`, `leave_village`.
  - `start_simulation`, `pause_simulation`, `step_simulation`.
  - `apply_intervention` (real-time injection of recharge structures or extraction caps).
  - Broadcast periodic state payload (`SIMULATION_TICK`).
- Author integration tests for socket connections and state broadcast latency.
- **Milestone Outcome**: Low-latency, bi-directional state synchronization between backend simulation and connected clients.

---

### Phase 5: Frontend Core, Design System & 3D Indian Village Simulation
- Initialize React + TypeScript + Vite application (`frontend/package.json`).
- Configure Tailwind CSS, color tokens, and layout shells (Navbar, Sidebar, Viewport, Control Bar).
- Configure Three.js, React Three Fiber (R3F), and Drei canvas.
- Construct the 3D Indian Village environment:
  - Procedural/instanced terrain showing elevation and soil texturing.
  - Water table plane visualizer (moves dynamically based on simulation depth).
  - Rural village models: huts, farmlands, trees, ponds, hand-pumps, tube-wells.
  - Interactive intervention structures: check dams, rooftop pipes, recharge pits.
- Connect Socket.IO client to synchronize 3D water levels in real time.
- **Milestone Outcome**: Visually stunning, responsive 3D village interface reacting to simulation ticks.

---

### Phase 6: Water Analytics, Dashboards & Educational Gamification
- Integrate Recharts into the frontend:
  - Time-series aquifer elevation chart (historical vs. simulated future).
  - Water balance breakdown (Rainfall vs. Extraction vs. Recharge).
  - Crop water footprint and consumption distribution.
- Implement Gamification UI and Backend Services:
  - Mission briefing panel (e.g. "Save Rampur: Prevent severe aquifer depletion by 2030").
  - Budget & Resource constraints (funds, labor days, land area).
  - Real-time scoring, achievement badges, and student leaderboard.
- Teacher Dashboard: View student mission submission, grade water efficiency, and inject drought crises.
- **Milestone Outcome**: High-impact educational game loop combining 3D exploration with quantitative hydrology charts.

---

### Phase 7: AI Water Mentor Integration (OpenAI API)
- Build backend AI Mentor Service:
  - Structured prompt engineering grounding the LLM in hydrogeological science and Indian conservation guidelines (CGWB standards).
  - Dynamic context assembly: inject current village water table, active interventions, and recent student choices.
  - Streaming response handling for low-latency feedback.
- Frontend AI Mentor Drawer:
  - Floating conversational companion ("Jal Mitra").
  - Pre-built quick questions ("Why is my water table falling despite rainfall?", "Which crop should farmers plant?").
  - Persistent conversation storage in MongoDB.
- **Milestone Outcome**: Intelligent, contextual tutor explaining simulation dynamics in clear, encouraging language.

---

### Phase 8: Testing, Production Hardening & CI/CD Deployment
- Comprehensive test coverage:
  - Unit tests for all mathematical algorithms.
  - End-to-end API integration tests via Supertest.
  - Frontend component and canvas render tests.
- Docker containerization:
  - Multi-stage Dockerfile for Node.js backend.
  - Nginx-based multi-stage Dockerfile for React frontend.
  - `docker-compose.yml` orchestrating Frontend, Backend, PostgreSQL, and MongoDB.
- GitHub Actions CI/CD pipeline:
  - Linting, type checks, unit testing, and Docker build verification.
- Documentation polishing and video demonstration preparation.
- **Milestone Outcome**: Portfolio-grade, production-ready, fully deployed platform.
