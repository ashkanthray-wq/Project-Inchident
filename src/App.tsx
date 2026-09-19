import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { RawAlert, Incident, TriageState, PastIncident } from './types';
import { Sidebar } from './components/Sidebar';
import { TopAppBar } from './components/TopAppBar';
import { GlobalSearchModal } from './components/GlobalSearchModal';
import { PagerEmergencyPulse } from './components/PagerEmergencyPulse';
import { IncidentsKanbanPage } from './pages/IncidentsKanbanPage';
import { IncidentDeepDivePage } from './pages/IncidentDeepDivePage';
import { NoiseStreamPage } from './pages/NoiseStreamPage';
import { PostMortemsPage } from './pages/PostMortemsPage';
import { IntegrationsPage } from './pages/IntegrationsPage';

export default function App() {
  const [alerts, setAlerts] = useState<RawAlert[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [pastIncidents, setPastIncidents] = useState<PastIncident[]>([]);
  const [incident, setIncident] = useState<Incident | null>(null);
  const [triageState, setTriageState] = useState<TriageState>('IDLE');
  const [isUpdatingStep, setIsUpdatingStep] = useState<boolean>(false);
  const [isChaosActive, setIsChaosActive] = useState<boolean>(false);
  const [isStreamPaused, setIsStreamPaused] = useState<boolean>(false);
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [pagerStatus, setPagerStatus] = useState<'on_call' | 'paged'>('on_call');
  const [emergencyAlertActive, setEmergencyAlertActive] = useState<boolean>(false);
  
  // Theme state: default to 'light', supports 'dark'
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('ops_theme');
    if (saved === 'dark' || saved === 'light') return saved;
    return 'light';
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('ops_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Keyboard shortcut listener for Cmd+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const fetchAlerts = async () => {
    if (isStreamPaused) return;
    try {
      const res = await fetch('/api/alerts');
      if (res.ok) {
        const data = await res.json();
        setAlerts(data);
      }
    } catch (err) {
      console.error('Failed to load alerts', err);
    }
  };

  const fetchIncidents = async () => {
    try {
      const res = await fetch('/api/incidents');
      if (res.ok) {
        const data: Incident[] = await res.json();
        setIncidents(data);
        if (data.length > 0 && !incident) {
          setIncident(data[0]);
        }
      }
    } catch (err) {
      console.error('Failed to load incidents', err);
    }
  };

  const fetchPastIncidents = async () => {
    try {
      const res = await fetch('/api/past-incidents');
      if (res.ok) {
        const data = await res.json();
        setPastIncidents(data);
      }
    } catch (err) {
      console.error('Failed to load past incidents', err);
    }
  };

  useEffect(() => {
    fetchAlerts();
    fetchIncidents();
    fetchPastIncidents();

    // Check chaos simulation status
    fetch('/api/simulate/status')
      .then(res => res.json())
      .then(data => {
        if (data && typeof data.running === 'boolean') {
          setIsChaosActive(data.running);
        }
      })
      .catch(() => {});
  }, []);

  // Poll alerts every 3s if chaos active and stream not paused
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isChaosActive && !isStreamPaused) {
      interval = setInterval(() => {
        fetchAlerts();
      }, 3000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isChaosActive, isStreamPaused]);

  // Toggle chaos stream simulation loop
  const handleToggleChaos = async () => {
    try {
      if (isChaosActive) {
        const res = await fetch('/api/simulate/stop', { method: 'POST' });
        if (res.ok) setIsChaosActive(false);
      } else {
        const res = await fetch('/api/simulate/start', { method: 'POST' });
        if (res.ok) setIsChaosActive(true);
      }
    } catch (err) {
      console.error('Failed to toggle chaos simulator', err);
    }
  };

  // Inject a single chaos anomaly alert
  const handleInjectAlert = async () => {
    try {
      const res = await fetch('/api/alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          source: 'AWS CloudWatch',
          severity_hint: 'CRITICAL',
          message: 'Postgres RDS Replica IOPS saturated (99.8%). Lock contention on table orders_v2.',
          metadata: { host: 'rds-orders-replica-01', region: 'us-east-1', iops: 12400 }
        })
      });
      if (res.ok) {
        await fetchAlerts();
      }
    } catch (err) {
      console.error('Failed to inject alert', err);
    }
  };

  // Trigger Gemini AI Incident Triage
  const handleTriggerTriage = async (): Promise<Incident | null> => {
    try {
      setTriageState('TRIAGING');
      const res = await fetch('/api/triage', { method: 'POST' });
      const data: Incident = await res.json();
      setIncident(data);
      setIncidents(prev => [data, ...prev.filter(i => i.id !== data.id)]);
      setTriageState('RESOLVING');
      
      // If SEV-1, trigger emergency pager chime & outer border pulse!
      if (data.severity === 'SEV-1') {
        setPagerStatus('paged');
        setEmergencyAlertActive(true);
      }
      return data;
    } catch (err) {
      console.error('Failed to triage alerts', err);
      setTriageState('IDLE');
      return null;
    }
  };

  // Toggle runbook step completion via backend REST endpoint
  const handleToggleStep = async (stepId: number, completed: boolean, targetIncidentId?: string) => {
    const incId = targetIncidentId || incident?.id;
    if (!incId) return;
    const currentTarget = incidents.find(i => i.id === incId) || incident;
    if (!currentTarget) return;

    try {
      setIsUpdatingStep(true);
      const updatedSteps = currentTarget.runbook_steps.map(step =>
        step.id === stepId ? { ...step, completed } : step
      );
      const updatedIncident = { ...currentTarget, runbook_steps: updatedSteps };
      if (incident?.id === incId) {
        setIncident(updatedIncident);
      }
      setIncidents(prev => prev.map(i => i.id === incId ? updatedIncident : i));

      const res = await fetch(`/api/incidents/${incId}/step`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stepId, completed })
      });

      if (res.ok) {
        const syncedIncident: Incident = await res.json();
        if (incident?.id === incId) {
          setIncident(syncedIncident);
        }
        setIncidents(prev => prev.map(i => i.id === incId ? syncedIncident : i));
      }
    } catch (err) {
      console.error('Failed to update step', err);
    } finally {
      setIsUpdatingStep(false);
    }
  };

  // Update incident status
  const handleStatusChange = async (id: string, newStatus: 'investigating' | 'mitigating' | 'resolved') => {
    try {
      const res = await fetch(`/api/incidents/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        const updated: Incident = await res.json();
        setIncidents(prev => prev.map(i => i.id === id ? updated : i));
        if (incident?.id === id) setIncident(updated);
      }
    } catch (err) {
      console.error('Failed to update status', err);
    }
  };

  // Reset database state
  const handleReset = async () => {
    try {
      await fetch('/api/simulate/stop', { method: 'POST' });
      setIsChaosActive(false);
      await fetch('/api/reset', { method: 'POST' });
      setTriageState('IDLE');
      setPagerStatus('on_call');
      setEmergencyAlertActive(false);
      await fetchAlerts();
      await fetchIncidents();
      await fetchPastIncidents();
    } catch (err) {
      console.error('Failed to reset', err);
    }
  };

  // Toggle pager status manually to test emergency chime and pulse
  const handleTogglePagerStatus = () => {
    if (pagerStatus === 'on_call') {
      setPagerStatus('paged');
      setEmergencyAlertActive(true);
    } else {
      setPagerStatus('on_call');
      setEmergencyAlertActive(false);
    }
  };

  const sev1Count = incidents.filter(i => i.severity === 'SEV-1').length;

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 flex flex-row font-sans selection:bg-rose-500/20 antialiased overflow-x-hidden">
        
        {/* Pager Emergency Red Pulse Border & Alert */}
        <PagerEmergencyPulse
          isActive={emergencyAlertActive}
          message={`SEV-1 EMERGENCY: Infrastructure outage detected on ${incident?.title || 'Production Mesh'}. Primary SRE paged.`}
          onDismiss={() => setEmergencyAlertActive(false)}
        />

        {/* Global Search Modal (Cmd+K) */}
        <GlobalSearchModal
          isOpen={isSearchOpen}
          onClose={() => setIsSearchOpen(false)}
          incidents={incidents}
          alerts={alerts}
          pastIncidents={pastIncidents}
        />

        {/* Global Navigation: Left-Rail Sidebar */}
        <Sidebar
          sev1Count={sev1Count}
          alertCount={alerts.length}
          isChaosActive={isChaosActive}
          onToggleChaos={handleToggleChaos}
          onReset={handleReset}
        />

        {/* Main Content Area: Top App Bar + Dynamic Route Views */}
        <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
          {/* Top App Bar (Persistent) */}
          <TopAppBar
            onOpenSearch={() => setIsSearchOpen(true)}
            pagerStatus={pagerStatus}
            onTogglePagerStatus={handleTogglePagerStatus}
            theme={theme}
            onToggleTheme={toggleTheme}
            activeIncident={incident}
          />

          {/* Page View Canvas */}
          <main className="flex-1 p-6 lg:p-8 max-w-7xl w-full mx-auto">
            <Routes>
              {/* Default Landing Page: Active Incidents Kanban */}
              <Route path="/" element={<Navigate to="/incidents" replace />} />

              {/* Route: Active Incidents (/incidents) */}
              <Route
                path="/incidents"
                element={
                  <IncidentsKanbanPage
                    incidents={incidents}
                    onTriggerTriage={handleTriggerTriage}
                    triageState={triageState}
                    onStatusChange={handleStatusChange}
                  />
                }
              />

              {/* Route: Command Center Deep Dive (/incidents/:id) */}
              <Route
                path="/incidents/:id"
                element={
                  <IncidentDeepDivePage
                    incidents={incidents}
                    onToggleStep={handleToggleStep}
                    isUpdatingStep={isUpdatingStep}
                    onRefreshIncidents={fetchIncidents}
                  />
                }
              />

              {/* Route: The Noise Stream (/alerts) */}
              <Route
                path="/alerts"
                element={
                  <NoiseStreamPage
                    alerts={alerts}
                    onTriggerTriage={handleTriggerTriage}
                    isPaused={isStreamPaused}
                    onTogglePause={() => setIsStreamPaused(prev => !prev)}
                    onInjectAlert={handleInjectAlert}
                  />
                }
              />

              {/* Route: Post-Mortems Archive (/post-mortems) */}
              <Route
                path="/post-mortems"
                element={<PostMortemsPage />}
              />

              {/* Route: Integrations Onboarding (/integrations) */}
              <Route
                path="/integrations"
                element={<IntegrationsPage />}
              />

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/incidents" replace />} />
            </Routes>
          </main>
        </div>
      </div>
    </BrowserRouter>
  );
}
