'use client';

import { useState, useEffect, useCallback } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { Cloud, Wind, Droplets, Thermometer, Search, AlertCircle, RefreshCw } from 'lucide-react';

const PH_PROVINCES = [
  'Metro Manila', 'Cebu', 'Davao del Sur', 'Iloilo', 'Laguna',
  'Batangas', 'Pampanga', 'Bulacan', 'Cavite', 'Occidental Mindoro',
  'Nueva Ecija', 'Pangasinan', 'Isabela', 'Negros Occidental', 'Palawan',
] as const;

const PROVINCE_COORDINATES: Record<(typeof PH_PROVINCES)[number], { latitude: number; longitude: number }> = {
  'Metro Manila': { latitude: 14.6042, longitude: 120.9822 },
  Cebu: { latitude: 10.3157, longitude: 123.8854 },
  'Davao del Sur': { latitude: 6.7528, longitude: 125.3572 },
  Iloilo: { latitude: 10.7202, longitude: 122.5621 },
  Laguna: { latitude: 14.1709, longitude: 121.2442 },
  Batangas: { latitude: 13.7565, longitude: 121.0583 },
  Pampanga: { latitude: 15.0794, longitude: 120.62 },
  Bulacan: { latitude: 14.7943, longitude: 120.8799 },
  Cavite: { latitude: 14.2456, longitude: 120.8786 },
  'Occidental Mindoro': { latitude: 13.1024, longitude: 120.7651 },
  'Nueva Ecija': { latitude: 15.5784, longitude: 121.1113 },
  Pangasinan: { latitude: 15.8949, longitude: 120.2863 },
  Isabela: { latitude: 16.9754, longitude: 121.8107 },
  'Negros Occidental': { latitude: 10.2926, longitude: 123.0247 },
  Palawan: { latitude: 9.8349, longitude: 118.7384 },
};

interface WeatherData {
  location: string;
  temperature: number | null;
  humidity: number | null;
  windSpeed: number | null;
  precipitation: number | null;
  condition: string;
  forecast: { day: string; max: number | null; min: number | null; rain: number | null; condition: string }[];
  fetchedAt: string;
}

interface OpenMeteoForecast {
  latitude?: number;
  longitude?: number;
  generationtime_ms?: number;
  current?: {
    time?: string;
    temperature_2m?: number | null;
    relative_humidity_2m?: number | null;
    wind_speed_10m?: number | null;
    precipitation?: number | null;
    weather_code?: number | null;
  };
  daily?: {
    time?: string[];
    temperature_2m_max?: (number | null)[];
    temperature_2m_min?: (number | null)[];
    precipitation_sum?: (number | null)[];
    weather_code?: (number | null)[];
  };
  reason?: string;
  error?: boolean;
}

const getCondition = (code: number | null | undefined) => {
  if (code == null) return '—';
  if (code === 0) return 'Sunny';
  if (code <= 3) return 'Cloudy';
  if (code <= 48) return 'Foggy';
  if (code <= 67) return 'Rain';
  if (code <= 82) return 'Showers';
  return 'Storm';
};

