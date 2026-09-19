export interface RawAlert {
  id: string;
  source: 'AWS CloudWatch' | 'Datadog' | 'Zendesk' | 'PagerDuty' | 'GitHub' | string;
  severity_hint: 'CRITICAL' | 'WARNING' | 'INFO';
  timestamp: string;
  message: string;
  metadata: Record<string, unknown>;
}

export interface RunbookStep {
  id: number;
  task: string;
  executable_command?: string;
  type: 'containment' | 'mitigation' | 'communication';
  completed: boolean;
  terminal_output?: string;
  executed_at?: string;
  target_service?: string;
}

export type IncidentStatus = 'investigating' | 'mitigating' | 'resolved';

export interface AuditTimelineEvent {
  id: string;
  incident_id: string;
  timestamp: string;
  actor: string;
  action: string;
  details?: string;
  type: 'system' | 'audio' | 'slack' | 'meet' | 'runbook' | 'manual' | 'postmortem';
}

export interface Incident {
  id: string;
  title: string;
  severity: 'SEV-1' | 'SEV-2' | 'SEV-3';
  status?: IncidentStatus;
  root_cause: string;
  affected_scope: string;
  owner_team: 'Infrastructure' | 'Database' | 'Payments' | 'Frontend' | string;
  suppressed_alert_count: number;
  runbook_steps: RunbookStep[];
  historical_match?: boolean;
  created_at: string;
  resolved_at?: string;
  slack_channel?: string;
  meet_link?: string;
  audit_timeline?: AuditTimelineEvent[];
  correlated_alert_ids?: string[];
  raw_logs?: string[];
}

export interface PastIncident {
  id: number;
  incident_id?: string;
  title: string;
  severity?: 'SEV-1' | 'SEV-2' | 'SEV-3';
  root_cause?: string;
  root_cause_summary?: string;
  resolution: string;
  resolved_at?: string;
  resolved_date?: string;
  duration_minutes?: number;
  mttr_minutes?: number;
  commander?: string;
  team?: string;
  post_mortem_markdown?: string;
}

export interface PostMortemDoc {
  id: string;
  incident_id: string;
  title: string;
  severity: string;
  created_at: string;
  resolved_at: string;
  mttr_minutes: number;
  commander: string;
  executive_summary: string;
  root_cause: string;
  impacted_scope: string;
  timeline: { time: string; event: string; actor: string }[];
  action_items: { id: string; description: string; owner: string; status: string }[];
  google_docs_url?: string;
  markdown: string;
}

export interface IntegrationConfig {
  id: 'aws' | 'datadog' | 'github' | 'pagerduty' | 'google_workspace';
  name: string;
  category: string;
  description: string;
  connected: boolean;
  apiKeyMasked?: string;
  endpoint?: string;
  connectedAt?: string;
  iconType: string;
  fields: {
    id: string;
    label: string;
    type: 'text' | 'password';
    placeholder: string;
    value?: string;
  }[];
}

export type TriageState = 'IDLE' | 'TRIAGING' | 'RESOLVING' | 'MITIGATED';

