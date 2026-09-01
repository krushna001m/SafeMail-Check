import React from 'react';
import { ShieldAlert, ShieldCheck, Globe, Database, Network, Clock, ExternalLink, RefreshCw } from 'lucide-react';
import { ThreatIntelProvider } from '../types';

interface ThreatIntelPanelProps {
  providers: ThreatIntelProvider[];
}

export const ThreatIntelPanel: React.FC<ThreatIntelPanelProps> = ({ providers }) => {
  const getStatusBadge = (status: ThreatIntelProvider['status']) => {
    switch (status) {
      case 'MALICIOUS':
        return 'bg-[#FF3D00]/15 text-[#ffb4ab] border-[#FF3D00]/40';
      case 'SUSPICIOUS':
        return 'bg-[#FFC107]/15 text-[#ffeac0] border-[#FFC107]/40';
      case 'CLEAN':
        return 'bg-[#00E676]/15 text-[#00E676] border-[#00E676]/40';
      case 'NOT AVAILABLE':
      default:
        return 'bg-[#8A94A6]/15 text-[#8A94A6] border-[#8A94A6]/40';
    }
  };

  const connectedCount = providers.filter((p) => p.connectionStatus === 'CONNECTED').length;

  return (
    <div className="bg-[#0B0F16]/95 backdrop-blur-md rounded-lg hud-border p-5 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#202B3C] pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded bg-[#00daf3]/10 border border-[#00daf3]/30 flex items-center justify-center text-[#00daf3]">
            <Globe className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-headline text-base font-bold text-[#F4F7FB]">
              Threat Intelligence Providers
            </h3>
            <p className="text-[10px] font-mono-data text-[#8A94A6]">
              {connectedCount > 0
                ? `${connectedCount} of ${providers.length} provider(s) returned live results`
                : 'No providers currently configured with an API key'}
            </p>
          </div>
        </div>

        <span className="text-[10px] font-mono-data px-2.5 py-0.5 rounded bg-[#00daf3]/10 text-[#00daf3] border border-[#00daf3]/30 font-bold">
          {connectedCount} / {providers.length} CONNECTED
        </span>
      </div>

      {/* Provider Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 font-mono-data">
        {providers.map((p) => (
          <div
            key={p.id}
            className="bg-[#1a1b21] p-3.5 rounded border border-[#202B3C] hover:border-[#00daf3]/40 transition-colors flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-[#F4F7FB] truncate">
                  {p.name}
                </span>
                <span className={`text-[9px] px-2 py-0.5 rounded border font-bold uppercase ${getStatusBadge(p.status)}`}>
                  {p.status}
                </span>
              </div>

              <span className="text-[10px] text-[#00daf3] block mb-1">
                {p.category}
              </span>

              <p className="text-[11px] text-[#8A94A6] leading-relaxed mb-2 line-clamp-2">
                {p.details}
              </p>
            </div>

            <div className="pt-2 border-t border-[#202B3C] flex items-center justify-between text-[10px]">
              <span className="text-[#F4F7FB] font-semibold">
                {p.connectionStatus === 'NOT_CONFIGURED'
                  ? 'Integration not configured'
                  : p.connectionStatus === 'UNAVAILABLE'
                  ? 'Provider unreachable'
                  : p.connectionStatus === 'ERROR'
                  ? 'Provider returned an error'
                  : p.score || 'Connected'}
              </span>
              <span className="text-[#8A94A6] flex items-center gap-1">
                <Clock className="w-3 h-3" /> {p.connectionStatus === 'CONNECTED' ? p.lastSync : 'N/A'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
