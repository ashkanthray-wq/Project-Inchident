import React, { useEffect } from 'react';
import { ShieldAlert, Volume2, X } from 'lucide-react';
import { playPagerChime } from '../utils/audio';

interface PagerEmergencyPulseProps {
  isActive: boolean;
  message?: string;
  onDismiss: () => void;
}

export const PagerEmergencyPulse: React.FC<PagerEmergencyPulseProps> = ({
  isActive,
  message = "SEV-1 EMERGENCY: Critical infrastructure threshold breached. On-call paged.",
  onDismiss
}) => {
  useEffect(() => {
    if (isActive) {
      playPagerChime();
    }
  }, [isActive]);

  if (!isActive) return null;

  return (
    <>
      {/* Outer Border Emergency Glow Pulse */}
      <div 
        aria-hidden="true"
        className="fixed inset-0 pointer-events-none z-50 ring-4 ring-rose-600/90 shadow-[inset_0_0_80px_rgba(225,29,72,0.45)] animate-pulse"
      />

      {/* Floating Emergency Banner */}
      <div 
        role="alert"
        className="fixed top-4 left-1/2 -translate-x-1/2 z-50 max-w-xl w-[92%] sm:w-auto p-3.5 px-5 rounded-2xl bg-rose-600 text-white shadow-2xl flex items-center justify-between gap-4 border border-rose-400 animate-in slide-in-from-top-4 duration-300"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center shrink-0 animate-ping">
            <ShieldAlert className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black tracking-wider uppercase px-2 py-0.5 rounded bg-black/30">
                PAGER ALERT
              </span>
              <span className="text-[11px] font-mono opacity-90">
                Primary On-Call Triggered
              </span>
            </div>
            <p className="text-xs font-medium text-white/95 mt-0.5 leading-snug">
              {message}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onDismiss}
          className="p-1.5 rounded-lg bg-black/20 hover:bg-black/40 text-white transition-colors shrink-0"
          title="Acknowledge page"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </>
  );
};
