import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { BlockchainCadastreMesh } from '../animations/BlockchainCadastreMesh';
import { HolographicNFTDeedCard } from '../animations/HolographicNFTDeedCard';
import { LiveBlockTicker } from '../animations/LiveBlockTicker';
import {
  ShieldCheck,
  Search,
  Layers,
  Award,
  Users,
  Compass,
  ArrowRight,
  CheckCircle2,
  FileCheck,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Zap
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const { parcels, setSelectedCertificateParcel, theme } = useApp();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    navigate(`/verify?q=${encodeURIComponent(searchQuery.trim())}`);
  };

  const featuredParcel = parcels[0];

  return (
    <div className="min-h-screen bg-transparent text-slate-900 dark:text-slate-100 font-sans selection:bg-[#6338F5] selection:text-white relative overflow-hidden">

      {/* Hero Section */}
      <section className="relative pt-8 pb-16 sm:pt-16 sm:pb-24 overflow-hidden border-b border-indigo-500/15 z-10">
        {/* Glow Spheres (Softened) */}
        <div className="absolute top-1/4 left-1/3 -translate-x-1/2 -translate-y-1/2 w-[450px] h-[250px] bg-gradient-to-tr from-[#6338F5]/5 via-[#168BFF]/5 to-transparent blur-2xl pointer-events-none rounded-full" />
        <div className="absolute top-1/3 right-10 w-[300px] h-[200px] bg-gradient-to-br from-amber-500/5 via-[#6338F5]/5 to-transparent blur-2xl pointer-events-none rounded-full" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
          {/* Hero Two-Column Grid: Text/Search on Left, 3D Holographic NFT Card on Right */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
            {/* Left 7 Columns: Messaging & Search */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              {/* Tagline Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#171A3B]/80 backdrop-blur-md border border-indigo-500/40 text-xs font-mono text-indigo-300">
                <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin" />
                <span>Next-Gen Sovereign Cadastre · ERC-721 Land Protocol</span>
              </div>

              <h1 className="text-4xl sm:text-5xl xl:text-6xl font-extrabold tracking-tight text-white leading-[1.12] font-sans">
                Land Administration.{' '}
                <span className="bg-gradient-to-r from-[#168BFF] via-[#6338F5] to-amber-300 bg-clip-text text-transparent">
                  Immutable. Transparent.
                </span>
              </h1>

              <p className="text-sm sm:text-base text-slate-300 max-w-xl mx-auto lg:mx-0 font-normal leading-relaxed">
                ANAGU! eliminates duplicate allocations, land grabbing, and fraudulent conveyances through WGS-84 GIS spatial verification and state-governed blockchain NFT title deeds.
              </p>

              {/* Instant Verification Search */}
              <form onSubmit={handleSearch} className="max-w-xl mx-auto lg:mx-0 pt-2">
                <div className="relative flex items-center bg-[#171A3B]/90 backdrop-blur-md border border-indigo-500/40 rounded-2xl p-1.5 shadow-sm focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500/20 transition-all">
                  <Search className="w-5 h-5 text-slate-400 ml-3 shrink-0" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Enter Title Deed Ref (e.g. C-OF-O-2026-004912) or Token Hash..."
                    className="w-full bg-transparent border-0 px-3 py-2 text-xs sm:text-sm text-white placeholder-slate-400 focus:outline-none font-mono"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2.5 rounded-xl bg-[#6338F5] text-white text-xs font-semibold hover:bg-[#5328e6] transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 shadow-md shadow-indigo-600/30"
                  >
                    <span>Verify Title</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 mt-2 text-[11px] text-slate-400">
                  <span>Try live verification: </span>
                  <button
                    type="button"
                    onClick={() => setSearchQuery('C-OF-O-2026-004912')}
                    className="font-mono text-indigo-400 hover:underline"
                  >
                    C-OF-O-2026-004912
                  </button>
                  <span>·</span>
                  <button
                    type="button"
                    onClick={() => setSearchQuery('NIN-7749-2810-9421')}
                    className="font-mono text-indigo-400 hover:underline"
                  >
                    NIN-7749-2810-9421
                  </button>
                </div>
              </form>

              {/* Primary Action Buttons */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 pt-2">
                <Link
                  to="/portal/register-land"
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#6338F5] to-[#168BFF] text-white text-xs sm:text-sm font-semibold hover:opacity-95 transition-opacity shadow-lg shadow-indigo-500/25 flex items-center gap-2"
                >
                  <Zap className="w-4 h-4 text-amber-300" />
                  <span>Register Land Parcel</span>
                  <ChevronRight className="w-4 h-4" />
                </Link>
                <Link
                  to="/portal/gis"
                  className="px-6 py-3 rounded-xl bg-[#171A3B]/80 backdrop-blur-md border border-slate-700 hover:border-indigo-500 text-slate-200 text-xs sm:text-sm font-semibold transition-colors flex items-center gap-2"
                >
                  <Layers className="w-4 h-4 text-[#13C98A]" />
                  <span>Explore Interactive GIS</span>
                </Link>
              </div>
            </div>

            {/* Right 5 Columns: Interactive 3D Holographic NFT Deed Card */}
            <div className="lg:col-span-5 flex flex-col items-center justify-center">
              <div className="text-[11px] font-mono text-amber-400 mb-2 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                <span>INTERACTIVE 3D HOLOGRAPHIC TITLE DEED · TILT & MINT</span>
              </div>
              <HolographicNFTDeedCard />
            </div>
          </div>

          {/* 4-Column Metric Strip */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16 pt-8 border-t border-slate-800/80">
            <div className="p-4 rounded-xl bg-[#171A3B]/60 backdrop-blur-md border border-slate-800 text-center">
              <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono">48,290+</div>
              <div className="text-xs text-slate-400 mt-1">Verified NFT Titles Issued</div>
            </div>
            <div className="p-4 rounded-xl bg-[#171A3B]/60 backdrop-blur-md border border-slate-800 text-center">
              <div className="text-2xl sm:text-3xl font-extrabold text-[#13C98A] font-mono">0.00%</div>
              <div className="text-xs text-slate-400 mt-1">Duplicate Cadastral Overlaps</div>
            </div>
            <div className="p-4 rounded-xl bg-[#171A3B]/60 backdrop-blur-md border border-slate-800 text-center">
              <div className="text-2xl sm:text-3xl font-extrabold text-[#168BFF] font-mono">14 Days</div>
              <div className="text-xs text-slate-400 mt-1">Avg. C of O Processing Cycle</div>
            </div>
            <div className="p-4 rounded-xl bg-[#171A3B]/60 backdrop-blur-md border border-slate-800 text-center">
              <div className="text-2xl sm:text-3xl font-extrabold text-amber-400 font-mono">100%</div>
              <div className="text-xs text-slate-400 mt-1">Land Use Act (1978) Compliant</div>
            </div>
          </div>
        </div>
      </section>

      {/* Cybernetic Live Block Stream Ticker */}
      <LiveBlockTicker />

      {/* Live Featured Title Deed Card */}
      <section className="py-16 bg-[#0c1130]/90 backdrop-blur-md border-b border-indigo-500/10 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8 bg-gradient-to-r from-[#171A3B] to-[#12163b] rounded-2xl p-6 sm:p-8 border border-indigo-500/30 shadow-2xl">
            <div className="space-y-4 max-w-xl">
              <div className="inline-flex items-center gap-2 text-xs font-mono text-[#13C98A]">
                <ShieldCheck className="w-4 h-4" />
                <span>AUTHENTICATED STATE RECORD PREVIEW</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white">
                Inspect a Live Cryptographic Certificate of Occupancy
              </h2>
              <p className="text-sm text-slate-300 leading-relaxed">
                Every title deed in ANAGU is minted as a sovereign, non-transferable without state assent, ERC-721 token containing surveyed beacon coordinates, surveyor seal, and Governor assents.
              </p>
              <div className="space-y-1 text-xs text-slate-300 font-mono">
                <div>Parcel Title: <span className="text-white font-bold">{featuredParcel.titleNumber}</span></div>
                <div>Beneficiary: <span className="text-indigo-300">{featuredParcel.ownerName}</span> ({featuredParcel.ownerNationalId})</div>
                <div>Location: <span className="text-slate-200">{featuredParcel.district}, {featuredParcel.state} State</span></div>
              </div>
            </div>

            <div className="shrink-0 flex flex-col gap-3">
              <button
                onClick={() => setSelectedCertificateParcel(featuredParcel)}
                className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold text-xs uppercase tracking-wider hover:opacity-95 transition-opacity shadow-lg shadow-amber-500/20 flex items-center gap-2"
              >
                <Award className="w-4 h-4" />
                <span>View Digital Certificate (C of O)</span>
              </button>
              <Link
                to={`/portal/lands/${featuredParcel.id}`}
                className="px-6 py-3 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-200 font-semibold text-xs text-center hover:bg-slate-700 transition-colors"
              >
                Inspect Cadastral Coordinates
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
          <h2 className="text-3xl font-bold text-white">
            End-to-End Architectural Integrity
          </h2>
          <p className="text-sm text-slate-400">
            From field beacon logging to Governor consent, every step is mathematically enforced.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-6 rounded-2xl bg-[#171A3B]/80 backdrop-blur-md border border-indigo-500/20 space-y-4 hover:border-indigo-500/40 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-[#6338F5]">
              <Layers className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white">GIS Spatial Verification</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Automated topological boundary collision checking against existing state cadastre layers. Prevents duplicate allocation before survey lodging.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#171A3B]/80 backdrop-blur-md border border-indigo-500/20 space-y-4 hover:border-indigo-500/40 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-[#13C98A]">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white">Community Attestation</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Adjoining perimeter neighbors must attest to boundary beacons during a statutory 21-day notice window, eliminating boundary litigation.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#171A3B]/80 backdrop-blur-md border border-indigo-500/20 space-y-4 hover:border-indigo-500/40 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-[#168BFF]">
              <Award className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white">Registry-Governed NFTs</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Ownership tokens cannot be transferred directly peer-to-peer. All assignments require Registrar vetting and statutory Governor consent.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#171A3B]/80 backdrop-blur-md border border-indigo-500/20 space-y-4 hover:border-indigo-500/40 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Compass className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white">MQTT Offline Edge Sync</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Field surveyors can capture geodetic beacon telemetries in remote areas with zero cell connectivity. Local SQLite/IndexedDB caches replay reliably.
            </p>
          </div>
        </div>
      </section>

      {/* How it Works Stepper */}
      <section className="py-20 bg-[#0a0f2b]/90 backdrop-blur-md border-t border-b border-indigo-500/10 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-xl mx-auto mb-14 space-y-2">
            <div className="text-xs font-mono uppercase tracking-widest text-[#13C98A]">
              The 5-Step Process
            </div>
            <h2 className="text-3xl font-bold text-white">How a Title Deed is Created</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {[
              {
                step: '01',
                title: 'Citizen Filing',
                desc: 'Citizen lodges parcel location, purchase receipt, and applicant NIN identity verification.'
              },
              {
                step: '02',
                title: 'Cadastral Survey',
                desc: 'Licensed Surveyor establishes physical concrete beacons with differential GPS and lodges WGS-84 coordinates.'
              },
              {
                step: '03',
                title: 'Neighbor Attestation',
                desc: '4 boundary neighbors attest to physical perimeter fences during statutory notice window.'
              },
              {
                step: '04',
                title: 'Registrar Vetting',
                desc: 'Legal title deeds, tax compliance, and zoning clearances are verified by Deeds Registry.'
              },
              {
                step: '05',
                title: 'Governor Assent & Mint',
                desc: 'State Governor exercises constitutional assent; NFT Title Deed and C of O are permanently minted.'
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
            Switch between Citizen, Surveyor, Registrar, Land Administrator, Governor, and System Administrator personas instantly in this demonstration build.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/portal/dashboard"
              className="px-6 py-3 rounded-xl bg-[#6338F5] hover:bg-[#5229db] text-white text-sm font-bold shadow-lg shadow-indigo-600/30 transition-all"
            >
              Enter Cadastre Workspaces
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
