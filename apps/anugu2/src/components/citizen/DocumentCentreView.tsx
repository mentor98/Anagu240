import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Files, Download, Eye, FileText, CheckCircle2, ShieldCheck, Search, Filter } from 'lucide-react';
import { BackButton } from '../common/BackButton';

export const DocumentCentreView: React.FC = () => {
  const { parcels, applications, addNotification } = useApp();
  const [selectedDoc, setSelectedDoc] = useState<any | null>(null);

  const mockDocuments = [
    {
      id: 'doc-001',
      title: 'Digital Certificate of Occupancy (C of O)',
      parcelRef: 'C-OF-O-2026-004912',
      type: 'Statutory Grant',
      size: '3.4 MB',
      date: '2026-02-14',
      ipfsHash: 'QmZtmD2qt8S991eZg9z48v9324hfkz924jfe949',
      verified: true
    },
    {
      id: 'doc-002',
      title: 'Cadastral Perimeter Survey Plan Sheet',
      parcelRef: 'LA/SRV/2026/0149',
      type: 'Geodetic Plan',
      size: '5.1 MB',
      date: '2026-02-10',
      ipfsHash: 'QmSrvCadastralPlanSheet2026Lagos0918',
      verified: true
    },
    {
      id: 'doc-003',
      title: 'Deed of Assignment (Vendor to Grantee)',
      parcelRef: 'C-OF-O-2026-004912',
      type: 'Conveyance',
      size: '2.8 MB',
      date: '2026-01-20',
      ipfsHash: 'QmDeedAssignmentGranteeAdeleke0921',
      verified: true
    },
    {
      id: 'doc-004',
      title: 'State Internal Revenue Stamp Duty Receipt',
      parcelRef: 'ANAGU-APP-2026-8819',
      type: 'Fiscal Clearance',
      size: '980 KB',
      date: '2026-03-01',
      ipfsHash: 'QmRevClearanceReceiptAdelekeFCT09',
      verified: true
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <BackButton to="/portal/dashboard" label="Back to Dashboard" />
      </div>

      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Files className="w-6 h-6 text-indigo-500" />
          Cadastral Document & Deeds Centre
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Access tamper-proof legal deeds, survey plans, and tax receipts cryptographically anchored to IPFS.
        </p>
      </div>

      <div className="bg-white dark:bg-[#171A3B] rounded-2xl border border-slate-200 dark:border-indigo-500/25 p-5 shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[600px]">
            <thead className="text-[11px] font-mono uppercase text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Document Title</th>
                <th className="py-3 px-4">Parcel Ref</th>
                <th className="py-3 px-4">Instrument Type</th>
                <th className="py-3 px-4">IPFS CID</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {mockDocuments.map(doc => (
                <tr key={doc.id} className="hover:bg-[#0d122e] transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-indigo-400 shrink-0" />
                      <span className="font-semibold text-white">{doc.title}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 font-mono text-amber-400">{doc.parcelRef}</td>
                  <td className="py-3 px-4 text-slate-300">{doc.type}</td>
                  <td className="py-3 px-4 font-mono text-indigo-300 truncate max-w-[150px]">
                    {doc.ipfsHash}
                  </td>
                  <td className="py-3 px-4 text-slate-400 font-mono">{doc.date}</td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setSelectedDoc(doc)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200"
                        title="Preview Document"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() =>
                          addNotification({
                            title: 'IPFS Download Initiated',
                            message: `Decentralized IPFS download stream started for ${doc.title}.`,
                            type: 'info'
                          })
                        }
                        className="p-1.5 rounded-lg bg-[#6338F5] hover:bg-[#5229db] text-white"
                        title="Download Document"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Document Preview Modal */}
      {selectedDoc && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white dark:bg-[#171A3B] border border-slate-200 dark:border-indigo-500/30 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-700">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#6338F5]" />
                {selectedDoc.title}
              </h3>
              <button
                onClick={() => setSelectedDoc(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-[#0d122e] rounded-xl border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
              <div>
                <span className="text-slate-500 dark:text-slate-400 block text-[11px]">Parcel Ref</span>
                <span className="text-amber-500 font-mono font-bold">{selectedDoc.parcelRef}</span>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400 block text-[11px]">Decentralized IPFS Storage CID</span>
                <span className="text-indigo-600 dark:text-indigo-300 font-mono break-all">{selectedDoc.ipfsHash}</span>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400 block text-[11px]">Verification Hash Status</span>
                <span className="text-emerald-500 font-mono flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>SHA-256 Digest Confirmed on Smart Contract</span>
                </span>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setSelectedDoc(null)}
                className="px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-semibold"
              >
                Close
              </button>
              <button
                onClick={() => {
                  addNotification({
                    title: 'Verified File Download',
                    message: `Downloaded ${selectedDoc.title} with cryptographic integrity check.`,
                    type: 'success'
                  });
                  setSelectedDoc(null);
                }}
                className="px-4 py-2 rounded-lg bg-[#6338F5] text-white hover:bg-[#5229db] text-xs font-bold"
              >
                Download Verified File
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
