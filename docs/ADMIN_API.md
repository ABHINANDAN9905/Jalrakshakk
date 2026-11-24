# JalRakshak — Phase 13: Admin API Specification

## 1. Overview & Security Baseline

All routes documented herein reside under the base path `/api/v1/admin/*` and require:
- Header: `Authorization: Bearer <accessToken>`
- Claims: Role must be strictly `ADMIN`.
- Rejection Policy: `STUDENT` and `TEACHER` accounts receive `403 Forbidden`. Requests lacking a token receive `401 Unauthorized`.

---

## 2. API Endpoints Catalog

### 2.1 Dashboard & Telemetry
#### `GET /api/v1/admin/dashboard`
- **Description**: High-level platform statistics, user registration momentum, mission completion distribution, and cluster health snapshot.
- **Response (`200 OK`)**:
  ```json
  {
    "success": true,
    "statusCode": 200,
    "data": {
      "overview": {
        "totalUsers": 24,
        "totalStudents": 18,
        "totalTeachers": 4,
        "totalAdmins": 2,
        "totalVillages": 3,
        "totalActiveUsers": 22,
        "totalMissions": 5,
        "totalCompletedMissions": 14,
        "totalSimulationRuns": 86,
        "totalAchievementsUnlocked": 38
      },
      "registrationTrends": [
        { "period": "Mon", "count": 3 },
        { "period": "Tue", "count": 5 }
      ],
      "missionTrends": [
        { "category": "Groundwater Conservation", "completed": 14, "inProgress": 6 }
      ],
      "systemStatus": {
        "backendApi": "OPERATIONAL",
        "database": "HEALTHY",
        "mongodb": "HEALTHY"
      }
    }
  }
  ```

---

### 2.2 User Directory Management
#### `GET /api/v1/admin/users`
- **Query Parameters**:
  - `page` (default: 1): Integer page number.
  - `limit` (default: 20): Integer page limit.
  - `search`: Case-insensitive substring match on name or email.
  - `role`: Filter by `STUDENT`, `TEACHER`, or `ADMIN`.
  - `status`: Filter by `ACTIVE` or `INACTIVE`.
- **Response (`200 OK`)**: Returns paginated array of user objects excluding sensitive credential fields (`passwordHash` and `refreshTokens`).

#### `PATCH /api/v1/admin/users/:id/status`
- **Request Body**:
  ```json
  { "isActive": false }
  ```
- **Response (`200 OK`)**: Updated user profile.
- **Error (`400 Bad Request`)**: Thrown if attempting to deactivate the last remaining active administrator account.

#### `PATCH /api/v1/admin/users/:id/role`
- **Request Body**:
  ```json
  { "role": "TEACHER" }
  ```
- **Response (`200 OK`)**: Updated user profile with new role.
- **Error (`400 Bad Request`)**: Thrown if attempting to demote the last remaining active administrator account.

---

### 2.3 Teacher Oversight
#### `GET /api/v1/admin/teachers`
- **Query Parameters**: `page`, `limit`, `search`, `status`.
- **Response (`200 OK`)**: Array of educators with:
  - `assignedStudentsCount`: Total students supervised.
  - `assignedStudents`: List of assigned student records.
  - `classroomAssignmentsCount`: Total missions dispatched.
  - `isUnassigned`: Boolean flag indicating no supervised students.

---

### 2.4 Village Watershed Management
#### `GET /api/v1/admin/villages`
- **Query Parameters**: `page`, `limit`, `search`, `region`, `state`.
- **Response (`200 OK`)**: Modeled villages with `memberCount` and `simulationRunsCount`.

#### `POST /api/v1/admin/villages`
- **Request Body**:
  ```json
  {
    "name": "Kisanpur Village",
    "description": "Alluvial aquifer model experiencing tubewell cone of depression.",
    "region": "Central India",
    "state": "Maharashtra",
    "population": 3200,
    "latitude": 20.9374,
    "longitude": 77.7796
  }
  ```
- **Response (`201 Created`)**: Persisted village entity.

#### `PATCH /api/v1/admin/villages/:id`
- **Request Body**: Partial update object.
- **Response (`200 OK`)**: Updated village entity.

---

### 2.5 Mission Curriculum Governance
#### `GET /api/v1/admin/missions`
- **Query Parameters**: `category`, `difficulty`, `status`.
- **Response (`200 OK`)**: Array of educational missions with sub-task lists and enrollment counters.

#### `POST /api/v1/admin/missions`
- **Request Body**:
  ```json
  {
    "title": "Artificial Aquifer Recharge Wells",
    "description": "Deploy direct recharge shafts to channel clean runoff into confined aquifers.",
    "category": "RAINWATER_HARVESTING",
    "difficulty": "INTERMEDIATE",
    "xpReward": 350,
    "requiredLevel": 2,
    "tasks": [
      {
        "title": "Build Recharge Shaft",
        "description": "Deploy intervention and verify percolation rate.",
        "taskType": "BUILD_CONSERVATION_STRUCTURE",
        "xpReward": 150,
        "orderIndex": 0
      }
    ]
  }
  ```
- **Response (`201 Created`)**: Persisted mission entity with child tasks.

#### `PATCH /api/v1/admin/missions/:id/status`
- **Request Body**: `{ "isActive": false }`
- **Response (`200 OK`)**: Updated mission active status.

---

### 2.6 Community Challenge Management
#### `GET /api/v1/admin/challenges`
- **Response (`200 OK`)**: Array of daily, weekly, and limited-time challenges with participation counts.

#### `POST /api/v1/admin/challenges`
- **Request Body**:
  ```json
  {
    "title": "Monsoon Harvesting Blitz",
    "description": "Collect 50,000 m³ using community check dams within 7 days.",
    "type": "WEEKLY",
    "startDate": "2026-12-01T00:00:00.000Z",
    "endDate": "2026-12-08T00:00:00.000Z",
    "xpReward": 250
  }
  ```
- **Response (`201 Created`)**: Created challenge entity.
- **Error (`400 Bad Request`)**: Thrown if `endDate <= startDate`.

---

### 2.7 Platform Analytics & Activity Audit Logs
#### `GET /api/v1/admin/analytics`
- **Response (`200 OK`)**: Platform-wide telemetry (role distribution, village simulation density, student level ranks, monthly growth velocity).

#### `GET /api/v1/admin/audit-logs`
- **Query Parameters**: `page`, `limit`, `action`, `resource`, `actorId`.
- **Response (`200 OK`)**: Array of immutable audit records from MongoDB. Returns `{ isUnavailable: true }` when MongoDB is disconnected.

---

### 2.8 System Health Diagnostics
#### `GET /api/v1/admin/system-health`
- **Response (`200 OK`)**:
  ```json
  {
    "timestamp": "2026-11-22T05:15:00.000Z",
    "uptimeSeconds": 3600,
    "environment": "production",
    "services": {
      "backendApi": { "name": "JalRakshak Core HTTP Gateway", "status": "CONNECTED", "nodeVersion": "v20.20.2", "memoryUsageMB": 128 },
      "postgresql": { "name": "PostgreSQL Relational Primary (Prisma)", "status": "CONNECTED", "latencyMs": 4 },
      "mongodb": { "name": "MongoDB Document & Audit Store (Mongoose)", "status": "CONNECTED", "state": "connected" },
      "socketIo": { "name": "Socket.IO Real-Time Hydrology Gateway", "status": "CONNECTED", "activeNamespaces": ["/simulation", "/ai-mentor"] },
      "aiWaterMentor": { "name": "AI Water Mentor (OpenAI LLM Integration)", "status": "CONFIGURED" }
    }
  }
  ```
