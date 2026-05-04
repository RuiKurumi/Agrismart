'use client';

import { useEffect, useState } from 'react';
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  addDoc,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import AdminLayout from '@/components/AdminLayout';
import { Search, Shield, Trash2 } from 'lucide-react';

type TabType = 'pending' | 'approved' | 'rejected';

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [updating, setUpdating] = useState<string | null>(null);
  const [tab, setTab] = useState<TabType>('pending');

  const fetchUsers = async () => {
    const snap = await getDocs(collection(db, 'users'));
    setUsers(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const logAction = async (
    userId: string,
    action: 'approved' | 'rejected'
  ) => {
    await addDoc(collection(db, 'auditLogs'), {
      userId,
      action,
      performedBy: 'admin', // replace with auth.user.uid if needed
      timestamp: serverTimestamp(),
    });
  };

  const approveUser = async (userId: string) => {
    setUpdating(userId);

    await updateDoc(doc(db, 'users', userId), {
      role: 'admin',
    });

    await logAction(userId, 'approved');

    setUsers(prev =>
      prev.map(u =>
        u.id === userId ? { ...u, role: 'admin' } : u
      )
    );

    setUpdating(null);
  };

  const rejectUser = async (userId: string) => {
    if (!confirm('Reject this user?')) return;

    setUpdating(userId);

    await updateDoc(doc(db, 'users', userId), {
      role: 'rejected',
    });

    await logAction(userId, 'rejected');

    setUsers(prev =>
      prev.map(u =>
        u.id === userId ? { ...u, role: 'rejected' } : u
      )
    );

    setUpdating(null);
  };

  const deleteUser = async (userId: string) => {
    if (!confirm('Delete this user permanently?')) return;

    await deleteDoc(doc(db, 'users', userId));
    setUsers(prev => prev.filter(u => u.id !== userId));
  };

  const filteredUsers = users
    .filter(u => u.role === tab)
    .filter(u =>
      (u.name || '').toLowerCase().includes(search.toLowerCase()) ||
      (u.email || '').toLowerCase().includes(search.toLowerCase()) ||
      (u.province || '').toLowerCase().includes(search.toLowerCase())
    );

  return (
    <AdminLayout>
      <div className="space-y-6">

        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-bold text-gray-900">
              User Approvals
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              Manage pending and approved users
            </p>
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

        {/* TABS */}
        <div className="flex gap-2">
          {(['pending', 'approved', 'rejected'] as TabType[]).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                tab === t
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {t.toUpperCase()}
            </button>
          ))}
        </div>

        {/* TABLE */}
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">

              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {['Name', 'Email', 'Province', 'Role', 'Actions'].map(h => (
                    <th
                      key={h}
                      className="text-left px-4 py-3 text-gray-500 font-medium text-xs uppercase"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-50">

                {loading ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-gray-400">
                      Loading users...
                    </td>
                  </tr>
                ) : filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-gray-400">
                      No {tab} users found
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map(user => (
                    <tr key={user.id} className="hover:bg-gray-50">

                      <td className="px-4 py-3 font-medium text-gray-900">
                        {user.name || '—'}
                      </td>

                      <td className="px-4 py-3 text-gray-500">
                        {user.email || '—'}
                      </td>

                      <td className="px-4 py-3 text-gray-500">
                        {user.province || '—'}
                      </td>

                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 text-xs rounded-lg ${
                          user.role === 'admin'
                            ? 'bg-green-100 text-green-700'
                            : user.role === 'rejected'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {user.role}
                        </span>
                      </td>

                      <td className="px-4 py-3">
                        <div className="flex gap-2">

                          {tab === 'pending' && (
                            <>
                              <button
                                onClick={() => approveUser(user.id)}
                                disabled={updating === user.id}
                                className="p-1.5 hover:text-green-600"
                              >
                                <Shield size={16} />
                              </button>

                              <button
                                onClick={() => rejectUser(user.id)}
                                disabled={updating === user.id}
                                className="p-1.5 hover:text-red-500"
                              >
                                <Trash2 size={16} />
                              </button>
                            </>
                          )}

                          {tab === 'approved' && (
                            <button
                              onClick={() => rejectUser(user.id)}
                              className="text-red-500 text-xs"
                            >
                              Revoke
                            </button>
                          )}

                          {tab === 'rejected' && (
                            <button
                              onClick={() => approveUser(user.id)}
                              className="text-green-600 text-xs"
                            >
                              Restore
                            </button>
                          )}

                          <button
                            onClick={() => deleteUser(user.id)}
                            className="text-gray-400 text-xs"
                          >
                            Delete
                          </button>

                        </div>
                      </td>

                    </tr>
                  ))
                )}

              </tbody>
            </table>
          </div>
        </div>

      </div>
    </AdminLayout>
  );
}
