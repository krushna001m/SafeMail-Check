import React from 'react';
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Eye,
  Lock,
  ShieldCheck,
  Smartphone,
} from 'lucide-react';

const safetySteps = [
  {
    icon: Eye,
    title: 'Stop and check',
    text: 'If a message feels urgent or threatening, pause before clicking. Real organisations usually give you time to verify.',
  },
  {
    icon: Smartphone,
    title: 'Use a second path',
    text: 'Call the company or open their official app directly instead of trusting a link inside the email.',
  },
  {
    icon: Lock,
    title: 'Protect your login',
    text: 'Never share passwords, codes, or OTPs with anyone. Security teams will never ask for them by email.',
  },
  {
    icon: ShieldCheck,
    title: 'Look for red flags',
    text: 'Spelling mistakes, strange sender addresses, mismatched domains, odd attachments, and pressure tactics are common signs.',
  },
];

const quickActions = [
  'Do not open unexpected attachments from unknown senders.',
  'Verify the sender by calling the known business contact.',
  'Use multi-factor authentication on important accounts.',
  'Report suspicious emails to your IT or security team quickly.',
];

export const AwarenessView: React.FC = () => {
  return (
    <div className="w-full max-w-[1200px] mx-auto p-4 sm:p-6 lg:p-10 pb-20 space-y-6">
      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-2xl border border-[#202B3C] bg-[#0B0F16]/90 p-6 sm:p-8 shadow-[0_0_40px_rgba(0,218,243,0.08)]">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-11 h-11 rounded-xl bg-[#00daf3]/10 border border-[#00daf3]/30 flex items-center justify-center text-[#00daf3]">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] font-mono-data uppercase tracking-[0.2em] text-[#8A94A6]">
                Awareness
              </div>
              <h3 className="font-headline text-2xl font-bold text-[#F4F7FB] mt-1">
                Stay alert, verify before you trust.
              </h3>
            </div>
          </div>

          <p className="text-sm text-[#cbd5e1] leading-7 max-w-xl">
            Most phishing attacks succeed because they feel urgent, familiar, or important. Slow down, check the facts,
            and confirm the request through a trusted channel before taking action.
          </p>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {safetySteps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div
                  key={step.title}
                  className="float-slow rounded-xl border border-[#202B3C] bg-[#111827]/80 p-4 transition-transform duration-200 hover:-translate-y-0.5 hover:border-[#00daf3]/50"
                  style={{ animationDelay: `${index * 0.4}s` }}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-lg bg-[#00daf3]/10 text-[#00daf3] flex items-center justify-center">
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="font-mono-data text-xs font-bold uppercase text-[#00daf3]">
                      {step.title}
                    </span>
                  </div>
                  <p className="text-sm text-[#cbd5e1] leading-6">{step.text}</p>
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-2xl border border-[#202B3C] bg-[#0B0F16]/90 p-6">
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle2 className="w-4 h-4 text-[#00E676]" />
            <span className="font-mono-data text-[10px] uppercase tracking-[0.2em] text-[#8A94A6]">
              Quick actions
            </span>
          </div>

          <div className="space-y-3">
            {quickActions.map((item, index) => (
              <div
                key={item}
                className="flex items-start gap-3 rounded-xl border border-[#202B3C] bg-[#121824] p-3 animate-pulse"
              >
                <div className="mt-1 flex h-6 w-6 items-center justify-center rounded-full bg-[#00daf3]/10 text-[#00daf3] text-xs font-bold">
                  {index + 1}
                </div>
                <p className="text-sm text-[#e2e2e9] leading-6">{item}</p>
              </div>
            ))}
          </div>

          <div className="mt-6 rounded-xl border border-[#00daf3]/30 bg-[#00daf3]/5 p-4 text-sm text-[#dfeaf7]">
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="font-mono-data text-[10px] uppercase tracking-[0.2em] text-[#00daf3]">
                Safety rule
              </span>
              <ArrowRight className="w-4 h-4 text-[#00daf3]" />
            </div>
            If it feels suspicious, do not click, do not reply, and do not share any code or credentials. Verify first.
          </div>
        </div>
      </div>
    </div>
  );
};
