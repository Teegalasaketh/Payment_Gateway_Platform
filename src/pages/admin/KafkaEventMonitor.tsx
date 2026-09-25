import React, { useState, useEffect, useMemo } from 'react';
import { mockKafkaEvents, type KafkaEvent } from '../../mock/adminData';
import {
  Activity,
  Play,
  Pause,
  PlusCircle,
  Eye,
  Database,
  X
} from 'lucide-react';
import { toast } from 'sonner';

export const KafkaEventMonitor: React.FC = () => {
  const [events, setEvents] = useState<KafkaEvent[]>(mockKafkaEvents);
  const [isPaused, setIsPaused] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<KafkaEvent | null>(null);

  // Active topic filter
  const [topicFilter, setTopicFilter] = useState('All');

  // Statistics
  const stats = useMemo(() => {
    const total = events.length;
    const success = events.filter((e) => e.status === 'Success').length;
    const failed = events.filter((e) => e.status === 'Failed').length;
    
    return { total, success, failed };
  }, [events]);

  // Dynamic Event Stream Simulation
  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      // Create a random new event
      const eventNames: ('PaymentCreatedEvent' | 'PaymentProcessedEvent' | 'FraudAlertEvent' | 'WebhookDispatchEvent')[] = [
        'PaymentCreatedEvent',
        'PaymentProcessedEvent',
        'FraudAlertEvent',
        'WebhookDispatchEvent'
      ];
      
      const topics = {
        PaymentCreatedEvent: 'payment-events-created',
        PaymentProcessedEvent: 'payment-events-processed',
        FraudAlertEvent: 'fraud-alert-events',
        WebhookDispatchEvent: 'webhook-dispatcher-logs'
      };

      const consumers = {
        PaymentCreatedEvent: 'payment-processor-consumer',
        PaymentProcessedEvent: 'ledger-update-consumer',
        FraudAlertEvent: 'fraud-detection-engine',
        WebhookDispatchEvent: 'webhook-sender-service'
      };

      const name = eventNames[Math.floor(Math.random() * eventNames.length)];
      const status = Math.random() > 0.08 ? 'Success' : 'Failed';
      const id = `evt-${Math.floor(100000 + Math.random() * 900000)}`;
      const timestamp = new Date().toISOString();

      const newEvent: KafkaEvent = {
        id,
        eventName: name,
        status,
        timestamp,
        topic: topics[name],
        consumer: consumers[name],
        payload: JSON.stringify({
          eventId: `evt-payload-${Math.floor(Math.random() * 1000)}`,
          traceId: `trace-key-${Math.floor(10000 + Math.random() * 90000)}`,
          timestamp,
          eventName: name,
          status,
          data: {
            paymentId: `PAY-${String(Math.floor(Math.random() * 200) + 1).padStart(3, '0')}`,
            gatewayChannel: 'stripe-fallback-api'
          }
        }, null, 2)
      };

      setEvents((prev) => [newEvent, ...prev.slice(0, 199)]); // Cap at 200 items in state
    }, 2800); // Push every 2.8s

    return () => clearInterval(interval);
  }, [isPaused]);

  // Manually Inject Event
  const injectEvent = () => {
    const timestamp = new Date().toISOString();
    const id = `evt-manual-${Math.floor(100000 + Math.random() * 900000)}`;
    const name = 'FraudAlertEvent';
    
    const manualEvent: KafkaEvent = {
      id,
      eventName: name,
      status: 'Pending',
      timestamp,
      topic: 'fraud-alert-events',
      consumer: 'fraud-detection-engine',
      payload: JSON.stringify({
        eventId: `evt-manual-payload`,
        traceId: `trace-manual-key`,
        timestamp,
        eventName: name,
        status: 'Pending',
        data: {
          paymentId: 'PAY-003',
          riskScore: 92,
          reason: 'Manual event injection check'
        }
      }, null, 2)
    };

    setEvents((prev) => [manualEvent, ...prev]);
    toast.success('Injected manual FraudAlertEvent to payment-events stream.');
  };

  const filteredEvents = useMemo(() => {
    if (topicFilter === 'All') return events;
    return events.filter((e) => e.topic === topicFilter);
  }, [events, topicFilter]);

  return (
    <div className="space-y-6 text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Kafka Event Stream Monitor</h1>
          <p className="mt-1 text-xs text-slate-500">
            Real-time visual stream of event queue broker pipelines and active consumer groups.
          </p>
        </div>
        
        <div className="flex gap-2 shrink-0">
          <button
            onClick={() => setIsPaused(!isPaused)}
            className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold transition-all shadow-sm ${
              isPaused
                ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300'
            }`}
          >
            {isPaused ? (
              <>
                <Play className="h-4 w-4" />
                Resume Stream
              </>
            ) : (
              <>
                <Pause className="h-4 w-4" />
                Pause Stream
              </>
            )}
          </button>
          
          <button
            onClick={injectEvent}
            className="flex items-center justify-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-white hover:bg-primary-hover shadow-sm"
          >
            <PlusCircle className="h-4 w-4" />
            Inject Fraud Event
          </button>
        </div>
      </div>

      {/* Metrics Board */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Stream Broker Status</div>
          <div className="mt-3 flex items-center gap-2">
            <span className={`h-2.5 w-2.5 rounded-full ${isPaused ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500 animate-ping'}`}></span>
            <span className="text-sm font-extrabold">{isPaused ? 'Paused' : 'Listening'}</span>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Queue Throughput</div>
          <div className="mt-3 text-xl font-extrabold">2.4 eps</div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Events Success</div>
          <div className="mt-3 text-xl font-extrabold text-emerald-500">{stats.success}</div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Broker Errors</div>
          <div className="mt-3 text-xl font-extrabold text-red-500">{stats.failed}</div>
        </div>
      </div>

      {/* Main Stream interface */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Topic Filters list */}
        <div className="lg:col-span-1 space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">Stream Topics</h3>
          <div className="flex flex-col gap-2">
            {[
              { name: 'All Topics', topic: 'All' },
              { name: 'payment-events-created', topic: 'payment-events-created' },
              { name: 'payment-events-processed', topic: 'payment-events-processed' },
              { name: 'fraud-alert-events', topic: 'fraud-alert-events' },
              { name: 'webhook-dispatcher-logs', topic: 'webhook-dispatcher-logs' }
            ].map((t) => (
              <button
                key={t.topic}
                onClick={() => setTopicFilter(t.topic)}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
                  topicFilter === t.topic
                    ? 'bg-primary text-white border-primary shadow'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:bg-slate-50 text-slate-600 dark:text-slate-400'
                }`}
              >
                <div className="truncate">{t.name}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Realtime Event Logs list */}
        <div className="lg:col-span-3 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold">Live Stream Logs</h3>
            <span className="text-[10px] text-slate-400 font-semibold">Capped at 200 traces</span>
          </div>

          <div className="max-h-[60vh] overflow-y-auto space-y-2 border border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900 p-4">
            {filteredEvents.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <Database className="h-8 w-8 text-slate-300 dark:text-slate-700" />
                <h4 className="mt-2 text-xs font-bold text-slate-400">No events matched</h4>
              </div>
            ) : (
              filteredEvents.map((evt) => {
                const colors = {
                  Success: 'border-emerald-500 bg-emerald-50/20 dark:bg-emerald-950/10 text-emerald-600',
                  Failed: 'border-red-500 bg-red-50/20 dark:bg-red-950/10 text-red-600',
                  Pending: 'border-amber-500 bg-amber-50/20 dark:bg-amber-950/10 text-amber-600'
                };
                
                return (
                  <div
                    key={evt.id}
                    className={`flex items-center justify-between border-l-2 p-3 rounded-r-xl hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors ${colors[evt.status]}`}
                  >
                    <div className="min-w-0 flex-1 text-left">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900 dark:text-slate-100">{evt.eventName}</span>
                        <span className="text-[9px] font-semibold bg-slate-200 dark:bg-slate-800 px-1.5 py-0.5 rounded text-slate-500">
                          {evt.id}
                        </span>
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] text-slate-400 mt-1 font-semibold">
                        <span className="flex items-center gap-1">
                          <Database className="h-3 w-3" />
                          Topic: {evt.topic}
                        </span>
                        <span className="flex items-center gap-1">
                          <Activity className="h-3 w-3" />
                          Consumer: {evt.consumer}
                        </span>
                        <span>Time: {new Date(evt.timestamp).toLocaleTimeString()}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 ml-4">
                      <button
                        onClick={() => setSelectedEvent(evt)}
                        className="flex items-center gap-1 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 px-2 py-1 text-[10px] font-bold text-slate-700 dark:text-slate-300 transition-colors"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        Inspect
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>

      {/* ================================================================== */}
      {/* INSPECT MODAL */}
      {/* ================================================================== */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="relative w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900 animate-scale-up">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <div>
                <h3 className="text-base font-bold">Inspect Event Payload</h3>
                <p className="text-[10px] text-slate-400 font-semibold">Partition Event: {selectedEvent.id}</p>
              </div>
              <button onClick={() => setSelectedEvent(null)} className="rounded-lg p-1 text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800">
                <X className="h-4.5 w-4.5" />
              </button>
            </div>
            
            <div className="mt-4 space-y-4 text-xs text-left">
              <div className="grid grid-cols-2 gap-4 bg-slate-50 dark:bg-slate-950/40 p-3 rounded-lg">
                <div>
                  <span className="text-slate-400 font-bold block">Kafka Topic</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-300 block">{selectedEvent.topic}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-bold block">Active Consumer Group</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-300 block">{selectedEvent.consumer}</span>
                </div>
              </div>

              <div>
                <span className="text-slate-400 font-bold block mb-1">Payload Body (JSON)</span>
                <pre className="block max-h-60 overflow-auto rounded-lg bg-slate-50 p-4 font-mono text-[10px] dark:bg-slate-950 text-slate-700 dark:text-slate-300">
                  {selectedEvent.payload}
                </pre>
              </div>
            </div>
            
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setSelectedEvent(null)}
                className="rounded-xl bg-primary px-4 py-2.5 text-xs font-bold text-white hover:bg-primary-hover shadow-sm"
              >
                Close Trace
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
