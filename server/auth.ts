// server/auth.ts - Admin Authentication & Session Management
// Gulzar Family Hospital & Children Center

export interface AdminUser {
  email: string;
  name: string;
  role: 'super_admin' | 'admin';
}

export interface AdminSession {
  token: string;
  email: string;
  name: string;
  role: string;
  createdAt: number;
  expiresAt: number;
}

// Configured Master Admin Credentials
export const ADMIN_CREDENTIALS = {
  email: 'nh979681@gmail.com',
  password: 'fazal381381',
  name: 'Dr. Nadir Hussain Dullu (Super Admin)',
  role: 'super_admin' as const,
};

// In-memory active session tokens store (persists across tab navigations)
const activeSessions = new Map<string, AdminSession>();

// Rate limiting tracker to prevent brute force
const failedAttempts = new Map<string, { count: number; lastAttempt: number }>();

export function loginAdmin(email?: string, password?: string, ipAddress = 'client'): {
  success: boolean;
  token?: string;
  admin?: AdminUser;
  error?: string;
  lockoutRemainingSeconds?: number;
} {
  const now = Date.now();
  const attemptInfo = failedAttempts.get(ipAddress);

  // Simple brute-force lockout protection (5 failed attempts = 30-sec cooldown)
  if (attemptInfo && attemptInfo.count >= 5) {
    const elapsed = now - attemptInfo.lastAttempt;
    if (elapsed < 30 * 1000) {
      const remainingSec = Math.ceil((30 * 1000 - elapsed) / 1000);
      return {
        success: false,
        error: `Too many failed attempts. Please wait ${remainingSec} seconds before trying again.`,
        lockoutRemainingSeconds: remainingSec,
      };
    } else {
      // Cooldown expired, reset attempts
      failedAttempts.delete(ipAddress);
    }
  }

  if (!email || !password) {
    return { success: false, error: 'Both email address and password are required.' };
  }

  const cleanEmail = email.trim().toLowerCase();
  const isEmailMatch = cleanEmail === ADMIN_CREDENTIALS.email.toLowerCase();
  const isPasswordMatch = password.trim() === ADMIN_CREDENTIALS.password;

  if (isEmailMatch && isPasswordMatch) {
    // Reset failed counter
    failedAttempts.delete(ipAddress);

    // Generate token
    const token = `gfh_adm_${Math.random().toString(36).substring(2)}${Date.now().toString(36)}`;
    const session: AdminSession = {
      token,
      email: ADMIN_CREDENTIALS.email,
      name: ADMIN_CREDENTIALS.name,
      role: ADMIN_CREDENTIALS.role,
      createdAt: now,
      expiresAt: now + 7 * 24 * 60 * 60 * 1000, // 7 days session
    };

    activeSessions.set(token, session);

    return {
      success: true,
      token,
      admin: {
        email: ADMIN_CREDENTIALS.email,
        name: ADMIN_CREDENTIALS.name,
        role: ADMIN_CREDENTIALS.role,
      },
    };
  }

  // Increment failed attempts
  const currentCount = (attemptInfo?.count || 0) + 1;
  failedAttempts.set(ipAddress, { count: currentCount, lastAttempt: now });

  return {
    success: false,
    error: 'Invalid administrator email address or password. Access denied.',
  };
}

export function verifyAdminSession(token?: string | null): {
  valid: boolean;
  admin?: AdminUser;
} {
  if (!token) return { valid: false };

  const session = activeSessions.get(token);
  if (!session) return { valid: false };

  if (Date.now() > session.expiresAt) {
    activeSessions.delete(token);
    return { valid: false };
  }

  return {
    valid: true,
    admin: {
      email: session.email,
      name: session.name,
      role: session.role as 'super_admin' | 'admin',
    },
  };
}

export function logoutAdmin(token?: string | null): boolean {
  if (!token) return false;
  return activeSessions.delete(token);
}
