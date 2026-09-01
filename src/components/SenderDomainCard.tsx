import React from 'react';
import { Globe, Clock, ShieldCheck, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import { InvestigationData } from '../types';

interface SenderDomainCardProps {
  data: InvestigationData;
}

export const SenderDomainCard: React.FC<SenderDomainCardProps> = ({ data }) => {
  const getAuthBadge = (label: string, status: string) => {
    let colorClass = 'text-[#00E676] bg-[#00E676]/10 border-[#00E676]/30';
    let icon = <CheckCircle className="w-3 h-3 text-[#00E676]" />;

    if (status === 'REJECT' || status === 'FAIL') {
      colorClass = 'text-[#FF3D00] bg-[#FF3D00]/10 border-[#FF3D00]/30';
      icon = <XCircle className="w-3 h-3 text-[#FF3D00]" />;
    } else if (
      status === 'SOFTFAIL' || status === 'QUARANTINE' || status === 'NONE' ||
      status === 'UNKNOWN' || status === 'NEUTRAL' ||
      // DKIM states that fall short of an actual verified pass — treated as
      // uncertainty (amber), not a clean pass (green) and not a hard
      // failure (red).
      status === 'SIGNATURE_PRESENT_UNVERIFIED' || status === 'SELECTOR_NOT_FOUND' || status === 'NOT_SIGNED'
    ) {
      colorClass = 'text-[#FFC107] bg-[#FFC107]/10 border-[#FFC107]/30';
      icon = <AlertTriangle className="w-3 h-3 text-[#FFC107]" />;
    }

    return (
      <div className="flex items-center gap-2 bg-[#090B10]/60 px-2.5 py-1.5 rounded border border-[#202B3C]/70">
        <span className="text-xs font-mono-data text-[#e2e2e9] font-medium">{label}:</span>
        <span
          className={`text-[10px] font-mono-data px-2 py-0.5 rounded border flex items-center gap-1 font-bold ${colorClass}`}
        >
          {icon}
          {status}
        </span>
      </div>
    );
  };

  return (
    <div className="bg-[#0B0F16]/90 backdrop-blur-md rounded-lg hud-border p-4 sm:p-6 w-full">
      {/* Card Header */}
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <h3 className="font-mono-data text-xs sm:text-sm font-semibold text-[#F4F7FB] uppercase tracking-wider">
          Sender &amp; Domain Intelligence
        </h3>
        <Globe className="w-4 h-4 text-[#8A94A6]" />
      </div>

      {/* Sender Email Display */}
      <div className="mb-4">
        <div className="font-mono-data text-sm sm:text-base text-[#00daf3] font-semibold break-all bg-[#1a1b21] px-3 py-2 rounded border border-[#202B3C]">
          {data.sender}
        </div>
      </div>

      {/* Domain Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4">
        {/* Domain Age */}
        <div className="bg-[#1a1b21] rounded p-3 border border-[#202B3C] flex flex-col justify-between">
          <div className="flex items-center gap-1.5 mb-2">
            <Clock className="w-3.5 h-3.5 text-[#8A94A6]" />
            <span className="text-[10px] sm:text-xs font-mono-data text-[#8A94A6] uppercase">
              DOMAIN AGE
            </span>
          </div>
          <div className="text-[10px] sm:text-xs font-mono-data text-[#00E676] mb-1 border border-[#00E676]/30 bg-[#00E676]/10 px-2 py-1 rounded inline-block font-semibold w-max">
            {data.domainAge}
          </div>
          <div className="text-[9px] sm:text-[10px] font-mono-data text-[#8A94A6]">
            Created: {data.domainCreated}
          </div>
        </div>

        {/* Reputation */}
        <div className="bg-[#1a1b21] rounded p-3 border border-[#202B3C] flex flex-col justify-between">
          <div className="flex items-center gap-1.5 mb-2">
            <ShieldCheck className="w-3.5 h-3.5 text-[#8A94A6]" />
            <span className="text-[10px] sm:text-xs font-mono-data text-[#8A94A6] uppercase">
              REPUTATION
            </span>
          </div>
          <div className="text-[10px] sm:text-xs font-mono-data text-[#00E676] mb-1 border border-[#00E676]/30 bg-[#00E676]/10 px-2 py-1 rounded inline-block font-semibold w-max">
            {data.reputation}
          </div>
          <div className="text-[9px] sm:text-[10px] font-mono-data text-[#8A94A6]">
            Trust Score: {data.trustScore}/100
          </div>
        </div>
      </div>

      {/* Authentication Status */}
      <div className="bg-[#1a1b21] rounded p-3 border border-[#202B3C]">
        <div className="text-[10px] sm:text-xs font-mono-data text-[#8A94A6] mb-2.5 uppercase font-medium">
          AUTHENTICATION STATUS
        </div>
        <div className="flex flex-wrap gap-2.5">
          {getAuthBadge('SPF', data.authStatus.spf)}
          {getAuthBadge('DKIM', data.authStatus.dkim)}
          {getAuthBadge('DMARC', data.authStatus.dmarc)}
        </div>
      </div>
    </div>
  );
};
