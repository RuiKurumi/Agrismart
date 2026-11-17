import { getProvinceCenter } from './provinceCentroids';

export type FarmPoint = {
  lat: number;
  lng: number;
  intensity: number;
  isPrecise: boolean;
  province: string;
};

function parseGeoPoint(v: any): [number, number] | null {
  if (v == null) return null;
  // String like "12.3, 121.0"
  if (typeof v === 'string') {
    const parts = v.split(',').map(s => parseFloat(s.trim()));
    if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
      if (Math.abs(parts[0]) <= 90 && Math.abs(parts[1]) <= 180) return [parts[0], parts[1]];
      if (Math.abs(parts[1]) <= 90 && Math.abs(parts[0]) <= 180) return [parts[1], parts[0]];
    }
    return null;
  }
  if (Array.isArray(v) && v.length === 2) {
    const a = Number(v[0]);
    const b = Number(v[1]);
    if (!isNaN(a) && !isNaN(b)) {
      // Detect GeoJSON [lng, lat] vs [lat, lng]
      if (Math.abs(a) <= 90 && Math.abs(b) <= 180) return [a, b];
      if (Math.abs(b) <= 90 && Math.abs(a) <= 180) return [b, a];
      return [a, b];
    }
    return null;
  }
  if (typeof v === 'object') {
    // Firestore GeoPoint or plain object
    const latRaw = v.latitude ?? v.lat ?? v._lat ?? v._latitude ?? v.y ?? v.Y ?? v.Latitude;
    const lngRaw = v.longitude ?? v.lng ?? v.lon ?? v.long ?? v._long ?? v._longitude ?? v.x ?? v.X ?? v.Longitude;
    if (latRaw != null && lngRaw != null) {
      const lat = Number(latRaw);
      const lng = Number(lngRaw);
      if (!isNaN(lat) && !isNaN(lng)) {
        if (Math.abs(lat) <= 90 && Math.abs(lng) <= 180) return [lat, lng];
        if (Math.abs(lng) <= 90 && Math.abs(lat) <= 180) return [lng, lat];
        return [lat, lng];
      }
    }
    // Nested
    if (v.geopoint) {
      const n = parseGeoPoint(v.geopoint);
      if (n) return n;
    }
    if (v.coordinates) {
      const n = parseGeoPoint(v.coordinates);
      if (n) return n;
    }
    if (v.geoPoint) {
      const n = parseGeoPoint(v.geoPoint);
      if (n) return n;
    }
    // Try _lat/_long alternative where firestore GeoPoint stores as { _lat, _long } or { latitude, longitude } already handled
    // Check if object has latitude/longitude as getters? Firestore GeoPoint has those
    // Already tried
  }
  return null;
}

function jitter(lat: number, lng: number, idx: number): [number, number] {
  // Deterministic jitter based on index to avoid stacking + small random
  // Spread within ~0.08 degrees (~9km) plus pseudo-random
  const hash = (Math.sin(idx * 9999) * 10000) % 1;
  const r1 = (hash - 0.5) * 0.16;
  const r2 = ((Math.cos(idx * 7777) * 10000) % 1 - 0.5) * 0.16;
  return [lat + r1, lng + r2];
}

export function getFarmPoint(field: any, index: number): FarmPoint {
  const province = field.userProvince || field.province || field.farmProvince || '—';
  const candidates = [
    field.location,
    field.geoPoint,
    field.geopoint,
    field.coordinates,
    field.coord,
    field.position,
    field.latLng,
    field.latlng,
    field.geolocation,
    field.farmLocation,
    field.fieldLocation,
    field.mapLocation,
    // combined lat/lng
    field.lat != null && field.lng != null ? { lat: field.lat, lng: field.lng } : null,
    field.latitude != null && field.longitude != null ? { latitude: field.latitude, longitude: field.longitude } : null,
    field.userLocation,
    field.user_location,
    // Sometimes location stored as string address — will fail parse and fallback
  ].filter(Boolean);

  for (const c of candidates) {
    const parsed = parseGeoPoint(c);
    if (parsed) {
      const [lat, lng] = parsed;
      // Validate Philippines-ish bounds roughly (4..21 lat, 116..127 lng) but allow other
      if (lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
        return { lat, lng, intensity: 1, isPrecise: true, province };
      }
    }
  }

  // Fallback to province centroid with jitter
  const center = getProvinceCenter(province);
  const [jLat, jLng] = jitter(center.latitude, center.longitude, index);
  return { lat: jLat, lng: jLng, intensity: 1, isPrecise: false, province };
}

export function buildHeatData(fields: any[]): { points: [number, number, number][]; preciseCount: number; fallbackCount: number; byProvince: Record<string, number> } {
  const points: [number, number, number][] = [];
  let preciseCount = 0;
  let fallbackCount = 0;
  const byProvince: Record<string, number> = {};
  fields.forEach((f, i) => {
    const p = getFarmPoint(f, i);
    points.push([p.lat, p.lng, p.intensity]);
    if (p.isPrecise) preciseCount++; else fallbackCount++;
    const key = p.province || 'Unknown';
    byProvince[key] = (byProvince[key] || 0) + 1;
  });
  return { points, preciseCount, fallbackCount, byProvince };
}
