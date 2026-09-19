import React, { useState } from 'react';
import { 
  X, 
  ExternalLink, 
  Copy, 
  Check, 
  FileText, 
  CheckCircle2, 
  Download,
  Share2,
  Clock,
  Sparkles
} from 'lucide-react';
import { PostMortemDoc, Incident } from '../types';

interface PostMortemModalProps {
  isOpen: boolean;
  onClose: () => void;
  incident: Incident;
  postMortemDoc: PostMortemDoc | null;
}

export const PostMortemModal: React.FC<PostMortemModalProps> = ({
  isOpen,
  onClose,
  incident,
  postMortemDoc
}) => {
  const [copied, setCopied] = useState<boolean>(false);

  if (!isOpen) return null;

  const docTitle = postMortemDoc?.title || `Post-Mortem: ${incident.title}`;
  const mttr = postMortemDoc?.mttr_minutes || 18;

  const generateMarkdown = () => {
    return `# ${docTitle}
**Date:** ${new Date().toLocaleDateString()}
**Severity:** ${incident.severity}
**Status:** RESOLVED
**MTTR:** ${mttr} minutes
**Lead SRE:** Alex Mercer (Staff SRE)
**Affected Services:** ${incident.affected_scope}

---

## 1. Executive Summary & Root Cause
${incident.root_cause}

## 2. Chronological Timeline of Events
${(incident.audit_timeline || []).map(a => `- **${new Date(a.timestamp).toLocaleTimeString()}** [${a.actor}] ${a.action}: ${a.details}`).join('\n') || '- Telemetry burst correlated by Autonomous AI Engine\n- War room provisioned\n- CI/CD mitigation webhooks executed'}

## 3. Runbook Mitigations Executed
${incident.runbook_steps.map(s => `- [x] Step ${s.id}: ${s.task} (\`${s.executable_command}\`)`).join('\n')}

## 4. Preventative Action Items (Google Docs / Jira)
- [ ] Add circuit breaker throttling on ingress gateway
- [ ] Tighten PostgreSQL auto-vacuum kill switch thresholds
- [ ] Schedule blameless engineering review with ${incident.owner_team} team
`;
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generateMarkdown());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([generateMarkdown()], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `post-mortem-${incident.id}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div 
      role="dialog"
      aria-modal="true"
      aria-label="Google Docs Post-Mortem Preview"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-3xl bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-2xl overflow-hidden flex flex-col max-h-[88vh] animate-in zoom-in-95 duration-150"
        onClick={e => e.stopPropagation()}
      >
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50/70 dark:bg-neutral-950/70">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-blue-500/15 text-blue-700 dark:text-blue-400">
                  GOOGLE DOCS INTEGRATION
                </span>
                <span className="text-xs text-neutral-400">
                  Auto-Generated from War Room Timeline
                </span>
              </div>
              <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100 mt-0.5">
                {docTitle}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopy}
              className="h-9 inline-flex items-center gap-1.5 px-3 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-xs font-semibold text-neutral-700 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>

            <button
              type="button"
              onClick={handleDownload}
              className="h-9 w-9 inline-flex items-center justify-center rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors"
              title="Download Markdown"
            >
              <Download className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={onClose}
              className="h-9 w-9 inline-flex items-center justify-center rounded-lg text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Document Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs text-neutral-800 dark:text-neutral-200 font-sans leading-relaxed">
          {/* Metadata Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 rounded-xl bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200 dark:border-neutral-800 font-mono">
            <div>
              <span className="text-[10px] text-neutral-400 block uppercase">Status</span>
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 mt-0.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Resolved
              </span>
            </div>
            <div>
              <span className="text-[10px] text-neutral-400 block uppercase">Severity</span>
              <span className="text-xs font-bold text-rose-600 dark:text-rose-400 mt-0.5 block">
                {incident.severity}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-neutral-400 block uppercase">MTTR</span>
              <span className="text-xs font-bold text-neutral-900 dark:text-neutral-100 mt-0.5 block">
                {mttr} Minutes
              </span>
            </div>
            <div>
              <span className="text-[10px] text-neutral-400 block uppercase">Owner Team</span>
              <span className="text-xs font-bold text-neutral-900 dark:text-neutral-100 mt-0.5 block">
                {incident.owner_team}
              </span>
            </div>
          </div>

          {/* Section 1: Executive Summary & Root Cause */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-500 font-mono">
              1. Executive Summary & Root Cause
            </h4>
            <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800/40 border-l-4 border-rose-500 text-neutral-800 dark:text-neutral-200">
              <p className="font-medium">{incident.root_cause}</p>
              <p className="text-neutral-500 dark:text-neutral-400 text-[11px] mt-1">
                Affected Scope: {incident.affected_scope}
              </p>
            </div>
          </div>

          {/* Section 2: Runbook Actions Verified */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-500 font-mono">
              2. Runbook Remediations Executed
            </h4>
            <div className="space-y-2">
              {incident.runbook_steps.map(step => (
                <div 
                  key={step.id} 
                  className="p-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-950/40 flex items-center justify-between gap-3 font-mono"
                >
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span className="text-neutral-800 dark:text-neutral-200">{step.task}</span>
                  </div>
                  <code className="text-[11px] text-neutral-500 shrink-0">
                    {step.executable_command?.slice(0, 32)}...
                  </code>
                </div>
              ))}
            </div>
          </div>

          {/* Section 3: Action Items */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-500 font-mono">
              3. Preventative Follow-up Tasks (G-Docs Sync)
            </h4>
            <ul className="space-y-2 pl-2">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                <span>Establish automated health check probes on secondary checkout ingress controllers.</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                <span>Publish incident learning summary to engineering documentation archive.</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50/70 dark:bg-neutral-950/70 flex items-center justify-between gap-4">
          <span className="text-xs text-neutral-500 font-mono">
            Document ID: PM-{incident.id.toUpperCase()}-{Date.now().toString().slice(-4)}
          </span>

          <a
            href={`https://docs.google.com/document/create?title=${encodeURIComponent(docTitle)}`}
            target="_blank"
            rel="noreferrer"
            className="h-10 inline-flex items-center gap-2 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <span>Open in Google Docs</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
};
