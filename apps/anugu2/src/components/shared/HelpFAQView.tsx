import React, { useState } from 'react';
import { HelpCircle, ChevronDown, ChevronUp, ShieldCheck, Scale, Compass, Award } from 'lucide-react';
import { BackButton } from '../common/BackButton';

export const HelpFAQView: React.FC = () => {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const faqs = [
    {
      q: 'How does ANAGU eliminate duplicate land allocations and land grabbing?',
      a: 'ANAGU integrates geodetic GIS spatial validation with an immutable blockchain ledger. When a surveyor enters boundary coordinates, the system performs an automated topological collision check against all existing state parcels. If even 1 square meter overlaps with an existing title, the system mathematically rejects the plan before registration.'
    },
    {
      q: 'Why are direct peer-to-peer (P2P) NFT transfers blocked?',
      a: 'Under Section 22 of the Land Use Act, 1978, no conveyance or assignment of a Right of Occupancy is legally valid without the consent of the State Governor. Open, unregulated crypto NFT transfers would create illegal off-market conveyances. ANAGU enforces statutory law through smart contracts: transfer requests must route through Deeds Registry examination, tax clearance, and Governor consent.'
    },
    {
      q: 'What is Community Attestation and the 21-day notice window?',
      a: 'To guarantee that theoretical survey coordinates correspond to real-world possession on the ground, abutting perimeter neighbors (North, South, East, West) receive official notice and sign off on boundary lines. This resolves potential disputes before the title deed is minted.'
    },
    {
      q: 'Can a Certificate of Occupancy (C of O) be revoked on the blockchain?',
      a: 'Yes. Under Section 28 of the Land Use Act, the State Governor retains sovereign constitutional authority to revoke Rights of Occupancy for overriding public interest (e.g. federal highways, railways, public utilities). When an executive revocation order is confirmed, the smart contract triggers a memorial burn of the token to an unspendable address (0x0...DEAD) and records statutory compensation terms.'
    },
    {
      q: 'What happens if a field surveyor loses cellular connectivity?',
      a: 'ANAGU features an offline edge synchronization protocol. Surveyors can capture GPS-RTK beacon coordinates and cryptographic signatures locally in browser IndexedDB/SQLite cache. When connectivity returns, the MQTT broker automatically syncs the queued batch to consensus validator nodes.'
    }
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <BackButton to="/portal/dashboard" label="Back to Dashboard" />
      </div>

      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <HelpCircle className="w-6 h-6 text-[#6338F5]" />
          Cadastral Knowledge Base & Legal Guide
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Everything you need to know about blockchain land administration, Nigerian Land Use Act compliance, and GIS topology.
        </p>
      </div>

      <div className="space-y-3">
        {faqs.map((faq, i) => {
          const isOpen = openIdx === i;
          return (
            <div
              key={i}
              className="bg-[#171A3B] rounded-2xl border border-indigo-500/25 overflow-hidden shadow-xl"
            >
              <button
                onClick={() => setOpenIdx(isOpen ? null : i)}
                className="w-full p-5 text-left flex items-center justify-between gap-4 text-sm font-bold text-white hover:text-indigo-300 transition-colors"
              >
                <span>{faq.q}</span>
                {isOpen ? <ChevronUp className="w-4 h-4 text-indigo-400 shrink-0" /> : <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />}
              </button>

              {isOpen && (
                <div className="px-5 pb-5 text-xs text-slate-300 leading-relaxed border-t border-slate-800/80 pt-3">
                  {faq.a}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
