import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Zap, 
  Waves, 
  BookOpen, 
  Sliders, 
  ShieldAlert, 
  Radio, 
  Activity,
  Play,
  Square,
  Sparkles,
  RotateCcw
} from 'lucide-react';

interface SidebarProps {
  sev1Count: number;
  alertCount: number;
  isChaosActive?: boolean;
  onToggleChaos?: () => void;
  onReset?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  sev1Count,
  alertCount,
  isChaosActive = false,
  onToggleChaos,
  onReset
}) => {
  const navItems = [
    {
      label: 'Active Incidents',
      path: '/incidents',
      icon: Zap,
      badge: sev1Count > 0 ? `${sev1Count} SEV-1` : undefined,
      badgeColor: 'bg-rose-600 text-white animate-pulse'
    },
    {
      label: 'The Noise Stream',
      path: '/alerts',
      icon: Waves,
      badge: alertCount > 0 ? `${alertCount}` : undefined,
      badgeColor: 'bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 font-mono'
    },
    {
      label: 'Post-Mortems',
      path: '/post-mortems',
      icon: BookOpen
    },
    {
      label: 'AI Firewall & Sandbox',
      path: '/firewall',
      icon: ShieldAlert,
      badge: 'SECURE',
      badgeColor: 'bg-emerald-600 text-white'
    },
    {
      label: 'Integrations',
      path: '/integrations',
      icon: Sliders
    }
  ];

  return (
    <aside 
      aria-label="Main Navigation Sidebar"
      className="w-64 shrink-0 border-r border-neutral-200 dark:border-neutral-800 bg-neutral-50/70 dark:bg-neutral-950 flex flex-col justify-between select-none"
    >
      {/* Top Brand */}
      <div>
        <div className="p-5 border-b border-neutral-200 dark:border-neutral-800 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-rose-600 flex items-center justify-center text-white shadow-xs">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h1 className="text-sm font-black text-neutral-900 dark:text-neutral-50 tracking-tight leading-tight truncate">
              Ops Incident OS
            </h1>
            <p className="text-[10px] font-mono text-neutral-500 dark:text-neutral-400 truncate">
              Autonomous Triage
            </p>
          </div>
        </div>

        {/* Navigation Menu Links */}
        <nav className="p-3 space-y-1">
          <span className="px-3 text-[10px] font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500 mb-2 block">
            Operations Console
          </span>

          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all group ${
                    isActive
                      ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 shadow-xs'
                      : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-200/60 dark:hover:bg-neutral-900'
                  }`
                }
              >
                <div className="flex items-center gap-2.5">
                  <Icon className="w-4 h-4 shrink-0 transition-transform group-hover:scale-105" />
                  <span>{item.label}</span>
                </div>

                {item.badge && (
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${item.badgeColor}`}>
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Bottom Controls: Real-Time Stream Simulator & Service Mesh Telemetry */}
      <div className="p-3 border-t border-neutral-200 dark:border-neutral-800 space-y-3">
        {/* Chaos Simulator Loop */}
        <div className="p-3 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-neutral-800 dark:text-neutral-200 flex items-center gap-1.5">
              <Radio className={`w-3.5 h-3.5 ${isChaosActive ? 'text-rose-500 animate-pulse' : 'text-neutral-400'}`} />
              Chaos Stream
            </span>
            <span className={`w-2 h-2 rounded-full ${isChaosActive ? 'bg-emerald-500 animate-ping' : 'bg-neutral-400'}`} />
          </div>

          <p className="text-[10px] text-neutral-500 dark:text-neutral-400 leading-tight">
            {isChaosActive 
              ? 'Injecting live anomalies every 2.5s' 
              : 'Stream simulator paused'}
          </p>

          <button
            type="button"
            id="btn-sidebar-toggle-chaos"
            onClick={onToggleChaos}
            className={`w-full inline-flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              isChaosActive
                ? 'bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/60 dark:hover:bg-rose-900 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                : 'bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200'
            }`}
          >
            {isChaosActive ? (
              <>
                <Square className="w-3 h-3 fill-current" />
                <span>Pause Stream</span>
              </>
            ) : (
              <>
                <Play className="w-3 h-3 fill-current" />
                <span>Simulate Chaos</span>
              </>
            )}
          </button>
        </div>

        {/* Reset system */}
        {onReset && (
          <button
            type="button"
            id="btn-sidebar-reset"
            onClick={onReset}
            className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 hover:bg-neutral-200/50 dark:hover:bg-neutral-900 transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset Demo State</span>
          </button>
        )}
      </div>
    </aside>
  );
};
