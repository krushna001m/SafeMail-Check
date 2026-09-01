import React, { useState, useRef, useEffect } from 'react';
import { Menu, Plus, User as UserIcon, Shield, ChevronRight, LogOut, Settings, UserCheck, ChevronDown, Lock } from 'lucide-react';
import { NavTab, ThreatVerdict } from '../types';
import { useAuth } from '../context/AuthContext';

interface TopHeaderProps {
  currentTab: NavTab;
  riskScore: number;
  verdict: ThreatVerdict;
  confidence: string;
  onOpenMobileMenu: () => void;
  onNewInvestigation: () => void;
  onSelectTab?: (tab: NavTab) => void;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  currentTab,
  riskScore,
  verdict,
  confidence,
  onOpenMobileMenu,
  onNewInvestigation,
  onSelectTab,
}) => {
  const { user, isAuthenticated, logout, setAuthView } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getVerdictColors = (v: ThreatVerdict) => {
    switch (v) {
      case 'MALICIOUS':
        return {
          text: 'text-[#FF3D00]',
          stroke: '#FF3D00',
          bg: 'bg-[#FF3D00]/10',
          border: 'border-[#FF3D00]/30',
        };
      case 'SUSPICIOUS':
        return {
          text: 'text-[#FFC107]',
          stroke: '#FFC107',
          bg: 'bg-[#FFC107]/10',
          border: 'border-[#FFC107]/30',
        };
      case 'SAFE':
      case 'CLEAN':
        return {
          text: 'text-[#00E676]',
          stroke: '#00E676',
          bg: 'bg-[#00E676]/10',
          border: 'border-[#00E676]/30',
        };
    }
  };

  const vColors = getVerdictColors(verdict);
  const strokeDashoffset = 100 - riskScore;

  const tabTitles: Record<NavTab, { title: string; subtitle: string }> = {
    overview: { title: 'Safety Overview', subtitle: 'See what is happening across your email checks, risks, and recent cases in simple terms.' },
    investigations: { title: 'Analyze suspicious email', subtitle: 'Start a clear investigation from a raw email file or suspicious message sample.' },
    infrastructure: { title: 'Location and sender check', subtitle: 'Review where a sender or message appears to be coming from and how it is connected.' },
    'attack-graph': { title: 'Threat path map', subtitle: 'See how an email, sender, domain, and links are connected in one view.' },
    'forensic-timeline': { title: 'What happened and when', subtitle: 'Follow the timeline to understand how the message moved through the system.' },
    evidence: { title: 'Evidence and findings', subtitle: 'Review the technical proof, hashes, and findings in a simpler format.' },
    reports: { title: 'Reports', subtitle: 'Create a simple summary and export-ready briefing for review.' },
    awareness: { title: 'Awareness & Precautions', subtitle: 'Learn the simple steps to protect yourself and your team from scams and phishing.' },
    settings: { title: 'Safety settings', subtitle: 'Adjust the tools and preferences that help you review risk levels and security checks.' },
    profile: { title: 'Analyst profile', subtitle: 'View your account details, settings, and recent activity in one place.' },
  };

  const currentInfo = tabTitles[currentTab] || tabTitles.investigations;

  const getInitials = (name?: string) => {
    if (!name) return 'SA';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <>
      {/* Mobile Top Navbar (Visible only on < lg screens) */}
      <div className="lg:hidden sticky top-0 z-30 bg-[#090B10]/95 backdrop-blur-md border-b border-[#202B3C] px-3 py-2.5 flex items-center justify-between w-full">
        <div className="flex items-center gap-2.5">
          <button
            onClick={onOpenMobileMenu}
            className="text-[#8A94A6] hover:text-[#00daf3] p-2 rounded-lg bg-[#1a1b21] border border-[#202B3C] min-h-[44px] min-w-[44px] flex items-center justify-center transition-colors"
            aria-label="Open SOC menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-[#00daf3] flex items-center justify-center text-[#090B10]">
              <Shield className="w-3.5 h-3.5 fill-current" />
            </div>
            <span className="font-headline text-sm font-bold text-[#00daf3] tracking-wide">
              SafeMail Check
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isAuthenticated ? (
            <button
              onClick={() => onSelectTab && onSelectTab('profile')}
              className="w-9 h-9 rounded-full bg-[#00daf3]/20 border border-[#00daf3]/50 text-[#00daf3] font-mono-data text-xs font-bold flex items-center justify-center min-h-[38px] min-w-[38px]"
              aria-label="View Profile"
            >
              {getInitials(user?.name)}
            </button>
          ) : (
            <button
              onClick={() => setAuthView('login')}
              className="px-2.5 py-1.5 rounded bg-[#00daf3] text-[#090B10] font-mono-data text-xs font-bold min-h-[38px]"
            >
              Sign In
            </button>
          )}

          <button
            onClick={onNewInvestigation}
            className="bg-transparent border border-[#00daf3] text-[#00daf3] hover:bg-[#00daf3] hover:text-[#090B10] transition-colors py-1.5 px-2.5 rounded font-mono-data text-xs flex items-center justify-center gap-1 min-h-[38px] font-semibold"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New</span>
          </button>

          {/* Mini score badge on mobile bar */}
          <div className={`px-2 py-1 rounded font-mono-data text-xs font-bold border ${vColors.bg} ${vColors.text} ${vColors.border}`}>
            {riskScore}/100
          </div>
        </div>
      </div>

      {/* Main Header Component */}
      <header className="sticky top-0 z-20 bg-[#090B10]/85 backdrop-blur-md border-b border-[#202B3C] px-4 sm:px-6 lg:px-10 py-4 lg:py-5 flex flex-col md:flex-row md:items-end justify-between gap-4">
        {/* Left: Breadcrumb & Title */}
        <div className="w-full md:w-auto">
          <div className="flex items-center gap-1.5 font-mono-data text-xs text-[#8A94A6] mb-1.5 overflow-x-auto whitespace-nowrap scrollbar-hide">
            <span className="hover:text-[#00daf3] cursor-pointer transition-colors">WORKSPACE</span>
            <ChevronRight className="w-3.5 h-3.5 text-[#8A94A6]" />
            <span className="text-[#00daf3] uppercase font-semibold">
              {currentTab.replace('-', ' ')}
            </span>
          </div>
          <h2 className="font-headline text-xl sm:text-2xl lg:text-3xl font-bold text-[#F4F7FB] tracking-tight m-0">
            {currentInfo.title}
          </h2>
          <p className="text-[#8A94A6] text-xs sm:text-sm mt-1 max-w-2xl font-normal">
            {currentInfo.subtitle}
          </p>
        </div>

        {/* Right: Threat Verdict & User Account Controls */}
        <div className="flex items-center justify-between md:justify-end gap-4 sm:gap-6 border-t md:border-t-0 border-[#202B3C]/60 pt-3 md:pt-0">
          <div className="text-right">
            <div className={`text-xs sm:text-sm font-mono-data font-bold uppercase ${vColors.text}`}>
              Final Verdict: {verdict}
            </div>
            <div className="text-[#8A94A6] text-[11px] sm:text-xs">
              Confidence Level: <span className="text-[#e2e2e9] font-medium">{confidence}</span>
            </div>
          </div>

          {/* Circular SVG Gauge - Responsive sizing */}
          <div className="relative w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 flex items-center justify-center shrink-0">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-[#1e1f25]"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="currentColor"
                strokeWidth="3.2"
              />
              <path
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke={vColors.stroke}
                strokeWidth="3.2"
                strokeDasharray="100, 100"
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center font-mono-data leading-none">
              <span className={`text-sm sm:text-base lg:text-lg font-bold ${vColors.text}`}>
                {riskScore}
              </span>
              <span className="text-[7px] sm:text-[8px] text-[#8A94A6]">/100</span>
            </div>
          </div>

          {/* User Profile Avatar & Dropdown */}
          <div className="relative" ref={dropdownRef}>
            {isAuthenticated ? (
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2.5 p-1.5 rounded-lg bg-[#121824] border border-[#202B3C] hover:border-[#00daf3] transition-all min-h-[44px]"
                aria-label="User Account Menu"
              >
                <div className="w-8 h-8 rounded-full bg-[#00daf3]/20 border border-[#00daf3]/60 flex items-center justify-center text-xs font-mono-data font-bold text-[#00daf3]">
                  {getInitials(user?.name)}
                </div>
                <div className="hidden xl:block text-left pr-1">
                  <div className="text-xs font-bold text-[#F4F7FB] truncate max-w-[110px] leading-tight">
                    {user?.name}
                  </div>
                  <div className="text-[10px] text-[#8A94A6] font-mono-data">
                    {user?.role || 'SOC Analyst'}
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-[#8A94A6] hidden sm:block" />
              </button>
            ) : (
              <button
                onClick={() => setAuthView('login')}
                className="px-4 py-2 rounded-lg bg-[#00daf3] text-[#090B10] font-mono-data text-xs font-bold hover:brightness-110 transition-all flex items-center gap-1.5 min-h-[44px]"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </button>
            )}

            {/* Dropdown Menu */}
            {dropdownOpen && isAuthenticated && (
              <div className="absolute right-0 mt-2 w-64 bg-[#0B0F16] border border-[#202B3C] rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.8)] py-2 z-50 animate-fade-in text-xs font-mono-data">
                {/* User Identity Details */}
                <div className="px-4 py-3 border-b border-[#202B3C] bg-[#121824]/50">
                  <div className="font-bold text-[#F4F7FB] text-sm">{user?.name}</div>
                  <div className="text-[#8A94A6] text-[11px] truncate">{user?.email}</div>
                  <div className="mt-1 flex items-center gap-1.5">
                    <span className="px-1.5 py-0.5 rounded bg-[#00daf3]/10 text-[#00daf3] text-[9px] font-bold border border-[#00daf3]/30">
                      {user?.role}
                    </span>
                    <span className="text-[#00E676] text-[10px]">● Active</span>
                  </div>
                </div>

                <div className="py-1">
                  <button
                    onClick={() => {
                      setDropdownOpen(false);
                      if (onSelectTab) onSelectTab('profile');
                    }}
                    className="w-full px-4 py-2.5 text-left text-[#F4F7FB] hover:bg-[#1A2333] hover:text-[#00daf3] flex items-center gap-2.5 transition-colors"
                  >
                    <UserCheck className="w-4 h-4 text-[#00daf3]" />
                    <span>View Analyst Profile</span>
                  </button>

                  <button
                    onClick={() => {
                      setDropdownOpen(false);
                      if (onSelectTab) onSelectTab('settings');
                    }}
                    className="w-full px-4 py-2.5 text-left text-[#F4F7FB] hover:bg-[#1A2333] hover:text-[#00daf3] flex items-center gap-2.5 transition-colors"
                  >
                    <Settings className="w-4 h-4 text-[#00daf3]" />
                    <span>Security &amp; Password Settings</span>
                  </button>
                </div>

                <div className="border-t border-[#202B3C] pt-1 mt-1">
                  <button
                    onClick={() => {
                      setDropdownOpen(false);
                      logout();
                    }}
                    className="w-full px-4 py-2.5 text-left text-[#FF5722] hover:bg-[#FF3D00]/10 flex items-center gap-2.5 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out of TraceMail</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>
    </>
  );
};

