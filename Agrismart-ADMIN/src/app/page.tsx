'use client';

import { useEffect, useState } from 'react';
import { collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import AdminLayout from '@/components/AdminLayout';
import { Users, Bell, Sprout, AlertTriangle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

interface Stats {
  totalUsers: number;
  activeAlerts: number;
  totalFields: number;
  newUsersThisWeek: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    activeAlerts: 0,
    totalFields: 0,
    newUsersThisWeek: 0,
  });
  const [recentUsers, setRecentUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersSnap, alertsSnap] = await Promise.all([
          getDocs(collection(db, 'users')),
          getDocs(query(collection(db, 'alerts'), where('active', '==', true))),
        ]);

        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

        const users = usersSnap.docs.map(d => ({ id: d.id, ...d.data() }));
        const newUsers = users.filter((u: any) =>
          u.updatedAt?.toDate?.() > oneWeekAgo
        );

        setStats({
          totalUsers: usersSnap.size,
          activeAlerts: alertsSnap.size,
          totalFields: 0, // aggregated below
          newUsersThisWeek: newUsers.length,
        });

        setRecentUsers(users.slice(0, 5));
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const statCards = [
    { label: 'Total Users', value: stats.totalUsers, icon: Users, color: 'bg-blue-50 text-blue-600', change: `+${stats.newUsersThisWeek} this week` },
    { label: 'Active Alerts', value: stats.activeAlerts, icon: Bell, color: 'bg-orange-50 text-orange-600', change: 'Across all regions' },
    { label: 'Total Fields', value: stats.totalFields, icon: Sprout, color: 'bg-green-50 text-green-700', change: 'Registered farms' },
    { label: 'New This Week', value: stats.newUsersThisWeek, icon: AlertTriangle, color: 'bg-purple-50 text-purple-600', change: 'User registrations' },
  ];

  // Mock chart data — replace with real Firestore data as needed
  const userGrowth = [
    { month: 'Jan', users: 12 },
    { month: 'Feb', users: 24 },
    { month: 'Mar', users: 31 },
    { month: 'Apr', users: 45 },
    { month: 'May', users: 67 },
    { month: 'Jun', users: 89 },
  ];

  const fieldsByVariety = [
    { variety: 'Red Creole', count: 42 },
    { variety: 'Yellow Granex', count: 28 },
    { variety: 'White Onion', count: 19 },
    { variety: 'Red Pinoy', count: 35 },
    { variety: 'Shallots', count: 15 },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">Welcome back. Here's what's happening.</p>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {statCards.map(({ label, value, icon: Icon, color, change }) => (
            <div key={label} className="card p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-500 font-medium">{label}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">
                    {loading ? '—' : value}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">{change}</p>
                </div>
                <div className={`p-2.5 rounded-xl ${color}`}>
                  <Icon size={20} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* User growth */}
          <div className="card p-6">
            <h3 className="font-semibold text-gray-900 mb-4">User Growth</h3>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={userGrowth}>
                <XAxis dataKey="month" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="users"
                  stroke="#2E7D32"
                  strokeWidth={2}
                  dot={{ fill: '#2E7D32', strokeWidth: 0, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Fields by variety */}
          <div className="card p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Fields by Onion Variety</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={fieldsByVariety} layout="vertical">
                <XAxis type="number" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis dataKey="variety" type="category" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} width={90} />
                <Tooltip />
                <Bar dataKey="count" fill="#2E7D32" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent users */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Recent Users</h3>
            <a href="/users" className="text-sm text-[#2E7D32] hover:underline font-medium">View all</a>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-2 text-gray-500 font-medium">Name</th>
                  <th className="text-left py-2 text-gray-500 font-medium">Email</th>
                  <th className="text-left py-2 text-gray-500 font-medium">Province</th>
                  <th className="text-left py-2 text-gray-500 font-medium">Role</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={4} className="py-8 text-center text-gray-400">Loading...</td></tr>
                ) : recentUsers.length === 0 ? (
                  <tr><td colSpan={4} className="py-8 text-center text-gray-400">No users yet</td></tr>
                ) : recentUsers.map((user: any) => (
                  <tr key={user.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="py-3 font-medium text-gray-900">{user.name || '—'}</td>
                    <td className="py-3 text-gray-500">{user.email || '—'}</td>
                    <td className="py-3 text-gray-500">{user.province || '—'}</td>
                    <td className="py-3">
                      <span className={user.role === 'admin' ? 'badge-green' : 'badge-gray'}>
                        {user.role || 'user'}
                      </span>
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
