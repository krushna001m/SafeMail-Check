import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { requestPasswordReset, resetPassword } from '../../utils/api';
import {
  Shield,
  Lock,
  Mail,
  User as UserIcon,
  Building,
  Eye,
  EyeOff,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ArrowRight,
  KeyRound,
  Check,
  X,
  Sparkles,
} from 'lucide-react';

interface AuthModalProps {
  isOpen?: boolean;
  onClose?: () => void;
  initialView?: 'login' | 'register' | 'forgot-password' | 'reset-password';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen: propIsOpen,
  onClose: propOnClose,
  initialView = 'login',
}) => {
  const { login, register, authView, setAuthView, resetToken, sessionExpired, dismissSessionExpired } = useAuth();

  const isOpen = propIsOpen !== undefined ? propIsOpen : authView !== null;
  const onClose = () => {
    if (propOnClose) propOnClose();
    setAuthView(null);
    if (sessionExpired) dismissSessionExpired();
  };

  const [activeView, setActiveView] = useState<'login' | 'register' | 'forgot-password' | 'reset-password'>(
    authView || initialView
  );

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [organization, setOrganization] = useState('');
  const [tokenInput, setTokenInput] = useState(resetToken || '');

  // UI state
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generatedResetUrl, setGeneratedResetUrl] = useState<string | null>(null);

  useEffect(() => {
    if (authView) {
      setActiveView(authView);
    }
  }, [authView]);

  useEffect(() => {
    if (resetToken) {
      setTokenInput(resetToken);
      setActiveView('reset-password');
    }
  }, [resetToken]);

  // Reset errors on view switch
  const switchView = (view: 'login' | 'register' | 'forgot-password' | 'reset-password') => {
    setActiveView(view);
    setAuthView(view);
    setErrorMessage(null);
    setSuccessMessage(null);
    setGeneratedResetUrl(null);
  };

  // Password rules validation
  const hasMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const isPasswordValid = hasMinLength && hasUppercase && hasLowercase && hasNumber;
  const doPasswordsMatch = password.length > 0 && password === confirmPassword;

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!email.trim() || !password) {
      setErrorMessage('Please enter both your email address and password.');
      return;
    }

    setIsSubmitting(true);
    try {
      await login(email.trim(), password);
      setSuccessMessage('Authentication verified. Welcome to TraceMail Security.');
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (err: any) {
      setErrorMessage(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!name.trim()) {
      setErrorMessage('Full name is required.');
      return;
    }

    if (!email.trim()) {
      setErrorMessage('Email address is required.');
      return;
    }

    if (!isPasswordValid) {
      setErrorMessage('Please ensure your password meets all complexity requirements.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please re-enter your password.');
      return;
    }

    setIsSubmitting(true);
    try {
      await register(name.trim(), email.trim(), password, confirmPassword, organization.trim());
      setSuccessMessage('Account created and authenticated successfully. Welcome to TraceMail!');
      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err: any) {
      setErrorMessage(err.message || 'Registration failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setGeneratedResetUrl(null);

    if (!email.trim()) {
      setErrorMessage('Please enter the email associated with your account.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await requestPasswordReset(email.trim());
      setSuccessMessage(res.message);
      if (res.resetTokenUrl) {
        setGeneratedResetUrl(res.resetTokenUrl);
        const tokenMatch = res.resetTokenUrl.split('token=')[1];
        if (tokenMatch) {
          setTokenInput(tokenMatch);
        }
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to process password reset request.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!tokenInput.trim()) {
      setErrorMessage('Reset token is required.');
      return;
    }

    if (!isPasswordValid) {
      setErrorMessage('New password must satisfy complexity requirements.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await resetPassword(tokenInput.trim(), password, confirmPassword);
      setSuccessMessage(res.message);
      setTimeout(() => {
        switchView('login');
      }, 2000);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to reset password. The link or token may be expired.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#05070A]/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg bg-[#0B0F16] border border-[#202B3C] rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.8)] overflow-hidden">
        {/* Header Strip */}
        <div className="bg-[#121824] border-b border-[#202B3C] px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-[#00daf3]/15 border border-[#00daf3]/40 flex items-center justify-center text-[#00daf3]">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-[#F4F7FB] font-headline tracking-wide">
                TraceMail Security Authentication
              </h2>
              <p className="text-[11px] text-[#8A94A6] font-mono-data">
                SOC Access Control &amp; Threat Isolation
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded flex items-center justify-center text-[#8A94A6] hover:text-[#F4F7FB] hover:bg-[#1A2333] transition-colors"
            aria-label="Close authentication modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 max-h-[85vh] overflow-y-auto">
          {/* Status Feedback Messages */}
          {sessionExpired && (
            <div className="mb-5 p-3.5 rounded-lg bg-[#FFC107]/10 border border-[#FFC107]/40 text-[#FFC107] text-xs flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="flex-1 font-medium">Your session has expired. Please log in again.</div>
            </div>
          )}

          {errorMessage && (
            <div className="mb-5 p-3.5 rounded-lg bg-[#FF3D00]/10 border border-[#FF3D00]/40 text-[#FF5722] text-xs flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="flex-1 font-medium">{errorMessage}</div>
            </div>
          )}

          {successMessage && (
            <div className="mb-5 p-3.5 rounded-lg bg-[#00E676]/10 border border-[#00E676]/40 text-[#00E676] text-xs flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="flex-1 font-medium">{successMessage}</div>
            </div>
          )}

          {/* VIEW 1: LOGIN */}
          {activeView === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-mono-data font-semibold text-[#8A94A6] mb-1.5 uppercase">
                  Email Address <span className="text-[#FF3D00]">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#8A94A6]">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="analyst@soc.gov.in or email"
                    required
                    autoFocus
                    className="w-full pl-10 pr-3 py-2.5 bg-[#121824] border border-[#202B3C] rounded-lg text-sm text-[#F4F7FB] placeholder-[#536179] focus:outline-none focus:border-[#00daf3] focus:ring-1 focus:ring-[#00daf3] font-body transition-colors"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-mono-data font-semibold text-[#8A94A6] uppercase">
                    Password <span className="text-[#FF3D00]">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => switchView('forgot-password')}
                    className="text-xs text-[#00daf3] hover:underline font-mono-data"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#8A94A6]">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter security password"
                    required
                    className="w-full pl-10 pr-10 py-2.5 bg-[#121824] border border-[#202B3C] rounded-lg text-sm text-[#F4F7FB] placeholder-[#536179] focus:outline-none focus:border-[#00daf3] focus:ring-1 focus:ring-[#00daf3] font-body transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#8A94A6] hover:text-[#F4F7FB]"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-2 py-3 bg-[#00daf3] hover:bg-[#00c5dc] text-[#090B10] font-mono-data font-bold text-sm rounded-lg transition-all flex items-center justify-center gap-2 min-h-[44px]"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-[#090B10] border-t-transparent rounded-full animate-spin" />
                    Authenticating Credentials...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    Sign In to SOC Workspace <ArrowRight className="w-4 h-4" />
                  </span>
                )}
              </button>

              {/* Demo account — real credentials, authenticated through the normal login flow */}
              <div className="flex items-center justify-between gap-3 px-3 py-2 bg-[#121824] border border-[#202B3C] rounded-md">
                <div className="text-[11px] font-mono-data leading-tight">
                  <span className="text-[#8A94A6]">Demo account — </span>
                  <span className="text-[#c3f5ff]">demo_user@tracemail.ai</span>
                  <span className="text-[#8A94A6]"> / </span>
                  <span className="text-[#c3f5ff]">demo123</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setEmail('demo_user@tracemail.ai');
                    setPassword('demo123');
                  }}
                  className="shrink-0 text-[11px] font-mono-data text-[#00daf3] hover:underline"
                >
                  Use demo
                </button>
              </div>

              <div className="pt-3 border-t border-[#202B3C] text-center">
                <p className="text-xs text-[#8A94A6]">
                  Don't have an analyst account?{' '}
                  <button
                    type="button"
                    onClick={() => switchView('register')}
                    className="text-[#00daf3] hover:underline font-bold font-mono-data"
                  >
                    Create New Account
                  </button>
                </p>
              </div>
            </form>
          )}

          {/* VIEW 2: REGISTER */}
          {activeView === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-mono-data font-semibold text-[#8A94A6] mb-1 uppercase">
                  Full Name <span className="text-[#FF3D00]">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#8A94A6]">
                    <UserIcon className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Alex Vance"
                    required
                    autoFocus
                    className="w-full pl-10 pr-3 py-2 bg-[#121824] border border-[#202B3C] rounded-lg text-sm text-[#F4F7FB] placeholder-[#536179] focus:outline-none focus:border-[#00daf3] focus:ring-1 focus:ring-[#00daf3] font-body"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono-data font-semibold text-[#8A94A6] mb-1 uppercase">
                  Work / Agency Email <span className="text-[#FF3D00]">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#8A94A6]">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="analyst@agency.gov.in"
                    required
                    className="w-full pl-10 pr-3 py-2 bg-[#121824] border border-[#202B3C] rounded-lg text-sm text-[#F4F7FB] placeholder-[#536179] focus:outline-none focus:border-[#00daf3] focus:ring-1 focus:ring-[#00daf3] font-body"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono-data font-semibold text-[#8A94A6] mb-1 uppercase">
                  Organization / Unit (Optional)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#8A94A6]">
                    <Building className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={organization}
                    onChange={(e) => setOrganization(e.target.value)}
                    placeholder="e.g. Cyber Crime Cell, Pune"
                    className="w-full pl-10 pr-3 py-2 bg-[#121824] border border-[#202B3C] rounded-lg text-sm text-[#F4F7FB] placeholder-[#536179] focus:outline-none focus:border-[#00daf3] focus:ring-1 focus:ring-[#00daf3] font-body"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono-data font-semibold text-[#8A94A6] mb-1 uppercase">
                  Create Password <span className="text-[#FF3D00]">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#8A94A6]">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min. 8 characters"
                    required
                    className="w-full pl-10 pr-10 py-2 bg-[#121824] border border-[#202B3C] rounded-lg text-sm text-[#F4F7FB] placeholder-[#536179] focus:outline-none focus:border-[#00daf3] focus:ring-1 focus:ring-[#00daf3] font-body"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#8A94A6] hover:text-[#F4F7FB]"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {/* Password Strength Requirements Checklist */}
                <div className="mt-2 p-2.5 bg-[#121824] border border-[#202B3C] rounded grid grid-cols-2 gap-1.5 text-[11px] font-mono-data">
                  <div className={`flex items-center gap-1.5 ${hasMinLength ? 'text-[#00E676]' : 'text-[#8A94A6]'}`}>
                    {hasMinLength ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                    <span>8+ Characters</span>
                  </div>
                  <div className={`flex items-center gap-1.5 ${hasUppercase ? 'text-[#00E676]' : 'text-[#8A94A6]'}`}>
                    {hasUppercase ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                    <span>1 Uppercase (A-Z)</span>
                  </div>
                  <div className={`flex items-center gap-1.5 ${hasLowercase ? 'text-[#00E676]' : 'text-[#8A94A6]'}`}>
                    {hasLowercase ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                    <span>1 Lowercase (a-z)</span>
                  </div>
                  <div className={`flex items-center gap-1.5 ${hasNumber ? 'text-[#00E676]' : 'text-[#8A94A6]'}`}>
                    {hasNumber ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                    <span>1 Number (0-9)</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono-data font-semibold text-[#8A94A6] mb-1 uppercase">
                  Confirm Password <span className="text-[#FF3D00]">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#8A94A6]">
                    <KeyRound className="w-4 h-4" />
                  </div>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-type password"
                    required
                    className="w-full pl-10 pr-10 py-2 bg-[#121824] border border-[#202B3C] rounded-lg text-sm text-[#F4F7FB] placeholder-[#536179] focus:outline-none focus:border-[#00daf3] focus:ring-1 focus:ring-[#00daf3] font-body"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#8A94A6] hover:text-[#F4F7FB]"
                    aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {confirmPassword && (
                  <div className={`mt-1 text-[11px] font-mono-data ${doPasswordsMatch ? 'text-[#00E676]' : 'text-[#FF3D00]'}`}>
                    {doPasswordsMatch ? '✓ Passwords match' : '✗ Passwords do not match'}
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting || !isPasswordValid || !doPasswordsMatch}
                className="w-full mt-3 py-3 bg-[#00daf3] hover:bg-[#00c5dc] text-[#090B10] font-mono-data font-bold text-sm rounded-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px]"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-[#090B10] border-t-transparent rounded-full animate-spin" />
                    Registering Security Profile...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    Complete Registration &amp; Sign In <ArrowRight className="w-4 h-4" />
                  </span>
                )}
              </button>

              <div className="pt-2.5 border-t border-[#202B3C] text-center">
                <p className="text-xs text-[#8A94A6]">
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => switchView('login')}
                    className="text-[#00daf3] hover:underline font-bold font-mono-data"
                  >
                    Sign In
                  </button>
                </p>
              </div>
            </form>
          )}

          {/* VIEW 3: FORGOT PASSWORD */}
          {activeView === 'forgot-password' && (
            <form onSubmit={handleForgotPasswordSubmit} className="space-y-4">
              <p className="text-xs text-[#8A94A6] leading-relaxed">
                Enter the email address registered with your TraceMail account. If the account exists, password recovery instructions will be provided.
              </p>

              <div>
                <label className="block text-xs font-mono-data font-semibold text-[#8A94A6] mb-1.5 uppercase">
                  Account Email Address <span className="text-[#FF3D00]">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#8A94A6]">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="analyst@agency.gov.in"
                    required
                    autoFocus
                    className="w-full pl-10 pr-3 py-2.5 bg-[#121824] border border-[#202B3C] rounded-lg text-sm text-[#F4F7FB] placeholder-[#536179] focus:outline-none focus:border-[#00daf3] focus:ring-1 focus:ring-[#00daf3] font-body"
                  />
                </div>
              </div>

              {generatedResetUrl && (
                <div className="p-3 bg-[#1A2333] border border-[#00daf3]/40 rounded-lg space-y-2">
                  <div className="text-xs font-mono-data text-[#00daf3] font-bold flex items-center gap-1.5">
                    <KeyRound className="w-4 h-4" />
                    Interactive Reset Link Ready
                  </div>
                  <p className="text-[11px] text-[#8A94A6]">
                    Click below to immediately transition to the secure password reset screen:
                  </p>
                  <button
                    type="button"
                    onClick={() => switchView('reset-password')}
                    className="w-full py-2 bg-[#00daf3]/20 hover:bg-[#00daf3]/30 text-[#00daf3] border border-[#00daf3]/50 rounded font-mono-data text-xs font-bold transition-colors"
                  >
                    Open Password Reset Form →
                  </button>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 bg-[#00daf3] hover:bg-[#00c5dc] text-[#090B10] font-mono-data font-bold text-sm rounded-lg transition-all flex items-center justify-center gap-2 min-h-[44px]"
              >
                {isSubmitting ? 'Generating Instructions...' : 'Request Password Reset Link'}
              </button>

              <div className="pt-3 border-t border-[#202B3C] text-center">
                <button
                  type="button"
                  onClick={() => switchView('login')}
                  className="text-xs text-[#00daf3] hover:underline font-mono-data font-semibold"
                >
                  ← Return to Sign In
                </button>
              </div>
            </form>
          )}

          {/* VIEW 4: RESET PASSWORD */}
          {activeView === 'reset-password' && (
            <form onSubmit={handleResetPasswordSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-mono-data font-semibold text-[#8A94A6] mb-1 uppercase">
                  Reset Token / Security Key <span className="text-[#FF3D00]">*</span>
                </label>
                <input
                  type="text"
                  value={tokenInput}
                  onChange={(e) => setTokenInput(e.target.value)}
                  placeholder="Paste or enter reset token"
                  required
                  className="w-full px-3 py-2 bg-[#121824] border border-[#202B3C] rounded-lg text-xs font-mono-data text-[#F4F7FB] placeholder-[#536179] focus:outline-none focus:border-[#00daf3]"
                />
              </div>

              <div>
                <label className="block text-xs font-mono-data font-semibold text-[#8A94A6] mb-1 uppercase">
                  New Password <span className="text-[#FF3D00]">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#8A94A6]">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min. 8 chars with uppercase & number"
                    required
                    className="w-full pl-10 pr-10 py-2 bg-[#121824] border border-[#202B3C] rounded-lg text-sm text-[#F4F7FB] placeholder-[#536179] focus:outline-none focus:border-[#00daf3] font-body"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#8A94A6] hover:text-[#F4F7FB]"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                <div className="mt-2 p-2 bg-[#121824] border border-[#202B3C] rounded grid grid-cols-2 gap-1 text-[11px] font-mono-data">
                  <div className={`flex items-center gap-1 ${hasMinLength ? 'text-[#00E676]' : 'text-[#8A94A6]'}`}>
                    {hasMinLength ? '✓' : '✗'} 8+ Chars
                  </div>
                  <div className={`flex items-center gap-1 ${hasUppercase ? 'text-[#00E676]' : 'text-[#8A94A6]'}`}>
                    {hasUppercase ? '✓' : '✗'} 1 Uppercase
                  </div>
                  <div className={`flex items-center gap-1 ${hasLowercase ? 'text-[#00E676]' : 'text-[#8A94A6]'}`}>
                    {hasLowercase ? '✓' : '✗'} 1 Lowercase
                  </div>
                  <div className={`flex items-center gap-1 ${hasNumber ? 'text-[#00E676]' : 'text-[#8A94A6]'}`}>
                    {hasNumber ? '✓' : '✗'} 1 Number
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono-data font-semibold text-[#8A94A6] mb-1 uppercase">
                  Confirm New Password <span className="text-[#FF3D00]">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#8A94A6]">
                    <KeyRound className="w-4 h-4" />
                  </div>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-type new password"
                    required
                    className="w-full pl-10 pr-10 py-2 bg-[#121824] border border-[#202B3C] rounded-lg text-sm text-[#F4F7FB] placeholder-[#536179] focus:outline-none focus:border-[#00daf3] font-body"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#8A94A6] hover:text-[#F4F7FB]"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || !isPasswordValid || !doPasswordsMatch}
                className="w-full mt-2 py-3 bg-[#00daf3] hover:bg-[#00c5dc] text-[#090B10] font-mono-data font-bold text-sm rounded-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px]"
              >
                {isSubmitting ? 'Updating Security Password...' : 'Save New Password & Log In'}
              </button>

              <div className="pt-2.5 border-t border-[#202B3C] text-center">
                <button
                  type="button"
                  onClick={() => switchView('login')}
                  className="text-xs text-[#00daf3] hover:underline font-mono-data"
                >
                  ← Return to Sign In
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
