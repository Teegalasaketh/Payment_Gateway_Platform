import React, { useState, useEffect } from 'react';
import { 
  HelpCircle, 
  MessageSquare, 
  Mail, 
  Phone, 
  ChevronDown, 
  ChevronUp, 
  FileText, 
  BookOpen,
  Send,
  LifeBuoy
} from 'lucide-react';
import { toast } from 'sonner';
import { userService } from '../../services/user.service';

export const HelpSupport: React.FC = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [message, setMessage] = useState('');
  const [subject, setSubject] = useState('General Inquiry');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tickets, setTickets] = useState<any[]>([]);
  const [isLoadingTickets, setIsLoadingTickets] = useState(true);

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const response = await userService.getSupportTickets();
        setTickets(response.data);
      } catch (error) {
        console.error('Failed to fetch tickets:', error);
      } finally {
        setIsLoadingTickets(false);
      }
    };
    fetchTickets();
  }, []);

  const faqs = [
    {
      question: "How long do INR settlements take?",
      answer: "Standard INR settlements via Net Banking or UPI are typically processed within T+1 business days. Credit and Debit card settlements may take up to T+2 days depending on the acquiring bank's processing windows."
    },
    {
      question: "What happens if a transaction is flagged by Aegis Shield?",
      answer: "When a transaction is flagged by our AI-driven Fraud Detection Center, it is temporarily halted. You will receive an alert in your Notifications. You can review the flagged transaction in your dashboard and choose to either manually authorize it or reject it permanently."
    },
    {
      question: "How do I update my webhook endpoint?",
      answer: "Currently, webhook configurations are managed by the administrative console. If you need to update your endpoints to receive PaymentProcessed events, please contact your account manager or submit a support ticket using the form below."
    },
    {
      question: "Why did a Credit Card payment fail with Insufficient Funds?",
      answer: "If a simulated payment in the sandbox environment exceeds ₹50,000, it automatically triggers a standard 'Insufficient Funds' decline rule to help you test failure handling and user edge cases."
    },
    {
      question: "Can I process international currencies?",
      answer: "Your current merchant profile is restricted exclusively to INR (₹) settlements as per your configuration. To enable cross-border multi-currency processing (USD, EUR, GBP), you must undergo additional KYC and submit an international gateway request."
    }
  ];

  const handleSupportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) {
      toast.error('Please enter a message to submit.');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const response = await userService.createSupportTicket(subject, message);
      setTickets((prev) => [response.data, ...prev]);
      setMessage('');
      toast.success(`Support ticket #${response.data.id} created successfully.`);
    } catch (error) {
      toast.error('Failed to create support ticket. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-10">
      {/* Header Section */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 to-slate-800 p-8 text-white shadow-xl dark:from-slate-950 dark:to-slate-900 border border-slate-700/50">
        <div className="absolute top-0 right-0 -mt-16 -mr-16 h-64 w-64 rounded-full bg-primary/20 blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 mb-4 border border-white/10 backdrop-blur-md">
              <LifeBuoy className="h-4 w-4 text-primary-200" />
              <span className="text-xs font-bold tracking-wider text-primary-100 uppercase">Support Center</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white mb-2">
              How can we help you today?
            </h1>
            <p className="text-slate-300 text-sm md:text-base max-w-xl leading-relaxed">
              Browse our frequently asked questions, read the technical documentation, or get in touch with our dedicated merchant success team for personalized assistance.
            </p>
          </div>
          <div className="shrink-0 hidden md:block">
            <div className="h-32 w-32 rounded-full border-4 border-white/10 flex items-center justify-center bg-white/5 backdrop-blur-sm">
              <HelpCircle className="h-16 w-16 text-primary-400 opacity-80" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: FAQs & Links */}
        <div className="lg:col-span-2 space-y-8">
          {/* Quick Links */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button className="flex items-center gap-4 p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-primary/50 transition-all group text-left">
              <div className="h-12 w-12 rounded-xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform">
                <BookOpen className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 dark:text-slate-200">Documentation</h3>
                <p className="text-xs text-slate-500 mt-1">Integration guides & API refs</p>
              </div>
            </button>
            <button className="flex items-center gap-4 p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-primary/50 transition-all group text-left">
              <div className="h-12 w-12 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform">
                <FileText className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 dark:text-slate-200">Developer Blog</h3>
                <p className="text-xs text-slate-500 mt-1">Latest updates & changelogs</p>
              </div>
            </button>
          </div>

          {/* FAQ Accordion */}
          <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-primary" />
                Frequently Asked Questions
              </h2>
            </div>
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {faqs.map((faq, index) => (
                <div key={index} className="group">
                  <button
                    onClick={() => setOpenFaq(openFaq === index ? null : index)}
                    className="w-full flex items-center justify-between p-5 text-left transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50"
                  >
                    <span className="font-semibold text-sm text-slate-700 dark:text-slate-300 pr-4">
                      {faq.question}
                    </span>
                    {openFaq === index ? (
                      <ChevronUp className="h-5 w-5 text-primary shrink-0" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-slate-400 group-hover:text-primary shrink-0 transition-colors" />
                    )}
                  </button>
                  <div
                    className={`overflow-hidden transition-all duration-300 ease-in-out ${
                      openFaq === index ? 'max-h-48 opacity-100' : 'max-h-0 opacity-0'
                    }`}
                  >
                    <div className="p-5 pt-0 text-sm text-slate-500 dark:text-slate-400 leading-relaxed bg-slate-50/50 dark:bg-slate-800/20">
                      {faq.answer}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Contact Form */}
        <div className="lg:col-span-1 space-y-6">
          <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm p-6">
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-1">Contact Support</h3>
            <p className="text-xs text-slate-500 mb-6">Create a ticket and our success team will get back to you.</p>
            
            <form onSubmit={handleSupportSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Inquiry Type</label>
                <select 
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                >
                  <option value="General Inquiry">General Inquiry</option>
                  <option value="Technical Issue">Technical Integration Issue</option>
                  <option value="Billing & Settlements">Billing & Settlements</option>
                  <option value="Fraud & Disputes">Fraud & Chargebacks</option>
                  <option value="Feature Request">Feature Request</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Detailed Description</label>
                <textarea 
                  rows={5}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Describe your issue or question in detail..."
                  className="w-full px-3.5 py-3 text-sm border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all resize-none"
                ></textarea>
              </div>

              <button 
                type="submit"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-bold text-white hover:bg-primary-hover shadow-md hover:shadow-lg transition-all disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Submit Ticket
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Alternate Contact Methods */}
          <div className="rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 space-y-4">
            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">Other ways to connect</h4>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center shadow-sm">
                <Phone className="h-4 w-4 text-slate-500" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-800 dark:text-slate-200">+91 1800-AEGIS-PAY</div>
                <div className="text-[10px] text-slate-500">Mon-Fri, 9AM-6PM IST</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center shadow-sm">
                <Mail className="h-4 w-4 text-slate-500" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-800 dark:text-slate-200">support@aegispay.com</div>
                <div className="text-[10px] text-slate-500">24/7 SLA Response</div>
              </div>
            </div>
          </div>

          {/* Ticket History */}
          <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm p-6">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" />
              My Support Tickets
            </h3>
            
            {isLoadingTickets ? (
              <div className="flex justify-center py-4">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
              </div>
            ) : tickets.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-xs text-slate-500">No support tickets found.</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                {tickets.map((ticket) => (
                  <div key={ticket.id} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 flex flex-col gap-2">
                    <div className="flex justify-between items-start">
                      <div className="font-semibold text-xs text-slate-800 dark:text-slate-200">{ticket.subject}</div>
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ${
                        ticket.status === 'OPEN' 
                          ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' 
                          : 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300'
                      }`}>
                        {ticket.status}
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-500 line-clamp-1">{ticket.message}</div>
                    <div className="flex justify-between items-center text-[9px] text-slate-400 font-medium">
                      <span>{ticket.id}</span>
                      <span>{new Date(ticket.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default HelpSupport;
