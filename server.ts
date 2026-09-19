import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { db, INITIAL_MOCK_ALERTS } from "./server/db";
import { executeAiTriage } from "./server/triage";
import { SCENARIOS } from "./server/scenarios";
import { RawAlert } from "./src/types";

// Pool of mock alerts for real-time chaos simulation
const CHAOS_ALERT_POOL: RawAlert[] = [
  ...INITIAL_MOCK_ALERTS,
  ...Object.values(SCENARIOS).flat()
];

let chaosInterval: NodeJS.Timeout | null = null;
let isChaosRunning = false;

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Health Endpoint
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", app: "Ops Incident Commander", time: new Date().toISOString() });
  });

  // Data Layer Endpoints
  app.get("/api/alerts", (req, res) => {
    const alerts = db.getAlerts();
    res.json(alerts);
  });

  // GET /api/past-incidents - Returns resolved historical issues from Postgres table
  app.get("/api/past-incidents", (req, res) => {
    res.json(db.getPastIncidents());
  });

  // GET /api/incidents - Returns all incidents (for Kanban and management)
  app.get("/api/incidents", (req, res) => {
    res.json(db.getIncidents());
  });

  // GET /api/incidents/:id - Returns single incident by id
  app.get("/api/incidents/:id", (req, res) => {
    const inc = db.getIncidentById(req.params.id);
    if (!inc) {
      return res.status(404).json({ error: "Incident not found" });
    }
    res.json(inc);
  });

  // Public endpoint POST /api/alerts that validates and inserts a single alert JSON payload
  app.post("/api/alerts", (req, res) => {
    const { source, severity_hint, message, metadata } = req.body;
    if (!message || typeof message !== "string") {
      return res.status(400).json({ error: "Validation failed: 'message' is required as a non-empty string." });
    }
    if (!source || typeof source !== "string") {
      return res.status(400).json({ error: "Validation failed: 'source' is required (e.g., 'AWS CloudWatch', 'Datadog', 'Zendesk', 'PagerDuty')." });
    }

    const validSeverities = ["CRITICAL", "WARNING", "INFO"];
    const normalizedSeverity = validSeverities.includes(severity_hint) ? severity_hint : "INFO";

    const newAlert: RawAlert = {
      id: req.body.id && typeof req.body.id === "string" ? req.body.id : `ALT-${Date.now().toString().slice(-4)}`,
      source: source.trim(),
      severity_hint: normalizedSeverity,
      timestamp: req.body.timestamp && typeof req.body.timestamp === "string" ? req.body.timestamp : new Date().toISOString(),
      message: message.trim(),
      metadata: metadata && typeof metadata === "object" ? metadata : {}
    };

    const inserted = db.insertAlert(newAlert);
    res.status(201).json({ success: true, alert: inserted });
  });

  // Express endpoint POST /api/simulate that accepts scenario param ('checkout_failure', 'auth_outage', 'memory_leak')
  app.post("/api/simulate", (req, res) => {
    const scenario = req.query.scenario || req.body?.scenario;
    if (!scenario || typeof scenario !== "string" || !SCENARIOS[scenario]) {
      return res.status(400).json({
        error: `Invalid scenario '${scenario}'. Supported scenarios: ${Object.keys(SCENARIOS).join(", ")}`
      });
    }

    const scenarioAlerts = JSON.parse(JSON.stringify(SCENARIOS[scenario]));
    // Update timestamps to be relative to now
    const now = Date.now();
    scenarioAlerts.forEach((alt: RawAlert, idx: number) => {
      alt.timestamp = new Date(now - (scenarioAlerts.length - idx) * 35000).toISOString();
    });

    const insertedBatch = db.insertAlertsBatch(scenarioAlerts);
    res.json({
      success: true,
      scenario,
      count: insertedBatch.length,
      alerts: insertedBatch
    });
  });

  // Real-time Chaos Simulator: POST /api/simulate/start
  // Starts a 2.5s setInterval loop that selects a random alert from mock_alerts, gives it a fresh timestamp, and inserts into DB
  app.post("/api/simulate/start", (req, res) => {
    if (chaosInterval) {
      clearInterval(chaosInterval);
    }
    isChaosRunning = true;

    chaosInterval = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * CHAOS_ALERT_POOL.length);
      const templateAlert = CHAOS_ALERT_POOL[randomIndex];
      const newAlert: RawAlert = {
        ...templateAlert,
        id: `ALT-${Date.now().toString().slice(-4)}-${Math.floor(Math.random() * 900 + 100)}`,
        timestamp: new Date().toISOString()
      };
      db.insertAlert(newAlert);
      console.log(`[ChaosSimulator] Injected live alert ${newAlert.id} [${newAlert.source}]: ${newAlert.message}`);
    }, 2500);

    console.log("[ChaosSimulator] Started real-time chaos simulation loop (2.5s interval).");
    res.json({ success: true, running: true, message: "Real-time chaos simulator started (2.5s interval)" });
  });

  // POST /api/simulate/stop - Clears the chaos interval
  app.post("/api/simulate/stop", (req, res) => {
    if (chaosInterval) {
      clearInterval(chaosInterval);
      chaosInterval = null;
    }
    isChaosRunning = false;
    console.log("[ChaosSimulator] Stopped real-time chaos simulation loop.");
    res.json({ success: true, running: false, message: "Chaos simulator stopped" });
  });

  // GET /api/simulate/status - Returns current simulation status
  app.get("/api/simulate/status", (req, res) => {
    res.json({ running: isChaosRunning });
  });

  // AI Triage Endpoint (Executes Gemini AI model correlation with Postgres historical context)
  app.post("/api/triage", async (req, res) => {
    try {
      const alerts = db.getAlerts();
      // Native Postgres query on past_incidents table for keyword matches against raw_alerts stream
      const historicalMatch = db.queryPastIncidentsMatch(alerts);
      const matchedResolution = historicalMatch ? historicalMatch.resolution : null;

      if (historicalMatch) {
        console.log(`[Postgres Search] Matched past incident "${historicalMatch.title}". Resolution: "${historicalMatch.resolution}"`);
      } else {
        console.log("[Postgres Search] No historical incident matches found for active alert stream.");
      }

      const incident = await executeAiTriage(alerts, matchedResolution);
      db.saveIncident(incident);
      res.json(incident);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      res.status(500).json({ error: "Failed to execute triage", details: message });
    }
  });

  // Toggle runbook step completion
  app.patch("/api/incidents/:id/step", (req, res) => {
    const { id } = req.params;
    const { stepId, completed } = req.body;
    const updated = db.toggleStep(id, Number(stepId), Boolean(completed));
    if (!updated) {
      return res.status(404).json({ error: "Incident not found" });
    }
    res.json(updated);
  });

  // Execute runbook step with simulated command runner and terminal output
  app.post("/api/incidents/:id/execute-step", (req, res) => {
    const { id } = req.params;
    const { stepId } = req.body;
    const result = db.executeStepCommand(id, Number(stepId));
    if (!result) {
      return res.status(404).json({ error: "Incident or step not found" });
    }
    res.json({
      success: true,
      incident: result.incident,
      step: result.step,
      output: result.output
    });
  });

  // Update incident status (investigating -> mitigating -> resolved)
  app.patch("/api/incidents/:id/status", (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    if (!['investigating', 'mitigating', 'resolved'].includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }
    const updated = db.updateIncidentStatus(id, status);
    if (!updated) {
      return res.status(404).json({ error: "Incident not found" });
    }
    res.json(updated);
  });

  // Append audit timeline event
  app.post("/api/incidents/:id/audit", (req, res) => {
    const { id } = req.params;
    const { actor, action, details, type } = req.body;
    const event = db.addAuditEvent(id, {
      actor: actor || "Operator",
      action: action || "Manual Note",
      details: details || "",
      type: type || "manual"
    });
    if (!event) {
      return res.status(404).json({ error: "Incident not found" });
    }
    res.json({ success: true, event });
  });

  // Get integrations
  app.get("/api/integrations", (req, res) => {
    res.json(db.getIntegrations());
  });

  // Update integration (connect / save API keys)
  app.patch("/api/integrations/:id", (req, res) => {
    const { id } = req.params;
    const { connected, fields } = req.body;
    const updated = db.updateIntegration(id, {
      connected: typeof connected === 'boolean' ? connected : true,
      connectedAt: "Just now",
      apiKeyMasked: "••••••••••••" + Math.floor(1000 + Math.random() * 9000),
      ...(fields ? { fields } : {})
    });
    if (!updated) {
      return res.status(404).json({ error: "Integration not found" });
    }
    res.json({ success: true, integration: updated });
  });

  // Get post-mortems
  app.get("/api/post-mortems", (req, res) => {
    res.json(db.getPastIncidents());
  });

  // Generate Google Docs Post-Mortem
  app.post("/api/incidents/:id/post-mortem", (req, res) => {
    const { id } = req.params;
    const postMortem = db.generatePostMortem(id);
    if (!postMortem) {
      return res.status(404).json({ error: "Incident not found or unable to generate post-mortem" });
    }
    res.json({ success: true, postMortem });
  });

  app.post("/api/reset", (req, res) => {
    db.reset();
    res.json({ success: true, message: "Database reset to chaotic state with 8 alerts." });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
