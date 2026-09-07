'use client';

import { useEffect, useRef, useState, useMemo } from 'react';
import { MapPin, Flame, Layers, Eye, Info } from 'lucide-react';
import { buildHeatData, getFarmPoint } from '@/lib/farmLocation';
import { PHILIPPINES_CENTER } from '@/lib/provinceCentroids';
import 'leaflet/dist/leaflet.css';

type Props = {
  fields: any[];
};

export default function FarmHeatmap({ fields }: Props) {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<any>(null);
  const heatLayerRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const [mode, setMode] = useState<'heat' | 'markers' | 'both'>('heat');
  const [ready, setReady] = useState(false);
  const [leafletLoadError, setLeafletLoadError] = useState<string | null>(null);

  const { points, preciseCount, fallbackCount, byProvince } = useMemo(() => buildHeatData(fields), [fields]);

  // Also compute points with metadata for markers
  const farmPoints = useMemo(() => fields.map((f, i) => ({ field: f, point: getFarmPoint(f, i), idx: i })), [fields]);

  const topProvinces = useMemo(() => {
    const entries = Object.entries(byProvince).sort((a, b) => b[1] - a[1]).slice(0, 6);
    const max = Math.max(...entries.map(([, c]) => c), 1);
    return entries.map(([prov, count]) => ({ province: prov, count, pct: (count / max) * 100 }));
  }, [byProvince]);

  const total = fields.length;

  useEffect(() => {
    let cancelled = false;
    if (!mapRef.current) return;

    const init = async () => {
      try {
        const L = (await import('leaflet')).default;
        // ensure heat plugin is loaded - it expects global L
        // @ts-ignore
        (globalThis as any).L = L;
        // @ts-ignore
        if (typeof window !== 'undefined') (window as any).L = L;
        // leaflet.heat extends L, need to import for side effect
        // @ts-ignore
        await import('leaflet.heat');

        // Fix default icon paths for Next.js
        // @ts-ignore
        delete (L.Icon.Default.prototype as any)._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
          iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
          shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
        });

        if (cancelled || !mapRef.current) return;

        // Clean previous instance
        if (mapInstanceRef.current) {
          mapInstanceRef.current.remove();
          mapInstanceRef.current = null;
        }

        const map = L.map(mapRef.current, {
          zoomControl: true,
          attributionControl: true,
        });
        mapInstanceRef.current = map;

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenStreetMap contributors',
          maxZoom: 18,
        }).addTo(map);

        const renderLayers = () => {
          // Clear previous layers
          if (heatLayerRef.current) {
            map.removeLayer(heatLayerRef.current);
            heatLayerRef.current = null;
          }
          markersRef.current.forEach((m) => map.removeLayer(m));
          markersRef.current = [];

          if (points.length === 0) {
            map.setView([PHILIPPINES_CENTER.latitude, PHILIPPINES_CENTER.longitude], 5.5);
            return;
          }

          // Fit bounds
          const latLngs: [number, number][] = points.map(([lat, lng]) => [lat, lng]);
          try {
            map.fitBounds(latLngs as any, { padding: [30, 30], maxZoom: 10 });
          } catch {
            map.setView([PHILIPPINES_CENTER.latitude, PHILIPPINES_CENTER.longitude], 6);
          }

          if (mode === 'heat' || mode === 'both') {
            // @ts-ignore - heatLayer added by leaflet.heat
            if (typeof (L as any).heatLayer === 'function') {
              const heat = (L as any).heatLayer(points, {
                radius: 28,
                blur: 18,
                minOpacity: 0.35,
                maxZoom: 10,
                gradient: { 0.3: '#60A5FA', 0.5: '#34D399', 0.7: '#FBBF24', 0.85: '#F97316', 1: '#EF4444' },
              });
              heat.addTo(map);
              heatLayerRef.current = heat;
            } else {
              // Fallback to circles if heatlayer unavailable
              points.forEach(([lat, lng, intensity]) => {
                const c = L.circleMarker([lat, lng], {
                  radius: 6 + intensity * 6,
                  fillColor: '#F97316',
                  color: '#fff',
                  weight: 1,
                  opacity: 0.9,
                  fillOpacity: 0.55,
                }).addTo(map);
                markersRef.current.push(c);
              });
            }
          }

          if (mode === 'markers' || mode === 'both') {
            farmPoints.forEach(({ field, point }) => {
              const color = point.isPrecise ? '#2E7D32' : '#F59E0B';
              const marker = L.circleMarker([point.lat, point.lng], {
                radius: point.isPrecise ? 7 : 9,
                fillColor: color,
                color: '#fff',
                weight: 1.5,
                opacity: 1,
                fillOpacity: point.isPrecise ? 0.9 : 0.6,
                dashArray: point.isPrecise ? undefined : '3 3',
              });
              const popup = `
                <div style="min-width:160px;font-family:system-ui">
                  <strong style="font-size:13px">${field.name || 'Unnamed farm'}</strong><br/>
                  <span style="font-size:11px;color:#6B7280">${field.userName || 'Unknown'} · ${point.province}</span><br/>
                  <span style="font-size:11px;color:${point.isPrecise ? '#2E7D32' : '#D97706'}">${point.isPrecise ? 'Precise location' : 'Province fallback (jittered)'}</span><br/>
                  <span style="font-size:10px;color:#9CA3AF">${point.lat.toFixed(4)}, ${point.lng.toFixed(4)}</span>
                </div>
              `;
              marker.bindPopup(popup);
              marker.addTo(map);
              markersRef.current.push(marker);
            });
          }
        };

        renderLayers();
        // Re-render on mode change is handled by effect dependency (we re-init on mode? instead we attach listener)
        // We'll store render function for later mode switches via separate effect
        (map as any)._renderHeatmap = renderLayers;

        setReady(true);
      } catch (e: any) {
        console.error('Leaflet load failed', e);
        setLeafletLoadError(e?.message || 'Failed to load map');
      }
    };

    init();

    return () => {
      cancelled = true;
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.remove();
        } catch {}
        mapInstanceRef.current = null;
      }
      heatLayerRef.current = null;
      markersRef.current = [];
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [points, farmPoints]); // re-init when data changes

  // Handle mode change without full re-init by calling stored render
  useEffect(() => {
    const map: any = mapInstanceRef.current;
    if (map && map._renderHeatmap) {
      map._renderHeatmap();
    }
  }, [mode]);

  return (
    <div className="card overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center text-white shrink-0">
            <Flame size={18} />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">Farm Density Heatmap <span className="text-xs font-normal text-gray-400">· {total} farms</span></h3>
            <p className="text-xs text-gray-500 mt-0.5">
              {preciseCount > 0 && fallbackCount > 0
                ? `${preciseCount} precise · ${fallbackCount} province fallback`
                : preciseCount > 0
                  ? `${preciseCount} with precise location`
                  : fallbackCount > 0
                    ? `${fallbackCount} province-level (no GPS — jittered per farm)`
                    : 'No farms to display'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="inline-flex bg-gray-50 border border-gray-200 rounded-xl p-1">
            {(['heat', 'markers', 'both'] as const).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition ${mode === m ? 'bg-white shadow border border-gray-200 text-gray-900' : 'text-gray-500 hover:text-gray-900'}`}
              >
                {m === 'heat' ? <span className="inline-flex items-center gap-1.5"><Layers size={12} /> Heat</span> : m === 'markers' ? <span className="inline-flex items-center gap-1.5"><MapPin size={12} /> Points</span> : <span className="inline-flex items-center gap-1.5"><Eye size={12} /> Both</span>}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="relative">
        {/* Map */}
        <div ref={mapRef} className="h-[380px] sm:h-[420px] w-full bg-[#F3F4F6]" />

        {/* Gradient legend */}
        <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur border border-gray-200 rounded-xl px-3 py-2 shadow-sm">
          <p className="text-[10px] font-bold tracking-widest text-gray-500 uppercase">Density</p>
          <div className="mt-1.5 h-2 w-32 rounded-full" style={{ background: 'linear-gradient(to right, #60A5FA, #34D399, #FBBF24, #F97316, #EF4444)' }} />
          <div className="flex justify-between text-[10px] text-gray-400 mt-1">
            <span>Low</span><span>High</span>
          </div>
        </div>

        {!ready && !leafletLoadError && (
          <div className="absolute inset-0 bg-white/60 backdrop-blur-sm flex items-center justify-center">
            <div className="flex flex-col items-center gap-2">
              <div className="w-8 h-8 border-3 border-[#2E7D32] border-t-transparent rounded-full animate-spin" style={{ borderWidth: 3 }} />
              <p className="text-xs text-gray-500">Loading map…</p>
            </div>
          </div>
        )}

        {leafletLoadError && (
          <div className="absolute inset-0 bg-white flex items-center justify-center p-6 text-center">
            <div>
              <p className="text-sm font-medium text-gray-900">Map failed to load</p>
              <p className="text-xs text-gray-500 mt-1">{leafletLoadError}</p>
              <p className="text-xs text-gray-400 mt-3">Showing province distribution below instead.</p>
            </div>
          </div>
        )}

        {total === 0 && ready && (
          <div className="absolute inset-0 bg-white/80 flex items-center justify-center p-6 text-center">
            <div>
              <MapPin size={24} className="mx-auto text-gray-300 mb-2" />
              <p className="text-sm text-gray-500">No farms to display on heatmap</p>
              <p className="text-xs text-gray-400 mt-1">Add fields or adjust filters</p>
            </div>
          </div>
        )}
      </div>

      {/* Bottom stats */}
      <div className="px-5 py-4 bg-gray-50/50 border-t border-gray-100 grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          <h4 className="text-xs font-bold tracking-widest text-gray-500 uppercase flex items-center gap-1.5">
            <MapPin size={12} /> Top provinces (fallback counts)
          </h4>
          {topProvinces.length === 0 ? (
            <p className="text-xs text-gray-400 mt-2">No province data</p>
          ) : (
            <div className="space-y-2 mt-3">
              {topProvinces.map(({ province, count, pct }) => (
                <div key={province} className="flex items-center gap-3">
                  <span className="text-xs text-gray-600 w-36 truncate" title={province}>{province}</span>
                  <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
                    <div className="h-2 rounded-full" style={{ width: `${pct}%`, background: `linear-gradient(to right, #2E7D32, #F97316)` }} />
                  </div>
                  <span className="text-xs font-semibold text-gray-900 w-6 text-right">{count}</span>
                </div>
              ))}
            </div>
          )}
          <p className="text-[11px] text-gray-400 mt-3 flex gap-1.5">
            <Info size={12} className="shrink-0 mt-0.5" />
            When a farm has no GPS, it’s placed at its province centroid with a tiny jitter so clusters remain visible. Precise points use the farm’s actual location.
          </p>
        </div>
        <div className="lg:border-l lg:border-gray-100 lg:pl-4">
          <h4 className="text-xs font-bold tracking-widest text-gray-500 uppercase">Legend</h4>
          <div className="mt-3 space-y-2 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#2E7D32] border-2 border-white shadow" />
              <span className="text-gray-600">Precise location (farm GPS)</span>
              <span className="ml-auto text-gray-400">{preciseCount}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#F59E0B] border-2 border-white shadow opacity-70" style={{ borderStyle: 'dashed' }} />
              <span className="text-gray-600">Province fallback (jittered)</span>
              <span className="ml-auto text-gray-400">{fallbackCount}</span>
            </div>
            <div className="flex items-center gap-2 pt-2 border-t border-gray-100 mt-2">
              <span className="text-gray-500">Total in view:</span>
              <span className="font-semibold text-gray-900">{total}</span>
              <span className="text-gray-400">farms</span>
            </div>
          </div>
          <p className="text-[11px] text-gray-400 mt-3">Tip: Switch to <strong>Points</strong> to see each farm, or <strong>Both</strong> for heat + points. Click a point for details.</p>
        </div>
      </div>
    </div>
  );
}
