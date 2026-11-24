# JalRakshak API Architecture & Protocol Specification

## 1. API Architecture Overview

The JalRakshak API employs a dual communication paradigm:
1. **RESTful HTTP API (`/api/v1`)**: Handles CRUD operations, state persistence, authentication, mission assignments, and historical analytics querying.
2. **WebSocket Gateway (Socket.IO `/simulation`)**: Powers low-latency, real-time bidirectional state streaming between the discrete hydrological simulation engine and the 3D client.

---

## 2. Standardized HTTP Response Envelope

All REST endpoints adhere to a uniform JSON response structure:

### 2.1 Success Response (`HTTP 200 / 201`)
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Resource retrieved successfully",
  "data": {
    "id": "v-101",
    "name": "Rampur Watershed"
  },
  "meta": {
    "timestamp": "2026-11-22T01:00:00.000Z",
    "version": "v1"
  }
}
```

### 2.2 Error Response (`HTTP 400 / 401 / 403 / 404 / 500`)
```json
{
  "success": false,
  "statusCode": 403,
  "message": "Forbidden: You do not possess the required RBAC role",
  "error": {
    "code": "INSUFFICIENT_PERMISSIONS",
    "details": "Requires TEACHER or ADMIN role"
  },
  "meta": {
    "timestamp": "2026-11-22T01:00:00.000Z"
  }
}
```

---

## 3. REST API Endpoint Catalog

All routes are prefixed with `/api/v1`.

### 3.1 Authentication & Profile (`/auth`)
| Method | Endpoint | Role | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/auth/register` | Public | Register new user account (defaults to `STUDENT`) |
| `POST` | `/auth/login` | Public | Authenticate credentials and receive signed JWT |
| `GET` | `/auth/me` | Authenticated | Fetch authenticated user profile & permissions |
| `POST` | `/auth/refresh-token` | Authenticated | Renew expired access token |
| `POST` | `/auth/logout` | Authenticated | Invalidate active session/cookie |

### 3.2 Village & Watershed Management (`/villages`)
| Method | Endpoint | Role | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/villages` | Authenticated | List all accessible village simulations |
| `POST` | `/villages` | `TEACHER`, `ADMIN` | Create new village scenario profile |
| `GET` | `/villages/:id` | Authenticated | Get detailed village data, soil profile & water levels |
| `PUT` | `/villages/:id` | `TEACHER`, `ADMIN` | Update village geographical and meteorological factors |
| `DELETE`| `/villages/:id` | `ADMIN` | Remove village scenario |
| `GET` | `/villages/:id/infrastructure` | Authenticated | List all physical structures (wells, check dams) |
| `POST` | `/villages/:id/infrastructure` | Authenticated | Add new conservation structure or borewell |

### 3.3 Hydrological Analytics & Reporting (`/analytics`)
| Method | Endpoint | Role | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/analytics/village/:id/trends` | Authenticated | Historical time-series of water table depth |
| `GET` | `/analytics/village/:id/water-balance` | Authenticated | Aggregate calculation of Rainfall vs Extraction |
| `GET` | `/analytics/village/:id/audit-report` | Authenticated | Comprehensive water safety score (CGWB scale) |

### 3.4 Missions & Gamification (`/missions`)
| Method | Endpoint | Role | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/missions` | Authenticated | List available conservation missions |
| `GET` | `/missions/:id` | Authenticated | Get mission objectives, target metrics, constraints |
| `POST` | `/missions/:id/start` | `STUDENT` | Initialize student progress tracking for mission |
| `POST` | `/missions/:id/submit` | `STUDENT` | Evaluate final simulation state against criteria |
| `GET` | `/missions/leaderboard` | Authenticated | Global and classroom ranking of top conservationists |

### 3.5 AI Water Mentor (`/ai-mentor`)
| Method | Endpoint | Role | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/ai-mentor/chat` | Authenticated | Send message to AI Mentor with village context |
| `GET` | `/ai-mentor/session/:villageId`| Authenticated | Retrieve previous conversational history |
| `POST` | `/ai-mentor/recommend-interventions`| Authenticated | Request AI diagnosis on critical water table deficit |

---

## 4. Real-Time Protocol Specification (Socket.IO)

- **Namespace**: `/simulation`
- **Room Strategy**: `village:<villageId>` (Clients join room upon opening 3D viewport)

### 4.1 Client-to-Server Events
| Event Name | Payload Structure | Description |
| :--- | :--- | :--- |
| `simulation:join` | `{ "villageId": "string" }` | Subscribe to village real-time room |
| `simulation:leave`| `{ "villageId": "string" }` | Unsubscribe from village updates |
| `simulation:control` | `{ "villageId": "string", "action": "START" \| "PAUSE" \| "RESET" \| "STEP" }` | Controls simulation clock |
| `simulation:apply_intervention` | `{ "villageId": "string", "type": "CHECK_DAM", "x": 12.5, "z": -4.2, "capacityM3": 2500 }` | Dynamically deploys structure |

### 4.2 Server-to-Client Broadcast Events
| Event Name | Frequency | Payload Content | Description |
| :--- | :--- | :--- | :--- |
| `simulation:tick` | Every simulation step | `{ "tick": 45, "waterTableDepthM": 14.2, "netRechargeM3": 120.5, "rainfallMm": 15.0, "stressLevel": "MODERATE" }` | Main synchronization heartbeat |
| `simulation:alert` | Event-driven | `{ "severity": "CRITICAL", "message": "Borewell cone of depression intersecting community well!" }` | Hydrological warning |
| `simulation:mission_event`| Event-driven | `{ "missionId": "m-1", "status": "COMPLETED", "score": 95 }` | Mission goal achieved |

---

## 5. Security & Rate-Limiting Policy

1. **Authentication Token**: Transmitted via HTTP Header: `Authorization: Bearer <JWT>` or socket handshake authentication object (`socket.handshake.auth.token`).
2. **Rate Limits**:
   - Standard API: 100 requests per 15 minutes per IP.
   - AI Mentor Chat: 15 queries per 10 minutes per authenticated user.
   - Socket Controls: Maximum 5 state change signals per second.
