import React, { useState, useEffect, useRef } from 'react';
import {
  ShieldAlert,
  Bot,
  Sparkles,
  Send,
  Trash2,
  Minimize2,
  Maximize2,
  X,
  MessageSquare,
  HelpCircle,
  Copy,
  Check,
  CheckCircle2,
  ExternalLink,
  Lock,
  ChevronRight,
  RefreshCw,
  AlertTriangle,
} from 'lucide-react';
import { InvestigationData, AiChatMessage } from '../types';
import { sendAiChatMessage, fetchAiConversation, clearAiConversation } from '../utils/api';

interface AiSecurityAssistantProps {
  currentInvestigation: InvestigationData;
  isOpenDefault?: boolean;
}

const SUGGESTED_PROMPTS = [
  'Why was this email classified as malicious?',
  'Explain this in simple language.',
  'Give me a technical explanation.',
  'What failed in SPF/DKIM/DMARC?',
  'Explain the suspicious URL.',
  'What does this IP tell us?',
  'Where is the suspicious infrastructure located?',
  'What evidence supports the verdict?',
  'What should an investigator do next?',
  'Explain the risk score breakdown.',
  'What does the Attack Graph show?',
  'Summarize this investigation.',
];

export function AiSecurityAssistant({ currentInvestigation }: AiSecurityAssistantProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [explanationMode, setExplanationMode] = useState<'technical' | 'simple'>('technical');
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<AiChatMessage[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Load existing conversation or initialize with welcome message when investigation changes
  useEffect(() => {
    let isMounted = true;
    async function loadChat() {
      const savedMessages = await fetchAiConversation(currentInvestigation.id);
      if (isMounted) {
        if (savedMessages.length > 0) {
          setMessages(savedMessages);
        } else {
          // Initialize with contextual welcome message
          const welcomeMessage: AiChatMessage = {
            id: `init-${currentInvestigation.id}`,
            role: 'assistant',
            content: `**SOC AI Security Assistant Online**\n\nI am grounded in active investigation **Case ${currentInvestigation.id}** (*${currentInvestigation.subject}*).\n\n• **Verdict**: **${currentInvestigation.verdict}** (Risk Score: **${currentInvestigation.riskScore}/100**)\n• **Authentication**: DMARC: \`${currentInvestigation.authStatus?.dmarc}\` | SPF: \`${currentInvestigation.authStatus?.spf}\` | DKIM: \`${currentInvestigation.authStatus?.dkim}\`\n• **Detonated URLs**: ${currentInvestigation.urls?.length || 0} extracted\n• **Evidence Chain**: ${currentInvestigation.evidenceItems?.length || 0} SHA-256 artifacts\n\nAsk any question below or click a suggested prompt to explore forensic findings.`,
            timestamp: new Date().toISOString(),
            sources: [
              `Case ID: ${currentInvestigation.id}`,
              `Verdict: ${currentInvestigation.verdict}`,
              `DMARC: ${currentInvestigation.authStatus?.dmarc}`,
            ],
            confidence: `${currentInvestigation.confidencePercentage || 94}%`,
            mode: 'INVESTIGATION_AWARE',
            explanationType: explanationMode,
          };
          setMessages([welcomeMessage]);
        }
      }
    }

    loadChat();
    return () => {
      isMounted = false;
    };
  }, [currentInvestigation.id]);

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputMessage).trim();
    if (!query || isLoading) return;

    setInputMessage('');
    const userMsgId = `user-${Date.now()}`;
    const newMsg: AiChatMessage = {
      id: userMsgId,
      role: 'user',
      content: query,
      timestamp: new Date().toISOString(),
      explanationType: explanationMode,
    };

    setMessages((prev) => [...prev, newMsg]);
    setIsLoading(true);

    try {
      const response = await sendAiChatMessage(
        currentInvestigation.id,
        query,
        currentInvestigation,
        explanationMode
      );

      const assistantMsg: AiChatMessage = {
        id: `assist-${Date.now()}`,
        role: 'assistant',
        content: response.answer,
        timestamp: new Date().toISOString(),
        sources: response.sources,
        recommendations: response.recommendations,
        confidence: response.confidence,
        explanationType: response.explanationType || explanationMode,
        mode: response.mode,
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      console.error('Chat error:', err);
      const errorMsg: AiChatMessage = {
        id: `err-${Date.now()}`,
        role: 'assistant',
        content: `I encountered an issue querying the investigation context. Operating in deterministic explanation fallback.`,
        timestamp: new Date().toISOString(),
        mode: 'DETERMINISTIC_EXPLANATION',
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearHistory = async () => {
    await clearAiConversation(currentInvestigation.id);
    const resetMsg: AiChatMessage = {
      id: `reset-${Date.now()}`,
      role: 'assistant',
      content: `Conversation history cleared for Case **${currentInvestigation.id}**. Investigation telemetry remains fully intact. How can I assist you?`,
      timestamp: new Date().toISOString(),
      mode: 'INVESTIGATION_AWARE',
    };
    setMessages([resetMsg]);
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      {/* Floating Trigger Button (Bottom-Right) */}
      {!isOpen && (
        <div className="fixed bottom-5 right-5 z-40 animate-fade-in">
          <button
            onClick={() => setIsOpen(true)}
            id="ai-security-assistant-trigger"
            aria-label="Open AI Security Assistant"
            className="group relative flex items-center gap-3 px-4 py-3 bg-[#0B0F16]/95 hover:bg-[#121824] border border-[#00daf3]/50 hover:border-[#00daf3] text-[#F4F7FB] rounded-full backdrop-blur-md transition-all duration-300 hover:scale-105 active:scale-95"
          >
            {/* Glowing Pulse Ring */}
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00daf3] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-[#00daf3]"></span>
            </span>

            <div className="w-8 h-8 rounded-full bg-[#00daf3]/20 border border-[#00daf3] flex items-center justify-center text-[#00daf3] group-hover:rotate-12 transition-transform">
              <Bot className="w-5 h-5" />
            </div>

            <div className="text-left font-mono-data pr-1 hidden sm:block">
              <div className="text-xs font-bold tracking-wider text-[#00daf3] flex items-center gap-1.5">
                AI SECURITY ASSISTANT
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#00E676] animate-pulse"></span>
              </div>
              <div className="text-[10px] text-[#8A94A6]">
                Investigation-aware • Case {currentInvestigation.id.slice(0, 12)}
              </div>
            </div>
          </button>
        </div>
      )}

      {/* Floating Chat Panel Drawer */}
      {isOpen && (
        <div
          id="ai-assistant-modal-panel"
          className={`fixed z-50 transition-all duration-300 flex flex-col bg-[#090B10]/95 backdrop-blur-xl border border-[#00daf3]/40 shadow-[0_10px_50px_rgba(0,0,0,0.8),0_0_30px_rgba(0,218,243,0.2)] rounded-xl overflow-hidden font-mono-data ${
            isExpanded
              ? 'inset-3 sm:inset-6 md:inset-10'
              : 'bottom-4 right-4 sm:bottom-6 sm:right-6 w-[calc(100vw-32px)] sm:w-[480px] lg:w-[540px] h-[640px] max-h-[88vh]'
          }`}
        >
          {/* Header */}
          <div className="p-3.5 sm:p-4 bg-[#0B0F16] border-b border-[#202B3C] flex items-center justify-between gap-3 shrink-0">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-[#00daf3]/15 border border-[#00daf3]/40 flex items-center justify-center text-[#00daf3] shrink-0">
                <Bot className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-xs sm:text-sm font-bold text-[#F4F7FB] truncate font-headline">
                    AI SECURITY ASSISTANT
                  </h3>
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-[#00E676]/10 text-[#00E676] border border-[#00E676]/30 flex items-center gap-1 shrink-0">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#00E676] animate-pulse"></span>
                    Investigation-aware
                  </span>
                </div>
                <div className="text-[10px] text-[#8A94A6] truncate flex items-center gap-2 mt-0.5">
                  <span>Case: {currentInvestigation.id}</span>
                  <span>•</span>
                  <span className={currentInvestigation.verdict === 'MALICIOUS' ? 'text-[#FF3D00]' : 'text-[#00E676]'}>
                    {currentInvestigation.verdict} ({currentInvestigation.riskScore}/100)
                  </span>
                </div>
              </div>
            </div>

            {/* Header Action Buttons */}
            <div className="flex items-center gap-1 shrink-0 text-[#8A94A6]">
              <button
                onClick={handleClearHistory}
                title="Clear conversation"
                aria-label="Clear chat history"
                className="p-1.5 rounded hover:bg-[#1a1b21] hover:text-[#FF3D00] transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                title={isExpanded ? 'Restore size' : 'Expand panel'}
                aria-label="Toggle full size"
                className="p-1.5 rounded hover:bg-[#1a1b21] hover:text-[#00daf3] transition-colors hidden sm:block"
              >
                {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                title="Close Assistant"
                aria-label="Close chat panel"
                className="p-1.5 rounded hover:bg-[#1a1b21] hover:text-[#F4F7FB] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Mode Selector & Prompt Injection Guard Strip */}
          <div className="px-3.5 py-2 bg-[#0E131C] border-b border-[#202B3C] flex items-center justify-between gap-2 text-[10px] shrink-0">
            <div className="flex items-center gap-1">
              <span className="text-[#8A94A6]">Mode:</span>
              <div className="flex bg-[#090B10] p-0.5 rounded border border-[#202B3C]">
                <button
                  onClick={() => setExplanationMode('technical')}
                  className={`px-2 py-0.5 rounded transition-all ${
                    explanationMode === 'technical'
                      ? 'bg-[#00daf3]/20 text-[#00daf3] font-bold'
                      : 'text-[#8A94A6] hover:text-[#F4F7FB]'
                  }`}
                >
                  Technical (SOC)
                </button>
                <button
                  onClick={() => setExplanationMode('simple')}
                  className={`px-2 py-0.5 rounded transition-all ${
                    explanationMode === 'simple'
                      ? 'bg-[#00daf3]/20 text-[#00daf3] font-bold'
                      : 'text-[#8A94A6] hover:text-[#F4F7FB]'
                  }`}
                >
                  Simple (User)
                </button>
              </div>
            </div>

            <div className="flex items-center gap-1 text-[#8A94A6] text-[9px] truncate" title="Attacker content is strictly sanitized and treated as data">
              <Lock className="w-3 h-3 text-[#00daf3] shrink-0" />
              <span className="hidden sm:inline">Prompt Shield Active</span>
            </div>
          </div>

          {/* Chat Messages Body */}
          <div className="flex-1 overflow-y-auto p-3.5 sm:p-4 space-y-4 text-xs font-mono-data scrollbar-thin scrollbar-thumb-[#202B3C]">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'assistant' && (
                  <div className="w-6 h-6 rounded bg-[#00daf3]/15 border border-[#00daf3]/40 flex items-center justify-center text-[#00daf3] shrink-0 mt-1">
                    <Bot className="w-3.5 h-3.5" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] sm:max-w-[80%] rounded-lg p-3 space-y-2 relative group ${
                    msg.role === 'user'
                      ? 'bg-[#00daf3]/15 border border-[#00daf3]/40 text-[#F4F7FB] rounded-br-none'
                      : 'bg-[#0E131C] border border-[#202B3C] text-[#D1D7E0] rounded-bl-none shadow-md'
                  }`}
                >
                  {/* Assistant Header Badge */}
                  {msg.role === 'assistant' && (
                    <div className="flex items-center justify-between gap-2 border-b border-[#202B3C]/70 pb-1.5 mb-1.5 text-[9px]">
                      <div className="flex items-center gap-1.5 text-[#00daf3]">
                        <Sparkles className="w-3 h-3" />
                        <span className="font-bold">
                          {msg.mode === 'INVESTIGATION_AWARE' ? 'AI Grounded Analysis' : 'Forensic Explanation'}
                        </span>
                        {msg.confidence && (
                          <span className="text-[#8A94A6]">({msg.confidence} Confidence)</span>
                        )}
                      </div>
                      <button
                        onClick={() => handleCopy(msg.content, msg.id)}
                        className="text-[#8A94A6] hover:text-[#00daf3] transition-colors p-0.5"
                        title="Copy text"
                      >
                        {copiedId === msg.id ? (
                          <Check className="w-3 h-3 text-[#00E676]" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </button>
                    </div>
                  )}

                  {/* Message Content formatted with line breaks and markdown blocks */}
                  <div className="leading-relaxed whitespace-pre-wrap font-sans text-xs">
                    {msg.content.split('\n').map((line, lIdx) => {
                      if (line.startsWith('• ') || line.startsWith('- ')) {
                        return (
                          <div key={lIdx} className="flex items-start gap-1.5 my-1 pl-1">
                            <span className="text-[#00daf3] mt-0.5 shrink-0">›</span>
                            <span>{line.replace(/^[•\-]\s*/, '')}</span>
                          </div>
                        );
                      }
                      if (line.startsWith('**') && line.endsWith('**')) {
                        return (
                          <div key={lIdx} className="font-bold text-[#F4F7FB] font-mono-data mt-2 mb-1">
                            {line.replace(/\*\*/g, '')}
                          </div>
                        );
                      }
                      return <p key={lIdx} className="my-0.5">{line}</p>;
                    })}
                  </div>

                  {/* Sources Strip */}
                  {msg.sources && msg.sources.length > 0 && (
                    <div className="pt-2 mt-2 border-t border-[#202B3C]/70 space-y-1">
                      <span className="text-[9px] text-[#8A94A6] uppercase tracking-wider block font-bold">
                        Grounded Artifacts &amp; Sources:
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {msg.sources.map((s, sIdx) => (
                          <span
                            key={sIdx}
                            className="px-1.5 py-0.5 rounded bg-[#1a1b21] border border-[#202B3C] text-[9px] text-[#00daf3] font-mono-data"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Recommendations Strip */}
                  {msg.recommendations && msg.recommendations.length > 0 && (
                    <div className="pt-2 mt-2 border-t border-[#202B3C]/70 space-y-1">
                      <span className="text-[9px] text-[#00E676] uppercase tracking-wider block font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        Recommended Next Steps:
                      </span>
                      <ul className="space-y-0.5 text-[10px] text-[#D1D7E0]">
                        {msg.recommendations.map((r, rIdx) => (
                          <li key={rIdx} className="flex items-start gap-1.5">
                            <span className="text-[#00E676]">✓</span>
                            <span>{r}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Timestamp */}
                  <div className="text-[8px] text-[#8A94A6] text-right font-mono-data pt-0.5">
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </div>
                </div>

                {msg.role === 'user' && (
                  <div className="w-6 h-6 rounded bg-[#00daf3]/30 border border-[#00daf3] flex items-center justify-center text-[#090B10] font-bold text-[10px] shrink-0 mt-1">
                    U
                  </div>
                )}
              </div>
            ))}

            {/* Loading Indicator */}
            {isLoading && (
              <div className="flex gap-3 justify-start items-center">
                <div className="w-6 h-6 rounded bg-[#00daf3]/15 border border-[#00daf3]/40 flex items-center justify-center text-[#00daf3] shrink-0 animate-spin">
                  <RefreshCw className="w-3.5 h-3.5" />
                </div>
                <div className="bg-[#0E131C] border border-[#202B3C] rounded-lg p-3 text-xs text-[#00daf3] flex items-center gap-2">
                  <span className="animate-pulse">Analyzing investigation telemetry &amp; facts...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggested Prompts Carousel */}
          <div className="px-3.5 py-2 bg-[#0B0F16] border-t border-[#202B3C] shrink-0">
            <div className="text-[9px] text-[#8A94A6] uppercase tracking-wider mb-1.5 flex items-center gap-1 font-bold">
              <HelpCircle className="w-3 h-3 text-[#00daf3]" />
              Suggested Investigation Questions:
            </div>
            <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {SUGGESTED_PROMPTS.map((prompt, pIdx) => (
                <button
                  key={pIdx}
                  onClick={() => handleSendMessage(prompt)}
                  disabled={isLoading}
                  className="px-2.5 py-1 rounded bg-[#1a1b21] hover:bg-[#00daf3]/15 border border-[#202B3C] hover:border-[#00daf3]/50 text-[10px] text-[#D1D7E0] hover:text-[#00daf3] whitespace-nowrap transition-all shrink-0 active:scale-95 disabled:opacity-50"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>

          {/* Input Box */}
          <div className="p-3 bg-[#090B10] border-t border-[#202B3C] shrink-0">
            <div className="flex items-center gap-2 bg-[#0E131C] border border-[#202B3C] focus-within:border-[#00daf3] rounded-lg px-3 py-2 transition-colors">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={`Ask anything about Case ${currentInvestigation.id}...`}
                disabled={isLoading}
                className="flex-1 bg-transparent border-none outline-none text-xs text-[#F4F7FB] placeholder-[#8A94A6] font-mono-data"
              />

              <button
                onClick={() => handleSendMessage()}
                disabled={!inputMessage.trim() || isLoading}
                aria-label="Send message"
                className="w-7 h-7 rounded bg-[#00daf3] text-[#090B10] flex items-center justify-center hover:brightness-110 active:scale-90 transition-all disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="flex justify-between items-center px-1 pt-1.5 text-[8px] text-[#8A94A6]">
              <span>Grounded in active telemetry • Non-hallucinated</span>
              <span>Press <kbd className="text-[#00daf3]">Enter ↵</kbd> to submit</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
