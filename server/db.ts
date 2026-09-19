import { RawAlert, Incident, PastIncident, IntegrationConfig, AuditTimelineEvent, IncidentStatus, RunbookStep } from '../src/types';

export const INITIAL_PAST_INCIDENTS: PastIncident[] = [
  {
    id: 1,
    incident_id: "INC-0982",
    title: "Redis Primary Connection Drop & Cache Cascade",
    severity: "SEV-2",
    root_cause: "High connection churn saturated maxclients on redis-prod-01, triggering cache miss waterfall onto database cluster.",
    resolution: "Scaled read replicas from 2 to 6 nodes, flushed poisoned token keys, and increased maxclients to 20,000.",
    resolved_at: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    duration_minutes: 24,
    commander: "Alex Mercer (Principal SRE)",
    team: "Infrastructure",
    post_mortem_markdown: `# Post-Mortem: INC-0982 - Redis Primary Connection Drop

**Incident Commander**: Alex Mercer  
**Date**: September 17, 2026  
**Severity**: SEV-2 | **MTTR**: 24 minutes  

### Executive Summary
At 14:12 UTC, a sudden burst of microservice reboots created a thundering herd against \`redis-prod-01\`, reaching the 10,000 maxclients limit. Cache misses cascaded directly to PostgreSQL read-replicas.

### 5 Whys Analysis
1. **Why did checkout latency spike?** Read replicas received a 400% surge in uncached queries.
2. **Why were queries uncached?** Redis stopped accepting new TCP connections.
3. **Why did Redis stop accepting connections?** Active connection count reached the 10,000 socket ceiling.
4. **Why did connection count spike?** 80 worker pods simultaneously crashed and restarted in a loop.
5. **Why did worker pods loop?** New deploy misconfigured the readiness probe timeout.

### Action Items
- [x] Increase Redis \`maxclients\` parameter to 20,000 via Terraform.
- [x] Add TCP keepalive and connection pooling in redis client singleton.
- [ ] Implement exponential backoff jitter on worker pod bootup sequence.`
  },
  {
    id: 2,
    incident_id: "INC-0994",
    title: "Postgres Connection Pool Exhaustion & Deadlock",
    severity: "SEV-1",
    root_cause: "Terminated runaway vacuum locks, expanded connection pool limit, and rerouted read queries to read-replica prod-db-02",
    resolution: "Terminated runaway vacuum locks, expanded connection pool limit, and rerouted read queries to read-replica prod-db-02",
    resolved_at: new Date(Date.now() - 1000 * 60 * 60 * 26).toISOString(),
    duration_minutes: 38,
    commander: "Sarah Chen (Staff DBA)",
    team: "Database",
    post_mortem_markdown: `# Post-Mortem: INC-0994 - Postgres Connection Pool Exhaustion

**Incident Commander**: Sarah Chen  
**Date**: September 18, 2026  
**Severity**: SEV-1 | **MTTR**: 38 minutes  

### Executive Summary
Postgres primary DB reached 100% CPU lock due to an unindexed migration running concurrently with the peak morning order traffic. Connection pool exhausted at 500 connections.

### Resolution
- Terminated PID 4192 blocking the exclusive lock.
- Expanded PgBouncer pool limits from 500 to 1,200.
- Rerouted reporting and analytics reads to read replica \`prod-db-02\`.`
  },
  {
    id: 3,
    incident_id: "INC-1011",
    title: "Payment Gateway 504 Timeout Surge",
    severity: "SEV-1",
    root_cause: "Upstream payment provider experienced network partition, causing synchronous HTTP threads to hang until timeout.",
    resolution: "Enabled idempotent retry headers, engaged fallback payment processor circuit breaker, and scaled checkout-api worker pods",
    resolved_at: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
    duration_minutes: 19,
    commander: "David Kim (Payments Lead)",
    team: "Payments",
    post_mortem_markdown: `# Post-Mortem: INC-1011 - Payment Gateway 504 Timeout Surge

**Incident Commander**: David Kim  
**Date**: September 18, 2026  
**Severity**: SEV-1 | **MTTR**: 19 minutes  

### Executive Summary
A localized fiber cut at our primary payment processor led to elevated timeout rates (>12%) on \`/v1/checkout\`. The circuit breaker engaged to route transactions to our secondary processor.`
  }
];

