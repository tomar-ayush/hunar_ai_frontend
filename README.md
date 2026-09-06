# Hunar AI — Autonomous Recruiting & Voice Screening Platform

> **Hunar AI** is an intelligent, autonomous recruiting platform that automates candidate discovery, conducts outbound AI phone screening calls, and generates actionable, dimension-based evaluation scorecards.

---

## 🚀 Key Features

### 1. Unified Sourcing Builder
- Create job requirements, target seniority, remote policies, and salary bands in a single seamless interface.
- Automatically link specialized voice personas and custom screening scripts to specific job openings.
- Immediate trigger for autonomous candidate discovery and pipeline generation.

### 2. Autonomous AI Voice Agents
- **Multi-Persona & Multi-Language**: Powered by realistic voice agents (Neha, Roy, Zoe, Sam, Mira, Eesha) across languages including English, Hindi, Tamil, Telugu, Spanish, and more.
- **Customizable Prompts & Objectives**: Tailor introductory hooks, role qualifications, and technical probing questions per agent.
- **Structured Schema Extraction**: Extract structured data post-call, such as technical fit scores, job-seeking intent, notice periods, and expected compensation.

### 3. Candidate Pipeline & Telemetry
- **Multiple Ingestion Channels**: Direct Apollo/web scraping, CSV roster bulk uploads, or manual entry.
- **One-Click Dialing**: Initiate single-candidate or batch voice outreach calls directly from the pipeline.
- **Live Lifecycle Tracking**: Real-time statuses across `not_contacted`, `queued`, `ringing`, and `completed`.

### 4. Interactive Interview Audit & Review
- **Call Audio Player**: Scrubber and playback controls linked directly to call recordings.
- **Synchronized Transcript**: Interactive chat-style dialogue with timestamp jump-to-play functionality.
- **AI Scorecards & Takeaways**: Automated candidate synthesis, key strengths, potential red flags, and cultural/technical dimension score breakdowns.
- **Call-in-Progress Protection**: Clean placeholder states hide evaluation data and transcripts until calls conclude and results are calculated.

---

## 🛠️ Tech Stack

- **Framework**: [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Bundler & Tooling**: [Vite 8](https://vite.dev/) + [React Compiler](https://react.dev/learn/react-compiler)
- **State & Data Fetching**: [TanStack Query v5](https://tanstack.com/query/latest)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Routing**: [React Router v7](https://reactrouter.com/)
- **Icons**: [Lucide React](https://lucide.dev/)

---

## ⚙️ Environment Configuration

Create a `.env` file in the root of the project:

```env
# Backend API Base URL (e.g. local backend or production deployment)
VITE_API_URL=http://localhost:8000
```

> **Note**: In production (such as on Vercel), add `VITE_API_URL` to your project's Environment Variables settings pointing to your deployed backend (e.g. `https://your-backend.up.railway.app`). Do not add a trailing slash or `/api`.

---

## 📦 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Run the Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### 3. Build for Production
```bash
npm run build
```
Build output will be generated in the `dist/` directory.

### 4. Linting
```bash
npm run lint
```

---

## 🌐 Deployment (Vercel)

The repository includes a `vercel.json` file configured for Single Page Application (SPA) client-side routing rewrites:

```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

When deploying to Vercel:
1. Connect your repository to Vercel.
2. Under **Settings > Environment Variables**, add:
   - **Key**: `VITE_API_URL`
   - **Value**: `https://your-backend-api-domain.com`
3. Trigger a deployment.
