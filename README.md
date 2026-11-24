# JalRakshak (जल रक्षक)
### AI-Powered Groundwater Intelligence and Conservation Simulation Platform

[![Architecture](https://img.shields.io/badge/Architecture-Modular%20Monolith-blue.svg)](#architecture-overview)
[![Frontend](https://img.shields.io/badge/Frontend-React%2018%20%7C%20TypeScript%20%7C%20Vite%20%7C%20TailwindCSS-informational.svg)](#technology-stack)
[![3D-Simulation](https://img.shields.io/badge/3D%20Engine-Three.js%20%7C%20React%20Three%20Fiber%20%7C%20Drei-purple.svg)](#technology-stack)
[![Backend](https://img.shields.io/badge/Backend-Node.js%20%7C%20Express%20(ESM)%20%7C%20Socket.IO-green.svg)](#technology-stack)
[![Databases](https://img.shields.io/badge/Databases-PostgreSQL%20(Prisma)%20%2B%20MongoDB%20(Mongoose)-blueviolet.svg)](#technology-stack)
[![Security](https://img.shields.io/badge/Security-JWT%20%7C%20RBAC%20%7C%20Helmet%20%7C%20Rate%20Limiting-red.svg)](#security-and-governance)

---

## 1. Executive Summary

**JalRakshak** ("Water Protector") is an industry-grade, educational and analytical simulation platform designed to address groundwater depletion through interactive hydrogeological modeling, 3D village visualization, gamified conservation missions, and real-time AI mentoring.

Focusing on the hydrogeological reality of rural and semi-arid India, JalRakshak models dynamic aquifers, surface extraction (borewells, tube-wells), artificial recharge structures (check dams, percolation tanks, rooftop rainwater harvesting), seasonal monsoon cycles, and agricultural crop water demands.

The platform provides role-tailored workflows for **Students**, **Teachers**, and **System Administrators**, making complex hydrology accessible through interactive computing and actionable conservation intelligence.

---

## 2. Core Pillars & Capabilities

1. **Hydrological Simulation Engine**: High-fidelity mathematical modeling of water tables, recharge rates, soil infiltration, drawdown cones, and seasonal stress.
2. **Interactive 3D Indian Village**: Immersive WebGL/Three.js spatial environment featuring realistic rural topography, agricultural fields, wells, ponds, and conservation interventions.
3. **Data Analytics & Water Auditing**: Live calculation of water balance, recharge-to-extraction ratios, crop water budgets, and historical depletion curves.
4. **Pedagogical Gamification & Quests**: Scenario-based challenges (e.g., drought mitigation, over-extraction resolution) with real-time scoring and progress tracking.
5. **AI Water Mentor**: Context-aware intelligent advisory agent powered by LLMs to evaluate student interventions, diagnose hydro-stress, and explain groundwater mechanics.
6. **Multi-Tenant Role-Based Access Control**: Strict segregation of capabilities across Students (simulation, learning, missions), Teachers (classroom control, assignments, analytics), and Administrators (system parameters, global data).

---

## 3. Technology Stack

### Frontend
- **Framework & Tooling**: [React 18](https://react.dev/), [TypeScript](https://www.typescriptlang.org/), [Vite](https://vitejs.dev/)
- **UI & Styling**: [Tailwind CSS](https://tailwindcss.com/), [Lucide React](https://lucide.dev/)
- **3D Visualization**: [Three.js](https://threejs.org/), [React Three Fiber (R3F)](https://docs.pmnd.rs/react-three-fiber), [@react-three/drei](https://github.com/pmndrs/drei)
- **Data Analytics & Charts**: [Recharts](https://recharts.org/)
- **Real-time Client**: [Socket.IO Client](https://socket.io/)

### Backend
- **Runtime & Framework**: [Node.js](https://nodejs.org/) (LTS, ES Modules), [Express.js](https://expressjs.com/)
- **Real-time Engine**: [Socket.IO](https://socket.io/) (bi-directional state synchronization)
- **Event Architecture**: Node.js `EventEmitter` for decouple simulation loop ticks from I/O

### Persistence & Data Architecture (Dual-Database Strategy)
- **Primary Relational Store (ACID Truth)**: [PostgreSQL](https://www.postgresql.org/) managed with [Prisma ORM](https://www.prisma.io/)
  - *Domain scope*: Users, authentication credentials, roles, village metadata, persistent infrastructure assets, structured missions, achievements.
- **Document & Telemetry Store**: [MongoDB](https://www.mongodb.com/) managed with [Mongoose](https://mongoosejs.com/)
  - *Domain scope*: High-frequency simulation state snapshots, time-series water audit telemetry, AI Mentor chat transcripts, audit logs.

### Security & Compliance
- **Authentication**: Stateless JSON Web Tokens (JWT) with HTTP-only cookies / Authorization Bearer headers.
- **Password Security**: Salted hashing via `bcrypt`.
- **Authorization**: Explicit Role-Based Access Control (RBAC) middleware (`student`, `teacher`, `admin`).
- **Network & Perimeter Defense**: `helmet`, configurable `cors`, strict IP/token rate-limiting (`express-rate-limit`), request sanitization.

---

## 4. Repository Structure

```text
JalRakshak/
├── frontend/                 # Client-side SPA (React, TypeScript, Vite, R3F)
│   ├── .env.example          # Frontend environment blueprint
│   └── src/                  # Component and visual simulation logic (Phases 5-7)
├── backend/                  # Server-side API & Simulation engine (Node.js, Express)
│   ├── .env.example          # Backend environment blueprint
│   └── src/                  # Controllers, services, and models (Phases 2-4)
├── docs/                     # Architectural blueprints & engineering specifications
│   ├── architecture.md       # High-level architecture and subsystem design
│   ├── roadmap.md            # Multi-phase execution roadmap
│   ├── database-architecture.md # Dual-DB schema specifications (PostgreSQL + MongoDB)
│   └── api-architecture.md   # REST & WebSocket endpoint contracts
├── .gitignore                # Comprehensive root git exclusions
└── README.md                 # Primary system documentation
```

---

## 5. Getting Started (Preview)

### Prerequisites
- **Node.js**: `v18.x` or `v20.x` (LTS recommended)
- **Package Manager**: `npm` (v9+) or `pnpm`
- **PostgreSQL**: `v14+` running locally or via Docker
- **MongoDB**: `v6+` running locally or via Docker

### Environment Setup
1. **Backend Environment**:
   ```bash
   cp backend/.env.example backend/.env
   # Populate DATABASE_URL, MONGODB_URI, JWT_SECRET, etc.
   ```
2. **Frontend Environment**:
   ```bash
   cp frontend/.env.example frontend/.env
   # Verify VITE_API_BASE_URL and VITE_SOCKET_URL
   ```

### Database & Backend Execution (Phases 3-8)
1. **Database Setup**:
   Ensure PostgreSQL is running locally on port 5432 (Windows Service: `postgresql-x64-18`) and MongoDB is running on port 27017.
2. **Generate Client & Apply Migrations**:
   ```bash
   cd backend
   npm run prisma:generate
   npm run prisma:migrate
   npm run prisma:seed
   npm run db:verify
   ```
3. **Execute Comprehensive Automated Test Suite (135 tests)**:
   ```bash
   npm test
   ```
4. **Run Backend Development Server**:
   ```bash
   npm run dev
   ```

### Frontend 3D Game World Execution (Phase 9)
1. **Navigate & Install Dependencies**:
   ```bash
   cd frontend
   npm install
   ```
2. **Run Interactive Vite Development Server (Port 3000)**:
   ```bash
   npm run dev
   ```
3. **Build Optimized Production Artifact**:
   ```bash
   npm run build
   ```

---

## 6. Project Governance & Engineering Standards

- **Clean Architecture**: Clear separation of concerns (Controllers $\rightarrow$ Services $\rightarrow$ Data Access Objects / Repositories).
- **Separation of Truth**: Relational entities are strictly owned by PostgreSQL; unstructured/high-velocity telemetry is held by MongoDB.
- **Simulation Rigor**: Scientific equations calculate aquifer balance; simulated models are mathematically distinguished from real-world telemetry feeds.
- **Security First**: No hardcoded credentials; all secrets injected at runtime via environment variables.

---

## 7. Documentation Index

- [Phase 16 QA & Technical Audit Final Report](file:///docs/PHASE_16_QA_FINAL_REPORT.md)
- [Notification System Architecture](file:///docs/NOTIFICATION_SYSTEM.md)
- [Real-Time Notification & Communication Architecture](file:///docs/REALTIME_ARCHITECTURE.md)
- [Teacher & Admin Announcement Guide](file:///docs/ANNOUNCEMENTS.md)
- [Admin Dashboard & Platform Governance Architecture](file:///docs/ADMIN_DASHBOARD.md)
- [Admin API Endpoints Specification](file:///docs/ADMIN_API.md)
- [Admin Security & Governance Policies](file:///docs/ADMIN_SECURITY.md)
- [Teacher Dashboard & Classroom Management](file:///docs/TEACHER_DASHBOARD.md)
- [Frontend Gamification & Directives Architecture](file:///docs/GAMIFICATION_FRONTEND.md)
- [Student Gameplay & Progression Walkthrough](file:///docs/STUDENT_GAMEPLAY_FLOW.md)
- [Teacher Supervisory & Classroom Specification](file:///docs/TEACHER_GAMEPLAY.md)
- [Real-Time Hydrological Simulation & 3D Synchronization](file:///docs/REALTIME_SIMULATION.md)
- [Socket.IO Events & Room Authorization Contracts](file:///docs/SOCKET_EVENTS.md)
- [JalRakshak AI Water Mentor & Pedagogy](file:///docs/AI_WATER_MENTOR.md)
- [AI Safety, Governance & Guardrails](file:///docs/AI_SECURITY.md)
- [Interactive 3D Indian Village & Game World](file:///docs/3D_GAME_WORLD.md)
- [Frontend Architecture & Three.js Pipeline](file:///docs/FRONTEND_ARCHITECTURE.md)
- [Frontend API & Real-time Integration](file:///docs/FRONTEND_API_INTEGRATION.md)
- [Gamification, Quests & Mission Engine](file:///docs/GAMIFICATION_SYSTEM.md)
- [XP Progression & Level Hierarchy Rules](file:///docs/PROGRESSION_RULES.md)
- [Groundwater Hydrological Model & Scientific Equations](file:///docs/GROUNDWATER_MODEL.md)
- [System Architecture Specification](file:///docs/architecture.md)
- [API Documentation & Authentication Specification](file:///docs/API_DOCUMENTATION.md)
- [PostgreSQL & MongoDB Database Schema Specification](file:///docs/DATABASE_SCHEMA.md)
- [Database Architecture & Polyglot Strategy](file:///docs/database-architecture.md)
- [Development Roadmap & Phases](file:///docs/roadmap.md)
- [API Architecture & Event Contracts](file:///docs/api-architecture.md)
