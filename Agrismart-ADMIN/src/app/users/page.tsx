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
import { Search, Shield, Trash2, Download, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { exportUsersToCSV } from '@/lib/export';

type ModeType = 'requests' | 'users';

type AlertType = 'success' | 'error' | null;
interface AlertState {
  type: AlertType;
  message: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [updating, setUpdating] = useState<string | null>(null);
  const [mode, setMode] = useState<ModeType>('requests');
  const [alert, setAlert] = useState<AlertState>({ type: null, message: '' });
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    variant?: 'danger' | 'primary';
  }>({ open: false, title: '', message: '', onConfirm: () => {} });

  const fetchUsers = async () => {
    const snap = await getDocs(collection(db, 'users'));
    setUsers(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // ---------------------------
  // AUDIT LOG
  // ---------------------------
  const logAction = async (
    userId: string,
    action: 'approved' | 'rejected' | 'promoted' | 'revoked'
  ) => {
    await addDoc(collection(db, 'auditLogs'), {
      userId,
      action,
      performedBy: 'admin', // replace with auth.uid later
      timestamp: serverTimestamp(),
    });
  };

  // ---------------------------
  // REQUEST ACTIONS
  // ---------------------------
  const showConfirm = (title: string, message: string, onConfirm: () => void, variant?: 'danger' | 'primary') => {
    setConfirmDialog({ open: true, title, message, onConfirm, variant });
  };

  const showAlert = (type: 'success' | 'error', message: string) => {
    setAlert({ type, message });
    setTimeout(() => setAlert({ type: null, message: '' }), 4000);
  };

  const approveUser = async (userId: string) => {
    showConfirm(
      'Approve User',
      'Approve this user and grant them admin access?',
      async () => {
        setUpdating(userId);
        try {
          await updateDoc(doc(db, 'users', userId), { role: 'admin' });
          await logAction(userId, 'approved');
          setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: 'admin' } : u));
          showAlert('success', 'User approved and promoted to admin');
        } catch (e: any) {
          showAlert('error', e.message || 'Failed to approve user');
        } finally {
          setUpdating(null);
        }
      },
      'primary'
    );
  };

  const rejectUser = async (userId: string) => {
    showConfirm(
      'Reject User',
      'Reject this user? This will mark them as rejected.',
      async () => {
        setUpdating(userId);
        try {
          await updateDoc(doc(db, 'users', userId), { role: 'rejected' });
          await logAction(userId, 'rejected');
          setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: 'rejected' } : u));
          showAlert('success', 'User rejected');
        } catch (e: any) {
          showAlert('error', e.message || 'Failed to reject user');
        } finally {
          setUpdating(null);
        }
      },
      'danger'
    );
  };

  // ---------------------------
  // USER MANAGEMENT ACTIONS
  // ---------------------------
  const promoteUser = async (userId: string) => {
    showConfirm(
      'Promote to Admin',
      'Promote this user to admin? They will gain full admin access.',
      async () => {
        setUpdating(userId);
        try {
          await updateDoc(doc(db, 'users', userId), { role: 'admin' });
          await logAction(userId, 'promoted');
          setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: 'admin' } : u));
          showAlert('success', 'User promoted to admin');
        } catch (e: any) {
          showAlert('error', e.message || 'Failed to promote user');
        } finally {
          setUpdating(null);
        }
      },
      'primary'
    );
  };

  const revokeAdmin = async (userId: string) => {
    showConfirm(
      'Revoke Admin Access',
      'Revoke admin access for this user? They will become a regular user.',
      async () => {
        setUpdating(userId);
        try {
          await updateDoc(doc(db, 'users', userId), { role: 'user' });
          await logAction(userId, 'revoked');
          setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: 'user' } : u));
          showAlert('success', 'Admin access revoked');
        } catch (e: any) {
          showAlert('error', e.message || 'Failed to revoke admin access');
        } finally {
          setUpdating(null);
        }
      },
      'danger'
    );
  };

  const deleteUser = async (userId: string) => {
    showConfirm(
      'Delete User',
      'Permanently delete this user? This action cannot be undone.',
      async () => {
        try {
          await deleteDoc(doc(db, 'users', userId));
          setUsers(prev => prev.filter(u => u.id !== userId));
          showAlert('success', 'User deleted');
        } catch (e: any) {
          showAlert('error', e.message || 'Failed to delete user');
        }
      },
      'danger'
    );
  };

  // ---------------------------
  // FILTERING
  // ---------------------------
  const filteredUsers = users
    .filter(u => {
      if (mode === 'requests') return u.role === 'pending';
      return true;
    })
    .filter(u =>
      (u.name || '').toLowerCase().includes(search.toLowerCase()) ||
      (u.email || '').toLowerCase().includes(search.toLowerCase()) ||
      (u.province || '').toLowerCase().includes(search.toLowerCase())
    );

  return (
    <AdminLayout>
      {/* Alert Toast */}
      {alert.type && (
        <div className="fixed top-4 right-4 z-50 animate-slide-in flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg min-w-[280px] max-w-md
          ${alert.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}">
          {alert.type === 'success' ? (
            <CheckCircle size={20} className="shrink-0" />
          ) : (
            <AlertCircle size={20} className="shrink-0" />
          )}
          <span className="text-sm font-medium">{alert.message}</span>
        </div>
      )}

      {/* Confirmation Dialog */}
      {confirmDialog.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900">{confirmDialog.title}</h3>
            <p className="text-gray-600 mt-2 text-sm">{confirmDialog.message}</p>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setConfirmDialog({ ...confirmDialog, open: false })}
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  confirmDialog.onConfirm();
                  setConfirmDialog({ ...confirmDialog, open: false });
                }}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition ${
                  confirmDialog.variant === 'danger'
                    ? 'bg-red-600 text-white hover:bg-red-700'
                    : 'bg-primary text-white hover:bg-primary/90'
                }`}
              >
                {confirmDialog.variant === 'danger' ? 'Confirm' : 'Proceed'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-6">

        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-bold text-gray-900">
              User Management
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              Manage users and approval requests
            </p>
          </div>

          <div className="flex items-center gap-3">
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
            <button
              onClick={() => exportUsersToCSV(users)}
              className="btn-secondary flex items-center gap-2 whitespace-nowrap"
            >
              <Download size={16} /> Export CSV
            </button>
          </div>
        </div>

        {/* MODE SWITCH */}
        <div className="flex gap-2">
          <button
            onClick={() => setMode('requests')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              mode === 'requests'
                ? 'bg-primary text-white'
                : 'bg-gray-100 text-gray-600'
            }`}
          >
            Pending Requests
          </button>

          <button
            onClick={() => setMode('users')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              mode === 'users'
                ? 'bg-primary text-white'
                : 'bg-gray-100 text-gray-600'
            }`}
          >
            User Management
          </button>
        </div>

        {/* TABLE */}
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">

              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {['Name', 'Email', 'Province', 'Role', 'Actions'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-gray-500 text-xs uppercase">
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
                      No users found
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

                          {/* REQUEST MODE */}
                          {mode === 'requests' && (
                            <>
                              <button
                                onClick={() => approveUser(user.id)}
                                className="text-green-600"
                              >
                                <Shield size={16} />
                              </button>

                              <button
                                onClick={() => rejectUser(user.id)}
                                className="text-red-500"
                              >
                                <Trash2 size={16} />
                              </button>
                            </>
                          )}

                          {/* USER MODE */}
                          {mode === 'users' && (
                            <>
                              {user.role !== 'admin' ? (
                                <button
                                  onClick={() => promoteUser(user.id)}
                                  className="text-green-600 text-xs"
                                >
                                  Promote
                                </button>
                              ) : (
                                <button
                                  onClick={() => revokeAdmin(user.id)}
                                  className="text-yellow-600 text-xs"
                                >
                                  Revoke
                                </button>
                              )}

                              <button
                                onClick={() => deleteUser(user.id)}
                                className="text-gray-400 text-xs"
                              >
                                Delete
                              </button>
                            </>
                          )}

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
