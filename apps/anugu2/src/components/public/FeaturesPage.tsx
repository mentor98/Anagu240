import React from 'react';
import { Layers, Award, Users, Compass, ShieldCheck, Zap, Wifi } from 'lucide-react';
import { BackButton } from '../common/BackButton';

export const FeaturesPage: React.FC = () => {
  const features = [
    {
      icon: Layers,
      title: 'Topological Boundary Collision Engine',
      desc: 'Automatic polygon intersection matrix ensures that newly surveyed parcels cannot overlap with pre-existing registered titles, waterways, or utility right-of-ways.'
    },
    {
      icon: Award,
      title: 'Sovereign NFT Title Deeds (ERC-721)',
      desc: 'Digital Certificate of Occupancy minted as non-fungible tokens. Each deed carries surveyed beacon coordinates, state seal, and legal memorials.'
    },
    {
      icon: Users,
      title: 'Decentralized Community Attestation',
      desc: 'Abutting cardinal neighbors receive automated notice and sign off on boundary lines, preventing silent encroachment and multi-year court boundary disputes.'
    },
    {
      icon: Compass,
      title: 'Precision WGS-84 Coordinate Logging',
      desc: 'Differential GPS and RTK field beacon telemetry are cryptographically signed by certified surveyors and logged to the consensus ledger.'
    },
    {
      icon: Wifi,
      title: 'MQTT Offline Edge Synchronization',
      desc: 'Field geomatics tools work seamlessly in remote areas without internet coverage, caching signed beacons in SQLite and syncing reliably upon reconnection.'
    },
    {
      icon: ShieldCheck,
      title: 'Gubernatorial Consent Smart Contracts',
      desc: 'State statutory assent is required for all ownership transfers, preventing illegal black-market deeds while speeding up legitimate conveyances from years to days.'
    }
  ];

  return (
    <div className="min-h-screen bg-transparent text-slate-900 dark:text-slate-100 py-10 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <BackButton to="/" label="Back to Overview" />
        </div>

        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-[#171A3B] border border-indigo-200 dark:border-indigo-500/30 text-xs font-mono text-indigo-700 dark:text-indigo-300">
            <Zap className="w-3.5 h-3.5 text-amber-500" />
            <span>State-of-the-Art Cadastral Architecture</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">Platform Capabilities & Features</h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
            Engineered from first principles to meet the real-world operational challenges of African land administration.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <div key={i} className="p-6 rounded-2xl bg-white dark:bg-[#171A3B] border border-slate-200 dark:border-indigo-500/20 shadow-md space-y-3 hover:border-indigo-500/40 transition-colors">
                <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-[#6338F5]">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">{f.title}</h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{f.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
