import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { 
  Search, 
  ChevronRight, 
  Bell, 
  Sun, 
  Moon, 
  Radio, 
  ShieldAlert,
  User,
  Volume2
} from 'lucide-react';
import { Incident } from '../types';

interface TopAppBarProps {
  onOpenSearch: () => void;
  pagerStatus: 'on_call' | 'paged';
  onTogglePagerStatus: () => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  activeIncident?: Incident | null;
}

export const TopAppBar: React.FC<TopAppBarProps> = ({
  onOpenSearch,
  pagerStatus,
  onTogglePagerStatus,
  theme,
  onToggleTheme,
  activeIncident
}) => {
  const location = useLocation();

  // Generate dynamic breadcrumbs
  const getBreadcrumbs = () => {
    const parts = location.pathname.split('/').filter(Boolean);
    if (parts.length === 0 || parts[0] === 'incidents') {
      if (parts.length > 1 && parts[1]) {
        const id = parts[1];
        const statusLabel = activeIncident?.status 
          ? activeIncident.status.charAt(0).toUpperCase() + activeIncident.status.slice(1)
          : 'Sitrep';
        return [
          { label: 'Incidents', path: '/incidents' },
          { label: id.toUpperCase(), path: `/incidents/${id}` },
          { label: statusLabel, path: `/incidents/${id}` }
        ];
      }
      return [
        { label: 'Incidents', path: '/incidents' },
        { label: 'Triage Kanban', path: '/incidents' }
      ];
    }
    if (parts[0] === 'alerts') {
      return [
        { label: 'The Noise Stream', path: '/alerts' },
        { label: 'Raw Alerts', path: '/alerts' }
      ];
    }
    if (parts[0] === 'post-mortems') {
      return [
        { label: 'Post-Mortems', path: '/post-mortems' },
        { label: 'Archive', path: '/post-mortems' }
      ];
    }
    if (parts[0] === 'integrations') {
      return [
        { label: 'Integrations', path: '/integrations' },
        { label: 'Infrastructure Setup', path: '/integrations' }
      ];
    }
    return [{ label: 'Console', path: '/' }];
  };

  const breadcrumbs = getBreadcrumbs();

  return (
    <header 
      role="banner"
      className="h-14 shrink-0 border-b border-neutral-200 dark:border-neutral-800 bg-white/80 dark:bg-neutral-950/80 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between gap-4 z-40"
    >
      {/* Left: Breadcrumbs */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs">
        {breadcrumbs.map((crumb, idx) => {
          const isLast = idx === breadcrumbs.length - 1;
          return (
            <React.Fragment key={crumb.label + idx}>
              {idx > 0 && (
                <ChevronRight className="w-3.5 h-3.5 text-neutral-400 dark:text-neutral-600 shrink-0" />
              )}
              {isLast ? (
                <span className="font-semibold text-neutral-900 dark:text-neutral-100 truncate max-w-[140px] sm:max-w-xs font-mono">
                  {crumb.label}
                </span>
              ) : (
                <Link
                  to={crumb.path}
                  className="text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors font-medium truncate max-w-[120px]"
                >
                  {crumb.label}
                </Link>
              )}
            </React.Fragment>
          );
        })}
      </nav>

      {/* Center: Global Search (Cmd+K trigger) */}
      <div className="flex-1 max-w-md hidden md:block">
        <button
          type="button"
          id="btn-global-search-trigger"
          onClick={onOpenSearch}
          className="w-full flex items-center justify-between px-3.5 py-1.5 rounded-xl bg-neutral-100 hover:bg-neutral-200/80 dark:bg-neutral-900 dark:hover:bg-neutral-800/80 border border-neutral-200 dark:border-neutral-800 text-neutral-400 text-xs transition-colors shadow-2xs group"
        >
          <div className="flex items-center gap-2">
            <Search className="w-3.5 h-3.5 text-neutral-400 group-hover:text-neutral-600 dark:group-hover:text-neutral-200 transition-colors" />
            <span className="text-neutral-500 dark:text-neutral-400">Search incidents, alerts, commands...</span>
          </div>
          <div className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 text-[10px] font-mono text-neutral-600 dark:text-neutral-400 font-semibold shadow-2xs">
              ⌘K
            </kbd>
          </div>
        </button>
      </div>

      {/* Mobile search trigger */}
      <div className="md:hidden">
        <button
          type="button"
          onClick={onOpenSearch}
          className="p-2 rounded-lg bg-neutral-100 dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400"
          title="Search (Cmd+K)"
        >
          <Search className="w-4 h-4" />
        </button>
      </div>

      {/* Right: Active Pager Status, Theme Toggle, User Avatar */}
      <div className="flex items-center gap-3">
        {/* Active Pager Status */}
        <button
          type="button"
          id="btn-toggle-pager-status"
          onClick={onTogglePagerStatus}
          className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-bold transition-all ${
            pagerStatus === 'paged'
              ? 'bg-rose-600 text-white shadow-xs shadow-rose-500/40 animate-pulse'
              : 'bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30'
          }`}
          title="Click to test pager state"
        >
          <span className={`w-2 h-2 rounded-full ${pagerStatus === 'paged' ? 'bg-white animate-ping' : 'bg-emerald-500'}`} />
          <span className="font-mono text-[11px] uppercase tracking-wider">
            {pagerStatus === 'paged' ? 'PAGED (SEV-1)' : 'ON CALL'}
          </span>
        </button>

        {/* Theme toggle */}
        <button
          type="button"
          id="btn-toggle-theme"
          onClick={onToggleTheme}
          className="p-2 rounded-xl text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors"
          title="Toggle light/dark theme"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-neutral-600" />}
        </button>

        {/* User Avatar */}
        <div className="flex items-center gap-2 pl-2 border-l border-neutral-200 dark:border-neutral-800">
          <div className="relative">
            <div className="w-8 h-8 rounded-full bg-linear-to-tr from-neutral-800 to-neutral-700 dark:from-neutral-700 dark:to-neutral-600 text-white flex items-center justify-center text-xs font-bold shadow-xs">
              AM
            </div>
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-neutral-950" />
          </div>
          <div className="hidden lg:block text-left">
            <p className="text-xs font-bold text-neutral-900 dark:text-neutral-100 leading-none">
              Alex Mercer
            </p>
            <p className="text-[10px] text-neutral-500 dark:text-neutral-400 mt-0.5">
              Staff SRE • Primary
            </p>
          </div>
        </div>
      </div>
    </header>
  );
};
