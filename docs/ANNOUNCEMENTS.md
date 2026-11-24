# JalRakshak – Teacher & Admin Announcement Guide

## 1. Architectural Scope & Privacy

The Announcement subsystem enables structured educational and administrative broadcasting without compromising student data boundaries.

### Role Capabilities & Authorization Rules

1. **Teacher Announcements**:
   - **Allowed Author**: Users with role `TEACHER`.
   - **Target Audience**: Only students who are actively assigned to that teacher in PostgreSQL via `TeacherStudentAssignment`.
   - **Authorization Enforcement**:
     - When a teacher targets specific students (`targetStudentIds`), the backend strictly queries `teacherStudentAssignment.findMany` to verify that every specified student is supervised by the caller.
     - Unauthorized student IDs are stripped and rejected before creation.
     - If the teacher broadcasts to "All My Students", the recipient list is dynamically resolved exclusively to that teacher's supervised cohort.
2. **Admin Announcements**:
   - **Allowed Author**: Users with role `ADMIN`.
   - **Target Audience**: `STUDENT`, `TEACHER`, or `ALL`.
   - **Delivery Channels**: Emitted to the corresponding Socket.IO room (`role:${targetRole}` or `role:ALL`) and persisted as unread notifications for each target recipient.

---

## 2. Announcement Lifecycle

1. **Drafting & Publishing**:
   - Validated for non-empty title (min 3 chars) and message (min 5 chars).
   - Stored in MongoDB `Announcement` collection with `isActive: true`.
2. **Delivery & Fan-Out**:
   - Notifications created for each recipient with category `TEACHER_ANNOUNCEMENT` or `PLATFORM_ANNOUNCEMENT`.
   - `deliveryCount` recorded on the announcement document.
3. **Deactivation**:
   - Authors (or platform admins) can deactivate announcements at any time (`PATCH /announcements/{teacher|admin}/:id/deactivate`).
   - Deactivated announcements remain in audit logs but are hidden from active broadcast banners.
