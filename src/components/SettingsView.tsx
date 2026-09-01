import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { changeUserPassword } from '../utils/api';
import {
  Settings,
  Shield,
  Sliders,
  Save,
  Check,
  Lock,
  KeyRound,
  Eye,
  EyeOff,
  AlertTriangle,
  CheckCircle2,
  Cpu,
  Globe,
  Radio,
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const { user, isAuthenticated, setAuthView } = useAuth();

  const [activeTab, setActiveTab] = useState<'engine' | 'security' | 'integrations'>('engine');

  // Engine config state
  const [threshold, setThreshold] = useState(75);
  const [autoQuarantine, setAutoQuarantine] = useState(true);
  const [deepSandbox, setDeepSandbox] = useState(true);
  const [dnsLookupsEnabled, setDnsLookupsEnabled] = useState(true);
  const [engineSaved, setEngineSaved] = useState(false);

  // Security & Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmNewPass, setShowConfirmNewPass] = useState(false);
  const [passError, setPassError] = useState<string | null>(null);
  const [passSuccess, setPassSuccess] = useState<string | null>(null);
  const [isChangingPass, setIsChangingPass] = useState(false);

  // Integration state
  const [webhookUrl, setWebhookUrl] = useState('https://siem.soc.internal/api/v1/alerts');
  const [integrationSaved, setIntegrationSaved] = useState(false);

  // Password validation rules
  const hasMinLength = newPassword.length >= 8;
  const hasUppercase = /[A-Z]/.test(newPassword);
  const hasLowercase = /[a-z]/.test(newPassword);
  const hasNumber = /[0-9]/.test(newPassword);
  const isNewPasswordValid = hasMinLength && hasUppercase && hasLowercase && hasNumber;
  const doPasswordsMatch = newPassword.length > 0 && newPassword === confirmNewPassword;

  const handleEngineSave = () => {
    setEngineSaved(true);
    setTimeout(() => setEngineSaved(false), 2500);
  };

  const handleIntegrationSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIntegrationSaved(true);
    setTimeout(() => setIntegrationSaved(false), 2500);
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassError(null);
    setPassSuccess(null);

    if (!currentPassword) {
      setPassError('Please enter your current password.');
      return;
    }

    if (!isNewPasswordValid) {
      setPassError('New password does not satisfy all complexity requirements.');
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setPassError('New passwords do not match.');
      return;
    }

    setIsChangingPass(true);
    try {
      const res = await changeUserPassword(currentPassword, newPassword, confirmNewPassword);
      setPassSuccess(res.message || 'Security password updated successfully.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
      setTimeout(() => setPassSuccess(null), 5000);
    } catch (err: any) {
      setPassError(err.message || 'Failed to update password. Please check your current password.');
    } finally {
      setIsChangingPass(false);
    }
  };

  return (
    <div className="w-full max-w-[1200px] mx-auto p-4 sm:p-6 lg:p-10 pb-20 space-y-6">
      <div className="bg-[#0B0F16]/90 backdrop-blur-md p-4 sm:p-8 rounded-xl hud-border space-y-6">
        {/* Header Strip */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#202B3C] pb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#00daf3]/10 border border-[#00daf3]/30 flex items-center justify-center text-[#00daf3]">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-headline text-xl sm:text-2xl font-bold text-[#F4F7FB]">
                Security Engine &amp; Account Settings
              </h2>
              <p className="text-xs text-[#8A94A6] font-mono-data mt-0.5">
                Configure heuristic parameters, change credentials, and manage telemetry integrations
              </p>
            </div>
          </div>

          {/* Sub Navigation Tabs */}
          <div className="flex items-center bg-[#121824] p-1 rounded-lg border border-[#202B3C] text-xs font-mono-data">
            <button
              onClick={() => setActiveTab('engine')}
              className={`px-3 py-1.5 rounded font-semibold transition-all ${
                activeTab === 'engine'
                  ? 'bg-[#00daf3] text-[#090B10]'
                  : 'text-[#8A94A6] hover:text-[#F4F7FB]'
              }`}
            >
              Engine Rules
            </button>

            <button
              onClick={() => setActiveTab('security')}
              className={`px-3 py-1.5 rounded font-semibold transition-all ${
                activeTab === 'security'
                  ? 'bg-[#00daf3] text-[#090B10]'
                  : 'text-[#8A94A6] hover:text-[#F4F7FB]'
              }`}
            >
              Account &amp; Password
            </button>

            <button
              onClick={() => setActiveTab('integrations')}
              className={`px-3 py-1.5 rounded font-semibold transition-all ${
                activeTab === 'integrations'
                  ? 'bg-[#00daf3] text-[#090B10]'
                  : 'text-[#8A94A6] hover:text-[#F4F7FB]'
              }`}
            >
              SIEM &amp; APIs
            </button>
          </div>
        </div>

        {/* TAB 1: ENGINE RULES */}
        {activeTab === 'engine' && (
          <div className="space-y-6">
            {/* Risk Threshold Slider */}
            <div className="bg-[#121824] p-5 rounded-lg border border-[#202B3C] space-y-3">
              <div className="flex justify-between items-center">
                <div>
                  <span className="font-mono-data text-sm font-bold text-[#F4F7FB] block">
                    Malicious Verdict Risk Score Threshold
                  </span>
                  <span className="text-[11px] text-[#8A94A6] font-mono-data">
                    Trigger level required to escalate artifacts to Triage Tier-3 (Malicious)
                  </span>
                </div>
                <span className="font-mono-data text-sm font-bold text-[#00daf3] px-3 py-1 bg-[#090B10] rounded border border-[#00daf3]/40">
                  {threshold}/100
                </span>
              </div>
              <input
                type="range"
                min="40"
                max="95"
                value={threshold}
                onChange={(e) => setThreshold(Number(e.target.value))}
                className="w-full accent-[#00daf3] cursor-pointer h-2 bg-[#1A2333] rounded-lg"
              />
              <div className="flex justify-between text-[10px] font-mono-data text-[#8A94A6]">
                <span>Aggressive (40)</span>
                <span>Balanced (75)</span>
                <span>Conservative (95)</span>
              </div>
            </div>

            {/* Toggle Controls */}
            <div className="space-y-3">
              <label className="flex items-center justify-between p-4 bg-[#121824] rounded-lg border border-[#202B3C] cursor-pointer hover:border-[#00daf3]/40 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded bg-[#00daf3]/10 text-[#00daf3] flex items-center justify-center">
                    <Shield className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-mono-data text-xs sm:text-sm text-[#F4F7FB] font-bold">
                      Automated In-Flight Quarantine
                    </div>
                    <div className="text-[11px] text-[#8A94A6]">
                      Instantly pull detected malicious artifacts from enterprise mailboxes via Graph API.
                    </div>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={autoQuarantine}
                  onChange={(e) => setAutoQuarantine(e.target.checked)}
                  className="w-4 h-4 accent-[#00daf3] cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between p-4 bg-[#121824] rounded-lg border border-[#202B3C] cursor-pointer hover:border-[#00daf3]/40 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded bg-[#00daf3]/10 text-[#00daf3] flex items-center justify-center">
                    <Sliders className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-mono-data text-xs sm:text-sm text-[#F4F7FB] font-bold">
                      Headless Browser URL Detonation Sandbox
                    </div>
                    <div className="text-[11px] text-[#8A94A6]">
                      Perform DOM execution, follow HTTP 302 redirects, and identify credential-harvesting forms.
                    </div>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={deepSandbox}
                  onChange={(e) => setDeepSandbox(e.target.checked)}
                  className="w-4 h-4 accent-[#00daf3] cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between p-4 bg-[#121824] rounded-lg border border-[#202B3C] cursor-pointer hover:border-[#00daf3]/40 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded bg-[#00daf3]/10 text-[#00daf3] flex items-center justify-center">
                    <Cpu className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-mono-data text-xs sm:text-sm text-[#F4F7FB] font-bold">
                      Authoritative DNS MX &amp; TXT Resolver Validation
                    </div>
                    <div className="text-[11px] text-[#8A94A6]">
                      Real-time DNS query of SPF, DKIM, and DMARC records during header parsing.
                    </div>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={dnsLookupsEnabled}
                  onChange={(e) => setDnsLookupsEnabled(e.target.checked)}
                  className="w-4 h-4 accent-[#00daf3] cursor-pointer"
                />
              </label>
            </div>

            <div className="flex justify-end pt-4 border-t border-[#202B3C]">
              <button
                onClick={handleEngineSave}
                className="bg-[#00daf3] text-[#090B10] px-6 py-2.5 rounded-lg font-mono-data text-xs font-bold hover:brightness-110 min-h-[44px] flex items-center gap-2"
              >
                {engineSaved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                <span>{engineSaved ? 'Rules Saved' : 'Save Engine Rules'}</span>
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: ACCOUNT & SECURITY */}
        {activeTab === 'security' && (
          <div className="space-y-6">
            {!isAuthenticated ? (
              <div className="p-6 bg-[#121824] rounded-lg border border-[#202B3C] text-center space-y-3">
                <Lock className="w-8 h-8 text-[#00daf3] mx-auto" />
                <h3 className="text-base font-bold text-[#F4F7FB] font-headline">
                  Authentication Required
                </h3>
                <p className="text-xs text-[#8A94A6]">
                  Please sign in to your SOC Analyst account to change your credentials or manage access keys.
                </p>
                <button
                  onClick={() => setAuthView('login')}
                  className="px-5 py-2.5 bg-[#00daf3] text-[#090B10] font-mono-data font-bold text-xs rounded-lg"
                >
                  Sign In / Register
                </button>
              </div>
            ) : (
              <form onSubmit={handleChangePassword} className="space-y-4 max-w-xl">
                <div className="flex items-center gap-2 text-xs font-mono-data text-[#00daf3] font-bold">
                  <KeyRound className="w-4 h-4" />
                  <span>Update SOC Analyst Security Password</span>
                </div>

                {passError && (
                  <div className="p-3 rounded-lg bg-[#FF3D00]/10 border border-[#FF3D00]/40 text-[#FF5722] text-xs flex items-center gap-2 font-mono-data">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>{passError}</span>
                  </div>
                )}

                {passSuccess && (
                  <div className="p-3 rounded-lg bg-[#00E676]/10 border border-[#00E676]/40 text-[#00E676] text-xs flex items-center gap-2 font-mono-data">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>{passSuccess}</span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-mono-data font-bold text-[#8A94A6] mb-1 uppercase">
                    Current Password <span className="text-[#FF3D00]">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showCurrentPass ? 'text' : 'password'}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="Enter current password"
                      required
                      className="w-full px-3 py-2 bg-[#121824] border border-[#202B3C] rounded-lg text-sm text-[#F4F7FB] placeholder-[#536179] focus:outline-none focus:border-[#00daf3]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPass(!showCurrentPass)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#8A94A6] hover:text-[#F4F7FB]"
                    >
                      {showCurrentPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono-data font-bold text-[#8A94A6] mb-1 uppercase">
                    New Password <span className="text-[#FF3D00]">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPass ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Min. 8 chars, 1 uppercase, 1 lowercase, 1 number"
                      required
                      className="w-full px-3 py-2 bg-[#121824] border border-[#202B3C] rounded-lg text-sm text-[#F4F7FB] placeholder-[#536179] focus:outline-none focus:border-[#00daf3]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPass(!showNewPass)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#8A94A6] hover:text-[#F4F7FB]"
                    >
                      {showNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Password Strength Checklist */}
                  <div className="mt-2 p-2.5 bg-[#121824] border border-[#202B3C] rounded grid grid-cols-2 gap-1 text-[11px] font-mono-data">
                    <div className={`flex items-center gap-1 ${hasMinLength ? 'text-[#00E676]' : 'text-[#8A94A6]'}`}>
                      {hasMinLength ? '✓' : '✗'} 8+ Characters
                    </div>
                    <div className={`flex items-center gap-1 ${hasUppercase ? 'text-[#00E676]' : 'text-[#8A94A6]'}`}>
                      {hasUppercase ? '✓' : '✗'} 1 Uppercase (A-Z)
                    </div>
                    <div className={`flex items-center gap-1 ${hasLowercase ? 'text-[#00E676]' : 'text-[#8A94A6]'}`}>
                      {hasLowercase ? '✓' : '✗'} 1 Lowercase (a-z)
                    </div>
                    <div className={`flex items-center gap-1 ${hasNumber ? 'text-[#00E676]' : 'text-[#8A94A6]'}`}>
                      {hasNumber ? '✓' : '✗'} 1 Number (0-9)
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono-data font-bold text-[#8A94A6] mb-1 uppercase">
                    Confirm New Password <span className="text-[#FF3D00]">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmNewPass ? 'text' : 'password'}
                      value={confirmNewPassword}
                      onChange={(e) => setConfirmNewPassword(e.target.value)}
                      placeholder="Re-type new password"
                      required
                      className="w-full px-3 py-2 bg-[#121824] border border-[#202B3C] rounded-lg text-sm text-[#F4F7FB] placeholder-[#536179] focus:outline-none focus:border-[#00daf3]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmNewPass(!showConfirmNewPass)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#8A94A6] hover:text-[#F4F7FB]"
                    >
                      {showConfirmNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isChangingPass || !isNewPasswordValid || !doPasswordsMatch}
                    className="px-6 py-2.5 bg-[#00daf3] text-[#090B10] rounded-lg font-mono-data text-xs font-bold hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px]"
                  >
                    {isChangingPass ? 'Updating Password...' : 'Save New Security Password'}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* TAB 3: INTEGRATIONS & WEBHOOKS */}
        {activeTab === 'integrations' && (
          <form onSubmit={handleIntegrationSave} className="space-y-6">
            <div className="bg-[#121824] p-5 rounded-lg border border-[#202B3C] space-y-4">
              <div>
                <label className="block text-xs font-mono-data font-bold text-[#8A94A6] mb-1.5 uppercase">
                  SOC SIEM Webhook Ingress (Splunk / QRadar / Microsoft Sentinel)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#8A94A6]">
                    <Radio className="w-4 h-4" />
                  </div>
                  <input
                    type="url"
                    value={webhookUrl}
                    onChange={(e) => setWebhookUrl(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 bg-[#0B0F16] border border-[#202B3C] rounded-lg text-xs font-mono-data text-[#F4F7FB] focus:outline-none focus:border-[#00daf3]"
                  />
                </div>
                <p className="text-[11px] text-[#8A94A6] font-mono-data mt-1">
                  High-severity forensic detections (score ≥ 75) emit automated JSON telemetry payloads to this URI.
                </p>
              </div>

              <div className="p-3 bg-[#0B0F16] rounded border border-[#202B3C] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-[#00E676]" />
                  <span className="text-xs font-mono-data text-[#F4F7FB]">API Ingress Gateway Status</span>
                </div>
                <span className="text-[10px] font-mono-data font-bold text-[#00E676] bg-[#00E676]/10 px-2 py-0.5 rounded border border-[#00E676]/30">
                  CONNECTED (TLS 1.3)
                </span>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-[#202B3C]">
              <button
                type="submit"
                className="bg-[#00daf3] text-[#090B10] px-6 py-2.5 rounded-lg font-mono-data text-xs font-bold hover:brightness-110 min-h-[44px] flex items-center gap-2"
              >
                {integrationSaved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                <span>{integrationSaved ? 'Webhook Configured' : 'Update SIEM Webhook'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
