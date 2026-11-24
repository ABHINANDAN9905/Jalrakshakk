# JalRakshak PostgreSQL Database Schema Specification

This document details the PostgreSQL relational data model managed via Prisma ORM for the **JalRakshak** groundwater conservation simulation platform.

---

## 1. Database Responsibilities

PostgreSQL serves as the primary relational database and immutable source of truth for:
- **User Accounts & Roles**: Authentication identities and access roles (`STUDENT`, `TEACHER`, `ADMIN`).
- **Virtual Villages**: Geographic watershed environments and simulation boundary parameters.
- **Village Memberships**: Enrollment relations linking users to virtual communities.
- **Educational Missions**: Curricular challenges spanning groundwater hydrology, rainwater harvesting, micro-irrigation, and conservation.
- **Mission Progress**: Student-specific completion states, percentages, and scores.
- **Simulation Runs**: Gameplay session records and aggregated water balance outcomes.
- **Groundwater Records**: Time-stamped state snapshots of aquifer storage and water quality indices.

> [!NOTE]
> All storage, extraction, and recharge values recorded in `SimulationRun` and `GroundwaterRecord` are derived from the mathematical simulation game loop and pedagogical scenarios, strictly distinguished from raw physical telemetry feeds.

---

## 2. Entity-Relationship Model Overview

```mermaid
erDiagram
    User ||--o{ VillageMembership : "enrolls in"
    Village ||--o{ VillageMembership : "has members"
    User ||--o{ MissionProgress : "tracks"
    Mission ||--o{ MissionProgress : "assigned to"
    User ||--o{ SimulationRun : "conducts"
    Village ||--o{ SimulationRun : "hosts"
    Village ||--o{ GroundwaterRecord : "monitors"
    SimulationRun ||--o{ GroundwaterRecord : "generates"
    User ||--o{ TeacherStudentAssignment : "supervises as teacher"
    User ||--o{ TeacherStudentAssignment : "assigned as student"

    User {
        string id PK
        string name
        string email UK
        string passwordHash
        Role role
        boolean isActive
        datetime createdAt
        datetime updatedAt
    }

    Village {
        string id PK
        string name
        string description
        string region
        string district
        string state
        string country
        int population
        float latitude
        float longitude
        datetime createdAt
        datetime updatedAt
    }

    TeacherStudentAssignment {
        string id PK
        string teacherId FK
        string studentId FK
        datetime assignedAt
    }

    VillageMembership {
        string id PK
        string userId FK
        string villageId FK
        datetime joinedAt
    }

    Mission ||--o{ MissionTask : "contains"
    MissionTask ||--o{ MissionTaskProgress : "tracks"
    User ||--o{ MissionTaskProgress : "completes"
    User ||--o| UserXP : "accumulates"
    User ||--o{ XPTransaction : "audits"
    User ||--o{ UserAchievement : "unlocks"
    Achievement ||--o{ UserAchievement : "awarded to"
    User ||--o{ ChallengeParticipation : "joins"
    Challenge ||--o{ ChallengeParticipation : "tracks"
    User ||--o{ TeacherMissionAssignment : "assigned by teacher"
    User ||--o{ TeacherMissionAssignment : "assigned to student"
    Mission ||--o{ TeacherMissionAssignment : "curriculum target"

    Mission {
        string id PK
        string title
        string description
        Difficulty difficulty
        MissionCategory category
        int points
        int xpReward
        int estimatedDurationMinutes
        int requiredLevel
        boolean isActive
        datetime createdAt
        datetime updatedAt
    }

    MissionTask {
        string id PK
        string missionId FK
        string title
        string description
        TaskType taskType
        int orderIndex
        json targetCriteria
        int xpReward
    }

    MissionTaskProgress {
        string id PK
        string taskId FK
        string userId FK
        boolean isCompleted
        datetime completedAt
        json submissionData
    }

    UserXP {
        string id PK
        string userId FK UK
        int totalXP
        int currentLevel
        string levelTitle
        datetime updatedAt
    }

    XPTransaction {
        string id PK
        string userId FK
        int amount
        string reason
        string sourceType
        string sourceId
        datetime createdAt
    }

    Achievement {
        string id PK
        string code UK
        string name
        string description
        string iconIdentifier
        int xpReward
        json unlockCondition
        boolean isActive
    }

    UserAchievement {
        string id PK
        string userId FK
        string achievementId FK
        datetime unlockedAt
    }

    Challenge {
        string id PK
        string title
        string description
        ChallengeType challengeType
        int xpReward
        json criteria
        datetime startDate
        datetime endDate
        boolean isActive
    }

    ChallengeParticipation {
        string id PK
        string userId FK
        string challengeId FK
        boolean isCompleted
        datetime completedAt
        datetime joinedAt
    }

    TeacherMissionAssignment {
        string id PK
        string teacherId FK
        string studentId FK
        string missionId FK
        datetime assignedAt
        datetime dueDate
        string notes
    }

    MissionProgress {
        string id PK
        string userId FK
        string missionId FK
        MissionStatus status
        float progress
        datetime completedAt
        datetime createdAt
        datetime updatedAt
    }

    SimulationRun {
        string id PK
        string userId FK
        string villageId FK
        float initialStorage
        float finalStorage
        float rainfall
        float recharge
        float extraction
        float losses
        float sustainabilityScore
        datetime createdAt
    }

    GroundwaterRecord {
        string id PK
        string villageId FK
        string simulationRunId FK
        float storageIndex
        float recharge
        float extraction
        float waterQualityIndex
        datetime recordedAt
    }
```

