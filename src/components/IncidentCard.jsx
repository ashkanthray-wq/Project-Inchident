import React from 'react';
import { Users, ArrowRight, Sparkles } from 'lucide-react';

export const IncidentCard = ({
  incident,
  isSelected = false,
  onSelect
}) => {
  if (!incident) return null;

  return (
    <article
      id={`card-incident-${incident.id}`}
      role="button"
      tabIndex={0}
      aria-label={`Incident ${incident.id}: ${incident.title}. Severity ${incident.severity}.`}
      onClick={onSelect}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect?.();
        }
      }}
      className={`cursor-pointer rounded-xl p-6 transition-all duration-200 border-2 ${
        isSelected
          ? 'border-rose-600 dark:border-rose-500 bg-white dark:bg-neutral-900 shadow-md ring-2 ring-rose-500/20'
          : 'border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:border-neutral-400 dark:hover:border-neutral-600'
      }`}
    >
      {/* Top Severity, Team & Historical Memory Badges */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="px-2.5 py-0.5 rounded text-xs font-bold bg-rose-600 text-white">
            {incident.severity}
          </span>

          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-medium bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 border border-neutral-300 dark:border-neutral-700">
            <Users className="w-3.5 h-3.5 text-neutral-500 dark:text-neutral-400" aria-hidden="true" />
            {incident.owner_team} Team
          </span>

          {/* Yellow Lucide-React Badge for Historical Context Memory */}
          {Boolean(incident.historical_match) && (
            <span
              id="badge-ai-memory-applied"
              role="status"
              className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-yellow-100 dark:bg-yellow-950/80 text-yellow-800 dark:text-yellow-300 border border-yellow-300 dark:border-yellow-700 shadow-xs"
            >
              <Sparkles className="w-3.5 h-3.5 text-yellow-600 dark:text-yellow-400" aria-hidden="true" />
              <span>✨ AI Memory Applied</span>
            </span>
          )}
        </div>

        <span className="text-xs text-neutral-500 dark:text-neutral-400">
          {incident.created_at ? new Date(incident.created_at).toLocaleTimeString() : 'Active'}
        </span>
      </div>

      {/* Incident Title */}
      <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-50 leading-snug">
        {incident.title}
      </h3>

      {/* Root Cause snippet */}
      <p className="text-sm text-neutral-700 dark:text-neutral-300 mt-3 leading-relaxed">
        {incident.root_cause}
      </p>

      {/* Suppression count & runbook link */}
      <div className="mt-5 pt-4 border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-between text-xs">
        <span className="text-emerald-700 dark:text-emerald-400 font-semibold">
          ✓ {incident.suppressed_alert_count} Alerts Suppressed
        </span>
        <span className="flex items-center gap-1 text-neutral-600 dark:text-neutral-300 font-medium">
          View Command Runbook
          <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
        </span>
      </div>
    </article>
  );
};

export default IncidentCard;
