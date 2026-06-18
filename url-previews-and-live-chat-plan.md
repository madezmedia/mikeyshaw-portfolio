# Plan: URL Previews, Live Chat, and Backend Infrastructure (COMPLETED)

This plan outlines the architecture, dependencies, and implementation tasks required to integrate URL previews, establish a live chat system (AI-driven or human-in-the-loop), and upgrade the portfolio's hosting/backend infrastructure.

---

## 🔍 Phase 1: Current Infrastructure Audit

### 1. Frontend Architecture
* **Framework:** Astro (configured as `output: "static"` by default).
* **Hydration:** React components (`client:load`, `client:visible`) are used for dynamic widgets (Cal.com, ChatWidget, ServicesAndOffers).
* **Styling:** Tailwind CSS v4.2 + Custom editorial stylesheets.
* **Deployment:** Vercel static hosting.

### 2. Chat Widget (Current State)
* **File:** `src/components/ChatWidget.tsx`
* **Logic:** Purely client-side mock. Resolves keyword queries via a static regex switch-statement.
* **Limitations:** No real-time message tracking, no persistent database storage, and no actual LLM inference.

---

## 🛠️ Phase 2: Implementation Architectures & Decisions

### 1. URL Previews
To display visual metadata cards (title, description, image) for external links:
* **Selected Decision:** **Visual Previews for Core Links (Static Compilation / Mapping)**
  * *Mechanism:* Statically pre-defined metadata mapping for core products/Whop/Cal links inside `src/utils/previews.ts`.
  * *Pros:* Sub-1ms load time, 0 runtime dependency, 100% resilient.

### 2. Live Chat Integration
To replace the client-side mock chat widget with a functional system:
* **Selected Decision:** **Smart AI Co-pilot (Dynamic Bentley powered by Gemini)**
  * *Mechanism:* Set up `/api/chat` using Gemini flash model seeded with a system prompt about Mikey, case studies, and services.
  * *Graceful Degradation:* The frontend ChatWidget is connected to the API endpoint, but if the endpoint is offline or the key is not set, it degrades cleanly to the local regex-based co-pilot.

### 3. Backend Infrastructure Transition
To support API routes (`/api/chat`):
* **Selected Decision:** **Hybrid Vercel Serverless hosting**
  * *Astro Config:* Configured `output: 'hybrid'` and the `@astrojs/vercel/serverless` (v7) adapter compatible with Astro v4.
  * *API Endpoints:* Pre-rendering disabled on endpoints to trigger serverless execution on Vercel.

---

## 📋 Phase 3: Task Breakdown & Completion Log

### [x] Task 1: Infrastructure Transition (P0)
* **Description:** Shift Astro to hybrid rendering mode and install Vercel adapter.
* **Files Modified:** [astro.config.mjs](file:///Users/michaelshaw/dyad-apps/mikeyshaw-portfolio/astro.config.mjs), [package.json](file:///Users/michaelshaw/dyad-apps/mikeyshaw-portfolio/package.json)
* **Verification:** `npm run build` compiled successfully and generated the serverless entry bundle.

### [x] Task 2: Core Link Previews Map (P1)
* **Description:** Map static Open Graph metadata for core links (Whop checkout, Cal.com, madezmedia agency).
* **Files Created:** [src/utils/previews.ts](file:///Users/michaelshaw/dyad-apps/mikeyshaw-portfolio/src/utils/previews.ts)
* **Verification:** Exposes `detectCoreLinks` and metadata mapping.

### [x] Task 3: Dynamic AI Chat Router (P1)
* **Description:** Set up `/api/chat` using `@google/generative-ai` to handle incoming messages and return styled, persona-locked responses from Bentley.
* **Files Created:** [src/pages/api/chat.ts](file:///Users/michaelshaw/dyad-apps/mikeyshaw-portfolio/src/pages/api/chat.ts)
* **Verification:** Tested local Astro build outputs.

### [x] Task 4: UI Polish & Chat Inline Previews (P2)
* **Description:** Connect [ChatWidget.tsx](file:///Users/michaelshaw/dyad-apps/mikeyshaw-portfolio/src/components/ChatWidget.tsx) to `/api/chat` and render detected previews inline.
* **Files Modified:** [src/components/ChatWidget.tsx](file:///Users/michaelshaw/dyad-apps/mikeyshaw-portfolio/src/components/ChatWidget.tsx)
* **Verification:** Build successfully compiled; fallback logic works correctly.
