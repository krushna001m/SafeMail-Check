import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  User,
  Shield,
  Building,
  Mail,
  Calendar,
  Clock,
  KeyRound,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Activity,
  Layers,
  Sparkles,
  Lock,
  Edit3,
  Save,
  LogOut,
  ExternalLink,
} from 'lucide-react';

interface ProfileViewProps {
  onNavigateTab: (tab: string) => void;
  onOpenNewInvestigation: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  onNavigateTab,
  onOpenNewInvestigation,
}) => {
  const { user, updateProfile, logout, setAuthView } = useAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [organization, setOrganization] = useState(user?.organization || '');
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  if (!user) {
    return (
      <div className="w-full max-w-4xl mx-auto p-4 sm:p-8 space-y-6">
        <div className="bg-[#0B0F16]/90 backdrop-blur-md p-8 rounded-xl border border-[#202B3C] text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-[#00daf3]/10 border border-[#00daf3]/30 flex items-center justify-center text-[#00daf3] mx-auto">
            <Shield className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-[#F4F7FB] font-headline">
            SOC Analyst Profile Authentication Required
          </h2>
          <p className="text-xs text-[#8A94A6] max-w-md mx-auto">
            Sign in to access your isolated investigations, security keys, and SOC organizational profile.
          </p>
          <button
            onClick={() => setAuthView('login')}
            className="px-6 py-3 bg-[#00daf3] text-[#090B10] font-mono-data font-bold text-xs rounded-lg hover:brightness-110 transition-all min-h-[44px]"
          >
            Sign In / Register Analyst Account
          </button>
        </div>
      </div>
    );
  }

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setStatusMessage({ text: 'Name cannot be empty.', type: 'error' });
      return;
    }

    setIsSaving(true);
    try {
      await updateProfile(name.trim(), organization.trim());
      setIsEditing(false);
      setStatusMessage({ text: 'Analyst profile details updated successfully.', type: 'success' });
      setTimeout(() => setStatusMessage(null), 4000);
    } catch (err: any) {
      setStatusMessage({ text: err.message || 'Failed to update profile.', type: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  const getInitials = (fullName: string) => {
    const parts = fullName.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return fullName.substring(0, 2).toUpperCase();
  };

  return (
    <div className="w-full max-w-[1400px] mx-auto p-4 sm:p-6 lg:p-10 pb-20 space-y-6">
      {/* Top Banner with Avatar & Identity */}
      <div className="bg-[#0B0F16]/90 backdrop-blur-md p-6 sm:p-8 rounded-xl hud-border relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#00daf3]/5 rounded-full blur-3xl pointer-events-none" />

        {statusMessage && (
          <div
            className={`mb-6 p-4 rounded-lg flex items-center gap-3 text-xs font-mono-data ${
              statusMessage.type === 'success'
                ? 'bg-[#00E676]/10 border border-[#00E676]/40 text-[#00E676]'
                : 'bg-[#FF3D00]/10 border border-[#FF3D00]/40 text-[#FF5722]'
            }`}
          >
            {statusMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 shrink-0" />
            )}
            <span>{statusMessage.text}</span>
          </div>
        )}

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-start sm:items-center gap-4 sm:gap-6">
            {/* Avatar Pill */}
            <div className="w-16 sm:w-20 h-16 sm:h-20 rounded-2xl bg-gradient-to-br from-[#00daf3]/20 to-[#004d57]/30 border-2 border-[#00daf3]/60 flex items-center justify-center text-xl sm:text-2xl font-bold font-mono-data text-[#00daf3] shrink-0">
              {getInitials(user.name)}
            </div>

            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold text-[#F4F7FB] font-headline">
                  {user.name}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full bg-[#00daf3]/15 text-[#00daf3] border border-[#00daf3]/40 text-[11px] font-mono-data font-bold">
                  {user.role}
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-[#00E676]/15 text-[#00E676] border border-[#00E676]/40 text-[11px] font-mono-data font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00E676] animate-pulse" />
                  {user.accountStatus}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-xs text-[#8A94A6] font-mono-data">
                <div className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-[#00daf3]" />
                  <span>{user.email}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5 text-[#00daf3]" />
                  <span>{user.organization || 'Security Operations Center'}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="px-4 py-2.5 rounded-lg bg-[#1A2333] hover:bg-[#202B3C] text-[#F4F7FB] border border-[#202B3C] font-mono-data text-xs font-bold transition-all flex items-center gap-2 min-h-[44px]"
            >
              <Edit3 className="w-3.5 h-3.5 text-[#00daf3]" />
              <span>{isEditing ? 'Cancel Edit' : 'Edit Profile'}</span>
            </button>

            <button
              onClick={logout}
              className="px-4 py-2.5 rounded-lg bg-[#FF3D00]/10 hover:bg-[#FF3D00]/20 text-[#FF5722] border border-[#FF3D00]/30 font-mono-data text-xs font-bold transition-all flex items-center gap-2 min-h-[44px]"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        {/* Profile Edit Form */}
        {isEditing && (
          <form onSubmit={handleSaveProfile} className="mt-6 pt-6 border-t border-[#202B3C] space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono-data font-bold text-[#8A94A6] mb-1.5 uppercase">
                  Full Name <span className="text-[#FF3D00]">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2.5 bg-[#121824] border border-[#202B3C] rounded-lg text-sm text-[#F4F7FB] focus:outline-none focus:border-[#00daf3] font-body"
                />
              </div>

              <div>
                <label className="block text-xs font-mono-data font-bold text-[#8A94A6] mb-1.5 uppercase">
                  Organization / Unit
                </label>
                <input
                  type="text"
                  value={organization}
                  onChange={(e) => setOrganization(e.target.value)}
                  className="w-full px-3 py-2.5 bg-[#121824] border border-[#202B3C] rounded-lg text-sm text-[#F4F7FB] focus:outline-none focus:border-[#00daf3] font-body"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 rounded-lg bg-[#121824] text-[#8A94A6] hover:text-[#F4F7FB] text-xs font-mono-data"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="px-5 py-2 rounded-lg bg-[#00daf3] text-[#090B10] font-mono-data text-xs font-bold hover:brightness-110 flex items-center gap-1.5"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{isSaving ? 'Saving...' : 'Save Profile Changes'}</span>
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Account Details & Security Scope Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: Account Telemetry */}
        <div className="bg-[#0B0F16]/90 p-6 rounded-xl border border-[#202B3C] space-y-4">
          <div className="flex items-center gap-2 border-b border-[#202B3C] pb-3">
            <Clock className="w-4 h-4 text-[#00daf3]" />
            <h3 className="font-headline text-sm font-bold text-[#F4F7FB] tracking-wide">
              Access &amp; Session Logs
            </h3>
          </div>

          <div className="space-y-3 text-xs font-mono-data">
            <div>
              <span className="text-[#8A94A6] text-[11px] block">Analyst Unique ID</span>
              <span className="text-[#F4F7FB] font-semibold">{user.id}</span>
            </div>

            <div>
              <span className="text-[#8A94A6] text-[11px] block">Registration Date</span>
              <span className="text-[#F4F7FB]">
                {new Date(user.createdAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </span>
            </div>

            <div>
              <span className="text-[#8A94A6] text-[11px] block">Last Authentication</span>
              <span className="text-[#00daf3]">
                {user.lastLoginAt
                  ? new Date(user.lastLoginAt).toLocaleString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })
                  : 'Active Session'}
              </span>
            </div>

            <div>
              <span className="text-[#8A94A6] text-[11px] block">Session Token Expiry</span>
              <span className="text-[#00E676]">24 Hours (JWT Hardened)</span>
            </div>
          </div>
        </div>

        {/* Card 2: Security & Credentials */}
        <div className="bg-[#0B0F16]/90 p-6 rounded-xl border border-[#202B3C] space-y-4">
          <div className="flex items-center gap-2 border-b border-[#202B3C] pb-3">
            <Lock className="w-4 h-4 text-[#00daf3]" />
            <h3 className="font-headline text-sm font-bold text-[#F4F7FB] tracking-wide">
              Security &amp; Encryption
            </h3>
          </div>

          <div className="space-y-3 text-xs font-mono-data">
            <div>
              <span className="text-[#8A94A6] text-[11px] block">Password Storage</span>
              <span className="text-[#00E676]">BCrypt Salted (Cost Factor 10)</span>
            </div>

            <div>
              <span className="text-[#8A94A6] text-[11px] block">Data Isolation</span>
              <span className="text-[#00E676]">Strict User Sandbox Enforced</span>
            </div>

            <div>
              <span className="text-[#8A94A6] text-[11px] block">API Authorization</span>
              <span className="text-[#F4F7FB]">Bearer Token Protected</span>
            </div>

            <div className="pt-2">
              <button
                onClick={() => onNavigateTab('settings')}
                className="w-full py-2 bg-[#1A2333] hover:bg-[#202B3C] text-[#00daf3] border border-[#202B3C] rounded text-xs font-mono-data font-bold transition-colors flex items-center justify-center gap-1.5"
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span>Change Password in Settings →</span>
              </button>
            </div>
          </div>
        </div>

        {/* Card 3: Quick SOC Actions */}
        <div className="bg-[#0B0F16]/90 p-6 rounded-xl border border-[#202B3C] space-y-4">
          <div className="flex items-center gap-2 border-b border-[#202B3C] pb-3">
            <Activity className="w-4 h-4 text-[#00daf3]" />
            <h3 className="font-headline text-sm font-bold text-[#F4F7FB] tracking-wide">
              Analyst Workflows
            </h3>
          </div>

          <div className="space-y-2.5">
            <button
              onClick={onOpenNewInvestigation}
              className="w-full p-3 bg-[#00daf3]/10 hover:bg-[#00daf3]/20 border border-[#00daf3]/30 rounded-lg text-left transition-all group"
            >
              <div className="text-xs font-mono-data font-bold text-[#00daf3] group-hover:underline flex items-center justify-between">
                <span>Start New Email Ingestion</span>
                <span>→</span>
              </div>
              <p className="text-[11px] text-[#8A94A6] mt-0.5">Detonate RFC headers, URLs, and MIME artifacts</p>
            </button>

            <button
              onClick={() => onNavigateTab('overview')}
              className="w-full p-3 bg-[#121824] hover:bg-[#1A2333] border border-[#202B3C] rounded-lg text-left transition-all group"
            >
              <div className="text-xs font-mono-data font-bold text-[#F4F7FB] group-hover:text-[#00daf3] flex items-center justify-between">
                <span>View My Threat Dashboard</span>
                <span>→</span>
              </div>
              <p className="text-[11px] text-[#8A94A6] mt-0.5">Aggregated risk stats and historical telemetry</p>
            </button>

            <button
              onClick={() => onNavigateTab('reports')}
              className="w-full p-3 bg-[#121824] hover:bg-[#1A2333] border border-[#202B3C] rounded-lg text-left transition-all group"
            >
              <div className="text-xs font-mono-data font-bold text-[#F4F7FB] group-hover:text-[#00daf3] flex items-center justify-between">
                <span>SOC Audit Reports (PDF)</span>
                <span>→</span>
              </div>
              <p className="text-[11px] text-[#8A94A6] mt-0.5">NIST SP 800-86 cryptographic compliance exports</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
