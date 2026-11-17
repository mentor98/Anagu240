/**
 * LeafletMap — OpenStreetMap-based cadastral map using Leaflet.
 * Replaces Google Maps — works without any API key.
 * 
 * Features:
 * - OpenStreetMap tile layer (free, no key needed)
 * - Polygon drawing for parcel boundary definition
 * - Parcel markers with popup info
 * - GPS location tracking
 * - Responsive, works on mobile
 */
import React, { useEffect, useRef, useState } from 'react';
import { MapPin, Navigation, Trash2, CheckCircle2, AlertTriangle } from 'lucide-react';

export interface LatLng { lat: number; lng: number; }

export interface LeafletMapProps {
  /** Initial center — defaults to Lagos Island, Nigeria */
  center?:         LatLng;
  zoom?:           number;
  /** Existing parcels to display */
  parcels?:        { id: string; title: string; coords: LatLng[]; color?: string }[];
  /** Enable polygon drawing mode */
  drawMode?:       boolean;
  /** Called when a polygon is complete (3+ points) */
  onPolygonChange?: (coords: LatLng[]) => void;
  /** Height class */
  height?:         string;
  readOnly?:       boolean;
}

// Default to Lagos Island, Nigeria
const DEFAULT_CENTER: LatLng = { lat: 6.4541, lng: 3.3947 };
const DEFAULT_ZOOM   = 15;