---

## 3. Enumerations

### 3.1 `Role`
- `STUDENT`: Learner participating in simulations, missions, and analytics.
- `TEACHER`: Educator with scenario management, classroom assignment, and evaluation privileges.
- `ADMIN`: System administrator overseeing user access and global configurations.

### 3.2 `Difficulty`
- `BEGINNER`: Core conceptual exercises (e.g. soil percolation basics).
- `INTERMEDIATE`: Applied intervention challenges (e.g. check dam placement, runoff abatement).
- `ADVANCED`: Complex watershed governance (e.g. crop transitions, extraction quotas).

### 3.3 `MissionCategory`
- `GROUNDWATER`: Aquifer dynamics, Darcy flow, water tables, drawdown cones.
- `RAINWATER_HARVESTING`: Check dams, percolation tanks, rooftop catchment systems.
- `IRRIGATION`: Drip vs. flood irrigation, crop water demand, seasonal budgeting.
- `WATER_POLLUTION`: Agricultural runoff, fertilizer leaching, water quality indexes.
- `SUSTAINABLE_USAGE`: Village water budgeting, extraction quotas, collective governance.

### 3.4 `MissionStatus`
- `NOT_STARTED`
- `IN_PROGRESS`
- `COMPLETED`
- `FAILED`

---

## 4. Models & Detailed Field Specifications

### 4.1 `User` (`users`)
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `String` (UUID) | `@id @default(uuid())` | Primary unique identifier |
| `name` | `String` | Not Null | User full name |
| `email` | `String` | `@unique` | Login email address |
| `passwordHash` | `String` | Not Null | Bcrypt hashed password (10+ rounds) |
| `role` | `Role` | `@default(STUDENT)` | Access level |
| `createdAt` | `DateTime` | `@default(now())` | Timestamp of creation |
| `updatedAt` | `DateTime` | `@updatedAt` | Timestamp of last modification |

- **Indexes**: `[email]`, `[role]`
- **Relations**: `memberships`, `missionProgress`, `simulationRuns`

### 4.2 `Village` (`villages`)
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `String` (UUID) | `@id @default(uuid())` | Primary unique identifier |
| `name` | `String` | Not Null | Village name (e.g., "Rampur Watershed") |
| `description` | `String` (Text) | Not Null | Watershed background & hydro context |
| `region` | `String` | Not Null | Geopolitical & agro-climatic zone |
| `createdAt` | `DateTime` | `@default(now())` | Timestamp of creation |
| `updatedAt` | `DateTime` | `@updatedAt` | Timestamp of last modification |

- **Indexes**: `[region]`
- **Relations**: `memberships`, `simulationRuns`, `groundwaterRecords`

### 4.3 `VillageMembership` (`village_memberships`)
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `String` (UUID) | `@id @default(uuid())` | Primary unique identifier |
| `userId` | `String` | FK $\rightarrow$ `User.id` (Cascade) | Enrolled user |
| `villageId` | `String` | FK $\rightarrow$ `Village.id` (Cascade) | Enrolled village |
| `joinedAt` | `DateTime` | `@default(now())` | Enrollment date |

- **Constraints**: `@@unique([userId, villageId])` (Prevents duplicate enrollment)
- **Indexes**: `[userId]`, `[villageId]`

