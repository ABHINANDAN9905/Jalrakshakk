# JalRakshak API Documentation & Authentication Specification

## 1. Overview & Authentication Architecture

JalRakshak utilizes a stateless **JSON Web Token (JWT)** authentication architecture with dual-token rotation and strict **Role-Based Access Control (RBAC)** across three tiers:
- **`STUDENT`**: Default public registration role. Access to personal profile, simulations, learning quests, and AI mentorship.
- **`TEACHER`**: Educator role. Classroom monitoring, custom scenario generation, and student performance oversight.
- **`ADMIN`**: Platform governor. Global user administration, system settings, and telemetry audits. Public self-registration as ADMIN is strictly blocked.

### Dual-Token Lifecycle & Security
1. **Short-Lived Access Token (15 minutes)**:
   - Carries user identity and authorization claims: `{ id, email, role }`.
   - Transmitted in HTTP Header: `Authorization: Bearer <accessToken>` (or HTTP-only cookie).
2. **Secure Refresh Token (7 days)**:
   - Carries unique random payload (`jti`) signed with `JWT_REFRESH_SECRET`.
   - Stored in the client as a secure, `httpOnly`, `sameSite: lax` cookie (`path: /api/v1/auth`).
   - **Database Persistence**: Plain-text refresh tokens are **never** stored in the database. Only deterministic **SHA-256 hashes** (`tokenHash`) are persisted in PostgreSQL (`refresh_tokens` table).
   - **Token Rotation**: Every call to `/auth/refresh` immediately revokes the used token hash and issues a fresh token pair.

---

## 2. API Endpoints Catalog

Base Path: `/api/v1`

### 2.1 Authentication Endpoints (`/api/v1/auth`)

#### `POST /api/v1/auth/register`
Creates a new student account. (Self-registration as `ADMIN` is strictly forbidden).

- **Request Body**:
  ```json
  {
    "name": "Aarav Sharma",
    "email": "aarav@example.com",
    "password": "Password123!",
    "confirmPassword": "Password123!",
    "role": "STUDENT"
  }
  ```
- **Response (`201 Created`)**:
  ```json
  {
    "success": true,
    "statusCode": 201,
    "message": "Account registered successfully",
    "data": {
      "user": {
        "id": "c1f7a0b2-38e2-411a-8c90-9f5b2e51921a",
        "name": "Aarav Sharma",
        "email": "aarav@example.com",
        "role": "STUDENT",
        "createdAt": "2026-11-22T02:00:00.000Z"
      },
      "accessToken": "eyJhbGciOi...",
      "refreshToken": "eyJhbGciOi..."
    }
  }
  ```

---

#### `POST /api/v1/auth/login`
Authenticates user credentials and issues tokens. Protected by rate limiting (max 20 requests per 15 min).

- **Request Body**:
  ```json
  {
    "email": "aarav@example.com",
    "password": "Password123!"
  }
  ```
- **Response (`200 OK`)**:
  ```json
  {
    "success": true,
    "statusCode": 200,
    "message": "Login successful",
    "data": {
      "user": {
        "id": "c1f7a0b2-38e2-411a-8c90-9f5b2e51921a",
        "name": "Aarav Sharma",
        "email": "aarav@example.com",
        "role": "STUDENT"
      },
      "accessToken": "eyJhbGciOi...",
      "refreshToken": "eyJhbGciOi..."
    }
  }
  ```

---

#### `POST /api/v1/auth/refresh`
Rotates refresh tokens and issues fresh access credentials.

- **Headers/Cookies**: `refresh_token` HTTP-only cookie OR body `{ "refreshToken": "..." }`.
- **Response (`200 OK`)**:
  ```json
  {
    "success": true,
    "statusCode": 200,
    "message": "Session refreshed successfully",
    "data": {
      "user": { "id": "...", "name": "...", "email": "...", "role": "STUDENT" },
      "accessToken": "eyJhbGciOi...",
      "refreshToken": "eyJhbGciOi..."
    }
  }
  ```

---

#### `POST /api/v1/auth/logout`
Revokes active refresh token and clears authentication cookies.

- **Response (`200 OK`)**:
  ```json
  {
    "success": true,
    "statusCode": 200,
    "message": "Logged out successfully"
  }
  ```

---

#### `GET /api/v1/auth/me`
Retrieves currently authenticated user claims.

