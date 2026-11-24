# JalRakshak — Phase 13: Admin Security & Governance Specification

## 1. Threat Model & Security Posture

Administrative systems are the most critical target in any enterprise or educational SaaS platform. JalRakshak enforces Defense-in-Depth principles across all administrative capabilities:

```
[ Inbound Request ]
       |
       +---> [ 1. Rate Limiting Middleware (DDoS & Brute Force Prevention) ]
       |
       +---> [ 2. JWT Verification (Signature, Expiry, Revocation Check) ]
       |
       +---> [ 3. RBAC Enforcement (Requires role: 'ADMIN') ]
       |
       +---> [ 4. Input Sanitization & Zod Schema Validation ]
       |
       +---> [ 5. Business Logic Security Guards (Sole-Admin Protection) ]
       |
       +---> [ 6. Immutable Security Audit Logging (MongoDB append-only) ]
       |
       +---> [ 7. Output Sanitization (Credentials & Secrets Redacted) ]
```

---

## 2. Core Security Controls

### A. Role-Based Access Control (RBAC)
- All `/api/v1/admin/*` endpoints invoke `authenticate` and `authorize('ADMIN')`.
- Non-admin users (`STUDENT`, `TEACHER`) are rejected at the gateway with `403 Forbidden`.
- Token forgery or expiration triggers immediate `401 Unauthorized`.

### B. Sole-Administrator Protection Policy
To prevent permanent administrator lockout:
1. **Deactivation Protection**: An administrator cannot deactivate their own or another admin's account if that would result in 0 active administrators remaining in the system.
2. **Demotion Protection**: An administrator cannot change the role of an admin account to `STUDENT` or `TEACHER` if that would leave 0 active administrators in the system.
3. **HTTP Status**: Violations throw a `400 Bad Request` with an explicit security rationale:
   `"Action blocked: Cannot deactivate/demote the last remaining active administrator account."`

### C. Zero Credential & Secret Exposure Policy
Administrative responses strictly enforce the principle of least privilege regarding data disclosure:
- **No Password Hashes**: `passwordHash` is excluded from all user query projections.
- **No Session Tokens**: Active refresh tokens and hashes are never returned in administrative lists.
- **No Connection Strings**: `/api/v1/admin/system-health` probes database connectivity via ping queries (`SELECT 1`), never returning database URLs, ports, credentials, or internal IPs.
- **No Private Keys**: LLM integration status is reported as `CONFIGURED` or `NOT_CONFIGURED`, never revealing the actual `OPENAI_API_KEY` string.

### D. Immutable Security Audit Logging
- Critical security and administrative operations trigger an asynchronous write to MongoDB collection `audit_logs`:
  - `USER_ROLE_CHANGED`
  - `USER_ACTIVATED`
  - `USER_DEACTIVATED`
  - `VILLAGE_CREATED`
  - `VILLAGE_UPDATED`
  - `MISSION_CREATED`
  - `MISSION_UPDATED`
  - `CHALLENGE_CREATED`
  - `CHALLENGE_UPDATED`
- Audit records store the actor ID, action type, resource type, target ID, metadata snapshot, and verified timestamp.
- Audit records cannot be modified or deleted via administrative API endpoints.

---

## 3. Vulnerability Mitigation Matrix

| Potential Threat | Severity | JalRakshak Defense Mechanism |
|---|---|---|
| **Horizontal Privilege Escalation** | Critical | Strict RBAC middleware rejecting non-ADMIN tokens with 403. |
| **Accidental Platform Lockout** | High | Sole-admin count check in `AdminService.updateUserStatus` and `updateUserRole`. |
| **Data Leakage via API Responses** | High | Explicit Prisma `select` blocks omitting `passwordHash` and `refreshTokens`. |
| **Input Manipulation / Injection** | High | Strict Zod validation schemas enforcing enums, date boundaries, and data types. |
| **Credential Harvesting via Logs** | Medium | Audit metadata logging sanitizes payloads to strip passwords and tokens. |
