import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AlertCircle, ArrowLeft, KeyRound, Lock, Mail, ShieldCheck, Sparkles } from 'lucide-react';
import { adminApi } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { useSettings } from '../../context/SettingsContext';

export const AdminLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();
  const { settings } = useSettings();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // If already authenticated, redirect to dashboard
  if (isAuthenticated) {
    navigate('/admin/dashboard', { replace: true });
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await adminApi.login({ email, password });
      if (res.data.success) {
        login(res.data.token, res.data.user);
        navigate('/admin/dashboard');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid credentials. Please verify your email and password.');
    } finally {
      setLoading(false);
    }
  };

  const handleFillDemo = () => {
    setEmail('admin@aashmibeauty.com');
    setPassword('Admin@12345');
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream-100 via-blush-50 to-rosegold-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-10 left-10 w-72 h-72 rounded-full bg-rosegold-200/40 blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-10 right-10 w-80 h-80 rounded-full bg-blush-200/40 blur-3xl pointer-events-none"></div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4">
        {/* Back Link */}
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-charcoal-600 hover:text-rosegold-700 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Public Website</span>
        </Link>

        {/* Brand Header */}
        <div className="text-center space-y-3">
          <div className="w-16 h-16 rounded-full bg-white shadow-soft border border-rosegold-200 flex items-center justify-center mx-auto p-3">
            <img src={settings.logo_url || '/logo.svg'} alt={settings.parlour_name} className="w-full h-full object-contain" />
          </div>
          <h2 className="font-serif text-3xl font-extrabold text-charcoal-900 tracking-tight">
            {settings.parlour_name}
          </h2>
          <p className="text-xs uppercase tracking-widest font-bold text-rosegold-600">
            Secure Owner & Management Portal
          </p>
        </div>

        {/* Card */}
        <div className="mt-8 bg-white py-8 px-6 sm:px-10 shadow-soft-lg rounded-3xl border border-rosegold-100 space-y-6">
          {error && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-500" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal-700 mb-1.5">
                Admin Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-rosegold-400 absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@aashmibeauty.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-rosegold-200 focus:outline-hidden focus:ring-2 focus:ring-rosegold-500 text-sm font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-rosegold-400 absolute left-3.5 top-3" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-rosegold-200 focus:outline-hidden focus:ring-2 focus:ring-rosegold-500 text-sm"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-rosegold-600 to-blush-600 hover:from-rosegold-700 hover:to-blush-700 text-white font-bold text-sm shadow-rose hover:shadow-md transition-all flex items-center justify-center gap-2"
            >
              <Lock className="w-4 h-4" />
              <span>{loading ? 'Authenticating...' : 'Sign In to Dashboard'}</span>
            </button>
          </form>

          {/* Demo Login Credentials Helper */}
          <div className="bg-cream-50 p-4 rounded-2xl border border-dashed border-rosegold-300 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-[11px] font-bold text-charcoal-800 uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-rosegold-600" /> Demo Credentials
              </span>
              <button
                type="button"
                onClick={handleFillDemo}
                className="text-[11px] font-semibold text-rosegold-700 hover:text-rosegold-900 underline"
              >
                Auto-Fill
              </button>
            </div>
            <p className="text-[11px] text-charcoal-600">
              Email: <code className="bg-white px-1.5 py-0.5 rounded border text-charcoal-900">admin@aashmibeauty.com</code>
            </p>
            <p className="text-[11px] text-charcoal-600">
              Password: <code className="bg-white px-1.5 py-0.5 rounded border text-charcoal-900">Admin@12345</code>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

