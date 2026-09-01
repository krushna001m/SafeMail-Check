import React, { useState } from 'react';
import { ShieldCheck, AlertTriangle, ExternalLink, ArrowRight, Info, X } from 'lucide-react';
import { UrlScanItem } from '../types';

interface UrlAnalysisTableProps {
  urls: UrlScanItem[];
}

export const UrlAnalysisTable: React.FC<UrlAnalysisTableProps> = ({ urls }) => {
  const [selectedUrl, setSelectedUrl] = useState<UrlScanItem | null>(null);

  const safeCount = urls.filter((u) => u.status === 'SAFE').length;
  const maliciousCount = urls.filter((u) => u.status === 'MALICIOUS').length;
  const suspiciousCount = urls.filter((u) => u.status === 'SUSPICIOUS').length;

  return (
    <div className="bg-[#0B0F16]/90 backdrop-blur-md rounded-lg hud-border p-4 sm:p-6 flex-1 flex flex-col w-full overflow-hidden">
      {/* Header with Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mb-4">
        <h3 className="font-mono-data text-xs sm:text-sm font-semibold text-[#F4F7FB] uppercase tracking-wider">
          URL Analysis &amp; Reputation
        </h3>
        
        <div className="flex items-center gap-2 overflow-x-auto whitespace-nowrap scrollbar-hide py-0.5">
          <span className="text-[10px] sm:text-xs font-mono-data bg-[#00E676]/10 text-[#00E676] px-2.5 py-1 rounded border border-[#00E676]/30 font-semibold">
            SAFE: {safeCount}
          </span>
          {maliciousCount > 0 && (
            <span className="text-[10px] sm:text-xs font-mono-data bg-[#FF3D00]/10 text-[#FF3D00] px-2.5 py-1 rounded border border-[#FF3D00]/30 font-semibold">
              MALICIOUS: {maliciousCount}
            </span>
          )}
          {suspiciousCount > 0 && (
            <span className="text-[10px] sm:text-xs font-mono-data bg-[#FFC107]/10 text-[#FFC107] px-2.5 py-1 rounded border border-[#FFC107]/30 font-semibold">
              SUSPICIOUS: {suspiciousCount}
            </span>
          )}
        </div>
      </div>

      {/* Local Horizontal Scroll Wrapper with Mobile Fade Edge */}
      <div className="relative w-full border border-[#202B3C]/50 rounded overflow-hidden">
        {/* Right-side gradient hint for touch devices indicating more scrollable columns */}
        <div className="absolute right-0 top-0 bottom-0 w-6 sm:w-8 bg-gradient-to-l from-[#0B0F16] to-transparent pointer-events-none md:hidden z-10" />

        <div className="overflow-x-auto w-full scrollbar-hide">
          <table className="w-full text-left border-collapse min-w-[540px] sm:min-w-[620px]">
            <thead>
              <tr className="border-b border-[#202B3C] text-[10px] sm:text-xs font-mono-data text-[#8A94A6] bg-[#1a1b21]/50">
                <th className="py-2.5 px-3 font-normal">URL</th>
                <th className="py-2.5 px-3 font-normal">Status</th>
                <th className="py-2.5 px-3 font-normal">Reputation Score</th>
                <th className="py-2.5 px-3 font-normal">Redirect Path</th>
                <th className="py-2.5 px-3 font-normal text-right">Details</th>
              </tr>
            </thead>
            <tbody className="font-mono-data text-xs sm:text-sm divide-y divide-[#202B3C]/40">
              {urls.map((item) => {
                const isMalicious = item.status === 'MALICIOUS';
                const isSafe = item.status === 'SAFE';

                return (
                  <tr
                    key={item.id}
                    onClick={() => setSelectedUrl(item)}
                    className="hover:bg-[#1a1b21] transition-colors cursor-pointer group"
                  >
                    {/* URL String */}
                    <td className="py-3 px-3 text-[#F4F7FB] truncate max-w-[160px] sm:max-w-[220px]">
                      <span className="font-medium group-hover:text-[#00daf3] transition-colors">
                        {item.url}
                      </span>
                    </td>

                    {/* Status Pill */}
                    <td className="py-3 px-3">
                      {isSafe ? (
                        <span className="text-[10px] px-2 py-1 rounded bg-[#00E676]/10 text-[#00E676] border border-[#00E676]/30 flex items-center gap-1 w-max font-bold">
                          <ShieldCheck className="w-3 h-3" />
                          SAFE
                        </span>
                      ) : isMalicious ? (
                        <span className="text-[10px] px-2 py-1 rounded bg-[#FF3D00]/10 text-[#FF3D00] border border-[#FF3D00]/30 flex items-center gap-1 w-max font-bold">
                          <AlertTriangle className="w-3 h-3" />
                          MALICIOUS
                        </span>
                      ) : (
                        <span className="text-[10px] px-2 py-1 rounded bg-[#FFC107]/10 text-[#FFC107] border border-[#FFC107]/30 flex items-center gap-1 w-max font-bold">
                          <AlertTriangle className="w-3 h-3" />
                          SUSPICIOUS
                        </span>
                      )}
                    </td>

                    {/* Reputation Score Progress */}
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        <div className="w-14 sm:w-20 h-1.5 bg-[#1e1f25] rounded-full overflow-hidden border border-[#202B3C]">
                          <div
                            className={`h-full rounded-full ${
                              isSafe
                                ? 'bg-[#00E676]'
                                : isMalicious
                                ? 'bg-[#FF3D00]'
                                : 'bg-[#FFC107]'
                            }`}
                            style={{ width: `${item.reputationScore}%` }}
                          />
                        </div>
                        <span
                          className={`text-[11px] sm:text-xs font-bold ${
                            isSafe
                              ? 'text-[#00E676]'
                              : isMalicious
                              ? 'text-[#FF3D00]'
                              : 'text-[#FFC107]'
                          }`}
                        >
                          {item.reputationScore}%
                        </span>
                      </div>
                    </td>

                    {/* Redirect Path */}
                    <td className="py-3 px-3 text-[#8A94A6] text-[11px] sm:text-xs truncate max-w-[160px] sm:max-w-[220px]">
                      <div className="flex flex-col gap-0.5">
                        {item.redirectPath.map((hop, idx) => (
                          <span key={idx} className="truncate">
                            {hop}
                          </span>
                        ))}
                      </div>
                    </td>

                    {/* Details Action */}
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedUrl(item);
                        }}
                        className="text-[11px] font-mono-data text-[#8A94A6] group-hover:text-[#00daf3] border border-[#202B3C] group-hover:border-[#00daf3] px-2 py-1 rounded transition-colors"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* URL Detail Modal */}
      {selectedUrl && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0B0F16] border border-[#00daf3] rounded-lg w-full max-w-lg p-5 shadow-2xl animate-fade-in-up">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Info className="w-5 h-5 text-[#00daf3]" />
                <h4 className="font-headline font-semibold text-base text-[#F4F7FB]">
                  URL Forensics Deep Dive
                </h4>
              </div>
              <button
                onClick={() => setSelectedUrl(null)}
                className="text-[#8A94A6] hover:text-[#e2e2e9] p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 font-mono-data text-xs">
              <div className="bg-[#1a1b21] p-3 rounded border border-[#202B3C]">
                <div className="text-[#8A94A6] text-[10px] mb-1 uppercase">TARGET URL</div>
                <div className="text-[#00daf3] break-all font-semibold">{selectedUrl.url}</div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-[#1a1b21] p-2.5 rounded border border-[#202B3C]">
                  <div className="text-[#8A94A6] text-[10px] uppercase">STATUS</div>
                  <div
                    className={`font-bold mt-1 ${
                      selectedUrl.status === 'SAFE' ? 'text-[#00E676]' : 'text-[#FF3D00]'
                    }`}
                  >
                    {selectedUrl.status} ({selectedUrl.reputationScore}%)
                  </div>
                </div>
                <div className="bg-[#1a1b21] p-2.5 rounded border border-[#202B3C]">
                  <div className="text-[#8A94A6] text-[10px] uppercase">DESTINATION IP</div>
                  <div className="text-[#e2e2e9] font-medium mt-1">
                    {selectedUrl.destinationIp || '185.23.44.11'}
                  </div>
                </div>
              </div>

              <div className="bg-[#1a1b21] p-3 rounded border border-[#202B3C]">
                <div className="text-[#8A94A6] text-[10px] mb-1 uppercase">AUTONOMOUS SYSTEM (ASN)</div>
                <div className="text-[#e2e2e9]">{selectedUrl.asn || 'AS44533 HostKey B.V.'}</div>
              </div>

              <div className="bg-[#1a1b21] p-3 rounded border border-[#202B3C]">
                <div className="text-[#8A94A6] text-[10px] mb-1.5 uppercase">REDIRECT HOPS TRACED</div>
                <div className="space-y-1 text-[11px] text-[#c3f5ff]">
                  {selectedUrl.redirectPath.map((hop, idx) => (
                    <div key={idx} className="flex items-center gap-1.5 break-all">
                      <ArrowRight className="w-3 h-3 text-[#00daf3] shrink-0" />
                      <span>{hop}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-5">
              <button
                onClick={() => setSelectedUrl(null)}
                className="bg-[#00daf3] text-[#090B10] px-4 py-2 rounded font-mono-data text-xs font-bold hover:brightness-110 min-h-[40px]"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
