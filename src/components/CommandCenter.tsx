import React, { useState, useEffect, useRef } from 'react';
import { Incident, RunbookStep } from '../types';
import { 
  ShieldCheck, 
  Flame, 
  Check, 
  Terminal, 
  Play, 
  Loader2, 
  Copy, 
  RotateCcw,
  Sparkles,
  CheckCircle2,
  Lock
} from 'lucide-react';
import { HoldToExecuteButton } from './HoldToExecuteButton';

interface TerminalLog {
  id: string;
  text: string;
  type: 'command' | 'success' | 'system';
}

interface CommandCenterProps {
  incident: Incident | null;
  onToggleStep: (stepId: number, completed: boolean) => void;
  isUpdatingStep: boolean;
  onStepExecuted?: (stepId: number, commandOutput: string) => void;
}

export const CommandCenter: React.FC<CommandCenterProps> = ({
  incident,
  onToggleStep,
  isUpdatingStep,
  onStepExecuted
}) => {
  const [terminalLogs, setTerminalLogs] = useState<TerminalLog[]>([
    {
      id: 'init-1',
      text: '$ kubectx production-us-east-1',
      type: 'command'
    },
    {
      id: 'init-2',
      text: 'Switched to context "production-us-east-1". Authenticated via AWS IAM STS.',
      type: 'system'
    }
  ]);
  const [executingStepId, setExecutingStepId] = useState<number | null>(null);
  const [copiedStepId, setCopiedStepId] = useState<number | null>(null);

  const timeoutRefs = useRef<NodeJS.Timeout[]>([]);
  const terminalEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    return () => {
      timeoutRefs.current.forEach(clearTimeout);
    };
  }, []);

  useEffect(() => {
    if (terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [terminalLogs]);

  const handleCopyCommand = (stepId: number, cmd?: string) => {
    if (!cmd) return;
    navigator.clipboard.writeText(cmd).catch(() => {});
    setCopiedStepId(stepId);
    const t = setTimeout(() => setCopiedStepId(null), 1500);
    timeoutRefs.current.push(t);
  };

  // Execution Simulation handler via Hold-for-3s trigger
  const handleExecute = async (step: RunbookStep) => {
    if (executingStepId !== null || isUpdatingStep || step.completed) return;

    const commandToRun = step.executable_command || `kubectl scale deployment checkout --replicas=5`;

    // 1. Immediately push the command to terminalLogs: $ {executable_command}
    const cmdLog: TerminalLog = {
      id: `cmd-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      text: `$ ${commandToRun}`,
      type: 'command'
    };
    setTerminalLogs(prev => [...prev, cmdLog]);
    setExecutingStepId(step.id);

    try {
      // Call backend execution endpoint for realistic terminal response
      if (incident?.id) {
        const res = await fetch(`/api/incidents/${incident.id}/execute-step`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ stepId: step.id })
        });

        if (res.ok) {
          const data = await res.json();
          const out = data.output || `> 200 OK: [CI/CD Webhook] Action dispatched and verified.`;
          
          setTerminalLogs(prev => [
            ...prev,
            {
              id: `suc-${Date.now()}`,
              text: out,
              type: 'success'
            }
          ]);

          onToggleStep(step.id, true);
          if (onStepExecuted) {
            onStepExecuted(step.id, out);
          }
          setExecutingStepId(null);
          return;
        }
      }

      // Fallback
      setTimeout(() => {
        setTerminalLogs(prev => [
          ...prev,
          {
            id: `suc-${Date.now()}`,
            text: `> deployment.apps/${step.target_service || 'service'} scaled successfully. Pods in Running state. (200 OK)`,
            type: 'success'
          }
        ]);
        onToggleStep(step.id, true);
        setExecutingStepId(null);
      }, 1200);
    } catch (err) {
      console.error(err);
      setExecutingStepId(null);
    }
  };

  if (!incident) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center border border-dashed border-neutral-300 dark:border-neutral-800 rounded-xl space-y-2">
        <Terminal className="w-8 h-8 text-neutral-400 dark:text-neutral-600 mb-1" />
        <h3 className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">
          Awaiting Incident Selection
        </h3>
        <p className="text-xs text-neutral-500 dark:text-neutral-400 max-w-xs">
          Select an incident to view the executable runbook and integrated shell terminal.
        </p>
      </div>
    );
  }

  const completedSteps = incident.runbook_steps.filter(s => s.completed).length;
  const totalSteps = incident.runbook_steps.length;
  const percentComplete = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;

  return (
    <div className="flex flex-col h-full space-y-4">
      {/* Runbook Header */}
      <div className="pb-3 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-sm font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
            <span>Executable Runbook (The Action Canvas)</span>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400">
              {completedSteps}/{totalSteps} Steps Executed
            </span>
          </h2>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
            Protected actions requiring 3-second hold to trigger production CI/CD webhooks.
          </p>
        </div>

        <div className="w-28 text-right shrink-0">
          <div className="text-[10px] font-mono font-bold text-neutral-500">
            {percentComplete}% Mitigated
          </div>
          <div className="w-full h-1.5 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden mt-1">
            <div 
              className={`h-full transition-all duration-300 ${
                percentComplete === 100 ? 'bg-emerald-500' : 'bg-blue-500'
              }`}
              style={{ width: `${percentComplete}%` }}
            />
          </div>
        </div>
      </div>

      {/* TOP HALF: Executable Runbook Steps Timeline */}
      <div className="flex-1 min-h-0 overflow-y-auto space-y-3 pr-1">
        {incident.runbook_steps.map((step: RunbookStep) => {
          const isChecked = step.completed;
          const isCurrentlyExecuting = executingStepId === step.id;
          const commandStr = step.executable_command || "kubectl scale deployment checkout --replicas=5";

          return (
            <div
              key={step.id}
              className={`p-3.5 rounded-xl border transition-all ${
                isChecked
                  ? 'bg-neutral-50/60 dark:bg-neutral-900/40 border-neutral-200 dark:border-neutral-800/60'
                  : isCurrentlyExecuting
                  ? 'bg-neutral-50 dark:bg-neutral-900/90 border-blue-400 dark:border-blue-600 shadow-xs'
                  : 'bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700'
              }`}
            >
              {/* Step Header */}
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-neutral-500 dark:text-neutral-400 font-mono">
                    Step {step.id}
                  </span>
                  <span
                    className={`text-[10px] uppercase px-2 py-0.5 rounded font-bold border ${
                      step.type === 'containment'
                        ? 'bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950/80 dark:text-rose-300 dark:border-rose-900'
                        : step.type === 'mitigation'
                        ? 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/80 dark:text-amber-300 dark:border-amber-900'
                        : 'bg-blue-50 text-blue-800 border-blue-200 dark:bg-blue-950/80 dark:text-blue-300 dark:border-blue-900'
                    }`}
                  >
                    {step.type}
                  </span>
                </div>

                {/* Destructive Constraint Button: Hold for 3 seconds */}
                <HoldToExecuteButton
                  stepId={step.id}
                  commandText={commandStr}
                  isCompleted={isChecked}
                  isExecuting={isCurrentlyExecuting}
                  onExecute={() => handleExecute(step)}
                  disabled={executingStepId !== null}
                />
              </div>

              {/* Task description */}
              <p
                className={`text-xs leading-relaxed ${
                  isChecked
                    ? 'line-through text-neutral-400 dark:text-neutral-500'
                    : 'text-neutral-900 dark:text-neutral-100 font-medium'
                }`}
              >
                {step.task}
              </p>

              {/* Shell command block with copy */}
              <div className="mt-2 rounded-lg bg-neutral-950 px-3 py-2 font-mono text-xs border border-neutral-800 flex items-center justify-between gap-2 overflow-x-auto shadow-inner">
                <code className="text-emerald-400 select-all whitespace-nowrap overflow-x-auto">
                  $ {commandStr}
                </code>
                <button
                  type="button"
                  onClick={() => handleCopyCommand(step.id, commandStr)}
                  className="text-neutral-500 hover:text-neutral-300 transition-colors shrink-0 p-1 rounded hover:bg-neutral-900"
                  title="Copy command"
                >
                  {copiedStepId === step.id ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* BOTTOM HALF: Integrated Terminal Window showing CI/CD responses */}
      <div className="h-44 shrink-0 flex flex-col pt-3 border-t border-neutral-200 dark:border-neutral-800">
        {/* Terminal Header */}
        <div className="flex items-center justify-between pb-2 shrink-0">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5" aria-hidden="true">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
            </div>
            <span className="text-xs font-mono font-semibold text-neutral-700 dark:text-neutral-300 ml-1">
              CI/CD Webhook Terminal (kubectl / GitHub / ArgoCD)
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono text-emerald-500 font-bold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              PIPELINE CONNECTED
            </span>
            {terminalLogs.length > 0 && (
              <button
                type="button"
                onClick={() => setTerminalLogs([])}
                className="text-[10px] font-mono text-neutral-400 hover:text-neutral-200 underline"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Monospace Terminal Body */}
        <div className="flex-1 bg-neutral-950 rounded-xl p-3 font-mono text-xs overflow-y-auto border border-neutral-800/80 space-y-1 select-text">
          {terminalLogs.map((log) => (
            <div 
              key={log.id}
              className={`leading-relaxed break-words ${
                log.type === 'command'
                  ? 'text-neutral-200 font-bold'
                  : log.type === 'success'
                  ? 'text-emerald-400'
                  : 'text-neutral-500'
              }`}
            >
              {log.text}
            </div>
          ))}
          <div ref={terminalEndRef} />
        </div>
      </div>
    </div>
  );
};

export default CommandCenter;
