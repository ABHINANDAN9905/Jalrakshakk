# JalRakshak Socket.IO Real-Time Architecture & Event Contracts

## 1. Overview
JalRakshak utilizes an authenticated **Socket.IO** server (`backend/src/config/socket.js`) to provide real-time event dissemination across students, classrooms, and village communities.

Clients cannot authoritatively inject or modify simulation results through socket emissions; the backend remains the sole authority.

---

## 2. Authentication & Handshake
Socket connections require a valid JWT Access Token passed via:
- `socket.handshake.auth.token`
- `socket.handshake.headers.authorization` (`Bearer <token>`)
- `socket.handshake.query.token`

Connections without a valid token are rejected immediately during the handshake middleware:
```js
io.use((socket, next) => {
  const token = socket.handshake.auth?.token || ...;
  const decoded = verifyAccessToken(token);
  socket.user = { id: decoded.id, email: decoded.email, role: decoded.role };
  next();
});
```

---

## 3. Scoped Rooms & Privacy Governance
Upon connection, sockets automatically join:
- `simulation:<userId>`: Private channel for individual student simulation lifecycle events.
- `village:<villageId>`: Shared channel for village-wide environmental updates. Observers only receive aggregated, non-sensitive hydrogeological updates.

---

## 4. Event Contracts

### Client to Server Events

| Event Name | Payload | Description |
|---|---|---|
| `ping` | `{}` | Heartbeat request; server responds with `pong`. |
| `simulation:subscribe` | `{}` | Re-joins private student simulation room. |
| `simulation:unsubscribe` | `{}` | Leaves private student simulation room. |
| `village:subscribe` | `{ villageId: string }` | Joins village broadcast room to observe groundwater updates. |
| `village:unsubscribe` | `{ villageId: string }` | Unsubscribes from village broadcast room. |

---

### Server to Client Events

| Event Name | Scope | Payload Example | Purpose |
|---|---|---|---|
| `simulation:started` | `simulation:<userId>` | `{"timestamp": "...", "userId": "...", "villageId": "..."}` | Informs client that simulation execution has started. |
| `simulation:completed` | `simulation:<userId>` | `{"simulationId": "...", "waterBalance": {...}, "waterQuality": {...}, "sustainability": {...}}` | Full authoritative simulation output sent to the executing student. |
| `simulation:failed` | `simulation:<userId>` | `{"error": "...", "code": "SIMULATION_ERROR"}` | Emitted when simulation calculation or parameters fail. |
| `village:state:updated` | `village:<villageId>` | `{"villageId": "...", "storagePercentage": 72.4, "conditionCategory": "OPTIMAL", "sustainabilityScore": 88}` | Broadcast to all users watching the village. Excludes private student information. |
| `groundwater:updated` | `village:<villageId>` | `{"villageId": "...", "storagePercentage": 72.4, "depthToWaterTableMeters": 13.3}` | Lightweight telemetry broadcast for 3D visual sync. |
| `leaderboard:updated` | Global broadcast | `{"timestamp": "...", "data": [...]}` | Notifies users when student XP changes state ranking. |

---

## 5. Offline & Disconnection Resilience
If Socket.IO connection drops:
1. The frontend client automatically flags `isSocketConnected: false` and switches to REST fallback mode.
2. The Top HUD displays `REST Mode` in amber.
3. Upon reconnection, the client automatically re-subscribes to the active `villageId` room.