export const INITIAL_MOCK_ALERTS: RawAlert[] = [
  {
    id: "ALT-101",
    source: "AWS CloudWatch",
    severity_hint: "CRITICAL",
    timestamp: new Date(Date.now() - 340000).toISOString(),
    message: "RDS Postgres Primary (prod-db-01): CPU utilization 99.4% for > 5m.",
    metadata: { host: "prod-db-01", threshold: "85%" }
  },
  {
    id: "ALT-102",
    source: "Datadog",
    severity_hint: "CRITICAL",
    timestamp: new Date(Date.now() - 310000).toISOString(),
    message: "API Latency spike on endpoint /v1/checkout: p99 latency > 4200ms.",
    metadata: { endpoint: "/v1/checkout", latency: "4200ms" }
  },
  {
    id: "ALT-103",
    source: "Datadog",
    severity_hint: "WARNING",
    timestamp: new Date(Date.now() - 280000).toISOString(),
    message: "Database connection pool exhaustion: Active connections 498/500.",
    metadata: { pool_id: "checkout-service" }
  },
  {
    id: "ALT-104",
    source: "Zendesk",
    severity_hint: "CRITICAL",
    timestamp: new Date(Date.now() - 230000).toISOString(),
    message: "Ticket #8942: Multiple customers unable to complete payment. Gateway timeout 504.",
    metadata: { reporter_count: 14 }
  },
  {
    id: "ALT-105",
    source: "Zendesk",
    severity_hint: "WARNING",
    timestamp: new Date(Date.now() - 190000).toISOString(),
    message: "Ticket #8945: Duplicate payment deducted, order marked pending.",
    metadata: { reporter_count: 6 }
  },
  {
    id: "ALT-106",
    source: "PagerDuty",
    severity_hint: "CRITICAL",
    timestamp: new Date(Date.now() - 150000).toISOString(),
    message: "Incident #441: High Error Rate (>12%) on Checkout Microservice.",
    metadata: { service: "checkout-api" }
  },
  {
    id: "ALT-107",
    source: "AWS CloudWatch",
    severity_hint: "WARNING",
    timestamp: new Date(Date.now() - 110000).toISOString(),
    message: "ReadReplica lag on prod-db-02 exceeding 180 seconds.",
    metadata: { host: "prod-db-02" }
  },
  {
    id: "ALT-108",
    source: "Zendesk",
    severity_hint: "INFO",
    timestamp: new Date(Date.now() - 60000).toISOString(),
    message: "Ticket #8950: Support queue volume surge (+140% vs baseline).",
    metadata: { queue: "Billing" }
  }
];

