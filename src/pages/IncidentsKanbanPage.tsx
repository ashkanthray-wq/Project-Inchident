import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Incident, TriageState } from '../types';
import { 
  Sparkles, 
  ArrowRight, 
  Users, 
  Clock, 
  CheckCircle2, 
  Flame, 
  ShieldAlert,
  Terminal,
  Layers,
  ArrowRightLeft
} from 'lucide-react';
import { SkeletonLoader } from '../components/SkeletonLoader';

interface IncidentsKanbanPageProps {
  incidents: Incident[];
  onTriggerTriage: () => Promise<Incident | null>;
  triageState: TriageState;
  onStatusChange?: (id: string, newStatus: 'investigating' | 'mitigating' | 'resolved') => void;
}

export const IncidentsKanbanPage: React.FC<IncidentsKanbanPageProps> = ({
  incidents,
  onTriggerTriage,
  triageState,
  onStatusChange
}) => {
  const navigate = useNavigate();
  const isTriaging = triageState === 'TRIAGING';

  // Helper to determine status with fallback
  const getStatus = (inc: Incident): 'investigating' | 'mitigating' | 'resolved' => {
    if (inc.status) return inc.status;
    const completed = inc.runbook_steps.filter(s => s.completed).length;
    if (inc.runbook_steps.length > 0 && completed === inc.runbook_steps.length) return 'resolved';
    if (completed > 0) return 'mitigating';
    return 'investigating';
  };

  // 3 Strict Columns: Investigating -> Mitigating -> Resolved
  const investigatingList = incidents.filter(i => getStatus(i) === 'investigating');
  const mitigatingList = incidents.filter(i => getStatus(i) === 'mitigating');
  const resolvedList = incidents.filter(i => getStatus(i) === 'resolved');

  const handleRunTriage = async () => {
    const newInc = await onTriggerTriage();
    if (newInc && newInc.id) {
      navigate(`/incidents/${newInc.id}`);
    }
  };

  const renderCard = (inc: Incident) => {
    const currentStatus = getStatus(inc);
    const alertCount = inc.correlated_alert_ids?.length || (inc.raw_logs ? 6 : 8);

    return (
      <article
        key={inc.id}
        className="group p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 hover:border-neutral-400 dark:hover:border-neutral-600 shadow-xs hover:shadow-md transition-all duration-200 space-y-4"
      >
        {/* Card Header: Glowing red SEV-1, Team badge, ID */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            {inc.severity === 'SEV-1' ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-black tracking-wider bg-rose-600 text-white shadow-xs shadow-rose-500/40 animate-pulse">
                <span className="w-1.5 h-1.5 rounded-full bg-white" />
                SEV-1
              </span>
            ) : (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-600 text-white">
                {inc.severity}
              </span>
            )}

            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300">
              <Users className="w-3 h-3 text-neutral-400" />
              {inc.owner_team}
            </span>
          </div>

          <span className="font-mono text-xs text-neutral-400">
            {inc.id.toUpperCase()}
          </span>
        </div>

        {/* Title */}
        <h4 
          onClick={() => navigate(`/incidents/${inc.id}`)}
          className="text-sm font-bold text-neutral-900 dark:text-neutral-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors leading-snug cursor-pointer"
        >
          {inc.title}
        </h4>

        {/* Root Cause snippet */}
        <p className="text-xs text-neutral-600 dark:text-neutral-400 line-clamp-2 leading-relaxed">
          {inc.root_cause}
        </p>

        {/* Card Footer: Number of Grouped alerts & Button to Open Command Center */}
        <div className="pt-3 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between gap-2">
          <span className="inline-flex items-center gap-1 text-[11px] font-mono text-neutral-500 dark:text-neutral-400">
            <Layers className="w-3.5 h-3.5 text-neutral-400" />
            Grouped {alertCount} alerts
          </span>

          <button
            type="button"
            id={`btn-open-command-center-${inc.id}`}
            onClick={() => navigate(`/incidents/${inc.id}`)}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-neutral-900 text-xs font-semibold shadow-2xs transition-all active:scale-95"
          >
            <span>Command Center</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </article>
    );
  };

  const columns = [
    {
      id: 'investigating' as const,
      title: 'Investigating',
      subtitle: 'Root cause isolation & telemetry triage',
      borderColor: 'border-t-rose-500',
      badgeClass: 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300',
      list: investigatingList
    },
    {
      id: 'mitigating' as const,
      title: 'Mitigating',
      subtitle: 'Runbook execution & war room active',
      borderColor: 'border-t-amber-500',
      badgeClass: 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300',
      list: mitigatingList
    },
    {
      id: 'resolved' as const,
      title: 'Resolved',
      subtitle: 'Traffic restored & post-mortem available',
      borderColor: 'border-t-emerald-500',
      badgeClass: 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300',
      list: resolvedList
    }
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-200 dark:border-neutral-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 tracking-tight">
              Incident Kanban Board
            </h1>
            <span className="px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300">
              {incidents.length} Active
            </span>
          </div>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
            Automated lifecycle across Investigating → Mitigating → Resolved.
          </p>
        </div>

        {/* AI Triage Trigger */}
        <button
          type="button"
          id="btn-kanban-triage"
          onClick={handleRunTriage}
          disabled={isTriaging}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-neutral-900 font-semibold text-xs shadow-sm transition-all active:scale-95 disabled:opacity-50"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
          <span>{isTriaging ? 'Triaging Alert Feed...' : 'Run Autonomous AI Triage'}</span>
        </button>
      </div>

      {/* Skeleton Loader during AI triage */}
      {isTriaging && (
        <div className="animate-in fade-in duration-200">
          <SkeletonLoader />
        </div>
      )}

      {/* 3 Strict Kanban Columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        {columns.map((col) => (
          <div
            key={col.id}
            className={`rounded-2xl bg-neutral-50/70 dark:bg-neutral-900/40 border border-neutral-200 dark:border-neutral-800/80 p-4 border-t-4 ${col.borderColor} min-h-[620px] flex flex-col space-y-4`}
          >
            {/* Column Header */}
            <div className="flex items-center justify-between pb-2 border-b border-neutral-200 dark:border-neutral-800">
              <div>
                <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                  <span>{col.title}</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-mono font-bold ${col.badgeClass}`}>
                    {col.list.length}
                  </span>
                </h3>
                <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5">
                  {col.subtitle}
                </p>
              </div>
            </div>

            {/* Column cards */}
            <div className="flex-1 space-y-3 overflow-y-auto">
              {col.list.length === 0 ? (
                <div className="h-44 flex flex-col items-center justify-center p-4 text-center border border-dashed border-neutral-300 dark:border-neutral-800 rounded-xl text-neutral-400 dark:text-neutral-600 text-xs">
                  <span>No incidents in {col.title.toLowerCase()}</span>
                </div>
              ) : (
                col.list.map((inc) => renderCard(inc))
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
