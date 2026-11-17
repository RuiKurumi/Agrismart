'use client';

import { useEffect, useState, useMemo } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import AdminLayout from '@/components/AdminLayout';
import {
  Search,
  RefreshCw,
  Activity,
  Clock,
  Database,
  Download,
  Timer,
  Layers,
} from 'lucide-react';

function pad(n: number) { return String(n).padStart(2, '0'); }
function formatDate(d: Date, fmt: string) {
  // minimal supports yyyy-MM-dd HH:mm / yyyy-MM-dd HH:mm:ss and yyyy-MM-dd
  const yyyy = d.getFullYear();
  const MM = pad(d.getMonth() + 1);
  const dd = pad(d.getDate());
  const HH = pad(d.getHours());
  const mm = pad(d.getMinutes());
  const ss = pad(d.getSeconds());
  if (fmt === 'yyyy-MM-dd HH:mm') return `${yyyy}-${MM}-${dd} ${HH}:${mm}`;
  if (fmt === 'yyyy-MM-dd HH:mm:ss') return `${yyyy}-${MM}-${dd} ${HH}:${mm}:${ss}`;
  if (fmt === 'yyyy-MM-dd') return `${yyyy}-${MM}-${dd}`;
  return d.toISOString();
}

type Tab = 'minute' | 'raw';

interface Reading {
  id: string;
  _path: string;
  _source: string;
  _userId?: string | null;
  _fieldId?: string | null;
  userName?: string;
  fieldName?: string;
  timestamp?: any;
  createdAt?: any;
  date?: any;
  measuredAt?: any;
  recordedAt?: any;
  time?: any;
  [key: string]: any;
}

function getTimestampValue(r: Reading): Date | null {
  const candidates = [r.timestamp, r.createdAt, r.measuredAt, r.recordedAt, r.date, r.time];
  for (const c of candidates) {
    if (!c) continue;
    if (c?.toDate && typeof c.toDate === 'function') {
      try {
        return c.toDate();
      } catch {}
    }
    if (c instanceof Date) return c;
    if (typeof c === 'string' || typeof c === 'number') {
      const d = new Date(c);
      if (!isNaN(d.getTime())) return d;
    }
    if (typeof c === 'object' && c.seconds) {
      return new Date(c.seconds * 1000);
    }
  }
  return null;
}

function formatTs(d: Date | null) {
  if (!d) return '—';
  try {
    return formatDate(d, 'yyyy-MM-dd HH:mm:ss');
  } catch {
    return d.toISOString();
  }
}

function formatMinute(d: Date | null) {
  if (!d) return '—';
  try {
    return formatDate(d, 'yyyy-MM-dd HH:mm');
  } catch {
    return d.toISOString().slice(0, 16);
  }
}

