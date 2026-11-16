import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { ShieldCheck, ArrowRight, AlertTriangle, Key, Loader2, CheckCircle2 } from 'lucide-react';
import { BackButton } from '../common/BackButton';
import { sendPasswordReset, signIn, signUpAndIn } from '../../lib/supabase';

// ── Login Page ────────────────────────────────────────────────────────────────
export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { error: err } = await signIn(email, password);
    setLoading(false);
    if (err) { setError(err); return; }
    navigate('/portal/dashboard');
  };

  return (
    <div className="min-h-screen bg-transparent text-slate-900 dark:text-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white dark:bg-[#171A3B] rounded-2xl border border-slate-200 dark:border-indigo-500/30 p-6 sm:p-8 shadow-2xl space-y-6">
        <BackButton to="/" label="Back to Home" />

        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-[#6338F5] to-[#168BFF] flex items-center justify-center mx-auto shadow-lg shadow-indigo-500/25">
            <ShieldCheck className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Sign In to ANAGU!</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Access your sovereign land titles, cadastral jobs, and administrative portals.
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4 text-xs">
          <div>
            <label className="text-slate-700 dark:text-slate-300 block mb-1 font-medium">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full bg-slate-50 dark:bg-[#0d122e] border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white"
              required
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-slate-700 dark:text-slate-300 font-medium">Password</label>
              <Link to="/auth/forgot-password" className="text-indigo-600 dark:text-indigo-400 hover:underline">
                Forgot password?
              </Link>
            </div>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full bg-slate-50 dark:bg-[#0d122e] border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white"
              required
            />
          </div>

          {error && (
            <div className="flex items-start gap-2 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-500/40 text-rose-700 dark:text-rose-300">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <p>{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-xl bg-[#6338F5] hover:bg-[#5229db] text-white font-bold text-xs uppercase tracking-wider transition-colors shadow-md shadow-indigo-600/30 flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
            <span>{loading ? "Authenticating..." : "Authenticate & Enter Portal"}</span>
          </button>
        </form>

        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-center text-xs text-slate-500 dark:text-slate-400">
          <span>First time registering land? </span>
          <Link to="/auth/register" className="text-indigo-600 dark:text-indigo-400 hover:underline font-semibold">
            Create an Account
          </Link>
        </div>
      </div>
    </div>
  );
};

// ── Register Page ─────────────────────────────────────────────────────────────
export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [nin, setNin] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!password || password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    setLoading(true);
    const { error: err } = await signUpAndIn(email, password, {
      full_name: name,
      phone,
      role: 'citizen',
      nin,
    });
    setLoading(false);
    if (err) {
      setError(err);
      return;
    }
    navigate('/portal/dashboard');
  };

  return (
    <div className="min-h-screen bg-transparent text-slate-900 dark:text-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white dark:bg-[#171A3B] rounded-2xl border border-slate-200 dark:border-indigo-500/30 p-6 sm:p-8 shadow-2xl space-y-6">
        <BackButton to="/" label="Back to Home" />

        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Create Cadastre Account</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Create an account to register parcels and review your applications. Government roles are assigned by an administrator.
          </p>
        </div>

        <div className="rounded-lg border border-slate-200 p-3 text-xs text-slate-600 dark:border-slate-700 dark:text-slate-300">
          New accounts start as landholders. Surveyor, registrar, administrator, and Governor permissions require approval and are assigned by Anagu administrators.
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="text-slate-700 dark:text-slate-300 block mb-1 font-medium">Full Legal Name</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)}
              placeholder="e.g. Chief Emeka Adeleke"
              className="w-full bg-slate-50 dark:bg-[#0d122e] border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white" required />
          </div>

          <div>
            <label className="text-slate-700 dark:text-slate-300 block mb-1 font-medium">National Identification Number (NIN)</label>
            <input type="text" value={nin} onChange={e => setNin(e.target.value)}
              placeholder="11-digit NIN (e.g. 7749-2810-942)"
              className="w-full bg-slate-50 dark:bg-[#0d122e] border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white font-mono" />
          </div>

          <div>
            <label className="text-slate-700 dark:text-slate-300 block mb-1 font-medium">Email Address</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="name@domain.gov / user@mail.com"
              className="w-full bg-slate-50 dark:bg-[#0d122e] border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white" required />
          </div>

          <div>
            <label className="text-slate-700 dark:text-slate-300 block mb-1 font-medium">Phone (SMS Notifications)</label>
            <input type="tel" value={phone} onChange={e => setPhone(e.target.value)}
              placeholder="+234 803 000 0000"
              className="w-full bg-slate-50 dark:bg-[#0d122e] border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white" />
          </div>

          <div>
            <label className="text-slate-700 dark:text-slate-300 block mb-1 font-medium">Password (min 8 chars)</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)}
              placeholder="Create a strong password"
              className="w-full bg-slate-50 dark:bg-[#0d122e] border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white" required />
          </div>

          {error && (
            <div className="flex items-start gap-2 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-500/40 text-rose-700 dark:text-rose-300">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <p>{error}</p>
            </div>
          )}

          <button type="submit" disabled={loading}
            className="w-full py-2.5 rounded-xl bg-[#6338F5] hover:bg-[#5229db] text-white font-bold text-xs uppercase tracking-wider transition-colors shadow-md shadow-indigo-600/30 flex items-center justify-center gap-2 disabled:opacity-60">
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            <span>{loading ? 'Creating account…' : 'Create account and continue'}</span>
          </button>
        </form>

        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-center text-xs text-slate-500 dark:text-slate-400">
          <span>Already have an account? </span>
          <Link to="/auth/login" className="text-indigo-600 dark:text-indigo-400 hover:underline font-semibold">Continue to account</Link>
        </div>
      </div>
    </div>
  );
};

