import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { ShieldCheck, Lock, Mail, User, ArrowRight, AlertTriangle, Key } from 'lucide-react';
import { BackButton } from '../common/BackButton';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { setCurrentRole } = useApp();
  const [email, setEmail] = useState('emeka.adeleke@cadastre.anagu.org');
  const [password, setPassword] = useState('••••••••••••');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    navigate('/portal/dashboard');
  };

  return (
    <div className="min-h-screen bg-transparent text-slate-900 dark:text-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white dark:bg-[#171A3B] rounded-2xl border border-slate-200 dark:border-indigo-500/30 p-6 sm:p-8 shadow-2xl space-y-6">
        <div className="flex items-center justify-between">
          <BackButton to="/" label="Back to Home" />
        </div>

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
            <label className="text-slate-700 dark:text-slate-300 block mb-1 font-medium">NIN or Government Work Email</label>
            <input
              type="text"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full bg-slate-50 dark:bg-[#0d122e] border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white"
              required
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-slate-700 dark:text-slate-300 font-medium">Master Password or Passkey</label>
              <Link to="/auth/forgot-password" className="text-indigo-600 dark:text-indigo-400 hover:underline">
                Forgot key?
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

          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-[#6338F5] hover:bg-[#5229db] text-white font-bold text-xs uppercase tracking-wider transition-colors shadow-md shadow-indigo-600/30 flex items-center justify-center gap-2"
          >
            <span>Authenticate & Enter Portal</span>
            <ArrowRight className="w-4 h-4" />
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

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { addNotification } = useApp();
  const [role, setRole] = useState<'citizen' | 'surveyor' | 'customary'>('citizen');
  const [name, setName] = useState('');
  const [nin, setNin] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [surconLicense, setSurconLicense] = useState('SURCON/REG/2026/8849');
  const [communityTitle, setCommunityTitle] = useState('Olofin Family Chieftaincy Council');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const roleLabel = role === 'citizen' ? 'Citizen' : role === 'surveyor' ? 'Licensed Surveyor' : 'Customary Trustee';
    addNotification({
      title: 'Registration Dispatched',
      message: `Account registration initiated for ${name || 'User'} (${roleLabel}). NIN Sovereign Identity verification link sent to email.`,
      type: 'success'
    });
    navigate('/auth/login');
  };

  return (
    <div className="min-h-screen bg-transparent text-slate-900 dark:text-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white dark:bg-[#171A3B] rounded-2xl border border-slate-200 dark:border-indigo-500/30 p-6 sm:p-8 shadow-2xl space-y-6">
        <div className="flex items-center justify-between">
          <BackButton to="/" label="Back to Home" />
        </div>

        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Create Cadastre Account</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Sovereign identity onboarding for landholders, surveyors, and customary trustees.
          </p>
        </div>

        {/* 3-Way Role Selector */}
        <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 dark:bg-[#0d122e] rounded-xl border border-slate-200 dark:border-slate-800 text-[11px]">
          <button
            type="button"
            onClick={() => setRole('citizen')}
            className={`py-2 px-1 rounded-lg font-semibold transition-colors truncate ${
              role === 'citizen' ? 'bg-[#6338F5] text-white shadow' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Citizen
          </button>
          <button
            type="button"
            onClick={() => setRole('surveyor')}
            className={`py-2 px-1 rounded-lg font-semibold transition-colors truncate ${
              role === 'surveyor' ? 'bg-[#6338F5] text-white shadow' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Surveyor
          </button>
          <button
            type="button"
            onClick={() => setRole('customary')}
            className={`py-2 px-1 rounded-lg font-semibold transition-colors truncate ${
              role === 'customary' ? 'bg-[#6338F5] text-white shadow' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Customary
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="text-slate-700 dark:text-slate-300 block mb-1 font-medium">Full Legal Name</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder={role === 'customary' ? 'e.g. Chief Adeleke (Family Head)' : 'e.g. Chief Emeka Adeleke'}
              className="w-full bg-slate-50 dark:bg-[#0d122e] border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white"
              required
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-slate-700 dark:text-slate-300 font-medium">National Identification Number (NIN)</label>
              <span className="text-[10px] text-indigo-400 font-mono">Tier-3 Sovereign ID</span>
            </div>
            <input
              type="text"
              value={nin}
              onChange={e => setNin(e.target.value)}
              placeholder="11-digit NIN (e.g. 7749-2810-942)"
              className="w-full bg-slate-50 dark:bg-[#0d122e] border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white font-mono"
              required
            />
          </div>

          {/* Conditional Role-Specific Credentials */}
          {role === 'surveyor' && (
            <div>
              <label className="text-slate-700 dark:text-slate-300 block mb-1 font-medium">
                SURCON Cadastral License Seal / Reg Number
              </label>
              <input
                type="text"
                value={surconLicense}
                onChange={e => setSurconLicense(e.target.value)}
                placeholder="SURCON/REG/YEAR/NUMBER"
                className="w-full bg-slate-50 dark:bg-[#0d122e] border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white font-mono"
                required
              />
            </div>
          )}

          {role === 'customary' && (
            <div>
              <label className="text-slate-700 dark:text-slate-300 block mb-1 font-medium">
                Communal Authority / Chieftaincy Family Council
              </label>
              <input
                type="text"
                value={communityTitle}
                onChange={e => setCommunityTitle(e.target.value)}
                placeholder="e.g. Elegushi Royal Estate / Olofin Clan"
                className="w-full bg-slate-50 dark:bg-[#0d122e] border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white"
                required
              />
            </div>
          )}

          <div>
            <label className="text-slate-700 dark:text-slate-300 block mb-1 font-medium">Official Contact Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="name@domain.gov / user@mail.com"
              className="w-full bg-slate-50 dark:bg-[#0d122e] border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white"
              required
            />
          </div>

          <div>
            <label className="text-slate-700 dark:text-slate-300 block mb-1 font-medium">Mobile Phone (SMS Notifications)</label>
            <input
              type="tel"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              placeholder="+234 803 000 0000"
              className="w-full bg-slate-50 dark:bg-[#0d122e] border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-[#6338F5] hover:bg-[#5229db] text-white font-bold text-xs uppercase tracking-wider transition-colors shadow-md shadow-indigo-600/30"
          >
            Create Verified Sovereign Account
          </button>
        </form>

        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-center text-xs text-slate-500 dark:text-slate-400">
          <span>Already registered? </span>
          <Link to="/auth/login" className="text-indigo-600 dark:text-indigo-400 hover:underline font-semibold">
            Sign In Here
          </Link>
        </div>
      </div>
    </div>
  );
};

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  return (
    <div className="min-h-screen bg-transparent text-slate-900 dark:text-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white dark:bg-[#171A3B] rounded-2xl border border-slate-200 dark:border-indigo-500/30 p-6 sm:p-8 shadow-2xl space-y-6">
        <div className="flex items-center justify-between">
          <BackButton to="/auth/login" label="Back to Login" />
        </div>

        <div className="text-center space-y-2">
          <Key className="w-10 h-10 text-amber-500 mx-auto" />
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Reset Account Key</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Enter your registered NIN or email address to receive passkey recovery instructions.
          </p>
        </div>

        {sent ? (
          <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-500/40 rounded-xl text-emerald-700 dark:text-emerald-300 text-xs text-center space-y-2">
            <div>Recovery link transmitted to your secure email.</div>
            <Link to="/auth/login" className="text-indigo-600 dark:text-white underline font-semibold block">
              Return to Login
            </Link>
          </div>
        ) : (
          <form
            onSubmit={e => {
              e.preventDefault();
              setSent(true);
            }}
            className="space-y-4 text-xs"
          >
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

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-[#6338F5] text-white font-bold text-xs uppercase"
            >
              Send Recovery Instructions
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export const AccessDeniedPage: React.FC = () => {
  const { currentRole } = useApp();

  return (
    <div className="min-h-screen bg-transparent text-slate-900 dark:text-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white dark:bg-[#171A3B] rounded-2xl border border-rose-200 dark:border-rose-500/30 p-6 sm:p-8 shadow-2xl text-center space-y-4">
        <div className="flex items-center justify-start">
          <BackButton to="/portal/dashboard" label="Back to Dashboard" />
        </div>

        <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto" />
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Access Denied</h1>
        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
          Your active persona ({currentRole}) does not have permission to execute this operation. Use the role switcher to simulate the appropriate institutional role.
        </p>

        <div className="pt-2 flex flex-col gap-2">
          <Link
            to="/portal/dashboard"
            className="w-full py-2.5 rounded-xl bg-[#6338F5] text-white font-semibold text-xs"
          >
            Return to Dashboard
          </Link>
          <Link
            to="/"
            className="w-full py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold"
          >
            Public Home
          </Link>
        </div>
      </div>
    </div>
  );
};
