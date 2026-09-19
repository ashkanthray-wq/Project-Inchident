import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, ShieldCheck, Terminal, Play, CheckCircle2, AlertTriangle, 
  Lock, RefreshCw, Cpu, Database, Activity, FileText, Zap, KeyRound
} from 'lucide-react';

interface FirewallResult {
  command: string;
  riskScore: 'LOW' | 'MEDIUM' | 'CRITICAL';
  verdict: 'APPROVED' | 'FLAGGED_DRY_RUN_REQUIRED' | 'BLOCKED_QUORUM_REQUIRED';
  detectedThreats: string[];
  astParsedNodes: string[];
  recommendation: string;
  timestamp: string;
}

interface DryRunResult {
  command: string;
  simulatedStatus: 'SUCCESS' | 'WARNING' | 'FAILED';
  estimatedLatencyMs: number;
  blastRadius: string;
  resourceImpact: {
    cpuDelta: string;
    memoryDelta: string;
    connectionDelta: string;
  };
  stdout: string;
  stderr: string;
  autoRollbackConfigured: boolean;
  timestamp: string;
}

interface CompressionResult {
  rawAlertsCount: number;
  compressedClustersCount: number;
  tokenReductionPercent: number;
  estimatedCostSavingsUsd: number;
  canonicalClusters: {
    clusterId: string;
    signature: string;
    sampleMessage: string;
    count: number;
    severity: string;
  }[];
}

interface AuditEntry {
  id: string;
  timestamp: string;
  actor: string;
  actionType: string;
  targetEntity: string;
  status: string;
  cryptographicHash: string;
  details: string;
}

const PRESET_COMMANDS = [
  { label: "Safe Scale: Kubernetes Deployment", cmd: "kubectl scale deployment checkout --replicas=8 -n production" },
  { label: "Safe Read: Postgres Lock Clean", cmd: "psql -h prod-db-01 -c \"SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE wait_event_type = 'Lock';\"" },
  { label: "Critical Destructive: Drop Table", cmd: "psql -h prod-db-01 -c \"DROP TABLE orders CASCADE;\"" },
  { label: "Critical Destructive: Bulk Pod Delete", cmd: "kubectl delete pods --all -n production --force" },
  { label: "Moderate Risk: Force Process Kill", cmd: "pkill -9 -f redis-server" }
];

