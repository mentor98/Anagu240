import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { RoleSwitcher } from './RoleSwitcher';
import { ThemeToggle } from './ThemeToggle';
import { NotificationDrawer } from './NotificationDrawer';
import { Shield, Menu, X, Search, Layers, Cpu, MapPin, User, LogIn } from 'lucide-react';
import { signOut } from '../../lib/supabase';

interface HeaderProps {
  onToggleSidebar?: () => void;
  isSidebarOpen?: boolean;
}

const NAV_LINKS = [
  { to: '/',                label: 'Home',          exact: true },
  { to: '/explore',         label: 'Explore Land',  exact: false },
  { to: '/verify',          label: 'Verify Title',  exact: false },
  { to: '/portal/gis',      label: 'GIS Map',       exact: false },
  { to: '/portal/explorer', label: 'Explorer',      exact: false },
  { to: '/portal/dashboard',label: 'My Portal',     exact: false },
];

export const Header: React.FC<HeaderProps> = ({ onToggleSidebar, isSidebarOpen }) => {
  const { currentUser, currentRole, isAuthenticated } = useApp();
  const location  = useLocation();
  const navigate  = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isPortal   = location.pathname.startsWith('/portal');
  const isActive   = (to: string, exact: boolean) =>
    exact ? location.pathname === to : location.pathname.startsWith(to);

  const handleSignOut = () => {
    signOut();
    navigate('/');
    setMobileOpen(false);
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 dark:bg-[#080D24]/95 backdrop-blur-md border-b border-slate-200 dark:border-indigo-500/20 text-slate-900 dark:text-slate-100 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 h-14 flex items-center justify-between gap-2">

        {/* ── Logo + Portal sidebar toggle ───────────────────────────────── */}
        <div className="flex items-center gap-2 shrink-0">
          {isPortal && (
            <button onClick={onToggleSidebar}
              className="lg:hidden p-1.5 rounded-xl bg-slate-100 dark:bg-[#171A3B] text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-700 transition-colors"
              aria-label="Toggle sidebar">
              {isSidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          )}
          <Link to="/" className="flex items-center gap-1.5 group" onClick={() => setMobileOpen(false)}>
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#6338F5] to-[#168BFF] flex items-center justify-center group-hover:scale-105 transition-transform shrink-0">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-extrabold tracking-tight text-slate-900 dark:text-white font-sans">
              ANAGU<span className="text-[#13C98A]">!</span>
            </span>
          </Link>
        </div>

        {/* ── Desktop nav ──────────────────────────────────────────────────── */}
        <nav className="hidden lg:flex items-center gap-5 text-xs font-semibold text-slate-600 dark:text-slate-300">
          {NAV_LINKS.map(link => (
            <Link key={link.to} to={link.to}
              className={`whitespace-nowrap transition-colors hover:text-[#6338F5] dark:hover:text-white ${
                isActive(link.to, link.exact) ? 'text-[#6338F5] dark:text-[#168BFF] font-bold' : ''
              }`}>
              {link.label}
            </Link>
          ))}
        </nav>

        {/* ── Right actions ────────────────────────────────────────────────── */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          <ThemeToggle />
          <NotificationDrawer />

          {isAuthenticated ? (
            <Link to="/portal/profile" className="hidden sm:flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-700/60">
              <div className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-indigo-500/40 overflow-hidden flex items-center justify-center shrink-0">
                {currentUser.avatarUrl
                  ? <img src={currentUser.avatarUrl} alt={currentUser.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  : <span className="text-xs font-bold text-indigo-600 dark:text-indigo-300">{currentUser.name.charAt(0)}</span>
                }
              </div>
              <span className="hidden xl:block text-xs font-semibold text-slate-800 dark:text-white leading-tight truncate max-w-[80px]">{currentUser.name}</span>
            </Link>
          ) : (
            <Link to="/auth/login" className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#6338F5] text-white text-xs font-semibold hover:bg-[#5229db] transition-colors">
              <LogIn className="w-3.5 h-3.5" />Sign In
            </Link>
          )}

          {/* Mobile hamburger — always visible on small screens */}
          <button onClick={() => setMobileOpen(v => !v)}
            className="lg:hidden p-1.5 rounded-xl bg-slate-100 dark:bg-[#171A3B] text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-700 transition-colors"
            aria-label="Open menu">
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* ── Mobile drawer ──────────────────────────────────────────────────── */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-slate-200 dark:border-indigo-500/20 bg-white dark:bg-[#0D1126] px-4 py-3 space-y-1">
          {NAV_LINKS.map(link => (
            <Link key={link.to} to={link.to}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                isActive(link.to, link.exact)
                  ? 'bg-[#6338F5]/15 text-[#6338F5] dark:text-indigo-300 font-semibold'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#171A3B] hover:text-slate-900 dark:hover:text-white'
              }`}>
              {link.label}
            </Link>
          ))}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 mt-2">
            {isAuthenticated ? (
              <>
                <Link to="/portal/profile" onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#171A3B]">
                  <User className="w-4 h-4" />My Profile
                </Link>
                <button onClick={handleSignOut}
                  className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium text-rose-500 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 mt-1">
                  <LogIn className="w-4 h-4 rotate-180" />Sign Out
                </button>
              </>
            ) : (
              <>
                <Link to="/auth/login" onClick={() => setMobileOpen(false)}
                  className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-sm font-semibold bg-[#6338F5] text-white hover:bg-[#5229db]">
                  <LogIn className="w-4 h-4" />Sign In
                </Link>
                <Link to="/auth/register" onClick={() => setMobileOpen(false)}
                  className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-sm font-semibold text-[#6338F5] dark:text-indigo-300 hover:bg-slate-100 dark:hover:bg-[#171A3B] mt-1">
                  Create Account
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
