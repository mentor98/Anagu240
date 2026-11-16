import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, MapPin, Search } from 'lucide-react';
import { publicApiRequest } from '../../lib/api';
import { BackButton } from '../common/BackButton';

type PublicTitle = {
  tokenId: string;
  parcelId: string;
  state: string | null;
  lga: string | null;
  addressDesc: string | null;
  latitude: number;
  longitude: number;
  isRevoked: boolean;
  issuedAt: string;
};

const NIGERIA_VIEW = '4.272,3.55,13.89,13.89';

export const ExploreLandPage: React.FC = () => {
  const [titles, setTitles] = useState<PublicTitle[]>([]);
  const [selectedId, setSelectedId] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    void publicApiRequest<PublicTitle[]>('/public/titles').then(records => {
      if (active) {
        setTitles(records);
        setSelectedId(records[0]?.parcelId ?? '');
      }
    }).catch(loadError => {
      if (active) setError(loadError instanceof Error ? loadError.message : 'Could not load recorded titles.');
    }).finally(() => {
      if (active) setLoading(false);
    });
    return () => { active = false; };
  }, []);

  const filteredTitles = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return titles;
    return titles.filter(title =>
      [title.state, title.lga, title.addressDesc, title.tokenId, title.parcelId]
        .some(value => value?.toLowerCase().includes(query)),
    );
  }, [search, titles]);

  const selectedTitle = filteredTitles.find(title => title.parcelId === selectedId) ?? filteredTitles[0];
  const mapUrl = useMemo(() => {
    if (!selectedTitle) {
      return `https://www.openstreetmap.org/export/embed.html?bbox=${NIGERIA_VIEW}&layer=mapnik`;
    }
    const { latitude, longitude } = selectedTitle;
    const bbox = [
      longitude - 0.02,
      latitude - 0.02,
      longitude + 0.02,
      latitude + 0.02,
    ].join(',');
    return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${latitude},${longitude}`;
  }, [selectedTitle]);

  return (
    <div className="min-h-screen px-4 py-8 text-slate-900 dark:text-slate-100 sm:px-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <BackButton to="/" label="Back to Anagu" />
        <header className="space-y-2">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Explore recorded land titles</h1>
          <p className="max-w-3xl text-sm text-slate-600 dark:text-slate-300">
            Browse title records and their approximate mapped locations across Nigeria. Verify a token before relying on any record.
          </p>
        </header>

        <div role="status" className="flex items-start gap-2 rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-200">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <p>
            This is a title-record explorer, not a land-for-sale marketplace. Listings, wallet payments, escrow, and approved title transfers are not enabled. Do not send funds for a property through Anagu yet.
          </p>
        </div>

        {error && (
          <p role="alert" className="rounded-lg border border-rose-300 bg-rose-50 p-4 text-sm text-rose-800 dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-200">
            {error}
          </p>
        )}

        <div className="grid gap-5 lg:grid-cols-[minmax(0,1.4fr)_minmax(320px,0.8fr)]">
          <section className="overflow-hidden rounded-lg border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
            <iframe
              key={mapUrl}
              title="OpenStreetMap view of land title records"
              src={mapUrl}
              className="h-[420px] w-full border-0 sm:h-[560px]"
              loading="lazy"
              referrerPolicy="no-referrer"
            />
            <div className="border-t border-slate-200 px-4 py-2 text-xs text-slate-500 dark:border-slate-700 dark:text-slate-400">
              Map data © <a className="underline" href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap contributors</a>. A marker shows the selected parcel's approximate centroid, not its legal boundary.
            </div>
          </section>

          <section className="space-y-3">
            <label className="relative block">
              <span className="sr-only">Search title records</span>
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={search}
                onChange={event => setSearch(event.target.value)}
                placeholder="Search state, LGA or title token"
                className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-9 pr-3 text-sm dark:border-slate-700 dark:bg-slate-900"
              />
            </label>

            {loading && <p className="p-4 text-sm text-slate-500">Loading title records…</p>}
            {!loading && filteredTitles.length === 0 && !error && (
              <p className="rounded-lg border border-slate-200 p-5 text-sm text-slate-500 dark:border-slate-700">
                No title records are currently available to explore.
              </p>
            )}

            <ul className="max-h-[520px] space-y-2 overflow-y-auto">
              {filteredTitles.map(title => (
                <li key={title.tokenId}>
                  <article className={`rounded-lg border p-4 ${selectedTitle?.parcelId === title.parcelId ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/30' : 'border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900'}`}>
                    <button
                      type="button"
                      onClick={() => setSelectedId(title.parcelId)}
                      className="w-full text-left"
                    >
                      <span className="flex items-center justify-between gap-2">
                        <span className="font-mono text-sm font-semibold">Title token #{title.tokenId}</span>
                        <span className={`text-xs ${title.isRevoked ? 'text-rose-600' : 'text-slate-500'}`}>
                          {title.isRevoked ? 'Revoked record' : 'Recorded'}
                        </span>
                      </span>
                      <span className="mt-2 flex items-center gap-1 text-xs text-slate-600 dark:text-slate-300">
                        <MapPin className="h-3.5 w-3.5" />
                        {[title.addressDesc, title.lga, title.state].filter(Boolean).join(', ') || 'Location not recorded'}
                      </span>
                    </button>
                    <span className="mt-3 flex items-center justify-between text-xs">
                      <span className="text-slate-500">Approximate centroid</span>
                      <Link
                        to={`/verify?q=${encodeURIComponent(title.tokenId)}`}
                        className="font-medium text-indigo-700 underline dark:text-indigo-300"
                      >
                        Verify title
                      </Link>
                    </span>
                  </article>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
};
