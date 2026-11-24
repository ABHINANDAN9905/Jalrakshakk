# JalRakshak AI Water Mentor

## 1. Overview
The **JalRakshak AI Water Mentor** is a specialized conversational science teaching agent designed to guide students through the complex hydrogeological concepts embedded within the JalRakshak game.

It operates as an encouraging, patient science educator, explaining aquifer balance, rainfall percolation, irrigation efficiency, and watershed conservation using the student's actual simulation data.

---

## 2. Architectural Design

```
Frontend (WaterMentorPage.tsx / WaterMentorChat.tsx)
                      │
           (Axios REST / Bearer JWT)
                      ▼
Backend Controller (aiMentor.controller.js)
                      │
           (aiMentor.context.js)
      ┌───────────────┴───────────────┐
      ▼                               ▼
PostgreSQL / Prisma              MongoDB Mongoose
(Latest Simulation Run)         (Conversation History)
                      │
            (aiMentor.service.js)
                      │
          Has Valid OPENAI_API_KEY?
           ├── Yes ──> OpenAI API (GPT-4o-mini)
           └── No  ──> Deterministic Educational Science Engine
                      │
                      ▼
Return Hydro-grounded Response + Interactive Game Actions
```

---

## 3. Core Capabilities

### A. Science Inquiries
Students can ask free-form conceptual questions:
- *"What is groundwater recharge?"*
- *"Why are shallow open wells drying out in my village?"*
- *"How does a check dam help?"*
- *"What happens during a severe monsoon drought?"*

### B. "Explain My Simulation"
The mentor retrieves the student's latest authenticated simulation results and explains:
1. **Net Water Balance**: Total rainfall volume vs. infiltration vs. extracted draft.
2. **Decision Impacts**: How switching to drip irrigation prevented cones of depression or how check dams boosted recharge.
3. **Water Quality & Sustainability**: How agrochemicals impacted WQI and recommendations for the next run.

### C. Contextual Action Recommendations & Game Deep-Links
Whenever the mentor recommends a conservation intervention, it attaches interactive action chips:
- `NAVIGATE_FARM`: Teleports camera to the agricultural plot with drip lines.
- `NAVIGATE_RWH`: Highlights the rooftop rainwater harvesting pucca dwelling.
- `NAVIGATE_CHECK_DAM`: Centers on the masonry check dam across the river stream.
- `NAVIGATE_BOREWELL`: Highlights the motorized tube well pump house.
- `NAVIGATE_POND`: Directs the student to the community percolation talab.

### D. Interactive Hydrological Quizzes
Generates curriculum-aligned multiple-choice questions with answer verification and scientific explanations across topics:
- `RECHARGE`
- `IRRIGATION`
- `AQUIFER_DYNAMICS`
- `RAINWATER_HARVESTING`
- `WATER_QUALITY`
- `WATERSHED_MANAGEMENT`

---

## 4. Dual-Engine Resilience (OpenAI & Deterministic Fallback)
1. **OpenAI Mode**:
   - Activated when `OPENAI_API_KEY` is provided in `backend/.env`.
   - Uses `OPENAI_MODEL` (`gpt-4o-mini` default) with strict system prompts, temperature $0.6$, and token limit $800$.
2. **Deterministic Educational Engine**:
   - Activated automatically when `OPENAI_API_KEY` is omitted, blank, or when OpenAI services experience timeouts.
   - Generates high-fidelity science teacher explanations grounded in CGWB equations.
   - Sets `isAiGenerated: false` and explicitly displays an educational notice.
   - **Never fabricates or falsely claims that an AI model generated the response**.