export default function ReadingsPage() {
  const [tab, setTab] = useState<Tab>('minute');
  const [readings, setReadings] = useState<Reading[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sourceInfo, setSourceInfo] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 25;

  const fetchReadings = async () => {
    setLoading(true);
    setError('');
    setSourceInfo('');
    try {
      // Primary: scan users -> fields -> readings (same pattern as dashboard)
      setSourceInfo('Scanning users/.../fields/.../readings');
      const usersSnap = await getDocs(collection(db, 'users'));
      const userMap: Record<string, any> = {};
      usersSnap.docs.forEach((d) => (userMap[d.id] = d.data()));

      const all: Reading[] = [];
      // limit to avoid explosion: first 50 users
      const usersToScan = usersSnap.docs.slice(0, 50);
      await Promise.all(
        usersToScan.map(async (userDoc) => {
          const fieldsSnap = await getDocs(collection(db, 'users', userDoc.id, 'fields'));
          await Promise.all(
            fieldsSnap.docs.slice(0, 50).map(async (fieldDoc) => {
              const fieldData = fieldDoc.data() as any;
              // Try readings subcollection under field
              for (const sub of ['readings', 'sensorReadings', 'measurements', 'data', 'sensor_data']) {
                try {
                  const rSnap = await getDocs(collection(db, 'users', userDoc.id, 'fields', fieldDoc.id, sub));
                  rSnap.docs.forEach((rd) => {
                    all.push({
                      id: rd.id,
                      _path: rd.ref.path,
                      _source: `users/${userDoc.id}/fields/${fieldDoc.id}/${sub}`,
                      _userId: userDoc.id,
                      _fieldId: fieldDoc.id,
                      userName: userMap[userDoc.id]?.name || userMap[userDoc.id]?.email,
                      fieldName: fieldData.name || fieldData.fieldName || fieldDoc.id,
                      ...rd.data(),
                    } as Reading);
                  });
                  if (rSnap.size > 0) break;
                } catch {}
              }
            })
          );
        })
      );

      let raw = all;
      if (raw.length === 0) {
        setSourceInfo('No readings found in users/.../fields/.../readings subcollections');
      } else {
        setSourceInfo(`users/fields scan: ${raw.length} docs across ${usersToScan.length} users`);
      }

      // Sort by timestamp desc
      raw.sort((a, b) => {
        const da = getTimestampValue(a)?.getTime() || 0;
        const dbt = getTimestampValue(b)?.getTime() || 0;
        return dbt - da;
      });

      // cap 500
      if (raw.length > 800) raw = raw.slice(0, 800);
      setReadings(raw);
    } catch (e: any) {
      console.error(e);
      setError(e.message || 'Failed to fetch readings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReadings();
  }, []);

  // Group by minute for minute tab
  const minuteGrouped = useMemo(() => {
    if (tab !== 'minute') return [];
    const map = new Map<string, Reading[]>();
    readings.forEach((r) => {
      const d = getTimestampValue(r);
      const key = d ? formatDate(d, 'yyyy-MM-dd HH:mm') : 'no-timestamp';
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(r);
    });
    // For each minute, aggregate: produce one row averaging numeric fields
    const aggregated: any[] = [];
    map.forEach((group, minuteKey) => {
      if (group.length === 1) {
        aggregated.push({ ...group[0], _minuteKey: minuteKey, _count: 1 });
      } else {
        // average numeric fields
        const sample = group[0];
        const numericKeys = Object.keys(sample).filter((k) => typeof sample[k] === 'number' && !k.startsWith('_'));
        const avg: any = { ...sample, _minuteKey: minuteKey, _count: group.length, id: `minute-${minuteKey}` };
        numericKeys.forEach((k) => {
          const vals = group.map((g) => g[k]).filter((v) => typeof v === 'number');
          if (vals.length) avg[k] = vals.reduce((a, b) => a + b, 0) / vals.length;
        });
        // Keep latest timestamp
        const latest = group.reduce((a, b) => {
          const da = getTimestampValue(a)?.getTime() || 0;
          const dbt = getTimestampValue(b)?.getTime() || 0;
          return dbt > da ? b : a;
        });
        Object.assign(avg, { timestamp: latest.timestamp || latest.createdAt || latest.measuredAt });
        aggregated.push(avg);
      }
    });
    aggregated.sort((a, b) => {
      const da = a._minuteKey === 'no-timestamp' ? 0 : new Date(a._minuteKey).getTime();
      const dbt = b._minuteKey === 'no-timestamp' ? 0 : new Date(b._minuteKey).getTime();
      return dbt - da;
    });
    return aggregated;
  }, [readings, tab]);

  const baseList = tab === 'minute' ? minuteGrouped : readings;

  const filtered = useMemo(() => {
    if (!search) return baseList;
    const q = search.toLowerCase();
    return baseList.filter((r: any) => {
      const hay = `${r._path || ''} ${r.userName || ''} ${r.fieldName || ''} ${r._minuteKey || ''} ${JSON.stringify(r).toLowerCase()}`;
      return hay.toLowerCase().includes(q);
    });
  }, [baseList, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paged = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page]);

  useEffect(() => setPage(1), [tab, search]);

  const exportCsv = () => {
    if (filtered.length === 0) return;
    const keys = new Set<string>();
    filtered.slice(0, 50).forEach((r) => Object.keys(r).forEach((k) => {
      if (!k.startsWith('_') || k === '_minuteKey' || k === '_count') keys.add(k);
    }));
    // ensure timestamp first
    const ordered = ['_minuteKey', 'timestamp', 'createdAt', 'measuredAt', 'userName', 'fieldName', ...Array.from(keys).filter(k => !['_minuteKey','timestamp','createdAt','measuredAt','userName','fieldName'].includes(k)).slice(0, 12)];
    const header = ordered.join(',');
    const rows = filtered.map((r: any) => ordered.map((k) => {
      let v = r[k];
      if (v?.toDate) v = formatTs(v.toDate());
      else if (v instanceof Date) v = formatTs(v);
      else if (typeof v === 'object' && v !== null) v = JSON.stringify(v).replace(/,/g, ';');
      else if (v == null) v = '';
      const s = String(v).replace(/"/g, '""');
      return s.includes(',') || s.includes('"') || s.includes('\n') ? `"${s}"` : s;
    }).join(','));
    const csv = [header, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `agrismart-${tab}-readings-${formatDate(new Date(),'yyyy-MM-dd')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Discover numeric columns for table
  const columns = useMemo(() => {
    const sample = filtered[0] as any;
    if (!sample) return [];
    const ignore = new Set(['_path','_source','_userId','_fieldId','id','_minuteKey','_count']);
    const keys = Object.keys(sample).filter(k => !ignore.has(k) && typeof sample[k] !== 'object' || (sample[k]?.toDate));
    // prioritize
    const preferred = ['timestamp','createdAt','measuredAt','recordedAt','date','time','userName','fieldName','temperature','humidity','soilMoisture','moisture','ph','phLevel','nitrogen','phosphorus','potassium','ec','fieldId','userId'];
    const ordered = preferred.filter(k => keys.includes(k));
    const rest = keys.filter(k => !ordered.includes(k)).slice(0, 4);
    return [...ordered, ...rest].slice(0, 8);
  }, [filtered]);

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Activity className="text-[#2E7D32]" size={22} />
            Sensor Readings
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Minute-level and non-aggregated raw results. Aggregated daily/weekly summaries remain on{' '}
            <a href="/dashboard" className="text-[#2E7D32] hover:underline font-medium">Dashboard</a>.
          </p>
          {sourceInfo && <p className="text-xs text-gray-400 mt-1">Source: {sourceInfo}</p>}
        </div>

        {/* Info banner */}
        <div className="card p-4 bg-gradient-to-r from-green-50 to-blue-50 border-green-100">
          <div className="flex gap-3">
            <Database size={18} className="text-[#2E7D32] mt-0.5 shrink-0" />
            <div className="text-sm">
              <p className="font-semibold text-gray-900">About this page</p>
              <p className="text-gray-600 text-xs mt-1 leading-relaxed">
                <span className="font-medium">Minute</span> — groups raw sensor samples per calendar minute (averaged if multiple samples fall in the same minute).
                <span className="font-medium"> Raw / Non-Aggregate</span> — shows every individual document as stored (including seconds/milliseconds). Use this for debugging, audits, and precise timeline analysis.
                Aggregated KPIs (daily totals, growth) stay on the Dashboard.
              </p>
            </div>
          </div>
        </div>

        {/* Tabs + controls */}
        <div className="flex flex-col lg:flex-row gap-3 lg:items-center justify-between">
          <div className="flex gap-2 p-1 bg-gray-100 rounded-xl w-fit">
            <button
              onClick={() => setTab('minute')}
              className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition ${tab === 'minute' ? 'bg-white shadow-sm text-[#2E7D32] border border-gray-200' : 'text-gray-600 hover:text-gray-900'}`}
            >
              <Timer size={16} /> Minute
              <span className={`text-xs px-1.5 py-0.5 rounded ${tab === 'minute' ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'}`}>{minuteGrouped.length || readings.length}</span>
            </button>
            <button
              onClick={() => setTab('raw')}
              className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition ${tab === 'raw' ? 'bg-white shadow-sm text-[#2E7D32] border border-gray-200' : 'text-gray-600 hover:text-gray-900'}`}
            >
              <Layers size={16} /> Raw / Non-Aggregate
              <span className={`text-xs px-1.5 py-0.5 rounded ${tab === 'raw' ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'}`}>{readings.length}</span>
            </button>
          </div>

          <div className="flex gap-2 flex-1 lg:justify-end">
            <div className="relative flex-1 lg:max-w-xs">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search field, user, path, value..."
                className="input pl-9 w-full"
              />
            </div>
            <button onClick={fetchReadings} disabled={loading} className="btn-secondary flex items-center gap-2 whitespace-nowrap">
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
              Refresh
            </button>
            <button onClick={exportCsv} disabled={filtered.length === 0} className="btn-primary flex items-center gap-2 whitespace-nowrap disabled:opacity-50">
              <Download size={16} />
              CSV
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="card p-4">
            <p className="text-xs text-gray-500 flex items-center gap-1"><Clock size={12} /> {tab === 'minute' ? 'Minute Buckets' : 'Raw Records'}</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{loading ? '—' : filtered.length}</p>
            <p className="text-xs text-gray-400">{tab === 'minute' ? 'grouped per minute' : 'individual docs'}</p>
          </div>
          <div className="card p-4">
            <p className="text-xs text-gray-500">Total Fetched</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{loading ? '—' : readings.length}</p>
            <p className="text-xs text-gray-400">from Firestore</p>
          </div>
          <div className="card p-4">
            <p className="text-xs text-gray-500">Time Range</p>
            <p className="text-xs font-bold text-gray-900 mt-1 truncate">
              {filtered.length ? `${formatTs(getTimestampValue(filtered[filtered.length-1] as any))} → ${formatTs(getTimestampValue(filtered[0] as any))}` : '—'}
            </p>
            <p className="text-xs text-gray-400">oldest → newest</p>
          </div>
          <div className="card p-4">
            <p className="text-xs text-gray-500">Page</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{page} / {totalPages}</p>
            <p className="text-xs text-gray-400">{pageSize} per page</p>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">{error}</div>
        )}

        {/* Table */}
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-4 py-3 text-gray-500 font-medium text-xs uppercase tracking-wide whitespace-nowrap">
                    {tab === 'minute' ? 'Minute (YYYY-MM-DD HH:mm)' : 'Timestamp'}
                  </th>
                  {tab === 'minute' && <th className="text-left px-4 py-3 text-gray-500 font-medium text-xs uppercase">Samples</th>}
                  {columns.map((c) => (
                    <th key={c} className="text-left px-4 py-3 text-gray-500 font-medium text-xs uppercase tracking-wide whitespace-nowrap">{c}</th>
                  ))}
                  <th className="text-left px-4 py-3 text-gray-500 font-medium text-xs uppercase">Path</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loading ? (
                  <tr><td colSpan={12} className="py-12 text-center text-gray-400">Loading readings...</td></tr>
                ) : paged.length === 0 ? (
                  <tr>
                    <td colSpan={12} className="py-12 text-center">
                      <Database size={32} className="mx-auto text-gray-200 mb-2" />
                      <p className="text-gray-500 text-sm">No readings found</p>
                      <p className="text-gray-400 text-xs mt-1 max-w-md mx-auto">
                        Expected collections: <code className="bg-gray-100 px-1 rounded">readings</code>, <code className="bg-gray-100 px-1 rounded">sensorReadings</code> (collectionGroup) or <code className="bg-gray-100 px-1 rounded">users/&#123;uid&#125;/fields/&#123;fieldId&#125;/readings</code>.
                        Seed data to see results here. The Dashboard will continue to show aggregated summaries.
                      </p>
                    </td>
                  </tr>
                ) : paged.map((r: any) => {
                  const d = getTimestampValue(r);
                  return (
                    <tr key={r.id + r._path} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 font-mono text-xs text-gray-900 whitespace-nowrap">
                        {tab === 'minute' ? r._minuteKey : formatTs(d)}
                      </td>
                      {tab === 'minute' && (
                        <td className="px-4 py-3">
                          <span className="badge-gray">{r._count}</span>
                        </td>
                      )}
                      {columns.map((col) => {
                        let v = r[col];
                        if (v?.toDate) v = formatTs(v.toDate());
                        else if (v instanceof Date) v = formatTs(v);
                        else if (typeof v === 'object' && v !== null) v = JSON.stringify(v).slice(0, 60);
                        else if (v == null) v = '—';
                        const isNum = typeof r[col] === 'number';
                        return (
                          <td key={col} className={`px-4 py-3 whitespace-nowrap ${isNum ? 'font-mono text-gray-900' : 'text-gray-600'} max-w-[160px] truncate`} title={String(v)}>
                            {isNum ? Number(v).toFixed(2).replace(/\.00$/, '') : String(v).slice(0, 40)}
                          </td>
                        );
                      })}
                      <td className="px-4 py-3 text-xs text-gray-400 max-w-[180px] truncate" title={r._path}>{r._path}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {filtered.length > pageSize && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 bg-gray-50/50">
              <p className="text-xs text-gray-500">
                Showing {(page-1)*pageSize+1}–{Math.min(page*pageSize, filtered.length)} of {filtered.length}
              </p>
              <div className="flex gap-2">
                <button disabled={page<=1} onClick={() => setPage(p=>Math.max(1,p-1))} className="btn-secondary px-3 py-1.5 text-xs disabled:opacity-50">Prev</button>
                <button disabled={page>=totalPages} onClick={() => setPage(p=>Math.min(totalPages,p+1))} className="btn-secondary px-3 py-1.5 text-xs disabled:opacity-50">Next</button>
              </div>
            </div>
          )}
        </div>

        <p className="text-xs text-gray-400 text-center">
          Tip: Use <span className="font-mono bg-gray-100 px-1 rounded">CSV</span> export for analysis. Minute view averages numeric fields when multiple samples share the same minute.
        </p>
      </div>
    </AdminLayout>
  );
}