- **Headers**: `Authorization: Bearer <accessToken>`
- **Response (`200 OK`)**:
  ```json
  {
    "success": true,
    "statusCode": 200,
    "data": {
      "id": "c1f7a0b2-38e2-411a-8c90-9f5b2e51921a",
      "name": "Aarav Sharma",
      "email": "aarav@example.com",
      "role": "STUDENT"
    }
  }
  ```

---

### 2.2 User Profile Endpoints (`/api/v1/users`)

#### `GET /api/v1/users/profile`
Retrieves full user profile with enrolled village memberships.

- **Headers**: `Authorization: Bearer <accessToken>`
- **Response (`200 OK`)**:
  ```json
  {
    "success": true,
    "statusCode": 200,
    "data": {
      "id": "c1f7a0b2-...",
      "name": "Aarav Sharma",
      "email": "aarav@example.com",
      "role": "STUDENT",
      "isActive": true,
      "memberships": [
        {
          "id": "m-101",
          "village": {
            "id": "v-1",
            "name": "Rampur Watershed",
            "region": "Ahmednagar, Maharashtra"
          }
        }
      ]
    }
  }
  ```

#### `PATCH /api/v1/users/profile`
Updates user name or changes password (requires `currentPassword`).

- **Request Body**:
  ```json
  {
    "name": "Aarav S. Sharma",
    "currentPassword": "Password123!",
    "newPassword": "NewStrongPassword456!"
  }
  ```

---

### 2.3 User Directory & Admin Governance (`/api/v1/users`)

#### `GET /api/v1/users`
Lists all users with search, role filtering, and pagination.
- **Access**: `ADMIN` only.
- **Query Parameters**:
  - `search` (optional): Filter by name or email.
  - `role` (optional): `STUDENT`, `TEACHER`, or `ADMIN`.
  - `page` (optional, default `1`).
  - `limit` (optional, default `20`, max `100`).

#### `GET /api/v1/users/:id`
Retrieves user detail, enrolled villages, and aggregated learning progress (completed missions, points, water saved).
- **Access**: Self, Assigned Teacher, or `ADMIN`.

#### `PATCH /api/v1/users/:id/status`
Activates or deactivates a user account.
- **Access**: `ADMIN` only.
- **Body**: `{ "isActive": false }`

#### `PATCH /api/v1/users/:id/role`
Updates a user's role with privilege elevation control.
- **Access**: `ADMIN` only.
- **Body**: `{ "role": "TEACHER" }`

#### `GET /api/v1/users/:id/villages`
Lists all village communities the target user is enrolled in.
- **Access**: Self, Assigned Teacher, or `ADMIN`.

---

### 2.4 Virtual Village Management (`/api/v1/villages`)

#### `GET /api/v1/villages`
Retrieves paginated list of virtual village watersheds with search and filters.
- **Access**: Authenticated (`STUDENT`, `TEACHER`, `ADMIN`).
- **Query Parameters**: `search`, `region`, `state`, `district`, `page`, `limit`.

#### `GET /api/v1/villages/:id`
Retrieves detailed village info, hydrogeology, coordinates, member count, and recent simulation stats.
- **Access**: Authenticated.

#### `POST /api/v1/villages`
Creates a new virtual village simulation watershed.
- **Access**: `ADMIN` only.
- **Body**:
  ```json
  {
    "name": "Khed Shivapur",
    "description": "A drought-prone agricultural village in Western Maharashtra",
    "region": "Western Ghats Rain Shadow",
    "district": "Pune",
    "state": "Maharashtra",
    "country": "India",
    "population": 4500,
    "latitude": 18.356,
    "longitude": 73.856
  }
  ```

#### `PATCH /api/v1/villages/:id`
Updates village parameters, population, or hydrogeology description.
- **Access**: `ADMIN` only.

#### `DELETE /api/v1/villages/:id`
Deletes a virtual village (cascades memberships and simulation runs safely).
- **Access**: `ADMIN` only.

---

### 2.5 Village Membership & Enrollment

#### `POST /api/v1/villages/:id/join`
Enrolls the authenticated user into the target village community.
- **Access**: Authenticated (`STUDENT`, `TEACHER`, `ADMIN`).
- **Protection**: Rejects duplicate membership (`409 Conflict`). Transactional.

#### `DELETE /api/v1/villages/:id/leave`
Leaves the village community.
- **Access**: Authenticated. Transactional.

#### `GET /api/v1/villages/:id/members`
Lists all enrolled students and teachers in the village with pagination.
- **Access**: Authenticated.

---

