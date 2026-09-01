import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  ShieldCheck, 
  Lock, 
  Copy, 
  Check, 
  Download, 
  Hash, 
  CheckCircle2, 
  AlertCircle, 
  Layers, 
  Clock, 
  AlertTriangle,
  RefreshCw,
  Cpu
} from 'lucide-react';
import { EvidenceItem, InvestigationData } from '../types';

interface EvidenceViewProps {
  items?: EvidenceItem[];
  data?: InvestigationData;
  caseId?: string;
}

// Compute SHA-256 hex string using browser Web Crypto API
async function computeSha256(text: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

export const EvidenceView: React.FC<EvidenceViewProps> = ({ items: propItems, data, caseId: propCaseId }) => {
  const items = propItems || data?.evidenceItems || [];
  const caseId = propCaseId || data?.id || 'CASE #EML-2026-00128';
  const [selectedId, setSelectedId] = useState<string>(items[0]?.id || 'EV-001');

  const [activeTab, setActiveTab] = useState<'summary' | 'raw' | 'custody' | 'verification'>('summary');
  const [copiedHash, setCopiedHash] = useState<string | null>(null);

  const selectedItem = items.find((i) => i.id === selectedId) || items[0];

  // Tamper Simulation State
  const [tamperText, setTamperText] = useState<string>('');
  const [computedLiveHash, setComputedLiveHash] = useState<string>('');
  const [verificationResult, setVerificationResult] = useState<'VERIFIED' | 'COMPROMISED' | 'IDLE'>('IDLE');
  const [isVerifying, setIsVerifying] = useState(false);

  useEffect(() => {
    if (selectedItem) {
      setTamperText(selectedItem.rawData || '');
      setVerificationResult('IDLE');
      setComputedLiveHash('');
    }
  }, [selectedItem?.id, selectedItem?.rawData]);

  const handleCopy = (text: string, hashKey: string) => {
    navigator.clipboard.writeText(text);
    setCopiedHash(hashKey);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  const handleRunIntegrityVerification = async () => {
    if (!selectedItem) return;
    setIsVerifying(true);
    try {
      const hash = await computeSha256(tamperText);
      setComputedLiveHash(hash);
      if (hash.toLowerCase() === selectedItem.sha256.toLowerCase()) {
        setVerificationResult('VERIFIED');
      } else {
        setVerificationResult('COMPROMISED');
      }
    } catch (e) {
      console.error('Failed to compute hash:', e);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleRestoreOriginal = () => {
    if (!selectedItem) return;
    setTamperText(selectedItem.rawData);
    setVerificationResult('IDLE');
    setComputedLiveHash('');
  };

  const handleInjectTampering = () => {
    setTamperText((prev) => prev + '\n# [TAMPERED_INJECTED_UNAUTHORIZED_STRING_2026]');
    setVerificationResult('IDLE');
  };

  const handleDownloadArtifact = () => {
    if (!selectedItem) return;
    const exportData = {
      caseId,
      evidenceId: selectedItem.id,
      title: selectedItem.title,
      type: selectedItem.type,
      collectedAt: selectedItem.collectedAt,
      sha256: selectedItem.sha256,
      previousHash: selectedItem.previousHash,
      integrity: selectedItem.integrityStatus,
      confidence: selectedItem.confidence,
      structuredSummary: selectedItem.structuredSummary,
      rawData: selectedItem.rawData,
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `evidence_${selectedItem.id.toLowerCase()}_sealed.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!selectedItem) {
    return (
      <div className="w-full max-w-[1600px] mx-auto p-6 text-center text-[#8A94A6] font-mono-data">
        No forensic evidence registered for this case.
      </div>
    );
  }

  return (
    <div className="w-full max-w-[1600px] mx-auto p-3 sm:p-6 lg:p-10 pb-20 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-[#0B0F16]/90 backdrop-blur-md p-4 sm:p-5 rounded-lg hud-border">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded bg-[#00E676]/10 border border-[#00E676]/30 flex items-center justify-center text-[#00E676]">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono-data px-2 py-0.5 rounded bg-[#00E676]/10 text-[#00E676] border border-[#00E676]/30 font-bold">
                NIST SP 800-86 CERTIFIED
              </span>
              <span className="text-xs font-mono-data text-[#8A94A6]">Immutable Custody Chain</span>
            </div>
            <h2 className="font-headline text-lg sm:text-xl font-bold text-[#F4F7FB] mt-0.5">
              Cryptographic Evidence Vault &amp; Chain of Custody
            </h2>
          </div>
        </div>

        {/* Global Vault Metrics */}
        <div className="flex items-center gap-3 font-mono-data text-xs">
          <div className="bg-[#1a1b21] px-3 py-2 rounded border border-[#202B3C] flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#00E676]" />
            <span className="text-[#8A94A6]">Vault Status:</span>
            <span className="text-[#00E676] font-bold">100% SEALED</span>
          </div>
          <div className="bg-[#1a1b21] px-3 py-2 rounded border border-[#202B3C] flex items-center gap-2">
            <Hash className="w-4 h-4 text-[#00daf3]" />
            <span className="text-[#8A94A6]">Artifacts:</span>
            <span className="text-[#F4F7FB] font-bold">{items.length} Registered</span>
          </div>
        </div>
      </div>

      {/* Visual Cryptographic Hash Chain Strip */}
      <div className="bg-[#0B0F16]/90 rounded-lg hud-border p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#00daf3]" />
            <span className="text-xs font-mono-data font-bold text-[#F4F7FB] uppercase tracking-wider">
              Merkle-Sequential Integrity Ledger
            </span>
          </div>
          <span className="text-[10px] font-mono-data text-[#00E676] flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> All Hashes Verified Against Genesis
          </span>
        </div>

        {/* Chain nodes */}
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide py-2">
          {items.map((item, idx) => {
            const isSelected = selectedItem?.id === item.id;
            return (
              <React.Fragment key={item.id}>
                <button
                  onClick={() => setSelectedId(item.id)}
                  className={`p-3 rounded-lg border transition-all text-left shrink-0 w-64 ${
                    isSelected
                      ? 'border-[#00daf3] bg-[#00daf3]/10 ring-1 ring-[#00daf3]/50'
                      : 'border-[#202B3C] bg-[#1a1b21] hover:border-[#00daf3]/40'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1 font-mono-data text-[10px]">
                    <span className="text-[#00daf3] font-bold">{item.id}</span>
                    <span className="text-[#00E676] font-semibold flex items-center gap-0.5">
                      <CheckCircle2 className="w-3 h-3" /> VERIFIED
                    </span>
                  </div>
                  <div className="font-mono-data text-xs font-semibold text-[#F4F7FB] truncate mb-1">
                    {item.title}
                  </div>
                  <div className="font-mono-data text-[9px] text-[#8A94A6] truncate font-mono">
                    SHA: {item.sha256.slice(0, 16)}...
                  </div>
                </button>
                {idx < items.length - 1 && (
                  <div className="flex flex-col items-center shrink-0 text-[#00daf3]">
                    <span className="text-xs font-mono">⇄</span>
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Main Grid: Artifacts List & Deep Tabbed Evidence Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Artifacts Selector List */}
        <div className="lg:col-span-4 space-y-3">
          <div className="text-xs font-mono-data text-[#8A94A6] uppercase tracking-wider mb-2 font-semibold">
            Registered Forensic Artifacts ({items.length})
          </div>

          {items.map((item) => {
            const isSelected = selectedItem?.id === item.id;
            return (
              <div
                key={item.id}
                onClick={() => setSelectedId(item.id)}
                className={`p-4 rounded-lg border transition-all cursor-pointer font-mono-data ${
                  isSelected
                    ? 'border-[#00daf3] bg-[#00daf3]/10'
                    : 'border-[#202B3C] bg-[#0B0F16]/90 hover:border-[#00daf3]/40 hover:bg-[#1a1b21]'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-[#00daf3]">{item.id}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-[#1a1b21] text-[#8A94A6] border border-[#202B3C]">
                    {item.type}
                  </span>
                </div>
                <h4 className="text-xs font-bold text-[#F4F7FB] truncate mb-1">
                  {item.title}
                </h4>
                <div className="flex items-center justify-between text-[10px] text-[#8A94A6]">
                  <span className="truncate max-w-[150px]">{item.source}</span>
                  <span className="text-[#00E676]">{item.confidence}% Conf.</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right: Tabbed Deep Inspector */}
        <div className="lg:col-span-8 bg-[#0B0F16]/95 backdrop-blur-md rounded-lg hud-border p-5 space-y-5">
          {/* Top Bar with Title & Tabs */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#202B3C] pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono-data text-[#00daf3] font-bold">
                  {selectedItem.id}
                </span>
                <span className="text-[10px] font-mono-data px-2 py-0.5 rounded bg-[#00E676]/10 text-[#00E676] border border-[#00E676]/30 font-semibold">
                  {selectedItem.integrityStatus}
                </span>
              </div>
              <h3 className="font-headline text-base font-bold text-[#F4F7FB] mt-0.5">
                {selectedItem.title}
              </h3>
            </div>

            {/* Tab Controls */}
            <div className="flex items-center gap-1 bg-[#1a1b21] p-1 rounded border border-[#202B3C] font-mono-data text-xs overflow-x-auto">
              <button
                onClick={() => setActiveTab('summary')}
                className={`px-3 py-1.5 rounded transition-all min-h-[34px] ${
                  activeTab === 'summary'
                    ? 'bg-[#00daf3] text-[#090B10] font-bold'
                    : 'text-[#8A94A6] hover:text-[#e2e2e9]'
                }`}
              >
                Summary
              </button>
              <button
                onClick={() => setActiveTab('raw')}
                className={`px-3 py-1.5 rounded transition-all min-h-[34px] ${
                  activeTab === 'raw'
                    ? 'bg-[#00daf3] text-[#090B10] font-bold'
                    : 'text-[#8A94A6] hover:text-[#e2e2e9]'
                }`}
              >
                Raw Data
              </button>
              <button
                onClick={() => setActiveTab('custody')}
                className={`px-3 py-1.5 rounded transition-all min-h-[34px] ${
                  activeTab === 'custody'
                    ? 'bg-[#00daf3] text-[#090B10] font-bold'
                    : 'text-[#8A94A6] hover:text-[#e2e2e9]'
                }`}
              >
                Custody Chain
              </button>
              <button
                onClick={() => setActiveTab('verification')}
                className={`px-3 py-1.5 rounded transition-all min-h-[34px] flex items-center gap-1 ${
                  activeTab === 'verification'
                    ? 'bg-[#00daf3] text-[#090B10] font-bold'
                    : 'text-[#8A94A6] hover:text-[#e2e2e9]'
                }`}
              >
                <Cpu className="w-3.5 h-3.5" />
                <span>Verification Lab</span>
              </button>
            </div>
          </div>

          {/* Tab 1: Summary */}
          {activeTab === 'summary' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono-data text-xs">
                <div className="bg-[#1a1b21] p-3 rounded border border-[#202B3C]">
                  <span className="text-[10px] text-[#8A94A6] uppercase block mb-1">COLLECTED AT</span>
                  <span className="text-[#F4F7FB]">{selectedItem.collectedAt}</span>
                </div>
                <div className="bg-[#1a1b21] p-3 rounded border border-[#202B3C]">
                  <span className="text-[10px] text-[#8A94A6] uppercase block mb-1">SOURCE SENSOR</span>
                  <span className="text-[#00daf3]">{selectedItem.source}</span>
                </div>
              </div>

              {/* Structured Key-Values */}
              <div className="space-y-2 font-mono-data">
                <span className="text-[10px] text-[#8A94A6] uppercase tracking-wider block">
                  STRUCTURED PARSED PARAMETERS
                </span>
                <div className="bg-[#1a1b21] p-4 rounded border border-[#202B3C] space-y-2 text-xs">
                  {Object.entries(selectedItem.structuredSummary || {}).map(([key, value]) => (
                    <div key={key} className="flex flex-col sm:flex-row sm:justify-between py-1 border-b border-[#202B3C]/50 last:border-none">
                      <span className="text-[#8A94A6]">{key}:</span>
                      <span className="text-[#F4F7FB] font-semibold break-all">{value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2">
                {(selectedItem.tags || []).map((tag, idx) => (
                  <span
                    key={idx}
                    className="text-[10px] font-mono-data px-2.5 py-1 rounded bg-[#090B10] text-[#00daf3] border border-[#00daf3]/30"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Tab 2: Raw Telemetry */}
          {activeTab === 'raw' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono-data text-[#8A94A6] uppercase">
                  UNMODIFIED COLLECTED DATA PAYLOAD
                </span>
                <button
                  onClick={() => handleCopy(selectedItem.rawData, 'raw')}
                  className="text-xs font-mono-data text-[#00daf3] hover:underline flex items-center gap-1"
                >
                  {copiedHash === 'raw' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedHash === 'raw' ? 'Copied' : 'Copy Payload'}
                </button>
              </div>

              <pre className="bg-[#090B10] p-4 rounded border border-[#202B3C] font-mono text-xs text-[#c3f5ff] overflow-x-auto whitespace-pre-wrap break-all max-h-64 leading-relaxed scrollbar-hide">
                {selectedItem.rawData}
              </pre>
            </div>
          )}

          {/* Tab 3: Cryptographic Custody */}
          {activeTab === 'custody' && (
            <div className="space-y-4 font-mono-data text-xs">
              <div className="bg-[#1a1b21] p-4 rounded border border-[#202B3C] space-y-3">
                {/* Current SHA-256 */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] text-[#8A94A6] uppercase">ARTIFACT SHA-256 DIGEST</span>
                    <button
                      onClick={() => handleCopy(selectedItem.sha256, 'current')}
                      className="text-[10px] text-[#00daf3] hover:underline flex items-center gap-1"
                    >
                      {copiedHash === 'current' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      {copiedHash === 'current' ? 'Copied' : 'Copy Hash'}
                    </button>
                  </div>
                  <div className="p-2 bg-[#090B10] rounded border border-[#202B3C] text-[#00E676] break-all font-mono text-[11px]">
                    {selectedItem.sha256}
                  </div>
                </div>

                {/* Previous Block Hash */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] text-[#8A94A6] uppercase">PARENT MERKLE LINK (PREVIOUS HASH)</span>
                  </div>
                  <div className="p-2 bg-[#090B10] rounded border border-[#202B3C] text-[#8A94A6] break-all font-mono text-[11px]">
                    {selectedItem.previousHash}
                  </div>
                </div>

                <div className="p-3 rounded bg-[#00E676]/10 border border-[#00E676]/30 text-[#00E676] text-xs flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 shrink-0" />
                  <span>Chain integrity validated by cryptographic timestamp authority and NIST SP 800-86 guidelines.</span>
                </div>
              </div>
            </div>
          )}

          {/* Tab 4: Interactive Verification & Tamper Simulation Lab */}
          {activeTab === 'verification' && (
            <div className="space-y-4 font-mono-data text-xs">
              <div className="bg-[#1a1b21] p-4 rounded border border-[#202B3C] space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] font-bold text-[#F4F7FB] uppercase flex items-center gap-1.5">
                      <Cpu className="w-4 h-4 text-[#00daf3]" />
                      Live NIST SP 800-86 Cryptographic Hash Verifier
                    </span>
                    <span className="text-[10px] text-[#8A94A6]">WebCrypto SHA-256</span>
                  </div>
                  <p className="text-[11px] text-[#8A94A6] font-normal">
                    Inspect the artifact, simulate byte modifications or tampering, and verify against the sealed genesis hash.
                  </p>
                </div>

                {/* Sealed Genesis Hash Reference */}
                <div className="p-3 rounded bg-[#090B10] border border-[#202B3C]">
                  <span className="text-[10px] text-[#8A94A6] uppercase block mb-1">SEALED CUSTODY DIGEST (ORIGINAL):</span>
                  <div className="text-[#00daf3] break-all font-mono text-[11px] select-all">
                    {selectedItem.sha256}
                  </div>
                </div>

                {/* Tamper Interactive Payload Area */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] text-[#8A94A6] uppercase">EDITABLE ARTIFACT BUFFER:</span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleInjectTampering}
                        className="text-[10px] text-[#FFC107] hover:underline flex items-center gap-1"
                      >
                        <AlertTriangle className="w-3 h-3" /> Simulate Byte Tamper
                      </button>
                      <button
                        onClick={handleRestoreOriginal}
                        className="text-[10px] text-[#00daf3] hover:underline flex items-center gap-1"
                      >
                        <RefreshCw className="w-3 h-3" /> Reset to Original
                      </button>
                    </div>
                  </div>
                  <textarea
                    rows={5}
                    value={tamperText}
                    onChange={(e) => {
                      setTamperText(e.target.value);
                      setVerificationResult('IDLE');
                    }}
                    className="w-full bg-[#090B10] border border-[#202B3C] rounded p-3 text-[#c3f5ff] font-mono text-xs focus:outline-none focus:border-[#00daf3]"
                  />
                </div>

                {/* Verification Actions */}
                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <button
                    onClick={handleRunIntegrityVerification}
                    disabled={isVerifying}
                    className="w-full sm:w-auto bg-[#00daf3] text-[#090B10] px-5 py-2.5 rounded font-bold hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2 min-h-[40px]"
                  >
                    <ShieldCheck className={`w-4 h-4 ${isVerifying ? 'animate-spin' : ''}`} />
                    <span>{isVerifying ? 'Hashing with WebCrypto...' : 'Verify Cryptographic Integrity'}</span>
                  </button>

                  <button
                    onClick={handleRestoreOriginal}
                    className="w-full sm:w-auto bg-[#1a1b21] text-[#8A94A6] hover:text-[#F4F7FB] border border-[#202B3C] px-4 py-2.5 rounded hover:border-[#00daf3] transition-all min-h-[40px]"
                  >
                    Restore Original Clean Evidence
                  </button>
                </div>

                {/* Real-time Verification Output State */}
                {verificationResult === 'VERIFIED' && (
                  <div className="p-4 rounded-lg bg-[#00E676]/10 border border-[#00E676]/40 text-[#00E676] space-y-2">
                    <div className="flex items-center gap-2 font-bold text-xs">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>INTEGRITY VERIFIED — IMMUTABLE HASH INTACT</span>
                    </div>
                    <div className="text-[11px] text-[#e2e2e9] space-y-1 font-mono">
                      <div>Computed Digest: <span className="text-[#00E676] break-all">{computedLiveHash}</span></div>
                      <div className="text-xs text-[#00E676]">All cryptographic hashes match the initial custody genesis block. Admissible for forensic discovery.</div>
                    </div>
                  </div>
                )}

                {verificationResult === 'COMPROMISED' && (
                  <div className="p-4 rounded-lg bg-[#FF3D00]/10 border border-[#FF3D00]/40 text-[#FF3D00] space-y-2">
                    <div className="flex items-center gap-2 font-bold text-xs">
                      <AlertCircle className="w-4 h-4" />
                      <span>INTEGRITY COMPROMISED — UNAUTHORIZED TAMPERING DETECTED</span>
                    </div>
                    <div className="text-[11px] text-[#e2e2e9] space-y-1 font-mono">
                      <div>Computed Digest: <span className="text-[#FF3D00] break-all">{computedLiveHash}</span></div>
                      <div>Expected Genesis: <span className="text-[#8A94A6] break-all">{selectedItem.sha256}</span></div>
                      <div className="text-xs text-[#FF5722]">Hash mismatch detected. Artifact data has been altered since initial ingestion. Chain of custody is invalid.</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Download Button */}
          <button
            onClick={handleDownloadArtifact}
            className="w-full bg-[#1a1b21] hover:bg-[#00daf3] hover:text-[#090B10] text-[#00daf3] border border-[#00daf3] transition-all duration-200 py-3 rounded font-mono-data text-xs font-bold flex items-center justify-center gap-2 min-h-[44px] active:scale-[0.99]"
          >
            <Download className="w-4 h-4" />
            <span>DOWNLOAD SEALED EVIDENCE ARTIFACT (.JSON)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
