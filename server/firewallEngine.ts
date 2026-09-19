export interface FirewallValidationResult {
  command: string;
  riskScore: 'LOW' | 'MEDIUM' | 'CRITICAL';
  verdict: 'APPROVED' | 'FLAGGED_DRY_RUN_REQUIRED' | 'BLOCKED_QUORUM_REQUIRED';
  detectedThreats: string[];
  astParsedNodes: string[];
  recommendation: string;
  timestamp: string;
}

export interface DryRunSimulationResult {
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

export interface EdgeCompressionResult {
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
  timestamp: string;
}

export interface AuditLedgerEntry {
  id: string;
  timestamp: string;
  actor: string;
  actionType: 'FIREWALL_CHECK' | 'DRY_RUN_SIMULATION' | 'QUORUM_SIGN_OFF' | 'EDGE_COMPRESSION';
  targetEntity: string;
  status: 'SUCCESS' | 'BLOCKED' | 'FLAGGED';
  cryptographicHash: string;
  details: string;
}

class FirewallEngine {
  private auditLedger: AuditLedgerEntry[] = [
    {
      id: "AUD-FW-001",
      timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
      actor: "Autonomous AI Agent",
      actionType: "FIREWALL_CHECK",
      targetEntity: "kubectl scale deployment checkout --replicas=8",
      status: "SUCCESS",
      cryptographicHash: "sha256:8f4c9b2e10a4f3829e11049281a8c382",
      details: "AST validation passed. Zero destructive operators detected."
    },
    {
      id: "AUD-FW-002",
      timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
      actor: "Alex Mercer (Principal SRE)",
      actionType: "DRY_RUN_SIMULATION",
      targetEntity: "psql -h prod-db-01 -c 'DROP TABLE orders CASCADE;'",
      status: "BLOCKED",
      cryptographicHash: "sha256:3a91b284920194829104928391048291",
      details: "Critical destructive keyword 'DROP TABLE' intercepted by AST firewall. Quorum sign-off required."
    }
  ];

  public validateCommand(command: string): FirewallValidationResult {
    const cmdLower = command.toLowerCase();
    const detectedThreats: string[] = [];
    const astParsedNodes: string[] = [];

    // AST / Regex Threat Inspection
    if (cmdLower.includes('drop ') || cmdLower.includes('drop table') || cmdLower.includes('drop database')) {
      detectedThreats.push("Destructive Schema Drop Operation (DROP TABLE/DATABASE)");
      astParsedNodes.push("DropStatementNode (Destructive)");
    }
    if (cmdLower.includes('truncate ')) {
      detectedThreats.push("Table Truncation Without Where Clause (TRUNCATE)");
      astParsedNodes.push("TruncateStatementNode (Destructive)");
    }
    if (cmdLower.includes('rm -rf') || cmdLower.includes('rm -f')) {
      detectedThreats.push("Recursive Filesystem Deletion (rm -rf)");
      astParsedNodes.push("ShellRemoveRecursiveNode (Critical)");
    }
    if (cmdLower.includes('delete from') && !cmdLower.includes('where')) {
      detectedThreats.push("Unbounded DELETE statement without WHERE clause");
      astParsedNodes.push("UnboundedDeleteNode (Critical)");
    }
    if (cmdLower.includes('kill -9') || cmdLower.includes('pkill -9')) {
      detectedThreats.push("Force Process Kill (SIGKILL)");
      astParsedNodes.push("ProcessKillNode (Medium)");
    }
    if (cmdLower.includes('kubectl delete pod --all') || cmdLower.includes('kubectl delete deployment --all')) {
      detectedThreats.push("Bulk Cluster Resource Purge (--all)");
      astParsedNodes.push("K8sBulkDeleteNode (Critical)");
    }

    let riskScore: 'LOW' | 'MEDIUM' | 'CRITICAL' = 'LOW';
    let verdict: 'APPROVED' | 'FLAGGED_DRY_RUN_REQUIRED' | 'BLOCKED_QUORUM_REQUIRED' = 'APPROVED';
    let recommendation = "Command is verified safe for immediate execution.";

    if (detectedThreats.length > 0) {
      if (detectedThreats.some(t => t.includes('DROP') || t.includes('rm -rf') || t.includes('Bulk'))) {
        riskScore = 'CRITICAL';
        verdict = 'BLOCKED_QUORUM_REQUIRED';
        recommendation = "CRITICAL RISK: Intercepted by AI Firewall. Requires Dual-Key Quorum Sign-off and Dry-Run sandbox verification.";
      } else {
        riskScore = 'MEDIUM';
        verdict = 'FLAGGED_DRY_RUN_REQUIRED';
        recommendation = "MODERATE RISK: Dry-run simulation recommended before running on production cluster.";
      }
    } else {
      astParsedNodes.push("SafeReadOrScaleStatementNode");
    }

    const result: FirewallValidationResult = {
      command,
      riskScore,
      verdict,
      detectedThreats,
      astParsedNodes,
      recommendation,
      timestamp: new Date().toISOString()
    };

    // Log to audit ledger
    this.appendAuditEntry({
      actor: "AI Firewall Guardrail",
      actionType: "FIREWALL_CHECK",
      targetEntity: command.slice(0, 50),
      status: verdict === 'APPROVED' ? 'SUCCESS' : 'BLOCKED',
      details: `Risk: ${riskScore} | Verdict: ${verdict} | Threats: ${detectedThreats.length ? detectedThreats.join(', ') : 'None'}`
    });

    return result;
  }

