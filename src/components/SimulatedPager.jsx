import React, { useState, useEffect } from 'react';
import { Smartphone, Check, Wifi, Battery, BellRing } from 'lucide-react';

export const SimulatedPager = ({ activePage, onAcknowledge }) => {
  const [timeStr, setTimeStr] = useState('09:41');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  const isVisible = Boolean(activePage);

  return (
    <aside
      id="simulated-pager"
      aria-label="Simulated On-Call Pager"
      aria-live="assertive"
      className={`fixed bottom-6 right-6 z-50 w-80 sm:w-84 max-w-[calc(100vw-3rem)] transition-all duration-500 ease-out transform ${
        isVisible
          ? 'translate-y-0 opacity-100 pointer-events-auto'
          : 'translate-y-12 opacity-0 pointer-events-none'
      }`}
    >
      {/* Phone Lock Screen Widget Container */}
      <div
        className={`relative overflow-hidden rounded-3xl bg-neutral-950/95 backdrop-blur-md text-neutral-100 p-4 shadow-2xl transition-all duration-300 ${
          isVisible
            ? 'border-2 border-red-500 shadow-red-950/50 animate-pulse'
            : 'border border-neutral-800'
        }`}
      >
        {/* Phone Top Notch / Speaker & Status Bar */}
        <div className="flex items-center justify-between pb-3 border-b border-neutral-800/80 text-[11px] font-mono text-neutral-400">
          <span className="font-semibold text-neutral-200">{timeStr}</span>

          {/* Dynamic Island / Speaker Pill */}
          <div className="h-2 w-16 bg-neutral-800 rounded-full mx-auto" aria-hidden="true" />

          {/* Status Icons */}
          <div className="flex items-center gap-1.5 text-neutral-400" aria-hidden="true">
            <Wifi className="w-3 h-3" />
            <Battery className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Lock Screen Header */}
        <div className="pt-3 pb-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-red-600/20 border border-red-500/40 flex items-center justify-center text-red-400">
              <Smartphone className="w-3.5 h-3.5" aria-hidden="true" />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider font-semibold text-neutral-400">
                Incoming SMS • PagerDuty
              </p>
            </div>
          </div>
          <span className="text-[10px] text-neutral-500 font-mono">now</span>
        </div>

        {/* Simulated SMS Notification Content */}
        <div className="bg-neutral-900/80 rounded-2xl p-3 border border-neutral-800/90 mt-1">
          <div className="flex items-start gap-2.5">
            <div className="mt-0.5 flex-shrink-0 text-red-500">
              <BellRing className="w-4 h-4 animate-bounce" aria-hidden="true" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-white leading-snug break-words">
                🚨 SEV-1 Routed to {activePage || 'On-Call'} On-Call Engineer.
              </p>
              <p className="text-[11px] text-neutral-400 mt-1">
                Automated incident alert dispatched via primary routing policy.
              </p>
            </div>
          </div>

          {/* Action Row: Acknowledge Button */}
          <div className="mt-3 pt-2.5 border-t border-neutral-800/80 flex justify-end">
            <button
              id="btn-acknowledge-pager"
              type="button"
              onClick={onAcknowledge}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 active:bg-red-700 text-white text-xs font-medium tracking-wide shadow transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-400"
            >
              <Check className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Acknowledge</span>
            </button>
          </div>
        </div>

        {/* Home indicator bar at bottom */}
        <div className="mt-3 flex justify-center" aria-hidden="true">
          <div className="h-1 w-20 bg-neutral-700 rounded-full" />
        </div>
      </div>
    </aside>
  );
};

export default SimulatedPager;
