import React, { useState, useRef, useMemo } from 'react';
import { 
  Network, 
  ShieldAlert, 
  ArrowRight, 
  Server, 
  Globe, 
  Laptop, 
  Key, 
  RefreshCw, 
  ZoomIn, 
  ZoomOut, 
  Maximize2, 
  Minimize2, 
  SlidersHorizontal, 
  Crosshair, 
  Eye, 
  EyeOff, 
  Info, 
  Sparkles, 
  FileText, 
  MapPin, 
  X, 
  Layers,
  AlertTriangle,
  CheckCircle2,
  Lock
} from 'lucide-react';
import { AttackNode, AttackEdge, AttackNodeType } from '../types';

interface AttackGraphViewProps {
  nodes?: AttackNode[];
  edges?: AttackEdge[];
}

export const AttackGraphView: React.FC<AttackGraphViewProps> = ({
  nodes: propNodes,
  edges: propEdges,
}) => {
  // Default rich fallback if not passed directly
  const defaultNodes: AttackNode[] = [
    {
      id: 'node-email',
      type: 'EMAIL',
      label: 'Inbound Message',
      identifier: 'invoice_oct_2026.eml',
      status: 'CRITICAL',
      severityColor: '#FF3D00',
      x: 100,
      y: 220,
      isAttackPath: true,
      evidenceId: 'EV-001',
      details: {
        description: 'MIME email artifact targeting enterprise IT administrator with fake billing urgency.',
        source: 'Edge Mail Gateway (mx1.tracemail.ai)',
        timestamp: '2026-08-22 14:32:01 UTC',
        riskScore: 87,
        hash: '9f83c18b7a2d109f029384bcdae0192847561029384756102938475610293847'
      }
    },
    {
      id: 'node-sender',
      type: 'SENDER',
      label: 'Spoofed Sender',
      identifier: 'support@tracemail.ai',
      status: 'HIGH',
      severityColor: '#FFC107',
      x: 320,
      y: 110,
      isAttackPath: true,
      evidenceId: 'EV-003',
      details: {
        description: 'Claimed legitimate internal security desk address; Return-Path envelopes bounces@attacker-c2.net.',
        source: 'RFC5322 From Header',
        reputation: 'High Trust Spoofed'
      }
    },
    {
      id: 'node-domain',
      type: 'DOMAIN',
      label: 'Typosquat Domain',
      identifier: 'paypa1-verification.net',
      status: 'CRITICAL',
      severityColor: '#FF3D00',
      x: 540,
      y: 90,
      isAttackPath: true,
      evidenceId: 'EV-010',
      details: {
        description: 'Newly registered domain (< 24h old) mimicking PayPal brand with homoglyphs.',
        source: 'WHOIS & NRD Feed',
        country: 'RU - Moscow',
        reputation: '0/100 (Blacklisted)'
      }
    },
    {
      id: 'node-ip',
      type: 'IP_ADDRESS',
      label: 'Relay Host IP',
      identifier: '185.23.44.11',
      status: 'HIGH',
      severityColor: '#FFC107',
      x: 320,
      y: 250,
      isAttackPath: true,
      evidenceId: 'EV-004',
      details: {
        description: 'Originating SMTP transmission IP hosted under HostKey B.V. bulletproof autonomous system.',
        source: 'MaxMind GeoIP',
        ip: '185.23.44.11',
        asn: 'AS44533 HostKey B.V.',
        country: 'NL - Amsterdam',
        reputation: 'Abuse Confidence 92%'
      }
    },
    {
      id: 'node-dns',
      type: 'DNS',
      label: 'Covert Tunnel',
      identifier: 'dark-gate-c2.cc',
      status: 'CRITICAL',
      severityColor: '#FF3D00',
      x: 760,
      y: 90,
      isAttackPath: true,
      evidenceId: 'EV-005',
      details: {
        description: 'High-entropy DNS subdomain resolving commands from DarkGate malware botnet operator.',
        source: 'Suricata IDS Sensor',
        asn: 'AS200019 (Russian Fed)',
        reputation: 'Active Botnet C2'
      }
    },
    {
      id: 'node-url',
      type: 'URL',
      label: 'Shortened Link',
      identifier: 'bit.ly/secure-doc-update',
      status: 'CRITICAL',
      severityColor: '#FF3D00',
      x: 320,
      y: 380,
      isAttackPath: true,
      evidenceId: 'EV-004',
      details: {
        description: 'Bitly redirection link masking final destination credential harvester kit.',
        source: 'HTML Body Parser',
        reputation: '15/100 (Phishing)'
      }
    },
    {
      id: 'node-location',
      type: 'LOCATION',
      label: 'Adversary Geo',
      identifier: 'Amsterdam / Moscow',
      status: 'MEDIUM',
      severityColor: '#00daf3',
      x: 540,
      y: 250,
      isAttackPath: false,
      details: {
        description: 'Dual egress infrastructure correlated across Western Europe relay and Eastern European C2 nodes.',
        source: 'GeoIP DB',
        country: 'NL / RU'
      }
    },
    {
      id: 'node-indicator',
      type: 'THREAT_INDICATOR',
      label: 'Credential Harvester',
      identifier: 'T1566.002 Phish',
      status: 'CRITICAL',
      severityColor: '#FF3D00',
      x: 540,
      y: 380,
      isAttackPath: true,
      details: {
        description: 'MITRE ATT&CK technique match: Spearphishing link leading to Okta / M365 credential theft portal.',
        source: 'TraceMail AI Classifier',
        riskScore: 87
      }
    },
    {
      id: 'node-intel',
      type: 'THREAT_INTELLIGENCE',
      label: 'VirusTotal IOC Feed',
      identifier: 'VT 38/88 Detections',
      status: 'CRITICAL',
      severityColor: '#FF3D00',
      x: 760,
      y: 380,
      isAttackPath: true,
      details: {
        description: '38 out of 88 security vendors confirmed destination URL and binary drop as Trojan.DarkGate.',
        source: 'VirusTotal API',
        reputation: 'Confirmed Malicious'
      }
    }
  ];

  const defaultEdges: AttackEdge[] = [
    { id: 'e1', source: 'node-email', target: 'node-sender', label: 'claimed_from', isAttackPath: true, type: 'delivered_by' },
    { id: 'e2', source: 'node-sender', target: 'node-domain', label: 'spoofs_entity', isAttackPath: true, type: 'resolves_to' },
    { id: 'e3', source: 'node-email', target: 'node-ip', label: 'routed_via', isAttackPath: true, type: 'originates_from' },
    { id: 'e4', source: 'node-ip', target: 'node-location', label: 'geolocates_to', isAttackPath: false, type: 'originates_from' },
    { id: 'e5', source: 'node-domain', target: 'node-dns', label: 'tunnels_traffic', isAttackPath: true, type: 'dns_tunnel_to' },
    { id: 'e6', source: 'node-email', target: 'node-url', label: 'embeds_link', isAttackPath: true, type: 'redirects_to' },
    { id: 'e7', source: 'node-url', target: 'node-domain', label: 'redirects_to', isAttackPath: true, type: 'redirects_to' },
    { id: 'e8', source: 'node-url', target: 'node-indicator', label: 'detonates_to', isAttackPath: true, type: 'triggers_indicator' },
    { id: 'e9', source: 'node-indicator', target: 'node-intel', label: 'correlated_with', isAttackPath: true, type: 'verified_by' },
    { id: 'e10', source: 'node-dns', target: 'node-location', label: 'hosted_in', isAttackPath: false, type: 'originates_from' }
  ];

  const nodes = propNodes || defaultNodes;
  const edges = propEdges || defaultEdges;

  const [selectedNodeId, setSelectedNodeId] = useState<string>('node-domain');
  const [showAttackPath, setShowAttackPath] = useState<boolean>(true);
  const [filterType, setFilterType] = useState<string>('ALL');
  const [hideLowRisk, setHideLowRisk] = useState<boolean>(false);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const activeNode = nodes.find((n) => n.id === selectedNodeId) || nodes[0];

  // Connected nodes map for highlighting
  const connectedNodeIds = useMemo(() => {
    if (!selectedNodeId) return new Set<string>();
    const connected = new Set<string>([selectedNodeId]);
    edges.forEach((edge) => {
      if (edge.source === selectedNodeId) connected.add(edge.target);
      if (edge.target === selectedNodeId) connected.add(edge.source);
    });
    return connected;
  }, [selectedNodeId, edges]);

  // Filtered nodes
  const visibleNodes = useMemo(() => {
    return nodes.filter((node) => {
      if (hideLowRisk && (node.status === 'LOW' || node.status === 'CLEAN')) return false;
      if (filterType === 'ALL') return true;
      if (filterType === 'DOMAINS' && node.type === 'DOMAIN') return true;
      if (filterType === 'IPS' && (node.type === 'IP_ADDRESS' || node.type === 'LOCATION')) return true;
      if (filterType === 'URLS' && node.type === 'URL') return true;
      if (filterType === 'THREATS' && (node.type === 'THREAT_INDICATOR' || node.type === 'THREAT_INTELLIGENCE' || node.type === 'DNS')) return true;
      if (filterType === 'EVIDENCE' && node.evidenceId) return true;
      return false;
    });
  }, [nodes, filterType, hideLowRisk]);

  const visibleNodeIds = useMemo(() => new Set(visibleNodes.map((n) => n.id)), [visibleNodes]);

  // Filtered edges
  const visibleEdges = useMemo(() => {
    return edges.filter((edge) => visibleNodeIds.has(edge.source) && visibleNodeIds.has(edge.target));
  }, [edges, visibleNodeIds]);

  const getNodeIcon = (type: AttackNodeType) => {
    switch (type) {
      case 'EMAIL':
        return <Laptop className="w-4 h-4" />;
      case 'SENDER':
        return <Globe className="w-4 h-4" />;
      case 'DOMAIN':
        return <Globe className="w-4 h-4" />;
      case 'IP_ADDRESS':
        return <Server className="w-4 h-4" />;
      case 'DNS':
        return <Network className="w-4 h-4" />;
      case 'URL':
        return <Key className="w-4 h-4" />;
      case 'LOCATION':
        return <MapPin className="w-4 h-4" />;
      case 'THREAT_INDICATOR':
        return <AlertTriangle className="w-4 h-4" />;
      case 'THREAT_INTELLIGENCE':
        return <ShieldAlert className="w-4 h-4" />;
      case 'ATTACHMENT':
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPanOffset({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleResetView = () => {
    setZoomLevel(1);
    setPanOffset({ x: 0, y: 0 });
    setSelectedNodeId(nodes[0]?.id || '');
  };

  return (
    <div className="w-full max-w-[1600px] mx-auto p-3 sm:p-6 lg:p-10 pb-20 space-y-6">
      {/* Top Header & Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-[#0B0F16]/90 backdrop-blur-md p-4 sm:p-5 rounded-lg hud-border">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded bg-[#00daf3]/10 border border-[#00daf3]/30 flex items-center justify-center text-[#00daf3]">
            <Network className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono-data px-2 py-0.5 rounded bg-[#FF3D00]/10 text-[#FF3D00] border border-[#FF3D00]/30 font-bold">
                ATTACK GRAPH TOPOLOGY
              </span>
              <span className="text-xs font-mono-data text-[#8A94A6]">MITRE ATT&CK Matrix Correlated</span>
            </div>
            <h2 className="font-headline text-lg sm:text-xl font-bold text-[#F4F7FB] mt-0.5">
              Threat Relationship &amp; Infrastructure Graph
            </h2>
          </div>
        </div>

        {/* Action Controls & Attack Path Toggle */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Attack Path Toggle */}
          <button
            onClick={() => setShowAttackPath(!showAttackPath)}
            className={`px-3 py-2 rounded font-mono-data text-xs font-bold flex items-center gap-1.5 transition-all min-h-[38px] ${
              showAttackPath
                ? 'bg-[#FF3D00] text-white'
                : 'bg-[#1a1b21] text-[#8A94A6] hover:text-[#e2e2e9] border border-[#202B3C]'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{showAttackPath ? 'Attack Path: Active' : 'Show Attack Path'}</span>
          </button>

          {/* Hide Low-Risk Toggle */}
          <button
            onClick={() => setHideLowRisk(!hideLowRisk)}
            className={`px-3 py-2 rounded font-mono-data text-xs flex items-center gap-1.5 transition-colors border min-h-[38px] ${
              hideLowRisk
                ? 'bg-[#00daf3]/10 text-[#00daf3] border-[#00daf3]/40'
                : 'bg-[#1a1b21] text-[#8A94A6] border-[#202B3C] hover:text-[#e2e2e9]'
            }`}
          >
            {hideLowRisk ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            <span>Hide Low-Risk</span>
          </button>

          {/* Zoom In */}
          <button
            onClick={() => setZoomLevel((z) => Math.min(z + 0.15, 1.8))}
            className="p-2 rounded bg-[#1a1b21] text-[#8A94A6] hover:text-[#00daf3] border border-[#202B3C] transition-colors"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>

          {/* Zoom Out */}
          <button
            onClick={() => setZoomLevel((z) => Math.max(z - 0.15, 0.6))}
            className="p-2 rounded bg-[#1a1b21] text-[#8A94A6] hover:text-[#00daf3] border border-[#202B3C] transition-colors"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>

          {/* Reset View */}
          <button
            onClick={handleResetView}
            className="p-2 rounded bg-[#1a1b21] text-[#8A94A6] hover:text-[#00daf3] border border-[#202B3C] transition-colors"
            title="Center & Reset View"
          >
            <Crosshair className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Filter Tabs Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#0B0F16]/90 p-3 rounded-lg hud-border font-mono-data text-xs">
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide">
          <span className="text-[#8A94A6] text-[10px] uppercase mr-2 shrink-0">Filter Entities:</span>
          {['ALL', 'DOMAINS', 'IPS', 'URLS', 'THREATS', 'EVIDENCE'].map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-2.5 py-1 rounded text-[11px] uppercase transition-all shrink-0 min-h-[30px] ${
                filterType === type
                  ? 'bg-[#00daf3] text-[#090B10] font-bold'
                  : 'text-[#8A94A6] hover:text-[#e2e2e9] bg-[#1a1b21] border border-[#202B3C]'
              }`}
            >
              {type}
            </button>
          ))}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 text-[10px] text-[#8A94A6] overflow-x-auto scrollbar-hide">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#FF3D00]" /> Critical</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#FFC107]" /> Suspicious</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#00daf3]" /> Infrastructure</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#00E676]" /> Verified Clean</span>
        </div>
      </div>

      {/* Main Interactive Graph Canvas & Side Inspector Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* SVG Graph Interactive Canvas (8 cols on desktop) */}
        <div className="lg:col-span-8 bg-[#0B0F16]/95 rounded-lg hud-border p-2 sm:p-4 overflow-hidden relative min-h-[480px] sm:min-h-[560px] flex flex-col justify-between select-none">
          {/* Top HUD overlay info */}
          <div className="absolute top-4 left-4 z-10 pointer-events-none flex items-center gap-2">
            <span className="text-[10px] font-mono-data px-2 py-1 rounded bg-[#090B10]/80 backdrop-blur border border-[#202B3C] text-[#00daf3]">
              Zoom: {Math.round(zoomLevel * 100)}%
            </span>
            <span className="text-[10px] font-mono-data px-2 py-1 rounded bg-[#090B10]/80 backdrop-blur border border-[#202B3C] text-[#8A94A6]">
              {visibleNodes.length} Nodes Mapped
            </span>
          </div>

          {/* Interactive SVG Stage */}
          <div
            className="w-full h-[460px] sm:h-[520px] cursor-grab active:cursor-grabbing overflow-hidden relative rounded"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            <svg
              className="w-full h-full"
              viewBox="0 0 900 500"
              preserveAspectRatio="xMidYMid meet"
              style={{
                transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoomLevel})`,
                transformOrigin: 'center center',
                transition: isDragging ? 'none' : 'transform 0.15s ease-out',
              }}
            >
              {/* Background Cyber Grid */}
              <defs>
                <pattern id="graph-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#202B3C" strokeWidth="0.5" opacity="0.4" />
                </pattern>

                <linearGradient id="attack-beam" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#FF3D00" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#FFC107" stopOpacity="0.8" />
                </linearGradient>

                <filter id="glow-crimson" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>

              <rect width="900" height="500" fill="url(#graph-grid)" />

              {/* Render Edges / Connection Lines */}
              {visibleEdges.map((edge) => {
                const sourceNode = nodes.find((n) => n.id === edge.source);
                const targetNode = nodes.find((n) => n.id === edge.target);
                if (!sourceNode || !targetNode) return null;

                const isPathActive = showAttackPath && edge.isAttackPath;
                const isSelectedEdge =
                  selectedNodeId === edge.source || selectedNodeId === edge.target;

                return (
                  <g key={edge.id}>
                    {/* Background Line */}
                    <line
                      x1={sourceNode.x}
                      y1={sourceNode.y}
                      x2={targetNode.x}
                      y2={targetNode.y}
                      stroke={
                        isPathActive
                          ? '#FF3D00'
                          : isSelectedEdge
                          ? '#00daf3'
                          : '#202B3C'
                      }
                      strokeWidth={isPathActive ? 2.5 : isSelectedEdge ? 2 : 1}
                      strokeDasharray={isPathActive ? '4 4' : 'none'}
                      opacity={isSelectedEdge || isPathActive ? 1 : 0.4}
                      className={isPathActive ? 'animate-pulse' : ''}
                    />

                    {/* Edge Label Pill */}
                    <rect
                      x={(sourceNode.x + targetNode.x) / 2 - 35}
                      y={(sourceNode.y + targetNode.y) / 2 - 8}
                      width="70"
                      height="16"
                      rx="3"
                      fill="#090B10"
                      stroke={isPathActive ? '#FF3D00' : '#202B3C'}
                      strokeWidth="0.8"
                    />
                    <text
                      x={(sourceNode.x + targetNode.x) / 2}
                      y={(sourceNode.y + targetNode.y) / 2 + 3}
                      fill={isPathActive ? '#ffb4ab' : '#8A94A6'}
                      fontSize="7"
                      fontFamily="monospace"
                      textAnchor="middle"
                    >
                      {edge.label}
                    </text>
                  </g>
                );
              })}

              {/* Render Nodes */}
              {visibleNodes.map((node) => {
                const isSelected = selectedNodeId === node.id;
                const isConnected = connectedNodeIds.has(node.id);
                const isPath = showAttackPath && node.isAttackPath;

                return (
                  <g
                    key={node.id}
                    transform={`translate(${node.x}, ${node.y})`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedNodeId(node.id);
                    }}
                    className="cursor-pointer group"
                  >
                    {/* Outer Glow Halo for selected/attack path node */}
                    {isSelected && (
                      <circle
                        r="28"
                        fill="none"
                        stroke="#00daf3"
                        strokeWidth="1.5"
                        strokeDasharray="4 4"
                        className="animate-spin"
                        style={{ animationDuration: '6s' }}
                      />
                    )}

                    {/* Main Node Card Body */}
                    <rect
                      x="-65"
                      y="-22"
                      width="130"
                      height="44"
                      rx="6"
                      fill="#0B0F16"
                      stroke={
                        isSelected
                          ? '#00daf3'
                          : isPath
                          ? '#FF3D00'
                          : isConnected
                          ? '#00daf3'
                          : '#202B3C'
                      }
                      strokeWidth={isSelected ? 2 : isPath ? 1.5 : 1}
                      filter={isSelected ? 'url(#glow-crimson)' : 'none'}
                    />

                    {/* Left Icon Pill Box */}
                    <rect
                      x="-60"
                      y="-16"
                      width="30"
                      height="32"
                      rx="4"
                      fill={`${node.severityColor}20`}
                      stroke={node.severityColor}
                      strokeWidth="0.8"
                    />

                    {/* Node Type Text */}
                    <text
                      x="-22"
                      y="-6"
                      fill="#F4F7FB"
                      fontSize="9"
                      fontWeight="bold"
                      fontFamily="sans-serif"
                    >
                      {node.type}
                    </text>

                    {/* Node Identifier Text */}
                    <text
                      x="-22"
                      y="7"
                      fill={node.severityColor}
                      fontSize="7.5"
                      fontFamily="monospace"
                    >
                      {node.identifier.length > 15
                        ? `${node.identifier.slice(0, 14)}...`
                        : node.identifier}
                    </text>

                    {/* Severity Badge */}
                    <text
                      x="-22"
                      y="16"
                      fill="#8A94A6"
                      fontSize="6.5"
                      fontFamily="monospace"
                    >
                      {node.status}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Bottom Hint */}
          <div className="flex items-center justify-between text-[10px] font-mono-data text-[#8A94A6] pt-2 border-t border-[#202B3C]/60">
            <span>Click any node to inspect forensics and connected vectors</span>
            <span className="text-[#00daf3]">Drag to Pan • Click to Select</span>
          </div>
        </div>

        {/* Selected Node Deep Inspector Panel (4 cols on desktop) */}
        <div className="lg:col-span-4 bg-[#0B0F16]/95 backdrop-blur-md rounded-lg hud-border p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-[#202B3C] pb-3">
            <div className="flex items-center gap-2">
              <span
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: activeNode.severityColor }}
              />
              <h3 className="font-headline text-sm sm:text-base font-bold text-[#F4F7FB]">
                Node Forensics
              </h3>
            </div>
            <span
              className="text-[10px] font-mono-data px-2.5 py-0.5 rounded font-bold uppercase border"
              style={{
                borderColor: `${activeNode.severityColor}40`,
                backgroundColor: `${activeNode.severityColor}15`,
                color: activeNode.severityColor,
              }}
            >
              {activeNode.status} RISK
            </span>
          </div>

          {/* Node Summary Card */}
          <div className="bg-[#1a1b21] p-3.5 rounded border border-[#202B3C] space-y-2 font-mono-data text-xs">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-[#8A94A6] uppercase">ENTITY TYPE</span>
              <span className="text-[#00daf3] font-bold">{activeNode.type}</span>
            </div>
            <div>
              <span className="text-[10px] text-[#8A94A6] uppercase block mb-0.5">IDENTIFIER</span>
              <span className="text-[#F4F7FB] font-semibold break-all text-xs">
                {activeNode.identifier}
              </span>
            </div>
            {activeNode.details.source && (
              <div className="flex items-center justify-between pt-1 border-t border-[#202B3C]">
                <span className="text-[10px] text-[#8A94A6]">Source:</span>
                <span className="text-[#c3f5ff] text-[11px]">{activeNode.details.source}</span>
              </div>
            )}
            {activeNode.details.ip && (
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-[#8A94A6]">IP / Port:</span>
                <span className="text-[#e2e2e9] font-medium">{activeNode.details.ip}</span>
              </div>
            )}
            {activeNode.details.asn && (
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-[#8A94A6]">ASN Route:</span>
                <span className="text-[#00daf3] truncate max-w-[170px]">{activeNode.details.asn}</span>
              </div>
            )}
            {activeNode.details.country && (
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-[#8A94A6]">Location:</span>
                <span className="text-[#e2e2e9]">{activeNode.details.country}</span>
              </div>
            )}
            {activeNode.details.reputation && (
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-[#8A94A6]">Reputation:</span>
                <span className="text-[#FF3D00] font-semibold">{activeNode.details.reputation}</span>
              </div>
            )}
            {activeNode.evidenceId && (
              <div className="flex items-center justify-between pt-1 border-t border-[#202B3C]">
                <span className="text-[10px] text-[#8A94A6]">Evidence Lock:</span>
                <span className="text-[#00E676] font-semibold flex items-center gap-1">
                  <Lock className="w-3 h-3" /> {activeNode.evidenceId}
                </span>
              </div>
            )}
          </div>

          {/* Description / Threat Intelligence Breakdown */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-mono-data text-[#8A94A6] uppercase tracking-wider">
              CORRELATION TELEMETRY
            </span>
            <div className="p-3 bg-[#1a1b21]/80 rounded border border-[#202B3C] text-xs text-[#8A94A6] leading-relaxed font-mono-data">
              {activeNode.details.description}
            </div>
          </div>

          {/* Connected Entities Counter */}
          <div className="p-3 bg-[#090B10] rounded border border-[#202B3C] font-mono-data text-xs space-y-1.5">
            <div className="text-[10px] text-[#8A94A6] uppercase">CONNECTED GRAPH VECTORS</div>
            <div className="flex flex-wrap gap-1.5">
              {Array.from(connectedNodeIds)
                .filter((id) => id !== activeNode.id)
                .map((connId) => {
                  const target = nodes.find((n) => n.id === connId);
                  if (!target) return null;
                  return (
                    <button
                      key={connId}
                      onClick={() => setSelectedNodeId(connId)}
                      className="px-2 py-1 rounded bg-[#1a1b21] hover:bg-[#202B3C] border border-[#202B3C] text-[10px] text-[#00daf3] flex items-center gap-1 transition-colors"
                    >
                      <ArrowRight className="w-3 h-3" />
                      <span>{target.label}</span>
                    </button>
                  );
                })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
