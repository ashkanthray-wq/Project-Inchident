# Ops Incident Commander 🛡️⚡

An autonomous AI incident triage and war room command center designed to eliminate alert fatigue, correlate noise streams into root-cause incidents, and execute safeguarded mitigation runbooks in real time.

Built with **React 18**, **TypeScript**, **Vite**, **Tailwind CSS**, and **Express**, with **Google Gemini AI** integration for automated root cause isolation and post-mortem generation.

---

## 🌟 Key Features

### 1. The Sitrep Zone & War Room Command Center
- **Incident Severity Triaging**: Live SEV-1 emergency pulsing and alerts for critical infrastructure outages.
- **Root Cause Isolation**: Autonomous synthesis isolating the exact underlying bottleneck, query lock, or deployment regression.
- **Audio Waveform Briefing**: Integrated audio summary visualizer providing a vocal operational Sitrep for on-call engineers.
- **One-Click Communication Channels**: Direct deep-links to auto-provisioned `#incident-<id>` Slack channels and Google Meet War Rooms.

### 2. Safeguarded Execution Canvas & CI/CD Terminal
- **3-Second Hold-to-Execute**: Destructive production actions (`kubectl scale`, `gh workflow run`, traffic drain) require an intentional 3-second hold to prevent accidental triggers.
- **Integrated Terminal Stream**: Monospace terminal showing live stdout/stderr from simulated CI/CD pipelines (Kubernetes, AWS STS, ArgoCD).
- **Dual-Mode Actions**: Complete containment, mitigation, and verification steps in real time.

### 3. The Living Audit Trail
- **Chronological Event Stream**: Real-time record of alerts ingested, AI triage decisions, operator notes, and runbook execution timestamps.
- **Live Operator Dispatch**: Instant memo appending to keep distributed responders synchronized.

### 4. Automated Post-Mortem Synthesis (Google Docs Ready)
- **Instant Documentation**: Once mitigated, automatically synthesizes executive summaries, MTTR metrics, chronological timeline, and action items.
- **Markdown & Google Docs Export**: One-click export to Google Docs or clipboard markdown.

### 5. The Noise Stream & Anomaly Simulator
- **High-Density Telemetry**: Inspect and filter hundreds of correlated and suppressed alerts from AWS CloudWatch, Datadog, and PagerDuty.
- **Live Chaos Generator**: Toggle background telemetry chaos to simulate cascading traffic spikes and deadlocks.

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or bun

### Installation

1. **Clone the repository**:
   ```bash
   git clone <your-repository-url>
   cd ops-incident-commander
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Copy the example environment file:
   ```bash
   cp .env.example .env
   ```
   Add your Gemini API key (optional for simulated triage mode):
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

4. **Start Development Server**:
   ```bash
   npm run dev
   ```
   The application will start on `http://localhost:3000`.

5. **Build for Production**:
   ```bash
   npm run build
   npm start
   ```

---

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Lucide Icons, Canvas API for real-time audio visualization.
- **Backend**: Express.js with custom REST endpoints for alert simulation, runbook step execution, audit trail logging, and Google Gemini triage.
- **AI Integration**: `@google/genai` for autonomous root cause diagnostics and post-mortem generation.

---

## 📄 License

MIT License. Designed for high-reliability site reliability engineering teams.
