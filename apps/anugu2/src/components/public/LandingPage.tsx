import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import {
  Search,
  Layers,
  Award,
  Users,
  Compass,
  ArrowRight,
  ChevronRight,
  Sparkles,
  Zap
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const { isAuthenticated } = useApp();
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    navigate(`/verify?q=${encodeURIComponent(searchQuery.trim())}`);
  };

  return (
    <div className="min-h-screen bg-transparent text-slate-900 dark:text-slate-100 font-sans selection:bg-[#6338F5] selection:text-white relative overflow-hidden">

      {/* Hero Section */}
      <section className="relative pt-8 pb-16 sm:pt-16 sm:pb-24 overflow-hidden border-b border-indigo-500/15 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="max-w-3xl mx-auto space-y-6 text-center">
              {/* Tagline Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#171A3B]/80 backdrop-blur-md border border-indigo-500/40 text-xs font-mono text-indigo-300">
                <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin" />
                <span>Nigeria Land Records · Spatial Verification · Blockchain</span>
              </div>

              <h1 className="text-4xl sm:text-5xl xl:text-6xl font-extrabold tracking-tight text-white leading-[1.12] font-sans">
                Land Administration.{' '}
                <span className="bg-gradient-to-r from-[#168BFF] via-[#6338F5] to-amber-300 bg-clip-text text-transparent">
                  Immutable. Transparent.
                </span>
              </h1>

              <p className="text-sm sm:text-base text-slate-300 max-w-xl mx-auto lg:mx-0 font-normal leading-relaxed">
                Anagu brings parcel registration, surveyed boundaries and statutory title records together. Search real issued titles, submit a parcel for review, or explore how the registry works.
              </p>

              {/* Instant Verification Search */}
              <form onSubmit={handleSearch} className="max-w-xl mx-auto lg:mx-0 pt-2">
                <div className="relative flex items-center bg-[#171A3B]/90 backdrop-blur-md border border-indigo-500/40 rounded-2xl p-1.5 shadow-sm focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500/20 transition-all">
                  <Search className="w-5 h-5 text-slate-400 ml-3 shrink-0" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Enter a recorded NFT token ID to verify"
                    className="w-full bg-transparent border-0 px-3 py-2 text-xs sm:text-sm text-white placeholder-slate-400 focus:outline-none font-mono"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2.5 rounded-xl bg-[#3D288C] text-white text-xs font-semibold hover:bg-[#332175] transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5"
                  >
                    <span>Verify Title</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

              </form>

              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <Link
                  to={isAuthenticated ? "/portal/register-land" : "/auth/register"}
                  className="px-6 py-3 rounded-xl bg-[#3D288C] text-white text-xs sm:text-sm font-semibold hover:opacity-95 transition-opacity flex items-center gap-2"
                >
                  <Zap className="w-4 h-4 text-amber-300" />
                  <span>Register land</span>
                  <ChevronRight className="w-4 h-4" />
                </Link>
                <Link
                  to="/explore"
                  className="px-6 py-3 rounded-xl bg-[#171A3B]/80 backdrop-blur-md border border-slate-700 hover:border-indigo-500 text-slate-200 text-xs sm:text-sm font-semibold transition-colors flex items-center gap-2"
                >
                  <Layers className="w-4 h-4 text-[#13C98A]" />
                  <span>Explore land</span>
                </Link>
              </div>
            </div>
        </div>
      </section>

      {/* 4 Pillars of the ANAGU Protocol */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
          <div className="text-xs font-mono uppercase tracking-widest text-indigo-400">
            Engineered for African & Sovereign Cadastres
          </div>
          <h2 className="text-3xl font-bold text-white">Core registry workflows</h2>
          <p className="text-sm text-slate-400">
            Anagu is being built around these connected land administration needs. Availability depends on each service being configured.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-6 rounded-2xl bg-[#171A3B]/80 backdrop-blur-md border border-indigo-500/20 space-y-4 hover:border-indigo-500/40 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-[#6338F5]">
              <Layers className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white">GIS Spatial Verification</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Submitted parcel coordinates are checked by the API against recorded parcel geometry. Coverage depends on available registry data.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#171A3B]/80 backdrop-blur-md border border-indigo-500/20 space-y-4 hover:border-indigo-500/40 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-[#13C98A]">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white">Community Attestation</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Community attestations are part of the target approval process; identity, notice delivery, and legal sufficiency require agency review.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#171A3B]/80 backdrop-blur-md border border-indigo-500/20 space-y-4 hover:border-indigo-500/40 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-[#168BFF]">
              <Award className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white">Registry-Governed NFTs</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              The contracts define registry-controlled title actions. Issuance and transfer require deployed contracts and authorized officials.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#171A3B]/80 backdrop-blur-md border border-indigo-500/20 space-y-4 hover:border-indigo-500/40 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Compass className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white">MQTT Offline Edge Sync</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Surveyor submissions can be published through the configured messaging service. Durable offline capture and replay still need verification.
            </p>
          </div>
        </div>
      </section>

      {/* How it Works Stepper */}
      <section className="py-20 bg-[#0a0f2b]/90 backdrop-blur-md border-t border-b border-indigo-500/10 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-xl mx-auto mb-14 space-y-2">
            <div className="text-xs font-mono uppercase tracking-widest text-[#13C98A]">
              Intended registration workflow
            </div>
            <h2 className="text-3xl font-bold text-white">From application to title</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {[
              {
                step: '01',
                title: 'Citizen Filing',
                desc: 'The applicant submits parcel details and supporting documents for review.'
              },
              {
                step: '02',
                title: 'Cadastral Survey',
                desc: 'A licensed surveyor records and submits the parcel boundary coordinates.'
              },
              {
                step: '03',
                title: 'Neighbor Attestation',
                desc: 'Community and notice requirements are handled according to the applicable state process.'
              },
              {
                step: '04',
                title: 'Registrar Vetting',
                desc: 'Authorized officials review ownership evidence and applicable statutory requirements.'
              },
              {
                step: '05',
                title: 'Governor Assent & Mint',
                desc: 'After required approvals, the authorized registry may issue a title on its configured network.'
              }
            ].map(item => (
              <div key={item.step} className="p-5 rounded-xl bg-[#171A3B]/80 backdrop-blur-md border border-slate-800 space-y-2">
                <div className="text-xl font-bold font-mono text-[#6338F5]">{item.step}.</div>
                <div className="text-sm font-semibold text-white">{item.title}</div>
                <div className="text-xs text-slate-400 leading-relaxed">{item.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Public Verification Call to Action Banner */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-[#171A3B] via-[#1a1f4a] to-[#0d1233] border border-indigo-500/40 text-center space-y-6 shadow-2xl">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
            Ready to Verify or Administer Land Records?
          </h2>
          <p className="text-sm text-slate-300 max-w-xl mx-auto">
            Start a citizen account or verify an issued title. Administrative actions are restricted to assigned roles.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/auth/register"
              className="px-6 py-3 rounded-xl bg-[#3D288C] hover:bg-[#332175] text-white text-sm font-bold transition-all"
            >
              Create an account
            </Link>
            <Link
              to="/verify"
              className="px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-semibold border border-slate-700 transition-colors"
            >
              Public Title Search
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
