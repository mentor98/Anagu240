import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Lock } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#060a1d] text-slate-400 text-xs border-t border-indigo-500/15 py-12 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-[#6338F5] to-[#168BFF] flex items-center justify-center">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <span className="text-base font-bold text-white font-sans">
              ANAGU<span className="text-[#13C98A]">!</span>
            </span>
          </div>
          <p className="text-slate-400 text-[11px] leading-relaxed">
            Sovereign blockchain-powered land administration and geodetic title verification platform.
          </p>
          <div className="text-[10px] text-slate-500 font-mono">
            TAGLINE: SECURE. TRANSPARENT. TRUSTED.
          </div>
        </div>

        <div>
          <div className="font-bold text-white mb-3 text-xs uppercase tracking-wider font-mono">
            Public Registry
          </div>
          <ul className="space-y-2 text-[11px]">
            <li><Link to="/verify" className="hover:text-white transition-colors">Public Title Verification</Link></li>
            <li><Link to="/explore" className="hover:text-white transition-colors">Explore recorded land</Link></li>
            <li><Link to="/verify" className="hover:text-white transition-colors">Title verification</Link></li>
            <li><Link to="/how-it-works" className="hover:text-white transition-colors">How It Works</Link></li>
          </ul>
        </div>

        <div>
          <div className="font-bold text-white mb-3 text-xs uppercase tracking-wider font-mono">
            Workspaces
          </div>
          <ul className="space-y-2 text-[11px]">
            <li><Link to="/portal/dashboard" className="hover:text-white transition-colors">Citizen Vault</Link></li>
            <li><Link to="/portal/surveyor" className="hover:text-white transition-colors">Surveyor Console</Link></li>
            <li><Link to="/portal/registrar" className="hover:text-white transition-colors">Registrar Queue</Link></li>
            <li><Link to="/portal/governor" className="hover:text-white transition-colors">Governor Portal</Link></li>
          </ul>
        </div>

        <div>
          <div className="font-bold text-white mb-3 text-xs uppercase tracking-wider font-mono">
            Compliance
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed mb-2">
            Compliant with Section 28 of the Land Use Act (1978) and Open Geospatial Consortium (OGC) cadastral standards.
          </p>
          <div className="flex items-center gap-1.5 text-emerald-400 font-mono text-[10px]">
            <Lock className="w-3 h-3" />
            <span>Cryptographic State Cadastre</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500 font-mono">
        <div>© 2026 ANAGU! Land Administration Protocol. All Rights Reserved.</div>
        <div className="flex items-center gap-4">
          <Link to="/about" className="hover:underline">About</Link>
          <Link to="/features" className="hover:underline">Features</Link>
          <Link to="/contact" className="hover:underline">Contact</Link>
          <Link to="/portal/help" className="hover:underline">FAQ</Link>
        </div>
      </div>
    </footer>
  );
};
