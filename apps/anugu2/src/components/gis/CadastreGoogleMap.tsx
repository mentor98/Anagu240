import React, { useEffect, useMemo, useState, useCallback } from 'react';
import {
  Map as GoogleMap,
  AdvancedMarker,
  InfoWindow,
  Pin,
  Polygon,
  useAdvancedMarkerRef,
  useApiLoadingStatus,
  APILoadingStatus,
  useMap,
  useMapsLibrary,
  MapMouseEvent
} from '@vis.gl/react-google-maps';
import { Parcel } from '../../types';
import { Layers, Satellite, Map as MapIcon, Compass, AlertTriangle } from 'lucide-react';

export interface DrawnGeoPoint {
  lat: number;
  lng: number;
  name: string;
}

export const getGoogleMapsApiKey = (): string => {
  const viteKey = (import.meta.env?.VITE_GOOGLE_MAPS_API_KEY as string | undefined) || '';
  const defineKey = (typeof process !== 'undefined' ? (process.env?.GOOGLE_MAPS_API_KEY as string | undefined) : '') || '';
  return (viteKey || defineKey).trim();
};

interface CadastreGoogleMapProps {
  parcels: Parcel[];
  selectedParcel: Parcel;
  onSelectParcel?: (parcel: Parcel) => void;
  drawnPoints?: DrawnGeoPoint[];
  onAddPoint?: (lat: number, lng: number) => void;
  showBeacons?: boolean;
  showAllParcels?: boolean;
  interactiveDraw?: boolean;
  overlapDetected?: boolean;
  heightClass?: string;
  compact?: boolean;
  onGeodesicMetrics?: (metrics: { areaSqm: number; hectares: number; perimeterM: number }) => void;
}

const getStatusColors = (status: Parcel['status'], isSelected: boolean) => {
  switch (status) {
    case 'revoked':
      return {
        stroke: '#B8324F',
        fill: '#B8324F',
        pinBg: '#8C1F3A',
        pinBorder: '#E11D48',
        label: 'STATE LAND (REVOKED)'
      };
    case 'disputed':
      return {
        stroke: '#C28B20',
        fill: '#C28B20',
        pinBg: '#966E19',
        pinBorder: '#D97706',
        label: 'DISPUTED'
      };
    case 'verified':
      return {
        stroke: isSelected ? '#1E9B6E' : '#157554',
        fill: '#157554',
        pinBg: '#136E4E',
        pinBorder: '#13C98A',
        label: 'VERIFIED C OF O'
      };
    default:
      return {
        stroke: isSelected ? '#5B45C4' : '#3D288C',
        fill: '#3D288C',
        pinBg: '#3D288C',
        pinBorder: '#6338F5',
        label: status.replace(/_/g, ' ').toUpperCase()
      };
  }
};

const getParcelCentroid = (parcel: Parcel): google.maps.LatLngLiteral => {
  if (!parcel.coordinates.length) return { lat: 6.4383, lng: 3.4721 };
  const sum = parcel.coordinates.reduce(
    (acc, c) => ({ lat: acc.lat + c.lat, lng: acc.lng + c.lng }),
    { lat: 0, lng: 0 }
  );
  return {
    lat: sum.lat / parcel.coordinates.length,
    lng: sum.lng / parcel.coordinates.length
  };
};

// Camera auto-fit controller using useMap()
const ParcelCameraController: React.FC<{
  selectedParcel: Parcel;
  mapTypeId: string;
}> = ({ selectedParcel, mapTypeId }) => {
  const map = useMap();

  useEffect(() => {
    if (!map || !selectedParcel?.coordinates?.length) return;
    if (typeof google === 'undefined' || !google.maps) return;

    const bounds = new google.maps.LatLngBounds();
    selectedParcel.coordinates.forEach(c => bounds.extend({ lat: c.lat, lng: c.lng }));
    map.fitBounds(bounds, { top: 48, right: 48, bottom: 48, left: 48 });

    const listener = google.maps.event.addListenerOnce(map, 'idle', () => {
      const z = map.getZoom();
      if (z && z > 18) map.setZoom(18);
    });
    return () => {
      google.maps.event.removeListener(listener);
    };
  }, [map, selectedParcel.id]);

  useEffect(() => {
    if (!map) return;
    map.setMapTypeId(mapTypeId);
  }, [map, mapTypeId]);

  return null;
};