const formatFetchedAt = (iso: string) => {
  try {
    return new Date(iso).toLocaleString('en-PH', { timeZone: 'Asia/Manila', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  } catch { return iso; }
};

export default function WeatherPage() {
  const [selectedProvince, setSelectedProvince] = useState<(typeof PH_PROVINCES)[number]>('Metro Manila');
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [errorDetails, setErrorDetails] = useState('');

  const fetchWeather = useCallback(async (province: (typeof PH_PROVINCES)[number], retry = 0) => {
    setLoading(true);
    setError('');
    setErrorDetails('');

    const coords = PROVINCE_COORDINATES[province];
    if (!coords) {
      setError(`No coordinates configured for "${province}".`);
      setErrorDetails('Add the province to PROVINCE_COORDINATES in src/app/weather/page.tsx');
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000);

    try {
      const params = new URLSearchParams({
        latitude: coords.latitude.toString(),
        longitude: coords.longitude.toString(),
        current: 'temperature_2m,relative_humidity_2m,wind_speed_10m,precipitation,weather_code',
        daily: 'temperature_2m_max,temperature_2m_min,precipitation_sum,weather_code',
        timezone: 'Asia/Manila',
        forecast_days: '5',
        wind_speed_unit: 'kmh',
        precipitation_unit: 'mm',
        timeformat: 'iso8601',
      });

      const url = `https://api.open-meteo.com/v1/forecast?${params.toString()}`;
      const wxRes = await fetch(url, {
        signal: controller.signal,
        cache: 'no-store',
        headers: { Accept: 'application/json' },
      });

      const text = await wxRes.text();
      let wx: OpenMeteoForecast;
      try {
        wx = JSON.parse(text) as OpenMeteoForecast;
      } catch {
        throw new Error(`Weather service returned non-JSON (HTTP ${wxRes.status}): ${text.slice(0, 200)}`);
      }

      if (!wxRes.ok) {
        const msg = wx.reason || (wx as any).error || `HTTP ${wxRes.status} ${wxRes.statusText}`;
        // retry on 429/5xx once
        if (retry === 0 && (wxRes.status === 429 || wxRes.status >= 500)) {
          clearTimeout(timeout);
          await new Promise(r => setTimeout(r, 1200));
          return fetchWeather(province, 1);
        }
        throw new Error(msg);
      }

      // Be tolerant: open-meteo may return elevation/ocean coords with partial data
      if (!wx.current && !wx.daily) {
        throw new Error(wx.reason || 'Weather service returned empty data (no current/daily). Try another province or retry.');
      }

      const hasCurrent = !!wx.current;
      const hasDaily = !!wx.daily?.time?.length;

      if (!hasDaily) {
        console.warn('Weather daily missing for', province, wx);
      }

      const c = wx.current || {};
      const d = wx.daily || { time: [], temperature_2m_max: [], temperature_2m_min: [], precipitation_sum: [], weather_code: [] };
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

      // Build forecast tolerantly — even if daily partly missing
      const timeArr = d.time || [];
      const forecast = timeArr.slice(0, 5).map((date: string, i: number) => {
        // Parse as Manila date without UTC shift
        const dayDate = new Date(date + 'T00:00:00');
        const dayName = isNaN(dayDate.getTime()) ? date : days[dayDate.getDay()];
        return {
          day: dayName,
          max: (d.temperature_2m_max?.[i] ?? null) as number | null,
          min: (d.temperature_2m_min?.[i] ?? null) as number | null,
          rain: (d.precipitation_sum?.[i] ?? null) as number | null,
          condition: getCondition(d.weather_code?.[i]),
        };
      });

      setWeather({
        location: province,
        temperature: (c.temperature_2m ?? null) as number | null,
        humidity: (c.relative_humidity_2m ?? null) as number | null,
        windSpeed: (c.wind_speed_10m ?? null) as number | null,
        precipitation: (c.precipitation ?? null) as number | null,
        condition: hasCurrent ? getCondition(c.weather_code) : (forecast[0]?.condition || '—'),
        forecast: forecast.length ? forecast : [],
        fetchedAt: new Date().toISOString(),
      });

      if (!hasCurrent) {
        setErrorDetails('Current conditions unavailable — showing daily forecast only (partial data).');
      }
    } catch (e: any) {
      let message = 'Failed to fetch weather data.';
      let details = '';
      if (e?.name === 'AbortError') {
        message = `Request timed out for ${province}.`;
        details = 'Open-Meteo took >12s. Check your network or retry.';
        // retry once on timeout
        if (retry === 0) {
          clearTimeout(timeout);
          await new Promise(r => setTimeout(r, 800));
          setLoading(false);
          return fetchWeather(province, 1);
        }
      } else if (e instanceof Error) {
        message = e.message;
        details = `Province: ${province} (${coords.latitude}, ${coords.longitude})`;
        // Network failure retry once
        if (retry === 0 && (message.includes('Failed to fetch') || message.includes('NetworkError'))) {
          clearTimeout(timeout);
          await new Promise(r => setTimeout(r, 800));
          return fetchWeather(province, 1);
        }
      }
      setError(message);
      setErrorDetails(details);
      console.error('Weather fetch failed', province, e);
    } finally {
      clearTimeout(timeout);
      setLoading(false);
    }
  }, []);

  // Auto-fetch default province on mount so user sees data without clicking Fetch
  useEffect(() => {
    fetchWeather(selectedProvince);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleProvinceChange = (value: (typeof PH_PROVINCES)[number]) => {
    setSelectedProvince(value);
    setWeather(null);
    setError('');
    setErrorDetails('');
  };

  const handleSearch = () => fetchWeather(selectedProvince);

  const renderValue = (v: number | null, suffix = '') => (v == null || Number.isNaN(v) ? '—' : `${v}${suffix}`);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
          <div>
            <h1 className="font-display text-2xl font-bold text-gray-900">Weather Data</h1>
            <p className="text-gray-500 text-sm mt-1">Monitor weather conditions across Philippine provinces (Open-Meteo)</p>
            {weather?.fetchedAt && (
              <p className="text-xs text-gray-400 mt-1">Last updated: {formatFetchedAt(weather.fetchedAt)} · {weather.location}</p>
            )}
          </div>
          {weather && (
            <button onClick={() => fetchWeather(selectedProvince)} disabled={loading} className="btn-secondary flex items-center gap-2 text-sm shrink-0">
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh
            </button>
          )}
        </div>

        <div className="card p-4 flex gap-3">
          <select
            className="input flex-1"
            value={selectedProvince}
            onChange={e => handleProvinceChange(e.target.value as (typeof PH_PROVINCES)[number])}
          >
            {PH_PROVINCES.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
          <button onClick={handleSearch} disabled={loading} className="btn-primary flex items-center gap-2 px-6 shrink-0">
            {loading ? <RefreshCw size={16} className="animate-spin" /> : <Search size={16} />}
            {loading ? 'Loading...' : 'Fetch'}
          </button>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-sm">
            <div className="flex gap-2 items-start text-red-700">
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
              <div className="flex-1">
                <p className="font-medium">{error}</p>
                {errorDetails && <p className="text-xs text-red-600/80 mt-1 break-all">{errorDetails}</p>}
              </div>
            </div>
            <button onClick={() => fetchWeather(selectedProvince)} className="mt-3 btn-secondary text-xs py-1.5 px-3">Retry</button>
          </div>
        )}
        {errorDetails && !error && (
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800">{errorDetails}</div>
        )}

        {weather && (
          <div className="space-y-4">
            <div className="card p-6">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="font-display text-xl font-bold text-gray-900">{weather.location}</h2>
                  <p className="text-gray-500 text-sm">Current Conditions</p>
                </div>
                <span className="text-sm font-semibold text-gray-600">{weather.condition}</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-orange-50 rounded-xl p-4 flex items-center gap-3">
                  <Thermometer className="text-orange-500" size={20} />
                  <div>
                    <p className="text-xs text-gray-500">Temperature</p>
                    <p className="font-bold text-gray-900">{renderValue(weather.temperature, '°C')}</p>
                  </div>
                </div>
                <div className="bg-blue-50 rounded-xl p-4 flex items-center gap-3">
                  <Droplets className="text-blue-500" size={20} />
                  <div>
                    <p className="text-xs text-gray-500">Humidity</p>
                    <p className="font-bold text-gray-900">{renderValue(weather.humidity, '%')}</p>
                  </div>
                </div>
                <div className="bg-purple-50 rounded-xl p-4 flex items-center gap-3">
                  <Wind className="text-purple-500" size={20} />
                  <div>
                    <p className="text-xs text-gray-500">Wind</p>
                    <p className="font-bold text-gray-900">{renderValue(weather.windSpeed, ' km/h')}</p>
                  </div>
                </div>
                <div className="bg-cyan-50 rounded-xl p-4 flex items-center gap-3">
                  <Cloud className="text-cyan-500" size={20} />
                  <div>
                    <p className="text-xs text-gray-500">Precipitation</p>
                    <p className="font-bold text-gray-900">{renderValue(weather.precipitation, ' mm')}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="card p-6">
              <h3 className="font-semibold text-gray-900 mb-4">5-Day Forecast</h3>
              {weather.forecast.length === 0 ? (
                <p className="text-sm text-gray-400">No forecast data available for this location.</p>
              ) : (
                <div className="grid grid-cols-5 gap-3">
                  {weather.forecast.map((day, i) => (
                    <div key={i} className="text-center p-3 rounded-xl bg-gray-50">
                      <p className="text-xs text-gray-500 font-medium">{day.day}</p>
                      <p className="text-xs text-gray-600 my-2 min-h-4">{day.condition}</p>
                      <p className="text-sm font-bold text-gray-900">{day.max == null ? '—' : `${day.max}°`}</p>
                      <p className="text-xs text-gray-400">{day.min == null ? '—' : `${day.min}°`}</p>
                      <p className="text-xs text-blue-500 mt-1">{day.rain == null ? '—' : `${day.rain}mm`}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="card p-6">
              <h3 className="font-semibold text-gray-900 mb-3">Agricultural Advisory</h3>
              <div className="space-y-2">
                {(weather.humidity ?? 0) > 85 && (
                  <div className="flex items-start gap-3 p-3 bg-yellow-50 rounded-xl border border-yellow-100">
                    <Droplets className="mt-0.5 shrink-0 text-yellow-600" size={16} />
                    <p className="text-sm text-yellow-800">High humidity ({weather.humidity}%) - Watch for fungal diseases in onion crops. Consider preventive fungicide application.</p>
                  </div>
                )}
                {(weather.precipitation ?? 0) > 10 && (
                  <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-xl border border-blue-100">
                    <Cloud className="mt-0.5 shrink-0 text-blue-600" size={16} />
                    <p className="text-sm text-blue-800">Heavy rainfall detected - Ensure proper drainage in onion fields to prevent root rot.</p>
                  </div>
                )}
                {(weather.temperature ?? 0) > 35 && (
                  <div className="flex items-start gap-3 p-3 bg-orange-50 rounded-xl border border-orange-100">
                    <Thermometer className="mt-0.5 shrink-0 text-orange-600" size={16} />
                    <p className="text-sm text-orange-800">High temperature ({weather.temperature}°C) - Increase irrigation frequency and avoid midday fieldwork.</p>
                  </div>
                )}
                {(weather.humidity == null || weather.humidity <= 85) && (weather.precipitation == null || weather.precipitation <= 10) && (weather.temperature == null || weather.temperature <= 35) && (
                  <div className="flex items-start gap-3 p-3 bg-green-50 rounded-xl border border-green-100">
                    <Cloud className="mt-0.5 shrink-0 text-green-600" size={16} />
                    <p className="text-sm text-green-800">Conditions are favorable for onion farming in {weather.location}.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {!weather && !loading && !error && (
          <div className="card p-16 text-center">
            <Cloud size={48} className="mx-auto text-gray-200 mb-4" />
            <p className="text-gray-500">Select a province and click Fetch to view weather data.</p>
            <p className="text-xs text-gray-400 mt-1">Data from Open-Meteo (no API key required).</p>
          </div>
        )}
        {loading && !weather && (
          <div className="card p-12 text-center">
            <RefreshCw size={32} className="mx-auto text-gray-300 mb-3 animate-spin" />
            <p className="text-sm text-gray-500">Fetching weather for {selectedProvince}…</p>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
