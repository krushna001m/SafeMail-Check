import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { InvestigationData } from '../src/types';

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: 'SOC Analyst' | 'Security Engineer' | 'Threat Hunter' | 'Administrator';
  organization?: string;
  accountStatus: 'ACTIVE' | 'SUSPENDED' | 'PENDING_VERIFICATION';
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
  resetPasswordToken?: string;
  resetPasswordExpires?: number;
}

export interface UserPublicProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  organization?: string;
  accountStatus: string;
  createdAt: string;
  lastLoginAt?: string;
  totalAnalyses: number;
}

const JWT_SECRET = process.env.JWT_SECRET || 'tracemail_soc_jwt_super_secure_key_auth_sig_prod';
const JWT_EXPIRY = '24h';

// Persistent In-Memory User & Investigation Store with Foreign Key Isolation
class UserDatabase {
  private users: Map<string, UserAccount> = new Map();
  private userInvestigations: Map<string, InvestigationData[]> = new Map(); // userId -> investigations[]
  private emailIndex: Map<string, string> = new Map(); // normalized email -> userId

  constructor() {
    this.seedDefaultAnalyst();
  }

  private async seedDefaultAnalyst() {
    // Generic demo account shown on the login screen. Real credentials are
    // never hardcoded in the client — this account lives only in this
    // in-memory store and authenticates through the normal bcrypt/JWT flow.
    const defaultEmail = 'demo_user@tracemail.ai';
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('demo123', salt);

    const defaultUser: UserAccount = {
      id: 'usr_demo_001',
      name: 'Demo Analyst',
      email: defaultEmail,
      passwordHash,
      role: 'SOC Analyst',
      organization: 'Demo Security Operations Center',
      accountStatus: 'ACTIVE',
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
    };

    this.users.set(defaultUser.id, defaultUser);
    this.emailIndex.set(defaultEmail.toLowerCase().trim(), defaultUser.id);
    this.userInvestigations.set(defaultUser.id, []);
  }

  public async findByEmail(email: string): Promise<UserAccount | null> {
    const normalized = email.toLowerCase().trim();
    const userId = this.emailIndex.get(normalized);
    if (!userId) return null;
    return this.users.get(userId) || null;
  }

  public async findById(id: string): Promise<UserAccount | null> {
    return this.users.get(id) || null;
  }

