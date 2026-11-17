/**
 * ExploreLandPage — Browse all available/listed land parcels.
 * Includes OSM map, search, filters and Buy Land (Web3 wallet trigger).
 * No backend required — data comes from AppContext mock data.
 */
import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { useWallet } from '../../hooks/useWallet';
import { initiateLandPurchase } from '../../lib/web3';
import { LeafletMap } from '../gis/LeafletMap';
import { BackButton } from '../common/BackButton';
import {
  Search, MapPin, Award, Layers, TrendingUp, ShoppingCart,
  Wallet, CheckCircle2, AlertTriangle, X, Loader2, Filter,
  SlidersHorizontal, Eye
} from 'lucide-react';

const LISTING_PRICES: Record<string, string> = {
  'pcl-001': '1.25',
  'pcl-002': '0.85',
  'pcl-003': '2.10',
};

export const ExploreLandPage: React.FC = () => {
  const { parcels, addNotification, currentUser, isAuthenticated } = useApp();
  const { wallet, connecting, error: walletError, connect, hasWallet } = useWallet();
  const navigate = useNavigate();

  const [search,          setSearch]          = useState('');
  const [filterStatus,    setFilterStatus]    = useState<string>('all');
  const [selectedParcel,  setSelectedParcel]  = useState(parcels[0] ?? null);
  const [buyModalOpen,    setBuyModalOpen]    = useState(false);
  const [buyTarget,       setBuyTarget]       = useState<typeof parcels[0] | null>(null);
  const [txState,         setTxState]         = useState<'idle'|'pending'|'success'|'error'>('idle');
  const [txHash,          setTxHash]          = useState('');
  const [txError,         setTxError]         = useState('');
  const [priceInput,      setPriceInput]      = useState('');

  const listed = useMemo(() => {
    let list = parcels.filter(p => p.status === 'verified' || p.status === 'community_review');
    if (filterStatus !== 'all') list = list.filter(p => p.status === filterStatus);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(p =>
        p.titleNumber.toLowerCase().includes(q) ||
        p.lga.toLowerCase().includes(q) ||
        p.state.toLowerCase().includes(q) ||
        p.district.toLowerCase().includes(q) ||
        p.ownerName.toLowerCase().includes(q)
      );
    }
    return list;
  }, [parcels, search, filterStatus]);

  const openBuy = async (parcel: typeof parcels[0]) => {
    if (!isAuthenticated) { navigate('/auth/login'); return; }
    setBuyTarget(parcel);
    setPriceInput(LISTING_PRICES[parcel.id] ?? '0.5');
    setTxState('idle'); setTxHash(''); setTxError('');
    setBuyModalOpen(true);
    if (!wallet.connected) await connect();
  };

  const handleBuy = async () => {
    if (!buyTarget || !wallet.connected || !wallet.address) return;
    setTxState('pending'); setTxError('');
    try {
      const result = await initiateLandPurchase({
        tokenId: buyTarget.id,
        sellerAddress: '0xFE3B557E8Fb62b89F4916B721be55cEb828dBd73',
        priceEth: priceInput,
        parcelTitle: buyTarget.titleNumber,
      });
      if (result.success) {
        setTxHash(result.txHash); setTxState('success');
        addNotification({ title: 'Purchase Submitted', message: `Payment for ${buyTarget.titleNumber} sent. Awaiting Registrar approval.`, type: 'success' });
      } else { setTxState('error'); setTxError(result.error ?? 'Transaction failed'); }
    } catch (err: any) { setTxState('error'); setTxError(err.message ?? 'Transaction failed'); }
  };

  return (
    <div className="min-h-screen bg-transparent text-slate-900 dark:text-slate-100">
      {/* Header strip */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-white">Explore Available Land</h1>
            <p className="text-xs text-slate-400 mt-0.5">{listed.length} parcels listed · Nigeria Land Registry</p>
          </div>
          <div className="flex items-center gap-2">
            {/* Wallet connect */}
            {wallet.connected ? (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#13C98A]/15 border border-[#13C98A]/30 text-xs">
                <Wallet className="w-3.5 h-3.5 text-[#13C98A]" />
                <span className="text-[#13C98A] font-mono">{wallet.address?.slice(0,6)}…</span>
                <span className="text-slate-400">{wallet.balance} ETH</span>
              </div>
            ) : (
              <button onClick={connect} disabled={connecting}
                className="px-3 py-1.5 rounded-xl bg-[#6338F5] text-white text-xs font-semibold flex items-center gap-1.5 disabled:opacity-60">
                {connecting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Wallet className="w-3 h-3" />}
                {connecting ? 'Connecting…' : hasWallet ? 'Connect Wallet' : 'Get MetaMask'}
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-10">
        {/* Search + filter */}
        <div className="flex flex-col sm:flex-row gap-3 mb-5">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search by title, LGA, state, district…"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#171A3B] border border-indigo-500/20 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
            className="px-4 py-2.5 rounded-xl bg-[#171A3B] border border-indigo-500/20 text-white text-sm focus:outline-none focus:border-indigo-500">
            <option value="all">All Status</option>
            <option value="verified">Verified</option>
            <option value="community_review">Community Review</option>
          </select>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-5 gap-5">
          {/* Left: parcels list */}
          <div className="xl:col-span-2 space-y-3 max-h-[72vh] overflow-y-auto pr-1">
            {listed.length === 0 && (
              <div className="text-center text-slate-500 py-12 text-sm">No parcels match your search.</div>
            )}
            {listed.map(parcel => {
              const price  = LISTING_PRICES[parcel.id] ?? null;
              const isOwner = parcel.ownerId === currentUser?.id;
              const isSelected = selectedParcel?.id === parcel.id;
              return (
                <div key={parcel.id}
                  onClick={() => setSelectedParcel(parcel)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'border-[#6338F5] bg-[#6338F5]/10'
                      : 'border-indigo-500/15 bg-[#0d1126] hover:border-indigo-500/30'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <div className="text-sm font-bold text-white font-mono">{parcel.titleNumber}</div>
                      <div className="flex items-center gap-1 text-xs text-slate-400 mt-0.5">
                        <MapPin className="w-3 h-3 text-[#168BFF]" />
                        {parcel.district}, {parcel.lga}, {parcel.state}
                      </div>
                    </div>
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded shrink-0 ${
                      parcel.status === 'verified'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    }`}>{parcel.status}</span>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-400 mb-3">
                    <span>{parcel.sizeSqm.toLocaleString()} m² · {parcel.landUse}</span>
                    <span>₦{(parcel.marketValuation / 1_000_000).toFixed(0)}M</span>
                  </div>

                  <div className="flex gap-2">
                    <Link to={`/portal/lands/${parcel.id}`}
                      onClick={e => e.stopPropagation()}
                      className="flex-1 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs font-medium text-center hover:bg-slate-700 flex items-center justify-center gap-1">
                      <Eye className="w-3 h-3" />Details
                    </Link>
                    {!isOwner && price && (
                      <button onClick={e => { e.stopPropagation(); openBuy(parcel); }}
                        className="flex-1 py-1.5 rounded-lg bg-[#6338F5] text-white text-xs font-semibold hover:bg-[#5229db] flex items-center justify-center gap-1">
                        <ShoppingCart className="w-3 h-3" />
                        Buy · {price} ETH
                      </button>
                    )}
                    {isOwner && (
                      <div className="flex-1 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-medium text-center">
                        Your Parcel
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right: OSM map showing selected parcel */}
          <div className="xl:col-span-3">
            <div className="sticky top-20">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-white flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-[#13C98A]" />
                  {selectedParcel ? `${selectedParcel.titleNumber} · ${selectedParcel.district}` : 'Select a parcel'}
                </span>
                <span className="text-[10px] text-slate-500 font-mono">OpenStreetMap · WGS-84</span>
              </div>
              <LeafletMap
                center={selectedParcel?.coordinates[0]
                  ? { lat: selectedParcel.coordinates[0].lat, lng: selectedParcel.coordinates[0].lng }
                  : { lat: 6.4541, lng: 3.3947 }}
                parcels={listed.map(p => ({
                  id: p.id,
                  title: p.titleNumber,
                  coords: p.coordinates.map(c => ({ lat: c.lat, lng: c.lng })),
                  color: p.id === selectedParcel?.id ? '#13C98A' : '#6338F5',
                }))}
                height="h-[56vh]"
                readOnly
              />
              {selectedParcel && (
                <div className="mt-3 p-3 rounded-xl bg-[#0d1126] border border-indigo-500/15 grid grid-cols-2 gap-2 text-xs">
                  <div><span className="text-slate-500">Coordinates</span>
                    <div className="text-slate-300 font-mono text-[11px] mt-0.5">
                      {selectedParcel.coordinates.map(c => `${c.lat.toFixed(4)}°N ${c.lng.toFixed(4)}°E`).join(' · ')}
                    </div>
                  </div>
                  <div><span className="text-slate-500">Area</span>
                    <div className="text-white font-mono">{selectedParcel.sizeSqm.toLocaleString()} m²</div>
                  </div>
                  <div><span className="text-slate-500">Token Hash</span>
                    <div className="text-amber-300 font-mono truncate">{selectedParcel.tokenHash}</div>
                  </div>
                  <div><span className="text-slate-500">Market Value</span>
                    <div className="text-white">₦{(selectedParcel.marketValuation / 1_000_000).toFixed(0)}M</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Buy Modal ─────────────────────────────────────────────────────────── */}
      {buyModalOpen && buyTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-[#171A3B] rounded-2xl border border-indigo-500/30 shadow-2xl">
            <div className="flex items-center justify-between p-5 border-b border-slate-800">
              <div>
                <h2 className="text-sm font-bold text-white">Purchase Land Title</h2>
                <p className="text-xs text-slate-400 font-mono">{buyTarget.titleNumber}</p>
              </div>
              <button onClick={() => setBuyModalOpen(false)} className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div className="p-3 rounded-xl bg-[#0d1126] border border-slate-800 space-y-1.5 text-xs font-mono">
                <div className="flex justify-between"><span className="text-slate-400">Location</span><span className="text-white">{buyTarget.district}, {buyTarget.lga}</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Area</span><span className="text-white">{buyTarget.sizeSqm.toLocaleString()} m²</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Owner</span><span className="text-indigo-300">{buyTarget.ownerName}</span></div>
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">Purchase Price (ETH)</label>
                <input type="number" step="0.001" min="0.001" value={priceInput}
                  onChange={e => setPriceInput(e.target.value)} disabled={txState !== 'idle'}
                  className="w-full bg-[#0d1126] border border-slate-700 rounded-xl px-3 py-2.5 text-white font-mono text-sm focus:border-indigo-500 focus:outline-none" />
              </div>

              {!wallet.connected && (
                <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                  <span>Connect your wallet. <button onClick={connect} className="underline font-semibold">{connecting ? 'Connecting…' : 'Connect now'}</button></span>
                </div>
              )}
              {wallet.connected && txState === 'idle' && (
                <div className="p-2.5 rounded-xl bg-indigo-950/30 border border-indigo-500/20 text-indigo-300 text-xs flex items-center gap-2">
                  <Wallet className="w-3.5 h-3.5" />
                  <span className="font-mono">{wallet.address?.slice(0,10)}…</span>
                  <span className="text-slate-400 ml-auto">{wallet.balance} ETH</span>
                </div>
              )}
              {txState === 'pending' && (
                <div className="p-4 text-center space-y-2">
                  <Loader2 className="w-8 h-8 text-indigo-400 animate-spin mx-auto" />
                  <p className="text-sm text-indigo-300">Confirm in {wallet.walletName}…</p>
                </div>
              )}
              {txState === 'success' && (
                <div className="p-4 text-center space-y-2 bg-emerald-950/30 border border-emerald-500/30 rounded-xl">
                  <CheckCircle2 className="w-8 h-8 text-[#13C98A] mx-auto" />
                  <p className="text-sm text-[#13C98A] font-semibold">Payment Submitted!</p>
                  <p className="text-[11px] font-mono text-indigo-400 truncate">{txHash}</p>
                  <p className="text-xs text-slate-400">Registrar review required before title transfers.</p>
                </div>
              )}
              {txState === 'error' && (
                <div className="p-3 rounded-xl bg-rose-950/30 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-3.5 h-3.5" />{txError}
                </div>
              )}

              <div className="flex gap-3">
                <button onClick={() => setBuyModalOpen(false)} className="flex-1 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold">
                  {txState === 'success' ? 'Close' : 'Cancel'}
                </button>
                {txState === 'idle' && wallet.connected && (
                  <button onClick={handleBuy} className="flex-1 py-2.5 rounded-xl bg-[#6338F5] text-white text-xs font-semibold flex items-center justify-center gap-1.5">
                    <ShoppingCart className="w-3.5 h-3.5" />Buy with {wallet.walletName}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
