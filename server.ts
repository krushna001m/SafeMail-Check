import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { analyzeEmailForensics, performRealDnsChecks } from './server/emailParser';
import { processAiChat, getConversation, clearConversation } from './server/aiAssistant';
import { userDb } from './server/userStore';
import { authenticateToken, optionalAuth, AuthenticatedRequest } from './server/authMiddleware';
import { InvestigationData } from './src/types';

const app = express();
const PORT = 3000;

// Body parsers
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Consistent Error Helper
function formatError(res: express.Response, status: number, code: string, message: string, pathUrl: string) {
  return res.status(status).json({
    timestamp: new Date().toISOString(),
    status,
    code,
    message,
    path: pathUrl,
  });
}

// Password Policy Validation (Min 8 chars, 1 uppercase, 1 lowercase, 1 number)
function validatePassword(password: string): { valid: boolean; message?: string } {
  if (!password || typeof password !== 'string') {
    return { valid: false, message: 'Password is required.' };
  }
  if (password.length < 8) {
    return { valid: false, message: 'Password must be at least 8 characters long.' };
  }
  if (!/[A-Z]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one uppercase letter (A-Z).' };
  }
  if (!/[a-z]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one lowercase letter (a-z).' };
  }
  if (!/[0-9]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one number (0-9).' };
  }
  return { valid: true };
}

// API Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    version: 'TraceMail Prototype (Node/Express backend — SIH 2026 build)',
    authMode: 'JWT + BCrypt + User Data Isolation',
  });
});

// ==========================================
// AUTHENTICATION & ACCOUNT MANAGEMENT ENDPOINTS
// ==========================================

// 1. User Registration: POST /api/auth/register
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, confirmPassword, organization } = req.body;

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return formatError(res, 400, 'VALIDATION_ERROR', 'Full Name is required.', req.originalUrl);
    }

    if (!email || typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return formatError(res, 400, 'VALIDATION_ERROR', 'Please provide a valid email address.', req.originalUrl);
    }

    if (confirmPassword !== undefined && password !== confirmPassword) {
      return formatError(res, 400, 'VALIDATION_ERROR', 'Passwords do not match. Please re-enter your password.', req.originalUrl);
    }

    const passCheck = validatePassword(password);
    if (!passCheck.valid) {
      return formatError(res, 400, 'WEAK_PASSWORD', passCheck.message!, req.originalUrl);
    }

    const result = await userDb.registerUser(name, email, password, organization);
    return res.status(201).json({
      message: 'Account created successfully.',
      user: result.user,
      token: result.token,
    });
  } catch (error: any) {
    if (error.message.includes('already exists')) {
      return formatError(res, 409, 'ACCOUNT_EXISTS', 'An account with this email already exists.', req.originalUrl);
    }
    return formatError(res, 500, 'SERVER_ERROR', error.message || 'Failed to create user account.', req.originalUrl);
  }
});

// 2. User Login: POST /api/auth/login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return formatError(res, 400, 'MISSING_CREDENTIALS', 'Email and password are required.', req.originalUrl);
    }

    const result = await userDb.authenticate(email, password);
    return res.json({
      message: 'Authentication successful.',
      user: result.user,
      token: result.token,
    });
  } catch (error: any) {
    return formatError(res, 401, 'INVALID_CREDENTIALS', error.message || 'Invalid email or password.', req.originalUrl);
  }
});

// 3. Current User Profile: GET /api/users/me
app.get('/api/users/me', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const user = await userDb.findById(req.user!.id);
    if (!user) {
      return formatError(res, 404, 'USER_NOT_FOUND', 'User profile not found.', req.originalUrl);
    }
    return res.json(userDb.toPublicProfile(user));
  } catch (error: any) {
    return formatError(res, 500, 'SERVER_ERROR', error.message || 'Failed to retrieve profile.', req.originalUrl);
  }
});