### 4.4 `Mission` (`missions`)
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `String` (UUID) | `@id @default(uuid())` | Primary unique identifier |
| `title` | `String` | Not Null | Educational quest title |
| `description` | `String` (Text) | Not Null | Objectives and pedagogical guidelines |
| `difficulty` | `Difficulty` | `@default(INTERMEDIATE)` | Task complexity |
| `category` | `MissionCategory`| Not Null | Core curriculum topic |
| `points` | `Int` | `@default(100)` | Gamification reward |
| `isActive` | `Boolean` | `@default(true)` | Availability toggle |
| `createdAt` | `DateTime` | `@default(now())` | Creation date |
| `updatedAt` | `DateTime` | `@updatedAt` | Modification date |

- **Indexes**: `[category]`, `[difficulty]`
- **Relations**: `progressRecords`

### 4.5 `MissionProgress` (`mission_progress`)
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `String` (UUID) | `@id @default(uuid())` | Primary unique identifier |
| `userId` | `String` | FK $\rightarrow$ `User.id` (Cascade) | Student tracking |
| `missionId` | `String` | FK $\rightarrow$ `Mission.id` (Cascade)| Associated mission |
| `status` | `MissionStatus`| `@default(IN_PROGRESS)` | Current completion stage |
| `progress` | `Float` | `@default(0.0)` | Completion percentage (0 - 100%) |
| `completedAt` | `DateTime` | Nullable | Timestamp of completion |
| `createdAt` | `DateTime` | `@default(now())` | Started timestamp |
| `updatedAt` | `DateTime` | `@updatedAt` | Last progress update |

- **Constraints**: `@@unique([userId, missionId])`
- **Indexes**: `[userId, status]`, `[missionId]`

### 4.6 `SimulationRun` (`simulation_runs`)
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `String` (UUID) | `@id @default(uuid())` | Unique gameplay session identifier |
| `userId` | `String` | FK $\rightarrow$ `User.id` (Cascade) | Player who initiated run |
| `villageId` | `String` | FK $\rightarrow$ `Village.id` (Cascade)| Simulated village context |
| `initialStorage` | `Float` | Not Null | Initial aquifer storage ($m^3$) |
| `finalStorage` | `Float` | Not Null | Final aquifer storage ($m^3$) |
| `rainfall` | `Float` | Not Null | Total simulated precipitation ($mm$) |
| `recharge` | `Float` | Not Null | Total simulated recharge ($m^3$) |
| `extraction` | `Float` | Not Null | Total simulated pumping ($m^3$) |
| `losses` | `Float` | Not Null | Evapotranspiration & baseflow losses ($m^3$) |
| `sustainabilityScore`| `Float`| Not Null | Score based on aquifer balance (0 - 100) |
| `createdAt` | `DateTime` | `@default(now())` | Simulation session timestamp |

- **Indexes**: `[userId]`, `[villageId]`, `[createdAt]`
- **Relations**: `user`, `village`, `groundwaterRecords`

### 4.7 `GroundwaterRecord` (`groundwater_records`)
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `String` (UUID) | `@id @default(uuid())` | Record identifier |
| `villageId` | `String` | FK $\rightarrow$ `Village.id` (Cascade) | Associated watershed |
| `simulationRunId` | `String` | Nullable, FK $\rightarrow$ `SimulationRun.id` | Optional run link |
| `storageIndex` | `Float` | Not Null | Aquifer saturation ratio (0.00 to 1.00) |
| `recharge` | `Float` | Not Null | Incremental tick recharge ($m^3$) |
| `extraction` | `Float` | Not Null | Incremental tick pumping ($m^3$) |
| `waterQualityIndex`| `Float` | Not Null | Water quality metric (0 - 100) |
| `recordedAt` | `DateTime` | `@default(now())` | Snapshot timestamp |

- **Indexes**: `[villageId, recordedAt]`, `[simulationRunId]`
- **Relations**: `village`, `simulationRun`

---

## 6. MongoDB Document Store Specification (Phase 4)

JalRakshak utilizes MongoDB with Mongoose for high-velocity, flexible, append-heavy document models. PostgreSQL remains the authoritative source of truth for all users, virtual villages, and academic curricula; MongoDB stores telemetry, event logs, and conversational history referencing PostgreSQL UUIDs as external strings without duplicating master records.

### 6.1 Data Segregation Matrix

| Data Domain | Storage Engine | Primary ORM/ODM | Rationale |
| :--- | :--- | :--- | :--- |
| Users, Roles, Passwords | **PostgreSQL** | Prisma | Strict ACID guarantees, unique constraints, transactional integrity |
| Villages, Geographies | **PostgreSQL** | Prisma | Relational master entity, strict cascade deletion for child structures |
| Missions, Curricula | **PostgreSQL** | Prisma | Structured pedagogical syllabus, fixed point values, progress foreign keys |
| Mission Progress | **PostgreSQL** | Prisma | Unique student-mission constraints, educational grading truth |
| Activity Logs | **MongoDB** | Mongoose | High-volume student interaction clicks, rapid append writes, flexible metadata |
| Simulation Event Logs | **MongoDB** | Mongoose | Continuous time-series simulation steps, drought triggers, intervention events |
| AI Mentor Conversations | **MongoDB** | Mongoose | Nested dynamic message arrays, variable token lengths, hydro context snapshots |
| Security Audit Logs | **MongoDB** | Mongoose | Append-only administrative and security audit trail with arbitrary metadata |

