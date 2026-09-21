import express, { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Enable CORS for development environments (e.g. localhost frontend on port 5173 talking to backend on port 3000)
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Supabase Configuration from Environment
const SUPABASE_URL = (process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '').trim();
const SUPABASE_ANON_KEY = (process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '').trim();
const SUPABASE_SERVICE_ROLE_KEY = (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || '').trim();

// Initialize Supabase Clients
const supabaseAnon = SUPABASE_URL && SUPABASE_ANON_KEY 
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: { persistSession: false, autoRefreshToken: false }
    })
  : null;

const supabaseAdmin = SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY
  ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false, autoRefreshToken: false }
    })
  : null;

// Types for Admin Directory Management
interface AdminRecord {
  id: string;
  email: string;
  name: string;
  role: 'superadmin' | 'editor';
  status: 'active' | 'deactivated';
  avatarUrl: string;
  lastLogin: string;
  createdAt: string;
}

const REGISTRY_FILE = path.join(process.cwd(), 'admins_registry.json');

// Persistent Admin Accounts Registry Helpers
function loadAdminRegistry(): AdminRecord[] {
  try {
    if (fs.existsSync(REGISTRY_FILE)) {
      const content = fs.readFileSync(REGISTRY_FILE, 'utf-8');
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Error reading admin registry file:', err);
  }
  return [];
}

function saveAdminRegistry(records: AdminRecord[]): void {
  try {
    fs.writeFileSync(REGISTRY_FILE, JSON.stringify(records, null, 2), 'utf-8');
  } catch (err) {
    console.warn('Error saving admin registry file:', err);
  }
}

function registerOrUpdateAdmin(record: Partial<AdminRecord> & { email: string }): AdminRecord {
  const list = loadAdminRegistry();
  const cleanEmail = record.email.toLowerCase().trim();
  const index = list.findIndex(a => a.email.toLowerCase() === cleanEmail || (record.id && a.id === record.id));

  const nowStr = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const nowCreated = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });

  if (index >= 0) {
    const existing = list[index];
    const updated: AdminRecord = {
      ...existing,
      ...record,
      id: record.id || existing.id,
      email: cleanEmail,
      name: record.name || existing.name || cleanEmail.split('@')[0],
      role: (record.role as any) || existing.role || 'superadmin',
      status: (record.status as any) || existing.status || 'active',
      avatarUrl: record.avatarUrl || existing.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
      lastLogin: record.lastLogin || existing.lastLogin || nowStr
    };
    list[index] = updated;
    saveAdminRegistry(list);
    return updated;
  } else {
    const created: AdminRecord = {
      id: record.id || `admin-${Date.now()}`,
      email: cleanEmail,
      name: record.name || cleanEmail.split('@')[0],
      role: (record.role as any) || 'superadmin',
      status: (record.status as any) || 'active',
      avatarUrl: record.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
      lastLogin: record.lastLogin || 'Never logged in',
      createdAt: record.createdAt || nowCreated
    };
    list.unshift(created);
    saveAdminRegistry(list);
    return created;
  }
}

// Helper: Determine if an authenticated Supabase user is an authorized administrator
function isUserAdmin(user: any): boolean {
  if (!user) return false;

  // 1. Explicitly deactivated or marked as non-admin
  if (user.user_metadata?.status === 'deactivated') return false;
  if (user.user_metadata?.role === 'customer' || user.app_metadata?.role === 'customer') return false;

  // 2. Check app_metadata (securely set by server / Supabase Admin API)
  if (user.app_metadata?.role === 'admin' || user.app_metadata?.is_admin === true) {
    return true;
  }

  // 3. Check user_metadata (role = superadmin, editor, admin)
  const metaRole = user.user_metadata?.role;
  if (['superadmin', 'editor', 'admin'].includes(metaRole) || user.user_metadata?.is_admin === true) {
    return true;
  }

  // 4. If user exists in registry
  const userEmail = (user.email || '').toLowerCase().trim();
  const registry = loadAdminRegistry();
  const regMatch = registry.find(a => a.email.toLowerCase() === userEmail);
  if (regMatch) {
    return regMatch.status !== 'deactivated';
  }

  // 5. Direct Supabase Dashboard Users:
  // When an admin is created in Supabase Dashboard (Auth -> Users -> Create User),
  // they authenticate with valid Supabase Auth credentials. Unless explicitly customer/deactivated,
  // they are authorized as an administrator.
  if (!metaRole) {
    return true;
  }

  return false;
}

