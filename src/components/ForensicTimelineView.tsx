import React, { useState, useRef } from 'react';
import { 
  FolderArchive, 
  Search, 
  Download, 
  CheckCircle2, 
  Mail, 
  ShieldAlert, 
  Globe, 
  Link, 
  MapPin, 
  AlertTriangle, 
  Copy, 
  Check, 
  Info,
  XCircle,
  HelpCircle,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Layers
} from 'lucide-react';
import { TimelineEvent, TimelineEventState } from '../types';

interface ForensicTimelineViewProps {
  timeline: TimelineEvent[];
  campaignId?: string;
  rawHeaders?: string;
}

export const ForensicTimelineView: React.FC<ForensicTimelineViewProps> = ({
  timeline,
  campaignId = 'Campaign #7721',
  rawHeaders,
}) => {
  const [filterCategory, setFilterCategory] = useState<'all' | 'email' | 'auth' | 'network' | 'intelligence' | 'verdict'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEventId, setSelectedEventId] = useState<string>(timeline[0]?.id || '');
  const [copied, setCopied] = useState(false);
  const [viewMode, setViewMode] = useState<'horizontal' | 'vertical'>('horizontal');

  const horizontalScrollRef = useRef<HTMLDivElement>(null);

  const selectedEvent = timeline.find((e) => e.id === selectedEventId) || timeline[0];

  const filteredEvents = timeline.filter((event) => {
    const matchesCat = filterCategory === 'all' || event.category === filterCategory;
    const matchesSearch =
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (event.stepName && event.stepName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      event.tags.some((t) => t.label.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCat && matchesSearch;
  });

  const getStateStyle = (state?: TimelineEventState) => {
    switch (state) {
      case 'CRITICAL':
        return {
          border: 'border-[#FF3D00]',
          bg: 'bg-[#FF3D00]/10',
          text: 'text-[#FF3D00]',
          badge: 'bg-[#FF3D00]/15 text-[#ffb4ab] border-[#FF3D00]/40',
          dot: 'bg-[#FF3D00]'
        };
      case 'WARNING':
        return {
          border: 'border-[#FFC107]',
          bg: 'bg-[#FFC107]/10',
          text: 'text-[#FFC107]',
          badge: 'bg-[#FFC107]/15 text-[#ffeac0] border-[#FFC107]/40',
          dot: 'bg-[#FFC107]'
        };
      case 'FAILED':
        return {
          border: 'border-[#ff5449]',
          bg: 'bg-[#ff5449]/10',
          text: 'text-[#ff5449]',
          badge: 'bg-[#ff5449]/15 text-[#ffb4ab] border-[#ff5449]/40',
          dot: 'bg-[#ff5449]'
        };
      case 'INFO':
        return {
          border: 'border-[#00daf3]',
          bg: 'bg-[#00daf3]/10',
          text: 'text-[#00daf3]',
          badge: 'bg-[#00daf3]/15 text-[#00daf3] border-[#00daf3]/40',
          dot: 'bg-[#00daf3]'
        };
      case 'UNKNOWN':
        return {
          border: 'border-[#8A94A6]',
          bg: 'bg-[#8A94A6]/10',
          text: 'text-[#8A94A6]',
          badge: 'bg-[#8A94A6]/15 text-[#8A94A6] border-[#8A94A6]/40',
          dot: 'bg-[#8A94A6]'
        };
      case 'NORMAL':
      default:
        return {
          border: 'border-[#00E676]',
          bg: 'bg-[#00E676]/10',
          text: 'text-[#00E676]',
          badge: 'bg-[#00E676]/15 text-[#00E676] border-[#00E676]/40',
          dot: 'bg-[#00E676]'
        };
    }
  };

  const getEventIcon = (event: TimelineEvent) => {
    switch (event.icon) {
      case 'mail':
        return <Mail className="w-4 h-4" />;
      case 'verified_user':
        return <ShieldAlert className="w-4 h-4" />;
      case 'search':
        return <Globe className="w-4 h-4" />;
      case 'link':
        return <Link className="w-4 h-4" />;
      case 'public':
        return <MapPin className="w-4 h-4" />;
      case 'warning':
      default:
        return <AlertTriangle className="w-4 h-4" />;
    }
  };

  const handleCopySnippet = (snippet?: string) => {
    if (!snippet) return;
    navigator.clipboard.writeText(snippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportHeaders = () => {
    const content = rawHeaders || selectedEvent?.rawHeaderSnippet || 'No headers available';
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `forensic_timeline_${campaignId.replace(/[^a-zA-Z0-9]/g, '_')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const scrollTrack = (direction: 'left' | 'right') => {
    if (horizontalScrollRef.current) {
      const scrollAmount = direction === 'left' ? -320 : 320;
      horizontalScrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <div className="w-full max-w-[1600px] mx-auto p-3 sm:p-6 lg:p-10 pb-20 space-y-6">
      {/* Top Filter & Navigation Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-[#0B0F16]/90 backdrop-blur-md p-4 sm:p-5 rounded-lg hud-border">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded bg-[#00daf3]/10 border border-[#00daf3]/30 flex items-center justify-center text-[#00daf3]">
            <FolderArchive className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono-data px-2 py-0.5 rounded bg-[#00daf3]/10 text-[#00daf3] border border-[#00daf3]/30 font-bold uppercase">
                COMPLETE LIFECYCLE RECONSTRUCTION
              </span>
              <span className="text-xs font-mono-data text-[#8A94A6]">15 Mapped Events</span>
            </div>
            <h2 className="font-headline text-lg sm:text-xl font-bold text-[#F4F7FB] mt-0.5">
              Interactive Forensic Investigation Timeline
            </h2>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Search */}
          <div className="relative flex-1 sm:w-56">
            <Search className="w-4 h-4 text-[#8A94A6] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search timeline..."
              className="w-full bg-[#1a1b21] border border-[#202B3C] focus:border-[#00daf3] rounded pl-9 pr-3 py-2 text-xs font-mono-data text-[#e2e2e9] placeholder-[#8A94A6]/60 focus:outline-none"
            />
          </div>

          {/* Category Filter Chips */}
          <div className="flex items-center gap-1 bg-[#1a1b21] p-1 rounded border border-[#202B3C] overflow-x-auto scrollbar-hide">
            {(['all', 'email', 'auth', 'network', 'intelligence', 'verdict'] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => setFilterCategory(cat)}
                className={`px-2.5 py-1 rounded font-mono-data text-[11px] capitalize transition-all min-h-[32px] ${
                  filterCategory === cat
                    ? 'bg-[#00daf3] text-[#090B10] font-bold'
                    : 'text-[#8A94A6] hover:text-[#e2e2e9]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Layout Mode Toggle (Desktop only) */}
          <div className="hidden xl:flex items-center gap-1 bg-[#1a1b21] p-1 rounded border border-[#202B3C]">
            <button
              onClick={() => setViewMode('horizontal')}
              className={`px-2.5 py-1 rounded font-mono-data text-[11px] transition-all min-h-[32px] ${
                viewMode === 'horizontal'
                  ? 'bg-[#00daf3] text-[#090B10] font-bold'
                  : 'text-[#8A94A6] hover:text-[#e2e2e9]'
              }`}
            >
              Horizontal Track
            </button>
            <button
              onClick={() => setViewMode('vertical')}
              className={`px-2.5 py-1 rounded font-mono-data text-[11px] transition-all min-h-[32px] ${
                viewMode === 'vertical'
                  ? 'bg-[#00daf3] text-[#090B10] font-bold'
                  : 'text-[#8A94A6] hover:text-[#e2e2e9]'
              }`}
            >
              Vertical Feed
            </button>
          </div>
        </div>
      </div>

      {/* Data-Flow Lifecycle Strip: Visual Flow Pipeline */}
      <div className="bg-[#0B0F16]/90 rounded-lg hud-border p-3 sm:p-4 overflow-hidden">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-[#00daf3]" />
            <span className="text-[10px] sm:text-xs font-mono-data text-[#8A94A6] uppercase tracking-wider font-semibold">
              Evidence Data Pipeline Flow
            </span>
          </div>
          <span className="text-[10px] font-mono-data text-[#00daf3]">
            {filteredEvents.length} Events Ingested
          </span>
        </div>

        {/* Pipeline breadcrumb dots */}
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide py-1">
          {timeline.map((evt, idx) => {
            const isSelected = selectedEvent?.id === evt.id;
            const style = getStateStyle(evt.state);
            return (
              <React.Fragment key={evt.id}>
                <button
                  onClick={() => setSelectedEventId(evt.id)}
                  title={`${evt.title} (${evt.time})`}
                  className={`px-2 py-1 rounded text-[10px] font-mono-data shrink-0 flex items-center gap-1.5 transition-all ${
                    isSelected
                      ? `${style.badge} font-bold ring-1 ring-[#00daf3]`
                      : 'bg-[#1a1b21] text-[#8A94A6] hover:text-[#e2e2e9] border border-[#202B3C]'
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
                  <span className="truncate max-w-[100px]">{evt.title}</span>
                </button>
                {idx < timeline.length - 1 && (
                  <span className="text-[#202B3C] text-[10px] shrink-0">→</span>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* DESKTOP HORIZONTAL TIMELINE VIEW */}
      {viewMode === 'horizontal' && (
        <div className="bg-[#0B0F16]/90 rounded-lg hud-border p-4 sm:p-6 space-y-4 relative">
          <div className="flex items-center justify-between border-b border-[#202B3C] pb-3">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#00daf3]" />
              <h3 className="font-headline text-sm sm:text-base font-bold text-[#F4F7FB]">
                Chronological Investigation Track
              </h3>
            </div>
            
            {/* Scroll Navigation Controls */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => scrollTrack('left')}
                className="p-1.5 rounded bg-[#1a1b21] hover:bg-[#202B3C] text-[#8A94A6] hover:text-[#00daf3] border border-[#202B3C] transition-colors"
                title="Scroll Left"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => scrollTrack('right')}
                className="p-1.5 rounded bg-[#1a1b21] hover:bg-[#202B3C] text-[#8A94A6] hover:text-[#00daf3] border border-[#202B3C] transition-colors"
                title="Scroll Right"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Horizontal Scrollable Cards Container */}
          <div
            ref={horizontalScrollRef}
            className="overflow-x-auto pb-4 pt-2 scrollbar-hide flex gap-4 relative"
          >
            {filteredEvents.map((evt, index) => {
              const isSelected = selectedEvent?.id === evt.id;
              const style = getStateStyle(evt.state);

              return (
                <div
                  key={evt.id}
                  onClick={() => setSelectedEventId(evt.id)}
                  className={`w-[290px] sm:w-[320px] shrink-0 p-4 rounded-lg border transition-all cursor-pointer select-none active:scale-[0.98] relative flex flex-col justify-between ${
                    isSelected
                      ? `border-[#00daf3] bg-[#00daf3]/10 ring-1 ring-[#00daf3]/50`
                      : `border-[#202B3C] bg-[#1a1b21] hover:border-[#00daf3]/50 hover:bg-[#1e1f25]`
                  }`}
                >
                  {/* Top Step + State Badge */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-mono-data px-1.5 py-0.5 rounded border border-[#202B3C] text-[#8A94A6] bg-[#0B0F16]">
                        STAGE {index + 1 < 10 ? `0${index + 1}` : index + 1}
                      </span>
                      <span
                        className={`text-[9px] font-mono-data px-2 py-0.5 rounded border font-bold uppercase ${style.badge}`}
                      >
                        {evt.state || 'NORMAL'}
                      </span>
                    </div>

                    {/* Icon + Title */}
                    <div className="flex items-center gap-2.5 mb-1.5">
                      <div
                        className={`w-7 h-7 rounded flex items-center justify-center shrink-0 border ${
                          isSelected
                            ? 'border-[#00daf3] bg-[#00daf3]/20 text-[#00daf3]'
                            : 'border-[#202B3C] bg-[#0B0F16] text-[#8A94A6]'
                        }`}
                      >
                        {getEventIcon(evt)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4
                          className={`font-mono-data text-xs sm:text-sm font-bold truncate ${
                            isSelected ? 'text-[#00daf3]' : 'text-[#F4F7FB]'
                          }`}
                        >
                          {evt.title}
                        </h4>
                        <span className="font-mono-data text-[10px] text-[#8A94A6] block truncate">
                          {evt.stepName || evt.time}
                        </span>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-xs text-[#8A94A6] line-clamp-3 leading-relaxed mt-2">
                      {evt.description}
                    </p>
                  </div>

                  {/* Footer Source & Confidence */}
                  <div className="mt-3 pt-2.5 border-t border-[#202B3C] flex items-center justify-between text-[10px] font-mono-data">
                    <span className="text-[#8A94A6] truncate max-w-[150px]">
                      {evt.source ? evt.source.split(' ')[0] : 'Telemetry'}
                    </span>
                    <span className="text-[#00daf3] font-semibold">
                      {evt.confidence ? `${evt.confidence}% Conf.` : evt.time}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Main Grid: Vertical Events List & Deep Event Detail Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Events Feed Column (Shown in vertical view or as responsive fallback) */}
        <div className={`space-y-3.5 ${viewMode === 'vertical' ? 'lg:col-span-7' : 'lg:col-span-6'}`}>
          <div className="text-xs font-mono-data text-[#8A94A6] uppercase tracking-wider mb-2 font-semibold">
            Forensic Events Feed ({filteredEvents.length})
          </div>

          {filteredEvents.map((evt) => {
            const isSelected = selectedEvent?.id === evt.id;
            const style = getStateStyle(evt.state);

            return (
              <div
                key={evt.id}
                onClick={() => setSelectedEventId(evt.id)}
                className={`p-4 rounded-lg border transition-all cursor-pointer relative group ${
                  isSelected
                    ? 'border-[#00daf3] bg-[#00daf3]/5'
                    : 'border-[#202B3C] bg-[#0B0F16]/80 hover:border-[#00daf3]/50 hover:bg-[#1a1b21]'
                }`}
              >
                <div className="flex items-start gap-3.5">
                  {/* Event Icon Badge */}
                  <div
                    className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 border ${
                      isSelected
                        ? 'border-[#00daf3] bg-[#00daf3]/10 text-[#00daf3]'
                        : 'border-[#202B3C] bg-[#1a1b21] text-[#8A94A6]'
                    }`}
                  >
                    {getEventIcon(evt)}
                  </div>

                  {/* Body Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
                      <div className="flex items-center gap-2">
                        <h4
                          className={`font-mono-data text-xs sm:text-sm font-semibold truncate ${
                            isSelected ? 'text-[#00daf3]' : 'text-[#F4F7FB]'
                          }`}
                        >
                          {evt.title}
                        </h4>
                        <span
                          className={`text-[9px] font-mono-data px-1.5 py-0.5 rounded border font-bold uppercase ${style.badge}`}
                        >
                          {evt.state || 'NORMAL'}
                        </span>
                      </div>
                      <span className="font-mono-data text-[10px] sm:text-xs text-[#8A94A6] shrink-0">
                        {evt.time}
                      </span>
                    </div>

                    <p className="text-xs text-[#8A94A6] mb-2.5 leading-relaxed">
                      {evt.description}
                    </p>

                    {/* Metadata Tags */}
                    <div className="flex flex-wrap gap-1.5">
                      {evt.tags.map((tag, idx) => (
                        <span
                          key={idx}
                          className="text-[10px] font-mono-data px-2 py-0.5 rounded border bg-[#1a1b21]"
                          style={{
                            borderColor: tag.color ? `${tag.color}60` : '#202B3C',
                            color: tag.color || '#e2e2e9',
                          }}
                        >
                          {tag.label}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Event Deep Forensics Details Panel */}
        <div
          className={`bg-[#0B0F16]/95 backdrop-blur-md rounded-lg hud-border p-5 lg:sticky lg:top-24 space-y-5 ${
            viewMode === 'vertical' ? 'lg:col-span-5' : 'lg:col-span-6'
          }`}
        >
          {/* Panel Header */}
          <div className="flex items-center justify-between border-b border-[#202B3C] pb-3">
            <div>
              <h3 className="font-headline text-base font-bold text-[#F4F7FB]">
                Forensic Telemetry Inspector
              </h3>
              <p className="text-[11px] font-mono-data text-[#8A94A6]">
                Decoded event telemetry and cryptographic proof
              </p>
            </div>
            <span className="font-mono-data text-xs px-2.5 py-1 rounded bg-[#00daf3]/10 text-[#00daf3] border border-[#00daf3]/30 font-semibold">
              {selectedEvent?.id}
            </span>
          </div>

          {selectedEvent ? (
            <>
              {/* Event Title, Time, and Source */}
              <div className="space-y-1 bg-[#1a1b21] p-3.5 rounded border border-[#202B3C]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#00daf3]" />
                    <h4 className="font-mono-data text-sm font-bold text-[#00daf3]">
                      {selectedEvent.title}
                    </h4>
                  </div>
                  <span
                    className={`text-[9px] font-mono-data px-2 py-0.5 rounded border font-bold uppercase ${
                      getStateStyle(selectedEvent.state).badge
                    }`}
                  >
                    {selectedEvent.state || 'NORMAL'}
                  </span>
                </div>
                <div className="font-mono-data text-xs text-[#8A94A6] pl-6 space-y-0.5">
                  <div>Timestamp: <span className="text-[#e2e2e9]">{selectedEvent.time}</span></div>
                  <div>Source Engine: <span className="text-[#c3f5ff]">{selectedEvent.source || 'Automated Mail Triage Engine'}</span></div>
                  {selectedEvent.evidenceRef && (
                    <div>Evidence Link: <span className="text-[#00E676] font-semibold">{selectedEvent.evidenceRef}</span></div>
                  )}
                  {selectedEvent.confidence && (
                    <div>Confidence Rating: <span className="text-[#00daf3] font-semibold">{selectedEvent.confidence}%</span></div>
                  )}
                </div>
              </div>

              {/* Analysis Metadata Breakdown */}
              <div className="space-y-2">
                <div className="text-[11px] font-mono-data text-[#8A94A6] uppercase tracking-wider">
                  Analysis Metadata &amp; Network Hashes
                </div>
                
                <div className="bg-[#1a1b21] p-3.5 rounded border border-[#202B3C] space-y-2 text-xs font-mono-data">
                  {selectedEvent.metadata?.originIp && (
                    <div className="flex justify-between items-center">
                      <span className="text-[#8A94A6]">Origin IP:</span>
                      <span className="text-[#F4F7FB] font-semibold">{selectedEvent.metadata.originIp}</span>
                    </div>
                  )}
                  {selectedEvent.metadata?.asn && (
                    <div className="flex justify-between items-center">
                      <span className="text-[#8A94A6]">Autonomous System:</span>
                      <span className="text-[#00daf3]">{selectedEvent.metadata.asn}</span>
                    </div>
                  )}
                  {selectedEvent.metadata?.claimedDomain && (
                    <div className="flex justify-between items-center">
                      <span className="text-[#8A94A6]">Claimed Domain:</span>
                      <span className="text-[#00daf3]">{selectedEvent.metadata.claimedDomain}</span>
                    </div>
                  )}
                  {selectedEvent.metadata?.spfResult && (
                    <div className="flex justify-between items-center">
                      <span className="text-[#8A94A6]">SPF Verification:</span>
                      <span className="text-[#00E676] font-semibold">{selectedEvent.metadata.spfResult}</span>
                    </div>
                  )}
                  {selectedEvent.metadata?.dkimResult && (
                    <div className="flex justify-between items-center">
                      <span className="text-[#8A94A6]">DKIM Signature:</span>
                      <span className="text-[#FF3D00] font-semibold">{selectedEvent.metadata.dkimResult}</span>
                    </div>
                  )}
                  {selectedEvent.metadata?.dmarcResult && (
                    <div className="flex justify-between items-center">
                      <span className="text-[#8A94A6]">DMARC Policy:</span>
                      <span className="text-[#FF3D00] font-semibold">{selectedEvent.metadata.dmarcResult}</span>
                    </div>
                  )}
                  {selectedEvent.metadata?.geo && (
                    <div className="flex justify-between items-center">
                      <span className="text-[#8A94A6]">Geolocation:</span>
                      <span className="text-[#e2e2e9]">{selectedEvent.metadata.geo}</span>
                    </div>
                  )}
                  {selectedEvent.metadata?.mlModel && (
                    <div className="flex justify-between items-center">
                      <span className="text-[#8A94A6]">AI Classifier:</span>
                      <span className="text-[#00daf3]">{selectedEvent.metadata.mlModel}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Raw Header Snippet Box */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono-data text-[#8A94A6] uppercase tracking-wider">
                    RAW HEADER &amp; LOG SNIPPET
                  </span>
                  <button
                    onClick={() => handleCopySnippet(selectedEvent.rawHeaderSnippet)}
                    className="text-[10px] font-mono-data text-[#00daf3] hover:underline flex items-center gap-1"
                  >
                    {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    {copied ? 'Copied' : 'Copy'}
                  </button>
                </div>

                <pre className="bg-[#090B10] p-3 rounded border border-[#202B3C] text-[10px] sm:text-[11px] font-mono-data text-[#c3f5ff] overflow-x-auto whitespace-pre-wrap break-all max-h-44 scrollbar-hide">
                  {selectedEvent.rawHeaderSnippet || 'No raw header snippet available for this event.'}
                </pre>
              </div>

              {/* Export Full Headers */}
              <button
                onClick={handleExportHeaders}
                className="w-full bg-[#1a1b21] hover:bg-[#00daf3] hover:text-[#090B10] text-[#00daf3] border border-[#00daf3] transition-all duration-200 py-3 rounded font-mono-data text-xs font-bold flex items-center justify-center gap-2 min-h-[44px] active:scale-[0.99]"
              >
                <Download className="w-4 h-4" />
                <span>EXPORT FORENSIC LOGS (.TXT)</span>
              </button>
            </>
          ) : (
            <div className="text-center py-8 text-[#8A94A6] text-xs font-mono-data">
              Select an event to view telemetry details
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
