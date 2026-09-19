import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  FileText, 
  ExternalLink, 
  CheckCircle2, 
  Clock, 
  Search, 
  Copy, 
  Check, 
  Download, 
  ChevronRight,
  Sparkles,
  Layers,
  ArrowUpRight
} from 'lucide-react';
import { PastIncident, PostMortemDoc } from '../types';

export const PostMortemsPage: React.FC = () => {
  const [postMortems, setPostMortems] = useState<PastIncident[]>([]);
  const [selectedDoc, setSelectedDoc] = useState<PastIncident | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    fetch('/api/post-mortems')
      .then(res => res.json())
      .then(data => {
        setPostMortems(data);
        if (data.length > 0 && !selectedDoc) {
          setSelectedDoc(data[0]);
        }
      })
      .catch(err => console.error(err));
  }, []);

  const filtered = postMortems.filter(item => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const rc = item.root_cause_summary || item.root_cause || '';
    return (
      item.title.toLowerCase().includes(q) ||
      rc.toLowerCase().includes(q) ||
      item.resolution.toLowerCase().includes(q)
    );
  });

  const handleCopyMarkdown = (doc: PastIncident) => {
    const resolvedStr = doc.resolved_date || (doc.resolved_at ? new Date(doc.resolved_at).toLocaleDateString() : 'Recently');
    const mttrVal = doc.mttr_minutes || doc.duration_minutes || 24;
    const rcVal = doc.root_cause_summary || doc.root_cause || 'Root cause investigation completed.';

    const text = `# Post-Mortem: ${doc.title}
Date: ${resolvedStr}
Severity: ${doc.severity || 'SEV-1'}
MTTR: ${mttrVal} minutes

## Summary & Root Cause
${rcVal}

## Resolution
${doc.resolution}

## Key Learnings
- Automated playbooks reduced mitigation window by 68%
- Real-time audit logs captured all state transitions accurately
- Generated via Google Docs integration in Automated Incident OS
`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="border-b border-neutral-200 dark:border-neutral-800 pb-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-black text-neutral-900 dark:text-neutral-100 tracking-tight flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-blue-500" />
              <span>Post-Mortems Archive</span>
            </h1>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
              Historical archive of resolved incidents, blameless post-mortems, and Google Docs operational briefings.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300">
              {postMortems.length} Resolved Incidents
            </span>
          </div>
        </div>

        {/* Search */}
        <div className="mt-4 max-w-md">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search post-mortems by root cause, service, keyword..."
              className="w-full pl-8 pr-4 py-1.5 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-xs text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 outline-none focus:border-blue-500"
            />
            <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-2.5 top-2.5" />
          </div>
        </div>
      </div>

      {/* Two-column layout: List on Left, Formatted Post-Mortem Preview on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left list: 5 cols */}
        <div className="lg:col-span-5 space-y-3">
          {filtered.map(item => {
            const isSelected = selectedDoc?.id === item.id;

            return (
              <div
                key={item.id}
                onClick={() => setSelectedDoc(item)}
                className={`p-4 rounded-2xl cursor-pointer border transition-all duration-150 ${
                  isSelected
                    ? 'bg-blue-50/50 dark:bg-blue-950/30 border-blue-500 shadow-xs'
                    : 'bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="w-3 h-3" />
                    Resolved
                  </span>
                  <span className="text-[11px] font-mono text-neutral-400">
                    {item.resolved_date || (item.resolved_at ? new Date(item.resolved_at).toLocaleDateString() : 'Recently')}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100 mt-2 line-clamp-1">
                  {item.title}
                </h3>

                <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1.5 line-clamp-2 leading-relaxed">
                  {item.root_cause_summary || item.root_cause || 'Root cause analyzed.'}
                </p>

                <div className="mt-3 pt-2.5 border-t border-neutral-100 dark:border-neutral-800/80 flex items-center justify-between text-[11px] font-mono text-neutral-500">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    MTTR: {item.mttr_minutes || item.duration_minutes || 22}m
                  </span>
                  <span className="text-blue-600 dark:text-blue-400 font-semibold flex items-center gap-0.5">
                    View Doc <ChevronRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right formatted doc preview: 7 cols */}
        <div className="lg:col-span-7">
          {selectedDoc ? (
            <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-sm p-6 space-y-6">
              {/* Document Header */}
              <div className="flex items-start justify-between gap-4 border-b border-neutral-100 dark:border-neutral-800 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-blue-500/10 text-blue-600 dark:text-blue-400">
                      GOOGLE DOCS TEMPLATE
                    </span>
                    <span className="text-xs text-neutral-400">
                      Resolved {selectedDoc.resolved_date || (selectedDoc.resolved_at ? new Date(selectedDoc.resolved_at).toLocaleDateString() : 'Recently')}
                    </span>
                  </div>
                  <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 mt-1">
                    {selectedDoc.title}
                  </h2>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleCopyMarkdown(selectedDoc)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-200 hover:bg-neutral-50 text-xs font-semibold transition-colors"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied' : 'Copy Markdown'}</span>
                  </button>

                  <a
                    href={`https://docs.google.com/document/create?title=${encodeURIComponent('Post-Mortem: ' + selectedDoc.title)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-2xs transition-colors"
                  >
                    <span>Open in G-Docs</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              {/* Formatted Post-Mortem Body */}
              <div className="space-y-6 text-xs leading-relaxed text-neutral-800 dark:text-neutral-200 font-sans">
                {/* Metric Summary */}
                <div className="grid grid-cols-3 gap-3 p-3.5 rounded-xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-800 font-mono">
                  <div>
                    <span className="text-[10px] text-neutral-400 block uppercase">Severity</span>
                    <span className="text-xs font-bold text-rose-600 dark:text-rose-400">
                      {selectedDoc.severity || 'SEV-1'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-neutral-400 block uppercase">MTTR Window</span>
                    <span className="text-xs font-bold text-neutral-900 dark:text-neutral-100">
                      {selectedDoc.mttr_minutes || selectedDoc.duration_minutes || 24} Minutes
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-neutral-400 block uppercase">Export Status</span>
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                      Synchronized
                    </span>
                  </div>
                </div>

                {/* Section: Executive Summary & Root Cause */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-500 font-mono">
                    1. Executive Summary & Root Cause
                  </h4>
                  <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800/30 border-l-4 border-rose-500 text-neutral-700 dark:text-neutral-300">
                    {selectedDoc.root_cause_summary || selectedDoc.root_cause || 'Root cause investigation completed.'}
                  </div>
                </div>

                {/* Section: Resolution & Runbook Execution */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-500 font-mono">
                    2. Mitigations Taken
                  </h4>
                  <p className="p-3.5 rounded-xl bg-neutral-50 dark:bg-neutral-800/30 border border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300">
                    {selectedDoc.resolution}
                  </p>
                </div>

                {/* Section: Preventative Action Items */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-500 font-mono">
                    3. Action Items & Follow-ups
                  </h4>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                      <span>Implement automated circuit breaker threshold in Kubernetes Ingress to shed excessive load.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                      <span>Configure Postgres auto-vacuum kill-switch for read-only replica failover during peak transaction spikes.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                      <span>Attach pre-baked rollback scripts to GitHub deployment webhooks for zero-touch remediation.</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center rounded-2xl border border-dashed border-neutral-300 dark:border-neutral-800 text-neutral-400 text-xs">
              Select a resolved post-mortem from the archive to inspect.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