// Geodesic Area & Perimeter Calculator using Maps Geometry Library
const GeodesicMetricsCalculator: React.FC<{
  drawnPoints?: DrawnGeoPoint[];
  onGeodesicMetrics?: (metrics: { areaSqm: number; hectares: number; perimeterM: number }) => void;
}> = ({ drawnPoints, onGeodesicMetrics }) => {
  const geometryLib = useMapsLibrary('geometry');

  useEffect(() => {
    if (!drawnPoints || drawnPoints.length < 3 || !onGeodesicMetrics) return;
    if (!geometryLib?.spherical || typeof google === 'undefined') return;

    const path = drawnPoints.map(p => new google.maps.LatLng(p.lat, p.lng));
    const areaSqm = Math.round(geometryLib.spherical.computeArea(path));
    const closedPath = [...path, path[0]];
    const perimeterM = Math.round(geometryLib.spherical.computeLength(closedPath));

    onGeodesicMetrics({
      areaSqm,
      hectares: Number((areaSqm / 10000).toFixed(4)),
      perimeterM
    });
  }, [drawnPoints, geometryLib, onGeodesicMetrics]);

  return null;
};

// Individual Parcel Marker with Anchored InfoWindow
const ParcelCentroidMarker: React.FC<{
  parcel: Parcel;
  isSelected: boolean;
  showInfo: boolean;
  onSelect: () => void;
  onCloseInfo: () => void;
}> = ({ parcel, isSelected, showInfo, onSelect, onCloseInfo }) => {
  const [markerRef, marker] = useAdvancedMarkerRef();
  const centroid = useMemo(() => getParcelCentroid(parcel), [parcel]);
  const colors = getStatusColors(parcel.status, isSelected);

  return (
    <>
      <AdvancedMarker
        ref={markerRef}
        position={centroid}
        title={`${parcel.titleNumber} — ${parcel.district}`}
        zIndex={isSelected ? 50 : 10}
        onClick={onSelect}
      >
        <Pin
          background={colors.pinBg}
          borderColor={colors.pinBorder}
          glyphColor="#E2E8F0"
          glyphText={parcel.status === 'revoked' ? '!' : parcel.status === 'verified' ? '✓' : '•'}
          scale={isSelected ? 1.1 : 0.9}
        />
      </AdvancedMarker>

      {showInfo && marker && (
        <InfoWindow anchor={marker} onCloseClick={onCloseInfo}>
          <div className="p-1.5 min-w-[200px] text-slate-900 text-xs space-y-1">
            <div className="font-mono font-bold text-slate-900">{parcel.titleNumber}</div>
            <div className="text-[11px] font-semibold text-indigo-700">{colors.label}</div>
            <div className="text-[11px] text-slate-700">{parcel.ownerName}</div>
            <div className="text-[11px] text-slate-600">
              {parcel.district}, {parcel.lga}, {parcel.state}
            </div>
            <div className="text-[11px] font-mono text-slate-800 pt-0.5 border-t border-slate-200">
              {parcel.sizeSqm.toLocaleString()} m² ({parcel.sizeHectares} Ha)
            </div>
          </div>
        </InfoWindow>
      )}
    </>
  );
};