export const INITIAL_INTEGRATIONS: IntegrationConfig[] = [
  {
    id: 'aws',
    name: 'Amazon Web Services',
    category: 'Cloud Infrastructure & CloudWatch',
    description: 'Ingest CloudWatch metrics, alarms, RDS telemetry, and trigger auto-remediation scripts.',
    connected: true,
    apiKeyMasked: 'AKIA••••••••••••8492',
    endpoint: 'https://monitoring.us-east-1.amazonaws.com',
    connectedAt: 'Connected 3 days ago',
    iconType: 'aws',
    fields: [
      { id: 'accessKeyId', label: 'AWS Access Key ID', type: 'text', placeholder: 'AKIAIOSFODNN7EXAMPLE', value: 'AKIA23984028492' },
      { id: 'secretAccessKey', label: 'AWS Secret Access Key', type: 'password', placeholder: 'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY', value: '••••••••••••••••••••••••' },
      { id: 'region', label: 'Default Region', type: 'text', placeholder: 'us-east-1', value: 'us-east-1' }
    ]
  },
  {
    id: 'datadog',
    name: 'Datadog',
    category: 'APM & Synthetic Monitoring',
    description: 'Stream p99 APM traces, synthetic health monitors, anomaly detectors, and host agent alerts.',
    connected: true,
    apiKeyMasked: 'dd_api_••••••••992f',
    endpoint: 'https://api.datadoghq.com',
    connectedAt: 'Connected 5 days ago',
    iconType: 'datadog',
    fields: [
      { id: 'apiKey', label: 'Datadog API Key', type: 'password', placeholder: 'a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6', value: 'dd_api_992fb472091' },
      { id: 'appKey', label: 'Datadog Application Key', type: 'password', placeholder: 'z9y8x7w6v5u4t3s2r1q0p9o8n7m6l5k4', value: 'dd_app_84291823901' },
      { id: 'site', label: 'Datadog Site', type: 'text', placeholder: 'datadoghq.com', value: 'datadoghq.com' }
    ]
  },
  {
    id: 'github',
    name: 'GitHub',
    category: 'Source Control & CI/CD Actions',
    description: 'Correlate recent pull request merges and trigger emergency deployment rollback workflows.',
    connected: true,
    apiKeyMasked: 'ghp_••••••••4819',
    endpoint: 'https://api.github.com',
    connectedAt: 'Connected 1 week ago',
    iconType: 'github',
    fields: [
      { id: 'token', label: 'Personal Access Token / App Token', type: 'password', placeholder: 'ghp_xxxxxxxxxxxxxxxxxxxx', value: 'ghp_481982049182049182' },
      { id: 'organization', label: 'GitHub Organization', type: 'text', placeholder: 'acme-corp', value: 'acme-enterprise' },
      { id: 'repository', label: 'Primary Monorepo', type: 'text', placeholder: 'core-platform', value: 'core-platform' }
    ]
  },
  {
    id: 'pagerduty',
    name: 'PagerDuty',
    category: 'On-Call Management & Escalations',
    description: 'Bi-directional escalation sync: auto-page on-call schedules and acknowledge active incidents.',
    connected: false,
    iconType: 'pagerduty',
    fields: [
      { id: 'apiKey', label: 'PagerDuty REST API Key', type: 'password', placeholder: 'y_37189123891723...', value: '' },
      { id: 'routingKey', label: 'Events V2 Integration Key', type: 'password', placeholder: 'pd_events_routing_key...', value: '' },
      { id: 'serviceId', label: 'Escalation Policy ID', type: 'text', placeholder: 'P12ABCD', value: '' }
    ]
  },
  {
    id: 'google_workspace',
    name: 'Google Workspace',
    category: 'Collaboration & Incident Ops',
    description: 'Auto-provision Google Meet war room bridges and generate Google Docs post-mortem templates.',
    connected: false,
    iconType: 'google_workspace',
    fields: [
      { id: 'clientId', label: 'Google Cloud OAuth Client ID', type: 'text', placeholder: '123456789-xxxxxx.apps.googleusercontent.com', value: '' },
      { id: 'serviceAccount', label: 'Service Account Email (Optional)', type: 'text', placeholder: 'ops-bot@project.iam.gserviceaccount.com', value: '' },
      { id: 'calendarId', label: 'On-Call Shared Calendar ID', type: 'text', placeholder: 'sre-rotations@company.com', value: '' }
    ]
  }
];

