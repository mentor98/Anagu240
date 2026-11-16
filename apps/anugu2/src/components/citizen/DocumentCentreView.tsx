import React, { useEffect, useState } from 'react';
import { Download, Files, FileText } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { apiRequest } from '../../lib/api';
import { BackButton } from '../common/BackButton';

type StoredDocument = {
  id: string;
  applicationId: string;
  documentType: string;
  fileName: string;
  fileSizeBytes: string;
  createdAt: string;
  applicationNumber: string;
};

export const DocumentCentreView: React.FC = () => {
  const { applications } = useApp();
  const [documents, setDocuments] = useState<StoredDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');

    void Promise.all(applications.map(async application => {
      const rows = await apiRequest<Omit<StoredDocument, 'applicationNumber'>[]>(
        `/documents/${encodeURIComponent(application.id)}`,
      );
      return rows.map(row => ({ ...row, applicationNumber: application.applicationNumber }));
    })).then(groups => {
      if (active) setDocuments(groups.flat());
    }).catch(loadError => {
      if (active) setError(loadError instanceof Error ? loadError.message : 'Could not load application documents.');
    }).finally(() => {
      if (active) setLoading(false);
    });

    return () => { active = false; };
  }, [applications]);

  const downloadDocument = async (document: StoredDocument) => {
    setDownloadingId(document.id);
    setError('');
    try {
      const result = await apiRequest<{ url: string }>(
        `/documents/${encodeURIComponent(document.applicationId)}/${encodeURIComponent(document.id)}/download`,
      );
      window.location.assign(result.url);
    } catch (downloadError) {
      setError(downloadError instanceof Error ? downloadError.message : 'Could not download this document.');
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <BackButton to="/portal/dashboard" label="Back to Dashboard" />
      <header>
        <h1 className="flex items-center gap-2 text-2xl font-bold text-slate-900 dark:text-white">
          <Files className="h-6 w-6 text-indigo-500" />
          Land documents
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Documents attached to applications you are authorized to access.
        </p>
      </header>

      {error && (
        <p role="alert" className="rounded-lg border border-rose-300 bg-rose-50 p-4 text-sm text-rose-800 dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-200">
          {error}
        </p>
      )}

      <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
        <table className="w-full min-w-[600px] text-left text-sm">
          <thead className="border-b border-slate-200 text-xs uppercase text-slate-500 dark:border-slate-700">
            <tr>
              <th className="px-4 py-3">Document</th>
              <th className="px-4 py-3">Application</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Uploaded</th>
              <th className="px-4 py-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {documents.map(document => (
              <tr key={document.id} className="border-b border-slate-100 last:border-0 dark:border-slate-800">
                <td className="px-4 py-3">
                  <span className="inline-flex items-center gap-2">
                    <FileText className="h-4 w-4 shrink-0 text-slate-500" />
                    {document.fileName}
                  </span>
                </td>
                <td className="px-4 py-3 font-mono text-xs">{document.applicationNumber}</td>
                <td className="px-4 py-3">{document.documentType}</td>
                <td className="px-4 py-3">{new Date(document.createdAt).toLocaleDateString()}</td>
                <td className="px-4 py-3 text-right">
                  <button
                    type="button"
                    onClick={() => void downloadDocument(document)}
                    disabled={downloadingId === document.id}
                    className="inline-flex items-center gap-1 rounded-md border border-slate-300 px-3 py-1.5 text-xs disabled:opacity-50 dark:border-slate-700"
                  >
                    <Download className="h-3.5 w-3.5" />
                    {downloadingId === document.id ? 'Preparing…' : 'Download'}
                  </button>
                </td>
              </tr>
            ))}
            {!loading && documents.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-sm text-slate-500">
                  {applications.length === 0 ? 'No application documents are available.' : 'No documents have been uploaded for your applications.'}
                </td>
              </tr>
            )}
            {loading && (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-sm text-slate-500">Loading documents…</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
