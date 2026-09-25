import React, { useState } from 'react';
import {
  Brain,
  Send,
  Loader2,
  Sparkles,
  Bot,
  User as UserIcon
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  timestamp: string;
}

export const AiAssistant: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-1',
      sender: 'ai',
      text: 'Hello! I am your Aegis Smart Merchant Assistant. I can analyze spending logs, explain declination errors, and audit settlement status timelines. Click any prompt chip below or type a query.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const suggestedPrompts = [
    'Why did my payment fail?',
    'Show my recent transactions',
    'Analyze my spending pattern',
    'Explain transaction status'
  ];

  const getAiReply = (query: string): string => {
    const q = query.toLowerCase();
    if (q.includes('fail') || q.includes('decline') || q.includes('why')) {
      return 'AI Audit: Your last card failure (PAY-192 for $125.00) returned Decline Code 51 (Insufficient Funds). Verify funding bounds or choose direct UPI callback options to recover.';
    }
    if (q.includes('recent') || q.includes('history') || q.includes('transactions')) {
      return 'Ledger Search: Found 3 recent settles: 1. PAY-001 ($25.00 settled via Credit Card), 2. PAY-002 ($10.00 settled via UPI), 3. PAY-003 ($150.00 pending audit).';
    }
    if (q.includes('spend') || q.includes('pattern') || q.includes('analyze')) {
      return 'Volume Analytics: Credit Card settlements lead at 42% of volume, followed by Debit Cards (18%) and UPI (15%). Overall charge velocity shows stable +14.8% growth weekly.';
    }
    if (q.includes('status') || q.includes('explain')) {
      return 'Status Timelines Guide: 1. Initiated (Payload validation checks), 2. Authorized (Fraud Analytics radar checks), 3. Success (Settled successfully by the bank), 4. Pending (Manual verification check required).';
    }
    return 'I have run a diagnostic sweep across your payments dashboard. gross sales volume ($82.4K settled) is within normal parameters, API endpoints show 99.9% uptime, and no active cyber threat vectors are currently bypass-testing the idempotency caches.';
  };

  const handleSendMessage = (text: string) => {
    if (!text.trim()) return;

    const userMsg: ChatMessage = {
      id: `msg-user-${Date.now()}`,
      sender: 'user',
      text: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    setTimeout(() => {
      const replyText = getAiReply(userMsg.text);
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

  return (
    <div className="space-y-6 text-left max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">AI Operations Assistant</h1>
        <p className="mt-1 text-xs text-slate-500">
          Query merchant diagnostics, explain acquirer codes, and audit transaction volumes in real-time.
        </p>
      </div>

      <div className="flex flex-col h-[60vh] border border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900 overflow-hidden shadow-sm transition-colors">
        
        {/* Header bar */}
        <div className="flex items-center gap-3 bg-slate-50/50 dark:bg-slate-800/10 px-6 py-3.5 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-white">
            <Brain className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-900 dark:text-white">Aegis Intelligence Console</h3>
            <span className="text-[8px] font-semibold text-emerald-400 block uppercase tracking-wider">Operational Assistant Active</span>
          </div>
        </div>

        {/* Message feed logs */}
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
                <span>Auditing ledger databases...</span>
              </div>
            </div>
          )}
        </div>

        {/* Suggested chips footer area */}
        <div className="px-6 py-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap gap-2 shrink-0 bg-slate-50/20">
          {suggestedPrompts.map((prompt) => (
            <button
              key={prompt}
              onClick={() => handleSendMessage(prompt)}
              className="flex items-center gap-1 px-3 py-1.5 border border-slate-200 dark:border-slate-800 rounded-xl text-[10px] font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              <Sparkles className="h-3 w-3 text-primary" />
              {prompt}
            </button>
          ))}
        </div>

        {/* Input box */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage(inputText);
          }}
          className="p-4 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0"
        >
          <div className="relative flex items-center bg-slate-50 dark:bg-slate-950/40 rounded-xl border border-slate-200 dark:border-slate-800 pl-3 pr-1.5 py-1.5 focus-within:ring-2 focus-within:ring-primary/20 transition-all">
            <input
              type="text"
              placeholder="Ask me: 'why did my payment fail?', or 'analyze spending'..."
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
    </div>
  );
};
export default AiAssistant;
