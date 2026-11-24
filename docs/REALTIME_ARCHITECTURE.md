# JalRakshak – Real-Time Notification & Communication Architecture

## 1. Socket.IO Infrastructure

JalRakshak features an authenticated, low-latency Socket.IO communication layer that connects the Node.js backend with the React frontend.

### Authentication & Room Organization
1. **JWT Verification on Handshake**:
   - Every client connection authenticates via `socket.handshake.auth.token`.
   - The token is verified using `JWT_SECRET`. Sockets without valid credentials or expired tokens are rejected.
2. **Deterministic Room Membership**:
   - Identity is derived strictly from the verified JWT payload (`req.user.id`, `req.user.role`).
   - Rooms joined automatically upon connection:
     - `user:${userId}` — Private channel for personal notifications, XP gains, level milestones, and direct assignments.
     - `role:${role}` — Role broadcast channel (e.g., `role:STUDENT`, `role:TEACHER`, `role:ADMIN`).
     - `role:ALL` — Global broadcast channel for platform-wide alerts.
   - Sockets cannot join arbitrary user rooms, preventing cross-user eavesdropping.

---

## 2. Event Specification

### Outbound Events (Server → Client)

| Event Name | Room Target | Payload | Trigger Condition |
| :--- | :--- | :--- | :--- |
| `notification:new` | `user:${userId}` | Full Notification Object | Authoritative backend event created for recipient |
| `notification:unread_count` | `user:${userId}` | `{ unreadCount: number }` | Notification read, created, or deleted |
| `notification:read` | `user:${userId}` | `{ id: string }` | Notification marked as read from another session |
| `announcement:new` | `role:${role}` / `role:ALL` | Full Announcement Object | Teacher or Admin broadcast published |

### Inbound Events (Client → Server)
- Handled via standard REST API endpoints with Socket.IO emitting the resulting state update back to active rooms.

---

## 3. Event-Driven Architecture (`notificationEventBus`)

To maintain clean separation of concerns and avoid tight coupling between business logic and notification transport:
- A central `EventEmitter` (`notificationEventBus.js`) receives events from authoritative domains:
  - `TEACHER_ASSIGNMENT:CREATED` → triggers `MISSION_ASSIGNED` notification & socket sync.
  - `MISSION:COMPLETED` → triggers `MISSION_COMPLETED` notification.
  - `PROGRESSION:XP_EARNED` → triggers `XP_EARNED` notification.
  - `PROGRESSION:LEVEL_UP` → triggers `LEVEL_UNLOCKED` notification.
  - `ACHIEVEMENT:UNLOCKED` → triggers `ACHIEVEMENT_UNLOCKED` notification.
- Event handlers are asynchronous and fail-safe: failures in notification logging never roll back database transactions or impede gameplay.
