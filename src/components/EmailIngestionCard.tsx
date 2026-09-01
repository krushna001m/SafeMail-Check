import React, { useState, useRef } from 'react';
import { Download, FileText, UploadCloud, RefreshCw, Lock, Sparkles, Check, Clipboard, FileDown } from 'lucide-react';
import { ThreeShield3D } from './ThreeShield3D';
import { ThreatVerdict } from '../types';
import { RAW_SAMPLE_VECTORS } from '../utils/rawSampleHeaders';

interface EmailIngestionCardProps {
  sourceFileName: string;
  isScanning: boolean;
  verdict: ThreatVerdict;
  onReanalyze: () => void;
  onLoadRawVector: (vectorKey: string) => void;
  onPasteHeaders: (headers: string, fileName?: string) => void;
  onExportReport: () => void;
  isExporting?: boolean;
}

export const EmailIngestionCard: React.FC<EmailIngestionCardProps> = ({
  sourceFileName,
  isScanning,
  verdict,
  onReanalyze,
  onLoadRawVector,
  onPasteHeaders,
  onExportReport,
  isExporting = false,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [showPasteModal, setShowPasteModal] = useState(false);
  const [pastedContent, setPastedContent] = useState('');
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        if (text) {
          onPasteHeaders(text, file.name);
        }
      };
      reader.readAsText(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        if (text) {
          onPasteHeaders(text, file.name);
        }
      };
      reader.readAsText(file);
    }
  };

  const handlePasteSubmit = () => {
    if (pastedContent.trim()) {
      onPasteHeaders(pastedContent, 'pasted_rfc_headers.eml');
      setShowPasteModal(false);
      setPastedContent('');
    }
  };

  return (
    <div className="bg-[#0B0F16]/90 backdrop-blur-md rounded-lg hud-border p-4 sm:p-6 flex flex-col w-full">
      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".eml,.msg,.txt"
        className="hidden"
      />

      {/* Card Header */}
      <div className="flex items-center justify-between mb-4 sm:mb-5">
        <div className="flex items-center gap-2">
          <h3 className="font-mono-data text-xs sm:text-sm font-semibold text-[#F4F7FB] uppercase tracking-wider">
            Artifact Ingestion
          </h3>
          <span className="text-[10px] font-mono-data px-2 py-0.5 rounded bg-[#1e1f25] text-[#8A94A6] border border-[#202B3C] truncate max-w-[150px] sm:max-w-[200px]">
            {sourceFileName}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={onExportReport}
            disabled={isExporting}
            className="text-[#8A94A6] hover:text-[#00daf3] p-1.5 rounded hover:bg-[#1a1b21] transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center border border-transparent hover:border-[#202B3C]"
            title="Export Investigation PDF Report"
            aria-label="Export Investigation PDF Report"
          >
            <FileDown className={`w-4 h-4 ${isExporting ? 'animate-bounce text-[#00daf3]' : ''}`} />
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="text-[#8A94A6] hover:text-[#00daf3] p-1.5 rounded hover:bg-[#1a1b21] transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center"
            title="Upload real .eml file"
            aria-label="Upload real .eml file"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Dropzone with 3D Hero */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`dashed-dropzone rounded-lg flex flex-col items-center justify-center p-3 sm:p-5 text-center cursor-pointer mb-4 sm:mb-5 group relative overflow-hidden transition-all duration-200 ${
          isDragOver
            ? 'border-[#00daf3] bg-[#00daf3]/10 scale-[1.01]'
            : 'border-[#202B3C] hover:border-[#00daf3]'
        } min-h-[220px] sm:min-h-[280px]`}
      >
        {/* Glow backdrop on hover */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#00daf3]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

        {/* 3D Shield Hero Container */}
        <div className="w-28 h-28 sm:w-44 sm:h-44 mb-2 relative z-10 pointer-events-none flex items-center justify-center">
          <ThreeShield3D isScanning={isScanning} verdict={verdict} className="w-full h-full" />
        </div>

        {/* Instructions */}
        <div className="relative z-10">
          <p className="font-headline font-semibold text-sm sm:text-base text-[#F4F7FB] mb-1">
            Drop real .eml or raw headers here
          </p>
          <p className="text-[#8A94A6] text-[11px] sm:text-xs max-w-[280px] mx-auto mb-3">
            Real RFC 5322 parser extracts relay hops, cryptographic SPF/DKIM/DMARC, URLs, and calculates NIST SP 800-86 hashes.
          </p>
        </div>

        {/* Ingest Action Buttons inside dropzone */}
        <div
          className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 relative z-20"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="bg-[#00daf3] text-[#090B10] px-4 py-2 min-h-[44px] rounded font-mono-data text-xs font-bold hover:brightness-110 active:scale-95 transition-all flex items-center gap-1.5"
          >
            <UploadCloud className="w-4 h-4" />
            <span>Upload .eml file</span>
          </button>

          <button
            type="button"
            onClick={() => setShowPasteModal(true)}
            className="bg-[#1a1b21] border border-[#202B3C] text-[#e2e2e9] hover:border-[#00daf3] hover:text-[#00daf3] px-3.5 py-2 min-h-[44px] rounded font-mono-data text-xs transition-all flex items-center gap-1.5"
          >
            <Clipboard className="w-3.5 h-3.5" />
            <span>Paste raw RFC headers</span>
          </button>
        </div>
      </div>

      {/* Action Row & Sample Switcher */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row gap-2">
          <button
            onClick={onReanalyze}
            disabled={isScanning}
            className={`w-full sm:w-1/2 bg-[#00e5ff] text-[#001f24] py-2.5 px-3.5 rounded font-mono-data text-xs font-bold transition-all min-h-[44px] flex items-center justify-center gap-2 hover:brightness-110 active:scale-[0.99] ${
              isScanning ? 'opacity-70 cursor-not-allowed' : ''
            }`}
          >
            <RefreshCw className={`w-4 h-4 ${isScanning ? 'animate-spin' : ''}`} />
            <span>{isScanning ? 'Analyzing...' : 'Re-Detonate'}</span>
          </button>

          <button
            onClick={onExportReport}
            disabled={isExporting}
            className="w-full sm:w-1/2 bg-[#1a1b21] border border-[#00daf3]/50 hover:border-[#00daf3] hover:bg-[#00daf3]/10 text-[#00daf3] py-2.5 px-3.5 rounded font-mono-data text-xs font-bold transition-all min-h-[44px] flex items-center justify-center gap-2 active:scale-[0.99]"
            title="Generate executive PDF forensic report"
          >
            <FileDown className={`w-4 h-4 ${isExporting ? 'animate-bounce' : ''}`} />
            <span>{isExporting ? 'Generating PDF...' : 'Export Report'}</span>
          </button>
        </div>

        {/* Real RFC Test Vectors */}
        <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded bg-[#1a1b21] border border-[#202B3C]">
          <div className="flex items-center gap-1.5 text-[11px] font-mono-data text-[#8A94A6]">
            <Sparkles className="w-3.5 h-3.5 text-[#00daf3]" />
            <span>Test Vectors:</span>
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              onClick={() => onLoadRawVector('spearphishing_credential_harvest')}
              className="text-[10px] font-mono-data px-2 py-1 rounded bg-[#FF3D00]/15 text-[#FF3D00] border border-[#FF3D00]/30 hover:bg-[#FF3D00]/25 transition-colors font-medium"
              title="Phishing vector with DMARC fail, urgency keywords, and redirect URLs"
            >
              Phishing RFC
            </button>
            <button
              onClick={() => onLoadRawVector('clean_verified_newsletter')}
              className="text-[10px] font-mono-data px-2 py-1 rounded bg-[#00E676]/15 text-[#00E676] border border-[#00E676]/30 hover:bg-[#00E676]/25 transition-colors font-medium"
              title="Clean email with verified SPF, DKIM, and DMARC alignment"
            >
              Clean RFC
            </button>
            <button
              onClick={() => onLoadRawVector('bec_wire_fraud')}
              className="text-[10px] font-mono-data px-2 py-1 rounded bg-[#FFC107]/15 text-[#FFC107] border border-[#FFC107]/30 hover:bg-[#FFC107]/25 transition-colors font-medium"
              title="CEO impersonation with urgent wire transfer request"
            >
              BEC Fraud RFC
            </button>
            <button
              onClick={() => onLoadRawVector('simple_safe_meeting')}
              className="text-[10px] font-mono-data px-2 py-1 rounded bg-[#00daf3]/15 text-[#00daf3] border border-[#00daf3]/30 hover:bg-[#00daf3]/25 transition-colors font-medium"
              title="Simple benign calendar invite"
            >
              Safe Meeting
            </button>
            <button
              onClick={() => onLoadRawVector('multiple_urls_harvesting')}
              className="text-[10px] font-mono-data px-2 py-1 rounded bg-[#FF9100]/15 text-[#FF9100] border border-[#FF9100]/30 hover:bg-[#FF9100]/25 transition-colors font-medium"
              title="Multiple URLs with IP and shortener vectors"
            >
              Multi-URL
            </button>
            <button
              onClick={() => onLoadRawVector('xss_and_injection_vector')}
              className="text-[10px] font-mono-data px-2 py-1 rounded bg-[#E040FB]/15 text-[#E040FB] border border-[#E040FB]/30 hover:bg-[#E040FB]/25 transition-colors font-medium"
              title="Sanitization and security probe payloads"
            >
              Security Probe
            </button>
          </div>
        </div>

        {/* SHA-256 Storage verification */}
        <div className="flex items-center justify-between text-[10px] sm:text-[11px] font-mono-data text-[#8A94A6] pt-1">
          <div className="flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-[#00daf3]" />
            <span>SHA-256 live forensic computation</span>
          </div>
          <span className="flex items-center gap-1 text-[#00E676]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00E676] animate-pulse" />
            Active
          </span>
        </div>
      </div>

      {/* Paste Raw Headers Modal */}
      {showPasteModal && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0B0F16] border border-[#00daf3] rounded-lg w-full max-w-xl p-5 shadow-2xl animate-fade-in-up">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-headline font-semibold text-base text-[#F4F7FB] flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#00daf3]" />
                Paste Raw RFC 5322 Email or Headers
              </h4>
              <button
                onClick={() => setShowPasteModal(false)}
                className="text-[#8A94A6] hover:text-[#e2e2e9] text-sm"
              >
                ✕
              </button>
            </div>
            <p className="text-xs text-[#8A94A6] mb-3 font-mono-data">
              Include raw MIME headers (From, Received, Authentication-Results, DKIM-Signature) and optional body.
            </p>
            <textarea
              value={pastedContent}
              onChange={(e) => setPastedContent(e.target.value)}
              placeholder="From: ceo@company.com&#10;To: accounting@company.com&#10;Subject: Urgent wire transfer&#10;Authentication-Results: dkim=fail spf=softfail..."
              rows={8}
              className="w-full bg-[#090B10] border border-[#202B3C] focus:border-[#00daf3] rounded p-3 text-xs font-mono-data text-[#c3f5ff] placeholder-[#8A94A6]/50 focus:outline-none focus:ring-1 focus:ring-[#00daf3]"
            />
            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={() => setShowPasteModal(false)}
                className="px-3 py-2 rounded text-xs font-mono-data text-[#8A94A6] hover:text-[#e2e2e9]"
              >
                Cancel
              </button>
              <button
                onClick={handlePasteSubmit}
                className="bg-[#00daf3] text-[#090B10] px-4 py-2 rounded font-mono-data text-xs font-bold hover:brightness-110 min-h-[40px] flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                Run Real Forensics
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
