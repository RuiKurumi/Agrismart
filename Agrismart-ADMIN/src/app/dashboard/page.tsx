'use client';

import { useEffect, useState } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import AdminLayout from '@/components/AdminLayout';
import { Users, Bell, Sprout, AlertTriangle } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, LineChart, Line,
} from 'recharts';

interface Stats {
  totalUsers: number;
  activeAlerts: number;
  totalFields: number;
  newUsersThisWeek: number;
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    activeAlerts: 0,
    totalFields: 0,
    newUsersThisWeek: 0,
  });
  const [recentUsers, setRecentUsers] = useState<any[]>([]);
  const [userGrowth, setUserGrowth] = useState<{ month: string; users: number }[]>([]);
  const [fieldsByVariety, setFieldsByVariety] = useState<{ variety: string; count: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersSnap, alertsSnap] = await Promise.all([
          getDocs(collection(db, 'users')),
          getDocs(query(collection(db, 'alerts'), where('active', '==', true))),
        ]);

        const now = new Date();
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(now.getDate() - 7);

        const users = usersSnap.docs.map(d => ({ id: d.id, ...d.data() as any }));

        const newUsers = users.filter(u =>
          u.updatedAt?.toDate?.() > oneWeekAgo
        );

        // --- User Growth: count registrations per month for last 6 months ---
        const monthCounts: Record<string, number> = {};
        for (let i = 5; i >= 0; i--) {
          const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
          monthCounts[`${d.getFullYear()}-${d.getMonth()}`] = 0;
        }
        users.forEach(u => {
          const date = u.updatedAt?.toDate?.() as Date | undefined;
          if (!date) return;
          const key = `${date.getFullYear()}-${date.getMonth()}`;
          if (key in monthCounts) monthCounts[key]++;
        });
        const growthData = Object.entries(monthCounts).map(([key, count]) => {
          const [year, month] = key.split('-').map(Number);
          return { month: MONTHS[month], users: count };
        });
        setUserGrowth(growthData);

        // --- Fields by variety: iterate all users' fields subcollections ---
        let totalFields = 0;
        const varietyMap: Record<string, number> = {};
        await Promise.all(
          usersSnap.docs.map(async userDoc => {
            const fieldsSnap = await getDocs(
              collection(db, 'users', userDoc.id, 'fields')
            );
            totalFields += fieldsSnap.size;
            fieldsSnap.docs.forEach(fieldDoc => {
              const variety = (fieldDoc.data() as any).variety;
              if (variety) varietyMap[variety] = (varietyMap[variety] || 0) + 1;
            });
          })
        );

        const varietyData = Object.entries(varietyMap)
          .sort((a, b) => b[1] - a[1])
          .map(([variety, count]) => ({ variety, count }));
        setFieldsByVariety(varietyData);

        setStats({
          totalUsers: usersSnap.size,
          activeAlerts: alertsSnap.size,
          totalFields,
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
            <h3 className="font-semibold text-gray-900 mb-1">User Growth</h3>
            <p className="text-xs text-gray-400 mb-4">Registrations over the last 6 months</p>
            {loading ? (
              <div className="h-[200px] flex items-center justify-center text-gray-400 text-sm">Loading...</div>
            ) : userGrowth.every(d => d.users === 0) ? (
              <div className="h-[200px] flex items-center justify-center text-gray-400 text-sm">No registration data yet</div>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={userGrowth}>
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} allowDecimals={false} />
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
            )}
          </div>

          {/* Fields by variety */}
          <div className="card p-6">
            <h3 className="font-semibold text-gray-900 mb-1">Fields by Onion Variety</h3>
            <p className="text-xs text-gray-400 mb-4">Active fields across all farmers</p>
            {loading ? (
              <div className="h-[200px] flex items-center justify-center text-gray-400 text-sm">Loading...</div>
            ) : fieldsByVariety.length === 0 ? (
              <div className="h-[200px] flex items-center justify-center text-gray-400 text-sm">No field data yet</div>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={fieldsByVariety} layout="vertical">
                  <XAxis type="number" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <YAxis dataKey="variety" type="category" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} width={100} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#2E7D32" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
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