// Real-world WGS-84 normalized SVG fallback (used when no API key or loading fails)
const CoordinateSchematicFallback: React.FC<{
  parcel: Parcel;
  drawnPoints?: DrawnGeoPoint[];
  reason?: string;
}> = ({ parcel, drawnPoints, reason }) => {
  const coords = parcel.coordinates.length ? parcel.coordinates : [];
  const allPts = [
    ...coords.map(c => ({ lat: c.lat, lng: c.lng, label: c.beaconNumber })),
    ...(drawnPoints || []).map(p => ({ lat: p.lat, lng: p.lng, label: p.name }))
  ];

  const lats = allPts.map(p => p.lat);
  const lngs = allPts.map(p => p.lng);
  const minLat = Math.min(...lats, 6.43);
  const maxLat = Math.max(...lats, 6.44);
  const minLng = Math.min(...lngs, 3.47);
  const maxLng = Math.max(...lngs, 3.48);
  const latSpan = Math.max(maxLat - minLat, 0.0005);
  const lngSpan = Math.max(maxLng - minLng, 0.0005);

  const toSvg = (lat: number, lng: number) => ({
    x: 40 + ((lng - minLng) / lngSpan) * 240,
    y: 165 - ((lat - minLat) / latSpan) * 130
  });

  const parcelPts = coords.map(c => toSvg(c.lat, c.lng));
  const polyStr = parcelPts.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');

  return (
    <div className="w-full h-full bg-[#070B1A] flex flex-col items-center justify-between p-3 relative overflow-hidden">
      <div className="w-full flex items-center justify-between text-[10px] font-mono text-slate-400">
        <span>WGS-84 Coordinate Plot · {parcel.district}</span>
        {reason && <span className="text-amber-400 flex items-center gap-1"><AlertTriangle className="w-3 h-3" />{reason}</span>}
      </div>
      <svg viewBox="0 0 320 200" className="w-full flex-1">
        <defs>
          <pattern id="fallbackGrid" width="24" height="24" patternUnits="userSpaceOnUse">
            <path d="M 24 0 L 0 0 0 24" fill="none" stroke="rgba(99, 102, 241, 0.08)" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="320" height="200" fill="url(#fallbackGrid)" />
        {parcelPts.length > 2 && (
          <polygon
            points={polyStr}
            fill={parcel.status === 'revoked' ? 'rgba(184, 50, 79, 0.25)' : 'rgba(61, 40, 140, 0.28)'}
            stroke={parcel.status === 'revoked' ? '#B8324F' : '#6B57B5'}
            strokeWidth="2"
          />
        )}
        {parcelPts.map((pt, idx) => (
          <g key={idx}>
            <circle cx={pt.x} cy={pt.y} r="4" fill="#AD842B" stroke="#050814" strokeWidth="1.5" />
            <text x={pt.x + 6} y={pt.y - 4} fill="#909EB5" fontSize="8" fontFamily="monospace">
              {coords[idx]?.beaconNumber}
            </text>
          </g>
        ))}
      </svg>
      <div className="w-full flex justify-between text-[10px] font-mono text-slate-500">
        <span>{parcel.titleNumber}</span>
        <span>{parcel.sizeSqm.toLocaleString()} m²</span>
      </div>
    </div>
  );
};

