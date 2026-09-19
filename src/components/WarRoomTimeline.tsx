import React, { useState } from 'react';
import { Incident, AuditTimelineEvent } from '../types';
import { 
  AlertTriangle, 
  Sparkles, 
  Bell, 
  Terminal, 
  CheckCircle2, 
  Clock,
  MessageSquare,
  Send,
  User,
  ShieldAlert
} from 'lucide-react';

interface WarRoomTimelineProps {
  incident: Incident;
  onAddAuditNote?: (note: string) => void;
}

export const WarRoomTimeline: React.FC<WarRoomTimelineProps> = ({ 
  incident,
  onAddAuditNote
}) => {
  const [noteText, setNoteText] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const baseTime = incident.created_at ? new Date(incident.created_at).getTime() : Date.now();
  const formatOffset = (minsAgo: number) => {
    return new Date(baseTime + minsAgo * 60000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  const completedSteps = incident.runbook_steps.filter(s => s.completed);

  // Default synthetic events
  const defaultEvents = [
    {
      id: 'e-1',
      time: formatOffset(-4),
      title: 'Alert Ingestion & Correlation Triggered',
      description: `Correlated ${incident.suppressed_alert_count + 1} telemetry events from Datadog and AWS CloudWatch.`,
      actor: 'AI Ops Agent',
      type: 'system'
    },
    {
      id: 'e-2',
      time: formatOffset(-2),
      title: 'Root Cause Isolated & Triaged',
      description: `${incident.title} matched heuristics. SEV-1 assigned.`,
      actor: 'Gemini Flash AI',
      type: 'ai'
    },
    {
      id: 'e-3',
      time: formatOffset(-1),
      title: 'War Room Escalated',
      description: `Escalated to ${incident.owner_team} on-call rotation.`,
      actor: 'PagerDuty Webhook',
      type: 'system'
    },
    ...completedSteps.map((step, idx) => ({
      id: `step-${step.id}`,
      time: formatOffset(1 + idx * 2),
      title: `Step ${step.id} Executed (${step.type})`,
      description: `${step.task} — verified exit 0.`,
      actor: 'Alex Mercer (Staff SRE)',
      type: 'command'
    })),
    ...(incident.audit_timeline || []).map(aud => ({
      id: aud.id,
      time: new Date(aud.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      title: aud.action,
      description: aud.details,
      actor: aud.actor,
      type: aud.type
    }))
  ];

  const handleSendNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteText.trim()) return;
    setIsSubmitting(true);
    try {
      if (onAddAuditNote) {
        onAddAuditNote(noteText.trim());
      }
      setNoteText('');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div 
      id="living-audit-trail-card"
      className="h-full flex flex-col p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm"
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-neutral-100 dark:border-neutral-800 shrink-0">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-neutral-500 dark:text-neutral-400" />
          <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
            The Living Audit Trail
          </h3>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400">
          CHRONOLOGICAL
        </span>
      </div>

      {/* Chronological Event Stream (30% pane scrolling independently) */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1 relative pl-5 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-neutral-200 dark:before:bg-neutral-800">
        {defaultEvents.map((evt) => (
          <div key={evt.id} className="relative group text-xs">
            {/* Dot node */}
            <div className="absolute -left-5 top-1 w-2.5 h-2.5 rounded-full bg-neutral-900 dark:bg-neutral-100 ring-4 ring-white dark:ring-neutral-900" />

            <div className="flex items-center justify-between gap-2">
              <span className="font-mono text-[11px] text-neutral-400 font-medium">
                {evt.time}
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400">
                {evt.actor}
              </span>
            </div>

            <p className="font-bold text-neutral-900 dark:text-neutral-100 mt-1 leading-snug">
              {evt.title}
            </p>

            <p className="text-neutral-600 dark:text-neutral-400 mt-0.5 leading-relaxed break-words">
              {evt.description}
            </p>
          </div>
        ))}
      </div>

      {/* Quick Audit Note Dispatch Bar */}
      <form onSubmit={handleSendNote} className="mt-4 pt-3 border-t border-neutral-100 dark:border-neutral-800 flex items-center gap-2 shrink-0">
        <input
          type="text"
          value={noteText}
          onChange={(e) => setNoteText(e.target.value)}
          placeholder="Append live note to audit trail..."
          className="flex-1 px-3 py-1.5 rounded-xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 text-xs text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 outline-none focus:border-blue-500"
        />
        <button
          type="submit"
          disabled={!noteText.trim() || isSubmitting}
          className="p-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-neutral-900 disabled:opacity-40 transition-colors"
          title="Send audit note"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
};
