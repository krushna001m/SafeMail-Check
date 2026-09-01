import React, { useState } from 'react';
import { 
  ShieldAlert, 
  ShieldCheck, 
  Lock, 
  Clock, 
  User, 
  FileDown, 
  CheckCircle2, 
  Copy, 
  Check, 
  RefreshCw,
  ChevronDown
} from 'lucide-react';
import { InvestigationData } from '../types';
import { RAW_SAMPLE_VECTORS } from '../utils/rawSampleHeaders';

interface ForensicCaseHeaderProps {
  data: InvestigationData;
  onExportReport: () => void;
  isExporting: boolean;
  onReanalyze: () => void;
  onLoadRawVector: (rawVectorKey: string) => void;
  isScanning: boolean;
}

export const ForensicCaseHeader: React.FC<ForensicCaseHeaderProps> = ({
  data,
  onExportReport,
  isExporting,
  onReanalyze,
  onLoadRawVector,
  isScanning,
}) => {
  const [copiedId, setCopiedId] = useState(false);
  const [vectorMenuOpen, setVectorMenuOpen] = useState(false);

  const isMalicious = data.verdict === 'MALICIOUS';
  const isClean = data.verdict === 'CLEAN' || data.verdict === 'SAFE';

  const handleCopyId = () => {
    navigator.clipboard.writeText(data.id);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  return (
    <div className="bg-[#0B0F16]/95 backdrop-blur-md rounded-lg hud-border p-4 sm:p-6 w-full space-y-4">
      {/* Top Banner Row: Case Identity, TLP, and Actions */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[#202B3C] pb-4">
        {/* Left: Case ID & Meta */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="font-headline text-lg sm:text-2xl font-bold text-[#F4F7FB] tracking-tight">
              {data.id}
            </span>
            <button
              onClick={handleCopyId}
              title="Copy Case ID"
              className="text-[#8A94A6] hover:text-[#00daf3] p-1.5 rounded hover:bg-[#1a1b21] transition-colors"
            >
              {copiedId ? <Check className="w-4 h-4 text-[#00E676]" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Status Badge */}
            <span className="px-2.5 py-0.5 rounded text-[10px] sm:text-xs font-mono-data font-bold bg-[#00daf3]/10 text-[#00daf3] border border-[#00daf3]/30 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00daf3] animate-pulse" />
              ACTIVE INVESTIGATION
            </span>

            {/* TLP Classification */}
            <span className="px-2.5 py-0.5 rounded text-[10px] sm:text-xs font-mono-data font-bold bg-[#FFC107]/10 text-[#FFC107] border border-[#FFC107]/30">
              TLP:AMBER+STRICT
            </span>

            {/* Compliance Badge */}
            <span className="px-2.5 py-0.5 rounded text-[10px] sm:text-xs font-mono-data font-semibold bg-[#1a1b21] text-[#8A94A6] border border-[#202B3C]">
              NIST SP 800-86
            </span>
          </div>
        </div>

        {/* Right: Quick Action Controls */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Vector Selector Dropdown */}
          <div className="relative">
            <button
              onClick={() => setVectorMenuOpen(!vectorMenuOpen)}
              className="bg-[#1a1b21] hover:bg-[#202B3C] text-[#e2e2e9] border border-[#202B3C] px-3 py-2 rounded font-mono-data text-xs flex items-center gap-1.5 transition-colors min-h-[38px]"
            >
              <span>Load RFC Vector</span>
              <ChevronDown className="w-3.5 h-3.5 text-[#8A94A6]" />
            </button>

            {vectorMenuOpen && (
              <div className="absolute right-0 mt-1 w-72 bg-[#090B10] border border-[#00daf3]/50 rounded-lg shadow-2xl z-50 p-1 font-mono-data text-xs animate-fade-in-up">
                {Object.entries(RAW_SAMPLE_VECTORS).map(([k, v]) => (
                  <button
                    key={k}
                    onClick={() => {
                      onLoadRawVector(k);
                      setVectorMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 rounded hover:bg-[#1a1b21] text-[#e2e2e9] flex flex-col gap-0.5"
                  >
                    <span className="font-bold text-[#F4F7FB]">{v.name}</span>
                    <span className="text-[10px] text-[#8A94A6] line-clamp-1">{v.description}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Re-analyze Button */}
          <button
            onClick={onReanalyze}
            disabled={isScanning}
            className="bg-[#1a1b21] hover:bg-[#00daf3]/10 text-[#00daf3] border border-[#00daf3]/40 px-3 py-2 rounded font-mono-data text-xs font-semibold flex items-center gap-1.5 transition-all min-h-[38px] active:scale-95"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin' : ''}`} />
            <span>{isScanning ? 'Detonating...' : 'Re-Detonate'}</span>
          </button>

          {/* Export Report PDF */}
          <button
            onClick={onExportReport}
            disabled={isExporting}
            className="bg-[#00daf3] text-[#090B10] px-4 py-2 rounded font-mono-data text-xs font-bold hover:brightness-110 active:scale-95 transition-all flex items-center gap-1.5 min-h-[38px]"
          >
            <FileDown className={`w-4 h-4 ${isExporting ? 'animate-bounce' : ''}`} />
            <span>{isExporting ? 'Generating...' : 'Export Case Report'}</span>
          </button>
        </div>
      </div>

      {/* Core Vitals Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 font-mono-data text-xs">
        {/* Threat Verdict */}
        <div className="bg-[#1a1b21] p-3 rounded border border-[#202B3C] flex flex-col justify-between">
          <span className="text-[10px] text-[#8A94A6] uppercase tracking-wider block mb-1">
            THREAT VERDICT
          </span>
          <div className="flex items-center gap-1.5">
            {isMalicious ? (
              <ShieldAlert className="w-4 h-4 text-[#FF3D00] shrink-0" />
            ) : (
              <ShieldCheck className="w-4 h-4 text-[#00E676] shrink-0" />
            )}
            <span
              className={`font-bold text-sm truncate ${
                isMalicious ? 'text-[#FF3D00]' : isClean ? 'text-[#00E676]' : 'text-[#FFC107]'
              }`}
            >
              {data.verdict}
            </span>
          </div>
        </div>

        {/* Risk Score */}
        <div className="bg-[#1a1b21] p-3 rounded border border-[#202B3C] flex flex-col justify-between">
          <span className="text-[10px] text-[#8A94A6] uppercase tracking-wider block mb-1">
            RISK SCORE
          </span>
          <div className="flex items-baseline gap-1">
            <span
              className={`font-bold text-lg leading-none ${
                data.riskScore > 70
                  ? 'text-[#FF3D00]'
                  : data.riskScore > 30
                  ? 'text-[#FFC107]'
                  : 'text-[#00E676]'
              }`}
            >
              {data.riskScore}
            </span>
            <span className="text-[10px] text-[#8A94A6]">/ 100</span>
          </div>
        </div>

        {/* Confidence */}
        <div className="bg-[#1a1b21] p-3 rounded border border-[#202B3C] flex flex-col justify-between">
          <span className="text-[10px] text-[#8A94A6] uppercase tracking-wider block mb-1">
            CONFIDENCE
          </span>
          <div className="flex items-center gap-1">
            <span className="font-bold text-sm text-[#F4F7FB]">
              {data.confidencePercentage}%
            </span>
            <span className="text-[10px] text-[#00daf3]">({data.confidence})</span>
          </div>
        </div>

        {/* Evidence Status */}
        <div className="bg-[#1a1b21] p-3 rounded border border-[#202B3C] flex flex-col justify-between">
          <span className="text-[10px] text-[#8A94A6] uppercase tracking-wider block mb-1">
            EVIDENCE INTEGRITY
          </span>
          <div className="flex items-center gap-1.5 text-[#00E676] font-semibold text-xs truncate">
            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
            <span>VERIFIED</span>
          </div>
        </div>

        {/* Investigation Time */}
        <div className="bg-[#1a1b21] p-3 rounded border border-[#202B3C] flex flex-col justify-between">
          <span className="text-[10px] text-[#8A94A6] uppercase tracking-wider block mb-1">
            INGEST TIME
          </span>
          <div className="flex items-center gap-1 text-[#e2e2e9] text-[11px] truncate">
            <Clock className="w-3.5 h-3.5 text-[#8A94A6] shrink-0" />
            <span className="truncate">{data.timestamp}</span>
          </div>
        </div>

        {/* Assigned Analyst */}
        <div className="bg-[#1a1b21] p-3 rounded border border-[#202B3C] flex flex-col justify-between">
          <span className="text-[10px] text-[#8A94A6] uppercase tracking-wider block mb-1">
            ASSIGNED SOC
          </span>
          <div className="flex items-center gap-1 text-[#00daf3] text-[11px] font-semibold truncate">
            <User className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">SOC Analyst #409</span>
          </div>
        </div>
      </div>
    </div>
  );
};
