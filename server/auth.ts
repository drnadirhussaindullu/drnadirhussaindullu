// server/auth.ts - Admin Authentication & RBAC Session Management
// Gulzar Family Hospital & Children Center
import { Request, Response, NextFunction } from 'express';
import {
  getAdminByEmailOrMobile,
  getAdminById,
  verifyPassword,
  recordAuditLog,
  ALL_PERMISSIONS,
} from './db';
import { AdminPermission, AdminRole, AdminUser } from '../src/types';

export interface AdminSession {
  token: string;
  adminId: string;
  email: string;
  name: string;
  role: AdminRole;
  permissions: AdminPermission[];
  createdAt: number;
  expiresAt: number;
  ipAddress?: string;
}

// Configured Master Admin Credentials for bootstrap & emergency recovery
export const MASTER_SUPER_ADMIN = {
  id: 'sa-master',
  email: 'nh979681@gmail.com',
  name: 'Dr. Nadir Hussain Dullu (Super Admin)',
  mobile: '+92 340 4777745',
  role: 'super_admin' as const,
};

// In-memory active session tokens store
const activeSessions = new Map<string, AdminSession>();

// Rate limiting tracker to prevent brute force
const failedAttempts = new Map<string, { count: number; lastAttempt: number }>();

export function loginAdmin(
  identifier?: string,
  password?: string,
  ipAddress = 'client'
): {
  success: boolean;
  token?: string;
  admin?: AdminUser;
  error?: string;
  lockoutRemainingSeconds?: number;
} {
  const now = Date.now();

  if (!identifier || !password) {
    return { success: false, error: 'Both email/mobile and password are required.' };
  }

  const cleanIdentifier = identifier.trim();

  // Simple brute-force lockout protection (7 failed attempts = 60-sec cooldown)
  const attemptInfo = failedAttempts.get(ipAddress);
  if (attemptInfo && attemptInfo.count >= 7) {
    const elapsed = now - attemptInfo.lastAttempt;
    if (elapsed < 60 * 1000) {
      const remainingSec = Math.ceil((60 * 1000 - elapsed) / 1000);
      return {
        success: false,
        error: `Too many failed login attempts. Please wait ${remainingSec} seconds before trying again.`,
        lockoutRemainingSeconds: remainingSec,
      };
    } else {
      failedAttempts.delete(ipAddress);
    }
  }

  // Lookup in persistent database
  const adminRecord = getAdminByEmailOrMobile(cleanIdentifier);

  let isAuthenticated = false;
  let authAdmin = adminRecord;

  if (adminRecord) {
    if (adminRecord.status === 'disabled') {
      recordAuditLog({
        userId: adminRecord.id,
        userName: adminRecord.name,
        userRole: adminRecord.role,
        action: 'Failed Login: Account is Disabled',
        affectedRecord: adminRecord.email,
        ipAddress,
      });
      return {
        success: false,
        error: 'This administrator account has been disabled. Please contact the Super Admin.',
      };
    }

    isAuthenticated = verifyPassword(password.trim(), adminRecord.passwordHash);
  } else if (
    cleanIdentifier.toLowerCase() === MASTER_SUPER_ADMIN.email.toLowerCase() &&
    password.trim() === 'fazal381381'
  ) {
    // Fallback bootstrap check
    isAuthenticated = true;
  }

  if (isAuthenticated && authAdmin) {
    // Reset failed counter
    failedAttempts.delete(ipAddress);

    // Generate token
    const token = `gfh_adm_${Math.random().toString(36).substring(2)}${Date.now().toString(36)}`;
    const session: AdminSession = {
      token,
      adminId: authAdmin.id,
      email: authAdmin.email,
      name: authAdmin.name,
      role: authAdmin.role,
      permissions: authAdmin.role === 'super_admin' ? [...ALL_PERMISSIONS] : authAdmin.permissions || [],
      createdAt: now,
      expiresAt: now + 7 * 24 * 60 * 60 * 1000, // 7 days session
      ipAddress,
    };

    activeSessions.set(token, session);

    // Record login audit log
    recordAuditLog({
      userId: authAdmin.id,
      userName: authAdmin.name,
      userRole: authAdmin.role,
      action: `Admin Login Successful (${authAdmin.role === 'super_admin' ? 'Super Admin' : 'Staff Admin'})`,
      affectedRecord: authAdmin.email,
      ipAddress,
    });

    return {
      success: true,
      token,
      admin: {
        id: authAdmin.id,
        email: authAdmin.email,
        name: authAdmin.name,
        mobile: authAdmin.mobile,
        role: authAdmin.role,
        status: authAdmin.status,
        permissions: authAdmin.role === 'super_admin' ? [...ALL_PERMISSIONS] : authAdmin.permissions,
      },
    };
  }

  // Increment failed attempts
  const currentCount = (attemptInfo?.count || 0) + 1;
  failedAttempts.set(ipAddress, { count: currentCount, lastAttempt: now });

  recordAuditLog({
    userId: 'unknown',
    userName: cleanIdentifier,
    userRole: 'admin',
    action: `Failed Login Attempt (Invalid credentials, attempt ${currentCount})`,
    affectedRecord: cleanIdentifier,
    ipAddress,
  });

  return {
    success: false,
    error: 'Invalid administrator credentials. Access denied.',
  };
}