// Middleware: Authenticate and Authorize Admin from Bearer Token
async function requireAdminAuth(req: Request, res: Response, next: () => void) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : '';

  if (!token) {
    return res.status(401).json({ success: false, error: 'Authorization token missing.' });
  }

  if (!supabaseAnon) {
    return res.status(500).json({ success: false, error: 'Supabase is not configured on the server.' });
  }

  try {
    const { data: { user }, error } = await supabaseAnon.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ success: false, error: 'Invalid or expired session token.' });
    }

    if (!isUserAdmin(user)) {
      return res.status(403).json({ success: false, error: 'Access Denied: You are not an authorized administrator.' });
    }

    if (user.user_metadata?.status === 'deactivated') {
      return res.status(403).json({ success: false, error: 'This administrator account has been deactivated.' });
    }

    (req as any).adminUser = user;
    next();
  } catch (err: any) {
    console.error('requireAdminAuth error:', err);
    return res.status(500).json({ success: false, error: 'Failed to verify admin credentials.' });
  }
}

// ==========================================
// ADMIN AUTHENTICATION & AUTHORIZATION APIS
// ==========================================

// Health Check
app.get('/api/health', (_req, res) => {
  const serviceRoleRole = (() => {
    try {
      if (!SUPABASE_SERVICE_ROLE_KEY) return 'missing';
      if (SUPABASE_SERVICE_ROLE_KEY.startsWith('sb_publishable_')) return 'anon_publishable';
      const payload = JSON.parse(Buffer.from(SUPABASE_SERVICE_ROLE_KEY.split('.')[1], 'base64').toString());
      return payload.role || 'unknown';
    } catch {
      return 'invalid_format';
    }
  })();

  res.json({
    status: 'ok',
    service: 'CartG Admin Backend',
    supabaseConfigured: Boolean(supabaseAnon),
    serviceRoleConfigured: Boolean(supabaseAdmin),
    serviceRoleRole,
    isProperServiceRole: serviceRoleRole === 'service_role'
  });
});

/**
 * 1. Admin Authorization Check
 * Validates the caller's Supabase session token and returns their authorization status.
 */
app.post('/api/admin/authorize', async (req: Request, res: Response) => {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : '';

  if (!token) {
    return res.status(401).json({ authorized: false, error: 'No authorization token provided.' });
  }

  if (!supabaseAnon) {
    return res.status(500).json({ authorized: false, error: 'Supabase is not configured on the server.' });
  }

  try {
    const { data: { user }, error } = await supabaseAnon.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ authorized: false, error: 'Invalid or expired session.' });
    }

    if (user.user_metadata?.status === 'deactivated') {
      return res.status(403).json({
        authorized: false,
        error: 'This administrator account has been deactivated. Please contact store management.'
      });
    }

    if (user.user_metadata?.role === 'customer' || user.app_metadata?.role === 'customer') {
      return res.status(403).json({
        authorized: false,
        error: 'Access Denied: This account is not authorized as an administrator.'
      });
    }

    const authorized = isUserAdmin(user);
    if (!authorized) {
      return res.status(403).json({
        authorized: false,
        error: 'Access Denied: This account is not listed as an authorized administrator.'
      });
    }

    const cleanEmail = (user.email || '').toLowerCase();
    const assignedRole = user.user_metadata?.role || user.app_metadata?.role || 'superadmin';
    const cleanName = user.user_metadata?.name || user.user_metadata?.full_name || cleanEmail.split('@')[0] || 'Administrator';

    const adminData = registerOrUpdateAdmin({
      id: user.id,
      email: cleanEmail,
      name: cleanName,
      role: assignedRole as any,
      status: 'active',
      avatarUrl: user.user_metadata?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
      lastLogin: new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    });

    return res.json({
      authorized: true,
      user: adminData
    });
  } catch (err: any) {
    console.error('Authorize admin exception:', err);
    return res.status(500).json({ authorized: false, error: err?.message || 'Server error during authorization.' });
  }
});

