import React from 'react';
import { Incident, TriageState } from '../types';
import { 
  Sparkles, 
  CheckCircle2, 
  AlertCircle
} from 'lucide-react';
import { IncidentCard } from './IncidentCard';

interface TriageCenterProps {
  triageState: TriageState;
  incident: Incident | null;
  onTriggerTriage: () => void;
  selectedIncidentId: string | null;
  onSelectIncident: (id: string) => void;
}

export const TriageCenter: React.FC<TriageCenterProps> = ({
  triageState,
  incident,
  onTriggerTriage,
  selectedIncidentId,
  onSelectIncident
}) => {
  const isTriaging = triageState === 'TRIAGING';

  return (
    <section 
      aria-labelledby="section-triage-heading" 
      className="flex flex-col h-full"
    >
      {/* Section Header with generous whitespace */}
      <div className="pb-5 mb-5 border-b border-neutral-200 dark:border-neutral-800 flex items-baseline justify-between">
        <div>
          <h2 
            id="section-triage-heading"
            className="text-base font-semibold text-neutral-900 dark:text-neutral-100 tracking-tight"
          >
            AI Incident Triage
          </h2>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
            Gemini semantic correlation & root-cause isolation
          </p>
        </div>
        <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
          {incident ? '1 Incident Triaged' : 'Ready'}
        </span>
      </div>

      {/* Prominent Action Button with high contrast & explicit accessible state */}
      <div className="mb-6">
        <button
          id="btn-run-ai-triage"
          type="button"
          onClick={onTriggerTriage}
          disabled={isTriaging || Boolean(incident)}
          aria-busy={isTriaging}
          aria-label={
            incident 
              ? 'Triage complete. View the correlated incident below.' 
              : isTriaging 
              ? 'Analyzing telemetry with Gemini. Please wait.' 
              : 'Run AI Incident Triage with Gemini'
          }
          className={`w-full py-4 px-5 rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2.5 focus-visible:outline-rose-600 ${
            incident
              ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400 border border-neutral-300 dark:border-neutral-700 cursor-not-allowed'
              : isTriaging
              ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-800 animate-pulse'
              : 'bg-rose-600 hover:bg-rose-700 text-white shadow-sm'
          }`}
        >
          {isTriaging ? (
            <>
              <Sparkles className="w-4 h-4 animate-spin" aria-hidden="true" />
              <span>Analyzing Alerts with Gemini...</span>
            </>
          ) : incident ? (
            <>
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
              <span>Incident Correlated & Active</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 text-rose-200" aria-hidden="true" />
              <span>Run AI Incident Triage</span>
            </>
          )}
        </button>
        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-2 text-center leading-relaxed">
          {incident 
            ? 'Root cause isolated. Alert fatigue noise suppressed.'
            : 'Gemini evaluates telemetry chaos, isolates root cause, and suppresses false positives.'}
        </p>
      </div>

      {/* Incident Result Display */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1">
        {isTriaging && (
          <div 
            role="status" 
            aria-live="polite"
            className="p-8 rounded-xl border border-rose-200 dark:border-rose-900 bg-rose-50/50 dark:bg-rose-950/30 text-center space-y-3"
          >
            <Sparkles className="w-6 h-6 animate-spin text-rose-600 dark:text-rose-400 mx-auto" aria-hidden="true" />
            <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
              Correlating Multi-Cloud Alerts...
            </h3>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 max-w-sm mx-auto">
              Evaluating latency spikes, connection pool limits, and support ticket queues.
            </p>
          </div>
        )}

        {!isTriaging && !incident && (
          <div className="py-16 text-center border border-dashed border-neutral-300 dark:border-neutral-800 rounded-xl p-8 space-y-2">
            <AlertCircle className="w-7 h-7 text-neutral-400 dark:text-neutral-600 mx-auto" aria-hidden="true" />
            <h3 className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">
              No Incident Currently Active
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 max-w-xs mx-auto">
              Trigger triage above to consolidate the stream into an actionable incident.
            </p>
          </div>
        )}

        {!isTriaging && incident && (
          <IncidentCard
            incident={incident}
            isSelected={selectedIncidentId === incident.id}
            onSelect={() => onSelectIncident(incident.id)}
          />
        )}
      </div>
    </section>
  );
};