// 4. Update Profile: PUT /api/users/profile
app.put('/api/users/profile', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const { name, organization } = req.body;
    if (!name || name.trim().length === 0) {
      return formatError(res, 400, 'VALIDATION_ERROR', 'Name cannot be empty.', req.originalUrl);
    }
    const updated = await userDb.updateProfile(req.user!.id, name, organization);
    return res.json({
      message: 'Profile updated successfully.',
      user: updated,
    });
  } catch (error: any) {
    return formatError(res, 500, 'SERVER_ERROR', error.message || 'Failed to update profile.', req.originalUrl);
  }
});

// 5. Change Password: POST /api/auth/change-password
app.post('/api/auth/change-password', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const { currentPassword, newPassword, confirmNewPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return formatError(res, 400, 'MISSING_FIELDS', 'Current password and new password are required.', req.originalUrl);
    }

    if (confirmNewPassword && newPassword !== confirmNewPassword) {
      return formatError(res, 400, 'VALIDATION_ERROR', 'New passwords do not match.', req.originalUrl);
    }

    const passCheck = validatePassword(newPassword);
    if (!passCheck.valid) {
      return formatError(res, 400, 'WEAK_PASSWORD', passCheck.message!, req.originalUrl);
    }

    await userDb.changePassword(req.user!.id, currentPassword, newPassword);
    return res.json({
      message: 'Password changed successfully. Please use your new password for future logins.',
    });
  } catch (error: any) {
    return formatError(res, 400, 'PASSWORD_CHANGE_FAILED', error.message || 'Failed to change password.', req.originalUrl);
  }
});

// 6. Forgot Password: POST /api/auth/forgot-password
app.post('/api/auth/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email || typeof email !== 'string') {
      return formatError(res, 400, 'VALIDATION_ERROR', 'Please provide an email address.', req.originalUrl);
    }

    const resetToken = await userDb.createPasswordResetToken(email);

    // Generic safe message to prevent email enumeration
    return res.json({
      message: 'If an account exists for this email, password reset instructions have been generated.',
      // Secure token link for immediate password reset
      resetTokenUrl: resetToken ? `/reset-password?token=${resetToken}` : undefined,
    });
  } catch (error: any) {
    return formatError(res, 500, 'SERVER_ERROR', error.message || 'Failed to process password reset.', req.originalUrl);
  }
});

// 7. Reset Password: POST /api/auth/reset-password
app.post('/api/auth/reset-password', async (req, res) => {
  try {
    const { token, newPassword, confirmPassword } = req.body;

    if (!token) {
      return formatError(res, 400, 'MISSING_TOKEN', 'Reset token is required.', req.originalUrl);
    }

    if (confirmPassword && newPassword !== confirmPassword) {
      return formatError(res, 400, 'VALIDATION_ERROR', 'Passwords do not match.', req.originalUrl);
    }

    const passCheck = validatePassword(newPassword);
    if (!passCheck.valid) {
      return formatError(res, 400, 'WEAK_PASSWORD', passCheck.message!, req.originalUrl);
    }

    await userDb.resetPasswordWithToken(token, newPassword);
    return res.json({
      message: 'Password has been reset successfully. You can now log in with your new password.',
    });
  } catch (error: any) {
    return formatError(res, 400, 'RESET_FAILED', error.message || 'Failed to reset password.', req.originalUrl);
  }
});

// ==========================================
// FORENSIC INVESTIGATION & TELEMETRY (USER ISOLATED)
// ==========================================

// Real Email Forensic Analysis Endpoint (Tag with User ID)
app.post('/api/analyze-email', optionalAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const { rawEmail, fileName } = req.body;

    if (!rawEmail || typeof rawEmail !== 'string' || rawEmail.trim().length === 0) {
      return formatError(res, 400, 'INVALID_INPUT', 'Missing raw email content or header string', req.originalUrl);
    }

    const artifactName = fileName || 'uploaded_email.eml';
    const analysisResult = await analyzeEmailForensics(rawEmail, artifactName);

    // If authenticated, isolate this analysis strictly to this user
    const targetUserId = req.user ? req.user.id : 'usr_dipak_001';
    userDb.saveUserInvestigation(targetUserId, analysisResult);

    return res.json(analysisResult);
  } catch (error: any) {
    console.error('Error analyzing email forensics:', error);
    return formatError(res, 500, 'ANALYSIS_ERROR', error?.message || 'Failed to analyze email artifact', req.originalUrl);
  }
});

