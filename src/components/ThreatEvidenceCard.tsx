import React from 'react';
import { AlertOctagon, AlertTriangle, Link2Off, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { ThreatIndicator } from '../types';

interface ThreatEvidenceCardProps {
  indicators: ThreatIndicator[];
}

export const ThreatEvidenceCard: React.FC<ThreatEvidenceCardProps> = ({ indicators }) => {
  const getIndicatorIcon = (ind: ThreatIndicator) => {
    if (ind.type === 'danger') {
      if (ind.title.toLowerCase().includes('url') || ind.title.toLowerCase().includes('link')) {
        return <Link2Off className="w-4 h-4 text-[#FF3D00] shrink-0 mt-0.5" />;
      }
      return <AlertOctagon className="w-4 h-4 text-[#FF3D00] shrink-0 mt-0.5" />;
    }
    return <AlertTriangle className="w-4 h-4 text-[#FFC107] shrink-0 mt-0.5" />;
  };

  return (
    <div className="bg-[#0B0F16]/90 backdrop-blur-md rounded-lg hud-border p-4 sm:p-6 w-full">
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <h3 className="font-mono-data text-xs sm:text-sm font-semibold text-[#F4F7FB] uppercase tracking-wider">
          Threat Indicators &amp; Evidence
        </h3>
        <ShieldAlert className="w-4 h-4 text-[#8A94A6]" />
      </div>

      {indicators.length === 0 ? (
        <div className="flex items-center gap-3 p-3 bg-[#00E676]/10 border border-[#00E676]/30 rounded">
          <CheckCircle2 className="w-4 h-4 text-[#00E676] shrink-0" />
          <div>
            <div className="text-xs sm:text-sm font-mono-data text-[#00E676] font-semibold">
              No Threat Indicators Detected
            </div>
            <div className="text-[11px] sm:text-xs text-[#8A94A6]">
              All heuristics and telemetry checks passed clean.
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-2.5 sm:space-y-3">
          {indicators.map((ind) => {
            const isDanger = ind.type === 'danger';
            return (
              <div
                key={ind.id}
                className={`flex items-start gap-3 p-3 rounded border transition-colors ${
                  isDanger
                    ? 'bg-[#FF3D00]/5 border-[#FF3D00]/25 hover:bg-[#FF3D00]/10'
                    : 'bg-[#FFC107]/5 border-[#FFC107]/25 hover:bg-[#FFC107]/10'
                }`}
              >
                {getIndicatorIcon(ind)}
                <div className="min-w-0 flex-1">
                  <div
                    className={`text-xs sm:text-sm font-mono-data font-semibold mb-0.5 ${
                      isDanger ? 'text-[#ffb4ab]' : 'text-[#ffeac0]'
                    }`}
                  >
                    {ind.title}
                  </div>
                  <div className="text-[11px] sm:text-xs text-[#8A94A6] leading-relaxed">
                    {ind.description}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
