import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  X, 
  Flame, 
  AlertTriangle, 
  FileText, 
  Terminal, 
  ArrowRight, 
  Sliders,
  Layers
} from 'lucide-react';
import { Incident, RawAlert, PastIncident } from '../types';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  incidents: Incident[];
  alerts: RawAlert[];
  pastIncidents: PastIncident[];
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  incidents,
  alerts,
  pastIncidents
}) => {
  const [query, setQuery] = useState<string>('');
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Combined search results
  const filteredIncidents = query.trim()
    ? incidents.filter(i => 
        i.title.toLowerCase().includes(query.toLowerCase()) ||
        i.id.toLowerCase().includes(query.toLowerCase()) ||
        i.root_cause.toLowerCase().includes(query.toLowerCase()) ||
        i.owner_team.toLowerCase().includes(query.toLowerCase())
      )
    : incidents.slice(0, 3);

  const filteredAlerts = query.trim()
    ? alerts.filter(a => 
        a.message.toLowerCase().includes(query.toLowerCase()) ||
        a.id.toLowerCase().includes(query.toLowerCase()) ||
        a.source.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 4)
    : alerts.slice(0, 3);

  const filteredPast = query.trim()
    ? pastIncidents.filter(p => 
        p.title.toLowerCase().includes(query.toLowerCase()) ||
        p.resolution.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 3)
    : pastIncidents.slice(0, 2);

  const allItems: { type: 'incident' | 'alert' | 'past'; id: string; title: string; subtitle: string; path: string }[] = [
    ...filteredIncidents.map(i => ({
      type: 'incident' as const,
      id: i.id,
      title: `${i.id.toUpperCase()}: ${i.title}`,
      subtitle: `${i.severity} • Team: ${i.owner_team}`,
      path: `/incidents/${i.id}`
    })),
    ...filteredAlerts.map(a => ({
      type: 'alert' as const,
      id: a.id,
      title: `[${a.source}] ${a.message.slice(0, 75)}...`,
      subtitle: `${a.id} • ${a.severity_hint} • ${new Date(a.timestamp).toLocaleTimeString()}`,
      path: `/alerts`
    })),
    ...filteredPast.map(p => ({
      type: 'past' as const,
      id: `past-${p.id}`,
      title: `Post-Mortem: ${p.title}`,
      subtitle: p.resolution.slice(0, 80) + '...',
      path: `/post-mortems`
    }))
  ];

  const handleSelect = (path: string) => {
    onClose();
    navigate(path);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % Math.max(1, allItems.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + allItems.length) % Math.max(1, allItems.length));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (allItems[selectedIndex]) {
        handleSelect(allItems[selectedIndex].path);
      }
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      role="dialog"
      aria-modal="true"
      aria-label="Global Search"
      className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-2xl bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150 flex flex-col max-h-[80vh]"
        onClick={e => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-950/50">
          <Search className="w-5 h-5 text-neutral-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Search active incidents, raw telemetry alerts, post-mortems (Cmd+K)..."
            className="flex-1 bg-transparent border-none outline-none text-sm text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 font-sans"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="p-1 rounded text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <span className="hidden sm:inline-block px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold bg-neutral-200 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400">
            ESC
          </span>
        </div>

        {/* Results list */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {allItems.length === 0 ? (
            <div className="py-12 text-center text-xs text-neutral-400">
              No matching incidents, alerts, or post-mortems found.
            </div>
          ) : (
            allItems.map((item, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={item.id}
                  onClick={() => handleSelect(item.path)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100'
                      : 'hover:bg-neutral-50 dark:hover:bg-neutral-800/50 text-neutral-700 dark:text-neutral-300'
                  }`}
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className="p-2 rounded-lg bg-neutral-100 dark:bg-neutral-800 shrink-0">
                      {item.type === 'incident' && <Flame className="w-4 h-4 text-rose-500" />}
                      {item.type === 'alert' && <Terminal className="w-4 h-4 text-amber-500" />}
                      {item.type === 'past' && <FileText className="w-4 h-4 text-blue-500" />}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold truncate leading-snug">
                        {item.title}
                      </p>
                      <p className="text-[11px] text-neutral-500 dark:text-neutral-400 truncate mt-0.5">
                        {item.subtitle}
                      </p>
                    </div>
                  </div>

                  <ArrowRight className={`w-3.5 h-3.5 shrink-0 ml-2 ${isSelected ? 'opacity-100 text-blue-500' : 'opacity-0'}`} />
                </div>
              );
            })
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="px-4 py-2 border-t border-neutral-100 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 flex items-center justify-between text-[11px] text-neutral-400 font-mono">
          <span>↑↓ to navigate</span>
          <span>↵ to open</span>
          <span>esc to dismiss</span>
        </div>
      </div>
    </div>
  );
};
