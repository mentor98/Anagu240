import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Settings, Shield, Key, Bell, Moon, Sun, Smartphone } from 'lucide-react';
import { BackButton } from '../common/BackButton';

export const SettingsView: React.FC = () => {
  const { theme, toggleTheme, addNotification } = useApp();
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(true);
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [smsAlerts, setSmsAlerts] = useState(false);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <BackButton to="/portal/dashboard" label="Back to Dashboard" />
      </div>

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Settings className="w-6 h-6 text-[#6338F5]" />
          Account & Cadastre Security Settings
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Cryptographic security keys, multi-factor authorization, and alert preferences.
        </p>
      </div>

      <div className="bg-[#171A3B] rounded-2xl border border-indigo-500/25 p-6 shadow-2xl space-y-6">
        {/* Security Section */}
        <div className="space-y-4">
          <h2 className="text-sm font-bold text-white flex items-center gap-2 pb-2 border-b border-slate-700/60">
            <Shield className="w-4 h-4 text-emerald-400" />
            Cryptographic Authentication
          </h2>

          <div className="flex items-center justify-between p-4 rounded-xl bg-[#0d122e] border border-slate-800 text-xs">
            <div>
              <div className="font-semibold text-white flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-indigo-400" />
                Two-Factor Authentication (2FA TOTP)
              </div>
              <p className="text-slate-400 mt-0.5">
                Required when lodging land applications, signing neighbor attestations, or executing conveyances.
              </p>
            </div>
            <button
              onClick={() => setTwoFactorEnabled(!twoFactorEnabled)}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
                twoFactorEnabled
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'bg-slate-800 text-slate-400'
              }`}
            >
              {twoFactorEnabled ? 'Enabled' : 'Disabled'}
            </button>
          </div>

          <div className="flex items-center justify-between p-4 rounded-xl bg-[#0d122e] border border-slate-800 text-xs">
            <div>
              <div className="font-semibold text-white flex items-center gap-2">
                <Key className="w-4 h-4 text-amber-400" />
                Hardware Security Key (FIDO2 / WebAuthn)
              </div>
              <p className="text-slate-400 mt-0.5">
                YubiKey or biometric TouchID hardware token registered for high-value title operations.
              </p>
            </div>
            <button
              onClick={() =>
                addNotification({
                  title: 'Hardware Token Pairing',
                  message: 'FIDO2 / WebAuthn biometric security key successfully paired.',
                  type: 'success'
                })
              }
              className="px-3 py-1.5 rounded-lg bg-[#6338F5] text-white hover:bg-[#5229db] font-semibold"
            >
              Configure Key
            </button>
          </div>
        </div>

        {/* Notifications Section */}
        <div className="space-y-4 pt-4 border-t border-slate-800">
          <h2 className="text-sm font-bold text-white flex items-center gap-2 pb-2 border-b border-slate-700/60">
            <Bell className="w-4 h-4 text-indigo-400" />
            Cadastral Notification Preferences
          </h2>

          <div className="space-y-3 text-xs">
            <label className="flex items-center justify-between p-3 rounded-xl bg-[#0d122e] border border-slate-800 cursor-pointer">
              <span className="text-slate-200">Email notifications on title state transitions and approvals</span>
              <input
                type="checkbox"
                checked={emailAlerts}
                onChange={e => setEmailAlerts(e.target.checked)}
                className="accent-[#6338F5] w-4 h-4 rounded"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-xl bg-[#0d122e] border border-slate-800 cursor-pointer">
              <span className="text-slate-200">SMS alerts for neighbor boundary attestation window opening</span>
              <input
                type="checkbox"
                checked={smsAlerts}
                onChange={e => setSmsAlerts(e.target.checked)}
                className="accent-[#6338F5] w-4 h-4 rounded"
              />
            </label>
          </div>
        </div>

        {/* Visual Appearance */}
        <div className="space-y-4 pt-4 border-t border-slate-800">
          <h2 className="text-sm font-bold text-white flex items-center gap-2 pb-2 border-b border-slate-700/60">
            {theme === 'dark' ? <Moon className="w-4 h-4 text-indigo-400" /> : <Sun className="w-4 h-4 text-amber-400" />}
            Interface Theme
          </h2>

          <div className="flex items-center justify-between p-4 rounded-xl bg-[#0d122e] border border-slate-800 text-xs">
            <div>
              <div className="font-semibold text-white">Current Theme: {theme === 'dark' ? 'Dark Futuristic (Primary)' : 'Clean High-Contrast Light'}</div>
              <p className="text-slate-400 mt-0.5">Toggle between dark executive mode and daytime light mode.</p>
            </div>
            <button
              onClick={toggleTheme}
              className="px-3 py-1.5 rounded-lg bg-[#6338F5] text-white hover:bg-[#5229db] font-semibold"
            >
              Switch to {theme === 'dark' ? 'Light' : 'Dark'} Mode
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
