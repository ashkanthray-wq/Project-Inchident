import React, { useEffect, useRef, useState } from 'react';
import { RawAlert } from '../types';
import { 
  ShieldAlert, 
  AlertTriangle, 
  Info, 
  Clock
} from 'lucide-react';

interface NoiseStreamProps {
  initialAlerts?: RawAlert[];
  isSuppressed?: boolean;
  onAlertsUpdated?: (alerts: RawAlert[]) => void;
}

export const NoiseStream: React.FC<NoiseStreamProps> = ({
  initialAlerts = [],
  isSuppressed = false,
  onAlertsUpdated
}) => {
  const [alerts, setAlerts] = useState<RawAlert[]>(initialAlerts);
  const [newAlertIds, setNewAlertIds] = useState<Set<string>>(new Set());
  const previousAlertIdsRef = useRef<Set<string>>(new Set(initialAlerts.map(a => a.id)));

  useEffect(() => {
    setAlerts(initialAlerts);
    previousAlertIdsRef.current = new Set(initialAlerts.map(a => a.id));
  }, [initialAlerts]);

  // 2-second polling hook to GET /api/alerts
  useEffect(() => {
    const pollAlerts = async () => {
      try {
        const res = await fetch('/api/alerts');
        if (!res.ok) return;
        const freshAlerts: RawAlert[] = await res.json();

        const existingIds = previousAlertIdsRef.current;
        const brandNewIds: string[] = [];
        for (const a of freshAlerts) {
          if (!existingIds.has(a.id)) {
            brandNewIds.push(a.id);
          }
        }

        if (brandNewIds.length > 0) {
          setNewAlertIds(prev => {
            const next = new Set(prev);
            brandNewIds.forEach(id => next.add(id));
            return next;
          });

          setTimeout(() => {
            setNewAlertIds(prev => {
              const next = new Set(prev);
              brandNewIds.forEach(id => next.delete(id));
              return next;
            });
          }, 6000);
        }

        previousAlertIdsRef.current = new Set(freshAlerts.map(a => a.id));
        setAlerts(freshAlerts);
        if (onAlertsUpdated) {
          onAlertsUpdated(freshAlerts);
        }
      } catch (err) {
        console.error('Polling /api/alerts failed', err);
      }
    };

    const interval = setInterval(pollAlerts, 2000);
    return () => clearInterval(interval);
  }, [onAlertsUpdated]);

  const getSourceBadge = (source: string) => {
    switch (source) {
      case 'AWS CloudWatch':
        return 'text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/80 border-amber-300 dark:border-amber-800';
      case 'Datadog':
        return 'text-purple-800 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/80 border-purple-300 dark:border-purple-800';
      case 'PagerDuty':
        return 'text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/80 border-emerald-300 dark:border-emerald-800';
      case 'Zendesk':
        return 'text-sky-800 dark:text-sky-300 bg-sky-50 dark:bg-sky-950/80 border-sky-300 dark:border-sky-800';
      default:
        return 'text-neutral-700 dark:text-neutral-300 bg-neutral-100 dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700';
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'CRITICAL':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-rose-700 dark:text-rose-400">
            <ShieldAlert className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" aria-hidden="true" />
            <span>CRITICAL</span>
          </span>
        );
      case 'WARNING':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700 dark:text-amber-400">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" aria-hidden="true" />
            <span>WARNING</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-sky-700 dark:text-sky-400">
            <Info className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" aria-hidden="true" />
            <span>INFO</span>
          </span>
        );
    }
  };

  return (
    <section 
      aria-labelledby="section-telemetry-heading"
      className="flex flex-col h-full"
    >
      {/* Section Header with generous whitespace */}
      <div className="pb-5 mb-5 border-b border-neutral-200 dark:border-neutral-800 flex items-baseline justify-between">
        <div>
          <h2 
            id="section-telemetry-heading" 
            className="text-base font-semibold text-neutral-900 dark:text-neutral-100 tracking-tight"
          >
            Raw Telemetry Stream
          </h2>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
            Real-time feed polled continuously every 2s
          </p>
        </div>
        <span className="text-xs font-mono font-medium px-2 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300">
          {alerts.length} Ingested
        </span>
      </div>

      {/* Suppression banner if triaged */}
      {isSuppressed && (
        <div 
          role="status"
          className="p-3 mb-4 rounded-lg bg-neutral-100 dark:bg-neutral-800/80 text-xs text-neutral-600 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-700"
        >
          <span className="font-semibold text-neutral-800 dark:text-neutral-200">
            Noise Suppressed:
          </span> Alerts dimmed to combat incident responder cognitive fatigue.
        </div>
      )}

      {/* Flat List with generous spacing between items */}
      <div 
        role="feed"
        aria-label="Incoming system alerts"
        className="flex-1 overflow-y-auto space-y-4 pr-1 scrollbar-thin scrollbar-thumb-neutral-300 dark:scrollbar-thumb-neutral-700"
      >
        {alerts.length === 0 ? (
          <div className="py-16 text-center text-sm text-neutral-500 dark:text-neutral-400">
            No active alerts in current stream buffer.
          </div>
        ) : (
          alerts.map((alert, idx) => {
            const isNew = newAlertIds.has(alert.id);

            return (
              <article
                key={`${alert.id}-${idx}`}
                aria-label={`${alert.severity_hint} alert from ${alert.source}: ${alert.message}`}
                className={`p-4 rounded-xl transition-all duration-200 border ${
                  isNew
                    ? 'border-rose-500 bg-rose-50/50 dark:bg-rose-950/30'
                    : isSuppressed
                    ? 'opacity-40 border-neutral-200 dark:border-neutral-800/60 bg-transparent'
                    : 'border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:border-neutral-300 dark:hover:border-neutral-700'
                }`}
              >
                {/* Meta header */}
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    {isNew && (
                      <span className="px-1.5 py-0.2 rounded text-[10px] font-bold uppercase tracking-wider bg-rose-600 text-white animate-pulse">
                        NEW
                      </span>
                    )}
                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${getSourceBadge(alert.source)}`}>
                      {alert.source}
                    </span>
                    <span className="text-xs font-mono text-neutral-400 dark:text-neutral-500">
                      {alert.id}
                    </span>
                  </div>
                  {getSeverityBadge(alert.severity_hint)}
                </div>

                {/* Message */}
                <p className="text-sm text-neutral-900 dark:text-neutral-100 leading-relaxed font-normal">
                  {alert.message}
                </p>

                {/* Timestamp & payload metadata */}
                <div className="mt-3 pt-2.5 border-t border-neutral-100 dark:border-neutral-800/80 flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400">
                  <span className="flex items-center gap-1 font-mono text-[11px]">
                    <Clock className="w-3.5 h-3.5" aria-hidden="true" />
                    {alert.timestamp ? new Date(alert.timestamp).toLocaleTimeString() : 'Just now'}
                  </span>

                  {alert.metadata && Object.keys(alert.metadata).length > 0 && (
                    <span className="font-mono text-[11px] text-neutral-400 dark:text-neutral-500 truncate max-w-[150px]">
                      {JSON.stringify(alert.metadata)}
                    </span>
                  )}
                </div>
              </article>
            );
          })
        )}
      </div>
    </section>
  );
};
