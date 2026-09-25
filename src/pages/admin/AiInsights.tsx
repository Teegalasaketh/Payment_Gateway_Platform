import React, { useState } from 'react';
import {
  Brain,
  Send,
  Loader2,
  FileDown,
  Sparkles,
  TrendingUp,
  ShieldCheck,
  Zap,
  Bot,
  User as UserIcon,
  X
} from 'lucide-react';
import { toast } from 'sonner';

interface ChatMessage {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  timestamp: string;
}

export const AiInsights: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-1',
      sender: 'ai',
      text: 'Aegis Sentinel v2.4 initialized. I have parsed today\'s ledger settlements, Kafka message queues, and fraud scores. How can I assist you with gateway operations diagnostics?',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);

  // Pre-compiled responses based on keyword match
  const getAiResponse = (query: string): string => {
    const q = query.toLowerCase();
    if (q.includes('fraud') || q.includes('risk') || q.includes('anomaly')) {
      return 'AI Audit: Flagged 3 suspicious card-testing attempts from IP 204.79.197.x. All 3 events were safely blocked by our Idempotency cache resolver, protecting merchant settlement accounts from retry double collection. Current fraud index is low (1.2%).';
    }
    if (q.includes('revenue') || q.includes('volume') || q.includes('sales')) {
      return 'Revenue Forecast: Settlement volume shows steady +14.8% weekly compounding growth. Core volume drivers are Credit Cards (42%) and Apple Pay (23%). Projected monthly volume for July 2026: $184.2M based on current processing velocity.';
    }
    if (q.includes('health') || q.includes('system') || q.includes('latency')) {
      return 'System Telemetry: Gateway pipeline is fully operational. Core transaction processing latency is stable at 34ms. The acquirer fallback server is currently active in secondary regions due to minor network delays with card carriers, maintaining a 99.98% API success rate.';
    }
    return 'I have run a diagnostic sweep across your payment logs. gross sales volume ($82.4K settled) is within normal parameters, API endpoints show 99.9% uptime, and no active cyber threat vectors are currently bypass-testing the idempotency caches.';
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const userMsg: ChatMessage = {
      id: `msg-user-${Date.now()}`,
      sender: 'user',
      text: inputText.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    setTimeout(() => {
      const replyText = getAiResponse(userMsg.text);
      const aiReply: ChatMessage = {
        id: `msg-ai-${Date.now()}`,
        sender: 'ai',
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, aiReply]);
      setIsTyping(false);
    }, 1200);
  };

  const generateReport = () => {
    setIsReportOpen(true);
    toast.success('AI Executive Summary generated.');
  };

  const handleExport = () => {
    toast.info('Downloading AI Executive Summary...');
    setTimeout(() => {
      const content = `AEGISPAY COGNITIVE REPORT
Date: ${new Date().toLocaleDateString()}
Status: Operational
Summary: Uptime 99.98%, Revenue +14.8%, Fraud risk index low.`;
      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `AegisPay_AI_Executive_Report_${new Date().toISOString().split('T')[0]}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('Report download complete.');
    }, 800);
  };

  return (
    <div className="space-y-6 text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Cognitive Analytics Hub</h1>
          <p className="mt-1 text-xs text-slate-500">
            Interact with our AI intelligence agent to diagnose gateway exceptions, analyze risk anomalies, and query revenue forecasts.
          </p>
        </div>
        <button
          onClick={generateReport}
          className="flex items-center justify-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-white hover:bg-primary-hover shadow-sm shrink-0"
        >
          <FileDown className="h-4 w-4" />
          AI Executive Summary
        </button>
      </div>

      {/* Diagnostic insights cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Card 1: Anomaly */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 flex gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-500 dark:bg-red-950/30 dark:text-red-400 shrink-0">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">Threat Audit</h4>
            <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">
              Detected card testing pattern originating from US cloud proxies. Idempotency blocks active. Risk level: <span className="text-red-500 font-bold">Stable</span>.
            </p>
          </div>
        </div>

        {/* Card 2: Growth */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 flex gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-500 dark:bg-emerald-950/30 dark:text-emerald-400 shrink-0">
            <TrendingUp className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">Revenue Forecast</h4>
            <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">
              Compounding weekly growth estimated at +14.8%. July collections forecast: <span className="text-emerald-500 font-bold">$184.2M</span> gross settled volume.
            </p>
          </div>
        </div>

        {/* Card 3: Network */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 flex gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-500 dark:bg-blue-950/30 dark:text-blue-400 shrink-0">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">System Telemetry</h4>
            <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">
              API latency averages 34ms. Acquirer server clusters operating at 99.98% capacity threshold.
            </p>
          </div>
        </div>

      </div>

      {/* Conversational Assistant Workspace */}
      <div className="flex flex-col h-[55vh] border border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900 overflow-hidden shadow-sm">
        
        {/* Header bar */}
        <div className="flex items-center gap-3 bg-slate-50/50 dark:bg-slate-800/10 px-6 py-3.5 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-white">
            <Brain className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-900 dark:text-white">Aegis Sentinel Assistant</h3>
            <span className="text-[8px] font-semibold text-emerald-400 block uppercase tracking-wider">AI Operations Core Online</span>
          </div>
        </div>

        {/* Messages Feed */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((msg) => {
            const isAi = msg.sender === 'ai';
            return (
              <div
                key={msg.id}
                className={`flex gap-3 max-w-[80%] ${isAi ? 'text-left mr-auto' : 'flex-row-reverse text-left ml-auto'}`}
              >
                <div className={`h-8 w-8 rounded-full shrink-0 flex items-center justify-center text-white ${
                  isAi ? 'bg-slate-800 dark:bg-slate-700' : 'bg-primary'
                }`}>
                  {isAi ? <Bot className="h-4 w-4" /> : <UserIcon className="h-4 w-4" />}
                </div>
                
                <div>
                  <div className={`rounded-2xl p-4 text-xs leading-relaxed ${
                    isAi
                      ? 'bg-slate-50 dark:bg-slate-850 border border-slate-100 dark:border-slate-800 text-slate-800 dark:text-slate-200'
                      : 'bg-primary text-white'
                  }`}>
                    {msg.text}
                  </div>
                  <span className="text-[9px] text-slate-400 font-semibold mt-1 block px-2 text-right">
                    {msg.timestamp}
                  </span>
                </div>
              </div>
            );
          })}

          {isTyping && (
            <div className="flex gap-3 max-w-[80%] mr-auto">
              <div className="h-8 w-8 rounded-full bg-slate-800 dark:bg-slate-700 text-white shrink-0 flex items-center justify-center">
                <Bot className="h-4 w-4 animate-bounce" />
              </div>
              <div className="rounded-2xl p-3.5 bg-slate-50 dark:bg-slate-800 text-slate-400 text-xs flex items-center gap-2">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span>Sentinel is parsing transaction logs...</span>
              </div>
            </div>
          )}
        </div>

        {/* Prompt input bar */}
        <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0">
          <div className="relative flex items-center bg-slate-50 dark:bg-slate-950/40 rounded-xl border border-slate-200 dark:border-slate-800 pl-3 pr-1.5 py-1.5 focus-within:ring-2 focus-within:ring-primary/20 transition-all">
            <input
              type="text"
              placeholder="Ask about 'fraud analytics', 'system health' or 'sales volume'..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="flex-1 bg-transparent text-xs text-slate-700 dark:text-slate-200 focus:outline-none pr-12"
            />
            <button
              type="submit"
              disabled={isTyping || !inputText.trim()}
              className="h-8 w-8 flex items-center justify-center rounded-lg bg-primary hover:bg-primary-hover text-white transition-colors disabled:opacity-40"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </form>

      </div>

      {/* ================================================================== */}
      {/* AI SUMMARY REPORT MODAL */}
      {/* ================================================================== */}
      {isReportOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="relative w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900 animate-scale-up text-left">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-primary" />
                <h3 className="text-base font-bold">Executive Cognitive Summary</h3>
              </div>
              <button onClick={() => setIsReportOpen(false)} className="rounded-lg p-1 text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800">
                <X className="h-4.5 w-4.5" />
              </button>
            </div>
            
            <div className="mt-4 space-y-4 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
              <p>
                Aegis Gateway operations audit report generated on <strong>{new Date().toLocaleDateString()}</strong>.
              </p>

              <div className="space-y-2 border-l-2 border-primary pl-3">
                <div>
                  <strong>Ledger Collections:</strong> Gross sales volumes settled at normal compounding velocity of +14.8% week-over-week.
                </div>
                <div>
                  <strong>Security Anomaly Audit:</strong> AI firewall logs captured and locked 3 card-testing threat actions. Zero leaks reported.
                </div>
                <div>
                  <strong>Acquirer Latency SLG:</strong> Uptime averages 99.98% with processing latency bounds of 34ms.
                </div>
              </div>

              <div className="rounded-lg bg-slate-50 p-3 dark:bg-slate-950/40 text-[10px] text-slate-400 flex items-center gap-1.5">
                <Zap className="h-4.5 w-4.5 text-warning shrink-0" />
                Recommendation: Migrate legacy webhook endpoint routes to /v2 before deprecation period (60 days remaining).
              </div>
            </div>
            
            <div className="mt-6 flex justify-end gap-3 border-t border-slate-100 pt-4 dark:border-slate-800">
              <button
                onClick={() => setIsReportOpen(false)}
                className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-semibold hover:bg-slate-100 dark:border-slate-800 dark:hover:bg-slate-800"
              >
                Close Report
              </button>
              <button
                onClick={handleExport}
                className="flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-xs font-bold text-white hover:bg-primary-hover shadow"
              >
                <FileDown className="h-4 w-4" />
                Export Summary
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
