import React, { useState, useEffect, useCallback } from 'react';
import { SidebarNav } from './components/SidebarNav';
import { TopHeader } from './components/TopHeader';
import { ForensicCaseHeader } from './components/ForensicCaseHeader';
import { ForensicSummaryBanner } from './components/ForensicSummaryBanner';
import { EmailIngestionCard } from './components/EmailIngestionCard';
import { SenderDomainCard } from './components/SenderDomainCard';
import { ThreatEvidenceCard } from './components/ThreatEvidenceCard';
import { ProcessingPipeline } from './components/ProcessingPipeline';
import { UrlAnalysisTable } from './components/UrlAnalysisTable';
import { ExplainableAiCard } from './components/ExplainableAiCard';
import { ThreatIntelPanel } from './components/ThreatIntelPanel';
import { GisIntelligenceView } from './components/GisIntelligenceView';
import { ForensicTimelineView } from './components/ForensicTimelineView';
import { AttackGraphView } from './components/AttackGraphView';
import { OverviewView } from './components/OverviewView';
import { EvidenceView } from './components/EvidenceView';
import { SettingsView } from './components/SettingsView';
import { ProfileView } from './components/ProfileView';
import { LoadingScreen } from './components/LoadingScreen';
import { AiSecurityAssistant } from './components/AiSecurityAssistant';
import { AwarenessView } from './components/AwarenessView';
import { AuthModal } from './components/auth/AuthModal';
import { useAuth } from './context/AuthContext';
import { NavTab, InvestigationData } from './types';
import { generateInvestigationPdf } from './utils/pdfGenerator';
import { RAW_SAMPLE_VECTORS } from './utils/rawSampleHeaders';
import { analyzeEmailArtifact, fetchInvestigationHistory } from './utils/api';
import { FileDown, CheckCircle2, ArrowRight, History, Network, FileText } from 'lucide-react';

