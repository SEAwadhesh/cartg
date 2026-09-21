import React, { useState, useEffect } from 'react';
import { useData } from '../../context/DataContext';
import { AdminUser } from '../../types';
import { 
  Shield, 
  ShieldCheck, 
  UserPlus, 
  Trash2, 
  Power, 
  Search, 
  Mail, 
  User, 
  Lock, 
  Eye, 
  EyeOff, 
  AlertTriangle, 
  Check, 
  X, 
  KeyRound,
  ShieldAlert,
  RefreshCw
} from 'lucide-react';

export const AdminAccounts: React.FC = () => {
  const { 
    adminUser, 
    adminAccounts, 
    refreshAdminAccounts,
    createAdminAccount, 
    deleteAdminAccount, 
    toggleAdminAccountStatus,
    addToast 
  } = useData();

  const [isRefreshing, setIsRefreshing] = useState(false);

  // Automatically refresh and synchronize administrator accounts directory on mount or session change
  useEffect(() => {
    refreshAdminAccounts();
  }, [adminUser?.id]);

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    const res = await refreshAdminAccounts();
    setIsRefreshing(false);
    if (res.success) {
      addToast('success', 'Directory Synchronized', `Synchronized ${res.count} administrator accounts from Supabase.`);
    } else {
      addToast('error', 'Sync Failed', res.error || 'Failed to refresh accounts');
    }
  };

  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'superadmin' | 'editor'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'deactivated'>('all');

  // Create Admin Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'superadmin' | 'editor'>('superadmin');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Deletion / Deactivation Confirmation State
  const [confirmAction, setConfirmAction] = useState<{
    type: 'delete' | 'toggle_status';
    account: AdminUser;
  } | null>(null);
  const [isProcessingAction, setIsProcessingAction] = useState(false);

  // Filter and search accounts
  const filteredAccounts = (adminAccounts || []).filter((account) => {
    const matchesSearch = 
      account.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      account.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesRole = roleFilter === 'all' || account.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || (account.status || 'active') === statusFilter;

    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleOpenCreateModal = () => {
    setFullName('');
    setEmail('');
    setRole('superadmin');
    setPassword('');
    setConfirmPassword('');
    setShowPassword(false);
    setShowConfirmPassword(false);
    setFormError(null);
    setIsCreateModalOpen(true);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const cleanName = fullName.trim();
    const cleanEmail = email.trim().toLowerCase();

    // 1. Basic field presence
    if (!cleanName) {
      setFormError('Please enter administrator full name.');
      return;
    }

    if (!cleanEmail) {
      setFormError('Please enter an email address.');
      return;
    }

    // 2. Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      setFormError('Please enter a valid email address format (e.g. name@domain.com).');
      return;
    }

    // 3. Password length
    if (!password || password.length < 6) {
      setFormError('Password must be at least 6 characters long.');
      return;
    }

    // 4. Password confirmation match
    if (password !== confirmPassword) {
      setFormError('Passwords do not match. Please re-enter.');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await createAdminAccount({
        name: cleanName,
        email: cleanEmail,
        password,
        role
      });

      if (res.success) {
        setIsCreateModalOpen(false);
        setFullName('');
        setEmail('');
        setPassword('');
        setConfirmPassword('');
      } else {
        setFormError(res.error || 'Failed to create administrator account.');
      }
    } catch (err: any) {
      setFormError(err?.message || 'An unexpected error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleExecuteConfirmAction = async () => {
    if (!confirmAction) return;

    setIsProcessingAction(true);
    try {
      if (confirmAction.type === 'delete') {
        const res = await deleteAdminAccount(confirmAction.account.id);
        if (!res.success && res.error) {
          setFormError(res.error);
        }
      } else if (confirmAction.type === 'toggle_status') {
        const res = await toggleAdminAccountStatus(confirmAction.account.id);
        if (!res.success && res.error) {
          setFormError(res.error);
        }
      }
      setConfirmAction(null);
    } catch (err: any) {
      setFormError(err?.message || 'Action failed.');
      setConfirmAction(null);
    } finally {
      setIsProcessingAction(false);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      
      {/* Header Actions Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 sm:p-8 rounded-3xl border border-neutral-200 shadow-xs">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200 mb-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Role-Based Access Control</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-neutral-900 tracking-tight">
            Administrator Accounts Directory
          </h1>
          <p className="text-xs text-neutral-500 max-w-xl">
            Manage authorized staff accounts, assign store administration roles, and oversee portal access permissions.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            type="button"
            onClick={handleManualRefresh}
            disabled={isRefreshing}
            className="inline-flex items-center gap-2 px-4 py-3 rounded-2xl bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-xs font-bold active:scale-[0.98] transition-all shrink-0 cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 text-neutral-600 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>{isRefreshing ? 'Syncing...' : 'Refresh Directory'}</span>
          </button>

          <button
            type="button"
            onClick={handleOpenCreateModal}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 active:scale-[0.98] transition-all shrink-0 cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>Create New Admin</span>
          </button>
        </div>
      </div>

      {/* Security & Active Session Notice */}
      <div className="p-5 rounded-3xl bg-neutral-900 text-white border border-neutral-800 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0">
            <Shield className="w-5 h-5" />
          </div>
          <div className="space-y-0.5">
            <h3 className="text-xs font-bold text-neutral-100 flex items-center gap-2">
              <span>Administrator Portal Security</span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-semibold border border-emerald-500/30">
                Protected Access
              </span>
            </h3>
            <p className="text-[11px] text-neutral-400">
              Only authorized administrators are permitted. Role permissions and account statuses are enforced in real-time.
            </p>
          </div>
        </div>

        <div className="text-right text-[11px] text-neutral-400 shrink-0 self-end md:self-auto">
          Active Session: <span className="text-emerald-400 font-bold">{adminUser?.name || 'Store Manager'}</span> ({adminUser?.role || 'superadmin'})
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-neutral-200 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Search Bar */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search admins by name or email..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-neutral-50 border border-neutral-200 text-neutral-900 text-xs focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 text-xs"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Role Filter */}
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value as any)}
            className="px-3 py-2 rounded-xl bg-neutral-50 border border-neutral-200 text-neutral-700 text-xs font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
          >
            <option value="all">All Roles</option>
            <option value="superadmin">Superadmins</option>
            <option value="editor">Store Editors</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-3 py-2 rounded-xl bg-neutral-50 border border-neutral-200 text-neutral-700 text-xs font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active Only</option>
            <option value="deactivated">Deactivated Only</option>
          </select>
        </div>
      </div>

      {/* Admin Accounts Table / Card Grid */}
      <div className="bg-white rounded-3xl border border-neutral-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-neutral-100 flex items-center justify-between flex-wrap gap-2">
          <div>
            <h2 className="text-sm font-bold text-neutral-900">Administrator Accounts Directory</h2>
            <p className="text-xs text-neutral-500">
              Showing {filteredAccounts.length} of {adminAccounts.length} total administrator account{adminAccounts.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>

        {filteredAccounts.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-neutral-100 text-neutral-400 flex items-center justify-center mx-auto">
              <User className="w-6 h-6" />
            </div>
            <p className="text-xs font-bold text-neutral-700">No administrator accounts match your filter.</p>
            <p className="text-xs text-neutral-400">Try adjusting your search terms or click "Create New Admin" above.</p>
          </div>
        ) : (
          <div className="divide-y divide-neutral-100">
            {filteredAccounts.map((account) => {
              const isCurrentUser = Boolean(
                (adminUser?.email && account.email && adminUser.email.toLowerCase() === account.email.toLowerCase()) || 
                (adminUser?.id && account.id && adminUser.id === account.id)
              );
              const isActive = (account.status || 'active') === 'active';

              return (
                <div 
                  key={account.id} 
                  className={`p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors ${
                    isCurrentUser ? 'bg-emerald-50/40 hover:bg-emerald-50/60' : 'hover:bg-neutral-50/80'
                  }`}
                >
                  {/* Account Information */}
                  <div className="flex items-start sm:items-center gap-4 min-w-0">
                    {/* Avatar */}
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white flex items-center justify-center font-black text-base shadow-sm shrink-0">
                      {account.name.charAt(0).toUpperCase() || 'A'}
                    </div>

                    <div className="min-w-0 space-y-1">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <span className="text-sm font-black text-neutral-900 truncate">
                          {account.name}
                        </span>

                        {isCurrentUser && (
                          <span className="px-2 py-0.5 rounded-md bg-emerald-600 text-white text-[10px] font-bold uppercase tracking-wider">
                            You (Current)
                          </span>
                        )}

                        {/* Role Badge */}
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          account.role === 'superadmin'
                            ? 'bg-purple-100 text-purple-800 border border-purple-200'
                            : 'bg-blue-100 text-blue-800 border border-blue-200'
                        }`}>
                          {account.role || 'Superadmin'}
                        </span>

                        {/* Status Badge */}
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 ${
                          isActive
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-emerald-600' : 'bg-rose-600'}`} />
                          <span>{isActive ? 'Active' : 'Deactivated'}</span>
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-xs text-neutral-600 flex-wrap">
                        <span className="font-mono text-neutral-800">{account.email}</span>
                        <span>•</span>
                        <span className="text-neutral-400">Created: {account.createdAt || 'Initial setup'}</span>
                        <span>•</span>
                        <span className="text-neutral-400">Last login: {account.lastLogin || 'Never'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                    {/* Deactivate/Activate toggle */}
                    <button
                      type="button"
                      disabled={isCurrentUser}
                      onClick={() => setConfirmAction({ type: 'toggle_status', account })}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors ${
                        isCurrentUser 
                          ? 'opacity-40 cursor-not-allowed bg-neutral-100 text-neutral-400 border-neutral-200'
                          : isActive
                          ? 'bg-white hover:bg-amber-50 text-amber-700 border-amber-200 cursor-pointer'
                          : 'bg-white hover:bg-emerald-50 text-emerald-700 border-emerald-200 cursor-pointer'
                      }`}
                      title={isCurrentUser ? 'Cannot modify your own active account' : isActive ? 'Deactivate account' : 'Reactivate account'}
                    >
                      <Power className="w-3.5 h-3.5" />
                      <span>{isActive ? 'Deactivate' : 'Reactivate'}</span>
                    </button>

                    {/* Delete button */}
                    <button
                      type="button"
                      disabled={isCurrentUser}
                      onClick={() => setConfirmAction({ type: 'delete', account })}
                      className={`p-2 rounded-xl border transition-colors ${
                        isCurrentUser
                          ? 'opacity-40 cursor-not-allowed bg-neutral-100 text-neutral-400 border-neutral-200'
                          : 'bg-white hover:bg-rose-50 text-neutral-600 hover:text-rose-600 border-neutral-200 hover:border-rose-200 cursor-pointer'
                      }`}
                      title={isCurrentUser ? 'Cannot delete your own active account' : 'Delete administrator'}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Create New Admin Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl border border-neutral-200 shadow-2xl max-w-lg w-full p-6 sm:p-8 space-y-6 animate-in fade-in zoom-in-95 duration-150">
            
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-3 pb-4 border-b border-neutral-100">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[11px] font-bold">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" />
                  <span>Supabase Authentication</span>
                </div>
                <h2 className="text-lg font-black text-neutral-900">Create New Administrator</h2>
                <p className="text-xs text-neutral-500">Provide user credentials to grant dashboard access.</p>
              </div>

              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1.5 rounded-xl text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Error Message Box */}
            {formError && (
              <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-xs text-rose-800">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div className="font-medium">{formError}</div>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleCreateSubmit} className="space-y-4">
              
              {/* Full Name */}
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1.5 uppercase tracking-wider">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Ramesh Kumar"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-neutral-50 border border-neutral-300 text-neutral-900 text-xs focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all font-medium"
                  />
                </div>
              </div>

              {/* Email Address */}
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1.5 uppercase tracking-wider">
                  Email Address <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. ramesh.kumar@business.com"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-neutral-50 border border-neutral-300 text-neutral-900 text-xs focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all font-medium"
                  />
                </div>
              </div>

              {/* Role Selection */}
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1.5 uppercase tracking-wider">
                  Administrator Role <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setRole('superadmin')}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                      role === 'superadmin'
                        ? 'border-emerald-600 bg-emerald-50/60 ring-2 ring-emerald-600'
                        : 'border-neutral-200 bg-neutral-50 hover:bg-neutral-100'
                    }`}
                  >
                    <div className="text-xs font-bold text-neutral-900 flex items-center gap-1.5">
                      <Shield className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Superadmin</span>
                    </div>
                    <p className="text-[10px] text-neutral-500 mt-0.5">Full control over inventory, admins & settings</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRole('editor')}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                      role === 'editor'
                        ? 'border-emerald-600 bg-emerald-50/60 ring-2 ring-emerald-600'
                        : 'border-neutral-200 bg-neutral-50 hover:bg-neutral-100'
                    }`}
                  >
                    <div className="text-xs font-bold text-neutral-900 flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-blue-600" />
                      <span>Store Editor</span>
                    </div>
                    <p className="text-[10px] text-neutral-500 mt-0.5">Manage products, gallery and customer orders</p>
                  </button>
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1.5 uppercase tracking-wider">
                  Password <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-neutral-50 border border-neutral-300 text-neutral-900 text-xs focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {password.length > 0 && password.length < 6 && (
                  <p className="text-[11px] text-amber-600 font-medium mt-1">Must be at least 6 characters</p>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1.5 uppercase tracking-wider">
                  Confirm Password <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat password"
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-neutral-50 border border-neutral-300 text-neutral-900 text-xs focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {confirmPassword && password !== confirmPassword && (
                  <p className="text-[11px] text-rose-600 font-medium mt-1">Passwords do not match</p>
                )}
                {confirmPassword && password === confirmPassword && (
                  <p className="text-[11px] text-emerald-600 font-medium mt-1 flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" /> Passwords match
                  </p>
                )}
              </div>

              {/* Actions */}
              <div className="pt-4 flex items-center justify-end gap-3 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-neutral-600 hover:bg-neutral-100 text-xs font-bold transition-colors cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting || (password.length > 0 && password !== confirmPassword)}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center gap-2 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Creating Account...</span>
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4" />
                      <span>Create Administrator</span>
                    </>
                  )}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* Confirmation Modal for Delete or Deactivate */}
      {confirmAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl border border-neutral-200 shadow-2xl max-w-md w-full p-6 sm:p-7 space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <ShieldAlert className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h3 className="text-base font-black text-neutral-900">
                {confirmAction.type === 'delete'
                  ? 'Delete Administrator Account?'
                  : confirmAction.account.status === 'deactivated'
                  ? 'Reactivate Administrator Account?'
                  : 'Deactivate Administrator Account?'}
              </h3>
              <p className="text-xs text-neutral-500 leading-relaxed">
                {confirmAction.type === 'delete'
                  ? `Are you sure you want to permanently delete the administrator profile for "${confirmAction.account.name}" (${confirmAction.account.email})? This action cannot be undone.`
                  : confirmAction.account.status === 'deactivated'
                  ? `Reactivating "${confirmAction.account.name}" will restore their sign-in capabilities immediately.`
                  : `Deactivating "${confirmAction.account.name}" will prevent this administrator from logging in until reactivated.`}
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                disabled={isProcessingAction}
                onClick={() => setConfirmAction(null)}
                className="px-4 py-2 rounded-xl text-neutral-600 hover:bg-neutral-100 text-xs font-bold transition-colors cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={isProcessingAction}
                onClick={handleExecuteConfirmAction}
                className={`px-4 py-2 rounded-xl text-white text-xs font-bold shadow-xs active:scale-[0.98] transition-all flex items-center gap-2 cursor-pointer ${
                  confirmAction.type === 'delete'
                    ? 'bg-rose-600 hover:bg-rose-700'
                    : 'bg-emerald-600 hover:bg-emerald-700'
                }`}
              >
                {isProcessingAction ? (
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : confirmAction.type === 'delete' ? (
                  <span>Delete Account</span>
                ) : (
                  <span>Confirm</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