### 2.6 Teacher-Student Classroom Assignments (`/api/v1/teachers`)

#### `GET /api/v1/teachers/my-students`
Convenience endpoint for an authenticated teacher to retrieve their assigned students, learning summaries, and village progress.
- **Access**: `TEACHER` only.

#### `GET /api/v1/teachers/:teacherId/students`
Lists students assigned to a specific teacher ID.
- **Access**: Assigned `TEACHER` (self) or `ADMIN`. Blocked for `STUDENT` or unassigned teachers (`403 Forbidden`).

#### `POST /api/v1/teachers/:teacherId/students/:studentId`
Assigns a student to an authorized teacher for classroom supervision.
- **Access**: `ADMIN` only.
- **Validation**: Verifies teacher has `TEACHER` role and student has `STUDENT` role. Rejects duplicate assignment (`409 Conflict`).

#### `DELETE /api/v1/teachers/:teacherId/students/:studentId`
Unassigns a student from a teacher.
- **Access**: `ADMIN` only.

---

### 2.7 Groundwater Hydrological Simulation Engine (`/api/v1/simulations`)

#### `POST /api/v1/simulations/run`
Executes a single discrete hydrological simulation step or seasonal cycle for a village watershed.
- **Access**: Authenticated (`STUDENT`, `TEACHER`, `ADMIN`).
- **Request Body**:
  ```json
  {
    "villageId": "123e4567-e89b-12d3-a456-426614174000",
    "scenarioId": "SUSTAINABLE_FARMING",
    "season": "Post-Monsoon",
    "rainfallMm": 550,
    "catchmentAreaM2": 5000000,
    "initialStorageM3": 450000,
    "maxCapacityM3": 1000000,
    "soilType": "BLACK_COTTON",
    "slope": "MODERATE",
    "crops": [
      { "crop": "MILLETS", "hectares": 40 },
      { "crop": "PULSES", "hectares": 30 },
      { "crop": "VEGETABLES", "hectares": 15 }
    ],
    "irrigationMethod": "DRIP",
    "interventions": {
      "checkDamsCount": 2,
      "percolationTanksCount": 1,
      "farmPondsCount": 3,
      "rooftopRWHUnits": 15
    },
    "organicFarming": true,
    "bioFiltersActive": true
  }
  ```
- **Response (`201 Created`)**:
  ```json
  {
    "success": true,
    "statusCode": 201,
    "data": {
      "simulationId": "run-uuid-...",
      "waterBalance": {
        "initialStorageM3": 450000,
        "rainfallMm": 550,
        "rainfallVolumeM3": 2750000,
        "runoffVolumeM3": 1237500,
        "infiltrationVolumeM3": 687500,
        "rechargeM3": 376250,
        "extractionM3": 118400,
        "naturalDischargeM3": 13500,
        "finalStorageM3": 694350,
        "storagePercentage": 69.4,
        "conditionCategory": "SAFE"
      },
      "sectors": {
        "agriculturalExtractionM3": 98600,
        "domesticExtractionM3": 19800,
        "waterSavingsM3": 91000
      },
      "waterQuality": {
        "initialWQI": 78,
        "finalWQI": 84.5,
        "category": "Pristine / Excellent"
      },
      "sustainability": {
        "overallScore": 88,
        "factorScores": {
          "aquiferHealth": 30,
          "rechargeBalance": 25,
          "irrigationEfficiency": 20,
          "conservationInterventions": 11,
          "waterQuality": 8.5
        },
        "explanations": [
          "Aquifer storage is in ideal equilibrium (69.4% of capacity).",
          "Drip micro-irrigation applied: High precision root-zone delivery saved 91000 m³."
        ]
      }
    }
  }
  ```

#### `GET /api/v1/simulations/history`
Retrieves paginated history of executed simulations. Students only view their own; teachers view their assigned students; admins view platform-wide.
- **Access**: Authenticated.
- **Query Parameters**: `villageId` (optional), `page` (default `1`), `limit` (default `20`).

#### `GET /api/v1/simulations/:id`
Inspects full calculation details and explanations for a specific simulation run.
- **Access**: Self, Assigned Teacher, or `ADMIN`.

#### `GET /api/v1/simulations/scenarios`
Lists all 6 pre-configured educational scenarios.
- **Access**: Authenticated.

#### `GET /api/v1/simulations/scenarios/:scenarioId`
Retrieves full environmental baseline parameters and learning objectives for a specific scenario.
- **Access**: Authenticated.

