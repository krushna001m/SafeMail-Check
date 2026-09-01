export type NavTab = 
  | 'overview'
  | 'investigations'
  | 'infrastructure'
  | 'attack-graph'
  | 'forensic-timeline'
  | 'evidence'
  | 'reports'
  | 'awareness'
  | 'settings'
  | 'profile';

export type AuthView = 'login' | 'register' | 'forgot-password' | 'reset-password';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'SOC Analyst' | 'Security Engineer' | 'Threat Hunter' | 'Administrator' | string;
  organization?: string;
  accountStatus: 'ACTIVE' | 'SUSPENDED' | 'PENDING_VERIFICATION' | string;
  createdAt: string;
  lastLoginAt?: string;
  totalAnalyses?: number;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  sessionExpired: boolean;
}

export interface ApiErrorResponse {
  timestamp: string;
  status: number;
  code: string;
  message: string;
  path: string;
}

export type ThreatVerdict = 'MALICIOUS' | 'SUSPICIOUS' | 'SAFE' | 'CLEAN';

export type TimelineEventState = 'NORMAL' | 'WARNING' | 'CRITICAL' | 'INFO' | 'FAILED' | 'UNKNOWN';

export interface PipelineStage {
  id: string;
  number: string;
  name: string;
  status: 'completed' | 'running' | 'queued' | 'error';
  duration?: string;
  details?: string;
}

export interface UrlScanItem {
  id: string;
  url: string;
  status: 'SAFE' | 'MALICIOUS' | 'SUSPICIOUS';
  reputationScore: number;
  redirectPath: string[];
  destinationIp?: string;
  asn?: string;
  tags?: string[];
  threatType?: string;
}

export interface ThreatIndicator {
  id: string;
  type: 'danger' | 'warning' | 'info';
  title: string;
  description: string;
  icon: string;
}

export interface TimelineEvent {
  id: string;
  time: string;
  title: string;
  stepName?: string;
  category: 'email' | 'network' | 'system' | 'auth' | 'intelligence' | 'verdict';
  state?: TimelineEventState;
  source?: string;
  evidenceRef?: string;
  confidence?: number;
  description: string;
  verdict?: 'Suspicious' | 'Malicious' | 'Safe' | 'Neutral';
  tags: { label: string; value?: string; color?: string }[];
  icon: string;
  metadata?: {
    originIp?: string;
    claimedDomain?: string;
    spfResult?: string;
    dkimResult?: string;
    dmarcResult?: string;
    returnPath?: string;
    geo?: string;
    asn?: string;
    dnsRecord?: string;
    mlModel?: string;
    confidenceScore?: string;
  };
  rawHeaderSnippet?: string;
}

export type AttackNodeType = 
  | 'EMAIL' 
  | 'SENDER' 
  | 'DOMAIN' 
  | 'IP_ADDRESS' 
  | 'URL' 
  | 'DNS' 
  | 'LOCATION' 
  | 'ATTACHMENT' 
  | 'THREAT_INDICATOR' 
  | 'THREAT_INTELLIGENCE';

export interface AttackNode {
  id: string;
  type: AttackNodeType;
  label: string;
  identifier: string;
  status: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'CLEAN' | 'UNKNOWN';
  severityColor: string;
  x: number;
  y: number;
  isAttackPath?: boolean;
  evidenceId?: string;
  details: {
    description: string;
    source: string;
    ip?: string;
    asn?: string;
    reputation?: string;
    country?: string;
    timestamp?: string;
    riskScore?: number;
    hash?: string;
  };
}

export interface AttackEdge {
  id: string;
  source: string;
  target: string;
  label: string;
  isAttackPath?: boolean;
  type?: 'delivered_by' | 'resolves_to' | 'redirects_to' | 'originates_from' | 'triggers_indicator' | 'dns_tunnel_to' | 'verified_by';
}

