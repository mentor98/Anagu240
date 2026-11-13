import React from 'react';
import { NavLink } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import {
  LayoutDashboard,
  MapPin,
  FilePlus,
  Files,
  Clock,
  Receipt,
  Layers,
  Cpu,
  Award,
  Users,
  Compass,
  FileCheck,
  Landmark,
  Crown,
  Terminal,
  Activity,
  BarChart3,
  User,
  Settings,
  HelpCircle,
  ShieldAlert,
  ChevronRight,
  X
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { currentRole, currentUser } = useApp();

  const getRoleNavItems = () => {
    switch (currentRole) {
      case 'surveyor':
        return [
          { to: '/portal/surveyor', label: 'Surveyor Dashboard', icon: LayoutDashboard },
          { to: '/portal/surveyor/jobs', label: 'Field Survey Jobs', icon: Compass },
          { to: '/portal/gis', label: 'GIS Beacon Plotter', icon: Layers },
          { to: '/portal/surveyor/submit', label: 'Lodge Cadastral Plan', icon: FileCheck }
        ];
      case 'registrar':
        return [
          { to: '/portal/registrar', label: 'Registrar Dashboard', icon: LayoutDashboard },
          { to: '/portal/registrar/queue', label: 'Application Queue', icon: Clock },
          { to: '/portal/registrar/review', label: 'Deed Examination', icon: FileCheck },
          { to: '/portal/nft-issuance', label: 'NFT Issuance Vault', icon: Award }
        ];
      case 'admin':
        return [
          { to: '/portal/admin', label: 'Administrator Portal', icon: LayoutDashboard },
          { to: '/portal/admin/records', label: 'Master Title Registry', icon: Landmark },
          { to: '/portal/admin/history', label: 'Chain of Custody', icon: Clock },
          { to: '/portal/admin/disputes', label: 'Boundary Conflict Log', icon: ShieldAlert }
        ];
      case 'governor':
        return [
          { to: '/portal/governor', label: 'Governor Dashboard', icon: LayoutDashboard },
          { to: '/portal/governor/revocations', label: 'Statutory Revocations', icon: Crown },
          { to: '/portal/governor/confirm', label: 'Executive Signoff', icon: FileCheck },
          { to: '/portal/governor/gazette', label: 'Gazette Notice Memorial', icon: Files }
        ];
      case 'sysadmin':
        return [
          { to: '/portal/sysadmin', label: 'SysAdmin Control', icon: LayoutDashboard },
          { to: '/portal/sysadmin/users', label: 'User Directory & KYC', icon: Users },
          { to: '/portal/sysadmin/permissions', label: 'Role Permissions', icon: Terminal },
          { to: '/portal/sysadmin/audit', label: 'Tamper-Evident Audit', icon: Receipt },
          { to: '/portal/sysadmin/consensus', label: 'Consensus Nodes', icon: Cpu }
        ];
      case 'citizen':
      default:
        return [
          { to: '/portal/dashboard', label: 'Citizen Dashboard', icon: LayoutDashboard },
          { to: '/portal/my-lands', label: 'My Titled Lands', icon: MapPin },
          { to: '/portal/register-land', label: 'Register Land Parcel', icon: FilePlus },
          { to: '/portal/documents', label: 'Document Centre', icon: Files },
          { to: '/portal/applications', label: 'Application Tracker', icon: Clock },
          { to: '/portal/transactions', label: 'Ledger Transactions', icon: Receipt }
        ];
    }
  };

  const sharedNavItems = [
    { to: '/portal/gis', label: 'GIS & Spatial Engine', icon: Layers },
    { to: '/portal/explorer', label: 'Blockchain Explorer', icon: Cpu },
    { to: '/portal/nft-registry', label: 'NFT Title Deeds', icon: Award },
    { to: '/portal/community', label: 'Community Attestation', icon: Users },
    { to: '/portal/analytics', label: 'Cadastral Analytics', icon: BarChart3 },
    { to: '/portal/monitoring', label: 'System Health & MQTT', icon: Activity }
  ];

  const utilityNavItems = [
    { to: '/portal/profile', label: 'My Identity & NIN', icon: User },
    { to: '/portal/settings', label: 'Account Security', icon: Settings },
    { to: '/portal/help', label: 'Cadastral Guide & FAQ', icon: HelpCircle }
  ];

  const roleItems = getRoleNavItems();

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 shrink-0 lg:sticky lg:top-16 lg:z-20 lg:h-[calc(100vh-4rem)] bg-white dark:bg-[#090d24] border-r border-slate-200 dark:border-indigo-500/20 text-slate-800 dark:text-slate-200 transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        } flex flex-col justify-between overflow-y-auto`}
      >
        <div className="p-4 space-y-6">
          {/* Mobile Drawer Header */}
          <div className="flex items-center justify-between lg:hidden pb-2 border-b border-slate-200 dark:border-slate-800">
            <span className="text-xs font-bold tracking-wide text-slate-900 dark:text-white font-mono">
              ANAGU NAVIGATION
            </span>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-100 dark:bg-[#171A3B] text-slate-600 dark:text-slate-300 hover:text-white"
              aria-label="Close navigation drawer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          {/* Active Role Card */}
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#171A3B] border border-slate-200 dark:border-indigo-500/25">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] uppercase font-mono tracking-wider text-[#6338F5] dark:text-indigo-400 font-semibold">
                Active Persona
              </span>
              <span className="w-2 h-2 rounded-full bg-[#13C98A]" />
            </div>
            <div className="text-xs font-bold text-slate-900 dark:text-white truncate">{currentUser.name}</div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate capitalize font-mono">
              {currentRole} · {currentUser.walletAddress}
            </div>
          </div>

          {/* Role-Specific Navigation Group */}
          <div>
            <div className="px-2 mb-2 text-[10px] font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold">
              Role Workspaces ({currentRole})
            </div>
            <nav className="space-y-1">
              {roleItems.map(item => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={() => {
                      if (window.innerWidth < 1024) onClose();
                    }}
                    className={({ isActive }) =>
                      `flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                        isActive
                          ? 'bg-[#6338F5] text-white font-semibold'
                          : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#171A3B]'
                      }`
                    }
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <Icon className="w-4 h-4 shrink-0" />
                      <span className="truncate">{item.label}</span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 opacity-40 shrink-0" />
                  </NavLink>
                );
              })}
            </nav>
          </div>

          {/* Shared Protocol Modules */}
          <div>
            <div className="px-2 mb-2 text-[10px] font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold">
              Platform Engines
            </div>
            <nav className="space-y-1">
              {sharedNavItems.map(item => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={() => {
                      if (window.innerWidth < 1024) onClose();
                    }}
                    className={({ isActive }) =>
                      `flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                        isActive
                          ? 'bg-[#6338F5] text-white font-semibold'
                          : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#171A3B]'
                      }`
                    }
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <Icon className="w-4 h-4 shrink-0" />
                      <span className="truncate">{item.label}</span>
                    </div>
                  </NavLink>
                );
              })}
            </nav>
          </div>

          {/* System Settings & Help */}
          <div>
            <div className="px-2 mb-2 text-[10px] font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold">
              Account & Security
            </div>
            <nav className="space-y-1">
              {utilityNavItems.map(item => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={() => {
                      if (window.innerWidth < 1024) onClose();
                    }}
                    className={({ isActive }) =>
                      `flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                        isActive
                          ? 'bg-[#6338F5] text-white font-semibold'
                          : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#171A3B]'
                      }`
                    }
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span className="truncate">{item.label}</span>
                  </NavLink>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Footer info */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 text-[10px] text-slate-500 font-mono flex items-center justify-between">
          <span>ANAGU CADASTRE PROTOCOL</span>
          <span>v2.4-STITCH</span>
        </div>
      </aside>
    </>
  );
};