---

### 2.8 Village Groundwater Monitoring (`/api/v1/groundwater`)

#### `GET /api/v1/groundwater/villages/:villageId`
Retrieves the current groundwater table snapshot, storage index, saturation percentage, and condition category for a village.
- **Access**: Authenticated.

#### `GET /api/v1/groundwater/villages/:villageId/history`
Retrieves time-series historical records of water levels, extraction, and water quality index for chart rendering.
- **Access**: Authenticated.
- **Query Parameters**: `page` (default `1`), `limit` (default `20`).

---

### 2.9 Gamification, Missions, Challenges & Leaderboards (`/api/v1`)

#### Missions Endpoints (`/api/v1/missions`)
- `GET /api/v1/missions`: List available educational missions (filters: `category`, `difficulty`, `level`).
- `GET /api/v1/missions/my/progress`: List authenticated student's mission progress and scores.
- `GET /api/v1/missions/:id`: Get mission details, instructions, and task completion states.
- `POST /api/v1/missions/:id/start`: Start an educational mission (verifies student level requirement).
- `POST /api/v1/missions/:id/tasks/:taskId/complete`: Submit verified Phase 7 simulation outputs or quiz to complete a task and claim XP.

#### Progression & XP Ledger (`/api/v1/progression`, `/api/v1/xp`)
- `GET /api/v1/progression/me`: Retrieve current student level (1-6), title, current XP, and perks.
- `GET /api/v1/xp/history`: Paginated immutable audit ledger of all XP earning transactions.

#### Achievements & Badges (`/api/v1/achievements`)
- `GET /api/v1/achievements`: Complete catalog of 8 educational badges and unlock criteria.
- `GET /api/v1/achievements/my`: List badges unlocked by the authenticated student.

#### Daily & Weekly Challenges (`/api/v1/challenges`)
- `GET /api/v1/challenges`: List all currently active and non-expired challenges.
- `POST /api/v1/challenges/:id/join`: Enroll student into an active challenge.
- `GET /api/v1/challenges/my`: List challenges joined by student.

#### Teacher Classroom Missions (`/api/v1/teacher`)
- `POST /api/v1/teacher/missions/assign`: Teacher assigns a mission to an authorized student.
- `GET /api/v1/teacher/missions/assignments`: Teacher views all active assignments.
- `GET /api/v1/teacher/students/:studentId/progress`: Teacher inspects assigned student's learning progress and XP.

#### Leaderboard Rankings (`/api/v1/leaderboard`)
- `GET /api/v1/leaderboard?type=TOTAL_XP&limit=20`: Privacy-preserving student rankings across `TOTAL_XP`, `WEEKLY_XP`, `MISSIONS_COMPLETED`, and `ACHIEVEMENTS_COUNT`.

#### Admin Mission Governance (`/api/v1/admin/missions`)
- `POST /api/v1/admin/missions`: Admin creates a new educational mission.
- `PATCH /api/v1/admin/missions/:id`: Admin updates an existing mission.
- `DELETE /api/v1/admin/missions/:id`: Admin deletes a mission.

---

### 2.10 Role-Based Access Control (RBAC) Test Endpoints

| Endpoint | Method | Required Role | Student Access | Teacher Access | Admin Access |
| :--- | :--- | :--- | :---: | :---: | :---: |
| `/api/v1/test/student-only` | `GET` | `STUDENT` | `200 OK` | `403 Forbidden` | `403 Forbidden` |
| `/api/v1/test/teacher-only` | `GET` | `TEACHER` | `403 Forbidden` | `200 OK` | `403 Forbidden` |
| `/api/v1/test/admin-only` | `GET` | `ADMIN` | `403 Forbidden` | `403 Forbidden` | `200 OK` |

---

### 2.11 AI Water Mentor Endpoints (`/api/v1/ai-mentor`)

Authentication required (`Authorization: Bearer <token>`).

#### `POST /api/v1/ai-mentor/chat`
Ask question to the AI Water Mentor. Grounded in student's active simulation context.
- **Request Body**:
  ```json
  {
    "message": "Why is drip irrigation better for our village groundwater?",
    "sessionId": "ses-optional-custom-id",
    "villageId": "123e4567-e89b-12d3-a456-426614174000",
    "includeSimulationContext": true
  }
  ```
