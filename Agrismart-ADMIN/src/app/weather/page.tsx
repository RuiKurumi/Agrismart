'use client';

import { useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { Cloud, Wind, Droplets, Thermometer, Search } from 'lucide-react';

const PH_PROVINCES = [
  'Metro Manila', 'Cebu', 'Davao del Sur', 'Iloilo', 'Laguna',
  'Batangas', 'Pampanga', 'Bulacan', 'Cavite', 'Occidental Mindoro',
  'Nueva Ecija', 'Pangasinan', 'Isabela', 'Negros Occidental', 'Palawan',
];

interface WeatherData {
  location: string;
  temperature: number;
  humidity: number;
  windSpeed: number;
  precipitation: number;
  condition: string;
  forecast: { day: string; max: number; min: number; rain: number; icon: string }[];
}

export default function WeatherPage() {
  const [selectedProvince, setSelectedProvince] = useState('Metro Manila');
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchWeather = async (province: string) => {
    setLoading(true);
    setError('');
    try {
      // Geocode
      const geoRes = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(province + ', Philippines')}&count=1&language=en&format=json`
      );
      const geoData = await geoRes.json();
      if (!geoData.results?.length) throw new Error('Location not found');
      const { latitude, longitude } = geoData.results[0];

      // Weather
      const wxRes = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}` +
        `&current=temperature_2m,relative_humidity_2m,wind_speed_10m,precipitation,weather_code` +
        `&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,weather_code` +
        `&timezone=Asia/Manila&forecast_days=5`
      );
      const wx = await wxRes.json();
      const c = wx.current;
      const d = wx.daily;

      const getIcon = (code: number) => {
        if (code === 0) return '☀️';
        if (code <= 3) return '⛅';
        if (code <= 48) return '🌫';
        if (code <= 67) return '🌧';
        if (code <= 82) return '🌦';
        return '⛈';
      };

      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

      setWeather({
        location: province,
        temperature: c.temperature_2m,
        humidity: c.relative_humidity_2m,
        windSpeed: c.wind_speed_10m,
        precipitation: c.precipitation,
        condition: getIcon(c.weather_code),
        forecast: d.time.slice(0, 5).map((date: string, i: number) => ({
          day: days[new Date(date).getDay()],
          max: d.temperature_2m_max[i],
          min: d.temperature_2m_min[i],
          rain: d.precipitation_sum[i],
          icon: getIcon(d.weather_code[i]),
        })),
      });
    } catch (e: any) {
      setError('Failed to fetch weather data.');
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

        {/* Search */}
        <div className="card p-4 flex gap-3">
          <select
            className="input flex-1"
            value={selectedProvince}
            onChange={e => setSelectedProvince(e.target.value)}
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
            {/* Current conditions */}
            <div className="card p-6">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="font-display text-xl font-bold text-gray-900">{weather.location}</h2>
                  <p className="text-gray-500 text-sm">Current Conditions</p>
                </div>
                <span className="text-5xl">{weather.condition}</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-orange-50 rounded-xl p-4 flex items-center gap-3">
                  <Thermometer className="text-orange-500" size={20} />
                  <div>
                    <p className="text-xs text-gray-500">Temperature</p>
                    <p className="font-bold text-gray-900">{weather.temperature}°C</p>
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

            {/* 5-day forecast */}
            <div className="card p-6">
              <h3 className="font-semibold text-gray-900 mb-4">5-Day Forecast</h3>
              <div className="grid grid-cols-5 gap-3">
                {weather.forecast.map((day, i) => (
                  <div key={i} className="text-center p-3 rounded-xl bg-gray-50">
                    <p className="text-xs text-gray-500 font-medium">{day.day}</p>
                    <p className="text-2xl my-2">{day.icon}</p>
                    <p className="text-sm font-bold text-gray-900">{day.max}°</p>
                    <p className="text-xs text-gray-400">{day.min}°</p>
                    <p className="text-xs text-blue-500 mt-1">{day.rain}mm</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Agricultural advisory */}
            <div className="card p-6">
              <h3 className="font-semibold text-gray-900 mb-3">Agricultural Advisory</h3>
              <div className="space-y-2">
                {weather.humidity > 85 && (
                  <div className="flex items-start gap-3 p-3 bg-yellow-50 rounded-xl border border-yellow-100">
                    <span>💧</span>
                    <p className="text-sm text-yellow-800">High humidity ({weather.humidity}%) — Watch for fungal diseases in onion crops. Consider preventive fungicide application.</p>
                  </div>
                )}
                {weather.precipitation > 10 && (
                  <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-xl border border-blue-100">
                    <span>🌧</span>
                    <p className="text-sm text-blue-800">Heavy rainfall detected — Ensure proper drainage in onion fields to prevent root rot.</p>
                  </div>
                )}
                {weather.temperature > 35 && (
                  <div className="flex items-start gap-3 p-3 bg-orange-50 rounded-xl border border-orange-100">
                    <span>🌡</span>
                    <p className="text-sm text-orange-800">High temperature ({weather.temperature}°C) — Increase irrigation frequency and avoid midday fieldwork.</p>
                  </div>
                )}
                {weather.humidity <= 85 && weather.precipitation <= 10 && weather.temperature <= 35 && (
                  <div className="flex items-start gap-3 p-3 bg-green-50 rounded-xl border border-green-100">
                    <span>✅</span>
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
