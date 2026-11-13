import React from 'react';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { BackButton } from '../common/BackButton';

export const HowItWorksPage: React.FC = () => {
  const steps = [
    {
      num: '01',
      title: 'Digital Application & National Identity Verification',
      desc: 'The citizen or corporate entity submits parcel particulars, purchase receipts, and National Identification Number (NIN). The identity is cryptographically pre-cleared against sovereign identity databases.'
    },
    {
      num: '02',
      title: 'Geodetic Survey & Beacon Establishment',
      desc: 'A licensed cadastral surveyor visits the parcel with differential GPS equipment, establishes concrete boundary beacons, and computes boundary closure. The plan is verified against topological collision layers.'
    },
    {
      num: '03',
      title: 'Neighbor Attestation & Notice Window',
      desc: 'The platform initiates a 21-day public notice window. All 4 adjoining boundary neighbors attest to physical boundaries, ensuring absence of land grabbing.'
    },
    {
      num: '04',
      title: 'Deeds Registry Examination & Fiscal Clearance',
      desc: 'The Deeds Registrar vets root of title, family allocations, zoning clearance, and stamp duty receipts.'
    },
    {
      num: '05',
      title: 'Executive Assent & NFT Deed Minting',
      desc: 'The State Governor executes statutory assent under the Land Use Act. The digital Certificate of Occupancy (C of O) is permanently minted onto the ledger with QR code verification.'
    }
  ];

  return (
    <div className="min-h-screen bg-transparent text-slate-900 dark:text-slate-100 py-10 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <BackButton to="/" label="Back to Overview" />
        </div>

        <div className="text-center space-y-3">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">How ANAGU Operates</h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-xl mx-auto">
            A step-by-step walkthrough of the transition from physical land acquisition to immutable blockchain title deed.
          </p>
        </div>

        <div className="space-y-4">
          {steps.map(s => (
            <div key={s.num} className="p-6 rounded-2xl bg-white dark:bg-[#171A3B] border border-slate-200 dark:border-indigo-500/20 shadow-md flex flex-col sm:flex-row items-start gap-5">
              <span className="text-3xl font-extrabold font-mono text-[#6338F5] shrink-0">{s.num}</span>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">{s.title}</h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center pt-4">
          <Link
            to="/portal/register-land"
            className="px-6 py-3 rounded-xl bg-[#6338F5] hover:bg-[#5229db] text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-indigo-600/30 inline-flex items-center gap-2"
          >
            <span>Start Land Registration</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
};