---

### 6.2 MongoDB Collections

#### 1. `activity_logs` (`ActivityLog`)
- **Collection**: `activity_logs`
- **Fields**:
  - `userId` (String, Indexed) $\rightarrow$ References PostgreSQL `User.id`
  - `villageId` (String, Indexed) $\rightarrow$ References PostgreSQL `Village.id`
  - `activityType` (String, Enum, Indexed): `LOGIN`, `LOGOUT`, `VIEW_VILLAGE`, `START_MISSION`, `COMPLETE_MISSION`, `APPLY_INTERVENTION`, `CHAT_WITH_MENTOR`, `EXPORT_DATA`, `UPDATE_SETTINGS`
  - `description` (String, Required, max 500 chars)
  - `metadata` (Mixed Object)
  - `timestamp` (Date, default `Date.now`, Indexed)
- **Compound Indexes**: `{ userId: 1, timestamp: -1 }`, `{ villageId: 1, timestamp: -1 }`, `{ activityType: 1, timestamp: -1 }`

#### 2. `simulation_logs` (`SimulationLog`)
- **Collection**: `simulation_logs`
- **Fields**:
  - `userId` (String, Indexed) $\rightarrow$ References PostgreSQL `User.id`
  - `villageId` (String, Indexed) $\rightarrow$ References PostgreSQL `Village.id`
  - `simulationRunId` (String, Indexed) $\rightarrow$ References PostgreSQL `SimulationRun.id`
  - `eventType` (String, Enum, Indexed): `TICK`, `INTERVENTION_ADDED`, `DROUGHT_TRIGGERED`, `RUNOFF_SPIKE`, `CRITICAL_DEPLETION`, `HARVEST_START`, `SEASONAL_RESET`
  - `rainfall` (Number, min 0)
  - `recharge` (Number, min 0)
  - `extraction` (Number, min 0)
  - `storageIndex` (Number, min 0.0, max 1.0)
  - `metadata` (Mixed Object)
  - `timestamp` (Date, default `Date.now`, Indexed)
- **Compound Indexes**: `{ simulationRunId: 1, timestamp: -1 }`, `{ villageId: 1, timestamp: -1 }`, `{ eventType: 1, timestamp: -1 }`

#### 3. `conversations` (`Conversation`)
- **Collection**: `conversations`
- **Fields**:
  - `userId` (String, Indexed) $\rightarrow$ References PostgreSQL `User.id`
  - `sessionId` (String, Unique, Indexed)
  - `villageId` (String, Optional, Indexed)
  - `topic` (String)
  - `messages` (Array of Subdocuments):
    - `role` (String, Enum: `user`, `assistant`, `system`)
    - `content` (String, Required)
    - `hydroContext` (Mixed Object, current water table snapshot)
    - `timestamp` (Date, default `Date.now`)
  - `metadata` (Mixed Object)
- **Indexes**: `{ userId: 1, updatedAt: -1 }`, `{ sessionId: 1 }`

#### 4. `audit_logs` (`AuditLog`)
- **Collection**: `audit_logs`
- **Fields**:
  - `actorId` (String, Indexed) $\rightarrow$ References PostgreSQL `User.id`
  - `action` (String, Required, Indexed)
  - `resource` (String, Required, Indexed)
  - `resourceId` (String, Optional, Indexed)
  - `metadata` (Mixed Object)
  - `timestamp` (Date, default `Date.now`, Indexed)
- **Compound Indexes**: `{ resource: 1, resourceId: 1 }`, `{ actorId: 1, timestamp: -1 }`

---

## 7. Setup & Operational Commands

All commands are run from the `backend/` directory:

```powershell
# 1. Validate Prisma schema syntax
npx prisma validate

# 2. Generate Prisma Client (runs automatically on install)
npm run prisma:generate

# 3. Create and apply migrations against PostgreSQL
npm run prisma:migrate

# 4. Seed development data (demo village, missions, users)
npm run prisma:seed

# 5. Verify database connection and record counts
npm run db:verify

# 6. Open Prisma Studio graphical inspection GUI
npm run prisma:studio
```