export const LeafletMap: React.FC<LeafletMapProps> = ({
  center       = DEFAULT_CENTER,
  zoom         = DEFAULT_ZOOM,
  parcels      = [],
  drawMode     = false,
  onPolygonChange,
  height       = 'h-96',
  readOnly     = false,
}) => {
  const mapRef      = useRef<HTMLDivElement>(null);
  const leafletRef  = useRef<any>(null);
  const polyRef     = useRef<any>(null);
  const markersRef  = useRef<any[]>([]);
  const [points,    setPoints]   = useState<LatLng[]>([]);
  const [tracking,  setTracking] = useState(false);
  const [gpsError,  setGpsError] = useState<string | null>(null);

  // Dynamically load Leaflet (SSR-safe)
  useEffect(() => {
    if (!mapRef.current) return;
    let map: any;

    const initLeaflet = async () => {
      const L = (await import('leaflet')).default;
      
      // Fix default marker icons for bundlers
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });

      // Create map
      map = L.map(mapRef.current!, { center: [center.lat, center.lng], zoom });
      leafletRef.current = map;

      // OpenStreetMap tile layer — no API key needed
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

      // Add existing parcels
      parcels.forEach(parcel => {
        const color = parcel.color ?? '#6338F5';
        const polygon = L.polygon(
          parcel.coords.map(c => [c.lat, c.lng] as [number, number]),
          { color, fillColor: color, fillOpacity: 0.15, weight: 2 }
        ).addTo(map);
        polygon.bindPopup(`
          <div style="font-family: monospace; font-size: 12px; min-width: 160px;">
            <b style="color: #6338F5">${parcel.title}</b><br/>
            <span style="color: #666">ID: ${parcel.id.slice(0, 8)}…</span>
          </div>
        `);
      });

      // Draw mode — click to add polygon vertices
      if (drawMode && !readOnly) {
        const drawnPoints: LatLng[] = [];
        const drawnMarkers: any[]   = [];

        const updatePolygon = () => {
          if (polyRef.current) { map.removeLayer(polyRef.current); polyRef.current = null; }
          if (drawnPoints.length >= 3) {
            polyRef.current = L.polygon(
              drawnPoints.map(p => [p.lat, p.lng] as [number, number]),
              { color: '#6338F5', fillColor: '#6338F5', fillOpacity: 0.2, weight: 2.5, dashArray: '6 4' }
            ).addTo(map);
          }
        };

        map.on('click', (e: any) => {
          const pt = { lat: e.latlng.lat, lng: e.latlng.lng };
          drawnPoints.push(pt);

          // Add beacon marker
          const markerIcon = L.divIcon({
            html: `<div style="width:12px;height:12px;background:#F0B429;border:2px solid #080D24;border-radius:50%;box-shadow:0 0 8px rgba(240,180,41,0.6)"></div>`,
            iconSize: [12, 12],
            iconAnchor: [6, 6],
            className: '',
          });
          const marker = L.marker([pt.lat, pt.lng], { icon: markerIcon })
            .addTo(map)
            .bindTooltip(`BC-0${drawnPoints.length} (${pt.lat.toFixed(5)}°N, ${pt.lng.toFixed(5)}°E)`);
          drawnMarkers.push(marker);

          setPoints([...drawnPoints]);
          updatePolygon();
          onPolygonChange?.([...drawnPoints]);
        });

        // Store cleanup refs
        markersRef.current = drawnMarkers;
      }
    };

    initLeaflet();

    return () => {
      if (leafletRef.current) {
        leafletRef.current.remove();
        leafletRef.current = null;
      }
    };
  }, []); // only on mount

  // GPS tracking
  const startTracking = () => {
    setGpsError(null);
    setTracking(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        leafletRef.current?.flyTo([latitude, longitude], 17, { animate: true, duration: 1 });
        setTracking(false);
      },
      (err) => {
        setGpsError('GPS unavailable: ' + err.message);
        setTracking(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const clearPoints = async () => {
    if (!leafletRef.current) return;
    const L = (await import('leaflet')).default;
    markersRef.current.forEach(m => leafletRef.current?.removeLayer(m));
    markersRef.current = [];
    if (polyRef.current) { leafletRef.current.removeLayer(polyRef.current); polyRef.current = null; }
    setPoints([]);
    onPolygonChange?.([]);
  };

  return (
    <div className="relative w-full">
      {/* Map container — Leaflet CSS must be loaded */}
      <style>{`
        @import url('https://unpkg.com/leaflet@1.9.4/dist/leaflet.css');
        .leaflet-container { background: #0d1126; font-family: 'Plus Jakarta Sans', sans-serif; }
        .leaflet-popup-content-wrapper { background: #171A3B; color: #C5CFDF; border: 1px solid rgba(99,56,245,0.3); border-radius: 12px; }
        .leaflet-popup-tip { background: #171A3B; }
        .leaflet-control-zoom a { background: #171A3B !important; color: #C5CFDF !important; border-color: rgba(99,56,245,0.3) !important; }
        .leaflet-control-attribution { background: rgba(13,17,38,0.8) !important; color: #AAB4CC !important; font-size: 10px; }
        .leaflet-control-attribution a { color: #6338F5 !important; }
      `}</style>

      <div ref={mapRef} className={`w-full ${height} rounded-xl border border-indigo-500/20 overflow-hidden z-10`} />

      {/* Controls */}
      <div className="absolute bottom-4 right-4 flex flex-col gap-2 z-20">
        {/* GPS button */}
        <button
          onClick={startTracking}
          disabled={tracking}
          className="p-2.5 rounded-xl bg-[#171A3B]/95 border border-indigo-500/30 text-slate-200 hover:border-indigo-500 hover:text-white transition-colors shadow-lg disabled:opacity-50"
          title="Go to my location"
        >
          <Navigation className={`w-4 h-4 ${tracking ? 'animate-spin text-[#13C98A]' : ''}`} />
        </button>

        {/* Clear points (draw mode) */}
        {drawMode && points.length > 0 && (
          <button
            onClick={clearPoints}
            className="p-2.5 rounded-xl bg-rose-900/90 border border-rose-500/40 text-rose-300 hover:text-white transition-colors shadow-lg"
            title="Clear drawn polygon"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Point counter / status */}
      {drawMode && (
        <div className="absolute top-3 left-3 z-20 bg-[#080D24]/90 backdrop-blur border border-indigo-500/30 rounded-xl px-3 py-2 text-xs font-mono">
          {points.length === 0 && (
            <span className="text-slate-400">Click map to place boundary beacons</span>
          )}
          {points.length > 0 && points.length < 3 && (
            <span className="text-amber-400">
              <MapPin className="w-3 h-3 inline mr-1" />
              {points.length} beacon{points.length > 1 ? 's' : ''} placed — need {3 - points.length} more
            </span>
          )}
          {points.length >= 3 && (
            <span className="text-[#13C98A]">
              <CheckCircle2 className="w-3 h-3 inline mr-1" />
              {points.length} beacons — polygon valid
            </span>
          )}
        </div>
      )}

      {/* GPS error */}
      {gpsError && (
        <div className="absolute top-3 right-3 z-20 bg-rose-950/90 border border-rose-500/40 rounded-xl px-3 py-2 text-xs text-rose-300 flex items-center gap-1.5">
          <AlertTriangle className="w-3.5 h-3.5" />
          {gpsError}
        </div>
      )}
    </div>
  );
};
