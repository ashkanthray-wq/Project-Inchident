import { RawAlert } from '../src/types';

export const SCENARIOS: Record<string, RawAlert[]> = {
  checkout_failure: [
    {
      id: "ALT-CF-101",
      source: "AWS CloudWatch",
      severity_hint: "CRITICAL",
      timestamp: new Date(Date.now() - 340000).toISOString(),
      message: "RDS Postgres Primary (prod-db-01): CPU utilization 99.4% for > 5m.",
      metadata: { host: "prod-db-01", threshold: "85%" }
    },
    {
      id: "ALT-CF-102",
      source: "Datadog",
      severity_hint: "CRITICAL",
      timestamp: new Date(Date.now() - 310000).toISOString(),
      message: "API Latency spike on endpoint /v1/checkout: p99 latency > 4200ms.",
      metadata: { endpoint: "/v1/checkout", latency: "4200ms" }
    },
    {
      id: "ALT-CF-103",
      source: "Datadog",
      severity_hint: "WARNING",
      timestamp: new Date(Date.now() - 280000).toISOString(),
      message: "Database connection pool exhaustion: Active connections 498/500.",
      metadata: { pool_id: "checkout-service" }
    },
    {
      id: "ALT-CF-104",
      source: "Zendesk",
      severity_hint: "CRITICAL",
      timestamp: new Date(Date.now() - 230000).toISOString(),
      message: "Ticket #8942: Multiple customers unable to complete payment. Gateway timeout 504.",
      metadata: { reporter_count: 14 }
    },
    {
      id: "ALT-CF-105",
      source: "Zendesk",
      severity_hint: "WARNING",
      timestamp: new Date(Date.now() - 190000).toISOString(),
      message: "Ticket #8945: Duplicate payment deducted, order marked pending.",
      metadata: { reporter_count: 6 }
    },
    {
      id: "ALT-CF-106",
      source: "PagerDuty",
      severity_hint: "CRITICAL",
      timestamp: new Date(Date.now() - 150000).toISOString(),
      message: "Incident #441: High Error Rate (>12%) on Checkout Microservice.",
      metadata: { service: "checkout-api" }
    },
    {
      id: "ALT-CF-107",
      source: "AWS CloudWatch",
      severity_hint: "WARNING",
      timestamp: new Date(Date.now() - 110000).toISOString(),
      message: "ReadReplica lag on prod-db-02 exceeding 180 seconds.",
      metadata: { host: "prod-db-02" }
    },
    {
      id: "ALT-CF-108",
      source: "Zendesk",
      severity_hint: "INFO",
      timestamp: new Date(Date.now() - 60000).toISOString(),
      message: "Ticket #8950: Support queue volume surge (+140% vs baseline).",
      metadata: { queue: "Billing" }
    }
  ],
  auth_outage: [
    {
      id: "ALT-AO-201",
      source: "Datadog",
      severity_hint: "CRITICAL",
      timestamp: new Date(Date.now() - 320000).toISOString(),
      message: "Auth0/OAuth Token Exchange failure rate: 48.7% HTTP 500 responses.",
      metadata: { service: "auth-gateway", error_rate: "48.7%" }
    },
    {
      id: "ALT-AO-202",
      source: "AWS CloudWatch",
      severity_hint: "CRITICAL",
      timestamp: new Date(Date.now() - 290000).toISOString(),
      message: "Redis Cluster (auth-session-cache): OOM killed node redis-auth-03.",
      metadata: { node: "redis-auth-03", state: "OOM_KILLED" }
    },
    {
      id: "ALT-AO-203",
      source: "PagerDuty",
      severity_hint: "CRITICAL",
      timestamp: new Date(Date.now() - 260000).toISOString(),
      message: "Incident #512: P0 User Authentication Gateway Down globally.",
      metadata: { pager_team: "identity-sre" }
    },
    {
      id: "ALT-AO-204",
      source: "Zendesk",
      severity_hint: "CRITICAL",
      timestamp: new Date(Date.now() - 220000).toISOString(),
      message: "Ticket #9104: All enterprise SSO users redirected to infinite OAuth login loop.",
      metadata: { impacted_tenants: 24 }
    },
    {
      id: "ALT-AO-205",
      source: "Datadog",
      severity_hint: "WARNING",
      timestamp: new Date(Date.now() - 170000).toISOString(),
      message: "JWT Verification Cache Miss rate reached 99.2% on api-gateway.",
      metadata: { cache_hit_ratio: "0.8%" }
    },
    {
      id: "ALT-AO-206",
      source: "AWS CloudWatch",
      severity_hint: "WARNING",
      timestamp: new Date(Date.now() - 130000).toISOString(),
      message: "ALB 5xx Target Response Time exceeded 5000ms on /oauth/token.",
      metadata: { alb: "ingress-auth-alb" }
    },
    {
      id: "ALT-AO-207",
      source: "Zendesk",
      severity_hint: "WARNING",
      timestamp: new Date(Date.now() - 90000).toISOString(),
      message: "Ticket #9110: Mobile app displaying 'Invalid Session' error for all iOS clients.",
      metadata: { client: "iOS-v4.8" }
    },
    {
      id: "ALT-AO-208",
      source: "PagerDuty",
      severity_hint: "INFO",
      timestamp: new Date(Date.now() - 40000).toISOString(),
      message: "Secondary Identity Provider fallback rate throttled by rate-limiting.",
      metadata: { fallback_status: "THROTTLED" }
    }
  ],
  memory_leak: [
    {
      id: "ALT-ML-301",
      source: "Datadog",
      severity_hint: "CRITICAL",
      timestamp: new Date(Date.now() - 350000).toISOString(),
      message: "Node.js Heap Memory allocation at 98.6% (1.97GB/2GB max_old_space).",
      metadata: { process: "feed-rendering-service", pid: 4821 }
    },
    {
      id: "ALT-ML-302",
      source: "AWS CloudWatch",
      severity_hint: "CRITICAL",
      timestamp: new Date(Date.now() - 300000).toISOString(),
      message: "ECS Task CrashLoopBackOff: 6 of 8 container tasks killed by OOM killer.",
      metadata: { cluster: "prod-services-ecs", service: "feed-worker" }
    },
    {
      id: "ALT-ML-303",
      source: "PagerDuty",
      severity_hint: "CRITICAL",
      timestamp: new Date(Date.now() - 250000).toISOString(),
      message: "Incident #603: Event Loop Latency exceeding 4800ms across cluster.",
      metadata: { lag_ms: 4820 }
    },
    {
      id: "ALT-ML-304",
      source: "Datadog",
      severity_hint: "WARNING",
      timestamp: new Date(Date.now() - 210000).toISOString(),
      message: "V8 Garbage Collector time spending 84% of CPU cycles in Mark-Sweep-Compact.",
      metadata: { gc_pause_ms: 1240 }
    },
    {
      id: "ALT-ML-305",
      source: "Zendesk",
      severity_hint: "CRITICAL",
      timestamp: new Date(Date.now() - 170000).toISOString(),
      message: "Ticket #9250: Web dashboard freezing on load with white screen of death.",
      metadata: { affected_ui: "main-dashboard" }
    },
    {
      id: "ALT-ML-306",
      source: "AWS CloudWatch",
      severity_hint: "WARNING",
      timestamp: new Date(Date.now() - 120000).toISOString(),
      message: "AutoScalingGroup max capacity reached (20/20 instances) due to memory thrashing.",
      metadata: { asg: "feed-worker-asg" }
    },
    {
      id: "ALT-ML-307",
      source: "Zendesk",
      severity_hint: "WARNING",
      timestamp: new Date(Date.now() - 80000).toISOString(),
      message: "Ticket #9258: Export reports taking >10 minutes before terminating with 502 Bad Gateway.",
      metadata: { feature: "reporting" }
    },
    {
      id: "ALT-ML-308",
      source: "PagerDuty",
      severity_hint: "INFO",
      timestamp: new Date(Date.now() - 30000).toISOString(),
      message: "Heap dump snapshot initiated and uploaded to s3://ops-diagnostics/dumps.",
      metadata: { s3_uri: "s3://ops-diagnostics/dumps/heap-dump-4821.heapsnapshot" }
    }
  ]
};