/**
 * 2. List Administrator Accounts from Supabase Auth
 * Returns all authorized CartG admins:
 * - Super admin
 * - Admins created from Admin Panel
 * - Admins created directly in Supabase Dashboard
 */
app.get('/api/admin/list-users', requireAdminAuth, async (req: Request, res: Response) => {
  const currentUser = (req as any).adminUser;
  let admins = loadAdminRegistry();

  // 1. If supabaseAdmin is available, attempt to sync users from Supabase Auth
  if (supabaseAdmin) {
    try {
      const { data, error } = await supabaseAdmin.auth.admin.listUsers();
      if (!error && data?.users && Array.isArray(data.users)) {
        const adminUsers = data.users.filter(u => isUserAdmin(u));
        const activeIds = new Set(adminUsers.map(u => u.id));
        const activeEmails = new Set(adminUsers.map(u => (u.email || '').toLowerCase()));
        
        // Prune accounts deleted in Supabase
        admins = admins.filter(a => activeIds.has(a.id) || activeEmails.has(a.email.toLowerCase()));
        saveAdminRegistry(admins);

        for (const u of adminUsers) {
          const uEmail = (u.email || '').toLowerCase();
          registerOrUpdateAdmin({
            id: u.id,
            email: uEmail,
            name: u.user_metadata?.name || u.user_metadata?.full_name || uEmail.split('@')[0] || 'Administrator',
            role: (u.user_metadata?.role as any) || (u.app_metadata?.role as any) || 'superadmin',
            status: u.user_metadata?.status || 'active',
            createdAt: u.created_at
              ? new Date(u.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
              : undefined,
            lastLogin: u.last_sign_in_at
              ? new Date(u.last_sign_in_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
              : undefined
          });
        }
        admins = loadAdminRegistry();
      }
    } catch (adminApiErr: any) {
      // Non-fatal: continue with persistent registry
      console.warn('Supabase Admin listUsers notice (using synchronized registry):', adminApiErr?.message);
    }
  }

  // 1b. If list_admin_users RPC is available, synchronize users directly from Supabase
  if (supabaseAnon) {
    try {
      const authHeader = req.headers.authorization || '';
      const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : '';
      if (token) {
        const authedClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
          global: { headers: { Authorization: `Bearer ${token}` } },
          auth: { persistSession: false, autoRefreshToken: false }
        });
        const { data: rpcUsers, error: rpcErr } = await authedClient.rpc('list_admin_users');
        if (!rpcErr && Array.isArray(rpcUsers)) {
          const rpcIds = new Set(rpcUsers.map(u => u.id));
          const rpcEmails = new Set(rpcUsers.map(u => (u.email || '').toLowerCase()));
          
          // Prune accounts deleted in Supabase
          admins = admins.filter(a => rpcIds.has(a.id) || rpcEmails.has(a.email.toLowerCase()));
          saveAdminRegistry(admins);

          for (const u of rpcUsers) {
            const uEmail = (u.email || '').toLowerCase();
            registerOrUpdateAdmin({
              id: u.id,
              email: uEmail,
              name: u.raw_user_meta_data?.name || u.raw_user_meta_data?.full_name || uEmail.split('@')[0] || 'Administrator',
              role: (u.raw_user_meta_data?.role as any) || (u.raw_app_meta_data?.role as any) || 'superadmin',
              status: u.raw_user_meta_data?.status || 'active',
              createdAt: u.created_at
                ? new Date(u.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
                : undefined,
              lastLogin: u.last_sign_in_at
                ? new Date(u.last_sign_in_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
                : undefined
            });
          }
          admins = loadAdminRegistry();
        }
      }
    } catch (_rpcErr) {
      // Non-fatal: continue with registry
    }
  }

  // 2. Ensure the currently authenticated admin has their latest session active
  if (currentUser) {
    const cEmail = (currentUser.email || '').toLowerCase();
    registerOrUpdateAdmin({
      id: currentUser.id,
      email: cEmail,
      name: currentUser.user_metadata?.name || currentUser.user_metadata?.full_name || cEmail.split('@')[0] || 'Administrator',
      role: (currentUser.user_metadata?.role as any) || (currentUser.app_metadata?.role as any) || 'superadmin',
      status: currentUser.user_metadata?.status || 'active',
      lastLogin: new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    });
    admins = loadAdminRegistry();
  }

  return res.json({ success: true, accounts: admins });
});

/**
 * 3. Create Additional Administrator via Backend Supabase Auth
 * Keeps credentials and service-role key secure on backend.
 */
app.post('/api/admin/create-user', requireAdminAuth, async (req: Request, res: Response) => {
  const { name, email, password, role } = req.body;

  const cleanName = (name || '').trim();
  const cleanEmail = (email || '').toLowerCase().trim();

  if (!cleanName) {
    return res.status(400).json({ success: false, error: 'Administrator full name is required.' });
  }

  if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
    return res.status(400).json({ success: false, error: 'Valid email address is required.' });
  }

  if (!password || password.length < 6) {
    return res.status(400).json({ success: false, error: 'Password must be at least 6 characters.' });
  }

  const assignedRole = role === 'editor' ? 'editor' : 'superadmin';
  let createdUserId: string | null = null;

  // Attempt 1: Via supabaseAdmin Admin API if available
  if (supabaseAdmin) {
    try {
      const { data, error } = await supabaseAdmin.auth.admin.createUser({
        email: cleanEmail,
        password,
        email_confirm: true,
        user_metadata: {
          name: cleanName,
          full_name: cleanName,
          role: assignedRole,
          status: 'active',
          is_admin: true
        },
        app_metadata: {
          role: 'admin',
          is_admin: true
        }
      });

      if (!error && data?.user) {
        createdUserId = data.user.id;
      } else if (error) {
        if (error.message?.toLowerCase().includes('already registered')) {
          return res.status(400).json({ success: false, error: 'An account with this email already exists in Supabase Authentication.' });
        }
        console.warn('supabaseAdmin.auth.admin.createUser fallback notice:', error.message);
      }
    } catch (adminErr: any) {
      console.warn('supabaseAdmin.auth.admin.createUser exception:', adminErr?.message);
    }
  }

  // Attempt 2: Via supabaseAnon.auth.signUp endpoint
  if (!createdUserId && supabaseAnon) {
    try {
      const { data, error } = await supabaseAnon.auth.signUp({
        email: cleanEmail,
        password,
        options: {
          data: {
            name: cleanName,
            full_name: cleanName,
            role: assignedRole,
            status: 'active',
            is_admin: true
          }
        }
      });

      if (error) {
        if (error.message?.toLowerCase().includes('already registered')) {
          return res.status(400).json({ success: false, error: 'An account with this email already exists in Supabase Authentication.' });
        }
        return res.status(400).json({ success: false, error: error.message });
      }

      if (data?.user) {
        createdUserId = data.user.id;
      }
    } catch (anonErr: any) {
      console.error('supabaseAnon.auth.signUp exception:', anonErr);
      return res.status(500).json({ success: false, error: anonErr?.message || 'Failed to register administrator in Supabase Auth.' });
    }
  }

  if (!createdUserId) {
    createdUserId = `admin-${Date.now()}`;
  }

  // Register in persistent admin directory
  const newAccount = registerOrUpdateAdmin({
    id: createdUserId,
    email: cleanEmail,
    name: cleanName,
    role: assignedRole,
    status: 'active',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
    lastLogin: 'Never logged in',
    createdAt: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
  });

  return res.json({
    success: true,
    account: newAccount,
    user: newAccount
  });
});

/**
 * 4. Toggle Administrator Status (Active / Deactivated) in Supabase Auth
 */
app.post('/api/admin/toggle-user-status', requireAdminAuth, async (req: Request, res: Response) => {
  try {
    const currentUser = (req as any).adminUser;
    const { id, status } = req.body;

    if (!id) {
      return res.status(400).json({ success: false, error: 'Target admin user ID is required.' });
    }

    if (currentUser && (currentUser.id === id || (currentUser.email || '').toLowerCase() === String(id).toLowerCase())) {
      return res.status(400).json({ success: false, error: 'You cannot deactivate your own currently active administrator account.' });
    }

    const newStatus = status === 'deactivated' ? 'deactivated' : 'active';

    // Update in persistent registry
    const list = loadAdminRegistry();
    const target = list.find(a => a.id === id || a.email.toLowerCase() === String(id).toLowerCase());
    if (target) {
      target.status = newStatus;
      saveAdminRegistry(list);
    }

    // Attempt update in Supabase Admin API if configured
    if (supabaseAdmin) {
      try {
        const { data: targetUser } = await supabaseAdmin.auth.admin.getUserById(id);
        if (targetUser?.user) {
          await supabaseAdmin.auth.admin.updateUserById(id, {
            user_metadata: {
              ...targetUser.user.user_metadata,
              status: newStatus
            }
          });
        }
      } catch (err: any) {
        console.warn('Supabase toggle status notice:', err?.message);
      }
    }

    return res.json({ success: true, status: newStatus });
  } catch (err: any) {
    console.error('API /api/admin/toggle-user-status exception:', err);
    return res.status(500).json({ success: false, error: err?.message || 'Failed to update user status.' });
  }
});

/**
 * 5. Delete Administrator from Supabase Auth
 */
app.post('/api/admin/delete-user', requireAdminAuth, async (req: Request, res: Response) => {
  try {
    const currentUser = (req as any).adminUser;
    const { id, email } = req.body;

    if (!id && !email) {
      return res.status(400).json({ success: false, error: 'Target admin user ID or email is required.' });
    }

    const targetId = String(id || '').trim();
    const targetEmail = String(email || '').toLowerCase().trim();

    // Prevent self-deletion
    if (
      currentUser &&
      ((targetId && currentUser.id === targetId) ||
       (currentUser.email && targetEmail && currentUser.email.toLowerCase() === targetEmail) ||
       (currentUser.email && targetId && currentUser.email.toLowerCase() === targetId.toLowerCase()))
    ) {
      return res.status(400).json({
        success: false,
        error: 'You cannot delete your own currently active administrator account.'
      });
    }

    // Verify target exists in registry or auth
    const list = loadAdminRegistry();
    const targetAdmin = list.find(a => (targetId && a.id === targetId) || (targetEmail && a.email.toLowerCase() === targetEmail));
    const effectiveUserId = targetId || targetAdmin?.id;
    const effectiveEmail = targetEmail || targetAdmin?.email?.toLowerCase();

    // Protect against deleting the only active superadmin
    if (targetAdmin?.role === 'superadmin') {
      const remainingSuperadmins = list.filter(
        a => a.id !== targetAdmin.id && a.role === 'superadmin' && a.status !== 'deactivated'
      );
      if (remainingSuperadmins.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'Cannot delete the only remaining active Superadmin account.'
        });
      }
    }

    let deletedFromSupabase = false;
    let supabaseErrorMessage = '';

    // 1. Primary Deletion: Supabase Admin API via service-role key
    if (supabaseAdmin && effectiveUserId) {
      try {
        const { data, error } = await supabaseAdmin.auth.admin.deleteUser(effectiveUserId);
        if (!error) {
          deletedFromSupabase = true;
        } else {
          supabaseErrorMessage = error.message;
          console.warn('supabaseAdmin.auth.admin.deleteUser notice:', error.message);

          // If error was 404 (user not found by ID), try matching by email if available in Supabase Auth
          if (effectiveEmail && (error.status === 404 || error.message?.toLowerCase().includes('not found'))) {
            try {
              const { data: userListData } = await supabaseAdmin.auth.admin.listUsers();
              const foundUser = userListData?.users?.find(u => (u.email || '').toLowerCase() === effectiveEmail);
              if (foundUser && foundUser.id !== effectiveUserId) {
                const retry = await supabaseAdmin.auth.admin.deleteUser(foundUser.id);
                if (!retry.error) {
                  deletedFromSupabase = true;
                  supabaseErrorMessage = '';
                }
              }
            } catch (_lookupErr) {}
          }
        }
      } catch (adminErr: any) {
        supabaseErrorMessage = adminErr?.message || 'Error communicating with Supabase Admin API.';
        console.warn('supabaseAdmin.auth.admin.deleteUser exception:', adminErr);
      }
    }

    // 2. Secondary Deletion: Supabase RPC (delete_admin_user) if available
    if (!deletedFromSupabase && supabaseAnon && effectiveUserId) {
      try {
        const authHeader = req.headers.authorization || '';
        const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : '';
        if (token) {
          const authedClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
            global: { headers: { Authorization: `Bearer ${token}` } },
            auth: { persistSession: false, autoRefreshToken: false }
          });
          const { error: rpcErr } = await authedClient.rpc('delete_admin_user', {
            target_user_id: effectiveUserId
          });
          if (!rpcErr) {
            deletedFromSupabase = true;
            supabaseErrorMessage = '';
          } else if (rpcErr.code !== 'PGRST202') {
            supabaseErrorMessage = rpcErr.message;
          }
        }
      } catch (_rpcErr) {}
    }

    // Prune from persistent admin directory
    const updatedList = list.filter(
      a => (effectiveUserId ? a.id !== effectiveUserId : true) && (effectiveEmail ? a.email.toLowerCase() !== effectiveEmail : true)
    );
    saveAdminRegistry(updatedList);

    if (!deletedFromSupabase && supabaseErrorMessage) {
      console.warn('Supabase Auth user deletion notice (Service-role key restricted or not configured):', supabaseErrorMessage);
    }

    // Check if SUPABASE_SERVICE_ROLE_KEY is set to anon key instead of actual service_role key
    const isAnonKeyInServiceRole = SUPABASE_SERVICE_ROLE_KEY.startsWith('sb_publishable_') || (() => {
      try {
        const payload = JSON.parse(Buffer.from(SUPABASE_SERVICE_ROLE_KEY.split('.')[1], 'base64').toString());
        return payload.role === 'anon';
      } catch {
        return false;
      }
    })();

    return res.json({
      success: true,
      deletedFromSupabase,
      serviceRoleKeyIssue: !deletedFromSupabase && isAnonKeyInServiceRole,
      message: deletedFromSupabase
        ? 'Administrator account deleted successfully from Supabase Authentication.'
        : isAnonKeyInServiceRole
          ? 'Administrator account removed from Admin Directory. Note: To delete the user from Supabase Authentication list, update SUPABASE_SERVICE_ROLE_KEY with the secret service_role key from your Supabase Dashboard -> Project Settings -> API.'
          : 'Administrator account removed from Admin Directory.'
    });
  } catch (err: any) {
    console.error('API /api/admin/delete-user exception:', err);
    return res.status(500).json({ success: false, error: err?.message || 'Failed to delete user.' });
  }
});

// Catch-all handler for all /api endpoints to guarantee JSON response and prevent fallback to Vite index.html
app.all('/api/*', (_req: Request, res: Response) => {
  res.setHeader('Content-Type', 'application/json');
  res.status(404).json({ success: false, error: 'API endpoint not found.' });
});

// ==========================================
// VITE MIDDLEWARE & STATIC ASSET SERVING
// ==========================================

async function start() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`CartG Server running on http://0.0.0.0:${PORT}`);
  });
}

start();
