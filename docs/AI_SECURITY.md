# JalRakshak AI Safety, Security & Governance

## 1. Zero-Trust Context Sanitation
The AI Water Mentor receives only strictly scoped, sanitized hydrogeological data:
- Village name, region, and state.
- Saturated aquifer storage percentage and category.
- Rainfall depth (mm), recharge volume (m³), and extracted draft (m³).
- Simulated Water Quality Index and sustainability score.

### Strictly Excluded Fields:
- User passwords, bcrypt hashes, and security salt values.
- JWT Access and Refresh Tokens.
- Private student identification or classroom grade records.
- Database connection strings and server secrets.

---

## 2. Prompt Injection & Jailbreak Defense
- All student inputs are processed as untrusted text within the `user` role array, never interpolated into the `system` prompt.
- The system prompt explicitly commands the model to reject attempts to override its science teacher identity, generate executable code, bypass educational topics, or disclose internal instructions.
- If an input attempts an adversarial jailbreak, the mentor guides the student back to groundwater science.

---

## 3. Scientific Integrity & Disclaimers
1. **Simulated vs. Real-World Distinction**:
   Every response reminds the student that calculations represent a simulated model designed for learning and water budgeting.
2. **Water Quality Certification Disclaimer**:
   The simulated Water Quality Index (WQI) is explicitly labeled as an educational indicator. The mentor never claims water is certified potable or safe for human consumption without certified laboratory testing.
3. **Authoritative Execution Boundary**:
   The AI Mentor cannot directly mutate or execute simulation runs on the database. Recommendations remain advisory; the student must adjust parameters and submit runs through the validated game UI.

---

## 4. Conversation Ownership & Persistence
- Conversations are stored in the MongoDB `Conversation` collection indexed by `sessionId` and `userId`.
- Strict ownership checks prevent students from inspecting or deleting other students' chat transcripts (`HTTP 403 Forbidden`).
- Messages are capped to the 6 most recent conversational turns to prevent unbounded token expansion and maintain low latency.
