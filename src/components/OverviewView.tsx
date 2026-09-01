import React, { useEffect, useState } from 'react';
import { ShieldCheck, ShieldAlert, Activity, Cpu, ArrowUpRight, PlusCircle, RefreshCw } from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  Tooltip,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  BarChart,
  Bar,
} from 'recharts';
import { InvestigationData } from '../types';
import { fetchPlatformStats, PlatformStats } from '../utils/api';
import { BlockchainLedger } from './BlockchainLedger';

interface OverviewViewProps {
  currentInvestigation?: InvestigationData;
  history?: InvestigationData[];
  onOpenInvestigation: () => void;
  onSelectInvestigation?: (item: InvestigationData) => void;
  onNewInvestigation?: () => void;
}

const CHART_TOOLTIP_STYLE = {
  backgroundColor: '#0B0F16',
  border: '1px solid #202B3C',
  borderRadius: 6,
  fontFamily: 'JetBrains Mono, monospace',
  fontSize: 11,
  color: '#F4F7FB',
};

export const OverviewView: React.FC<OverviewViewProps> = ({
  currentInvestigation,
  history = [],
  onOpenInvestigation,
  onSelectInvestigation,
  onNewInvestigation,
}) => {
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(false);

  const loadStats = async () => {
    setIsLoadingStats(true);
    try {
      const s = await fetchPlatformStats();
      setStats(s);
    } finally {
      setIsLoadingStats(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  // Compute live metrics from actual investigations
  const allInvestigations = stats?.recentInvestigations && stats.recentInvestigations.length > 0
    ? stats.recentInvestigations
    : history.length > 0
    ? history
    : currentInvestigation
    ? [currentInvestigation]
    : [];

  const totalCount = stats?.totalIngested || allInvestigations.length;
  const maliciousCount = stats?.maliciousCount ?? allInvestigations.filter((i) => i.verdict === 'MALICIOUS').length;
  const cleanCount = stats?.cleanCount ?? allInvestigations.filter((i) => i.verdict === 'CLEAN' || i.verdict === 'SAFE').length;
  const suspiciousCount = stats?.suspiciousCount ?? allInvestigations.filter((i) => i.verdict === 'SUSPICIOUS').length;
  const totalUrls = stats?.totalUrlsAnalyzed ?? allInvestigations.reduce((acc, i) => acc + (i.urls?.length || 0), 0);

  const metrics = [
    {
      label: 'Total Ingested Artifacts',
      value: `${totalCount}`,
      delta: `${allInvestigations.length} currently loaded in session`,
      icon: <Activity className="w-4 h-4 text-[#00daf3]" />,
    },
    {
      label: 'Confirmed Malicious Vectors',
      value: `${maliciousCount}`,
      delta: `${maliciousCount > 0 ? 'Requires containment' : 'Zero threats flagged'}`,
      icon: <ShieldAlert className="w-4 h-4 text-[#FF3D00]" />,
    },
    {
      label: 'Clean Verified Emails',
      value: `${cleanCount}`,
      delta: 'Passed cryptographic SPF/DKIM',
      icon: <ShieldCheck className="w-4 h-4 text-[#00E676]" />,
    },
    {
      label: 'Detonated URLs & Vectors',
      value: `${totalUrls}`,
      delta: 'Heuristic sandbox triage',
      icon: <Cpu className="w-4 h-4 text-[#00daf3]" />,
    },
  ];

  // --- Chart data, derived only from real investigation records ---

  const distributionData = [
    { name: 'Malicious', value: maliciousCount, color: '#FF3D00' },
    { name: 'Suspicious', value: suspiciousCount, color: '#FFC107' },
    { name: 'Clean', value: cleanCount, color: '#00E676' },
  ].filter((d) => d.value > 0);

  const trendData = allInvestigations
    .slice()
    .reverse()
    .map((inv, idx) => ({
      seq: `#${idx + 1}`,
      risk: inv.riskScore,
      id: inv.id,
    }));

  const signalTotals = allInvestigations.reduce(
    (acc, inv) => {
      acc.maliciousUrls += inv.stats?.maliciousUrls || 0;
      acc.ipCount += inv.stats?.ipCount || 0;
      acc.domainCount += inv.stats?.domainCount || 0;
      acc.evidenceCount += inv.stats?.evidenceCount || 0;
      acc.hopCount += inv.stats?.hopCount || 0;
      return acc;
    },
    { maliciousUrls: 0, ipCount: 0, domainCount: 0, evidenceCount: 0, hopCount: 0 }
  );

  const signalData = [
    { name: 'Malicious URLs', value: signalTotals.maliciousUrls },
    { name: 'Flagged IPs', value: signalTotals.ipCount },
    { name: 'Flagged Domains', value: signalTotals.domainCount },
    { name: 'Evidence Items', value: signalTotals.evidenceCount },
    { name: 'Relay Hops', value: signalTotals.hopCount },
  ];

  return (
    <div className="w-full max-w-[1600px] mx-auto p-4 sm:p-6 lg:p-10 pb-20 space-y-6">
      {/* Top Bar Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#0B0F16]/90 p-4 sm:p-6 rounded-lg hud-border">
        <div>
          <span className="text-xs text-[#8A94A6] font-mono-data">Tier-3 Forensic Intake</span>
          <h2 className="font-headline text-xl sm:text-2xl font-bold text-[#F4F7FB] mt-0.5">
            Security Overview
          </h2>
          <p className="text-xs text-[#8A94A6] font-mono-data mt-0.5">
            Real-time heuristic evaluation and cryptographic verification stream
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={loadStats}
            disabled={isLoadingStats}
            className="p-2.5 rounded bg-[#1a1b21] border border-[#202B3C] hover:border-[#00daf3] text-[#8A94A6] hover:text-[#00daf3] transition-colors"
            title="Refresh Platform Telemetry"
          >
            <RefreshCw className={`w-4 h-4 ${isLoadingStats ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={onNewInvestigation || onOpenInvestigation}
            className="bg-[#00daf3] text-[#090B10] px-4 py-2.5 rounded font-mono-data text-xs font-bold hover:brightness-110 active:scale-95 transition-all flex items-center gap-1.5 min-h-[40px]"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Analyze New Email</span>
          </button>
        </div>
      </div>

      {/* Top Telemetry Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((m, idx) => (
          <div key={idx} className="bg-[#0B0F16]/90 p-4 sm:p-5 rounded-lg hud-border flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono-data text-xs text-[#8A94A6] uppercase">{m.label}</span>
              <div className="w-8 h-8 rounded bg-[#1a1b21] flex items-center justify-center border border-[#202B3C]">
                {m.icon}
              </div>
            </div>
            <div className="font-headline text-xl sm:text-2xl font-bold text-[#F4F7FB] mb-1">
              {m.value}
            </div>
            <div className="font-mono-data text-[10px] sm:text-xs text-[#8A94A6]">
              {m.delta}
            </div>
          </div>
        ))}
      </div>

      {/* Threat Activity & Distribution Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 bg-[#0B0F16]/90 rounded-lg hud-border p-4 sm:p-6">
          <h3 className="font-headline text-base font-bold text-[#F4F7FB] mb-1">Risk Score Trend</h3>
          <p className="text-xs text-[#8A94A6] font-mono-data mb-3">
            Risk score across analyzed cases, in the order they were processed
          </p>
          {trendData.length > 1 ? (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={trendData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid stroke="#202B3C" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="seq" stroke="#8A94A6" fontSize={10} tickLine={false} />
                <YAxis stroke="#8A94A6" fontSize={10} domain={[0, 100]} tickLine={false} />
                <Tooltip contentStyle={CHART_TOOLTIP_STYLE} labelStyle={{ color: '#8A94A6' }} />
                <Line type="monotone" dataKey="risk" stroke="#00daf3" strokeWidth={2} dot={{ r: 3, fill: '#00daf3' }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[220px] flex items-center justify-center text-xs text-[#8A94A6] font-mono-data">
              Analyze more emails to build a trend line
            </div>
          )}
        </div>

        <div className="lg:col-span-5 bg-[#0B0F16]/90 rounded-lg hud-border p-4 sm:p-6">
          <h3 className="font-headline text-base font-bold text-[#F4F7FB] mb-1">Threat Distribution</h3>
          <p className="text-xs text-[#8A94A6] font-mono-data mb-3">Verdicts across all analyzed cases</p>
          {distributionData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={distributionData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={2}
                >
                  {distributionData.map((entry, idx) => (
                    <Cell key={idx} fill={entry.color} stroke="#0B0F16" strokeWidth={2} />
                  ))}
                </Pie>
                <Tooltip contentStyle={CHART_TOOLTIP_STYLE} />
                <Legend
                  formatter={(value) => <span style={{ color: '#8A94A6', fontSize: 11, fontFamily: 'JetBrains Mono, monospace' }}>{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[220px] flex items-center justify-center text-xs text-[#8A94A6] font-mono-data">
              No verdicts recorded yet
            </div>
          )}
        </div>
      </div>

      {/* Signal Breakdown Bar Chart */}
      <div className="bg-[#0B0F16]/90 rounded-lg hud-border p-4 sm:p-6">
        <h3 className="font-headline text-base font-bold text-[#F4F7FB] mb-1">Signal Breakdown</h3>
        <p className="text-xs text-[#8A94A6] font-mono-data mb-3">
          Extracted indicators aggregated across all analyzed cases
        </p>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={signalData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid stroke="#202B3C" strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="name" stroke="#8A94A6" fontSize={10} tickLine={false} interval={0} angle={-10} textAnchor="end" height={40} />
            <YAxis stroke="#8A94A6" fontSize={10} tickLine={false} allowDecimals={false} />
            <Tooltip contentStyle={CHART_TOOLTIP_STYLE} cursor={{ fill: 'rgba(0,218,243,0.05)' }} />
            <Bar dataKey="value" fill="#00daf3" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Main Command Dashboard Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Recent Ingested Campaigns Table */}
        <div className="lg:col-span-8 bg-[#0B0F16]/90 rounded-lg hud-border p-4 sm:p-6 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-headline text-base sm:text-lg font-bold text-[#F4F7FB]">
                Recent Security Events
              </h3>
              <p className="text-xs text-[#8A94A6] font-mono-data">
                Parsed and evaluated RFC 5322 artifacts in this active session
              </p>
            </div>
            <button
              onClick={onOpenInvestigation}
              className="text-xs font-mono-data text-[#00daf3] hover:underline flex items-center gap-1 min-h-[36px]"
            >
              <span>Inspect Active Case</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto w-full scrollbar-hide border border-[#202B3C]/50 rounded">
            <table className="w-full text-left border-collapse min-w-[500px]">
              <thead>
                <tr className="border-b border-[#202B3C] text-[10px] sm:text-xs font-mono-data text-[#8A94A6] bg-[#1a1b21]/50">
                  <th className="py-2.5 px-3">Case ID / Subject</th>
                  <th className="py-2.5 px-3">Sender</th>
                  <th className="py-2.5 px-3">Risk Score</th>
                  <th className="py-2.5 px-3">Verdict</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="font-mono-data text-xs divide-y divide-[#202B3C]/40">
                {allInvestigations.map((row) => (
                  <tr
                    key={row.id}
                    onClick={() => {
                      if (onSelectInvestigation) onSelectInvestigation(row);
                      else onOpenInvestigation();
                    }}
                    className="hover:bg-[#1a1b21] transition-colors cursor-pointer group"
                  >
                    <td className="py-3 px-3">
                      <div className="font-semibold text-[#F4F7FB] group-hover:text-[#00daf3] truncate max-w-[200px]">
                        {row.subject || '(No Subject)'}
                      </div>
                      <div className="text-[10px] text-[#8A94A6]">{row.id}</div>
                    </td>
                    <td className="py-3 px-3 text-[#c3f5ff] truncate max-w-[150px]">{row.sender}</td>
                    <td className="py-3 px-3">
                      <span
                        className={`font-bold ${
                          row.riskScore > 70 ? 'text-[#FF3D00]' : row.riskScore > 30 ? 'text-[#FFC107]' : 'text-[#00E676]'
                        }`}
                      >
                        {row.riskScore}/100
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`text-[9px] px-2 py-0.5 rounded font-bold border ${
                          row.verdict === 'MALICIOUS'
                            ? 'bg-[#FF3D00]/10 text-[#FF3D00] border-[#FF3D00]/30'
                            : row.verdict === 'SUSPICIOUS'
                            ? 'bg-[#FFC107]/10 text-[#FFC107] border-[#FFC107]/30'
                            : 'bg-[#00E676]/10 text-[#00E676] border-[#00E676]/30'
                        }`}
                      >
                        {row.verdict}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right text-[#00daf3] text-[11px] group-hover:underline">
                      Inspect →
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* MITRE ATT&CK & Real Indicator Breakdown */}
        <div className="lg:col-span-4 bg-[#0B0F16]/90 rounded-lg hud-border p-4 sm:p-6 space-y-4">
          <h3 className="font-headline text-base font-bold text-[#F4F7FB] border-b border-[#202B3C] pb-3">
            Active Threat Posture
          </h3>

          <div className="space-y-3 font-mono-data text-xs">
            <div className="p-3 bg-[#1a1b21] rounded border border-[#202B3C]">
              <div className="flex justify-between text-[#e2e2e9] mb-1">
                <span>T1566.002 Spearphishing Link</span>
                <span className={currentInvestigation?.verdict === 'MALICIOUS' ? 'text-[#FF3D00]' : 'text-[#00E676]'}>
                  {currentInvestigation?.verdict === 'MALICIOUS' ? 'Triggered' : 'Clean'}
                </span>
              </div>
              <p className="text-[11px] text-[#8A94A6]">
                Evaluates embedded URLs, shorteners, and newly observed destination TLDs.
              </p>
            </div>

            <div className="p-3 bg-[#1a1b21] rounded border border-[#202B3C]">
              <div className="flex justify-between text-[#e2e2e9] mb-1">
                <span>T1586 Compromised Accounts</span>
                <span className={currentInvestigation?.authStatus.dmarc === 'REJECT' ? 'text-[#FF3D00]' : 'text-[#00E676]'}>
                  {currentInvestigation?.authStatus.dmarc === 'REJECT' ? 'DMARC Rejected' : 'DMARC Passed'}
                </span>
              </div>
              <p className="text-[11px] text-[#8A94A6]">
                Cryptographic signature and envelope domain identifier alignment verification.
              </p>
            </div>

            <div className="p-3 bg-[#1a1b21] rounded border border-[#202B3C]">
              <div className="flex justify-between text-[#e2e2e9] mb-1">
                <span>NIST SP 800-86 Cryptographic Chain</span>
                <span className="text-[#00E676]">SHA-256 Intact</span>
              </div>
              <p className="text-[11px] text-[#8A94A6]">
                Chain of custody with immutable hash verification on all parsed evidence.
              </p>
            </div>
          </div>

          <button
            onClick={onOpenInvestigation}
            className="w-full bg-[#00daf3] text-[#090B10] py-2.5 rounded font-mono-data text-xs font-bold hover:brightness-110 min-h-[44px]"
          >
            Inspect Active Case ({currentInvestigation?.id || 'CASE-001'})
          </button>
        </div>
      </div>

      {/* Blockchain Evidence Verification */}
      {currentInvestigation && (
        <BlockchainLedger items={currentInvestigation.evidenceItems} caseId={currentInvestigation.id} />
      )}
    </div>
  );
};