const INITIAL_SEEDED_INCIDENTS: Incident[] = [
  {
    id: "inc-101",
    title: "Cascading Database Deadlock & Checkout Gateway Failure",
    severity: "SEV-1",
    status: "mitigating",
    root_cause: "RDS Postgres Primary (prod-db-01) CPU reached 99.4%, saturating connection pools (498/500) and triggering 504 timeouts on /v1/checkout endpoints.",
    affected_scope: "100% of /v1/checkout requests failing; customer payments hanging; customer support queue spike (+140%).",
    owner_team: "Database",
    suppressed_alert_count: 7,
    slack_channel: "#inc-101-checkout-war-room",
    meet_link: "https://meet.google.com/qmv-oxzk-bnt",
    runbook_steps: [
      {
        id: 1,
        task: "Identify and kill long-running runaway vacuum or lock queries on prod-db-01",
        executable_command: "psql -h prod-db-01 -U app_admin -d main -c \"SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE wait_event_type = 'Lock';\"",
        type: "containment",
        completed: true,
        terminal_output: `Connecting to prod-db-01.internal (port 5432)... OK
Found 3 blocking lock backends: PID 19482, PID 19483, PID 19504
Executing pg_terminate_backend(19482)... Terminated (SIGTERM)
Executing pg_terminate_backend(19483)... Terminated (SIGTERM)
Executing pg_terminate_backend(19504)... Terminated (SIGTERM)
Active connection lock contention reduced from 498 to 142.
Exit code: 0 [SUCCESS]`,
        executed_at: new Date(Date.now() - 1000 * 60 * 12).toISOString()
      },
      {
        id: 2,
        task: "Scale checkout API deployment and re-route read queries to replica prod-db-02",
        executable_command: "kubectl scale deployment checkout --replicas=8 -n production",
        type: "mitigation",
        completed: false
      },
      {
        id: 3,
        task: "Post customer-facing incident update on status.company.com regarding checkout recovery",
        executable_command: "curl -s -X POST https://api.statuspage.io/v1/pages/main/incidents -H 'Authorization: Bearer st-token' -d '{\"status\":\"identified\"}'",
        type: "communication",
        completed: false
      }
    ],
    audit_timeline: [
      {
        id: "aud-1",
        incident_id: "inc-101",
        timestamp: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
        actor: "Autonomous AI Agent",
        action: "Incident Created",
        details: "Correlated 7 alerts from Datadog & AWS CloudWatch into SEV-1 incident.",
        type: "system"
      },
      {
        id: "aud-2",
        incident_id: "inc-101",
        timestamp: new Date(Date.now() - 1000 * 60 * 17).toISOString(),
        actor: "Autonomous AI Agent",
        action: "Audio Sitrep Generated",
        details: "Synthesized ElevenLabs tactical voice briefing for on-call responder.",
        type: "audio"
      },
      {
        id: "aud-3",
        incident_id: "inc-101",
        timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
        actor: "Alex Mercer",
        action: "Slack War Room Opened",
        details: "Created channel #inc-101-checkout-war-room and invited @payments-oncall, @dba-team.",
        type: "slack"
      },
      {
        id: "aud-4",
        incident_id: "inc-101",
        timestamp: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
        actor: "Sarah Chen",
        action: "Runbook Step #1 Executed",
        details: "Terminated 3 blocking lock backends on prod-db-01 via inline webhook.",
        type: "runbook"
      }
    ],
    historical_match: true,
    created_at: new Date(Date.now() - 1000 * 60 * 18).toISOString()
  },
  {
    id: "inc-102",
    title: "Redis Session Cluster Memory Exhaustion",
    severity: "SEV-2",
    status: "resolved",
    root_cause: "Redis primary node reached 98.6% maxmemory limit due to unexpiring OAuth state tokens, triggering evicted keys and session drops.",
    affected_scope: "User login session drops across EU-West region (~4,200 active users).",
    owner_team: "Infrastructure",
    suppressed_alert_count: 14,
    slack_channel: "#inc-102-redis-memory",
    meet_link: "https://meet.google.com/yzk-abdf-mnp",
    runbook_steps: [
      {
        id: 1,
        task: "Execute memory purge on stale OAuth tokens older than 24 hours",
        executable_command: "redis-cli -h redis-prod.internal --eval /scripts/evict_expired_sessions.lua",
        type: "containment",
        completed: true,
        terminal_output: `[Redis Sentinel] Connected to redis-prod.internal:6379
Scanning keys with pattern 'oauth:state:*'...
Found 412,892 stale tokens older than 24h.
Purged keys successfully. Reclaimed 14.2 GB memory.
Exit code: 0 [SUCCESS]`,
        executed_at: new Date(Date.now() - 1000 * 60 * 75).toISOString()
      },
      {
        id: 2,
        task: "Scale Redis node memory quota to 32GB cluster size",
        executable_command: "aws elasticache modify-cache-cluster --cache-cluster-id redis-sess-prod --cache-node-type cache.r6g.xlarge",
        type: "mitigation",
        completed: true,
        terminal_output: `[AWS ElastiCache] Initiating node resize cache.r6g.xlarge...
Cluster status: modifying -> available.
Nodes updated: 3/3.
Exit code: 0 [SUCCESS]`,
        executed_at: new Date(Date.now() - 1000 * 60 * 60).toISOString()
      }
    ],
    audit_timeline: [
      {
        id: "aud-102-1",
        incident_id: "inc-102",
        timestamp: new Date(Date.now() - 1000 * 60 * 95).toISOString(),
        actor: "Autonomous AI Agent",
        action: "Incident Created",
        details: "SEV-2 detected from Redis eviction rate metrics.",
        type: "system"
      },
      {
        id: "aud-102-2",
        incident_id: "inc-102",
        timestamp: new Date(Date.now() - 1000 * 60 * 75).toISOString(),
        actor: "Alex Mercer",
        action: "Step #1 Executed",
        details: "Purged 412k stale OAuth tokens via Lua script.",
        type: "runbook"
      },
      {
        id: "aud-102-3",
        incident_id: "inc-102",
        timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
        actor: "Alex Mercer",
        action: "Step #2 Executed",
        details: "Scaled ElastiCache cluster to cache.r6g.xlarge.",
        type: "runbook"
      },
      {
        id: "aud-102-4",
        incident_id: "inc-102",
        timestamp: new Date(Date.now() - 1000 * 60 * 50).toISOString(),
        actor: "Alex Mercer",
        action: "Incident Resolved",
        details: "All runbook steps verified. P99 session latency restored to 12ms.",
        type: "system"
      }
    ],
    historical_match: true,
    created_at: new Date(Date.now() - 1000 * 60 * 95).toISOString(),
    resolved_at: new Date(Date.now() - 1000 * 60 * 50).toISOString()
  },
  {
    id: "inc-103",
    title: "Third-Party Fraud Webhook Latency Spikes",
    severity: "SEV-3",
    status: "investigating",
    root_cause: "External fraud API endpoint p99 response times elevated to 3800ms, delaying user registration queue processing.",
    affected_scope: "New user signups delayed by ~15-30s in US-East.",
    owner_team: "Payments",
    suppressed_alert_count: 5,
    runbook_steps: [
      {
        id: 1,
        task: "Enable asynchronous background verification mode for fraud evaluations",
        executable_command: "kubectl set env deployment/signup-worker ASYNC_FRAUD_MODE=true -n production",
        type: "mitigation",
        completed: false
      }
    ],
    audit_timeline: [
      {
        id: "aud-103-1",
        incident_id: "inc-103",
        timestamp: new Date(Date.now() - 1000 * 60 * 4).toISOString(),
        actor: "Autonomous AI Agent",
        action: "Incident Created",
        details: "Alert cluster grouped: 5 synthetic fraud latency warnings.",
        type: "system"
      }
    ],
    historical_match: false,
    created_at: new Date(Date.now() - 1000 * 60 * 4).toISOString()
  }
];

