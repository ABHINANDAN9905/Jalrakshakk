# JalRakshak – Notification System Architecture (Phase 15)

## 1. Overview & Core Philosophy

The JalRakshak Central Notification System delivers contextual, non-intrusive, and secure informational alerts across all three primary platform roles: **STUDENT**, **TEACHER**, and **ADMIN**.

### Fundamental Rules & Constraints
1. **Zero Gamification Mutation (Anti-Gaming Protection)**:
   - Notifications **NEVER** award XP, modify levels, or unlock achievements.
   - Notifications are strictly **read-only informational events** triggered reactively when authoritative backend services (Progression, Missions, Achievements) complete an operation.
2. **Strict Recipient Ownership & Data Isolation**:
   - A user can only fetch, mark as read, or delete notifications where `userId === req.user.id`.
   - Cross-user tampering is rejected with HTTP 403 / 404.
3. **No False Delivery Claims**:
   - JalRakshak operates on in-app notifications and authenticated WebSocket events.
   - Out-of-band delivery channels (SMS, email, mobile push) are deliberately disabled and not claimed as active unless external SMTP/SMS gateways are configured.

---

## 2. Notification Categories

The system supports 12 standardized event categories:

| Category | Typical Recipient | Description | Action URL Example |
| :--- | :--- | :--- | :--- |
| `MISSION_ASSIGNED` | STUDENT | Teacher assigned an educational mission | `/missions` |
| `MISSION_COMPLETED` | STUDENT | Authoritative completion verified | `/missions` |
| `XP_EARNED` | STUDENT | XP received from simulation or task | `/achievements` |
| `LEVEL_UNLOCKED` | STUDENT | Progression tier advancement | `/achievements` |
| `ACHIEVEMENT_UNLOCKED` | STUDENT | Badge or milestone unlocked | `/achievements` |
| `CHALLENGE_STARTED` | STUDENT | Time-bound community event opened | `/challenges` |
| `CHALLENGE_ENDING_SOON` | STUDENT | Deadline alert for active event | `/challenges` |
| `TEACHER_ANNOUNCEMENT` | STUDENT | Direct broadcast from assigned teacher | `/notifications` |
| `ASSIGNMENT_DEADLINE_APPROACHING` | STUDENT | Mission deadline approaching | `/missions` |
| `ASSIGNMENT_OVERDUE` | STUDENT | Mission passed designated due date | `/missions` |
| `STUDENT_PROGRESS_UPDATE` | TEACHER | Supervised student completed mission/tier | `/teacher/students/:id` |
| `PLATFORM_ANNOUNCEMENT` | ALL | Administrative system-wide announcement | `/notifications` |

---

## 3. Deduplication & Idempotency

To prevent event flooding and redundant alerts (e.g., repeatedly opening a page or re-evaluating milestones):
- Notifications accept an optional **`dedupKey`** (e.g., `MISSION_ASSIGNED:assign-123`, `ACHIEVEMENT:user-456:BADGE_RAIN`).
- If a notification with the same `dedupKey` and `recipientId` exists within a deduplication window (default 24 hours), the duplicate insert is gracefully skipped, returning the existing notification record without re-emitting socket bursts.

---

## 4. Dual Database Architecture & In-Memory Offline Resilience

- **Authoritative Relational Core**:
  - `User`, `Village`, `Mission`, `TeacherStudentAssignment`, and `UserProgression` reside in **PostgreSQL** via Prisma ORM.
- **Notification & Event Store**:
  - `Notification`, `Announcement`, and `NotificationPreference` collections reside in **MongoDB** via Mongoose for rapid appending, indexing, and TTL archival.
- **Graceful Offline Degradation**:
  - If MongoDB is unavailable during local development or network failure, `notification.service.js` automatically activates an in-memory storage fallback.
  - Offline records explicitly tag `isPersisted: false` and `persistenceStatus: 'IN_MEMORY_OFFLINE'` to maintain complete truthfulness regarding system state.

---

## 5. REST API Specifications

Base URL: `/api/v1/notifications`

### Endpoints
- `GET /` — List authenticated user's notifications. Supports pagination (`page`, `limit`), filtering by `isRead` (true/false), and `category`.
- `GET /unread-count` — Retrieve `{ unreadCount: number }`.
- `PATCH /:id/read` — Mark a single notification as read (with recipient ownership validation).
- `PATCH /read-all` — Mark all unread notifications as read for current user.
- `DELETE /:id` — Soft or hard delete notification (with recipient ownership validation).
- `GET /preferences` — Retrieve user category delivery preferences.
- `PUT /preferences` — Update preferences (toggling specific categories on/off).

### Teacher & Admin Announcement Endpoints
- `POST /announcements/teacher` — Broadcast to supervised students (TEACHER role only).
- `GET /announcements/teacher` — List announcements authored by calling teacher.
- `PATCH /announcements/teacher/:id/deactivate` — Deactivate teacher announcement.
- `POST /announcements/admin` — Broadcast to `STUDENT`, `TEACHER`, or `ALL` (ADMIN role only).
- `GET /announcements/admin` — List platform-wide broadcasts.
- `PATCH /announcements/admin/:id/deactivate` — Deactivate admin announcement.
