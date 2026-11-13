import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { RoleSwitcher } from './RoleSwitcher';
import { ThemeToggle } from './ThemeToggle';
import { NotificationDrawer } from './NotificationDrawer';
import { Shield, Menu, X, Search, Layers, Cpu } from 'lucide-react';

interface HeaderProps {
  onToggleSidebar?: () => void;
  isSidebarOpen?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ onToggleSidebar, isSidebarOpen }) => {
  const { currentUser, currentRole } = useApp();
  const location = useLocation();

  const isPortal = location.pathname.startsWith('/portal');

  return (
    <header className="sticky top-0 z-30 bg-white/95 dark:bg-[#080D24]/95 backdrop-blur-md border-b border-slate-200 dark:border-indigo-500/20 text-slate-900 dark:text-slate-100 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-2.5 sm:px-6 h-16 flex items-center justify-between gap-1.5 sm:gap-4">
        {/* Zone 1: Brand Wordmark with Mobile Menu Toggle & Back Button */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          {isPortal && (
            <button
              onClick={onToggleSidebar}
              className="lg:hidden p-1.5 sm:p-2 rounded-xl bg-slate-100 dark:bg-[#171A3B] text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-700 transition-colors"
              aria-label="Toggle navigation drawer"
            >
              {isSidebarOpen ? <X className="w-4 sm:w-5 h-4 sm:h-5" /> : <Menu className="w-4 sm:w-5 h-4 sm:h-5" />}
            </button>
          )}

          <Link to="/" className="flex items-center gap-1.5 sm:gap-2.5 group">
            <div className="w-8 sm:w-9 h-8 sm:h-9 rounded-xl bg-gradient-to-tr from-[#6338F5] to-[#168BFF] flex items-center justify-center group-hover:scale-105 transition-transform shrink-0">
              <Shield className="w-4 sm:w-5 h-4 sm:h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-lg sm:text-xl font-extrabold tracking-tight text-slate-900 dark:text-white font-sans">
                  ANAGU<span className="text-[#13C98A]">!</span>
                </span>
                <span className="hidden sm:inline-block text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-indigo-500/15 text-[#6338F5] dark:text-indigo-300 border border-indigo-500/25">
                  Cadastre v2
                </span>
              </div>
              <div className="hidden md:block text-[10px] text-slate-500 dark:text-slate-400 -mt-1 font-medium tracking-wide">
                Secure · Transparent · Trusted
              </div>
            </div>
          </Link>
        </div>

        {/* Zone 2: Navigation Links (Single-Line, whitespace-nowrap shrink-0) */}
        <nav className="hidden lg:flex items-center gap-6 text-xs font-semibold text-slate-600 dark:text-slate-300">
          <Link
            to="/"
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-[#6338F5] dark:hover:text-white ${
              location.pathname === '/' ? 'text-[#6338F5] dark:text-[#168BFF] font-bold' : ''
            }`}
          >
            Overview
          </Link>
          <Link
            to="/verify"
            className={`flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 hover:text-[#6338F5] dark:hover:text-white ${
              location.pathname === '/verify' ? 'text-[#6338F5] dark:text-[#168BFF] font-bold' : ''
            }`}
          >
            <Search className="w-3.5 h-3.5 text-amber-500" />
            <span>Public Verification</span>
          </Link>
          <Link
            to="/portal/gis"
            className={`flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 hover:text-[#6338F5] dark:hover:text-white ${
              location.pathname === '/portal/gis' ? 'text-[#6338F5] dark:text-[#168BFF] font-bold' : ''
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-[#13C98A]" />
            <span>GIS Cadastre</span>
          </Link>
          <Link
            to="/portal/explorer"
            className={`flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 hover:text-[#6338F5] dark:hover:text-white ${
              location.pathname === '/portal/explorer' ? 'text-[#6338F5] dark:text-[#168BFF] font-bold' : ''
            }`}
          >
            <Cpu className="w-3.5 h-3.5 text-[#6338F5]" />
            <span>Explorer</span>
          </Link>
          <Link
            to="/portal/dashboard"
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-[#6338F5] dark:hover:text-white ${
              location.pathname.startsWith('/portal') && location.pathname !== '/portal/gis' && location.pathname !== '/portal/explorer'
                ? 'text-[#6338F5] dark:text-[#168BFF] font-bold'
                : ''
            }`}
          >
            Portal Workspaces
          </Link>
        </nav>

        {/* Zone 3: Actions (Role Switcher, Theme, Notifications, Profile) */}
        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          <RoleSwitcher />
          <ThemeToggle />
          <NotificationDrawer />

          <Link
            to="/portal/profile"
            className="hidden sm:flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-700/60"
            title="View User Profile"
          >
            <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-indigo-500/40 overflow-hidden shrink-0 flex items-center justify-center">
              {currentUser.avatarUrl ? (
                <img
                  src={currentUser.avatarUrl}
                  alt={currentUser.name}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <span className="text-xs font-bold text-indigo-600 dark:text-indigo-300">
                  {currentUser.name.charAt(0)}
                </span>
              )}
            </div>
            <div className="hidden xl:block text-left text-xs">
              <div className="font-semibold text-slate-800 dark:text-white leading-tight truncate max-w-[120px]">
                {currentUser.name}
              </div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 capitalize">{currentRole}</div>
            </div>
          </Link>
        </div>
      </div>
    </header>
  );
};