class IncidentDatabase {
  private alerts: RawAlert[] = [];
  private incidents: Incident[] = [];
  private past_incidents: PastIncident[] = [];
  private integrations: IntegrationConfig[] = [];

  constructor() {
    this.seed();
  }

  public seed(): void {
    this.alerts = JSON.parse(JSON.stringify(INITIAL_MOCK_ALERTS));
    this.incidents = JSON.parse(JSON.stringify(INITIAL_SEEDED_INCIDENTS));
    this.past_incidents = JSON.parse(JSON.stringify(INITIAL_PAST_INCIDENTS));
    this.integrations = JSON.parse(JSON.stringify(INITIAL_INTEGRATIONS));
    console.log(`[DataLayer] Seeded database with ${this.alerts.length} alerts, ${this.incidents.length} active incidents, ${this.past_incidents.length} post-mortems, and ${this.integrations.length} integrations.`);
  }

  public getAlerts(): RawAlert[] {
    return this.alerts;
  }

  public getPastIncidents(): PastIncident[] {
    return this.past_incidents;
  }

  public getIntegrations(): IntegrationConfig[] {
    return this.integrations;
  }

  public updateIntegration(id: string, updates: Partial<IntegrationConfig>): IntegrationConfig | null {
    const item = this.integrations.find(i => i.id === id);
    if (!item) return null;
    Object.assign(item, updates);
    return item;
  }

