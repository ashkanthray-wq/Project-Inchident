import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { RawAlert, Incident, TriageState } from '../types';
import { NoiseStream } from '../components/NoiseStream';
import { 
  Radio, 
  ShieldAlert, 
  Sparkles, 
  ArrowRight, 
  Layers, 
  TrendingDown, 
  CheckCircle2, 
  Clock, 
  Flame, 
  Cpu
} from 'lucide-react';

interface DashboardPageProps {
  alerts: RawAlert[];
  onAlertsUpdated: (alerts: RawAlert[]) => void;
  incident: Incident | null;
  triageState: TriageState;
  onTriggerTriage: () => Promise<Incident | null>;
  allIncidentsCount: number;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  alerts,
  onAlertsUpdated,
  incident,
  triageState,
  onTriggerTriage,
  allIncidentsCount
}) => {
  const navigate = useNavigate();

  const isTriaging = triageState === 'TRIAGING';
  const suppressedCount = incident ? incident.suppressed_alert_count : Math.max(0, alerts.length - 1);
  const reductionRate = alerts.length > 0 ? Math.round((suppressedCount / alerts.length) * 100) : 0;

  const handleTriageAndNavigate = async () => {
    const triaged = await onTriggerTriage();
    if (triaged && triaged.id) {
      navigate(`/incidents/${triaged.id}`);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* High-Level Metrics Strip */}
      <section aria-labelledby="metrics-summary-heading">
        <h2 id="metrics-summary-heading" className="sr-only">High-Level Operations Metrics</h2>
        
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {/* Metric 1: Ingested Telemetry Alerts */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xs">
            <div className="flex items-center justify-between text-neutral-500 dark:text-neutral-400">
              <span className="text-xs font-semibold uppercase tracking-wider">Raw Ingested Alerts</span>
              <Radio className="w-4 h-4 text-rose-500 animate-pulse" aria-hidden="true" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-extrabold text-neutral-900 dark:text-neutral-50 font-mono">
                {alerts.length}
              </span>
              <span className="text-xs text-rose-600 dark:text-rose-400 font-semibold">Active Stream</span>
            </div>
            <p className="mt-1 text-[11px] text-neutral-500 dark:text-neutral-400">
              Datadog, CloudWatch, Zendesk
            </p>
          </div>

          {/* Metric 2: Noise Reduction Ratio */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xs">
            <div className="flex items-center justify-between text-neutral-500 dark:text-neutral-400">
              <span className="text-xs font-semibold uppercase tracking-wider">Noise Suppression</span>
              <TrendingDown className="w-4 h-4 text-emerald-500" aria-hidden="true" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-extrabold text-neutral-900 dark:text-neutral-50 font-mono">
                {reductionRate > 0 ? `${reductionRate}%` : '87.5%'}
              </span>
              <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">Correlated</span>
            </div>
            <p className="mt-1 text-[11px] text-neutral-500 dark:text-neutral-400">
              Filtered duplicate symptoms
            </p>
          </div>

          {/* Metric 3: AI Correlation Engine Latency */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xs">
            <div className="flex items-center justify-between text-neutral-500 dark:text-neutral-400">
              <span className="text-xs font-semibold uppercase tracking-wider">Triage Latency</span>
              <Cpu className="w-4 h-4 text-amber-500" aria-hidden="true" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-extrabold text-neutral-900 dark:text-neutral-50 font-mono">
                1.1s
              </span>
              <span className="text-xs text-amber-600 dark:text-amber-400 font-semibold">Gemini Flash</span>
            </div>
            <p className="mt-1 text-[11px] text-neutral-500 dark:text-neutral-400">
              Native Postgres memory search
            </p>
          </div>

          {/* Metric 4: Active Incidents */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xs">
            <div className="flex items-center justify-between text-neutral-500 dark:text-neutral-400">
              <span className="text-xs font-semibold uppercase tracking-wider">Grouped Incidents</span>
              <Layers className="w-4 h-4 text-blue-500" aria-hidden="true" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-extrabold text-neutral-900 dark:text-neutral-50 font-mono">
                {allIncidentsCount}
              </span>
              <Link
                to="/incidents"
                className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-semibold flex items-center gap-0.5"
              >
                Kanban View &rarr;
              </Link>
            </div>
            <p className="mt-1 text-[11px] text-neutral-500 dark:text-neutral-400">
              Prioritized by severity
            </p>
          </div>
        </div>
      </section>

      {/* Main Dashboard Layout: Scrolling Noise Stream (Left) + AI Correlation Engine (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: The scrolling 'Noise Stream' */}
        <div className="lg:col-span-7 h-[680px]">
          <NoiseStream
            initialAlerts={alerts}
            isSuppressed={triageState !== 'IDLE'}
            onAlertsUpdated={onAlertsUpdated}
          />
        </div>

        {/* Right Column: AI Triage Engine & Quick Action Banner */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* AI Triage Card */}
          <div className="p-6 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
                  <Sparkles className="w-5 h-5" aria-hidden="true" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                    Gemini AI Incident Triage
                  </h3>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">
                    Deduplicate noise & generate agentic remediation
                  </p>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300">
                gemini-2.5-flash
              </span>
            </div>

            <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
              Synthesizes real-time logs, CPU spikes, and user-facing Zendesk tickets into a single correlated root cause with executable runbook shell commands.
            </p>

            <div className="pt-2">
              <button
                type="button"
                id="btn-dashboard-trigger-triage"
                onClick={handleTriageAndNavigate}
                disabled={isTriaging}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-neutral-900 font-semibold text-sm shadow-md transition-all active:scale-[0.99] disabled:opacity-50"
              >
                {isTriaging ? (
                  <>
                    <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    <span>Correlating Telemetry & Searching Memory...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-amber-400 fill-amber-400" />
                    <span>Correlate & Open Incident Deep Dive</span>
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Active / Current Incident Preview Card (if one exists) */}
          {incident && (
            <div className="p-6 rounded-2xl bg-neutral-50 dark:bg-neutral-900/60 border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded text-xs font-bold bg-rose-600 text-white">
                    {incident.severity}
                  </span>
                  <span className="font-mono text-xs text-neutral-500 dark:text-neutral-400">
                    {incident.id}
                  </span>
                </div>
                <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                  ✓ {incident.suppressed_alert_count} Alerts Suppressed
                </span>
              </div>

              <div>
                <h4 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                  {incident.title}
                </h4>
                <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1 line-clamp-2">
                  {incident.root_cause}
                </p>
              </div>

              <div className="pt-2 flex items-center justify-between">
                <span className="text-xs text-neutral-500 dark:text-neutral-400 font-mono">
                  Owner: {incident.owner_team} Team
                </span>
                <Link
                  to={`/incidents/${incident.id}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-700 text-xs font-semibold text-neutral-900 dark:text-neutral-100 border border-neutral-300 dark:border-neutral-700 shadow-xs"
                >
                  <span>Open Deep Dive</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          )}

          {/* Direct Link to Kanban Board */}
          <div className="p-5 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 flex items-center justify-between">
            <div>
              <h4 className="text-xs font-bold text-neutral-900 dark:text-neutral-100 uppercase tracking-wider">
                Active Incidents Board
              </h4>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                Kanban view organized by triage and resolution status
              </p>
            </div>
            <Link
              to="/incidents"
              className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
            >
              <span>View Kanban</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

        </div>

      </div>
    </div>
  );
};