- **Response (`200 OK`)**:
  ```json
  {
    "success": true,
    "statusCode": 200,
    "data": {
      "sessionId": "ses-student-1",
      "reply": "### 🌱 Drip vs. Flood Irrigation...",
      "provider": "openai",
      "isAiGenerated": true,
      "recommendedActions": [
        { "id": "act-farm", "label": "Inspect Farmland & Drip Plots", "target": "NAVIGATE_FARM" }
      ]
    }
  }
  ```

#### `GET /api/v1/ai-mentor/explain-simulation`
Requests an authoritative explanation of the student's latest simulation results.

#### `GET /api/v1/ai-mentor/recommendations`
Returns prioritized conservation directives (Agriculture, Watershed, Community, Extraction) linked to interactive 3D game entities.

#### `GET /api/v1/ai-mentor/quiz?topic=RECHARGE`
Returns an educational multiple-choice quiz question with options and scientific explanation.

#### `GET /api/v1/ai-mentor/conversations`
Retrieves past conversation sessions for the authenticated student.

#### `DELETE /api/v1/ai-mentor/conversations/:sessionId`
Deletes a conversation session with strict ownership verification.

---

### 2.7 Teacher Dashboard & Classroom Management (`/api/v1/teacher`)

All endpoints in this section require `Authorization: Bearer <accessToken>` with role `TEACHER` or `ADMIN`. Access by `STUDENT` returns `403 Forbidden`. Cross-teacher inspection of unassigned students returns `403 Forbidden`.

#### `GET /api/v1/teacher/dashboard`
Returns high-level classroom supervisory metrics:
- **Response (`200 OK`)**:
  ```json
  {
    "success": true,
    "statusCode": 200,
    "data": {
      "teacherId": "123e4567-e89b-12d3-a456-426614174001",
      "totalStudents": 4,
      "activeStudents": 4,
      "totalAssignments": 3,
      "completedAssignments": 1,
      "pendingAssignments": 2,
      "overdueAssignments": 1,
      "averageStudentXP": 1317,
      "classCompletionRate": 33.3,
      "studentsRequiringAttention": [...],
      "recentActivities": [...]
    }
  }
  ```

#### `GET /api/v1/teacher/analytics`
Returns multi-dimensional classroom distributions for Recharts visualization:
- `xpDistribution`: Student count per level rank.
- `categoryPerformance`: Completion rate percentage across groundwater domains.
- `difficultyBreakdown`: Beginner, Intermediate, and Advanced success rates.
- `weeklyActivityTrends`: 7-day timeline of simulations run and tasks completed.
- `achievementDistribution`: Student unlocks per badge.
- `incompleteAssignments`: Actionable alert list for overdue or pending missions.

#### `GET /api/v1/teacher/notifications`
Returns real-time pedagogical notification alerts for mission completions, overdue deadlines, student achievement unlocks, and extended inactivity.

#### `POST /api/v1/teacher/missions/assign`
Assigns an educational mission to a single supervised student.
- **Request Body**:
  ```json
  {
    "studentId": "123e4567-e89b-12d3-a456-426614174002",
    "missionId": "123e4567-e89b-12d3-a456-426614174001",
    "dueDate": "2026-12-01T00:00:00.000Z",
    "notes": "Focus on check dam percolation parameters before running simulation."
  }
  ```

#### `POST /api/v1/teacher/missions/assign-bulk`
Deploys missions in bulk to multiple selected students or the entire supervised classroom.
- **Request Body**:
  ```json
  {
    "allClassroom": true,
    "missionId": "123e4567-e89b-12d3-a456-426614174002",
    "dueDate": "2026-12-05T00:00:00.000Z",
    "notes": "Classwide challenge: Monsoon Runoff"
  }
  ```

#### `GET /api/v1/teacher/missions/assignments`
Lists all active and historical mission assignments dispatched by the authenticated teacher.

#### `GET /api/v1/teacher/students/:studentId/detail`
Retrieves a detailed student portfolio including:
- Level rank, total XP, progression percentage.
- **Pedagogical Assessment**: Learning strengths and targeted areas for improvement.
- Full mission completion history and scores.
- Unlocked achievements showcase.
- XP transaction timeline.

#### `GET /api/v1/teacher/reports/export?format=csv`
Streams an authoritative CSV report (`text/csv; charset=utf-8`) with header `Content-Disposition: attachment; filename="jalrakshak_classroom_report_<date>.csv"` containing certified student performance records. Supports `?format=json` for JSON output.

---

### 2.8 Admin Platform Management Endpoints (`/api/v1/admin`)