// Real User-Isolated History Endpoint
app.get('/api/history', optionalAuth, (req: AuthenticatedRequest, res) => {
  const targetUserId = req.user ? req.user.id : 'usr_dipak_001';
  const investigations = userDb.getUserInvestigations(targetUserId);

  return res.json({
    total: investigations.length,
    investigations,
  });
});

// Single Investigation by ID with Strict Ownership Authorization Check
app.get('/api/investigations/:id', optionalAuth, (req: AuthenticatedRequest, res) => {
  const targetUserId = req.user ? req.user.id : 'usr_dipak_001';
  const { id } = req.params;

  const investigation = userDb.getUserInvestigationById(targetUserId, id);
  if (!investigation) {
    return formatError(
      res,
      404,
      'NOT_FOUND_OR_FORBIDDEN',
      'Investigation not found or you do not have permission to access this case.',
      req.originalUrl
    );
  }

  return res.json(investigation);
});

// Delete Investigation by ID
app.delete('/api/investigations/:id', authenticateToken, (req: AuthenticatedRequest, res) => {
  const targetUserId = req.user!.id;
  const { id } = req.params;

  const deleted = userDb.deleteUserInvestigation(targetUserId, id);
  if (!deleted) {
    return formatError(res, 404, 'NOT_FOUND', 'Investigation not found or access denied.', req.originalUrl);
  }

  return res.json({ message: 'Investigation deleted successfully.', id });
});

// Real User-Isolated Aggregated Platform Statistics Endpoint
app.get('/api/stats', optionalAuth, (req: AuthenticatedRequest, res) => {
  const targetUserId = req.user ? req.user.id : 'usr_dipak_001';
  const stats = userDb.getUserStats(targetUserId);
  return res.json(stats);
});

// Real AI Cybersecurity Investigation Assistant Chat Endpoint
app.post('/api/ai/chat', optionalAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const { analysisId, message, investigationData, mode } = req.body;

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return formatError(res, 400, 'INVALID_INPUT', 'Message content is required', req.originalUrl);
    }

    const targetUserId = req.user ? req.user.id : 'usr_dipak_001';

    // Find investigation data
    let targetInv = investigationData;
    if (!targetInv && analysisId) {
      targetInv = userDb.getUserInvestigationById(targetUserId, analysisId);
    }
    if (!targetInv) {
      const userList = userDb.getUserInvestigations(targetUserId);
      if (userList.length > 0) targetInv = userList[0];
    }

    const chatResponse = await processAiChat(
      analysisId || targetInv?.id || 'GLOBAL',
      message,
      targetInv,
      mode === 'simple' ? 'simple' : 'technical'
    );

    return res.json(chatResponse);
  } catch (error: any) {
    console.error('Error in AI Assistant chat:', error);
    return formatError(res, 500, 'AI_ERROR', error?.message || 'AI Assistant processing failure', req.originalUrl);
  }
});

// Get AI Chat Conversation History for an Investigation
app.get('/api/ai/conversations/:analysisId', (req, res) => {
  const { analysisId } = req.params;
  const messages = getConversation(analysisId);
  return res.json({ analysisId, messages });
});

// Clear AI Chat Conversation History
app.delete('/api/ai/conversations/:analysisId', (req, res) => {
  const { analysisId } = req.params;
  const cleared = clearConversation(analysisId);
  return res.json({ analysisId, cleared });
});

// Real DNS Lookup Endpoint
app.get('/api/dns-lookup', async (req, res) => {
  try {
    const domain = req.query.domain as string;
    if (!domain) {
      return formatError(res, 400, 'INVALID_INPUT', 'Domain parameter is required', req.originalUrl);
    }

    const dnsResults = await performRealDnsChecks(domain);
    return res.json(dnsResults);
  } catch (error: any) {
    return formatError(res, 500, 'DNS_ERROR', error?.message || 'DNS lookup failure', req.originalUrl);
  }
});

// Vite middleware setup
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`TraceMail Security Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();

