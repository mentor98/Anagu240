import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { AlertTriangle, CheckCircle2, Loader2, Search, XCircle } from 'lucide-react';
import { BackButton } from '../common/BackButton';
import { INITIAL_PARCELS } from '../../data/mockData';

type TitleVerification = {
  tokenId: string;
  parcelId: string;
  ownerAddress: string;
  isRevoked: boolean;
  issueTransaction: string | null;
  issueBlock: string | null;
  revocationTransaction: string | null;
  chainId: string;
};

export const PublicVerifyPage: React.FC = () => {
  const location = useLocation();
  const [query, setQuery] = useState('');
  const [title, setTitle] = useState<TitleVerification | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const verify = (value: string) => {
    const tokenId = value.trim();
    if (!tokenId) return;
    setQuery(tokenId);
    setTitle(null);
    setError('');
    setLoading(true);

    // Search mock parcel data — no backend required
    setTimeout(() => {
      const parcel = INITIAL_PARCELS.find(p =>
        p.titleNumber.toLowerCase() === tokenId.toLowerCase() ||
        p.tokenHash.toLowerCase() === tokenId.toLowerCase() ||
        p.id === tokenId
      );

      if (parcel) {
        setTitle({
          tokenId: parcel.tokenHash,
          parcelId: parcel.id,
          ownerAddress: parcel.ownerNationalId,
          isRevoked: parcel.status === 'revoked',
          issueTransaction: parcel.tokenHash,
          issueBlock: String(parcel.blockNumber),
          revocationTransaction: null,
          chainId: '1337',
        });
      } else {
        setError(`No title found for "${tokenId}". Try: C-OF-O-2026-004912`);
      }
      setLoading(false);
    }, 600);
  };

  useEffect(() => {
    const value = new URLSearchParams(location.search).get('q');
    if (value) verify(value);
  }, [location.search]);

  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault();
    verify(query);
  };

  const explorerUrl = title?.issueTransaction
    ? `https://besu.anagu.gov/tx/${title.issueTransaction}`
    : null;

  return (
    <div className="min-h-screen bg-transparent px-4 py-10 text-slate-900 dark:text-slate-100 sm:px-6">
      <div className="mx-auto max-w-3xl space-y-8">
        <BackButton to="/" label="Back to Anagu" />
        <header className="space-y-3 text-center">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white sm:text-4xl">Verify a land title</h1>
          <p className="mx-auto max-w-xl text-sm text-slate-600 dark:text-slate-300">
            Enter an NFT token ID to check its recorded title and current status against the configured blockchain.
          </p>
        </header>

        <form onSubmit={handleSearch} className="flex flex-col gap-3 sm:flex-row">
          <label className="relative flex-1">
            <span className="sr-only">NFT token ID</span>
            <Search className="absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <input
              value={query}
              onChange={event => setQuery(event.target.value)}
              inputMode="numeric"
              placeholder="NFT token ID"
              className="w-full rounded-lg border border-slate-300 bg-white py-3 pl-11 pr-4 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            />
          </label>
          <button
            type="submit"
            disabled={loading || !query.trim()}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#3D288C] px-5 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            Verify title
          </button>
        </form>

        {error && (
          <div role="alert" className="rounded-lg border border-rose-300 bg-rose-50 p-4 text-sm text-rose-800 dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-200">
            <div className="flex items-start gap-2">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          </div>
        )}

        {title && (
          <section aria-live="polite" className="rounded-lg border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900 sm:p-7">
            <div className={`flex items-center gap-2 text-sm font-semibold ${title.isRevoked ? 'text-rose-700 dark:text-rose-300' : 'text-emerald-700 dark:text-emerald-300'}`}>
              {title.isRevoked ? <XCircle className="h-5 w-5" /> : <CheckCircle2 className="h-5 w-5" />}
              {title.isRevoked ? 'Title revoked on-chain' : 'Title exists and is active on-chain'}
            </div>
            <dl className="mt-5 grid gap-4 text-sm sm:grid-cols-2">
              <div><dt className="text-slate-500">Token ID</dt><dd className="mt-1 break-all font-mono">{title.tokenId}</dd></div>
              <div><dt className="text-slate-500">Parcel record</dt><dd className="mt-1 break-all font-mono">{title.parcelId}</dd></div>
              <div className="sm:col-span-2"><dt className="text-slate-500">Current owner wallet</dt><dd className="mt-1 break-all font-mono">{title.ownerAddress}</dd></div>
              <div><dt className="text-slate-500">Network chain ID</dt><dd className="mt-1 font-mono">{title.chainId}</dd></div>
              <div><dt className="text-slate-500">Issue block</dt><dd className="mt-1 font-mono">{title.issueBlock || 'Not recorded'}</dd></div>
            </dl>
            {title.isRevoked && title.revocationTransaction && (
              <p className="mt-4 break-all text-xs text-rose-700 dark:text-rose-300">
                Revocation transaction: {title.revocationTransaction}
              </p>
            )}
            {explorerUrl && (
              <a href={explorerUrl} target="_blank" rel="noreferrer" className="mt-5 inline-block text-sm font-medium text-indigo-700 underline dark:text-indigo-300">
                View issuance transaction on Sepolia Etherscan
              </a>
            )}
          </section>
        )}
      </div>
    </div>
  );
};