export function AiFirewallSandboxPage() {
  const [activeTab, setActiveTab] = useState<'firewall' | 'compression' | 'audit'>('firewall');
  const [commandInput, setCommandInput] = useState<string>(PRESET_COMMANDS[0].cmd);
  const [firewallResult, setFirewallResult] = useState<FirewallResult | null>(null);
  const [dryRunResult, setDryRunResult] = useState<DryRunResult | null>(null);
  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);

  // Edge compression stats
  const [compressionStats, setCompressionStats] = useState<CompressionResult | null>(null);
  const [auditLedger, setAuditLedger] = useState<AuditEntry[]>([]);
  const [quorumUnlocked, setQuorumUnlocked] = useState<boolean>(false);

  useEffect(() => {
    fetchCompressionStats();
    fetchAuditLedger();
    // Run initial validation
    handleValidate(PRESET_COMMANDS[0].cmd);
  }, []);

  const fetchCompressionStats = async () => {
    try {
      const res = await fetch('/api/alerts/compress', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setCompressionStats(data);
      }
    } catch (err) {
      console.error('Failed to fetch compression stats', err);
    }
  };

  const fetchAuditLedger = async () => {
    try {
      const res = await fetch('/api/firewall/audit-ledger');
      if (res.ok) {
        const data = await res.json();
        setAuditLedger(data);
      }
    } catch (err) {
      console.error('Failed to fetch audit ledger', err);
    }
  };

  const handleValidate = async (cmdToTest?: string) => {
    const targetCmd = cmdToTest || commandInput;
    if (!targetCmd.trim()) return;
    setIsEvaluating(true);
    try {
      const res = await fetch('/api/firewall/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command: targetCmd })
      });
      if (res.ok) {
        const data = await res.json();
        setFirewallResult(data);
        setDryRunResult(null); // reset dry run
        setQuorumUnlocked(false);
      }
    } catch (err) {
      console.error('Failed to validate command', err);
    } finally {
      setIsEvaluating(false);
      fetchAuditLedger();
    }
  };

  const handleDryRun = async () => {
    if (!commandInput.trim()) return;
    setIsSimulating(true);
    try {
      const res = await fetch('/api/firewall/dry-run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command: commandInput })
      });
      if (res.ok) {
        const data = await res.json();
        setDryRunResult(data);
      }
    } catch (err) {
      console.error('Failed to simulate dry-run', err);
    } finally {
      setIsSimulating(false);
      fetchAuditLedger();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 font-mono text-xs font-semibold tracking-wider uppercase mb-1">
            <ShieldCheck className="w-4 h-4" /> AI Firewall & Deterministic Pre-Flight Guardrail
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
            SRE Safety, Token Capping & AST Risk Firewall
          </h1>
          <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1 max-w-2xl">
            Air-gapping LLM reasoning from production execution. Intercepts all AI diagnostic commands, performs AST threat analysis, simulates sandbox dry-runs, and compresses alert storms at the edge for flat O(1) token costs.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center bg-neutral-100 dark:bg-neutral-800 p-1 rounded-lg self-start">
          <button
            onClick={() => setActiveTab('firewall')}
            className={`px-4 py-2 rounded-md text-xs font-medium transition-colors ${
              activeTab === 'firewall'
                ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 shadow-xs'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200'
            }`}
          >
            AST Firewall & Sandbox
          </button>
          <button
            onClick={() => setActiveTab('compression')}
            className={`px-4 py-2 rounded-md text-xs font-medium transition-colors ${
              activeTab === 'compression'
                ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 shadow-xs'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200'
            }`}
          >
            Edge Token Capping
          </button>
          <button
            onClick={() => setActiveTab('audit')}
            className={`px-4 py-2 rounded-md text-xs font-medium transition-colors ${
              activeTab === 'audit'
                ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 shadow-xs'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200'
            }`}
          >
            SOC2 Audit Ledger
          </button>
        </div>
      </div>

      {activeTab === 'firewall' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Command Testbed & Presets */}
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-5 shadow-xs space-y-4">
              <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                <Terminal className="w-4 h-4 text-neutral-500" /> Command Testbed
              </h2>

              {/* Preset Selector */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-neutral-500">Quick Test Scenarios</label>
                <div className="space-y-1.5">
                  {PRESET_COMMANDS.map((item, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setCommandInput(item.cmd);
                        handleValidate(item.cmd);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-lg text-xs font-mono transition-colors border ${
                        commandInput === item.cmd
                          ? 'bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300'
                          : 'bg-neutral-50 dark:bg-neutral-800/50 border-neutral-200 dark:border-neutral-700/60 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                      }`}
                    >
                      <div className="font-semibold text-neutral-900 dark:text-neutral-100 mb-0.5">{item.label}</div>
                      <div className="truncate text-[11px] text-neutral-500">{item.cmd}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Command Input */}
              <div className="space-y-2 pt-2">
                <label className="text-xs font-medium text-neutral-500">Custom Runbook Command</label>
                <textarea
                  value={commandInput}
                  onChange={(e) => setCommandInput(e.target.value)}
                  rows={4}
                  className="w-full font-mono text-xs bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg p-3 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                  placeholder="Enter shell or kubectl command..."
                />
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  onClick={() => handleValidate()}
                  disabled={isEvaluating}
                  className="flex-1 bg-neutral-900 dark:bg-neutral-100 hover:bg-neutral-800 dark:hover:bg-neutral-200 text-white dark:text-neutral-900 font-medium text-xs py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors shadow-xs"
                >
                  {isEvaluating ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      Analyzing AST...
                    </>
                  ) : (
                    <>
                      <ShieldAlert className="w-3.5 h-3.5" /> Run Firewall Check
                    </>
                  )}
                </button>

                <button
                  onClick={handleDryRun}
                  disabled={isSimulating}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors shadow-xs"
                >
                  {isSimulating ? (
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5" /> Dry-Run
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Firewall Verdict & Dry-Run Output */}
          <div className="lg:col-span-2 space-y-4">
            {/* Firewall Verdict Box */}
            <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 pb-3">
                <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-rose-500" /> AI Firewall AST Verdict
                </h2>
                {firewallResult && (
                  <span className={`px-2.5 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider ${
                    firewallResult.riskScore === 'CRITICAL' 
                      ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-300 dark:border-rose-900'
                      : firewallResult.riskScore === 'MEDIUM'
                      ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300 dark:border-amber-900'
                      : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-900'
                  }`}>
                    Risk: {firewallResult.riskScore}
                  </span>
                )}
              </div>

              {firewallResult ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-neutral-50 dark:bg-neutral-800/50 p-3 rounded-lg border border-neutral-200 dark:border-neutral-700/60">
                      <div className="text-[11px] font-medium text-neutral-500 uppercase tracking-wider mb-1">Safety Verdict</div>
                      <div className="font-mono text-xs font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-1.5">
                        {firewallResult.verdict === 'APPROVED' && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                        {firewallResult.verdict === 'FLAGGED_DRY_RUN_REQUIRED' && <AlertTriangle className="w-4 h-4 text-amber-500" />}
                        {firewallResult.verdict === 'BLOCKED_QUORUM_REQUIRED' && <Lock className="w-4 h-4 text-rose-500" />}
                        {firewallResult.verdict}
                      </div>
                    </div>

                    <div className="bg-neutral-50 dark:bg-neutral-800/50 p-3 rounded-lg border border-neutral-200 dark:border-neutral-700/60">
                      <div className="text-[11px] font-medium text-neutral-500 uppercase tracking-wider mb-1">AST Parsed Nodes</div>
                      <div className="font-mono text-xs text-neutral-700 dark:text-neutral-300 truncate">
                        {firewallResult.astParsedNodes.join(', ')}
                      </div>
                    </div>
                  </div>

                  {/* Detected Threats */}
                  {firewallResult.detectedThreats.length > 0 && (
                    <div className="bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/60 rounded-lg p-3 space-y-1.5">
                      <div className="text-xs font-semibold text-rose-800 dark:text-rose-300 flex items-center gap-1.5">
                        <AlertTriangle className="w-4 h-4" /> Detected Destructive Vulnerabilities
                      </div>
                      <ul className="list-disc list-inside text-xs text-rose-700 dark:text-rose-400 space-y-1 font-mono">
                        {firewallResult.detectedThreats.map((t, idx) => (
                          <li key={idx}>{t}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Recommendation */}
                  <div className="text-xs text-neutral-600 dark:text-neutral-400 bg-neutral-100 dark:bg-neutral-800 p-3 rounded-lg font-mono">
                    <span className="font-semibold text-neutral-900 dark:text-neutral-200">Guardrail Policy:</span> {firewallResult.recommendation}
                  </div>

                  {/* Quorum Sign-Off Override if Blocked */}
                  {firewallResult.verdict === 'BLOCKED_QUORUM_REQUIRED' && (
                    <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60 rounded-xl p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs font-semibold text-amber-900 dark:text-amber-300">
                          <KeyRound className="w-4 h-4" /> Dual-Key Quorum Authorization Required
                        </div>
                        <span className="text-[11px] font-mono text-amber-700 dark:text-amber-400">1/2 Sign-offs</span>
                      </div>
                      <p className="text-xs text-amber-800 dark:text-amber-400">
                        This command carries destructive schema or cluster deletion risk. To override the AI firewall guardrail, a second Senior SRE must approve this operation.
                      </p>
                      <button
                        onClick={() => setQuorumUnlocked(true)}
                        disabled={quorumUnlocked}
                        className={`w-full py-2 px-4 rounded-lg font-medium text-xs transition-colors flex items-center justify-center gap-2 ${
                          quorumUnlocked 
                            ? 'bg-emerald-600 text-white cursor-default'
                            : 'bg-amber-600 hover:bg-amber-500 text-white shadow-xs'
                        }`}
                      >
                        {quorumUnlocked ? (
                          <>
                            <CheckCircle2 className="w-4 h-4" /> Quorum Authorization Granted (Signed by Alex Mercer & Sarah Chen)
                          </>
                        ) : (
                          <>
                            <Lock className="w-4 h-4" /> Provide Senior SRE Quorum Sign-Off
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="py-8 text-center text-xs text-neutral-500 font-mono">
                  Select or enter a command to run AST firewall evaluation.
                </div>
              )}
            </div>

            {/* Dry-Run Sandbox Terminal Output */}
            <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 pb-3">
                <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-emerald-500" /> Dry-Run Sandbox Simulation Output
                </h2>
                {dryRunResult && (
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-mono font-bold ${
                    dryRunResult.simulatedStatus === 'SUCCESS' 
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                      : 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                  }`}>
                    {dryRunResult.simulatedStatus}
                  </span>
                )}
              </div>

              {dryRunResult ? (
                <div className="space-y-4 font-mono">
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-neutral-50 dark:bg-neutral-800/50 p-2.5 rounded-lg border border-neutral-200 dark:border-neutral-700/60 text-center">
                      <div className="text-[10px] text-neutral-500">Latency</div>
                      <div className="text-xs font-bold text-neutral-900 dark:text-neutral-100">{dryRunResult.estimatedLatencyMs}ms</div>
                    </div>
                    <div className="bg-neutral-50 dark:bg-neutral-800/50 p-2.5 rounded-lg border border-neutral-200 dark:border-neutral-700/60 text-center">
                      <div className="text-[10px] text-neutral-500">Auto-Rollback</div>
                      <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400">Enabled</div>
                    </div>
                    <div className="bg-neutral-50 dark:bg-neutral-800/50 p-2.5 rounded-lg border border-neutral-200 dark:border-neutral-700/60 text-center">
                      <div className="text-[10px] text-neutral-500">Blast Radius</div>
                      <div className="text-xs font-bold text-neutral-900 dark:text-neutral-100 truncate">{dryRunResult.blastRadius.split(' ')[0]}</div>
                    </div>
                  </div>

                  {/* Terminal Screen */}
                  <div className="bg-neutral-950 text-neutral-100 rounded-lg p-4 text-xs font-mono space-y-2 overflow-x-auto border border-neutral-800">
                    <div className="text-neutral-500 flex items-center justify-between pb-2 border-b border-neutral-800">
                      <span>CONTAINER WORKER SANDBOX [node-sre-04]</span>
                      <span>{new Date(dryRunResult.timestamp).toLocaleTimeString()}</span>
                    </div>
                    <pre className="whitespace-pre-wrap text-emerald-400">{dryRunResult.stdout}</pre>
                    {dryRunResult.stderr && <pre className="whitespace-pre-wrap text-rose-400">{dryRunResult.stderr}</pre>}
                  </div>
                </div>
              ) : (
                <div className="py-8 text-center text-xs text-neutral-500 font-mono">
                  Click "Dry-Run" to test command execution in the isolated container sandbox.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'compression' && compressionStats && (
        <div className="space-y-6">
          {/* Top Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-5 shadow-xs">
              <div className="text-xs font-medium text-neutral-500 mb-1">Raw Alert Ingestion</div>
              <div className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 font-mono">
                {compressionStats.rawAlertsCount.toLocaleString()} events
              </div>
              <div className="text-[11px] text-rose-600 dark:text-rose-400 mt-1">Spike volume during outage</div>
            </div>

            <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-5 shadow-xs">
              <div className="text-xs font-medium text-neutral-500 mb-1">Edge Compressed Clusters</div>
              <div className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 font-mono">
                {compressionStats.compressedClustersCount} canonical
              </div>
              <div className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1">O(1) sliding window deduplication</div>
            </div>

            <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-5 shadow-xs">
              <div className="text-xs font-medium text-neutral-500 mb-1">Token Reduction</div>
              <div className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 font-mono">
                {compressionStats.tokenReductionPercent}%
              </div>
              <div className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1">Zero LLM context overflow</div>
            </div>

            <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-5 shadow-xs">
              <div className="text-xs font-medium text-neutral-500 mb-1">Outage Cost Savings</div>
              <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                ${compressionStats.estimatedCostSavingsUsd}
              </div>
              <div className="text-[11px] text-neutral-500 mt-1">Insulated from outage tax</div>
            </div>
          </div>

          {/* Canonical Clusters Table */}
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-6 shadow-xs space-y-4">
            <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-500" /> Active Edge MinHash Canonical Clusters
            </h2>
            <div className="divide-y divide-neutral-200 dark:divide-neutral-800">
              {compressionStats.canonicalClusters.map((cluster) => (
                <div key={cluster.clusterId} className="py-3 flex items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-neutral-900 dark:text-neutral-100">{cluster.clusterId}</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300">
                        {cluster.signature}
                      </span>
                    </div>
                    <div className="text-xs text-neutral-600 dark:text-neutral-400 font-mono mt-1">{cluster.sampleMessage}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-bold font-mono text-neutral-900 dark:text-neutral-100">{cluster.count.toLocaleString()} grouped</div>
                    <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono">Suppressed noise</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'audit' && (
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
              <FileText className="w-4 h-4 text-indigo-500" /> Immutable SOC2 Cryptographic Audit Ledger
            </h2>
            <button
              onClick={fetchAuditLedger}
              className="text-xs font-mono text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 flex items-center gap-1"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Refresh Ledger
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-neutral-200 dark:border-neutral-800 text-[11px] font-mono font-semibold text-neutral-500 uppercase">
                  <th className="py-3 px-4">Event ID</th>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Actor</th>
                  <th className="py-3 px-4">Action</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Cryptographic Hash</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800 font-mono text-xs">
                {auditLedger.map((entry) => (
                  <tr key={entry.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/40">
                    <td className="py-3 px-4 font-bold text-neutral-900 dark:text-neutral-100">{entry.id}</td>
                    <td className="py-3 px-4 text-neutral-500">{new Date(entry.timestamp).toLocaleTimeString()}</td>
                    <td className="py-3 px-4 text-neutral-700 dark:text-neutral-300">{entry.actor}</td>
                    <td className="py-3 px-4">
                      <div className="text-neutral-900 dark:text-neutral-100">{entry.actionType}</div>
                      <div className="text-[11px] text-neutral-500 truncate max-w-xs">{entry.targetEntity}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        entry.status === 'SUCCESS' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300' : 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                      }`}>
                        {entry.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-neutral-400 text-[11px] truncate max-w-[180px]" title={entry.cryptographicHash}>
                      {entry.cryptographicHash}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
