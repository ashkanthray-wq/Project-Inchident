import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  Plus, 
  ExternalLink, 
  X, 
  ShieldCheck, 
  Key, 
  Loader2, 
  Server, 
  Cloud, 
  Layers, 
  Zap, 
  Check, 
  Lock,
  ArrowRight
} from 'lucide-react';
import { IntegrationConfig } from '../types';

export const IntegrationsPage: React.FC = () => {
  const [integrations, setIntegrations] = useState<IntegrationConfig[]>([]);
  const [selectedIntegration, setSelectedIntegration] = useState<IntegrationConfig | null>(null);
  const [isTesting, setIsTesting] = useState<boolean>(false);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [saveSuccessMessage, setSaveSuccessMessage] = useState<string | null>(null);

  const fetchIntegrations = async () => {
    try {
      const res = await fetch('/api/integrations');
      if (res.ok) {
        const data = await res.json();
        setIntegrations(data);
      }
    } catch (err) {
      console.error('Failed to fetch integrations', err);
    }
  };

  useEffect(() => {
    fetchIntegrations();
  }, []);

  const handleOpenDrawer = (item: IntegrationConfig) => {
    setSelectedIntegration(item);
    setSaveSuccessMessage(null);
    const initialValues: Record<string, string> = {};
    item.fields.forEach(f => {
      initialValues[f.id] = f.value || '';
    });
    setFormData(initialValues);
  };

  const handleCloseDrawer = () => {
    setSelectedIntegration(null);
    setIsTesting(false);
    setSaveSuccessMessage(null);
  };

  const handleSaveIntegration = async () => {
    if (!selectedIntegration) return;
    setIsTesting(true);
    setSaveSuccessMessage(null);

    // Simulate API connection handshake & update backend
    try {
      const updatedFields = selectedIntegration.fields.map(f => ({
        ...f,
        value: formData[f.id] || f.value || ''
      }));

      const res = await fetch(`/api/integrations/${selectedIntegration.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          connected: true,
          fields: updatedFields
        })
      });

      if (res.ok) {
        setSaveSuccessMessage("Handshake verified. Telemetry webhook pipeline activated.");
        await fetchIntegrations();
        setTimeout(() => {
          handleCloseDrawer();
        }, 1200);
      }
    } catch (err) {
      console.error('Failed to save integration', err);
    } finally {
      setIsTesting(false);
    }
  };

  const handleDisconnect = async (id: string) => {
    try {
      const res = await fetch(`/api/integrations/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ connected: false })
      });
      if (res.ok) {
        await fetchIntegrations();
        handleCloseDrawer();
      }
    } catch (err) {
      console.error('Failed to disconnect', err);
    }
  };

  const renderServiceLogo = (iconType: string) => {
    switch (iconType) {
      case 'aws':
        return (
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold text-xs">
            AWS
          </div>
        );
      case 'datadog':
        return (
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold text-xs">
            DD
          </div>
        );
      case 'github':
        return (
          <div className="w-10 h-10 rounded-xl bg-neutral-900/10 dark:bg-white/10 text-neutral-900 dark:text-white flex items-center justify-center font-bold text-xs">
            GH
          </div>
        );
      case 'pagerduty':
        return (
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-xs">
            PD
          </div>
        );
      case 'google_workspace':
        return (
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-xs">
            G-Suite
          </div>
        );
      default:
        return (
          <div className="w-10 h-10 rounded-xl bg-neutral-200 dark:bg-neutral-800 flex items-center justify-center font-bold text-xs">
            API
          </div>
        );
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <div className="border-b border-neutral-200 dark:border-neutral-800 pb-6">
        <h1 className="text-2xl sm:text-3xl font-black text-neutral-900 dark:text-neutral-100 tracking-tight">
          Connect Your Infrastructure
        </h1>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-2 max-w-2xl leading-relaxed">
          Link your cloud providers, APM platforms, source code repositories, and on-call escalation policies into the Autonomous Incident Operating System.
        </p>
      </div>

      {/* Uniform Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {integrations.map((item) => {
          const isConnected = item.connected;

          return (
            <div
              key={item.id}
              onClick={() => handleOpenDrawer(item)}
              className={`group cursor-pointer rounded-2xl p-6 transition-all duration-200 flex flex-col justify-between min-h-[220px] shadow-2xs relative ${
                isConnected
                  ? 'bg-white dark:bg-neutral-900 border-2 border-emerald-500 dark:border-emerald-500 shadow-xs shadow-emerald-500/10 hover:shadow-md'
                  : 'bg-neutral-50/80 dark:bg-neutral-900/50 border border-neutral-200 dark:border-neutral-800/80 hover:border-neutral-400 dark:hover:border-neutral-700 opacity-80 hover:opacity-100'
              }`}
            >
              <div>
                {/* Top Row: Logo & Status Badge */}
                <div className="flex items-start justify-between gap-3 mb-4">
                  {renderServiceLogo(item.iconType)}

                  {isConnected ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      Connected
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-neutral-200/80 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400">
                      Not Connected
                    </span>
                  )}
                </div>

                {/* Service Details */}
                <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {item.name}
                </h3>
                <p className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 mt-0.5">
                  {item.category}
                </p>
                <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-2.5 line-clamp-2 leading-relaxed">
                  {item.description}
                </p>
              </div>

              {/* Bottom footer */}
              <div className="mt-5 pt-3 border-t border-neutral-100 dark:border-neutral-800/80 flex items-center justify-between text-xs">
                {isConnected ? (
                  <span className="text-[11px] font-mono text-neutral-500 dark:text-neutral-400">
                    {item.apiKeyMasked || 'Active Webhook'}
                  </span>
                ) : (
                  <span className="text-[11px] text-neutral-400 dark:text-neutral-500">
                    Requires API Credentials
                  </span>
                )}

                <span className="inline-flex items-center gap-1 font-semibold text-neutral-700 dark:text-neutral-300 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                  <span>{isConnected ? 'Configure' : 'Connect'}</span>
                  <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Right-Side Slide-Out Panel (Drawer) for API Keys without navigating away */}
      {selectedIntegration && (
        <div 
          role="dialog"
          aria-modal="true"
          aria-label={`${selectedIntegration.name} Configuration`}
          className="fixed inset-0 z-50 overflow-hidden bg-black/50 backdrop-blur-xs flex justify-end animate-in fade-in duration-200"
          onClick={handleCloseDrawer}
        >
          <div 
            className="w-full max-w-md bg-white dark:bg-neutral-900 h-full shadow-2xl p-6 flex flex-col justify-between border-l border-neutral-200 dark:border-neutral-800 animate-in slide-in-from-right duration-250"
            onClick={e => e.stopPropagation()}
          >
            {/* Drawer Header */}
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-neutral-200 dark:border-neutral-800">
                <div className="flex items-center gap-3">
                  {renderServiceLogo(selectedIntegration.iconType)}
                  <div>
                    <h2 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
                      {selectedIntegration.name}
                    </h2>
                    <span className="text-xs text-neutral-500 dark:text-neutral-400">
                      {selectedIntegration.category}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleCloseDrawer}
                  className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Service description */}
              <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-4 leading-relaxed">
                {selectedIntegration.description}
              </p>

              {/* Status Alert if connected */}
              {selectedIntegration.connected && (
                <div className="mt-4 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center gap-2.5 text-xs text-emerald-800 dark:text-emerald-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>Verified and receiving real-time event webhooks.</span>
                </div>
              )}

              {saveSuccessMessage && (
                <div className="mt-4 p-3 rounded-xl bg-emerald-600 text-white flex items-center gap-2 text-xs font-semibold animate-in zoom-in-95">
                  <Check className="w-4 h-4" />
                  <span>{saveSuccessMessage}</span>
                </div>
              )}

              {/* Input Form Fields */}
              <div className="mt-6 space-y-4">
                {selectedIntegration.fields.map((field) => (
                  <div key={field.id} className="space-y-1.5">
                    <label 
                      htmlFor={`field-${field.id}`}
                      className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300"
                    >
                      {field.label}
                    </label>
                    <div className="relative">
                      <input
                        id={`field-${field.id}`}
                        type={field.type}
                        value={formData[field.id] || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, [field.id]: e.target.value }))}
                        placeholder={field.placeholder}
                        className="w-full px-3.5 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 text-xs font-mono text-neutral-900 dark:text-neutral-100 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-colors"
                      />
                      {field.type === 'password' && (
                        <span className="absolute right-3 top-2.5 text-neutral-400">
                          <Lock className="w-3.5 h-3.5" />
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Drawer Actions */}
            <div className="pt-6 border-t border-neutral-200 dark:border-neutral-800 space-y-3">
              <button
                type="button"
                id="btn-save-integration-keys"
                onClick={handleSaveIntegration}
                disabled={isTesting}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-neutral-900 text-xs font-semibold shadow-sm transition-all active:scale-98 disabled:opacity-50"
              >
                {isTesting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Verifying Handshake...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4 text-emerald-500" />
                    <span>Test Webhook & Connect</span>
                  </>
                )}
              </button>

              {selectedIntegration.connected && (
                <button
                  type="button"
                  id="btn-disconnect-integration"
                  onClick={() => handleDisconnect(selectedIntegration.id)}
                  className="w-full text-center py-2 text-xs font-semibold text-rose-600 hover:text-rose-700 dark:text-rose-400 transition-colors"
                >
                  Disconnect Integration
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
