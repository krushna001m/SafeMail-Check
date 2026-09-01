import React from 'react';
import { 
  ShieldAlert, 
  Search, 
  Link, 
  Server, 
  FileText, 
  Globe, 
  Paperclip, 
  AlertTriangle 
} from 'lucide-react';
import { InvestigationData } from '../types';

interface ForensicSummaryBannerProps {
  data: InvestigationData;
  onNavigateTab?: (tab: string) => void;
}

export const ForensicSummaryBanner: React.FC<ForensicSummaryBannerProps> = ({ data, onNavigateTab }) => {
  const summaryItems = [
    {
      label: 'THREAT LEVEL',
      value: data.verdict,
      color: data.verdict === 'MALICIOUS' ? 'text-[#FF3D00]' : 'text-[#00E676]',
      bg: data.verdict === 'MALICIOUS' ? 'border-[#FF3D00]/30 bg-[#FF3D00]/5' : 'border-[#00E676]/30 bg-[#00E676]/5',
      icon: <ShieldAlert className="w-3.5 h-3.5" />
    },
    {
      label: 'INDICATORS',
      value: `${data.indicators.length} Found`,
      color: data.indicators.length > 0 ? 'text-[#FF3D00]' : 'text-[#00E676]',
      bg: 'border-[#202B3C] bg-[#1a1b21]',
      icon: <AlertTriangle className="w-3.5 h-3.5 text-[#FFC107]" />
    },
    {
      label: 'EVIDENCE ITEMS',
      value: `${data.evidenceItems?.length || 5} Sealed`,
      color: 'text-[#00daf3]',
      bg: 'border-[#202B3C] bg-[#1a1b21]',
      icon: <FileText className="w-3.5 h-3.5 text-[#00daf3]" />
    },
    {
      label: 'DOMAINS TRACED',
      value: `${data.stats.domainCount || 3} Entities`,
      color: 'text-[#F4F7FB]',
      bg: 'border-[#202B3C] bg-[#1a1b21]',
      icon: <Globe className="w-3.5 h-3.5 text-[#8A94A6]" />
    },
    {
      label: 'IPS RESOLVED',
      value: `${data.stats.ipCount || 2} Hosts`,
      color: 'text-[#F4F7FB]',
      bg: 'border-[#202B3C] bg-[#1a1b21]',
      icon: <Server className="w-3.5 h-3.5 text-[#8A94A6]" />
    },
    {
      label: 'DETONATED URLS',
      value: `${data.urls.length} Links`,
      color: data.urls.some(u => u.status === 'MALICIOUS') ? 'text-[#FF3D00]' : 'text-[#00E676]',
      bg: 'border-[#202B3C] bg-[#1a1b21]',
      icon: <Link className="w-3.5 h-3.5 text-[#8A94A6]" />
    },
    {
      label: 'ATTACHMENTS',
      value: `${data.stats.attachmentsCount} Extracted`,
      color: 'text-[#8A94A6]',
      bg: 'border-[#202B3C] bg-[#1a1b21]',
      icon: <Paperclip className="w-3.5 h-3.5 text-[#8A94A6]" />
    }
  ];

  return (
    <div className="w-full bg-[#0B0F16]/90 backdrop-blur-md rounded-lg hud-border p-3 sm:p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] sm:text-xs font-mono-data text-[#8A94A6] uppercase tracking-wider font-semibold">
          FORENSIC INVESTIGATION SUMMARY
        </span>
        <span className="text-[10px] font-mono-data text-[#00daf3]">
          Subject: <span className="text-[#e2e2e9] font-medium">{data.subject}</span>
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 font-mono-data">
        {summaryItems.map((item, idx) => (
          <div
            key={idx}
            className={`p-2.5 rounded border ${item.bg} flex flex-col justify-between transition-colors`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-[9px] text-[#8A94A6] uppercase truncate">{item.label}</span>
              {item.icon}
            </div>
            <span className={`text-xs font-bold truncate ${item.color}`}>
              {item.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
