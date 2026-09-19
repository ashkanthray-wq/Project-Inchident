import React, { useState, useEffect } from 'react';
import { Sparkles, Terminal, Activity, Layers } from 'lucide-react';

interface SkeletonLoaderProps {
  label?: string;
}

const DEFAULT_MICRO_COPY = [
  "Correlating 42 Datadog & AWS CloudWatch telemetry alerts...",
  "Analyzing PostgreSQL vacuum lock traces and connection saturation...",
  "Drafting Kubernetes rollback and replica scaling commands...",
  "Synthesizing ElevenLabs audio sitrep briefing...",
  "Finalizing actionable incident containment plan..."
];

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({ label }) => {
  const [copyIndex, setCopyIndex] = useState<number>(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCopyIndex((prev) => (prev + 1) % DEFAULT_MICRO_COPY.length);
    }, 1800);
    return () => clearInterval(interval);
  }, []);

  return (
    <div 
      id="ai-triage-skeleton-loader"
      className="p-6 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-6 animate-pulse"
    >
      {/* Live AI status micro-copy */}
      <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded-full bg-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center">
            <Sparkles className="w-3.5 h-3.5 animate-spin" />
          </div>
          <div>
            <span className="text-xs font-bold text-neutral-900 dark:text-neutral-100 block">
              Autonomous AI Triage Engine
            </span>
            <p className="text-[11px] font-mono text-purple-600 dark:text-purple-400 transition-all duration-300">
              {DEFAULT_MICRO_COPY[copyIndex]}
            </p>
          </div>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-500">
          HEURISTIC REASONING
        </span>
      </div>

      {/* Pulsing incident card layout blocks */}
      <div className="space-y-4">
        {/* Title skeleton */}
        <div className="h-6 w-3/4 bg-neutral-200 dark:bg-neutral-800 rounded-md" />
        
        {/* Severity & team pill skeletons */}
        <div className="flex items-center gap-2">
          <div className="h-5 w-16 bg-neutral-200 dark:bg-neutral-800 rounded-full" />
          <div className="h-5 w-24 bg-neutral-200 dark:bg-neutral-800 rounded-full" />
          <div className="h-5 w-32 bg-neutral-200 dark:bg-neutral-800 rounded-full" />
        </div>

        {/* Root cause paragraph blockquote skeleton */}
        <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800/40 space-y-2 border-l-4 border-neutral-300 dark:border-neutral-700">
          <div className="h-3.5 w-1/3 bg-neutral-200 dark:bg-neutral-700 rounded" />
          <div className="h-3 w-full bg-neutral-200 dark:bg-neutral-700 rounded" />
          <div className="h-3 w-5/6 bg-neutral-200 dark:bg-neutral-700 rounded" />
        </div>

        {/* Vertical Runbook Steps skeleton */}
        <div className="space-y-3 pt-2">
          <div className="h-4 w-40 bg-neutral-200 dark:bg-neutral-800 rounded" />
          
          {[1, 2, 3].map((item) => (
            <div 
              key={item} 
              className="p-3.5 rounded-xl border border-neutral-200 dark:border-neutral-800 flex items-center justify-between gap-4"
            >
              <div className="space-y-1.5 flex-1">
                <div className="h-3.5 w-2/3 bg-neutral-200 dark:bg-neutral-800 rounded" />
                <div className="h-3 w-1/2 bg-neutral-100 dark:bg-neutral-800/60 rounded font-mono" />
              </div>
              <div className="h-8 w-24 bg-neutral-200 dark:bg-neutral-800 rounded-lg shrink-0" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