  public queryPastIncidentsMatch(alerts: RawAlert[]): PastIncident | null {
    const combinedAlertText = alerts.map(a => `${a.source} ${a.message}`).join(' ').toLowerCase();

    let bestMatch: PastIncident | null = null;
    let highestScore = 0;
    const stopWords = new Set(['and', 'or', 'the', 'a', 'an', 'in', 'on', 'at', 'to', 'for', 'of', '&', '-']);

    for (const past of this.past_incidents) {
      const titleKeywords = past.title
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, ' ')
        .split(/\s+/)
        .filter(word => word.length > 2 && !stopWords.has(word));

      const matchedKeywords = titleKeywords.filter(kw => combinedAlertText.includes(kw));
      const score = matchedKeywords.length;

      if (score > highestScore) {
        highestScore = score;
        bestMatch = past;
      }
    }

    if (bestMatch && highestScore > 0) {
      console.log(`[Postgres Search] Found best match in table 'past_incidents' (keyword score ${highestScore}): "${bestMatch.title}"`);
      return bestMatch;
    }
    return null;
  }

  public insertAlert(alert: RawAlert): RawAlert {
    this.alerts.unshift(alert);
    return alert;
  }

  public insertAlertsBatch(alerts: RawAlert[]): RawAlert[] {
    this.alerts = [...alerts];
    if (this.incidents.length === 0) {
      this.incidents = JSON.parse(JSON.stringify(INITIAL_SEEDED_INCIDENTS));
    }
    return this.alerts;
  }

  public getIncidents(): Incident[] {
    if (this.incidents.length === 0) {
      this.incidents = JSON.parse(JSON.stringify(INITIAL_SEEDED_INCIDENTS));
    }
    return this.incidents;
  }

  public getIncidentById(id: string): Incident | undefined {
    let inc = this.incidents.find(i => i.id === id);
    if (!inc) {
      const seeded = INITIAL_SEEDED_INCIDENTS.find(i => i.id === id);
      if (seeded) {
        inc = JSON.parse(JSON.stringify(seeded));
        this.incidents.push(inc!);
      }
    }
    if (!inc && id && id.startsWith('inc-')) {
      inc = {
        id,
        title: "Active Production Degradation & Correlated Telemetry Anomaly",
        severity: "SEV-1",
        status: "investigating",
        root_cause: "High-priority correlated telemetry anomaly detected across production service mesh.",
        affected_scope: "Impacted downstream service endpoints and elevated transaction latency.",
        owner_team: "Infrastructure",
        suppressed_alert_count: 5,
        runbook_steps: [
          {
            id: 1,
            task: "Verify service health endpoints and clear hanging locks",
            executable_command: "kubectl rollout status deployment/checkout-api -n production",
            type: "containment",
            completed: false
          },
          {
            id: 2,
            task: "Scale worker deployment replicas to absorb queued workload",
            executable_command: "kubectl scale deployment checkout --replicas=8 -n production",
            type: "mitigation",
            completed: false
          },
          {
            id: 3,
            task: "Broadcast status page update: 'Investigating service degradation'",
            executable_command: "curl -s -X POST https://api.statuspage.io/v1/pages/main/incidents -H 'Authorization: Bearer token-sec' -d '{\"name\":\"Service Degradation\",\"status\":\"investigating\"}'",
            type: "communication",
            completed: false
          }
        ],
        audit_timeline: [
          {
            id: `aud-${Date.now()}`,
            incident_id: id,
            timestamp: new Date().toISOString(),
            actor: "Autonomous AI Agent",
            action: "Incident Created",
            details: "Auto-triaged active alerts.",
            type: "system"
          }
        ],
        historical_match: false,
        created_at: new Date().toISOString()
      };
      this.incidents.push(inc);
    }
    return inc;
  }

  public saveIncident(incident: Incident): Incident {
    if (!incident.status) {
      incident.status = 'investigating';
    }
    if (!incident.audit_timeline) {
      incident.audit_timeline = [
        {
          id: `aud-${Date.now()}`,
          incident_id: incident.id,
          timestamp: incident.created_at || new Date().toISOString(),
          actor: "Autonomous AI Agent",
          action: "Incident Created",
          details: `Correlated ${incident.suppressed_alert_count} alerts into ${incident.severity} incident.`,
          type: "system"
        }
      ];
    }
    this.incidents.unshift(incident);
    return incident;
  }

  public updateIncidentStatus(id: string, status: IncidentStatus): Incident | null {
    const inc = this.getIncidentById(id);
    if (!inc) return null;
    inc.status = status;
    if (status === 'resolved') {
      inc.resolved_at = new Date().toISOString();
    }
    this.addAuditEvent(id, {
      actor: "Operator",
      action: `Status changed to ${status.toUpperCase()}`,
      details: `Incident marked as ${status}.`,
      type: "system"
    });
    return inc;
  }

  public addAuditEvent(incidentId: string, event: Omit<AuditTimelineEvent, 'id' | 'incident_id' | 'timestamp'>): AuditTimelineEvent | null {
    const inc = this.getIncidentById(incidentId);
    if (!inc) return null;
    if (!inc.audit_timeline) {
      inc.audit_timeline = [];
    }
    const fullEvent: AuditTimelineEvent = {
      id: `aud-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      incident_id: incidentId,
      timestamp: new Date().toISOString(),
      ...event
    };
    inc.audit_timeline.push(fullEvent);
    return fullEvent;
  }

  public toggleStep(incidentId: string, stepId: number, completed: boolean): Incident | null {
    const inc = this.getIncidentById(incidentId);
    if (!inc) return null;
    const step = inc.runbook_steps.find(s => s.id === stepId);
    if (step) {
      step.completed = completed;
      if (completed) {
        step.executed_at = new Date().toISOString();
      }
    }
    // Check if all steps are completed
    const allCompleted = inc.runbook_steps.every(s => s.completed);
    const anyCompleted = inc.runbook_steps.some(s => s.completed);
    if (allCompleted) {
      inc.status = 'resolved';
      inc.resolved_at = new Date().toISOString();
    } else if (anyCompleted) {
      inc.status = 'mitigating';
    } else {
      inc.status = 'investigating';
    }
    return inc;
  }

  public executeStepCommand(incidentId: string, stepId: number): { incident: Incident; step: RunbookStep; output: string } | null {
    const inc = this.getIncidentById(incidentId);
    if (!inc) return null;
    const step = inc.runbook_steps.find(s => s.id === stepId);
    if (!step) return null;

    step.completed = true;
    step.executed_at = new Date().toISOString();

    let output = "";
    const cmd = step.executable_command || "";

    if (cmd.includes("psql") || cmd.includes("pg_terminate_backend")) {
      output = `[PostgreSQL Cluster Manager]
Connecting to prod-db-01.internal:5432 with app_admin...
Executing query: SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE wait_event_type = 'Lock';
Terminated 4 runaway query locks [PIDs: 8492, 8493, 8501, 8507].
Lock contention cleared. Connection pool restored to 42/500 active.
Exit code: 0 [SUCCESS]`;
    } else if (cmd.includes("kubectl scale") || cmd.includes("replicas")) {
      output = `[Kubernetes Cluster API]
deployment.apps/checkout scaled to 8 replicas
deployment.apps/checkout status: 8 ready / 8 desired (in 1.4s)
Endpoints updated: [10.244.1.18, 10.244.2.49, 10.244.3.102, ...]
Ingress controller load balanced across healthy pods.
Exit code: 0 [SUCCESS]`;
    } else if (cmd.includes("curl") || cmd.includes("statuspage")) {
      output = `[Statuspage Webhook API]
POST https://api.statuspage.io/v1/pages/main/incidents HTTP/1.1
HTTP/1.1 201 Created
Statuspage incident updated: "Identified - Database lock remediation deployed"
Subscribers notified: 1,842 engineers via SMS/Slack.
Exit code: 0 [SUCCESS]`;
    } else if (cmd.includes("redis-cli")) {
      output = `[Redis Sentinel CLI]
Executing Lua memory eviction script on redis-prod.internal:6379...
Evicted 182,900 expired keys. Reclaimed 8.4GB RAM.
Cluster memory usage dropped to 48.2%.
Exit code: 0 [SUCCESS]`;
    } else {
      output = `[CI/CD Execution Runner]
$ ${cmd}
Running in sandbox container runner [worker-node-04]...
Exit code 0: Command executed successfully in 1.14s.
Process output: OK`;
    }

    step.terminal_output = output;

    // Add to audit timeline
    this.addAuditEvent(incidentId, {
      actor: "Operator",
      action: `Executed Step #${step.id}`,
      details: `${step.task} (${cmd.slice(0, 60)}...)`,
      type: "runbook"
    });

    const allCompleted = inc.runbook_steps.every(s => s.completed);
    if (allCompleted) {
      inc.status = 'resolved';
      inc.resolved_at = new Date().toISOString();
      this.addAuditEvent(incidentId, {
        actor: "Autonomous AI Agent",
        action: "Incident Resolved",
        details: "All runbook containment and mitigation steps completed.",
        type: "system"
      });
    } else {
      inc.status = 'mitigating';
    }

    return { incident: inc, step, output };
  }

  public generatePostMortem(incidentId: string): PastIncident | null {
    const inc = this.getIncidentById(incidentId);
    if (!inc) return null;

    const createdTime = new Date(inc.created_at).getTime();
    const resolvedTime = inc.resolved_at ? new Date(inc.resolved_at).getTime() : Date.now();
    const durationMin = Math.max(5, Math.round((resolvedTime - createdTime) / (1000 * 60)));

    const existing = this.past_incidents.find(p => p.incident_id === inc.id);
    if (existing) return existing;

    const postMortem: PastIncident = {
      id: Date.now(),
      incident_id: inc.id,
      title: inc.title,
      severity: inc.severity,
      root_cause: inc.root_cause,
      resolution: inc.runbook_steps.map(s => s.task).join("; "),
      resolved_at: inc.resolved_at || new Date().toISOString(),
      duration_minutes: durationMin,
      commander: "Senior SRE On-Call",
      team: inc.owner_team,
      post_mortem_markdown: `# Post-Mortem: ${inc.id.toUpperCase()} - ${inc.title}

**Incident Commander**: Senior SRE On-Call  
**Owner Team**: ${inc.owner_team}  
**Severity**: ${inc.severity}  
**Incident Duration (MTTR)**: ${durationMin} minutes  
**Date**: ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}  

---

### 1. Executive Summary
During this incident, ${inc.affected_scope}
Telemetry correlation isolated the root cause: ${inc.root_cause}

### 2. Impact Blast Radius
- **Impacted Services**: ${inc.affected_scope}
- **Suppressed Noise Alerts**: ${inc.suppressed_alert_count} individual alert triggers correlated by AI.
- **Remediation Steps**: ${inc.runbook_steps.length} runbook procedures completed.

### 3. Timeline of Events
${(inc.audit_timeline || []).map(a => `- **${new Date(a.timestamp).toLocaleTimeString()}** [${a.actor}] ${a.action}: ${a.details || ''}`).join('\n')}

### 4. 5-Whys Root Cause Analysis
1. **Why was the user experience degraded?** Direct service timeouts and elevated latency.
2. **Why were requests timing out?** ${inc.root_cause}
3. **Why did this condition go unmitigated?** Sudden load surge and concurrent locking locks prevented normal cleanup.
4. **Why didn't automated scaling prevent exhaustion?** Horizontal pod autoscaler was gated by synchronous DB connection caps.
5. **Why was the DB connection pool ceiling reached?** Connection pools did not release deadlocked sockets with strict timeouts.

### 5. Preventative Action Items
- [x] Executed containment commands: ${inc.runbook_steps[0]?.task || 'Lock release'}
- [ ] Implement strict socket query timeout ceiling (max 3000ms) in service database client.
- [ ] Add Datadog synthetic canary alert for early connection pool warning threshold (>80%).
- [ ] Review horizontal pod autoscaler scaling step policy with ${inc.owner_team} team.`
    };

    this.past_incidents.unshift(postMortem);
    this.addAuditEvent(incidentId, {
      actor: "Autonomous AI Agent",
      action: "Post-Mortem Generated",
      details: "Comprehensive Google Docs incident report generated with MTTR and 5-Whys analysis.",
      type: "postmortem"
    });

    return postMortem;
  }

  public reset(): void {
    this.seed();
  }
}

export const db = new IncidentDatabase();
