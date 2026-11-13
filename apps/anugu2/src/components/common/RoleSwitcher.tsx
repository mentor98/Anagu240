import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types';
import { Shield, ChevronDown, Check, UserCheck, Compass, FileCheck, Landmark, Crown, Terminal } from 'lucide-react';

const ROLES_INFO: { role: UserRole; label: string; icon: React.ComponentType<{ className?: string }>; desc: string }[] = [
  {
    role: 'citizen',
    label: 'Citizen / Landowner',
    icon: UserCheck,
    desc: 'Register land parcels, track applications, view digital NFT deeds & certificates'
  },
  {
    role: 'surveyor',
    label: 'Licensed Surveyor',
    icon: Compass,
    desc: 'Take boundary beacon coordinates, run GIS validation, lodge cadastral plans'
  },
  {
    role: 'registrar',
    label: 'Deeds Registrar',
    icon: FileCheck,
    desc: 'Review title applications, verify attestations, execute cryptographic signoffs'
  },
  {
    role: 'admin',
    label: 'Land Administrator',
    icon: Landmark,
    desc: 'Supervise state cadastre, dispute records, zoning overlays & custody trail'
  },
  {
    role: 'governor',
    label: 'Executive Governor',
    icon: Crown,
    desc: 'Statutory land revocations under Land Use Act, public interest orders'
  },
  {
    role: 'sysadmin',
    label: 'System Administrator',
    icon: Terminal,
    desc: 'Manage roles, permission matrices, consensus nodes, immutable audit trail'
  }
];

export const RoleSwitcher: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const { currentRole, setCurrentRole, addNotification } = useApp();
  const [isOpen, setIsOpen] = useState(false);

  const activeRole = ROLES_INFO.find(r => r.role === currentRole) || ROLES_INFO[0];
  const Icon = activeRole.icon;

  const handleSelectRole = (newRole: UserRole) => {
    setCurrentRole(newRole);
    setIsOpen(false);
    const sel = ROLES_INFO.find(r => r.role === newRole);
    addNotification({
      title: `Switched Persona: ${sel?.label}`,
      message: `Active view and role-based permissions updated for ${sel?.label}.`,
      type: 'info'
    });
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-1.5 sm:gap-2 rounded-xl border transition-all ${
          compact
            ? 'px-2 py-1 text-xs bg-white dark:bg-[#171A3B] border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-indigo-500'
            : 'px-2 sm:px-3 py-1.5 text-xs font-medium bg-white dark:bg-[#131738] border-slate-200 dark:border-indigo-500/30 text-slate-800 dark:text-white hover:border-indigo-500'
        }`}
        title="Switch simulated user persona"
      >
        <span className="p-1 rounded bg-[#6338F5]/10 dark:bg-[#6338F5]/20 text-[#6338F5] shrink-0">
          <Icon className="w-3.5 h-3.5" />
        </span>
        <div className="text-left min-w-0">
          <div className="text-[9px] text-slate-500 dark:text-slate-400 font-normal leading-none mb-0.5">Role</div>
          <div className="font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-1">
            <span className="truncate max-w-[80px] xs:max-w-[110px] sm:max-w-none">{activeRole.label}</span>
            <ChevronDown className="w-3 h-3 text-slate-400 shrink-0" />
          </div>
        </div>
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-white dark:bg-[#131738] border border-slate-200 dark:border-indigo-500/30 rounded-2xl shadow-md p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
            <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-700/60 mb-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-[#6338F5]" />
                  Simulate Role-Based Access
                </span>
                <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-mono">Demo Persona</span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                Select a user role to experience tailored workflows, dashboards, and access boundaries.
              </p>
            </div>

            <div className="space-y-1">
              {ROLES_INFO.map(item => {
                const ItemIcon = item.icon;
                const isSelected = item.role === currentRole;
                return (
                  <button
                    key={item.role}
                    onClick={() => handleSelectRole(item.role)}
                    className={`w-full flex items-start gap-2.5 p-2 rounded-xl text-left transition-colors ${
                      isSelected
                        ? 'bg-indigo-50 dark:bg-[#6338F5]/20 border border-indigo-200 dark:border-[#6338F5]/40 text-[#6338F5] dark:text-white font-medium'
                        : 'hover:bg-slate-100 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div
                      className={`p-1.5 rounded-lg mt-0.5 shrink-0 ${
                        isSelected ? 'bg-[#6338F5] text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                      }`}
                    >
                      <ItemIcon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-900 dark:text-white">{item.label}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-[#13C98A]" />}
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight mt-0.5">
                        {item.desc}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