All endpoints in this section require `Authorization: Bearer <accessToken>` with role strictly `ADMIN`. Requests from `STUDENT` or `TEACHER` accounts receive `403 Forbidden`.

| Endpoint | Method | Description |
|---|---|---|
| `/api/v1/admin/dashboard` | `GET` | Platform-wide KPIs, registration momentum, and infrastructure status |
| `/api/v1/admin/users` | `GET` | Paginated user accounts with search, role, and status filters |
| `/api/v1/admin/users/:id/status` | `PATCH` | Activate or deactivate accounts (with last-admin protection) |
| `/api/v1/admin/users/:id/role` | `PATCH` | Elevate or demote user role (with last-admin protection) |
| `/api/v1/admin/teachers` | `GET` | Teachers oversight list with assigned student counts |
| `/api/v1/admin/villages` | `GET` | Registered village simulation models and member statistics |
| `/api/v1/admin/villages` | `POST` | Model and configure a new village watershed |
| `/api/v1/admin/villages/:id` | `PATCH` | Update village geographical or hydrological attributes |
| `/api/v1/admin/missions` | `GET` | Missions catalog with difficulty, level requirements, and task lists |
| `/api/v1/admin/missions` | `POST` | Author a new educational mission compatible with TaskEvaluator |
| `/api/v1/admin/missions/:id` | `PATCH` | Update mission objectives, duration, or rewards |
| `/api/v1/admin/missions/:id/status` | `PATCH` | Toggle active status of a mission |
| `/api/v1/admin/challenges` | `GET` | Community challenges with participation metrics |
| `/api/v1/admin/challenges` | `POST` | Create a daily, weekly, or limited-time community challenge |
| `/api/v1/admin/challenges/:id` | `PATCH` | Update challenge criteria, end date, or XP rewards |
| `/api/v1/admin/analytics` | `GET` | Multi-dimensional platform analytics (roles, villages, XP, growth) |
| `/api/v1/admin/audit-logs` | `GET` | Immutable security audit trail from MongoDB |
| `/api/v1/admin/system-health` | `GET` | Real-time diagnostic heartbeat of all backend cluster services |

---

### 2.9 Notification & Communication Endpoints (`/api/v1/notifications`)

All notification endpoints require an authenticated user (`Authorization: Bearer <accessToken>`). Strict recipient ownership is enforced on all read, count, preference, and deletion actions.

| Endpoint | Method | Role | Description |
|---|---|---|---|
| `/api/v1/notifications` | `GET` | Any | Paginated list of user notifications (`?page=1&limit=20&isRead=false&category=...`) |
| `/api/v1/notifications/unread-count` | `GET` | Any | Returns `{ unreadCount: number }` for authenticated user |
| `/api/v1/notifications/:id/read` | `PATCH` | Any | Marks single notification as read (recipient validation enforced) |
| `/api/v1/notifications/read-all` | `PATCH` | Any | Marks all notifications as read for current user |
| `/api/v1/notifications/:id` | `DELETE` | Any | Soft/hard deletes notification owned by user |
| `/api/v1/notifications/preferences` | `GET` | Any | Returns user category notification delivery preferences |
| `/api/v1/notifications/preferences` | `PUT` | Any | Updates category delivery preferences |
| `/api/v1/notifications/announcements/teacher` | `POST` | `TEACHER` | Broadcasts announcement strictly to supervised students |
| `/api/v1/notifications/announcements/teacher` | `GET` | `TEACHER` | Lists announcements published by calling teacher |
| `/api/v1/notifications/announcements/teacher/:id/deactivate` | `PATCH` | `TEACHER` | Deactivates a teacher announcement |
| `/api/v1/notifications/announcements/admin` | `POST` | `ADMIN` | Broadcasts platform announcement to `STUDENT`, `TEACHER`, or `ALL` |
| `/api/v1/notifications/announcements/admin` | `GET` | `ADMIN` | Lists platform-wide broadcasts |
| `/api/v1/notifications/announcements/admin/:id/deactivate` | `PATCH` | `ADMIN` | Deactivates a platform announcement |

---

## 3. Environment Variables Configuration

```env
# Cryptographic & Session Secrets
JWT_SECRET=dev_jwt_access_secret_jalrakshak_2026_super_secure_key
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=dev_jwt_refresh_secret_jalrakshak_2026_long_lived_key
JWT_REFRESH_EXPIRES_IN=7d
BCRYPT_SALT_ROUNDS=10
```
