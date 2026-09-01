import React from 'react';
import { 
  Shield, 
  Plus, 
  LayoutDashboard, 
  SearchCode, 
  Server, 
  Network, 
  History, 
  FileText, 
  BarChart3, 
  Settings, 
  UserCheck, 
  CheckCircle2, 
  X,
  User as UserIcon,
  LogOut,
  Lock,
  ShieldAlert
} from 'lucide-react';
import { NavTab } from '../types';
import { useAuth } from '../context/AuthContext';

interface SidebarNavProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  onNewInvestigation: () => void;
}

export const SidebarNav: React.FC<SidebarNavProps> = ({
  currentTab,
  onSelectTab,
  isOpenMobile,
  onCloseMobile,
  onNewInvestigation,
}) => {
  const { user, isAuthenticated, logout, setAuthView } = useAuth();

  const navItems: { id: NavTab; label: string; icon: React.ReactNode }[] = [
    { id: 'overview', label: 'Overview', icon: <LayoutDashboard className="w-5 h-5" /> },
    { id: 'investigations', label: 'Investigations', icon: <SearchCode className="w-5 h-5" /> },
    { id: 'infrastructure', label: 'Location Check', icon: <Server className="w-5 h-5" /> },
    { id: 'attack-graph', label: 'Threat Paths', icon: <Network className="w-5 h-5" /> },
    { id: 'forensic-timeline', label: 'Timeline', icon: <History className="w-5 h-5" /> },
    { id: 'evidence', label: 'Evidence', icon: <FileText className="w-5 h-5" /> },
    { id: 'reports', label: 'Reports', icon: <BarChart3 className="w-5 h-5" /> },
    { id: 'awareness', label: 'Awareness & Precautions', icon: <ShieldAlert className="w-5 h-5" /> },
    { id: 'profile', label: 'Analyst Profile', icon: <UserIcon className="w-5 h-5" /> },
    { id: 'settings', label: 'Settings', icon: <Settings className="w-5 h-5" /> },
  ];

  const handleTabClick = (tab: NavTab) => {
    onSelectTab(tab);
    onCloseMobile();
  };

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
      {/* Mobile Backdrop Overlay */}
      {isOpenMobile && (
        <div
          id="mobile-menu-overlay"
          onClick={onCloseMobile}
          className="fixed inset-0 bg-black/75 z-40 lg:hidden backdrop-blur-sm transition-opacity duration-300"
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <nav
        id="sidebar-nav"
        className={`fixed top-0 bottom-0 z-50 h-full w-[260px] bg-[#0c0e13]/95 lg:bg-[#0c0e13]/85 backdrop-blur-md border-r border-[#202B3C] flex flex-col py-5 px-3 transition-transform duration-300 ease-in-out shadow-2xl lg:shadow-none ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } left-0`}
      >
        {/* Header Branding */}
        <div className="px-3 mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded bg-[#00daf3] flex items-center justify-center text-[#090B10]">
                <Shield className="w-5 h-5 fill-current" />
              </div>
              <div>
                <h1 className="font-headline text-lg font-bold text-[#00daf3] m-0 leading-tight">
                  SafeMail Check
                </h1>
                <span className="font-mono-data text-[10px] text-[#8A94A6] uppercase tracking-wider block">
                  Email Safety Center
                </span>
              </div>
            </div>

            {/* Mobile Close Button */}
            <button
              onClick={onCloseMobile}
              className="lg:hidden text-[#8A94A6] hover:text-[#00daf3] p-1.5 rounded-lg hover:bg-[#1e1f25] min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-label="Close navigation"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* New Investigation Button */}
          <button
            onClick={() => {
              onNewInvestigation();
              onCloseMobile();
            }}
            className="w-full mt-4 bg-transparent border border-[#00daf3] text-[#00daf3] hover:bg-[#00daf3] hover:text-[#090B10] transition-all duration-200 py-2.5 px-3 rounded font-mono-data text-xs flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] min-h-[44px] font-semibold"
          >
            <Plus className="w-4 h-4" />
            <span>New Investigation</span>
          </button>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto px-1 space-y-1 scrollbar-hide">
          {navItems.map((item) => {
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleTabClick(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg font-mono-data text-xs transition-all duration-150 active:scale-[0.98] min-h-[44px] text-left group ${
                  isActive
                    ? 'text-[#00daf3] bg-[#1a1b21] border-l-2 border-[#00daf3] font-semibold shadow-[inset_0_0_12px_rgba(0,218,243,0.08)]'
                    : 'text-[#8A94A6] hover:bg-[#1e1f25] hover:text-[#e2e2e9]'
                }`}
              >
                <span
                  className={`transition-colors ${
                    isActive ? 'text-[#00daf3]' : 'group-hover:text-[#00daf3]'
                  }`}
                >
                  {item.icon}
                </span>
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* User Account & System Status Footer */}
        <div className="px-1 mt-auto pt-3 border-t border-[#202B3C] space-y-2">
          {isAuthenticated && user ? (
            <div className="p-2.5 rounded-lg bg-[#121824] border border-[#202B3C] flex items-center justify-between gap-2">
              <button
                onClick={() => handleTabClick('profile')}
                className="flex items-center gap-2.5 text-left min-w-0 flex-1 hover:opacity-80 transition-opacity"
              >
                <div className="w-7 h-7 rounded-full bg-[#00daf3]/20 border border-[#00daf3]/50 text-[#00daf3] font-mono-data text-[11px] font-bold flex items-center justify-center shrink-0">
                  {getInitials(user.name)}
                </div>
                <div className="truncate">
                  <div className="text-xs font-bold text-[#F4F7FB] truncate leading-tight">
                    {user.name}
                  </div>
                  <div className="text-[10px] text-[#8A94A6] font-mono-data truncate">
                    {user.role}
                  </div>
                </div>
              </button>

              <button
                onClick={() => {
                  logout();
                  onCloseMobile();
                }}
                className="p-1.5 rounded text-[#8A94A6] hover:text-[#FF5722] hover:bg-[#1A2333] transition-colors shrink-0"
                title="Sign Out"
                aria-label="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => {
                setAuthView('login');
                onCloseMobile();
              }}
              className="w-full py-2 px-3 rounded-lg bg-[#00daf3]/10 hover:bg-[#00daf3]/20 border border-[#00daf3]/30 text-[#00daf3] font-mono-data text-xs font-bold transition-all flex items-center justify-center gap-2 min-h-[40px]"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Analyst Sign In</span>
            </button>
          )}

          <div className="flex items-center gap-2.5 px-2 py-1 text-xs font-mono-data text-[#8A94A6]">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#00E676] shrink-0" />
            <div className="flex flex-col">
              <span className="text-[#00E676] font-medium text-[10px]">SOC Core Live</span>
              <span className="text-[9px] text-[#8A94A6]">Isolated Sandbox Active</span>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
};

