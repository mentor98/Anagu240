import React from 'react';
import { useApp } from '../../context/AppContext';
import { User, ShieldCheck, MapPin, Mail, Phone, Lock, CreditCard } from 'lucide-react';
import { BackButton } from '../common/BackButton';

export const ProfileView: React.FC = () => {
  const { currentUser, currentRole } = useApp();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <BackButton to="/portal/dashboard" label="Back to Dashboard" />
      </div>

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <User className="w-6 h-6 text-[#6338F5]" />
          Cadastre Identity & Profile
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          National identity binding, sovereign wallet credentials, and cadastral permissions.
        </p>
      </div>

      {/* Main Profile Card */}
      <div className="bg-[#171A3B] rounded-2xl border border-indigo-500/25 p-6 sm:p-8 shadow-2xl space-y-6">
        <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-slate-700/60">
          <div className="w-20 h-20 rounded-full bg-slate-800 border-2 border-indigo-500/50 overflow-hidden flex items-center justify-center shrink-0">
            {currentUser.avatarUrl ? (
              <img
                src={currentUser.avatarUrl}
                alt={currentUser.name}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              <span className="text-2xl font-bold text-indigo-300">{currentUser.name.charAt(0)}</span>
            )}
          </div>

          <div className="space-y-1 text-center sm:text-left flex-1">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h2 className="text-xl font-bold text-white">{currentUser.name}</h2>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-mono border border-emerald-500/30 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                <span>KYC VERIFIED</span>
              </span>
            </div>
            <div className="text-xs text-indigo-300 capitalize">{currentRole} · {currentUser.organization || 'Federal Cadastre Network'}</div>
            <div className="text-xs text-slate-400 font-mono mt-1">
              National ID (NIN): <span className="text-white">{currentUser.nationalId}</span>
            </div>
          </div>
        </div>

        {/* Credentials Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-[#0d122e] border border-slate-800 space-y-1">
            <span className="text-slate-400 text-[11px] block">Email Address</span>
            <span className="text-white font-medium flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-indigo-400" />
              {currentUser.email}
            </span>
          </div>

          <div className="p-4 rounded-xl bg-[#0d122e] border border-slate-800 space-y-1">
            <span className="text-slate-400 text-[11px] block">Telephone</span>
            <span className="text-white font-medium flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-indigo-400" />
              {currentUser.phone || '+234 800 000 0000'}
            </span>
          </div>

          <div className="p-4 rounded-xl bg-[#0d122e] border border-slate-800 space-y-1">
            <span className="text-slate-400 text-[11px] block">Sovereign Wallet Address</span>
            <span className="text-indigo-300 font-mono font-bold flex items-center gap-1.5">
              <CreditCard className="w-3.5 h-3.5 text-amber-400" />
              {currentUser.walletAddress}
            </span>
          </div>

          <div className="p-4 rounded-xl bg-[#0d122e] border border-slate-800 space-y-1">
            <span className="text-slate-400 text-[11px] block">Residential / Corporate Address</span>
            <span className="text-white font-medium flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-indigo-400" />
              {currentUser.address || 'Victoria Island Extension, Lagos State'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