// ── Forgot Password Page ──────────────────────────────────────────────────────
export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const { error: resetError } = await sendPasswordReset(
        email,
        `${window.location.origin}/auth/reset-password`,
      );
      if (resetError) throw resetError;
      setSent(true);
    } catch (resetError) {
      setError(resetError instanceof Error ? resetError.message : 'Password reset could not be requested.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-transparent text-slate-900 dark:text-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white dark:bg-[#171A3B] rounded-2xl border border-slate-200 dark:border-indigo-500/30 p-6 sm:p-8 shadow-2xl space-y-6">
        <BackButton to="/auth/login" label="Back to Login" />
        <div className="text-center space-y-2">
          <Key className="w-10 h-10 text-amber-500 mx-auto" />
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Reset Account Key</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Enter your registered email to receive recovery instructions.
          </p>
        </div>
        {sent ? (
          <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-500/40 rounded-xl text-emerald-700 dark:text-emerald-300 text-xs text-center space-y-2">
            <CheckCircle2 className="w-6 h-6 mx-auto" />
            <div>Recovery link sent to <strong>{email}</strong></div>
            <Link to="/auth/login" className="text-indigo-600 dark:text-white underline font-semibold block">Return to Login</Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="text-slate-700 dark:text-slate-300 block mb-1 font-medium">Email Address</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                className="w-full bg-slate-50 dark:bg-[#0d122e] border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white" required />
            </div>
            {error && <p role="alert" className="text-rose-600">{error}</p>}
            <button type="submit" disabled={loading}
              className="w-full py-2.5 rounded-xl bg-[#6338F5] text-white font-bold text-xs uppercase flex items-center justify-center gap-2 disabled:opacity-60">
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>Send Recovery Instructions</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

// ── Access Denied ─────────────────────────────────────────────────────────────
export const AccessDeniedPage: React.FC = () => {
  const { currentRole } = useApp();
  return (
    <div className="min-h-screen bg-transparent text-slate-900 dark:text-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white dark:bg-[#171A3B] rounded-2xl border border-rose-200 dark:border-rose-500/30 p-6 sm:p-8 shadow-2xl text-center space-y-4">
        <BackButton to="/portal/dashboard" label="Back to Dashboard" />
        <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto" />
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Access Denied</h1>
        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
          Your assigned role ({currentRole}) does not have permission for this operation. Contact an administrator if you believe this is incorrect.
        </p>
        <div className="flex flex-col gap-2">
          <Link to="/portal/dashboard" className="w-full py-2.5 rounded-xl bg-[#6338F5] text-white font-semibold text-xs">Return to Dashboard</Link>
          <Link to="/" className="w-full py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold">Public Home</Link>
        </div>
      </div>
    </div>
  );
};
