# JalRakshak — Phase 13: Admin Dashboard & Platform Governance Architecture

## 1. Overview & Operational Scope

The **Admin Dashboard & Platform Management System** provides master platform administrators with complete oversight over user cohorts, curriculum content, simulated geographical environments, community challenges, security audit logs, and cluster infrastructure health.

The governance interface adopts a nature-inspired enterprise palette (deep navy slate surfaces, sky blue primary indicators, emerald health badges, and amber caution accents) designed for clarity and operational safety.

---

## 2. Platform Architecture & Subsystems

```
+---------------------------------------------------------------------------------------------------------+
|                                        ADMINISTRATIVE CONSOLE                                           |
|                                                                                                         |
|  +--------------------+  +--------------------+  +--------------------+  +---------------------------+  |
|  | Platform Overview  |  |   User Directory   |  | Teacher Oversight  |  |     Village Modeling      |  |
|  | (/admin/dashboard) |  |   (/admin/users)   |  | (/admin/teachers)  |  |     (/admin/villages)     |  |
|  +--------------------+  +--------------------+  +--------------------+  +---------------------------+  |
|  +--------------------+  +--------------------+  +--------------------+  +---------------------------+  |
|  | Mission Curriculum |  | Community Events   |  | Platform Analytics |  |    Activity Audit Logs    |  |
|  | (/admin/missions)  |  | (/admin/challenges)|  | (/admin/analytics) |  |    (/admin/audit-logs)    |  |
|  +--------------------+  +--------------------+  +--------------------+  +---------------------------+  |
|  +---------------------------------------------------------------------------------------------------+  |
|  | System Health Diagnostics & Cluster Telemetry (/admin/system-health)                              |  |
|  +---------------------------------------------------------------------------------------------------+  |
+---------------------------------------------------------------------------------------------------------+
                                                     |
                                   Bearer JWT (Strict RBAC: Role = ADMIN)
                                                     v
+---------------------------------------------------------------------------------------------------------+
|                                        BACKEND API GATEWAY                                              |
|                                                                                                         |
|  Route Prefix: /api/v1/admin/*                                                                          |
|  Security Middleware: authenticate -> authorize('ADMIN')                                                |
|                                                                                                         |
|  Security Governance Safeguards:                                                                        |
|  1. Sole-Admin Protection: Accidental deactivation/demotion of last active administrator blocked (400). |
|  2. Zero Credential Exposure: Password hashes, JWT secrets, and connection URIs strictly redacted.      |
|  3. Append-Only Audit Logging: Administrative events captured in MongoDB AuditLog collection.           |
|                                                                                                         |
|  Data Architecture:                                                                                     |
|  - Relational Master Data (PostgreSQL via Prisma): Users, Villages, Missions, Challenges, XP, Progress  |
|  - Document Telemetry & Audit Logs (MongoDB via Mongoose): Security events, chat sessions, snapshots    |
+---------------------------------------------------------------------------------------------------------+
```

---

## 3. Administrative Modules & Capabilities

### A. Platform Overview Cockpit (`/admin/dashboard`)
- **Key Metrics (8 Primary KPI Cards)**:
  - Total registered accounts & active ratios.
  - Enrolled gameplay students.
  - Supervising teachers.
  - Modeled village watershed environments.
  - Active curriculum missions and completion totals.
  - Authoritative hydrological simulation executions.
  - Community achievements unlocked.
  - Master administrator counts.
- **Visual Analytics**:
  - Recharts AreaChart: 5-day user registration momentum.
  - Recharts BarChart: Completed vs In-progress missions by hydrological category.
- **Direct Shortcuts**: Immediate actions to create villages, author missions, launch challenges, or inspect logs.
- **Infrastructure Status Snapshot**: Quick health cards for API gateway, relational store, and document database.

