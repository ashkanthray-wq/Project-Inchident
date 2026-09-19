import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  ShieldAlert, 
  RotateCcw, 
  ChevronDown, 
  Sun, 
  Moon,
  Zap,
  Check,
  Flame,
  LayoutDashboard,
  Kanban
} from 'lucide-react';

interface HeaderProps {
  onReset: () => void;
  isResetting: boolean;
  onSelectScenario: (scenario: string) => void;
  currentScenario: string;
  isSimulating: boolean;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  alertCount: number;
  isChaosActive?: boolean;
  onToggleChaos?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onReset,
  isResetting,
  onSelectScenario,
  currentScenario,
  isSimulating,
  theme,
  onToggleTheme,
  alertCount,
  isChaosActive = false,
  onToggleChaos,
}) => {
  const [dropdownOpen, setDropdownOpen] = useState<boolean>(false);

  const scenarios = [
    {
      id: 'checkout_failure',
      name: 'Checkout Gateway Failure',
      severity: 'SEV-1',
      desc: 'RDS CPU exhaustion & 504 gateway timeouts'
    },
    {
      id: 'auth_outage',
      name: 'Global Auth Outage',
      severity: 'SEV-1',
      desc: 'OAuth loop & Redis session OOM'
    },
    {
      id: 'memory_leak',
      name: 'V8 Heap Memory Leak',
      severity: 'SEV-1',
      desc: 'ECS task crashloops & GC pause spikes'
    }
  ];

  const currentScenarioObj = scenarios.find(s => s.id === currentScenario) || scenarios[0];

  return (
    <header 
      role="banner"
      className="w-full border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 transition-colors duration-200"
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-5 flex items-center justify-between">
        
        {/* Brand */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <div 
              aria-hidden="true" 
              className="w-9 h-9 rounded-lg bg-rose-600 dark:bg-rose-500 flex items-center justify-center text-white"
            >
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-base font-semibold text-neutral-900 dark:text-neutral-50 tracking-tight leading-none">
                Ops Incident Commander
              </h1>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                Autonomous multi-source alert triage & runbook engine
              </p>
            </div>
          </div>

          {/* Navigation links */}
          <nav aria-label="Main Navigation" className="hidden sm:flex items-center gap-1 bg-neutral-100 dark:bg-neutral-900 p-1 rounded-xl border border-neutral-200 dark:border-neutral-800">
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                `inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 shadow-xs'
                    : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100'
                }`
              }
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Dashboard</span>
            </NavLink>

            <NavLink
              to="/incidents"
              className={({ isActive }) =>
                `inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 shadow-xs'
                    : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100'
                }`
              }
            >
              <Kanban className="w-3.5 h-3.5" />
              <span>Incidents</span>
            </NavLink>
          </nav>
        </div>

        {/* Controls */}
        <nav aria-label="Incident Commander Controls" className="flex items-center gap-3">
          
          {/* Chaos Lab Dropdown */}
          <div className="relative">
            <button
              id="btn-chaos-lab"
              type="button"
              aria-haspopup="listbox"
              aria-expanded={dropdownOpen}
              aria-label={`Scenario: ${currentScenarioObj.name}. Click to switch scenario.`}
              onClick={() => setDropdownOpen(!dropdownOpen)}
              disabled={isSimulating}
              className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-lg transition-colors border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-800 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-800 focus-visible:outline-rose-600"
            >
              <Zap className={`w-3.5 h-3.5 text-amber-600 dark:text-amber-400 ${isSimulating ? 'animate-pulse' : ''}`} aria-hidden="true" />
              <span className="hidden sm:inline text-neutral-500 dark:text-neutral-400">Scenario:</span>
              <span className="font-semibold">{currentScenarioObj.name}</span>
              <ChevronDown className="w-3.5 h-3.5 text-neutral-500" aria-hidden="true" />
            </button>

            {dropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-30"
                  onClick={() => setDropdownOpen(false)}
                  aria-hidden="true"
                />
                <div 
                  role="listbox" 
                  aria-label="Failure scenarios"
                  className="absolute right-0 mt-2 w-80 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-lg py-1.5 z-40"
                >
                  <div className="px-3.5 py-1.5 text-[11px] font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">
                    Simulate Failure Scenario
                  </div>
                  {scenarios.map(sc => {
                    const isSelected = currentScenario === sc.id;
                    return (
                      <button
                        key={sc.id}
                        role="option"
                        aria-selected={isSelected}
                        onClick={() => {
                          onSelectScenario(sc.id);
                          setDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3.5 py-2.5 transition-colors flex items-start justify-between gap-2 ${
                          isSelected
                            ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-50'
                            : 'hover:bg-neutral-50 dark:hover:bg-neutral-800/60 text-neutral-700 dark:text-neutral-300'
                        }`}
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-semibold">{sc.name}</span>
                            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded font-bold bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300">
                              {sc.severity}
                            </span>
                          </div>
                          <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5">
                            {sc.desc}
                          </p>
                        </div>
                        {isSelected && <Check className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" aria-hidden="true" />}
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </div>

          {/* Start Chaos Toggle Button */}
          <button
            id="btn-toggle-chaos"
            type="button"
            onClick={onToggleChaos}
            aria-pressed={isChaosActive}
            aria-label={isChaosActive ? 'Stop real-time chaos simulator' : 'Start real-time chaos simulator'}
            className={`inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg transition-all border ${
              isChaosActive
                ? 'bg-rose-600 hover:bg-rose-700 text-white border-rose-500 shadow-sm'
                : 'bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 dark:hover:bg-amber-900/60 text-amber-900 dark:text-amber-200 border-amber-300 dark:border-amber-800'
            } focus-visible:outline-rose-600`}
          >
            {isChaosActive ? (
              <>
                <span className="relative flex h-2 w-2" aria-hidden="true">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-200 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                </span>
                <span>Stop Chaos</span>
              </>
            ) : (
              <>
                <Flame className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" aria-hidden="true" />
                <span>Start Chaos</span>
              </>
            )}
          </button>

          {/* Telemetry live status */}
          <div 
            aria-live="polite"
            className="hidden md:inline-flex items-center gap-2 px-3 py-2 text-xs font-medium text-neutral-700 dark:text-neutral-300"
          >
            <span className="relative flex h-2 w-2" aria-hidden="true">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600 dark:bg-emerald-500"></span>
            </span>
            <span>{alertCount} alerts active</span>
          </div>

          {/* Reset button */}
          <button
            id="btn-reset-db"
            type="button"
            onClick={onReset}
            disabled={isResetting}
            aria-label="Reset simulation to initial state"
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg transition-colors border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-800 disabled:opacity-50"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${isResetting ? 'animate-spin' : ''}`} aria-hidden="true" />
            <span>Reset</span>
          </button>

          {/* Light / Dark Mode Toggle */}
          <button
            id="btn-toggle-theme"
            type="button"
            onClick={onToggleTheme}
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            className="p-2 rounded-lg text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 transition-colors"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" aria-hidden="true" />
            ) : (
              <Moon className="w-4 h-4 text-neutral-700" aria-hidden="true" />
            )}
          </button>

        </nav>
      </div>
    </header>
  );
};
