'use client';

import { useEffect, useState } from 'react';
import { collection, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import AdminLayout from '@/components/AdminLayout';
import { Search, Shield, Trash2, ChevronDown } from 'lucide-react';

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [updating, setUpdating] = useState<string | null>(null);

  const fetchUsers = async () => {
    const snap = await getDocs(collection(db, 'users'));
    setUsers(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    setLoading(false);
  };

  useEffect(() => { fetchUsers(); }, []);

  const filtered = users.filter(u =>
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase()) ||
    u.province?.toLowerCase().includes(search.toLowerCase())
  );

  const toggleRole = async (userId: string, currentRole: string) => {
    setUpdating(userId);
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    await updateDoc(doc(db, 'users', userId), { role: newRole });
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
    setUpdating(null);
  };

  const deleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    await deleteDoc(doc(db, 'users', userId));
    setUsers(prev => prev.filter(u => u.id !== userId));
  };

  const getGrowthStage = (plantingDate: any) => {
    if (!plantingDate?.toDate) return '—';
    const dap = Math.floor((Date.now() - plantingDate.toDate().getTime()) / 86400000);
    if (dap <= 14) return 'Germination';
    if (dap <= 30) return 'Seedling';
    if (dap <= 60) return 'Vegetative';
    if (dap <= 90) return 'Bulbing';
    if (dap <= 110) return 'Maturation';
    return 'Harvest';
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-bold text-gray-900">Users</h1>
            <p className="text-gray-500 text-sm mt-1">{users.length} registered users</p>
          </div>
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search users..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input pl-9 w-64"
            />
          </div>
        </div>

        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {['Name', 'Email', 'Province', 'Farm', 'Growth Stage', 'Role', 'Actions'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-gray-500 font-medium text-xs uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loading ? (
                  <tr><td colSpan={7} className="py-12 text-center text-gray-400">Loading users...</td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={7} className="py-12 text-center text-gray-400">No users found</td></tr>
                ) : filtered.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-[#2E7D32] rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-white text-xs font-bold">
                            {(user.name || user.email || '?')[0].toUpperCase()}
                          </span>
                        </div>
                        <span className="font-medium text-gray-900">{user.name || '—'}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-500">{user.email || '—'}</td>
                    <td className="px-4 py-3 text-gray-500">{user.province || '—'}</td>
                    <td className="px-4 py-3">
                      {user.farm ? (
                        <div>
                          <p className="text-gray-900">{user.farm.onionVariety || '—'}</p>
                          <p className="text-gray-400 text-xs">{user.farm.size} ha · {user.farm.irrigationType}</p>
                        </div>
                      ) : <span className="text-gray-400">—</span>}
                    </td>
                    <td className="px-4 py-3">
                      {user.farm?.plantingDate ? (
                        <span className="badge-green">{getGrowthStage(user.farm.plantingDate)}</span>
                      ) : <span className="text-gray-400">—</span>}
                    </td>
                    <td className="px-4 py-3">
                      <span className={user.role === 'admin' ? 'badge-green' : 'badge-gray'}>
                        {user.role || 'user'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => toggleRole(user.id, user.role || 'user')}
                          disabled={updating === user.id}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-[#2E7D32] hover:bg-green-50 transition-colors"
                          title={user.role === 'admin' ? 'Remove admin' : 'Make admin'}
                        >
                          <Shield size={16} />
                        </button>
                        <button
                          onClick={() => deleteUser(user.id)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                          title="Delete user"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