export const CadastreGoogleMap: React.FC<CadastreGoogleMapProps> = ({
  parcels,
  selectedParcel,
  onSelectParcel,
  drawnPoints,
  onAddPoint,
  showBeacons = true,
  showAllParcels = true,
  interactiveDraw = false,
  overlapDetected = false,
  heightClass = 'h-[500px]',
  compact = false,
  onGeodesicMetrics
}) => {
  const apiKey = getGoogleMapsApiKey();
  const loadingStatus = useApiLoadingStatus();
  const [mapTypeId, setMapTypeId] = useState<'hybrid' | 'satellite' | 'roadmap' | 'terrain'>('hybrid');
  const [infoParcelId, setInfoParcelId] = useState<string | null>(null);

  const initialCenter = useMemo(() => getParcelCentroid(selectedParcel), [selectedParcel]);
  const visibleParcels = showAllParcels ? parcels : [selectedParcel];

  const handleMapClick = useCallback(
    (ev: MapMouseEvent) => {
      if (!interactiveDraw || !onAddPoint || !ev.detail.latLng) return;
      onAddPoint(
        Number(ev.detail.latLng.lat.toFixed(6)),
        Number(ev.detail.latLng.lng.toFixed(6))
      );
    },
    [interactiveDraw, onAddPoint]
  );

  if (!apiKey || import.meta.env.VITE_MAP_PROVIDER !== 'google') {
    const latitude = initialCenter.lat;
    const longitude = initialCenter.lng;
    const bbox = [
      longitude - 0.02,
      latitude - 0.02,
      longitude + 0.02,
      latitude + 0.02,
    ].join(',');
    return (
      <div className={`relative w-full ${heightClass} overflow-hidden rounded-xl border border-slate-800`}>
        <iframe
          title={`OpenStreetMap location for ${selectedParcel.titleNumber}`}
          src={`https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${latitude},${longitude}`}
          className="h-full w-full border-0"
          loading="lazy"
          referrerPolicy="no-referrer"
        />
        <div className="absolute bottom-2 left-2 rounded bg-white/90 px-2 py-1 text-[10px] text-slate-700">
          Map data © <a className="underline" href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a>
          {interactiveDraw && ' · Enter surveyed coordinates manually; map clicks are unavailable in the embedded map.'}
        </div>
      </div>
    );
  }

  if (loadingStatus === APILoadingStatus.FAILED || loadingStatus === APILoadingStatus.AUTH_FAILURE) {
    return (
      <div className={`w-full ${heightClass} rounded-xl overflow-hidden border border-slate-800`}>
        <CoordinateSchematicFallback
          parcel={selectedParcel}
          drawnPoints={drawnPoints}
          reason="Maps API unavailable — WGS-84 vector view active"
        />
      </div>
    );
  }

  return (
    <div className={`w-full ${heightClass} relative rounded-xl overflow-hidden border border-slate-800 bg-[#070B1A]`}>
      {/* Layer Switcher Overlay */}
      <div className="absolute top-3 right-3 z-20 flex items-center gap-1 bg-[#080B1A]/90 backdrop-blur-md p-1 rounded-lg border border-slate-700/60 text-[11px] font-medium">
        <button
          type="button"
          onClick={() => setMapTypeId('hybrid')}
          className={`px-2 py-1 rounded flex items-center gap-1 transition-colors ${
            mapTypeId === 'hybrid' ? 'bg-[#3D288C] text-slate-100' : 'text-slate-400 hover:text-slate-200'
          }`}
          title="Satellite with streets & district labels"
        >
          <Satellite className="w-3 h-3" />
          {!compact && <span>Hybrid</span>}
        </button>
        <button
          type="button"
          onClick={() => setMapTypeId('roadmap')}
          className={`px-2 py-1 rounded flex items-center gap-1 transition-colors ${
            mapTypeId === 'roadmap' ? 'bg-[#3D288C] text-slate-100' : 'text-slate-400 hover:text-slate-200'
          }`}
          title="Street & Cadastre Roadmap"
        >
          <MapIcon className="w-3 h-3" />
          {!compact && <span>Streets</span>}
        </button>
        <button
          type="button"
          onClick={() => setMapTypeId('terrain')}
          className={`px-2 py-1 rounded flex items-center gap-1 transition-colors ${
            mapTypeId === 'terrain' ? 'bg-[#3D288C] text-slate-100' : 'text-slate-400 hover:text-slate-200'
          }`}
          title="Topographic Terrain"
        >
          <Layers className="w-3 h-3" />
          {!compact && <span>Terrain</span>}
        </button>
      </div>

      {interactiveDraw && (
        <div className="absolute bottom-3 left-3 z-20 px-2.5 py-1.5 rounded-lg bg-[#080B1A]/90 border border-emerald-500/30 text-[11px] font-mono text-emerald-400 flex items-center gap-1.5 pointer-events-none">
          <Compass className="w-3.5 h-3.5" />
          <span>Click anywhere on satellite map to drop WGS-84 beacon pillar</span>
        </div>
      )}

      <GoogleMap
        mapId="DEMO_MAP_ID"
        defaultCenter={initialCenter}
        defaultZoom={17}
        mapTypeId={mapTypeId}
        gestureHandling="greedy"
        disableDefaultUI={compact}
        streetViewControl={!compact}
        mapTypeControl={false}
        fullscreenControl={!compact}
        zoomControl={true}
        onClick={handleMapClick}
        internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
        style={{ width: '100%', height: '100%' }}
      >
        <ParcelCameraController selectedParcel={selectedParcel} mapTypeId={mapTypeId} />
        <GeodesicMetricsCalculator drawnPoints={drawnPoints} onGeodesicMetrics={onGeodesicMetrics} />

        {/* Render Cadastral Parcel Polygons & Centroid Markers */}
        {visibleParcels.map(parcel => {
          const isSelected = parcel.id === selectedParcel.id;
          const colors = getStatusColors(parcel.status, isSelected);
          const path = parcel.coordinates.map(c => ({ lat: c.lat, lng: c.lng }));

          return (
            <React.Fragment key={parcel.id}>
              {path.length >= 3 && (
                <Polygon
                  paths={path}
                  strokeColor={colors.stroke}
                  strokeOpacity={isSelected ? 0.95 : 0.7}
                  strokeWeight={isSelected ? 3 : 2}
                  fillColor={colors.fill}
                  fillOpacity={isSelected ? 0.28 : 0.16}
                  clickable={!interactiveDraw}
                  onClick={() => {
                    onSelectParcel?.(parcel);
                    setInfoParcelId(parcel.id);
                  }}
                />
              )}

              <ParcelCentroidMarker
                parcel={parcel}
                isSelected={isSelected}
                showInfo={infoParcelId === parcel.id}
                onSelect={() => {
                  onSelectParcel?.(parcel);
                  setInfoParcelId(prev => (prev === parcel.id ? null : parcel.id));
                }}
                onCloseInfo={() => setInfoParcelId(null)}
              />

              {/* Render Selected Parcel Concrete Beacon Corner Pins */}
              {showBeacons &&
                isSelected &&
                parcel.coordinates.map(coord => (
                  <AdvancedMarker
                    key={coord.id}
                    position={{ lat: coord.lat, lng: coord.lng }}
                    title={`${coord.beaconNumber} (${coord.lat.toFixed(6)}, ${coord.lng.toFixed(6)})`}
                    zIndex={40}
                  >
                    <div className="px-1.5 py-0.5 rounded bg-[#080B1A]/90 border border-amber-500/60 text-[9px] font-mono font-bold text-amber-300 whitespace-nowrap">
                      ● {coord.beaconNumber}
                    </div>
                  </AdvancedMarker>
                ))}
            </React.Fragment>
          );
        })}

        {/* Render Active Survey Draft Polygon & Drawn Beacons */}
        {drawnPoints && drawnPoints.length >= 2 && (
          <Polygon
            paths={drawnPoints.map(p => ({ lat: p.lat, lng: p.lng }))}
            strokeColor={overlapDetected ? '#B8324F' : '#1E9B6E'}
            strokeOpacity={0.95}
            strokeWeight={2.5}
            fillColor={overlapDetected ? '#B8324F' : '#1E9B6E'}
            fillOpacity={0.22}
          />
        )}

        {showBeacons &&
          drawnPoints?.map((pt, idx) => (
            <AdvancedMarker
              key={`drawn-${idx}`}
              position={{ lat: pt.lat, lng: pt.lng }}
              title={`${pt.name}: ${pt.lat.toFixed(6)}, ${pt.lng.toFixed(6)}`}
              zIndex={60}
            >
              <div className="px-1.5 py-0.5 rounded-full bg-amber-600/90 border border-slate-900 text-[9px] font-mono font-bold text-slate-950 whitespace-nowrap">
                {pt.name}
              </div>
            </AdvancedMarker>
          ))}
      </GoogleMap>
    </div>
  );
};