export function App() {
  const { isAuthenticated, user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [currentTab, setCurrentTab] = useState<NavTab>('investigations');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  
  // Real active investigation & session history state
  const [currentInvestigation, setCurrentInvestigation] = useState<InvestigationData | null>(null);
  const [history, setHistory] = useState<InvestigationData[]>([]);

  // Function to run real forensic analysis on a raw RFC email string
  const processRawEmail = useCallback(async (rawText: string, fileName: string = 'email_artifact.eml') => {
    setIsScanning(true);
    try {
      const result = await analyzeEmailArtifact(rawText, fileName);
      setCurrentInvestigation(result);
      setHistory((prev) => {
        const filtered = prev.filter((item) => item.id !== result.id);
        return [result, ...filtered];
      });
      setToastMessage(`Analyzed ${fileName} — Verdict: ${result.verdict} (${result.riskScore}/100)`);
      setTimeout(() => setToastMessage(null), 4000);
    } catch (err: any) {
      console.error('Forensic analysis error:', err);
      setToastMessage(`Error analyzing ${fileName}: ${err.message || 'Parser failure'}`);
      setTimeout(() => setToastMessage(null), 4000);
    } finally {
      setIsScanning(false);
    }
  }, []);

  // Sync isolated history from backend when user logs in or mounts
  useEffect(() => {
    async function syncBackendHistory() {
      try {
        const remoteHistory = await fetchInvestigationHistory();
        if (remoteHistory && remoteHistory.length > 0) {
          setHistory(remoteHistory);
          // If we don't have an active investigation or user just logged in, set to most recent
          if (!currentInvestigation) {
            setCurrentInvestigation(remoteHistory[0]);
          }
        }
      } catch (err) {
        console.warn('Could not sync user history:', err);
      }
    }
    syncBackendHistory();
  }, [user]);

  // Initial load: parse the default spearphishing vector through the real parser
  useEffect(() => {
    const initialVector = RAW_SAMPLE_VECTORS.spearphishing_credential_harvest;
    processRawEmail(initialVector.raw, 'spearphishing_sample.eml');
  }, [processRawEmail]);

  const handleReanalyze = () => {
    if (currentInvestigation?.rawHeaders) {
      processRawEmail(currentInvestigation.rawHeaders, currentInvestigation.sourceFile);
    } else {
      const defaultVec = RAW_SAMPLE_VECTORS.spearphishing_credential_harvest;
      processRawEmail(defaultVec.raw, 'reanalyzed_artifact.eml');
    }
  };

  const handleExportReport = () => {
    if (!currentInvestigation) return;
    try {
      setIsExporting(true);
      generateInvestigationPdf(currentInvestigation);
      setToastMessage(`Official SOC Forensic PDF Report exported for ${currentInvestigation.id}`);
      setTimeout(() => {
        setToastMessage(null);
      }, 4000);
    } catch (err) {
      console.error('Failed to export PDF report:', err);
    } finally {
      setIsExporting(false);
    }
  };

  const handleLoadRawVector = (vectorKey: string) => {
    const vec = RAW_SAMPLE_VECTORS[vectorKey];
    if (vec) {
      processRawEmail(vec.raw, `${vectorKey}.eml`);
    }
  };

  const handlePasteHeaders = (headers: string, fileName: string = 'pasted_rfc_headers.eml') => {
    processRawEmail(headers, fileName);
  };

  const handleNewInvestigation = () => {
    setCurrentTab('investigations');
  };

  const handleSelectHistoryItem = (item: InvestigationData) => {
    setCurrentInvestigation(item);
    setCurrentTab('investigations');
  };

  // If initial load is still preparing the investigation object
  if (!currentInvestigation) {
    return (
      <div className="min-h-screen bg-[#090B10] flex items-center justify-center text-[#00daf3] font-mono-data">
        <LoadingScreen onComplete={() => setIsLoading(false)} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#090B10] text-[#e2e2e9] font-body flex flex-col relative selection:bg-[#00daf3]/30 selection:text-[#00daf3]">
      {/* Cyber Initializer Sequence */}
      {isLoading && <LoadingScreen onComplete={() => setIsLoading(false)} />}

      {/* Authentication Modal Dialog */}
      <AuthModal />

      {/* App Shell */}
      <div className="flex-1 flex flex-row min-h-screen relative z-10">
        {/* Left Navigation Sidebar */}
        <SidebarNav
          currentTab={currentTab}
          onSelectTab={setCurrentTab}
          isOpenMobile={mobileMenuOpen}
          onCloseMobile={() => setMobileMenuOpen(false)}
          onNewInvestigation={handleNewInvestigation}
        />

        {/* Main Content Area (desktop 260px offset via lg:pl-[260px]) */}
        <div className="flex-1 flex flex-col min-w-0 lg:pl-[260px]">
          {/* Top Sticky Header */}
          <TopHeader
            currentTab={currentTab}
            riskScore={currentInvestigation.riskScore}
            verdict={currentInvestigation.verdict}
            confidence={currentInvestigation.confidence}
            onOpenMobileMenu={() => setMobileMenuOpen(true)}
            onNewInvestigation={handleNewInvestigation}
            onSelectTab={setCurrentTab}
          />

          {/* Main View Router */}
          <main className="flex-1 w-full overflow-x-hidden">
            {/* 1. INVESTIGATIONS TAB */}
            {currentTab === 'investigations' && (
              <div className="w-full max-w-[1600px] mx-auto p-3 sm:p-6 lg:p-10 pb-20 space-y-6">
                {/* Forensic Case Header with Case ID, TLP, Risk, Confidence, Export */}
                <ForensicCaseHeader
                  data={currentInvestigation}
                  onExportReport={handleExportReport}
                  isExporting={isExporting}
                  onReanalyze={handleReanalyze}
                  onLoadRawVector={handleLoadRawVector}
                  isScanning={isScanning}
                />

                {/* Forensic Metrics Summary Strip */}
                <ForensicSummaryBanner
                  data={currentInvestigation}
                  onNavigateTab={(tab) => setCurrentTab(tab as NavTab)}
                />

                {/* Desktop 2-column layout / Mobile 1-column stacked */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                  {/* Left Column: Email Ingestion & 3D Hero Dropzone (5 cols on lg) */}
                  <div className="lg:col-span-5 flex flex-col gap-6">
                    <EmailIngestionCard
                      sourceFileName={currentInvestigation.sourceFile}
                      isScanning={isScanning}
                      verdict={currentInvestigation.verdict}
                      onReanalyze={handleReanalyze}
                      onLoadRawVector={handleLoadRawVector}
                      onPasteHeaders={handlePasteHeaders}
                      onExportReport={handleExportReport}
                      isExporting={isExporting}
                    />

                    {/* Quick Threat Indicators preview */}
                    <ThreatEvidenceCard indicators={currentInvestigation.indicators} />

                    {/* AI / ML Model Explainability Card */}
                    <ExplainableAiCard
                      factors={currentInvestigation.contributingFactors || []}
                      verdict={currentInvestigation.verdict}
                      confidence={currentInvestigation.confidencePercentage || 94}
                    />
                  </div>

                  {/* Right Column: Sender Domain Intel, Processing Pipeline, URL Table & Threat Intel (7 cols on lg) */}
                  <div className="lg:col-span-7 flex flex-col gap-6">
                    <SenderDomainCard data={currentInvestigation} />
                    
                    <ProcessingPipeline
                      stages={currentInvestigation.stages}
                      isScanning={isScanning}
                    />

                    <UrlAnalysisTable urls={currentInvestigation.urls} />

                    {/* Global Threat Intelligence Feeds Panel */}
                    <ThreatIntelPanel
                      providers={currentInvestigation.threatIntelProviders || []}
                    />
                  </div>
                </div>

                {/* Quick Navigation Cards to Timeline, Graph & Evidence */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                  <button
                    onClick={() => setCurrentTab('forensic-timeline')}
                    className="p-4 rounded-lg bg-[#0B0F16]/90 border border-[#202B3C] hover:border-[#00daf3] transition-all text-left group flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded bg-[#00daf3]/10 text-[#00daf3] flex items-center justify-center">
                        <History className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-mono-data font-bold text-[#F4F7FB] group-hover:text-[#00daf3]">
                          Forensic Timeline
                        </div>
                        <div className="text-[10px] font-mono-data text-[#8A94A6]">
                          {currentInvestigation.timeline.length} Mapped Event States
                        </div>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-[#8A94A6] group-hover:text-[#00daf3] group-hover:translate-x-0.5 transition-transform" />
                  </button>

                  <button
                    onClick={() => setCurrentTab('attack-graph')}
                    className="p-4 rounded-lg bg-[#0B0F16]/90 border border-[#202B3C] hover:border-[#00daf3] transition-all text-left group flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded bg-[#FF3D00]/10 text-[#FF3D00] flex items-center justify-center">
                        <Network className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-mono-data font-bold text-[#F4F7FB] group-hover:text-[#00daf3]">
                          Attack Relationship Graph
                        </div>
                        <div className="text-[10px] font-mono-data text-[#8A94A6]">
                          {currentInvestigation.attackNodes.length} Interactive Nodes
                        </div>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-[#8A94A6] group-hover:text-[#00daf3] group-hover:translate-x-0.5 transition-transform" />
                  </button>

                  <button
                    onClick={() => setCurrentTab('evidence')}
                    className="p-4 rounded-lg bg-[#0B0F16]/90 border border-[#202B3C] hover:border-[#00daf3] transition-all text-left group flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded bg-[#00E676]/10 text-[#00E676] flex items-center justify-center">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-mono-data font-bold text-[#F4F7FB] group-hover:text-[#00daf3]">
                          Evidence Vault
                        </div>
                        <div className="text-[10px] font-mono-data text-[#8A94A6]">
                          NIST SP 800-86 Hash Chain
                        </div>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-[#8A94A6] group-hover:text-[#00daf3] group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </div>
              </div>
            )}

            {/* 2. FORENSIC TIMELINE TAB */}
            {currentTab === 'forensic-timeline' && (
              <ForensicTimelineView
                timeline={currentInvestigation.timeline}
                campaignId={currentInvestigation.title}
                rawHeaders={currentInvestigation.rawHeaders}
              />
            )}

            {/* 3. ATTACK GRAPH TAB */}
            {currentTab === 'attack-graph' && (
              <AttackGraphView
                nodes={currentInvestigation.attackNodes}
                edges={currentInvestigation.attackEdges}
              />
            )}

            {/* 4. OVERVIEW DASHBOARD */}
            {currentTab === 'overview' && (
              <OverviewView
                currentInvestigation={currentInvestigation}
                history={history}
                onOpenInvestigation={() => setCurrentTab('investigations')}
                onSelectInvestigation={handleSelectHistoryItem}
                onNewInvestigation={handleNewInvestigation}
              />
            )}

            {/* 5. EVIDENCE VAULT TAB */}
            {currentTab === 'evidence' && (
              <EvidenceView
                items={currentInvestigation.evidenceItems}
                caseId={currentInvestigation.id}
              />
            )}

            {/* 6. SETTINGS TAB */}
            {currentTab === 'settings' && <SettingsView />}

            {/* 7. ANALYST PROFILE TAB */}
            {currentTab === 'profile' && (
              <ProfileView
                onNavigateTab={(tab) => setCurrentTab(tab as NavTab)}
                onOpenNewInvestigation={handleNewInvestigation}
              />
            )}

            {/* 8. REPORTS TAB */}
            {currentTab === 'reports' && (
              <div className="w-full max-w-[1200px] mx-auto p-4 sm:p-6 lg:p-10 pb-20 space-y-6">
                <div className="bg-[#0B0F16]/90 backdrop-blur-md p-6 sm:p-8 rounded-lg hud-border space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#202B3C] pb-6">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="px-2 py-0.5 rounded bg-[#00daf3]/10 text-[#00daf3] border border-[#00daf3]/30 text-[10px] font-mono-data font-bold">
                          COMPLIANCE READY
                        </span>
                        <span className="text-xs text-[#8A94A6] font-mono-data">NIST SP 800-86</span>
                      </div>
                      <h3 className="font-headline text-xl sm:text-2xl font-bold text-[#F4F7FB]">
                        Executive &amp; Forensic Threat Reports
                      </h3>
                      <p className="text-xs sm:text-sm text-[#8A94A6] font-normal mt-1 max-w-xl">
                        Generate official SOC forensic audit documents containing cryptographic hashes,
                        MIME provenance, URL detonation intelligence, and chronological timeline logs.
                      </p>
                    </div>

                    <button
                      onClick={handleExportReport}
                      disabled={isExporting}
                      className="bg-[#00daf3] text-[#090B10] px-5 py-3 rounded font-mono-data text-xs sm:text-sm font-bold hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2 shrink-0 min-h-[44px]"
                    >
                      <FileDown className={`w-4 h-4 ${isExporting ? 'animate-bounce' : ''}`} />
                      <span>{isExporting ? 'Generating Document...' : 'Export Case Report (PDF)'}</span>
                    </button>
                  </div>

                  {/* Active Investigation Snapshot */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-[#1a1b21] p-4 rounded border border-[#202B3C]">
                      <span className="text-[10px] font-mono-data text-[#8A94A6] uppercase block mb-1">
                        Active Case ID
                      </span>
                      <span className="text-sm font-mono-data font-bold text-[#F4F7FB]">
                        {currentInvestigation.id}
                      </span>
                      <p className="text-xs text-[#8A94A6] truncate mt-1">{currentInvestigation.title}</p>
                    </div>

                    <div className="bg-[#1a1b21] p-4 rounded border border-[#202B3C]">
                      <span className="text-[10px] font-mono-data text-[#8A94A6] uppercase block mb-1">
                        Risk Verdict &amp; Score
                      </span>
                      <span className={`text-sm font-mono-data font-bold ${
                        currentInvestigation.verdict === 'MALICIOUS' ? 'text-[#FF3D00]' : 'text-[#00E676]'
                      }`}>
                        {currentInvestigation.verdict} ({currentInvestigation.riskScore}/100)
                      </span>
                      <p className="text-xs text-[#8A94A6] mt-1">Confidence: {currentInvestigation.confidence} ({currentInvestigation.confidencePercentage}%)</p>
                    </div>

                    <div className="bg-[#1a1b21] p-4 rounded border border-[#202B3C]">
                      <span className="text-[10px] font-mono-data text-[#8A94A6] uppercase block mb-1">
                        Detonated URLs &amp; Vectors
                      </span>
                      <span className="text-sm font-mono-data font-bold text-[#00daf3]">
                        {currentInvestigation.urls.length} URLs Analyzed
                      </span>
                      <p className="text-xs text-[#8A94A6] mt-1">{currentInvestigation.timeline.length} Forensic Events</p>
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-2">
                    <button
                      onClick={() => setCurrentTab('investigations')}
                      className="text-xs font-mono-data text-[#00daf3] hover:underline flex items-center gap-1"
                    >
                      ← Return to Live Investigation Analysis
                    </button>
                    <span className="text-[11px] font-mono-data text-[#8A94A6]">
                      Format: Portable Document Format (PDF/A)
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* 9. AWARENESS & PRECAUTIONS TAB */}
            {currentTab === 'awareness' && <AwarenessView />}

            {/* 10. INFRASTRUCTURE TAB */}
            {currentTab === 'infrastructure' && (
              <>
                <GisIntelligenceView geoLocations={currentInvestigation.geoLocations || []} />
                <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10 pb-20 -mt-2">
                  <ThreatIntelPanel providers={currentInvestigation.threatIntelProviders || []} />
                </div>
              </>
            )}
          </main>
        </div>
      </div>

      {/* Real AI Cybersecurity Investigation Assistant */}
      <AiSecurityAssistant currentInvestigation={currentInvestigation} />

      {/* Floating Download / Success Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-fade-in-up bg-[#090B10]/95 border border-[#00daf3] rounded-lg p-4 backdrop-blur-md flex items-center gap-3 max-w-md">
          <div className="w-8 h-8 rounded bg-[#00daf3]/20 border border-[#00daf3] flex items-center justify-center text-[#00daf3] shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-mono-data font-bold text-[#00daf3] uppercase">
              Forensic Notification
            </div>
            <p className="text-xs text-[#e2e2e9]">{toastMessage}</p>
          </div>
          <button
            onClick={() => setToastMessage(null)}
            className="text-[#8A94A6] hover:text-[#e2e2e9] text-xs ml-2"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}

export default App;