### B. User Directory & Access Management (`/admin/users`)
- **Search & Filters**: Multi-criteria search by name/email; filter by `STUDENT`, `TEACHER`, `ADMIN` and status (`ACTIVE`, `INACTIVE`).
- **Role Elevation & Demotion**: Modal dialog allowing authorized role changes with backend input validation.
- **Account Activation & Deactivation**: Action button with confirmation dialog for account suspension.
- **Sole-Administrator Protection**: Backend blocks deactivating or demoting the last active administrator account, preventing accidental platform lockout.
- **Zero Credential Exposure**: User queries explicitly select public attributes, ensuring password hashes and tokens never traverse the API boundary.

### C. Teacher Oversight (`/admin/teachers`)
- **Roster Overview**: Complete list of educators holding the `TEACHER` role.
- **Supervision Cohort Tracking**: Counts and lists active students assigned to each teacher under `TeacherStudentAssignment`.
- **Unassigned Educator Detection**: Identifies teachers without assigned students for classroom balancing.
- **Classroom Assignment Metrics**: Tracks missions dispatched by each teacher.

### D. Village Watershed Modeling (`/admin/villages`)
- **Spatial Modeling**: Displays modeled village environments with regional, district, and state metadata.
- **Geographic Coordinates**: Displays latitude/longitude for spatial GIS alignment.
- **Simulation Summaries**: Inspects total simulations executed, member enrollments, and groundwater snapshots per village.
- **Creation & Editing Modals**: Interactive forms to model new watersheds or update hydrogeological parameters.

### E. Mission Curriculum Governance (`/admin/missions`)
- **Curriculum Authoring**: Allows administrators to create and update educational missions across 5 core domains:
  - Groundwater Conservation
  - Rainwater Harvesting
  - Sustainable Agriculture & Micro-Irrigation
  - Water Quality & Salinity Defense
  - Drought Management
- **TaskEvaluator Compatibility**: Tasks are defined with authoritative types (`COMPLETE_SIMULATION`, `ACHIEVE_STORAGE_THRESHOLD`, `USE_DRIP_IRRIGATION`, etc.) and evaluated server-side.
- **XP & Level Criteria**: Configures prerequisite player levels and reward XP.
- **Active Status Toggle**: Allows temporary deactivation of missions without deleting historical student records.

### F. Community Challenge Events (`/admin/challenges`)
- **Time-Bound Events**: Configures daily, weekly, and limited-time community competitions.
- **Start and End Date Verification**: Validates `endDate > startDate` at both schema and controller levels.
- **Participation Statistics**: Tracks enrollment and completion counts per event.

### G. Platform Analytics (`/admin/analytics`)
- **Cohort Distribution**: Breakdown across Students, Teachers, and Admins.
- **Watershed Simulation Density**: Comparative chart of simulation activity across modeled villages.
- **Student Progression Levels**: Visual breakdown of student populations across Levels 1–6.
- **Monthly Velocity**: Area chart plotting cumulative users vs simulation runs over time.

### H. Activity Audit Logs (`/admin/audit-logs`)
- **MongoDB Audit Ledger**: Powered by `AuditLogService` recording actor, action, resource, timestamp, and metadata.
- **Action Filters**: Filters by event types (`USER_ROLE_CHANGED`, `USER_ACTIVATED`, `USER_DEACTIVATED`, `VILLAGE_CREATED`, `MISSION_CREATED`, etc.).
- **Graceful Offline Degradation**: If MongoDB is disconnected, displays a clear service-unavailable diagnostic banner rather than pretending records are stored.

### I. System Health Diagnostics (`/admin/system-health`)
- **Live Cluster Probing**: Inspects actual connectivity for:
  - Core Express HTTP Gateway (Uptime, Node Version, Heap Memory Consumed).
  - PostgreSQL Relational Database (Prisma connection latency via `SELECT 1`).
  - MongoDB Document Store (Mongoose connection state).
  - Socket.IO Real-Time Gateway (Active simulation namespaces).
  - AI Water Mentor (OpenAI API key configuration).
- **Security Policy**: Zero exposure of environment variables, database passwords, or connection URLs.
