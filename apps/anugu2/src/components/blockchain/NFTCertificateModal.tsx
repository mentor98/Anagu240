import React, { useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { Parcel } from '../../types';
import { useApp } from '../../context/AppContext';
import { X, Printer, Download, ShieldCheck, CheckCircle2, QrCode, Lock } from 'lucide-react';

interface Props {
  parcel: Parcel;
  onClose: () => void;
}

export const NFTCertificateModal: React.FC<Props> = ({ parcel, onClose }) => {
  const certificateRef = useRef<HTMLDivElement>(null);
  const { addNotification } = useApp();

  useEffect(() => {
    if (parcel.status !== 'revoked') {
      confetti({
        particleCount: 50,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  }, [parcel.status]);

  const handlePrint = () => {
    window.print();
  };

  const handleExportPdf = () => {
    addNotification({
      title: 'Certificate Export Prepared',
      message: `Prepared verifiable C of O archive package for ${parcel.titleNumber} (IPFS CID: ${parcel.ipfsDocumentHash.slice(0, 14)}...).`,
      type: 'success'
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-[#080D24] text-slate-100 rounded-2xl border border-amber-500/30 shadow-2xl overflow-hidden my-8">
        {/* Top Control Bar */}
        <div className="flex items-center justify-between px-6 py-3 bg-[#171A3B] border-b border-slate-700/60 print:hidden">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded bg-amber-500/20 text-amber-400">
              <ShieldCheck className="w-4 h-4" />
            </span>
            <span className="text-sm font-semibold text-white">Cryptographic Certificate of Occupancy (NFT Title Deed)</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-800 text-slate-200 hover:bg-slate-700 border border-slate-700 transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print</span>
            </button>
            <button
              onClick={handleExportPdf}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-[#6338F5] text-white hover:bg-[#5229db] transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Certificate Printable Canvas */}
        <div
          ref={certificateRef}
          className="p-8 sm:p-12 bg-gradient-to-b from-[#0f1438] via-[#0b102e] to-[#080d24] text-slate-100 relative"
        >
          {/* Guilloche / Ornate Gold Border */}
          <div className="border-4 border-double border-amber-500/40 rounded-xl p-6 sm:p-10 relative overflow-hidden">
            {/* Background Watermark Coat of Arms / ANAGU logo */}
            <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none select-none">
              <ShieldCheck className="w-96 h-96 text-amber-300" />
            </div>

            {/* Header / Republic & State Emblem */}
            <div className="text-center relative z-10 space-y-2">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/40 text-amber-400 mb-1">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <div className="text-xs font-mono tracking-widest uppercase text-amber-400 font-semibold">
                Federal Republic of Nigeria · State Cadastre Bureau
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white uppercase font-serif">
                Certificate of Occupancy
              </h1>
              <p className="text-xs text-slate-300 max-w-lg mx-auto">
                Issued Under the Authority of the Land Use Act, 1978 and Registered on the ANAGU Cryptographic Sovereign Cadastre
              </p>
            </div>

            {/* Title Number & Hash Ribbon */}
            <div className="mt-8 mb-6 py-2 px-4 rounded-lg bg-[#171A3B]/80 border border-amber-500/20 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div>
                <span className="text-slate-400">Title Deed Ref: </span>
                <span className="font-mono font-bold text-amber-400">{parcel.titleNumber}</span>
              </div>
              <div>
                <span className="text-slate-400">Token Contract: </span>
                <span className="font-mono text-indigo-300">ERC-721-CADASTRE-V1</span>
              </div>
              <div>
                <span className="text-slate-400">Block Height: </span>
                <span className="font-mono text-emerald-400">#{parcel.blockNumber}</span>
              </div>
            </div>

            {/* Legal Statement */}
            <div className="text-sm leading-relaxed text-slate-200 text-justify mb-8 space-y-3 font-sans">
              <p>
                THIS IS TO CERTIFY THAT <strong className="text-white underline decoration-amber-500/60">{parcel.ownerName.toUpperCase()}</strong> (National Identification Number: <span className="font-mono text-indigo-300">{parcel.ownerNationalId}</span>) is hereby granted the Right of Occupancy in and over the parcel of land described herein for a term of <strong>99 Years</strong> commencing on <span className="font-medium text-amber-300">{parcel.dateRegistered}</span>.
              </p>
              <p>
                The said parcel of land is situated at <strong>{parcel.district}</strong>, within <strong>{parcel.lga} Local Government Area</strong> of <strong>{parcel.state} State</strong>, measuring an area of approximately <strong>{parcel.sizeSqm.toLocaleString()} Square Metres ({parcel.sizeHectares} Hectares)</strong>, delineated on Cadastral Survey Plan Ref: <strong className="text-amber-400 font-mono">{parcel.surveyPlanNumber}</strong>.
              </p>
            </div>

            {/* Grid of Geodetic Coordinates & Token Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 text-xs">
              <div className="bg-[#171A3B]/60 rounded-xl p-4 border border-slate-700/60">
                <div className="font-semibold text-slate-200 mb-2 flex items-center justify-between">
                  <span>Geodetic Beacon Coordinates (WGS-84)</span>
                  <span className="text-[10px] text-slate-400 font-mono">Differential GPS</span>
                </div>
                <div className="space-y-1.5 font-mono text-[11px]">
                  {parcel.coordinates.map((c, idx) => (
                    <div key={idx} className="flex justify-between py-0.5 border-b border-slate-800">
                      <span className="text-amber-400 font-bold">{c.beaconNumber}</span>
                      <span className="text-slate-300">Lat: {c.lat.toFixed(6)}°</span>
                      <span className="text-slate-300">Lng: {c.lng.toFixed(6)}°</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-[#171A3B]/60 rounded-xl p-4 border border-slate-700/60 space-y-2">
                <div className="font-semibold text-slate-200 mb-1">Cryptographic Invariants</div>
                <div>
                  <div className="text-[10px] text-slate-400">On-Chain Token Hash</div>
                  <div className="font-mono text-[11px] text-emerald-400 truncate">{parcel.tokenHash}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400">IPFS Cadastral Record CID</div>
                  <div className="font-mono text-[11px] text-indigo-300 truncate">{parcel.ipfsDocumentHash}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400">Approved Land Zoning</div>
                  <div className="text-slate-200 font-medium">{parcel.landUse} Purpose</div>
                </div>
              </div>
            </div>

            {/* Official Signatures and Seal */}
            <div className="border-t border-amber-500/30 pt-6 mt-6 grid grid-cols-1 sm:grid-cols-3 gap-6 items-end">
              <div className="text-center sm:text-left space-y-1">
                <div className="font-mono text-xs text-indigo-400 mb-1 italic">/s/ Signed Cryptographically</div>
                <div className="font-bold text-white text-sm">{parcel.surveyorName}</div>
                <div className="text-[10px] text-slate-400">Surveyor-General / Cadastral Council</div>
              </div>

              <div className="flex flex-col items-center justify-center text-center">
                <div className="w-20 h-20 rounded-full border-2 border-amber-400 flex flex-col items-center justify-center p-1 bg-amber-500/10">
                  <Lock className="w-5 h-5 text-amber-400 mb-0.5" />
                  <span className="text-[8px] font-mono uppercase text-amber-300 font-bold leading-none">ANAGU STATE</span>
                  <span className="text-[7px] font-mono text-amber-400">OFFICIAL SEAL</span>
                </div>
                <span className="text-[9px] text-slate-400 mt-1 font-mono">TAMPER-PROOF VERIFIED</span>
              </div>

              <div className="text-center sm:text-right space-y-1">
                <div className="font-mono text-xs text-indigo-400 mb-1 italic">/s/ Approved by Royal Assent</div>
                <div className="font-bold text-white text-sm">Executive Governor</div>
                <div className="text-[10px] text-slate-400">State Chief Executive Officer</div>
              </div>
            </div>

            {/* Bottom Verification Strip */}
            <div className="mt-8 pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-4 text-[11px] text-slate-400">
              <div className="flex items-center gap-2">
                <QrCode className="w-6 h-6 text-slate-300" />
                <span>Scan or enter token hash on ANAGU Public Verification Portal to authenticate real-time validity.</span>
              </div>
              <div className="flex items-center gap-1 font-mono text-amber-400">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#13C98A]" />
                <span>STATUS: ACTIVE TITLED ESTATE</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
