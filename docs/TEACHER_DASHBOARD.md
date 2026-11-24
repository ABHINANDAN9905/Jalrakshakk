# JalRakshak — Phase 12: Teacher Dashboard & Classroom Management Architecture

## 1. Overview

The **Teacher Dashboard & Classroom Management System** provides educators with a comprehensive supervisory cockpit to oversee student progress, assign pedagogical missions, analyze classroom-wide hydrological competencies, and generate institutional compliance reports.

The educator portal is designed with a nature-inspired EdTech design palette (forest emerald, ocean teal, and dark slate), focusing on clarity, actionable metrics, and student data privacy.

---

## 2. Core Architecture & Security Model

```
+-----------------------------------------------------------------------------------+
|                              TEACHER PORTAL FRONTEND                              |
|                                                                                   |
|  +--------------------+  +--------------------+  +-----------------------------+  |
|  | Classroom Overview |  |  Supervised Roster |  |   Mission Assignments Hub   |  |
|  | (/teacher/dashboard|  | (/teacher/students)|  |   (/teacher/assignments)    |  |
|  +--------------------+  +--------------------+  +-----------------------------+  |
|  +--------------------+  +--------------------+  +-----------------------------+  |
|  | Classroom Analytics|  |  Student Portfolio |  |     Reports & CSV Export    |  |
|  | (/teacher/analytics|  | (/teacher/students/|  |      (/teacher/reports)     |  |
|  |    via Recharts)   |  |     :studentId)    |  |    (Streaming CSV / Print)  |  |
|  +--------------------+  +--------------------+  +-----------------------------+  |
+-----------------------------------------------------------------------------------+
                                          |
                              HTTP / Bearer JWT (RBAC)
                                          v
+-----------------------------------------------------------------------------------+
|                               BACKEND API ENGINE                                  |
|                                                                                   |
|  Teacher Routes: /api/v1/teacher/* & /api/v1/teachers/*                           |
|  Middleware: authenticate -> authorize('TEACHER', 'ADMIN')                        |
|                                                                                   |
|  Authorization Guard: TeacherAssignmentService.verifySupervision(teacherId, studentId)
|  * Strict prevention of horizontal privilege escalation (cross-teacher access)    |
|  * Prevents unauthorized querying of other classes' student portfolios or records |
|                                                                                   |
|  Data Sources:                                                                    |
|  - PostgreSQL via Prisma (TeacherStudentAssignment, TeacherMissionAssignment)     |
|  - MongoDB via Mongoose (Simulations, Event Logs, AI Mentorship telemetry)        |
+-----------------------------------------------------------------------------------+
```

### Authorization Rules & Data Governance:
1. **Teacher & Admin Role Requirement**:
   - Only users with role `TEACHER` or `ADMIN` can access `/api/v1/teacher/*`.
   - `STUDENT` users attempting access are blocked immediately with `403 Forbidden`.
2. **Supervision Boundary (`TeacherStudentAssignment`)**:
   - Teachers can only inspect profiles, assign missions to, or export data for students formally assigned to them in `TeacherStudentAssignment`.
   - Attempting to inspect or assign to a non-supervised student results in an immediate `403 Forbidden` response.
3. **Audit & Compliance Isolation**:
   - Reports and CSV exports strictly aggregate data from the requesting teacher's supervised cohort.

---

## 3. Educator Pages & Components

### A. Classroom Overview (`/teacher/dashboard`)
- **Key Metrics (KPI Cards)**:
  - Total Supervised Students & Active Ratio.
  - Active & Completed Assignments.
  - Classroom Mission Completion Rate (%).
  - Average Classroom Student XP.
- **Attention Alerts Box**:
  - Highlights students with overdue assignments or low activity needing intervention.
- **Classroom Live Feed**:
  - Real-time audit log of student milestone completions, badge unlocks, and simulation submissions.
- **Quick Actions**:
  - Direct shortcuts to create single/bulk assignments, view roster, or export CSV report.

### B. Supervised Students Roster (`/teacher/students`)
- **Interactive Search & Filtering**:
  - Real-time search by student name or email.
  - Filter by Level rank (Level 1, Level 2, Level 3+).
  - Filter by activity status (Active, Inactive, All).
- **Roster Table**:
  - Student initials avatar, full name, email.
  - Level badge (e.g. Level 3 Aquifer Protector).
  - Total XP earned.
  - Completed missions and achievements counters.
  - Live activity status indicator (pulse badge).
  - "Inspect Progress" action link leading to individual portfolio.

