import React, { useState } from 'react';
import {
  Settings,
  Shield,
  Bell,
  Webhook,
  Palette,
  Save,
  RefreshCw,
  Key
} from 'lucide-react';
import { toast } from 'sonner';

export const SystemSettings: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'general' | 'security' | 'notifications' | 'webhooks' | 'theme'>('general');

  // General Settings State
  const [gatewayName, setGatewayName] = useState('Aegis Enterprise Gateway');
  const [sandboxMode, setSandboxMode] = useState(false);
  const [logLevel, setLogLevel] = useState('INFO');
  const [fallbackAcquirer, setFallbackAcquirer] = useState(true);

  // Security Config State
  const [mfaRequired, setMfaRequired] = useState(true);
  const [sessionTimeout, setSessionTimeout] = useState(30);
  const [ipWhitelist, setIpWhitelist] = useState('192.168.1.*\n10.0.0.*\n64.233.160.*');

  // Notifications State
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [slackUrl, setSlackUrl] = useState('');

  // Webhooks Config State
  const [webhookRetries, setWebhookRetries] = useState(3);
  const [signKey, setSignKey] = useState('');

  const handleSave = (section: string) => {
    toast.success(`Settings: ${section} configurations written to storage.`);
  };

  const regenerateSignKey = () => {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let newKey = 'whsec_';
    for (let i = 0; i < 40; i++) {
      newKey += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setSignKey(newKey);
    toast.success('Generated new Webhook shared signing key.');
  };

  return (
    <div className="space-y-6 text-left">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">System Settings</h1>
        <p className="mt-1 text-xs text-slate-500">
          Configure security levels, routing thresholds, firewalls, and alert endpoints.
        </p>
      </div>

      {/* Tabs Layout */}
      <div className="flex flex-col lg:flex-row gap-6 items-start">
        
        {/* Navigation Sidebar Tabs */}
        <div className="w-full lg:w-60 flex flex-row lg:flex-col gap-1.5 overflow-x-auto shrink-0 pb-3 lg:pb-0 border-b lg:border-b-0 border-slate-200 dark:border-slate-800">
          {[
            { id: 'general', name: 'General Settings', icon: Settings },
            { id: 'security', name: 'Security Config', icon: Shield },
            { id: 'notifications', name: 'Alert Dispatchers', icon: Bell },
            { id: 'webhooks', name: 'Webhook Callbacks', icon: Webhook },
            { id: 'theme', name: 'System Appearance', icon: Palette }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-primary text-white shadow shadow-primary/20'
                    : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800/40'
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span>{tab.name}</span>
              </button>
            );
          })}
        </div>

        {/* Setting Panel Content */}
        <div className="flex-1 w-full rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 transition-colors">
          
          {/* General Tab */}
          {activeTab === 'general' && (
            <div className="space-y-6">
              <h3 className="text-sm font-bold border-b border-slate-100 pb-2.5 dark:border-slate-800">General Settings</h3>
              
              <div className="space-y-4 max-w-xl text-xs">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">Gateway Platform Identifier</label>
                  <input
                    type="text"
                    value={gatewayName}
                    onChange={(e) => setGatewayName(e.target.value)}
                    className="w-full px-3.5 py-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 rounded-xl text-xs focus:outline-none"
                  />
                </div>

                <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800/50">
                  <div className="pr-4 text-left">
                    <span className="font-bold text-slate-700 dark:text-slate-200 block">Sandbox Testing Mode</span>
                    <span className="text-[10px] text-slate-400 mt-0.5 block leading-normal">
                      Enables simulated visa authorizations. Production keys will be locked.
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={sandboxMode}
                    onChange={(e) => setSandboxMode(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 dark:border-slate-700 text-primary"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">Pipeline Logs Level</label>
                  <select
                    value={logLevel}
                    onChange={(e) => setLogLevel(e.target.value)}
                    className="w-full px-3.5 py-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 rounded-xl text-xs focus:outline-none"
                  >
                    <option value="DEBUG">DEBUG (All events trace)</option>
                    <option value="INFO">INFO (Normal orchestration logs)</option>
                    <option value="WARNING">WARNING (Only errors/warnings)</option>
                  </select>
                </div>

                <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800/50">
                  <div className="pr-4 text-left">
                    <span className="font-bold text-slate-700 dark:text-slate-200 block">Dynamic Acquirer Fallbacks</span>
                    <span className="text-[10px] text-slate-400 mt-0.5 block leading-normal">
                      Automatically route to secondary network gateways on latency warning flags.
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={fallbackAcquirer}
                    onChange={(e) => setFallbackAcquirer(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 dark:border-slate-700 text-primary"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-3">
                <button
                  onClick={() => handleSave('General Settings')}
                  className="flex items-center justify-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-white hover:bg-primary-hover shadow-sm"
                >
                  <Save className="h-4 w-4" />
                  Save General Configuration
                </button>
              </div>
            </div>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              <h3 className="text-sm font-bold border-b border-slate-100 pb-2.5 dark:border-slate-800">Security Config</h3>
              
              <div className="space-y-4 max-w-xl text-xs">
                <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800/50">
                  <div className="pr-4 text-left">
                    <span className="font-bold text-slate-700 dark:text-slate-200 block">Enforce 2FA Authentication</span>
                    <span className="text-[10px] text-slate-400 mt-0.5 block leading-normal">
                      Force OTP verification upon email/password authentication check.
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={mfaRequired}
                    onChange={(e) => setMfaRequired(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 dark:border-slate-700 text-primary"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="font-bold text-slate-700 dark:text-slate-300">Administrative Expiry Timer</label>
                    <span className="font-bold text-slate-500">{sessionTimeout} minutes</span>
                  </div>
                  <input
                    type="range"
                    min={5}
                    max={120}
                    step={5}
                    value={sessionTimeout}
                    onChange={(e) => setSessionTimeout(Number(e.target.value))}
                    className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-primary"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">Administrative IP Whitelist Rules</label>
                  <textarea
                    rows={4}
                    value={ipWhitelist}
                    onChange={(e) => setIpWhitelist(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 rounded-xl text-xs font-mono focus:outline-none"
                    placeholder="Enter IP ranges (one per line)"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-3">
                <button
                  onClick={() => handleSave('Security Policy')}
                  className="flex items-center justify-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-white hover:bg-primary-hover shadow-sm"
                >
                  <Save className="h-4 w-4" />
                  Save Security Policy
                </button>
              </div>
            </div>
          )}

          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <h3 className="text-sm font-bold border-b border-slate-100 pb-2.5 dark:border-slate-800">Alert Dispatchers</h3>
              
              <div className="space-y-4 max-w-xl text-xs">
                <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800/50">
                  <div className="pr-4 text-left">
                    <span className="font-bold text-slate-700 dark:text-slate-200 block">Critical Email Alerts</span>
                    <span className="text-[10px] text-slate-400 mt-0.5 block leading-normal">
                      Dispatch daily settlement reports and transaction error flags to administrators.
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={emailAlerts}
                    onChange={(e) => setEmailAlerts(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 dark:border-slate-700 text-primary"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">Slack Alarm Webhook Destination</label>
                  <input
                    type="text"
                    value={slackUrl}
                    onChange={(e) => setSlackUrl(e.target.value)}
                    className="w-full px-3.5 py-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 rounded-xl text-xs focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-3">
                <button
                  onClick={() => handleSave('Alert Dispatchers')}
                  className="flex items-center justify-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-white hover:bg-primary-hover shadow-sm"
                >
                  <Save className="h-4 w-4" />
                  Save Notification Channels
                </button>
              </div>
            </div>
          )}

          {/* Webhooks Tab */}
          {activeTab === 'webhooks' && (
            <div className="space-y-6">
              <h3 className="text-sm font-bold border-b border-slate-100 pb-2.5 dark:border-slate-800">Webhook Callbacks</h3>
              
              <div className="space-y-4 max-w-xl text-xs">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">Network Retry Backoff Limit</label>
                  <select
                    value={webhookRetries}
                    onChange={(e) => setWebhookRetries(Number(e.target.value))}
                    className="w-full px-3.5 py-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 rounded-xl text-xs focus:outline-none"
                  >
                    <option value={1}>1 Retry attempt</option>
                    <option value={3}>3 Retry attempts (Recommended)</option>
                    <option value={5}>5 Retry attempts</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">Webhook Shared Sign Key</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      readOnly
                      value={signKey}
                      className="flex-1 px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono rounded-xl text-[10px] text-slate-500 focus:outline-none"
                    />
                    <button
                      onClick={regenerateSignKey}
                      className="flex items-center justify-center gap-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 px-3.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 transition-colors"
                      type="button"
                    >
                      <RefreshCw className="h-4 w-4" />
                      Rotate
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-3">
                <button
                  onClick={() => handleSave('Webhook Policies')}
                  className="flex items-center justify-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-white hover:bg-primary-hover shadow-sm"
                >
                  <Save className="h-4 w-4" />
                  Save Webhook Policies
                </button>
              </div>
            </div>
          )}

          {/* Theme Tab */}
          {activeTab === 'theme' && (
            <div className="space-y-6">
              <h3 className="text-sm font-bold border-b border-slate-100 pb-2.5 dark:border-slate-800">System Appearance</h3>
              
              <div className="space-y-4 max-w-xl text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                <p>
                  Customize styling and themes for administration panels. By default, AegisPay responds dynamically to your local browser preference or manual switcher selections.
                </p>
                <div className="rounded-xl border border-blue-200/50 bg-blue-50/20 p-4 dark:border-blue-900/30 dark:bg-blue-950/10 text-xs flex gap-2">
                  <Key className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-blue-800 dark:text-blue-400 block mb-0.5">Workstation Aesthetics:</span>
                    To adjust theme directly, click the sun/moon toggler located in the bottom-left sidebar of the navigation shell or top-right profile header.
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
