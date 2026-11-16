import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { Parcel, Coordinate } from '../../types';
import {
  Layers,
  MapPin,
  ZoomIn,
  ZoomOut,
  RefreshCw,
  Plus,
  Trash2,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  FileCheck,
  Compass,
  Satellite
} from 'lucide-react';
import { BackButton } from '../common/BackButton';
import { CadastreGoogleMap } from './CadastreGoogleMap';
import { apiRequest } from '../../lib/api';

interface DrawnPoint {
  x: number;
  y: number;
  lat: number;
  lng: number;
  name: string;
}

export const GISWorkspace: React.FC = () => {
  const { parcels, submitSurveyReport, setSelectedCertificateParcel, currentRole, addNotification } = useApp();

  const [activeTab, setActiveTab] = useState<'inspect' | 'draw' | 'coords' | 'verify' | 'compare'>('inspect');
  const [mapEngine, setMapEngine] = useState<'google' | 'svg'>('google');
  const [selectedParcelId, setSelectedParcelId] = useState<string>(parcels[0]?.id || '');
  const selectedParcel = parcels.find(p => p.id === selectedParcelId) || parcels[0];
  const [zoom, setZoom] = useState(1);
  const [showZoning, setShowZoning] = useState(true);
  const [showBeacons, setShowBeacons] = useState(true);
  const [showOverlaps, setShowOverlaps] = useState(false);
  const [geodesicMetrics, setGeodesicMetrics] = useState<{
    areaSqm: number;
    hectares: number;
    perimeterM: number;
  } | null>(null);

  // Drawing mode state
  const [drawnPoints, setDrawnPoints] = useState<DrawnPoint[]>([]);

  // Coordinate entry input state
  const [manualLat, setManualLat] = useState('');
  const [manualLng, setManualLng] = useState('');
  const [manualBeacon, setManualBeacon] = useState('');

  // Topological Verification state
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<{
    status: 'passed' | 'overlap_detected' | 'invalid_geometry' | 'error';
    overlapAreaSqm: number;
    encroachingVertices: string[];
    sqlQuery: string;
    latencyMs: number;
    message: string;
  } | null>(null);

  // Survey Submission Modal / Form state
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [surveyPlanNumber, setSurveyPlanNumber] = useState('');
  const [surveyNotes, setSurveyNotes] = useState('');

  const svgRef = useRef<SVGSVGElement>(null);

  // Handle canvas click to add polygon point in draw mode
  const handleSvgClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (activeTab !== 'draw') return;
    if (!svgRef.current) return;

    const rect = svgRef.current.getBoundingClientRect();
    const x = Math.round((e.clientX - rect.left) / zoom);
    const y = Math.round((e.clientY - rect.top) / zoom);

    // Approximate lat/lng from SVG projection
    const lat = Number((6.435 + (500 - y) * 0.00003).toFixed(6));
    const lng = Number((3.465 + x * 0.00003).toFixed(6));

    const newPoint: DrawnPoint = {
      x,
      y,
      lat,
      lng,
      name: `BC-0${drawnPoints.length + 1}`
    };

    setDrawnPoints(prev => [...prev, newPoint]);
  };

  const handleAddGeoPoint = (lat: number, lng: number) => {
    const x = Math.round((lng - 3.465) / 0.00003);
    const y = Math.round(500 - (lat - 6.435) / 0.00003);
    setDrawnPoints(prev => [
      ...prev,
      {
        x: Math.max(50, Math.min(650, x)),
        y: Math.max(50, Math.min(450, y)),
        lat,
        lng,
        name: `BC-${String(prev.length + 1).padStart(2, '0')}`
      }
    ]);
  };

  const handleAddManualPoint = (e: React.FormEvent) => {
    e.preventDefault();
    const latNum = parseFloat(manualLat);
    const lngNum = parseFloat(manualLng);
    if (isNaN(latNum) || isNaN(lngNum)) return;

    const x = Math.round((lngNum - 3.465) / 0.00003);
    const y = Math.round(500 - (latNum - 6.435) / 0.00003);

    setDrawnPoints(prev => [
      ...prev,
      {
        x: Math.max(50, Math.min(650, x)),
        y: Math.max(50, Math.min(450, y)),
        lat: latNum,
        lng: lngNum,
        name: manualBeacon || `BC-0${drawnPoints.length + 1}`
      }
    ]);
  };

  const runTopologicalVerification = async () => {
    setIsVerifying(true);
    const startedAt = performance.now();
    try {
      const result = await apiRequest<{
        valid: boolean;
        reason?: 'INVALID_GEOMETRY' | 'OVERLAPPING_PARCEL' | 'INSUFFICIENT_COORDINATES';
        overlappingParcelId?: string;
        diagnosticMessage?: string;
        spatialHash?: string;
        wkt?: string;
      }>('/gis/verify', {
        method: 'POST',
        body: JSON.stringify({
          coordinates: drawnPoints.map(({ lng, lat }) => [lng, lat]),
        }),
      });

      const status = result.valid
        ? 'passed'
        : result.reason === 'OVERLAPPING_PARCEL'
          ? 'overlap_detected'
          : 'invalid_geometry';
      setVerificationResult({
        status,
        overlapAreaSqm: 0,
        encroachingVertices: [],
        sqlQuery: result.spatialHash
          ? `PostGIS validation passed; keccak256 spatial hash: ${result.spatialHash}`
          : `PostGIS rejected the polygon: ${result.reason ?? 'unknown validation error'}`,
        latencyMs: Math.round(performance.now() - startedAt),
        message: result.diagnosticMessage
          ?? (result.valid
            ? 'Geometry is valid and does not overlap a registered parcel.'
            : `Spatial verification failed: ${result.reason ?? 'Unknown reason'}.`),
      });
      setShowOverlaps(status === 'overlap_detected');
    } catch (error) {
      setVerificationResult({
        status: 'error',
        overlapAreaSqm: 0,
        encroachingVertices: [],
        sqlQuery: 'No database result was returned.',
        latencyMs: Math.round(performance.now() - startedAt),
        message: error instanceof Error ? error.message : 'Spatial verification failed.',
      });
      setShowOverlaps(false);
    } finally {
      setIsVerifying(false);
    }
  };

  // Calculate polygon perimeter and area
  const calculateMetrics = () => {
    if (drawnPoints.length < 3) return { areaSqm: 0, hectares: 0, perimeterM: 0 };

    let area = 0;
    let perimeter = 0;
    for (let i = 0; i < drawnPoints.length; i++) {
      const j = (i + 1) % drawnPoints.length;
      area += drawnPoints[i].x * drawnPoints[j].y;
      area -= drawnPoints[j].x * drawnPoints[i].y;

      const dx = drawnPoints[j].x - drawnPoints[i].x;
      const dy = drawnPoints[j].y - drawnPoints[i].y;
      perimeter += Math.sqrt(dx * dx + dy * dy) * 2.8; // scale factor to meters
    }
    const areaSqm = Math.abs(area / 2) * 8.5; // scale factor
    return {
      areaSqm: Math.round(areaSqm),
      hectares: Number((areaSqm / 10000).toFixed(3)),
      perimeterM: Math.round(perimeter)
    };
  };

  const svgMetrics = calculateMetrics();
  const metrics = geodesicMetrics && drawnPoints.length >= 3 ? geodesicMetrics : svgMetrics;

  // Handle lodging survey submission
  const handleSubmitSurvey = (e: React.FormEvent) => {
    e.preventDefault();
    submitSurveyReport('job-101', surveyNotes, drawnPoints.length, surveyPlanNumber);
    setShowSubmitModal(false);
    addNotification({
      title: 'Survey Plan Lodged',
      message: `Survey Plan ${surveyPlanNumber} successfully lodged and topological hash registered!`,
      type: 'success'
    });
  };

  // Convert points to SVG polygon points string
  const polygonPoints = drawnPoints.map(p => `${p.x},${p.y}`).join(' ');

  if (!selectedParcel) {
    return (
      <div className="space-y-4 rounded-lg border border-slate-200 p-6 text-slate-700 dark:border-slate-700 dark:text-slate-300">
        <h1 className="text-lg font-semibold">GIS workspace</h1>
        <p className="text-sm">No parcel records are available to inspect yet.</p>
        <Link to="/portal/register-land" className="inline-flex rounded-md bg-[#3D288C] px-4 py-2 text-sm font-medium text-white">
          Register a parcel
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent text-slate-900 dark:text-slate-100 flex flex-col">
      {/* GIS Control Header */}
      <div className="bg-white dark:bg-[#171A3B] border-b border-slate-200 dark:border-indigo-500/20 px-3 sm:px-4 py-3 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 sm:gap-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <BackButton to="/portal/dashboard" label="Dashboard" />
            <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-[#6338F5]">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">GIS Spatial Cadastre Workspace</h1>
                <span className="hidden sm:inline-block text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                  WGS-84 Zone 31N
                </span>
              </div>
              <div className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400">
                Interactive geodetic boundary drawing, topological overlap detection & beacon management
              </div>
            </div>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-[#0d122e] rounded-xl border border-slate-200 dark:border-slate-700/60 overflow-x-auto max-w-full">
            <button
              onClick={() => setActiveTab('inspect')}
              className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                activeTab === 'inspect' ? 'bg-[#6338F5] text-white shadow' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Inspect Parcels
            </button>
            <button
              onClick={() => setActiveTab('draw')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                activeTab === 'draw' ? 'bg-[#6338F5] text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              Draw Boundary
            </button>
            <button
              onClick={() => setActiveTab('coords')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                activeTab === 'coords' ? 'bg-[#6338F5] text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              Coordinate Entry
            </button>
            <button
              onClick={() => {
                setActiveTab('verify');
                runTopologicalVerification();
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                activeTab === 'verify' ? 'bg-[#6338F5] text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              Spatial Verification
            </button>
            <button
              onClick={() => setActiveTab('compare')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                activeTab === 'compare' ? 'bg-[#6338F5] text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              Compare Overlay
            </button>
          </div>
        </div>
      </div>

      {/* Main Workspace Layout: Canvas on Left, Tool Panel on Right */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: GIS Interactive Map Viewport (2 Cols) */}
        <div className="lg:col-span-2 flex flex-col bg-[#12163b] rounded-2xl border border-indigo-500/25 overflow-hidden shadow-2xl relative min-h-[500px]">
          {/* Map Toolbar Controls */}
          <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2.5 bg-[#0c102b] border-b border-slate-800 text-xs">
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                onClick={() => setMapEngine('google')}
                className={`px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1.5 transition-colors ${
                  mapEngine === 'google' ? 'bg-[#6338F5] text-white' : 'text-slate-400 hover:text-white bg-[#0d122e]'
                }`}
              >
                <Satellite className="w-3.5 h-3.5" />
                <span>Live Satellite Map</span>
              </button>
              <button
                type="button"
                onClick={() => setMapEngine('svg')}
                className={`px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1.5 transition-colors ${
                  mapEngine === 'svg' ? 'bg-[#6338F5] text-white' : 'text-slate-400 hover:text-white bg-[#0d122e]'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>SVG Blueprint</span>
              </button>

              {mapEngine === 'svg' && (
                <>
                  <span className="text-slate-600 px-1">|</span>
                  <button
                    onClick={() => setZoom(prev => Math.min(2, prev + 0.2))}
                    className="p-1.5 rounded hover:bg-slate-700 text-slate-300 hover:text-white"
                    title="Zoom In"
                  >
                    <ZoomIn className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setZoom(prev => Math.max(0.6, prev - 0.2))}
                    className="p-1.5 rounded hover:bg-slate-700 text-slate-300 hover:text-white"
                    title="Zoom Out"
                  >
                    <ZoomOut className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setZoom(1)}
                    className="p-1.5 rounded hover:bg-slate-700 text-slate-300 hover:text-white"
                    title="Reset View"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                  <label className="flex items-center gap-1.5 cursor-pointer text-slate-300 px-1">
                    <input
                      type="checkbox"
                      checked={showZoning}
                      onChange={e => setShowZoning(e.target.checked)}
                      className="rounded accent-[#6338F5]"
                    />
                    <span>Zoning</span>
                  </label>
                </>
              )}

              <label className="flex items-center gap-1.5 cursor-pointer text-slate-300 px-2">
                <input
                  type="checkbox"
                  checked={showBeacons}
                  onChange={e => setShowBeacons(e.target.checked)}
                  className="rounded accent-[#6338F5]"
                />
                <span>Beacons</span>
              </label>
            </div>

            {/* Quick Parcel Focus Selector */}
            <div className="flex items-center gap-1.5 overflow-x-auto max-w-full">
              {parcels.slice(0, 5).map(p => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setSelectedParcelId(p.id)}
                  className={`px-2 py-1 rounded text-[10px] font-mono whitespace-nowrap border transition-colors ${
                    selectedParcel.id === p.id
                      ? 'bg-indigo-500/20 border-indigo-500/50 text-indigo-300 font-bold'
                      : 'bg-[#0d122e] border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {p.state}: {p.titleNumber.split('-').slice(-1)[0]}
                </button>
              ))}
            </div>
          </div>

          {/* Interactive Map Viewport */}
          {mapEngine === 'google' ? (
            <div className="flex-1 w-full p-2 bg-[#070b20]">
              <CadastreGoogleMap
                parcels={parcels}
                selectedParcel={selectedParcel}
                onSelectParcel={p => setSelectedParcelId(p.id)}
                drawnPoints={drawnPoints}
                onAddPoint={handleAddGeoPoint}
                showBeacons={showBeacons}
                showAllParcels={true}
                interactiveDraw={activeTab === 'draw'}
                overlapDetected={verificationResult?.status === 'overlap_detected'}
                heightClass="h-[520px]"
                onGeodesicMetrics={setGeodesicMetrics}
              />
            </div>
          ) : (
            <div className="flex-1 w-full h-full relative overflow-hidden bg-[#070b20] flex items-center justify-center p-4">
            <svg
              ref={svgRef}
              viewBox="0 0 700 500"
              onClick={handleSvgClick}
              className={`w-full h-full max-h-[550px] transition-transform duration-150 select-none ${
                activeTab === 'draw' ? 'cursor-crosshair' : 'cursor-default'
              }`}
              style={{ transform: `scale(${zoom})` }}
            >
              {/* Cadastral Grid Defs */}
              <defs>
                <pattern id="cadastralGrid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(99, 102, 241, 0.08)" strokeWidth="1" />
                </pattern>
                <radialGradient id="highlightGlow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#168BFF" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#168BFF" stopOpacity="0" />
                </radialGradient>
              </defs>

              {/* Grid Background */}
              <rect width="700" height="500" fill="url(#cadastralGrid)" />

              {/* Road / Natural Boundary Layers */}
              <path
                d="M 20 200 Q 250 240 680 180"
                fill="none"
                stroke="#1e2952"
                strokeWidth="14"
                strokeLinecap="round"
              />
              <path
                d="M 20 200 Q 250 240 680 180"
                fill="none"
                stroke="#313d69"
                strokeWidth="2"
                strokeDasharray="6 6"
              />
              <text x="320" y="225" fill="#64748b" fontSize="9" fontFamily="monospace">
                LEKKI-EPE EXPRESSWAY CORRIDOR (60m R-O-W)
              </text>

              {/* Registered Parcel 1 (Chief Emeka Adeleke) */}
              <polygon
                points="240,110 370,120 350,260 220,240"
                fill={selectedParcel.id === 'pcl-001' ? 'rgba(99, 56, 245, 0.35)' : 'rgba(23, 26, 59, 0.6)'}
                stroke={selectedParcel.id === 'pcl-001' ? '#6338F5' : '#394270'}
                strokeWidth={selectedParcel.id === 'pcl-001' ? '3' : '1.5'}
                className="cursor-pointer transition-all hover:fill-indigo-500/40"
                onClick={() => setSelectedParcelId(parcels[0].id)}
              />
              <text x="250" y="180" fill="#cbd5e1" fontSize="10" fontWeight="bold">
                C-OF-O-2026-004912
              </text>
              <text x="250" y="195" fill="#94a3b8" fontSize="8" fontFamily="monospace">
                1,250 m² · VERIFIED
              </text>

              {/* Registered Parcel 2 (Adjacent Plot) */}
              <polygon
                points="390,125 520,135 500,270 375,255"
                fill={selectedParcel.id === 'pcl-002' ? 'rgba(22, 139, 255, 0.35)' : 'rgba(23, 26, 59, 0.6)'}
                stroke={selectedParcel.id === 'pcl-002' ? '#168BFF' : '#394270'}
                strokeWidth={selectedParcel.id === 'pcl-002' ? '3' : '1.5'}
                className="cursor-pointer transition-all hover:fill-blue-500/40"
                onClick={() => setSelectedParcelId(parcels[1].id)}
              />
              <text x="410" y="190" fill="#cbd5e1" fontSize="10" fontWeight="bold">
                PLOT 482 · STATE CADASTRE
              </text>

              {/* Registered Parcel 5 (Revoked Corridor) */}
              <polygon
                points="100,340 280,360 260,460 90,430"
                fill="rgba(225, 29, 72, 0.2)"
                stroke="#e11d48"
                strokeWidth="2"
                strokeDasharray="4 4"
                className="cursor-pointer"
                onClick={() => setSelectedParcelId(parcels[4].id)}
              />
              <text x="110" y="400" fill="#fb7185" fontSize="9" fontWeight="bold">
                REVOKED: REV-ORD-2026-00041
              </text>

              {/* User Drawn Polygon (Boundary Drawing Mode) */}
              {drawnPoints.length > 1 && (
                <>
                  <polygon
                    points={polygonPoints}
                    fill={
                      verificationResult?.status === 'overlap_detected'
                        ? 'rgba(225, 29, 72, 0.35)'
                        : 'rgba(19, 201, 138, 0.25)'
                    }
                    stroke={
                      verificationResult?.status === 'overlap_detected' ? '#e11d48' : '#13C98A'
                    }
                    strokeWidth="2.5"
                    strokeDasharray={activeTab === 'draw' ? '5 5' : 'none'}
                  />

                  {/* Draw Beacons */}
                  {showBeacons &&
                    drawnPoints.map((p, idx) => (
                      <g key={idx}>
                        <circle
                          cx={p.x}
                          cy={p.y}
                          r="5"
                          fill="#F0B429"
                          stroke="#080D24"
                          strokeWidth="2"
                        />
                        <text
                          x={p.x + 8}
                          y={p.y - 4}
                          fill="#F0B429"
                          fontSize="9"
                          fontFamily="monospace"
                          fontWeight="bold"
                        >
                          {p.name}
                        </text>
                      </g>
                    ))}
                </>
              )}

              {/* Overlap Highlight Warning if detected */}
              {showOverlaps && (
                <rect
                  x="330"
                  y="120"
                  width="40"
                  height="120"
                  fill="rgba(239, 68, 68, 0.5)"
                  stroke="#ef4444"
                  strokeWidth="2"
                  strokeDasharray="3 3"
                />
              )}
            </svg>
          </div>
          )}

          {/* Bottom Coordinates & Scale Status Bar */}
          <div className="bg-[#0c102b] border-t border-slate-800 px-4 py-2 flex flex-wrap items-center justify-between text-[11px] font-mono text-slate-400">
            <div className="flex items-center gap-4">
              <span>Projection: EPSG:4326 (WGS 84)</span>
              <span>District: {selectedParcel.district}, {selectedParcel.state}</span>
            </div>
            <div className="flex items-center gap-3">
              <span>{mapEngine === 'google' ? 'Engine: Google Maps Geodetic' : `Zoom: ${Math.round(zoom * 100)}%`}</span>
              <span className="text-emerald-400">● Spatial Engine Nominal</span>
            </div>
          </div>
        </div>

        {/* Right: GIS Contextual Tool Panel */}
        <div className="flex flex-col bg-[#171A3B] rounded-2xl border border-indigo-500/25 p-5 space-y-5 shadow-2xl">
          {/* TAB 1: INSPECT PARCEL */}
          {activeTab === 'inspect' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-700/60">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[#168BFF]" />
                  Selected Cadastral Parcel
                </h3>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300">
                  {selectedParcel.status}
                </span>
              </div>

              <div className="space-y-2 text-xs">
                <div>
                  <span className="text-slate-400 block text-[11px]">Title Number</span>
                  <span className="text-white font-mono font-bold">{selectedParcel.titleNumber}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Registered Owner</span>
                  <span className="text-slate-200 font-medium">{selectedParcel.ownerName}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">National Identity (NIN)</span>
                  <span className="text-indigo-300 font-mono">{selectedParcel.ownerNationalId}</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Cadastral Area</span>
                    <span className="text-white font-bold">{selectedParcel.sizeSqm.toLocaleString()} m²</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Hectares</span>
                    <span className="text-white font-bold">{selectedParcel.sizeHectares} Ha</span>
                  </div>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Survey Plan Ref</span>
                  <span className="text-amber-400 font-mono">{selectedParcel.surveyPlanNumber}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Surveyor In Charge</span>
                  <span className="text-slate-300">{selectedParcel.surveyorName}</span>
                </div>
              </div>

              {selectedParcel.certificateIssued && (
                <button
                  onClick={() => setSelectedCertificateParcel(selectedParcel)}
                  className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-colors shadow-md"
                >
                  <FileCheck className="w-4 h-4" />
                  <span>View C of O Certificate</span>
                </button>
              )}
            </div>
          )}

          {/* TAB 2: DRAW BOUNDARY */}
          {activeTab === 'draw' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-700/60">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Compass className="w-4 h-4 text-[#13C98A]" />
                  Boundary Drawing Mode
                </h3>
                <button
                  onClick={() => setDrawnPoints([])}
                  className="text-[11px] text-rose-400 hover:underline flex items-center gap-1"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Clear</span>
                </button>
              </div>

              <p className="text-xs text-slate-300">
                Click anywhere on the map viewport to place geodetic boundary vertices. Real-time perimeter and enclosed area are calculated automatically.
              </p>

              <div className="p-3 bg-[#0d122e] rounded-xl border border-slate-800 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Total Boundary Vertices:</span>
                  <span className="font-mono font-bold text-white">{drawnPoints.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Calculated Area:</span>
                  <span className="font-mono font-bold text-emerald-400">{metrics.areaSqm.toLocaleString()} m²</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Hectares:</span>
                  <span className="font-mono font-bold text-emerald-400">{metrics.hectares} Ha</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Estimated Perimeter:</span>
                  <span className="font-mono text-slate-300">{metrics.perimeterM} meters</span>
                </div>
              </div>

              <div className="space-y-2">
                <button
                  onClick={() => {
                    setActiveTab('verify');
                    runTopologicalVerification();
                  }}
                  className="w-full py-2.5 rounded-xl bg-[#6338F5] hover:bg-[#5229db] text-white font-bold text-xs uppercase tracking-wider transition-colors shadow-md flex items-center justify-center gap-2"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Run Spatial Verification</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: COORDINATE ENTRY */}
          {activeTab === 'coords' && (
            <div className="space-y-4">
              <div className="pb-2 border-b border-slate-700/60">
                <h3 className="text-sm font-bold text-white">Manual Coordinate Plotter</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Enter official surveyor GPS field log coordinates (Latitude/Longitude in WGS-84 decimal degrees).
                </p>
              </div>

              <form onSubmit={handleAddManualPoint} className="space-y-3 text-xs">
                <div>
                  <label className="text-slate-400 block mb-1">Beacon Pillar Reference</label>
                  <input
                    type="text"
                    value={manualBeacon}
                    onChange={e => setManualBeacon(e.target.value)}
                    placeholder="e.g. SC/ET/095"
                    className="w-full bg-[#0d122e] border border-slate-700 rounded-lg px-3 py-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Latitude (°N)</label>
                  <input
                    type="text"
                    value={manualLat}
                    onChange={e => setManualLat(e.target.value)}
                    className="w-full bg-[#0d122e] border border-slate-700 rounded-lg px-3 py-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Longitude (°E)</label>
                  <input
                    type="text"
                    value={manualLng}
                    onChange={e => setManualLng(e.target.value)}
                    className="w-full bg-[#0d122e] border border-slate-700 rounded-lg px-3 py-2 text-white font-mono"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-[#168BFF] hover:bg-[#0077ee] text-white font-bold text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Beacon to Polygon</span>
                </button>
              </form>
            </div>
          )}

          {/* TAB 4: SPATIAL VERIFICATION */}
          {activeTab === 'verify' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-700/60">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#13C98A]" />
                  PostGIS Spatial Verification Engine
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  EPSG:4326 · 0.5m Buffer
                </span>
              </div>

              <p className="text-[11px] text-slate-400">
                Submits the polygon to the authenticated PostGIS service; outcomes are not simulated.
              </p>

              {isVerifying ? (
                <div className="py-8 text-center space-y-3">
                  <RefreshCw className="w-8 h-8 text-indigo-400 animate-spin mx-auto" />
                  <p className="text-xs text-slate-300">
                    Executing PostGIS geometry and overlap validation…
                  </p>
                </div>
              ) : verificationResult ? (
                <div className="space-y-3">
                  <div
                    className={`p-4 rounded-xl border text-xs space-y-2 ${
                      verificationResult.status === 'overlap_detected'
                        ? 'bg-rose-950/30 border-rose-500/40 text-rose-200'
                        : verificationResult.status === 'invalid_geometry' || verificationResult.status === 'error'
                        ? 'bg-amber-950/30 border-amber-500/40 text-amber-200'
                        : 'bg-emerald-950/30 border-emerald-500/40 text-emerald-200'
                    }`}
                  >
                    <div className="flex items-center justify-between font-bold">
                      <div className="flex items-center gap-2">
                        {verificationResult.status === 'overlap_detected' ? (
                          <>
                            <AlertTriangle className="w-4 h-4 text-rose-400" />
                            <span>OUTCOME 3: OVERLAPPING PARCEL DETECTED</span>
                          </>
                        ) : verificationResult.status === 'invalid_geometry' || verificationResult.status === 'error' ? (
                          <>
                            <AlertTriangle className="w-4 h-4 text-amber-400" />
                            <span>
                              {verificationResult.status === 'error'
                                ? 'VERIFICATION SERVICE UNAVAILABLE'
                                : 'INVALID GEOMETRY (ST_IsValid=FALSE)'}
                            </span>
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                            <span>OUTCOME 1: VALID & NON-OVERLAPPING</span>
                          </>
                        )}
                      </div>
                      <span className="text-[10px] font-mono text-slate-300">
                        t_gis: {verificationResult.latencyMs}ms
                      </span>
                    </div>

                    <p className="leading-relaxed">{verificationResult.message}</p>

                    {verificationResult.overlapAreaSqm > 0 && (
                      <div className="font-mono text-[11px] text-rose-300 flex items-center justify-between pt-1 border-t border-rose-500/20">
                        <span>Encroachment Area: {verificationResult.overlapAreaSqm} m²</span>
                        <span>Vertices: {verificationResult.encroachingVertices.join(', ')}</span>
                      </div>
                    )}

                    {/* PostGIS SQL Query Preview */}
                    <div className="pt-2 border-t border-slate-700/60">
                      <div className="text-[10px] text-slate-400 uppercase font-mono mb-0.5">PostGIS Execution:</div>
                      <div className="p-2 rounded bg-[#0a0d20] font-mono text-[10px] text-indigo-300 break-all leading-tight">
                        {verificationResult.sqlQuery}
                      </div>
                    </div>
                  </div>

                  {/* Submission Action */}
                  {verificationResult.status === 'passed' && (
                    <button
                      onClick={() => setShowSubmitModal(true)}
                      className="w-full py-2.5 rounded-xl bg-[#6338F5] hover:bg-[#5229db] text-white font-bold text-xs uppercase tracking-wider transition-colors shadow-md flex items-center justify-center gap-2"
                    >
                      <FileCheck className="w-4 h-4" />
                      <span>Lodge Cadastral Survey Plan</span>
                    </button>
                  )}
                </div>
              ) : (
                <div className="py-4 text-center text-xs text-slate-400">
                  Select a scenario above or click 'Run Spatial Verification' to execute automated topological checking.
                </div>
              )}
            </div>
          )}

          {/* TAB 5: COMPARE OVERLAY */}
          {activeTab === 'compare' && (
            <div className="space-y-4">
              <div className="pb-2 border-b border-slate-700/60">
                <h3 className="text-sm font-bold text-white">Cadastral Plan Comparison</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Side-by-side comparison of historical title coordinates vs newly surveyed beacons.
                </p>
              </div>

              <div className="space-y-3 text-xs">
                <div className="p-3 rounded-xl bg-[#0d122e] border border-slate-800">
                  <div className="font-semibold text-slate-200 mb-1">Historical Gazetted Plan</div>
                  <div className="text-[11px] text-slate-400 font-mono">LA/SRV/2026/0149 (1,250 m²)</div>
                  <div className="text-[10px] text-indigo-400 mt-1">4 Beacons Confirmed (1978 Survey Act)</div>
                </div>

                <div className="p-3 rounded-xl bg-[#0d122e] border border-emerald-500/30">
                  <div className="font-semibold text-emerald-300 mb-1">Proposed Field Re-establishment</div>
                  <div className="text-[11px] text-slate-400 font-mono">GPS-RTK Traverse (1,248.8 m²)</div>
                  <div className="text-[10px] text-emerald-400 mt-1">Variance: -1.2 m² (Well within allowable ±0.5% tolerance)</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Survey Submission Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-[#171A3B] border border-indigo-500/30 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-700">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-[#6338F5]" />
                Lodge Cadastral Survey Plan
              </h3>
              <button
                onClick={() => setShowSubmitModal(false)}
                className="text-slate-400 hover:text-white text-xs"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitSurvey} className="space-y-4 text-xs">
              <div>
                <label className="text-slate-300 block mb-1">Cadastral Plan Reference Number</label>
                <input
                  type="text"
                  value={surveyPlanNumber}
                  onChange={e => setSurveyPlanNumber(e.target.value)}
                  className="w-full bg-[#0d122e] border border-slate-700 rounded-lg px-3 py-2 text-white font-mono"
                  required
                />
              </div>

              <div>
                <label className="text-slate-300 block mb-1">Field Reconnaissance & Pillar Notes</label>
                <textarea
                  value={surveyNotes}
                  onChange={e => setSurveyNotes(e.target.value)}
                  rows={3}
                  className="w-full bg-[#0d122e] border border-slate-700 rounded-lg px-3 py-2 text-white"
                  required
                />
              </div>

              <div className="p-3 bg-[#0d122e] rounded-xl border border-slate-800 text-[11px] space-y-1 font-mono text-slate-300">
                <div>Beacons to Register: {drawnPoints.length} Concrete Pillars</div>
                <div>Calculated Area: {metrics.areaSqm.toLocaleString()} m² ({metrics.hectares} Ha)</div>
                <div>Signing Surveyor: Surv. Amina Bello, FNIS</div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowSubmitModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-[#6338F5] text-white font-bold hover:bg-[#5229db]"
                >
                  Confirm & Commit Survey Plan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
