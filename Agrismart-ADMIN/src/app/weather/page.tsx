'use client';

import { useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { Cloud, Wind, Droplets, Thermometer, Search } from 'lucide-react';

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
  temperature: number;
  humidity: number;
  windSpeed: number;
  precipitation: number;
  condition: string;
  forecast: { day: string; max: number; min: number; rain: number; condition: string }[];
}

interface OpenMeteoForecast {
  current?: {
    temperature_2m: number;
    relative_humidity_2m: number;
    wind_speed_10m: number;
    precipitation: number;
    weather_code: number;
  };
  daily?: {
    time: string[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    precipitation_sum: number[];
    weather_code: number[];
  };
  reason?: string;
}

const getCondition = (code: number) => {
  if (code === 0) return 'Sunny';
  if (code <= 3) return 'Cloudy';
  if (code <= 48) return 'Foggy';
  if (code <= 67) return 'Rain';
  if (code <= 82) return 'Showers';
  return 'Storm';
};

export default function WeatherPage() {
  const [selectedProvince, setSelectedProvince] = useState<(typeof PH_PROVINCES)[number]>('Metro Manila');
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchWeather = async (province: (typeof PH_PROVINCES)[number]) => {
    setLoading(true);
    setError('');
    try {
      const { latitude, longitude } = PROVINCE_COORDINATES[province];
      const params = new URLSearchParams({
        latitude: latitude.toString(),
        longitude: longitude.toString(),
        current: 'temperature_2m,relative_humidity_2m,wind_speed_10m,precipitation,weather_code',
        daily: 'temperature_2m_max,temperature_2m_min,precipitation_sum,weather_code',
        timezone: 'Asia/Manila',
        forecast_days: '5',
      });

      const wxRes = await fetch(`https://api.open-meteo.com/v1/forecast?${params.toString()}`);
      const wx = (await wxRes.json()) as OpenMeteoForecast;
      if (!wxRes.ok) throw new Error(wx.reason || 'Weather service returned an error.');
      if (!wx.current || !wx.daily) throw new Error('Weather service returned incomplete data.');

      const c = wx.current;
      const d = wx.daily;
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

      setWeather({
        location: province,
        temperature: c.temperature_2m,
        humidity: c.relative_humidity_2m,
        windSpeed: c.wind_speed_10m,
        precipitation: c.precipitation,
        condition: getCondition(c.weather_code),
        forecast: d.time.slice(0, 5).map((date: string, i: number) => ({
          day: days[new Date(date).getDay()],
          max: d.temperature_2m_max[i],
          min: d.temperature_2m_min[i],
          rain: d.precipitation_sum[i],
          condition: getCondition(d.weather_code[i]),
        })),
      });
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to fetch weather data.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => fetchWeather(selectedProvince);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-900">Weather Data</h1>
          <p className="text-gray-500 text-sm mt-1">Monitor weather conditions across Philippine provinces</p>
        </div>

        <div className="card p-4 flex gap-3">
          <select
            className="input flex-1"
            value={selectedProvince}
            onChange={e => setSelectedProvince(e.target.value as (typeof PH_PROVINCES)[number])}
          >
            {PH_PROVINCES.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
          <button onClick={handleSearch} disabled={loading} className="btn-primary flex items-center gap-2 px-6">
            <Search size={16} />
            {loading ? 'Loading...' : 'Fetch'}
          </button>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">{error}</div>
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
                    <p className="font-bold text-gray-900">{weather.temperature}&deg;C</p>
                  </div>
                </div>
                <div className="bg-blue-50 rounded-xl p-4 flex items-center gap-3">
                  <Droplets className="text-blue-500" size={20} />
                  <div>
                    <p className="text-xs text-gray-500">Humidity</p>
                    <p className="font-bold text-gray-900">{weather.humidity}%</p>
                  </div>
                </div>
                <div className="bg-purple-50 rounded-xl p-4 flex items-center gap-3">
                  <Wind className="text-purple-500" size={20} />
                  <div>
                    <p className="text-xs text-gray-500">Wind</p>
                    <p className="font-bold text-gray-900">{weather.windSpeed} km/h</p>
                  </div>
                </div>
                <div className="bg-cyan-50 rounded-xl p-4 flex items-center gap-3">
                  <Cloud className="text-cyan-500" size={20} />
                  <div>
                    <p className="text-xs text-gray-500">Precipitation</p>
                    <p className="font-bold text-gray-900">{weather.precipitation} mm</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="card p-6">
              <h3 className="font-semibold text-gray-900 mb-4">5-Day Forecast</h3>
              <div className="grid grid-cols-5 gap-3">
                {weather.forecast.map((day, i) => (
                  <div key={i} className="text-center p-3 rounded-xl bg-gray-50">
                    <p className="text-xs text-gray-500 font-medium">{day.day}</p>
                    <p className="text-xs text-gray-600 my-2 min-h-4">{day.condition}</p>
                    <p className="text-sm font-bold text-gray-900">{day.max}&deg;</p>
                    <p className="text-xs text-gray-400">{day.min}&deg;</p>
                    <p className="text-xs text-blue-500 mt-1">{day.rain}mm</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="card p-6">
              <h3 className="font-semibold text-gray-900 mb-3">Agricultural Advisory</h3>
              <div className="space-y-2">
                {weather.humidity > 85 && (
                  <div className="flex items-start gap-3 p-3 bg-yellow-50 rounded-xl border border-yellow-100">
                    <Droplets className="mt-0.5 shrink-0 text-yellow-600" size={16} />
                    <p className="text-sm text-yellow-800">High humidity ({weather.humidity}%) - Watch for fungal diseases in onion crops. Consider preventive fungicide application.</p>
                  </div>
                )}
                {weather.precipitation > 10 && (
                  <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-xl border border-blue-100">
                    <Cloud className="mt-0.5 shrink-0 text-blue-600" size={16} />
                    <p className="text-sm text-blue-800">Heavy rainfall detected - Ensure proper drainage in onion fields to prevent root rot.</p>
                  </div>
                )}
                {weather.temperature > 35 && (
                  <div className="flex items-start gap-3 p-3 bg-orange-50 rounded-xl border border-orange-100">
                    <Thermometer className="mt-0.5 shrink-0 text-orange-600" size={16} />
                    <p className="text-sm text-orange-800">High temperature ({weather.temperature}&deg;C) - Increase irrigation frequency and avoid midday fieldwork.</p>
                  </div>
                )}
                {weather.humidity <= 85 && weather.precipitation <= 10 && weather.temperature <= 35 && (
                  <div className="flex items-start gap-3 p-3 bg-green-50 rounded-xl border border-green-100">
                    <Cloud className="mt-0.5 shrink-0 text-green-600" size={16} />
                    <p className="text-sm text-green-800">Conditions are favorable for onion farming in {weather.location}.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {!weather && !loading && (
          <div className="card p-16 text-center">
            <Cloud size={48} className="mx-auto text-gray-200 mb-4" />
            <p className="text-gray-500">Select a province and click Fetch to view weather data.</p>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