export interface EvidenceItem {
  id: string;
  title: string;
  type: 'RFC5322_HEADER' | 'DKIM_SIGNATURE' | 'SPF_RECORD' | 'DMARC_POLICY' | 'DNS_A_RECORD' | 'URL_DETONATION' | 'C2_BEACON_LOG' | 'TLS_CERTIFICATE';
  source: string;
  collectedAt: string;
  sha256: string;
  previousHash: string;
  integrityStatus: 'VERIFIED' | 'INTEGRITY COMPROMISED';
  confidence: number;
  rawData: string;
  structuredSummary: Record<string, string>;
  tags: string[];
}

export interface ContributingFactor {
  id: string;
  factor: string;
  category: 'authentication' | 'reputation' | 'nlp' | 'network' | 'sandbox';
  contributionPercent: number;
  weight: 'HIGH' | 'MEDIUM' | 'LOW';
  explanation: string;
}

export interface ThreatIntelProvider {
  id: string;
  name: string;
  category: 'Reputation Feed' | 'Sandbox' | 'DNS Intel' | 'Spam DB' | 'Threat Graph';
  status: 'MALICIOUS' | 'SUSPICIOUS' | 'CLEAN' | 'NOT AVAILABLE';
  score?: string;
  details: string;
  // 'connectionStatus' reflects whether an actual API call was made and
  // succeeded. The UI must render "Integration not configured" for
  // NOT_CONFIGURED providers rather than implying live connectivity.
  connectionStatus: 'CONNECTED' | 'NOT_CONFIGURED' | 'UNAVAILABLE' | 'ERROR';
  lastSync: string;
}

export interface GeoLocationResult {
  ip: string;
  status: 'RESOLVED' | 'UNAVAILABLE' | 'ERROR';
  country?: string;
  region?: string;
  city?: string;
  latitude?: number;
  longitude?: number;
  isp?: string;
  organization?: string;
  asn?: string;
}

export interface InvestigationData {
  id: string;
  title: string;
  sourceFile: string;
  timestamp: string;
  sender: string;
  subject: string;
  riskScore: number;
  verdict: ThreatVerdict;
  confidence: 'High' | 'Medium' | 'Low';
  confidencePercentage: number;
  domainAge: string;
  domainCreated: string;
  reputation: string;
  trustScore: number;
  geoLocations: GeoLocationResult[];
  authStatus: {
    spf: 'PASS' | 'FAIL' | 'SOFTFAIL' | 'NEUTRAL' | 'NONE' | 'UNKNOWN';
    // DKIM is deliberately more granular than PASS/FAIL: a signature header
    // being present is not the same as having cryptographically verified it.
    // See server/emailParser.ts for how each state is derived.
    dkim: 'VERIFIED' | 'FAIL' | 'SIGNATURE_PRESENT_UNVERIFIED' | 'SELECTOR_NOT_FOUND' | 'NOT_SIGNED';
    dmarc: 'PASS' | 'REJECT' | 'QUARANTINE' | 'NONE' | 'UNKNOWN';
  };
  stages: PipelineStage[];
  urls: UrlScanItem[];
  indicators: ThreatIndicator[];
  timeline: TimelineEvent[];
  rawHeaders: string;
  evidenceItems: EvidenceItem[];
  attackNodes: AttackNode[];
  attackEdges: AttackEdge[];
  contributingFactors: ContributingFactor[];
  threatIntelProviders: ThreatIntelProvider[];
  stats: {
    totalUrls: number;
    maliciousUrls: number;
    safeUrls: number;
    attachmentsCount: number;
    hopCount: number;
    evidenceCount: number;
    ipCount: number;
    domainCount: number;
  };
}

export interface AiChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  sources?: string[];
  recommendations?: string[];
  confidence?: string;
  explanationType?: 'simple' | 'technical';
  mode?: 'INVESTIGATION_AWARE' | 'DETERMINISTIC_EXPLANATION';
}

export interface AiChatResponse {
  answer: string;
  sources?: string[];
  recommendations?: string[];
  confidence?: string;
  analysisId: string;
  explanationType?: 'simple' | 'technical';
  mode: 'INVESTIGATION_AWARE' | 'DETERMINISTIC_EXPLANATION';
}

