import React, { useState } from 'react';
import { Mail, Lock, LogIn, Sparkles, UserCheck, AlertCircle } from 'lucide-react';
import { api } from '../services/api';

interface LoginProps {
  onLoginSuccess: (token: string, user: any) => void;
  onNavigate: (page: string, params?: any) => void;
}

export default function Login({
  onLoginSuccess,
  onNavigate,
}: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please provide your full credentials.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const response = await api.auth.login({ email, password });
      
      // Fire upper auth triggers
      onLoginSuccess(response.token, response.user);
    } catch (err: any) {
      setError(err.message || 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Pre-fill demo accounts instantly for amazing UX
  const fillDemoCredentials = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError('');
  };

  return (
    <div className="mx-auto max-w-md w-full px-4 py-12 sm:py-16 space-y-6" id="login-view">
      
      {/* Form Card Container */}
      <div className="bg-white rounded-xl border border-slate-100 p-8 shadow-sm space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <span className="text-2xl font-bold tracking-wider text-emerald-600 block">
            Shop<span className="text-slate-900">EZ</span>
          </span>
          <h1 className="text-xl font-bold text-slate-800 tracking-tight">Welcome Back!</h1>
          <p className="text-xs text-slate-400">Sign in to manage shopping carts, add comments, and place secure orders.</p>
        </div>

        {error && (
          <div className="p-3.5 rounded bg-rose-50 text-rose-650 text-xs font-bold leading-normal flex items-start space-x-2">
            <AlertCircle className="h-4 w-4 text-rose-500 mt-0.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Input fields */}
        <form onSubmit={handleSubmit} className="space-y-4" id="login-credentials-form">
          {/* Email */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase text-slate-400 tracking-wider">Email Address</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                <Mail className="h-4 w-4 text-slate-400" />
              </span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. shopper@shopez.com"
                className="w-full rounded-md border border-slate-200 bg-slate-50/50 py-2.5 pl-10 pr-4 text-xs text-slate-800 outline-none focus:border-emerald-500 transition"
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold uppercase text-slate-400 tracking-wider">Password</label>
            </div>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                <Lock className="h-4 w-4 text-slate-400" />
              </span>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••"
                className="w-full rounded-md border border-slate-200 bg-slate-50/50 py-2.5 pl-10 pr-4 text-xs text-slate-800 outline-none focus:border-emerald-500 transition"
              />
            </div>
          </div>

          {/* Sign In CTA button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-emerald-650 bg-emerald-600 py-3 text-xs font-bold text-white hover:bg-emerald-700 transition shadow-sm uppercase tracking-wider flex items-center justify-center space-x-1.5"
            id="login-submit-button"
          >
            <LogIn className="h-4 w-4 text-white" />
            <span>{loading ? 'Authenticating...' : 'Sign In To Account'}</span>
          </button>
        </form>

        {/* Register redirects links */}
        <div className="text-center text-xs text-slate-500 pt-2 border-t border-slate-50">
          <span>Don't have an account? </span>
          <button
            onClick={() => onNavigate('register')}
            className="font-bold text-emerald-600 hover:underline"
          >
            Create account
          </button>
        </div>
      </div>

      {/* Demo Credentials alert box for outstanding usability testing */}
      <div className="bg-slate-50 rounded-xl border border-slate-150 p-5 space-y-3 shadow-inner">
        <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center space-x-1.5">
          <Sparkles className="h-4 w-4 text-emerald-650 text-emerald-600" />
          <span>Quick Testing Guides</span>
        </h3>
        <p className="text-[11px] text-slate-500 leading-normal">
          Click either chip below to instantly pre-fill credentials for verified roles pre-seeded in our database.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
          {/* Default User Chip */}
          <button
            onClick={() => fillDemoCredentials('user@shopez.com', 'user123')}
            className="flex items-center justify-start space-x-2 text-left rounded-lg bg-white border border-slate-100 p-2.5 hover:border-emerald-300 transition"
          >
            <UserCheck className="h-4 w-4 text-emerald-500 flex-shrink-0" />
            <div className="text-[10px] truncate w-full">
              <strong className="block text-slate-800 font-semibold uppercase">Standard Shopper</strong>
              <span className="text-slate-400 block truncate">user@shopez.com | user123</span>
            </div>
          </button>

          {/* Default Admin Chip */}
          <button
            onClick={() => fillDemoCredentials('admin@shopez.com', 'admin123')}
            className="flex items-center justify-start space-x-2 text-left rounded-lg bg-white border border-slate-100 p-2.5 hover:border-emerald-300 transition"
          >
            <Sparkles className="h-4 w-4 text-emerald-500 flex-shrink-0" />
            <div className="text-[10px] truncate w-full">
              <strong className="block text-slate-800 font-semibold uppercase">Store Admin</strong>
              <span className="text-slate-400 block truncate">admin@shopez.com | admin123</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
