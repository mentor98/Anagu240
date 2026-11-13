import React from 'react';
import { ShieldCheck, Scale, Landmark, Globe } from 'lucide-react';
import { BackButton } from '../common/BackButton';

export const AboutPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-transparent text-slate-900 dark:text-slate-100 py-10 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <BackButton to="/" label="Back to Overview" />
        </div>

        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-[#171A3B] border border-indigo-200 dark:border-indigo-500/30 text-xs font-mono text-indigo-700 dark:text-indigo-300">
            <Landmark className="w-3.5 h-3.5 text-[#13C98A]" />
            <span>Institutional Governance & Mission</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
            About the ANAGU Cadastre Protocol
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
            ANAGU! was architected to solve the multi-billion dollar crisis of fraudulent conveyances, overlapping titles, and administrative delays across sovereign land registries.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-[#171A3B] border border-slate-200 dark:border-indigo-500/20 shadow-lg space-y-3">
            <ShieldCheck className="w-8 h-8 text-[#6338F5]" />
            <h2 className="text-base font-bold text-slate-900 dark:text-white">The Core Mission</h2>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Guaranteeing indisputable property rights for every citizen, commercial enterprise, and government through mathematical consensus and geodetic truth.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-[#171A3B] border border-slate-200 dark:border-indigo-500/20 shadow-lg space-y-3">
            <Scale className="w-8 h-8 text-amber-500" />
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Constitutional Harmony</h2>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Fully compliant with the Land Use Act of 1978. Smart contracts protect statutory gubernatorial oversight while removing manual bottlenecks.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-[#171A3B] border border-slate-200 dark:border-indigo-500/20 shadow-lg space-y-3">
            <Globe className="w-8 h-8 text-[#168BFF]" />
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Universal Cadastre Grid</h2>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Built on standard WGS-84 coordinate systems and open geospatial standards, allowing interoperability with national mapping agencies.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
