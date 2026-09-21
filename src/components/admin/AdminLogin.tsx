import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { 
  Lock, 
  Mail, 
  KeyRound, 
  ArrowLeft, 
  Eye, 
  EyeOff, 
  ArrowRight,
  Shield,
  AlertTriangle
} from 'lucide-react';

export const AdminLogin: React.FC = () => {
  const { login, setCurrentView } = useData();
  
  // Sign In state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  const handleSignInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);

    const cleanEmail = email.trim();
    if (!cleanEmail || !password) {
      setLoginError('Please enter both your administrator email and password.');
      return;
    }

    setIsLoggingIn(true);

    try {
      const res = await login(cleanEmail, password);
      if (!res.success) {
        setLoginError(res.error || 'Invalid email or password. Please verify your credentials and try again.');
      }
    } catch (err: any) {
      setLoginError(err?.message || 'Authentication failed. Please check your network connection and try again.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Subtle atmospheric ambient glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[32rem] h-[32rem] bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-teal-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Return to Storefront */}
      <div className="absolute top-6 left-6 z-10">
        <button
          type="button"
          onClick={() => setCurrentView('public')}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold backdrop-blur-md transition-all border border-slate-800 shadow-sm cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Store</span>
        </button>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 flex items-center justify-center text-white font-black text-2xl mx-auto shadow-xl shadow-emerald-950/50 mb-4 border border-emerald-500/30">
            C
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            CartG Supermarket
          </h1>
          <p className="text-sm font-medium text-emerald-400 mt-1.5 tracking-wide">
            Store Manager & Administrator CRM Portal
          </p>
        </div>

        {/* Card Container */}
        <div className="bg-slate-900/90 border border-slate-800/90 rounded-3xl shadow-2xl p-6 sm:p-8 backdrop-blur-xl">
          <form onSubmit={handleSignInSubmit} className="space-y-4">
            
            {/* Error Message */}
            {loginError && (
              <div className="p-3.5 rounded-2xl bg-rose-950/80 border border-rose-800/90 text-xs text-rose-200 flex items-start gap-2.5 shadow-lg animate-in fade-in duration-200">
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <div className="flex-1 font-medium leading-relaxed">{loginError}</div>
              </div>
            )}

            {/* Email Field */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@cartg.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all placeholder:text-slate-600 font-medium"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
                Password
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all placeholder:text-slate-600 font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Sign In Button */}
            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm shadow-lg shadow-emerald-900/30 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-60 mt-5 cursor-pointer"
            >
              {isLoggingIn ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Security Message */}
          <div className="mt-6 pt-4 border-t border-slate-800 text-center flex items-center justify-center gap-1.5 text-xs text-slate-500">
            <Shield className="w-3.5 h-3.5 text-emerald-500" />
            <span>Secure administrator access</span>
          </div>
        </div>
      </div>
    </div>
  );
};
