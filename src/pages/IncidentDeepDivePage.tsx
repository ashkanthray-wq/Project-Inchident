import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Incident, PostMortemDoc } from '../types';
import { WarRoomActions } from '../components/WarRoomActions';
import { WarRoomTimeline } from '../components/WarRoomTimeline';
import { CommandCenter } from '../components/CommandCenter';
import { AudioWaveformVisualizer } from '../components/AudioWaveformVisualizer';
import { PostMortemModal } from '../components/PostMortemModal';
import { 
  ArrowLeft, 
  Sparkles, 
  Users, 
  Clock, 
  ShieldAlert, 
  AlertTriangle,
  Flame,
  CheckCircle2,
  Share2,
  FileText,
  ExternalLink,
  Layers,
  Video,
  MessageSquare
} from 'lucide-react';

interface IncidentDeepDivePageProps {
  incidents: Incident[];
  onToggleStep: (stepId: number, completed: boolean, targetIncidentId?: string) => void;
  isUpdatingStep: boolean;
  onRefreshIncidents: () => void;
}

export const IncidentDeepDivePage: React.FC<IncidentDeepDivePageProps> = ({
  incidents,
  onToggleStep,
  isUpdatingStep,
  onRefreshIncidents
}) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [incident, setIncident] = useState<Incident | null>(() => {
    return incidents.find(i => i.id === id) || null;
  });
  const [isLoading, setIsLoading] = useState<boolean>(!incident);
  const [isGeneratingPostMortem, setIsGeneratingPostMortem] = useState<boolean>(false);
  const [postMortemDoc, setPostMortemDoc] = useState<PostMortemDoc | null>(null);
  const [isPostMortemModalOpen, setIsPostMortemModalOpen] = useState<boolean>(false);

  useEffect(() => {
    const found = incidents.find(i => i.id === id);
    if (found) {
      setIncident(found);
      setIsLoading(false);
    } else if (id) {
      fetch(`/api/incidents/${id}`)
        .then(res => {
          if (!res.ok) throw new Error('Not found');
          return res.json();
        })
        .then(data => {
          setIncident(data);
          setIsLoading(false);
        })
        .catch(err => {
          console.warn('Incident deep dive load error:', err.message);
          setIsLoading(false);
        });
    }
  }, [id, incidents]);

  const handleAddAuditNote = async (note: string) => {
    if (!incident) return;
    try {
      const res = await fetch(`/api/incidents/${incident.id}/audit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          actor: 'Alex Mercer (Staff SRE)',
          action: 'Operator Note',
          details: note,
          type: 'manual'
        })
      });
      if (res.ok) {
        onRefreshIncidents();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleGeneratePostMortem = async () => {
    if (!incident) return;
    setIsGeneratingPostMortem(true);
    try {
      const res = await fetch(`/api/incidents/${incident.id}/post-mortem`, {
        method: 'POST'
      });
      if (res.ok) {
        const data = await res.json();
        setPostMortemDoc(data.postMortem);
        setIsPostMortemModalOpen(true);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsGeneratingPostMortem(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-3">
        <div className="w-8 h-8 border-3 border-neutral-300 border-t-blue-600 rounded-full animate-spin" />
        <p className="text-xs text-neutral-500 dark:text-neutral-400 font-mono">
          Loading command center telemetry...
        </p>
      </div>
    );
  }

  if (!incident) {
    return (
      <div className="p-8 text-center space-y-4 max-w-md mx-auto">
        <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto" />
        <h2 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">Incident Not Found</h2>
        <p className="text-xs text-neutral-500 dark:text-neutral-400">
          The requested incident does not exist in the active database.
        </p>
        <Link
          to="/incidents"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 text-xs font-semibold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Active Incidents</span>
        </Link>
      </div>
    );
  }

  const completedSteps = incident.runbook_steps.filter(s => s.completed).length;
  const isAllStepsCompleted = incident.runbook_steps.length > 0 && completedSteps === incident.runbook_steps.length;
  const isResolved = isAllStepsCompleted || incident.status === 'resolved';

  return (
    <div className="space-y-6 animate-in fade-in duration-200 pb-20">
      {/* Top Breadcrumb Navigation */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <Link
            to="/incidents"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:bg-neutral-50 text-xs font-semibold text-neutral-700 dark:text-neutral-300 transition-colors shadow-2xs"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Incidents Kanban</span>
          </Link>
          <span className="text-neutral-300 dark:text-neutral-700">/</span>
          <span className="font-mono text-xs font-bold text-neutral-500">
            {incident.id.toUpperCase()}
          </span>
        </div>

        {/* Live Severity Badge */}
        <div className="flex items-center gap-2">
          {incident.severity === 'SEV-1' ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-rose-600 text-white shadow-sm shadow-rose-500/30 animate-pulse">
              <span className="w-1.5 h-1.5 rounded-full bg-white" />
              SEV-1 CRITICAL
            </span>
          ) : (
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-600 text-white">
              {incident.severity}
            </span>
          )}
        </div>
      </div>

      {/* THE 'SITREP' ZONE (HEADER) */}
      <div 
        id="sitrep-zone-header"
        className="p-6 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-5"
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-[11px] font-mono text-neutral-500 dark:text-neutral-400">
              <span>CREATED {incident.created_at ? new Date(incident.created_at).toLocaleTimeString() : 'RECENTLY'}</span>
              <span>•</span>
              <span className="text-neutral-800 dark:text-neutral-200 font-semibold">{incident.owner_team} TEAM</span>
              <span>•</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                {incident.suppressed_alert_count} ALERTS SUPPRESSED
              </span>
            </div>

            {/* Massive Clear Title */}
            <h1 className="text-2xl sm:text-3xl font-black text-neutral-900 dark:text-neutral-100 tracking-tight leading-tight">
              {incident.title}
            </h1>
          </div>

          {/* ElevenLabs AI Audio Briefing button & visualizer */}
          <div className="shrink-0 flex items-center gap-3 flex-wrap">
            <AudioWaveformVisualizer
              incidentId={incident.id}
              incidentTitle={incident.title}
              rootCause={incident.root_cause}
              severity={incident.severity}
              team={incident.owner_team}
            />
          </div>
        </div>

        {/* Action Row: Slack Channel & Google Meet War Room */}
        <div className="pt-4 border-t border-neutral-100 dark:border-neutral-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <a
              href={`https://slack.com/app_redirect?channel=incident-${incident.id.toLowerCase()}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 text-xs font-semibold transition-colors"
            >
              <MessageSquare className="w-3.5 h-3.5 text-purple-500" />
              <span>#incident-{incident.id.toLowerCase()} (Slack)</span>
            </a>

            <a
              href="https://meet.google.com/new"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 text-xs font-semibold transition-colors"
            >
              <Video className="w-3.5 h-3.5 text-blue-500" />
              <span>Join Google Meet War Room</span>
            </a>
          </div>

          {/* Incident Status Pill */}
          <div className="flex items-center gap-2">
            {isResolved ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                STATUS: RESOLVED
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                <Flame className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                STATUS: MITIGATING
              </span>
            )}
          </div>
        </div>
      </div>

      {/* SPLIT-PANE MASTER-DETAIL VIEW (70% Left / 30% Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT PANE (70% - THE ACTION CANVAS) */}
        <div className="lg:col-span-8 space-y-6">
          {/* The 'Why': Root Cause Isolated Blockquote */}
          <div className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-2">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500 block">
              The 'Why' • Isolated Root Cause
            </span>
            <blockquote className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-950 border-l-4 border-rose-500 text-neutral-800 dark:text-neutral-200 text-xs font-medium leading-relaxed">
              "{incident.root_cause}"
            </blockquote>
            <p className="text-[11px] text-neutral-500 dark:text-neutral-400 pl-1">
              Impacted Customer Surface: <span className="font-semibold text-neutral-700 dark:text-neutral-300">{incident.affected_scope}</span>
            </p>
          </div>

          {/* The 'How': Executable Runbook & Integrated CI/CD Terminal */}
          <div className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm min-h-[560px] flex flex-col">
            <CommandCenter
              incident={incident}
              onToggleStep={(stepId, completed) => onToggleStep(stepId, completed, incident.id)}
              isUpdatingStep={isUpdatingStep}
              onStepExecuted={() => onRefreshIncidents()}
            />
          </div>
        </div>

        {/* RIGHT PANE (30% - THE LIVING AUDIT TRAIL, STICKY) */}
        <div className="lg:col-span-4 sticky top-20 min-h-[580px] max-h-[82vh] flex flex-col">
          <WarRoomTimeline 
            incident={incident} 
            onAddAuditNote={handleAddAuditNote} 
          />
        </div>
      </div>

      {/* STICKY BOTTOM BAR: Generate Post-Mortem (G-Docs) */}
      {isResolved && (
        <aside 
          aria-label="Incident Resolution and Post-Mortem Bar"
          className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 max-w-2xl w-[92%] p-3.5 px-6 rounded-2xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 shadow-2xl border border-neutral-700 dark:border-neutral-200 flex items-center justify-between gap-4 animate-in slide-in-from-bottom-6 duration-300"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold leading-tight">
                Incident Mitigated & All Runbooks Executed
              </p>
              <p className="text-[11px] text-neutral-400 dark:text-neutral-600 mt-0.5">
                Google Docs post-mortem template prepared from living audit trail.
              </p>
            </div>
          </div>

          <button
            type="button"
            id="btn-generate-post-mortem"
            onClick={handleGeneratePostMortem}
            disabled={isGeneratingPostMortem}
            className="ai-gradient-btn ai-cta-btn text-white shadow-lg shadow-indigo-500/30 border border-indigo-400/30 transition-all active:scale-95 disabled:opacity-50 shrink-0 cursor-pointer"
          >
            <span className="w-5 h-5 rounded-lg bg-white/15 flex items-center justify-center shrink-0">
              <Sparkles className="w-3.5 h-3.5 text-amber-300 fill-amber-300 animate-pulse" />
            </span>
            <span className="tracking-tight text-white font-bold">{isGeneratingPostMortem ? 'Synthesizing Post-Mortem...' : 'Generate AI Post-Mortem (G-Docs)'}</span>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-400/20 text-amber-200 border border-amber-300/30 shrink-0">
              AI Ops
            </span>
          </button>
        </aside>
      )}

      {/* Post-Mortem Modal */}
      <PostMortemModal
        isOpen={isPostMortemModalOpen}
        onClose={() => setIsPostMortemModalOpen(false)}
        incident={incident}
        postMortemDoc={postMortemDoc}
      />
    </div>
  );
};
