import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Pause, 
  Play, 
  Filter, 
  Terminal, 
  Sparkles, 
  ShieldAlert, 
  Clock, 
  Layers, 
  Search,
  Plus,
  RefreshCw
} from 'lucide-react';
import { RawAlert } from '../types';

interface NoiseStreamPageProps {
  alerts: RawAlert[];
  onTriggerTriage?: () => void;
  isPaused: boolean;
  onTogglePause: () => void;
  onInjectAlert?: () => void;
}

export const NoiseStreamPage: React.FC<NoiseStreamPageProps> = ({
  alerts,
  onTriggerTriage,
  isPaused,
  onTogglePause,
  onInjectAlert
}) => {
  const navigate = useNavigate();
  const [severityFilter, setSeverityFilter] = useState<'ALL' | 'CRITICAL' | 'WARNING' | 'INFO'>('ALL');
  const [sourceFilter, setSourceFilter] = useState<string>('ALL');
  const [timeRangeFilter, setTimeRangeFilter] = useState<'15m' | '1h' | '24h' | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Extract unique sources
  const sources = useMemo(() => {
    const s = new Set(alerts.map(a => a.source));
    return ['ALL', ...Array.from(s)];
  }, [alerts]);

  // Filtered alerts
  const filteredAlerts = useMemo(() => {
    const now = Date.now();
    return alerts.filter(alert => {
      // Severity filter
      if (severityFilter !== 'ALL' && alert.severity_hint !== severityFilter) {
        return false;
      }
      // Source filter
      if (sourceFilter !== 'ALL' && alert.source !== sourceFilter) {
        return false;
      }
      // Time range filter
      if (timeRangeFilter !== 'ALL') {
        const alertTime = new Date(alert.timestamp).getTime();
        const diffMinutes = (now - alertTime) / (1000 * 60);
        if (timeRangeFilter === '15m' && diffMinutes > 15) return false;
        if (timeRangeFilter === '1h' && diffMinutes > 60) return false;
        if (timeRangeFilter === '24h' && diffMinutes > 1440) return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          alert.message.toLowerCase().includes(q) ||
          alert.source.toLowerCase().includes(q) ||
          alert.id.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [alerts, severityFilter, sourceFilter, timeRangeFilter, searchQuery]);

  const renderSeverityDot = (severity: string) => {
    switch (severity) {
      case 'CRITICAL':
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-600 animate-pulse" />
            CRIT
          </span>
        );
      case 'WARNING':
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            WARN
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-sky-500/15 text-sky-600 dark:text-sky-400 border border-sky-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-500" />
            INFO
          </span>
        );
    }
  };

  const renderSourceBadge = (source: string) => {
    let colorClass = "bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300";
    if (source.includes("AWS")) colorClass = "bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20";
    if (source.includes("Datadog")) colorClass = "bg-purple-500/10 text-purple-700 dark:text-purple-400 border border-purple-500/20";
    if (source.includes("PagerDuty")) colorClass = "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20";
    if (source.includes("Zendesk")) colorClass = "bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-500/20";

    return (
      <span className={`px-2 py-0.5 rounded text-[11px] font-mono font-semibold ${colorClass}`}>
        {source}
      </span>
    );
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-neutral-200 dark:border-neutral-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 tracking-tight flex items-center gap-2">
              <span>The Noise Stream</span>
            </h1>
            <span className="px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300">
              {filteredAlerts.length} / {alerts.length} Events
            </span>
          </div>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
            Raw, high-density terminal log stream for manual anomaly hunting and telemetry inspection.
          </p>
        </div>

        {/* Action controls */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Pause Stream Toggle */}
          <button
            type="button"
            id="btn-toggle-pause-stream"
            onClick={onTogglePause}
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              isPaused
                ? 'bg-amber-500 text-white shadow-xs animate-pulse'
                : 'bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200'
            }`}
            title={isPaused ? "Resume live streaming" : "Freeze feed to inspect logs"}
          >
            {isPaused ? (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Stream Paused (Frozen)</span>
              </>
            ) : (
              <>
                <Pause className="w-3.5 h-3.5 fill-current" />
                <span>Pause Stream</span>
              </>
            )}
          </button>

          {onInjectAlert && (
            <button
              type="button"
              id="btn-inject-chaos-alert"
              onClick={onInjectAlert}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 text-xs font-semibold"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Inject Anomaly</span>
            </button>
          )}

          <button
            type="button"
            id="btn-triage-from-stream"
            onClick={() => {
              if (onTriggerTriage) {
                onTriggerTriage();
              }
              navigate('/incidents');
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-neutral-900 text-xs font-semibold shadow-xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            <span>AI Triage Stream</span>
          </button>
        </div>
      </div>

      {/* High-density Terminal Top Bar: Filter Chips & Search */}
      <div className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-900/60 border border-neutral-200 dark:border-neutral-800 space-y-3 font-mono text-xs">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Severity filter chips */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] font-sans font-semibold text-neutral-500 mr-1">Severity:</span>
            {(['ALL', 'CRITICAL', 'WARNING', 'INFO'] as const).map(sev => (
              <button
                key={sev}
                type="button"
                onClick={() => setSeverityFilter(sev)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                  severityFilter === sev
                    ? 'bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 shadow-2xs'
                    : 'bg-white dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100'
                }`}
              >
                {sev}
              </button>
            ))}
          </div>

          {/* Time range chips */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] font-sans font-semibold text-neutral-500 mr-1">Range:</span>
            {(['15m', '1h', '24h', 'ALL'] as const).map(range => (
              <button
                key={range}
                type="button"
                onClick={() => setTimeRangeFilter(range)}
                className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-all ${
                  timeRangeFilter === range
                    ? 'bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900'
                    : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100'
                }`}
              >
                {range}
              </button>
            ))}
          </div>
        </div>

        {/* Source chips & search row */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-neutral-200/60 dark:border-neutral-800">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] font-sans font-semibold text-neutral-500 mr-1">Source:</span>
            {sources.map(src => (
              <button
                key={src}
                type="button"
                onClick={() => setSourceFilter(src)}
                className={`px-2 py-0.5 rounded text-[11px] font-medium transition-all ${
                  sourceFilter === src
                    ? 'bg-neutral-800 text-white dark:bg-neutral-200 dark:text-neutral-900'
                    : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200'
                }`}
              >
                {src}
              </button>
            ))}
          </div>

          {/* Quick search */}
          <div className="relative min-w-[220px]">
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Grep messages / IDs..."
              className="w-full pl-7 pr-3 py-1 rounded-lg bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 text-xs font-mono text-neutral-900 dark:text-neutral-100 outline-none focus:border-blue-500"
            />
            <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-2 top-2" />
          </div>
        </div>
      </div>

      {/* Main High-Density Data Table */}
      <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs border-collapse">
            <thead>
              <tr className="bg-neutral-100/75 dark:bg-neutral-950/80 border-b border-neutral-200 dark:border-neutral-800 text-[11px] font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                <th className="py-2.5 px-4 w-32">Timestamp</th>
                <th className="py-2.5 px-3 w-24">Severity</th>
                <th className="py-2.5 px-3 w-36">Source</th>
                <th className="py-2.5 px-4">Raw Message</th>
                <th className="py-2.5 px-3 w-44">Metadata</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/80">
              {filteredAlerts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-neutral-400 dark:text-neutral-600">
                    No active alerts matching the selected filters.
                  </td>
                </tr>
              ) : (
                filteredAlerts.map(alert => (
                  <tr 
                    key={alert.id}
                    className="hover:bg-neutral-50 dark:hover:bg-neutral-800/40 transition-colors group"
                  >
                    {/* Timestamp */}
                    <td className="py-2.5 px-4 text-neutral-500 dark:text-neutral-400 text-[11px] whitespace-nowrap">
                      {new Date(alert.timestamp).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      <span className="text-[10px] text-neutral-400 ml-1">UTC</span>
                    </td>

                    {/* Severity */}
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      {renderSeverityDot(alert.severity_hint)}
                    </td>

                    {/* Source */}
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      {renderSourceBadge(alert.source)}
                    </td>

                    {/* Raw Message */}
                    <td className="py-2.5 px-4 font-mono text-neutral-900 dark:text-neutral-100 leading-relaxed max-w-xl">
                      <span className="text-neutral-400 text-[10px] select-all mr-1">[{alert.id}]</span>
                      <span className="break-words font-medium">{alert.message}</span>
                    </td>

                    {/* Metadata Chips */}
                    <td className="py-2.5 px-3 text-[10px] text-neutral-400">
                      <div className="flex flex-wrap gap-1">
                        {Object.entries(alert.metadata || {}).map(([k, v]) => (
                          <span 
                            key={k} 
                            className="px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 font-mono"
                          >
                            {k}:{String(v)}
                          </span>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
