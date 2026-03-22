'use client';

import { useEffect, useState } from 'react';
import { collection, getDocs, collectionGroup } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import AdminLayout from '@/components/AdminLayout';
import { Sprout, Search } from 'lucide-react';

const stageColor: Record<string, string> = {
  'Germination': 'badge-yellow',
  'Seedling': 'badge-green',
  'Vegetative': 'badge-green',
  'Bulbing': 'badge-blue',
  'Maturation': 'badge-yellow',
  'Ready for Harvest': 'badge-red',
};

const getGrowthStage = (plantingDate: any): string => {
  if (!plantingDate?.toDate) return '—';
  const dap = Math.floor((Date.now() - plantingDate.toDate().getTime()) / 86400000);
  if (dap <= 14) return 'Germination';
  if (dap <= 30) return 'Seedling';
  if (dap <= 60) return 'Vegetative';
  if (dap <= 90) return 'Bulbing';
  if (dap <= 110) return 'Maturation';
  return 'Ready for Harvest';
};

const getProgress = (plantingDate: any): number => {
  if (!plantingDate?.toDate) return 0;
  const dap = Math.floor((Date.now() - plantingDate.toDate().getTime()) / 86400000);
  return Math.min(dap / 110, 1) * 100;
};

export default function FieldsPage() {
  const [fields, setFields] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchFields = async () => {
      try {
        // Get all users then their fields
        const usersSnap = await getDocs(collection(db, 'users'));
        const allFields: any[] = [];

        await Promise.all(usersSnap.docs.map(async (userDoc) => {
          const userData = userDoc.data();
          const fieldsSnap = await getDocs(collection(db, 'users', userDoc.id, 'fields'));
          fieldsSnap.docs.forEach(fieldDoc => {
            allFields.push({
              id: fieldDoc.id,
              userId: userDoc.id,
              userName: userData.name || userData.email || 'Unknown',
              userProvince: userData.province || '—',
              ...fieldDoc.data(),
            });
          });
        }));

        setFields(allFields);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchFields();
  }, []);

  const filtered = fields.filter(f =>
    f.name?.toLowerCase().includes(search.toLowerCase()) ||
    f.userName?.toLowerCase().includes(search.toLowerCase()) ||
    f.variety?.toLowerCase().includes(search.toLowerCase()) ||
    f.userProvince?.toLowerCase().includes(search.toLowerCase())
  );

  // Summary stats
  const totalHa = fields.reduce((sum, f) => sum + (f.size || 0), 0);
  const activeFields = fields.filter(f => f.status === 'active').length;
  const harvestedFields = fields.filter(f => f.status === 'harvested').length;

  const varietyCounts = fields.reduce((acc, f) => {
    if (f.variety) acc[f.variety] = (acc[f.variety] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-bold text-gray-900">Farm Fields</h1>
            <p className="text-gray-500 text-sm mt-1">{fields.length} registered fields across all users</p>
          </div>
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text" placeholder="Search fields..." value={search}
              onChange={e => setSearch(e.target.value)} className="input pl-9 w-64" />
          </div>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="card p-4">
            <p className="text-xs text-gray-500">Total Area</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{totalHa.toFixed(1)} ha</p>
          </div>
          <div className="card p-4">
            <p className="text-xs text-gray-500">Active Fields</p>
            <p className="text-2xl font-bold text-[#2E7D32] mt-1">{activeFields}</p>
          </div>
          <div className="card p-4">
            <p className="text-xs text-gray-500">Harvested</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{harvestedFields}</p>
          </div>
          <div className="card p-4">
            <p className="text-xs text-gray-500">Top Variety</p>
            <p className="text-sm font-bold text-gray-900 mt-1 truncate">
              {(Object.entries(varietyCounts) as [string, number][]).sort((a,b)=>b[1] - a[1])[0]?.[0] || '-'}
            </p>
          </div>
        </div>

        {/* Variety breakdown */}
        {Object.keys(varietyCounts).length > 0 && (
          <div className="card p-5">
            <h3 className="font-semibold text-gray-900 mb-3">Fields by Variety</h3>
            <div className="space-y-2">
              {(Object.entries(varietyCounts) as [string, number][]).sort((a, b) => b[1] - a[1]).map(([variety, count]) => (
        <div key={variety} className="flex items-center gap-3">
            <span className="text-sm text-gray-600 w-40 truncate">{variety}</span>
                <div className="flex-1 bg-gray-100 rounded-full h-2">
                <div
                    className="bg-[#2E7D32] h-2 rounded-full"
                    style={{ width: `${(count / fields.length) * 100}%` }}
                    />
                </div>
                <span className="text-sm font-medium text-gray-900 w-8 text-right">{count}</span>
            </div>
            ))}
            </div>
          </div>
        )}

        {/* Fields table */}
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {['Field', 'Farmer', 'Province', 'Variety', 'Size', 'Irrigation', 'Stage', 'Progress', 'Status'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-gray-500 font-medium text-xs uppercase tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loading ? (
                  <tr><td colSpan={9} className="py-12 text-center text-gray-400">Loading fields...</td></tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-12 text-center">
                      <Sprout size={32} className="mx-auto text-gray-200 mb-2" />
                      <p className="text-gray-400">No fields found</p>
                    </td>
                  </tr>
                ) : filtered.map((field) => {
                  const stage = getGrowthStage(field.plantingDate);
                  const progress = getProgress(field.plantingDate);
                  return (
                    <tr key={`${field.userId}-${field.id}`} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 font-medium text-gray-900">{field.name || '—'}</td>
                      <td className="px-4 py-3 text-gray-600">{field.userName}</td>
                      <td className="px-4 py-3 text-gray-500">{field.userProvince}</td>
                      <td className="px-4 py-3 text-gray-600">{field.variety || '—'}</td>
                      <td className="px-4 py-3 text-gray-600">{field.size} ha</td>
                      <td className="px-4 py-3 text-gray-500">{field.irrigationType || '—'}</td>
                      <td className="px-4 py-3">
                        <span className={stageColor[stage] || 'badge-gray'}>{stage}</span>
                      </td>
                      <td className="px-4 py-3 w-32">
                        <div className="bg-gray-100 rounded-full h-1.5">
                          <div className="bg-[#2E7D32] h-1.5 rounded-full" style={{ width: `${progress}%` }} />
                        </div>
                        <span className="text-xs text-gray-400">{progress.toFixed(0)}%</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={field.status === 'harvested' ? 'badge-gray' : 'badge-green'}>
                          {field.status || 'active'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
