import React, { useState } from 'react';
import { Mail, Lock, User, UserPlus, AlertCircle } from 'lucide-react';
import { api } from '../services/api';

interface RegisterProps {
  onRegisterSuccess: (token: string, user: any) => void;
  onNavigate: (page: string, params?: any) => void;
}

export default function Register({
  onRegisterSuccess,
  onNavigate,
}: RegisterProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password || !confirmPassword) {
      setError('Please fill in all details.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const response = await api.auth.register({ name, email, password });
      
      // Notify parent wrapper about active registration confirmation
      onRegisterSuccess(response.token, response.user);
    } catch (err: any) {
      setError(err.message || 'Registration failed. Email might already be taken.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-md w-full px-4 py-12 sm:py-16 space-y-6" id="register-view">
      
      {/* Container */}
      <div className="bg-white rounded-xl border border-slate-100 p-8 shadow-sm space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <span className="text-2xl font-bold tracking-wider text-emerald-600 block">
            Shop<span className="text-slate-900">EZ</span>
          </span>
          <h1 className="text-xl font-bold text-slate-800 tracking-tight">Create Your Account</h1>
          <p className="text-xs text-slate-400">Join ShopEZ for seamless browsing, custom checkouts, and tracking panels.</p>
        </div>

        {error && (
          <div className="p-3.5 rounded bg-rose-50 text-rose-650 text-xs font-bold leading-normal flex items-start space-x-2">
            <AlertCircle className="h-4 w-4 text-rose-500 mt-0.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Input Form Fields */}
        <form onSubmit={handleSubmit} className="space-y-4" id="register-creation-form">
          {/* Complete Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase text-slate-400 tracking-wider">Full User Name</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                <User className="h-4 w-4 text-slate-400" />
              </span>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Samuel Jackson"
                className="w-full rounded-md border border-slate-200 bg-slate-50/50 py-2.5 pl-10 pr-4 text-xs text-slate-800 outline-none focus:border-emerald-500 transition"
              />
            </div>
          </div>

          {/* Email Address */}
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
                placeholder="e.g. sam@shopez.com"
                className="w-full rounded-md border border-slate-200 bg-slate-50/50 py-2.5 pl-10 pr-4 text-xs text-slate-800 outline-none focus:border-emerald-500 transition"
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase text-slate-400 tracking-wider">Password (6+ chars)</label>
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

          {/* Confirm Password */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase text-slate-400 tracking-wider">Confirm Password</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                <Lock className="h-4 w-4 text-slate-400" />
              </span>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••"
                className="w-full rounded-md border border-slate-200 bg-slate-50/50 py-2.5 pl-10 pr-4 text-xs text-slate-800 outline-none focus:border-emerald-500 transition"
              />
            </div>
          </div>

          {/* Submit registration */}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-emerald-600 py-3 text-xs font-bold text-white hover:bg-emerald-700 transition shadow-sm uppercase tracking-wider flex items-center justify-center space-x-1.5"
            id="register-submit-button"
          >
            <UserPlus className="h-4 w-4 text-white" />
            <span>{loading ? 'Registering...' : 'Register New Account'}</span>
          </button>
        </form>

        {/* Home redirection links */}
        <div className="text-center text-xs text-slate-500 pt-2 border-t border-slate-50">
          <span>Already have an account? </span>
          <button
            onClick={() => onNavigate('login')}
            className="font-bold text-emerald-600 hover:underline"
          >
            Sign In
          </button>
        </div>
      </div>
    </div>
  );
}
