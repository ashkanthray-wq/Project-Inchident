import React, { useState, useRef, useEffect } from 'react';
import { Play, Loader2, CheckCircle2, ShieldAlert, Lock } from 'lucide-react';

interface HoldToExecuteButtonProps {
  stepId: number;
  commandText?: string;
  isCompleted: boolean;
  isExecuting: boolean;
  onExecute: () => void;
  disabled?: boolean;
}

export const HoldToExecuteButton: React.FC<HoldToExecuteButtonProps> = ({
  stepId,
  isCompleted,
  isExecuting,
  onExecute,
  disabled = false
}) => {
  const [holdProgress, setHoldProgress] = useState<number>(0);
  const [isHolding, setIsHolding] = useState<boolean>(false);
  const [justTriggered, setJustTriggered] = useState<boolean>(false);
  
  const holdStartTimeRef = useRef<number | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const HOLD_DURATION_MS = 3000;

  const cancelHold = () => {
    setIsHolding(false);
    holdStartTimeRef.current = null;
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    setHoldProgress(0);
  };

  const updateProgress = () => {
    if (!holdStartTimeRef.current) return;
    const elapsed = Date.now() - holdStartTimeRef.current;
    const progress = Math.min(100, (elapsed / HOLD_DURATION_MS) * 100);
    setHoldProgress(progress);

    if (progress >= 100) {
      // Completed 3 seconds hold!
      setIsHolding(false);
      holdStartTimeRef.current = null;
      setJustTriggered(true);
      onExecute();
    } else {
      animationFrameRef.current = requestAnimationFrame(updateProgress);
    }
  };

  const startHold = (e: React.MouseEvent | React.TouchEvent) => {
    if (disabled || isCompleted || isExecuting || justTriggered) return;
    setIsHolding(true);
    holdStartTimeRef.current = Date.now();
    animationFrameRef.current = requestAnimationFrame(updateProgress);
  };

  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  if (isCompleted) {
    return (
      <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/80 text-xs font-semibold">
        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
        <span>Executed</span>
      </div>
    );
  }

  if (isExecuting) {
    return (
      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 text-xs font-semibold animate-pulse">
        <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-600 dark:text-amber-400" />
        <span>Executing Webhook...</span>
      </div>
    );
  }

  const secondsRemaining = Math.max(0, ((HOLD_DURATION_MS * (1 - holdProgress / 100)) / 1000)).toFixed(1);

  return (
    <div className="relative inline-flex items-center select-none">
      <button
        type="button"
        id={`btn-execute-step-${stepId}`}
        onMouseDown={startHold}
        onMouseUp={cancelHold}
        onMouseLeave={cancelHold}
        onTouchStart={startHold}
        onTouchEnd={cancelHold}
        onTouchCancel={cancelHold}
        disabled={disabled}
        className={`relative overflow-hidden inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-150 active:scale-[0.98] ${
          isHolding
            ? 'bg-neutral-900 text-white shadow-md ring-2 ring-rose-500'
            : 'bg-neutral-900 hover:bg-neutral-800 dark:bg-neutral-100 dark:hover:bg-white text-white dark:text-neutral-900 shadow-xs'
        }`}
        title="Hold for 3 seconds to confirm execution against production"
      >
        {/* Fill progress background representing 3-second hold */}
        {isHolding && (
          <div
            className="absolute inset-0 bg-rose-600/40 dark:bg-rose-500/40 transition-all duration-75 origin-left"
            style={{ width: `${holdProgress}%` }}
          />
        )}

        {/* Content */}
        <span className="relative z-10 flex items-center gap-2">
          {isHolding ? (
            <>
              <ShieldAlert className="w-3.5 h-3.5 text-rose-400 animate-bounce" />
              <span>Holding to confirm... {secondsRemaining}s</span>
            </>
          ) : (
            <>
              <Lock className="w-3.5 h-3.5 text-amber-400" />
              <span>Hold 3s to Execute</span>
            </>
          )}
        </span>
      </button>

      {/* Safety tooltip helper when not holding */}
      {!isHolding && (
        <span className="hidden sm:inline-block ml-2 text-[10px] text-neutral-400 dark:text-neutral-500">
          (Protected)
        </span>
      )}
    </div>
  );
};