export function verifyAdminSession(token?: string | null): {
  valid: boolean;
  admin?: AdminUser;
  adminId?: string;
  permissions?: AdminPermission[];
} {
  if (!token) return { valid: false };

  const session = activeSessions.get(token);
  if (!session) return { valid: false };

  if (Date.now() > session.expiresAt) {
    activeSessions.delete(token);
    return { valid: false };
  }

  // Check live record status in DB
  const liveAdmin = getAdminById(session.adminId);
  if (liveAdmin && liveAdmin.status === 'disabled') {
    activeSessions.delete(token);
    return { valid: false };
  }

  const effectivePermissions =
    liveAdmin && liveAdmin.role === 'super_admin'
      ? [...ALL_PERMISSIONS]
      : liveAdmin?.permissions || session.permissions;

  return {
    valid: true,
    adminId: session.adminId,
    permissions: effectivePermissions,
    admin: {
      id: liveAdmin ? liveAdmin.id : session.adminId,
      email: liveAdmin ? liveAdmin.email : session.email,
      name: liveAdmin ? liveAdmin.name : session.name,
      mobile: liveAdmin?.mobile,
      role: liveAdmin ? liveAdmin.role : session.role,
      status: liveAdmin?.status || 'active',
      permissions: effectivePermissions,
    },
  };
}

export function logoutAdmin(token?: string | null): boolean {
  if (!token) return false;
  const session = activeSessions.get(token);
  if (session) {
    recordAuditLog({
      userId: session.adminId,
      userName: session.name,
      userRole: session.role,
      action: 'Admin Logged Out',
      affectedRecord: session.email,
      ipAddress: session.ipAddress,
    });
  }
  return activeSessions.delete(token);
}

export function revokeSessionsForAdmin(adminId: string) {
  for (const [token, session] of activeSessions.entries()) {
    if (session.adminId === adminId) {
      activeSessions.delete(token);
    }
  }
}

// ==========================================
// EXPRESS MIDDLEWARES
// ==========================================

export interface AuthenticatedRequest extends Request {
  adminUser?: AdminUser;
  adminId?: string;
  adminPermissions?: AdminPermission[];
}

export function authMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const token = (req.headers['x-admin-token'] as string) || (req.headers.authorization?.replace(/^Bearer\s+/i, ''));
  if (!token) {
    return res.status(401).json({ error: 'Authorization token required. Please sign in.' });
  }

  const check = verifyAdminSession(token);
  if (!check.valid || !check.admin) {
    return res.status(401).json({ error: 'Session expired or invalid. Please sign in again.' });
  }

  req.adminUser = check.admin;
  req.adminId = check.adminId;
  req.adminPermissions = check.permissions;
  next();
}

export function requireSuperAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (!req.adminUser) {
    return res.status(401).json({ error: 'Authentication required.' });
  }

  if (req.adminUser.role !== 'super_admin') {
    return res.status(403).json({ error: 'Access Denied — Super Admin authorization required.' });
  }

  next();
}

export function requirePermission(permission: AdminPermission) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.adminUser) {
      return res.status(401).json({ error: 'Authentication required.' });
    }

    if (req.adminUser.role === 'super_admin') {
      return next();
    }

    const hasPermission = req.adminUser.permissions?.includes(permission);
    if (!hasPermission) {
      return res.status(403).json({
        error: `Access Denied — Missing required permission: ${permission}`,
      });
    }

    next();
  };
}

