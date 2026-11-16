import React from 'react';
import { Parcel } from '../../types';
import { X, Printer, ShieldCheck, CheckCircle2, QrCode } from 'lucide-react';

interface Props {
  parcel: Parcel;
  onClose: () => void;
}

export const NFTCertificateModal: React.FC<Props> = ({ parcel, onClose }) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/70 p-2 sm:p-4 print:static print:block print:overflow-visible print:bg-white print:p-0">
      <div role="dialog" aria-modal="true" aria-labelledby="title-certificate-heading" className="relative my-auto max-h-[94vh] w-full max-w-4xl overflow-y-auto rounded-xl border border-slate-300 bg-white text-slate-800 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 print:my-0 print:max-h-none print:overflow-visible print:border-0 print:bg-white print:text-black">
        {/* Top Control Bar */}
        <div className="sticky top-0 z-10 flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 bg-white px-3 py-3 dark:border-slate-700 dark:bg-slate-900 sm:px-6 print:hidden">
          <div className="flex items-center gap-2">
            <span className="rounded bg-slate-100 p-1 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
              <ShieldCheck className="h-4 w-4" />
            </span>
            <span className="text-xs font-semibold sm:text-sm">Digital title record</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium dark:border-slate-700"
            >
              <Printer className="h-3.5 w-3.5" />
              <span>Print / Save PDF</span>
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
          className="p-3 text-slate-800 dark:text-slate-100 sm:p-8 print:p-0 print:text-black"
        >
          <div className="relative overflow-hidden rounded-lg border border-slate-300 p-4 dark:border-slate-700 sm:p-8 print:rounded-none print:border">

            {/* Header / Republic & State Emblem */}
            <div className="text-center relative z-10 space-y-2">
              <div className="mx-auto mb-1 inline-flex h-12 w-12 items-center justify-center rounded-full border border-slate-300 text-slate-600 dark:border-slate-700 dark:text-slate-300">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                Anagu · Digital land record
              </div>
              <h1 id="title-certificate-heading" className="text-xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
                Title record
              </h1>
              <p className="mx-auto max-w-lg text-xs text-slate-500 dark:text-slate-400">
                This record is a registry reference. Confirm legal title with the relevant land authority.
              </p>
            </div>

            {/* Title Number & Hash Ribbon */}
            <div className="my-5 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 p-3 text-xs dark:border-slate-700">
              <div>
                <span className="text-slate-400">Title Deed Ref: </span>
                <span className="font-mono font-bold">{parcel.titleNumber}</span>
              </div>
              <div>
                <span className="text-slate-400">Token Contract: </span>
                <span className="font-mono">ERC-721</span>
              </div>
              <div>
                <span className="text-slate-400">Block Height: </span>
                <span className="font-mono">{parcel.blockNumber ? `#${parcel.blockNumber}` : 'Not recorded'}</span>
              </div>
            </div>

            {/* Legal Statement */}
            <div className="mb-6 space-y-3 text-sm leading-relaxed">
              <p>
                Registered owner: <strong>{parcel.ownerName}</strong>. This application record does not replace an official title instrument.
              </p>
              <p>
                Parcel location: <strong>{parcel.district}, {parcel.lga}, {parcel.state}</strong>. Area: <strong>{parcel.sizeSqm.toLocaleString()} m²</strong>. Survey plan reference: <strong className="font-mono">{parcel.surveyPlanNumber || 'Not recorded'}</strong>.
              </p>
            </div>

            {/* Grid of Geodetic Coordinates & Token Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 text-xs">
              <div className="rounded-xl border border-slate-200 p-4 dark:border-slate-700">
                <div className="font-semibold text-slate-200 mb-2 flex items-center justify-between">
                  <span>Geodetic Beacon Coordinates (WGS-84)</span>
                  <span className="text-[10px] text-slate-400 font-mono">Survey record</span>
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

              <div className="space-y-2 rounded-xl border border-slate-200 p-4 dark:border-slate-700">
                <div className="mb-1 font-semibold">Digital record references</div>
                <div>
                  <div className="text-[10px] text-slate-500">Token reference</div>
                  <div className="truncate font-mono text-[11px]">{parcel.tokenHash}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-500">Document reference</div>
                  <div className="truncate font-mono text-[11px]">{parcel.ipfsDocumentHash || 'Not recorded'}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-500">Land use</div>
                  <div className="font-medium">{parcel.landUse}</div>
                </div>
              </div>
            </div>

            {/* Bottom Verification Strip */}
            <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-slate-200 pt-4 text-[11px] text-slate-500 dark:border-slate-700 dark:text-slate-400">
              <div className="flex items-center gap-2">
                <QrCode className="h-5 w-5" />
                <span>Verify this title token on the Anagu public verification page.</span>
              </div>
              <div className="flex items-center gap-1 font-mono">
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>Record status: {parcel.status}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