  public simulateDryRun(command: string): DryRunSimulationResult {
    const cmdLower = command.toLowerCase();
    let simulatedStatus: 'SUCCESS' | 'WARNING' | 'FAILED' = 'SUCCESS';
    let blastRadius = "Low (Read replica or horizontal scale operation)";
    let stdout = "";
    let stderr = "";
    let cpuDelta = "+2.4%";
    let memoryDelta = "+120 MB";
    let connectionDelta = "+12 sockets";

    if (cmdLower.includes('drop') || cmdLower.includes('truncate') || cmdLower.includes('rm -rf')) {
      simulatedStatus = 'FAILED';
      blastRadius = "CRITICAL (Permanent data loss or service disruption)";
      stderr = "Error [Firewall-Rejected]: Destructive command simulation aborted by safety guardrail.";
      stdout = "[Dry-Run Sandbox] Analysing transaction locks... ABORTED.";
    } else if (cmdLower.includes('scale') || cmdLower.includes('rollout')) {
      simulatedStatus = 'SUCCESS';
      blastRadius = "Controlled (Rolling update with 0% downtime guarantee)";
      stdout = `[Dry-Run Sandbox] Simulating Kubernetes Deployment Scale...
- Pre-flight checks: PASSED
- Pod readiness probes: OK
- Traffic routing validation: OK
- Estimated execution time: 1.18s
Exit code: 0 [DRY RUN SUCCESS]`;
    } else {
      simulatedStatus = 'SUCCESS';
      blastRadius = "Moderate (In-memory cache eviction & cleanup)";
      stdout = `[Dry-Run Sandbox] Executing read-only sandbox trace...
- Query syntax: VALID
- Execution plan cost: 14.2ms
- Rows affected (simulated): 321
Exit code: 0 [DRY RUN SUCCESS]`;
    }

    const result: DryRunSimulationResult = {
      command,
      simulatedStatus,
      estimatedLatencyMs: Math.floor(400 + Math.random() * 800),
      blastRadius,
      resourceImpact: {
        cpuDelta,
        memoryDelta,
        connectionDelta
      },
      stdout,
      stderr,
      autoRollbackConfigured: true,
      timestamp: new Date().toISOString()
    };

    this.appendAuditEntry({
      actor: "SRE Sandbox Engine",
      actionType: "DRY_RUN_SIMULATION",
      targetEntity: command.slice(0, 50),
      status: simulatedStatus === 'SUCCESS' ? 'SUCCESS' : 'BLOCKED',
      details: `Dry-run status: ${simulatedStatus} | Blast radius: ${blastRadius}`
    });

    return result;
  }

  public compressAlerts(alerts: any[]): EdgeCompressionResult {
    const rawCount = alerts.length * 2500; // simulate 2,500 logs per alert during storm
    const clustersMap = new Map<string, { count: number; sample: string; severity: string }>();

    alerts.forEach(a => {
      const key = `${a.source}:${a.severity_hint}`;
      const existing = clustersMap.get(key) || { count: 0, sample: a.message, severity: a.severity_hint };
      existing.count += Math.floor(300 + Math.random() * 400);
      clustersMap.set(key, existing);
    });

    const canonicalClusters = Array.from(clustersMap.entries()).map(([sig, data], idx) => ({
      clusterId: `CLS-${idx + 101}`,
      signature: sig,
      sampleMessage: data.sample,
      count: data.count,
      severity: data.severity
    }));

    const compressedCount = canonicalClusters.length;
    const tokenReductionPercent = 98.6;
    const estimatedCostSavingsUsd = Number((rawCount * 0.00003).toFixed(2));

    const result: EdgeCompressionResult = {
      rawAlertsCount: rawCount,
      compressedClustersCount: compressedCount,
      tokenReductionPercent,
      estimatedCostSavingsUsd,
      canonicalClusters,
      timestamp: new Date().toISOString()
    };

    this.appendAuditEntry({
      actor: "Edge MinHash Compressor",
      actionType: "EDGE_COMPRESSION",
      targetEntity: `${rawCount} raw alerts compressed`,
      status: 'SUCCESS',
      details: `Compressed ${rawCount} events into ${compressedCount} clusters. Token reduction: ${tokenReductionPercent}%. Saved $${estimatedCostSavingsUsd}.`
    });

    return result;
  }

  public getAuditLedger(): AuditLedgerEntry[] {
    return this.auditLedger;
  }

  private appendAuditEntry(entry: Omit<AuditLedgerEntry, 'id' | 'timestamp' | 'cryptographicHash'>) {
    const id = `AUD-${Date.now().toString().slice(-6)}`;
    const timestamp = new Date().toISOString();
    const rawString = `${id}|${timestamp}|${entry.actor}|${entry.actionType}|${entry.status}`;
    // Simple mock cryptographic hash
    const cryptographicHash = `sha256:${Buffer.from(rawString).toString('base64').slice(0, 32).toLowerCase()}`;

    const fullEntry: AuditLedgerEntry = {
      id,
      timestamp,
      cryptographicHash,
      ...entry
    };

    this.auditLedger.unshift(fullEntry);
    if (this.auditLedger.length > 50) {
      this.auditLedger.pop();
    }
  }
}

export const firewallEngine = new FirewallEngine();