### C. Individual Student Portfolio (`/teacher/students/:studentId`)
- **Student Profile Card**:
  - Rank badge, total XP, email, level progression percentage gauge.
- **Pedagogical Diagnosis**:
  - **Learning Strengths**: Specific groundwater competencies where the student excels (e.g., micro-irrigation optimization, non-point source pollution mitigation).
  - **Targeted Improvement Areas**: Hydrological concepts requiring additional guidance (e.g., peak runoff capture, drought drawdown resilience).
- **Missions & Quests Breakdown**:
  - Status indicators (Completed, In Progress), scores, and completion timestamps.
- **Achievements Collection**:
  - Unlocked badges with descriptions, XP rewards, and unlock dates.
- **XP Progression Timeline**:
  - Audit trail of XP rewards and learning sources.
- **Action Buttons**:
  - "Print Student Report" (`window.print()`).
  - "Assign Targeted Mission" shortcut.

### D. Mission & Quest Assignments Cockpit (`/teacher/assignments`)
- **Flexible Assignment Scope**:
  - **Single Student Mode**: Select an individual student from the supervised cohort.
  - **Bulk Mode**: Deploy missions across all supervised students or a custom multi-selection.
- **Curriculum Mission Selector**:
  - Pre-populated with curriculum missions (Foundations of Groundwater Balance, Monsoon Runoff & Rainwater Harvesting, Precision Micro-Irrigation, Contamination Defense, Drought Resilience).
- **Target Due Date Picker**:
  - Optional deadline for student accountability.
- **Teacher Guidance Notes**:
  - Form field to provide instructions, scientific focus points, or hints.
- **Active Assignments Ledger**:
  - Real-time table of dispatched assignments, due dates, statuses (`PENDING`, `IN_PROGRESS`, `COMPLETED`, `OVERDUE`), and teacher notes.

### E. Classroom Hydrological Analytics (`/teacher/analytics`)
Powered by `recharts`:
1. **Student Level Distribution**: Bar chart showing student counts across all 6 progression levels.
2. **Weekly Hydrological Activity**: Dual area chart plotting village simulations run vs tasks completed across the last 7 days.
3. **Curriculum Category Performance (%)**: Horizontal bar chart comparing classroom completion rates across Groundwater Conservation, Rainwater Harvesting, Sustainable Agriculture, Water Quality, and Drought Management.
4. **Difficulty Mastery Breakdown**: Visual progress meters comparing Beginner, Intermediate, and Advanced mission success rates.
5. **Pending & Overdue Attention List**: Actionable table showing overdue missions with direct links to follow up.

### F. Reports & CSV Export (`/teacher/reports`)
- **Interactive Printable Report Canvas**:
  - Certified institutional header (`जल रक्षक • JALRAKSHAK EDTECH PLATFORM`).
  - Summary KPI cards.
  - Complete student performance breakdown table.
- **Export Options**:
  - **Download CSV Audit**: Initiates direct browser download of `jalrakshak_classroom_report_<date>.csv` with authoritative student metrics.
  - **Export JSON**: Retrieves structured JSON telemetry.
  - **Print Report**: Formatted print preview with clean monochrome typography (`@media print`).

---

## 4. API Endpoints Reference

| Method | Endpoint | Description | Roles |
|---|---|---|---|
| `GET` | `/api/v1/teacher/dashboard` | Dashboard overview KPIs, alerts & activity feed | `TEACHER`, `ADMIN` |
| `GET` | `/api/v1/teacher/analytics` | Recharts classroom metrics & distributions | `TEACHER`, `ADMIN` |
| `GET` | `/api/v1/teacher/notifications` | Pedagogical notifications feed | `TEACHER`, `ADMIN` |
| `POST` | `/api/v1/teacher/missions/assign` | Assign mission to single student | `TEACHER`, `ADMIN` |
| `POST` | `/api/v1/teacher/missions/assign-bulk` | Bulk assign mission to students/class | `TEACHER`, `ADMIN` |
| `GET` | `/api/v1/teacher/missions/assignments` | List all assignments created by teacher | `TEACHER`, `ADMIN` |
| `GET` | `/api/v1/teacher/students/:studentId/progress` | Student progress metrics report | `TEACHER`, `ADMIN` |
| `GET` | `/api/v1/teacher/students/:studentId/detail` | Detailed portfolio with pedagogical diagnosis | `TEACHER`, `ADMIN` |
| `GET` | `/api/v1/teacher/reports/export` | Export classroom report as CSV or JSON | `TEACHER`, `ADMIN` |
| `GET` | `/api/v1/teachers/my-students` | List authorized supervised students | `TEACHER`, `ADMIN` |