  public async registerUser(
    name: string,
    email: string,
    password: string,
    organization?: string,
    role: UserAccount['role'] = 'SOC Analyst'
  ): Promise<{ user: UserPublicProfile; token: string }> {
    const normalizedEmail = email.toLowerCase().trim();

    if (this.emailIndex.has(normalizedEmail)) {
      throw new Error('An account with this email already exists.');
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    const id = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date().toISOString();

    const newUser: UserAccount = {
      id,
      name: name.trim(),
      email: normalizedEmail,
      passwordHash,
      role,
      organization: organization ? organization.trim() : 'Threat Response Unit',
      accountStatus: 'ACTIVE',
      createdAt: now,
      updatedAt: now,
      lastLoginAt: now,
    };

    this.users.set(id, newUser);
    this.emailIndex.set(normalizedEmail, id);
    this.userInvestigations.set(id, []);

    const token = this.generateToken(newUser);
    return {
      user: this.toPublicProfile(newUser),
      token,
    };
  }

  public async authenticate(
    email: string,
    password: string
  ): Promise<{ user: UserPublicProfile; token: string }> {
    const user = await this.findByEmail(email);
    if (!user) {
      throw new Error('Invalid email or password. Please verify your credentials.');
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      throw new Error('Invalid email or password. Please verify your credentials.');
    }

    // Update last login timestamp
    user.lastLoginAt = new Date().toISOString();
    user.updatedAt = new Date().toISOString();
    this.users.set(user.id, user);

    const token = this.generateToken(user);
    return {
      user: this.toPublicProfile(user),
      token,
    };
  }

  public async updateProfile(
    userId: string,
    name?: string,
    organization?: string
  ): Promise<UserPublicProfile> {
    const user = await this.findById(userId);
    if (!user) {
      throw new Error('User account not found.');
    }

    if (name && name.trim().length > 0) {
      user.name = name.trim();
    }
    if (organization !== undefined) {
      user.organization = organization.trim();
    }
    user.updatedAt = new Date().toISOString();
    this.users.set(user.id, user);

    return this.toPublicProfile(user);
  }

  public async changePassword(
    userId: string,
    currentPass: string,
    newPass: string
  ): Promise<boolean> {
    const user = await this.findById(userId);
    if (!user) {
      throw new Error('User account not found.');
    }

    const isMatch = await bcrypt.compare(currentPass, user.passwordHash);
    if (!isMatch) {
      throw new Error('Current password is incorrect.');
    }

    const salt = await bcrypt.genSalt(10);
    user.passwordHash = await bcrypt.hash(newPass, salt);
    user.updatedAt = new Date().toISOString();
    this.users.set(user.id, user);
    return true;
  }

  public async createPasswordResetToken(email: string): Promise<string | null> {
    const user = await this.findByEmail(email);
    if (!user) {
      // Return null quietly to prevent account enumeration
      return null;
    }

    // Generate random secure token
    const token = `rst_${Date.now()}_${Math.random().toString(36).substring(2)}${Math.random().toString(36).substring(2)}`;
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 15 * 60 * 1000; // 15 minutes
    this.users.set(user.id, user);

    return token;
  }

  public async resetPasswordWithToken(token: string, newPass: string): Promise<boolean> {
    let targetUser: UserAccount | null = null;
    for (const user of this.users.values()) {
      if (
        user.resetPasswordToken &&
        user.resetPasswordToken === token &&
        user.resetPasswordExpires &&
        user.resetPasswordExpires > Date.now()
      ) {
        targetUser = user;
        break;
      }
    }

    if (!targetUser) {
      throw new Error('Password reset link is invalid or has expired. Please request a new one.');
    }

    const salt = await bcrypt.genSalt(10);
    targetUser.passwordHash = await bcrypt.hash(newPass, salt);
    targetUser.resetPasswordToken = undefined;
    targetUser.resetPasswordExpires = undefined;
    targetUser.updatedAt = new Date().toISOString();
    this.users.set(targetUser.id, targetUser);

    return true;
  }

  public generateToken(user: UserAccount): string {
    return jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRY }
    );
  }

  public verifyToken(token: string): { id: string; email: string; role: string; name: string } {
    try {
      return jwt.verify(token, JWT_SECRET) as any;
    } catch (err: any) {
      if (err.name === 'TokenExpiredError') {
        throw new Error('SESSION_EXPIRED');
      }
      throw new Error('INVALID_TOKEN');
    }
  }

  public toPublicProfile(user: UserAccount): UserPublicProfile {
    const investigations = this.userInvestigations.get(user.id) || [];
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      organization: user.organization,
      accountStatus: user.accountStatus,
      createdAt: user.createdAt,
      lastLoginAt: user.lastLoginAt,
      totalAnalyses: investigations.length,
    };
  }

  // --- USER DATA ISOLATION (Investigations) ---

  public getUserInvestigations(userId: string): InvestigationData[] {
    return this.userInvestigations.get(userId) || [];
  }

  public saveUserInvestigation(userId: string, investigation: InvestigationData): void {
    const list = this.userInvestigations.get(userId) || [];
    const filtered = list.filter((i) => i.id !== investigation.id);
    filtered.unshift(investigation);
    if (filtered.length > 50) filtered.pop();
    this.userInvestigations.set(userId, filtered);
  }

  public getUserInvestigationById(userId: string, investigationId: string): InvestigationData | null {
    const list = this.userInvestigations.get(userId) || [];
    return list.find((i) => i.id === investigationId) || null;
  }

  public isInvestigationOwnedByUser(userId: string, investigationId: string): boolean {
    const list = this.userInvestigations.get(userId) || [];
    return list.some((i) => i.id === investigationId);
  }

  public deleteUserInvestigation(userId: string, investigationId: string): boolean {
    const list = this.userInvestigations.get(userId) || [];
    const index = list.findIndex((i) => i.id === investigationId);
    if (index === -1) return false;
    list.splice(index, 1);
    this.userInvestigations.set(userId, list);
    return true;
  }

  public getUserStats(userId: string) {
    const list = this.userInvestigations.get(userId) || [];
    const total = list.length;
    const maliciousCount = list.filter((i) => i.verdict === 'MALICIOUS').length;
    const suspiciousCount = list.filter((i) => i.verdict === 'SUSPICIOUS').length;
    const cleanCount = list.filter((i) => i.verdict === 'CLEAN' || i.verdict === 'SAFE').length;
    const totalUrlsAnalyzed = list.reduce((acc, i) => acc + (i.urls?.length || 0), 0);
    const totalRelayHops = list.reduce((acc, i) => acc + (i.stats?.hopCount || 0), 0);

    return {
      totalIngested: total,
      maliciousCount,
      suspiciousCount,
      cleanCount,
      totalUrlsAnalyzed,
      totalRelayHops,
      recentInvestigations: list.slice(0, 10),
    };
  }
}

export const userDb = new UserDatabase();
