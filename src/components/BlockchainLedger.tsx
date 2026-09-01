import React, { useState } from 'react';
import { Link2, ShieldCheck, ShieldAlert, Copy, Check } from 'lucide-react';
import { EvidenceItem } from '../types';

interface BlockchainLedgerProps {
  items: EvidenceItem[];
  caseId?: string;
}

function shortHash(hash: string, len: number = 10): string {
  if (!hash) return '—';
  return `${hash.slice(0, len)}…${hash.slice(-4)}`;
}

// Block numbers are display-only sequencing over the real evidence chain —
// not a claim of a specific public ledger height.
const BLOCK_BASE = 10240;

export const BlockchainLedger: React.FC<BlockchainLedgerProps> = ({ items, caseId }) => {
  const [copied, setCopied] = useState<string | null>(null);
  const [selectedIdx, setSelectedIdx] = useState(0);

  const handleCopy = (hash: string) => {
    navigator.clipboard.writeText(hash);
    setCopied(hash);
    setTimeout(() => setCopied(null), 1500);
  };

  if (!items || items.length === 0) {
    return (
      <div className="bg-[#0B0F16]/90 rounded-lg hud-border p-4 sm:p-6">
        <h3 className="font-headline text-base font-bold text-[#F4F7FB] mb-1">
          Blockchain Evidence Verification
        </h3>
        <p className="text-xs text-[#8A94A6] font-mono-data">
          No evidence items hashed yet for this case.
        </p>
      </div>
    );
  }

  const selected = items[selectedIdx] || items[0];
  const verifiedCount = items.filter((i) => i.integrityStatus === 'VERIFIED').length;

  return (
    <div className="bg-[#0B0F16]/90 rounded-lg hud-border p-4 sm:p-6 space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h3 className="font-headline text-base font-bold text-[#F4F7FB]">
            Blockchain Evidence Verification
          </h3>
          <p className="text-xs text-[#8A94A6] font-mono-data mt-0.5">
            SHA-256 hash chain for {caseId || 'this case'} · each block's hash depends on the one before it
          </p>
        </div>
        <span className="text-[11px] font-mono-data text-[#00E676]">
          {verifiedCount}/{items.length} blocks verified
        </span>
      </div>

      {/* Chain of blocks */}
      <div className="flex items-stretch gap-2 overflow-x-auto scrollbar-hide pb-2">
        {items.map((item, idx) => {
          const isVerified = item.integrityStatus === 'VERIFIED';
          const isSelected = idx === selectedIdx;
          return (
            <React.Fragment key={item.id}>
              <button
                onClick={() => setSelectedIdx(idx)}
                className={`shrink-0 w-[168px] text-left p-3 rounded border transition-colors font-mono-data ${
                  isSelected
                    ? 'border-[#00daf3] bg-[#00daf3]/5'
                    : 'border-[#202B3C] bg-[#1a1b21] hover:border-[#00daf3]/50'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] text-[#8A94A6] uppercase">
                    Block {BLOCK_BASE + idx}
                  </span>
                  {isVerified ? (
                    <ShieldCheck className="w-3.5 h-3.5 text-[#00E676]" />
                  ) : (
                    <ShieldAlert className="w-3.5 h-3.5 text-[#FF3D00]" />
                  )}
                </div>
                <div className="text-[11px] text-[#F4F7FB] truncate">{item.title}</div>
                <div className="text-[10px] text-[#c3f5ff] mt-1">{shortHash(item.sha256, 8)}</div>
                <div className="text-[9px] text-[#8A94A6] mt-1">{item.collectedAt}</div>
              </button>
              {idx < items.length - 1 && (
                <div className="flex items-center justify-center shrink-0 text-[#202B3C]">
                  <Link2 className="w-4 h-4" />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Selected block detail */}
      <div className="bg-[#1a1b21] rounded border border-[#202B3C] p-3 sm:p-4 space-y-2 font-mono-data text-xs">
        <div className="flex items-center justify-between">
          <span className="text-[#8A94A6] uppercase text-[10px]">
            Block {BLOCK_BASE + selectedIdx} — {selected.title}
          </span>
          <span
            className={`text-[10px] px-2 py-0.5 rounded border font-bold ${
              selected.integrityStatus === 'VERIFIED'
                ? 'bg-[#00E676]/10 text-[#00E676] border-[#00E676]/30'
                : 'bg-[#FF3D00]/10 text-[#FF3D00] border-[#FF3D00]/30'
            }`}
          >
            {selected.integrityStatus}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <div>
            <div className="text-[#8A94A6] text-[10px] uppercase mb-0.5">Current Hash (SHA-256)</div>
            <div className="flex items-center gap-1.5">
              <span className="text-[#c3f5ff] break-all">{selected.sha256}</span>
              <button
                onClick={() => handleCopy(selected.sha256)}
                className="text-[#8A94A6] hover:text-[#00daf3] shrink-0"
                aria-label="Copy hash"
              >
                {copied === selected.sha256 ? (
                  <Check className="w-3.5 h-3.5 text-[#00E676]" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
          </div>
          <div>
            <div className="text-[#8A94A6] text-[10px] uppercase mb-0.5">Previous Block Hash</div>
            <span className="text-[#8A94A6] break-all">{selected.previousHash}</span>
          </div>
        </div>

        <p className="text-[#8A94A6] text-[11px] pt-1 border-t border-[#202B3C]/60">
          Timestamp: {selected.collectedAt} · Source: {selected.source} · Confidence: {selected.confidence}%
        </p>
      </div>
    </div>
  );
};
