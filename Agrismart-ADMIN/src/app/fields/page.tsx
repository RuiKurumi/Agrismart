'use client';

import { useEffect, useState, useMemo } from 'react';
import { collection, getDocs, doc, updateDoc, deleteDoc, addDoc, serverTimestamp, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/lib/auth-context';
import AdminLayout from '@/components/AdminLayout';
import dynamic from 'next/dynamic';
import { Sprout, Search, Pencil, Trash2, Send, Eye, X, Save, Bell, MapPin, RefreshCw, Filter } from 'lucide-react';

const FarmHeatmap = dynamic(() => import('@/components/FarmHeatmap'), { ssr: false, loading: () => <div className="card p-8 text-center text-sm text-gray-400">Loading heatmap…</div> });

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

const irrigationOptions = ['Irrigated', 'Rainfed', 'Drip', 'Sprinkler', 'Furrow', '—'];
const statusOptions = ['active', 'harvested', 'fallow', 'abandoned'];
const severityOptions = ['low', 'medium', 'high'] as const;

export default function FieldsPage() {
  const { user: adminUser } = useAuth();
  const [fields, setFields] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterVariety, setFilterVariety] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterIrrigation, setFilterIrrigation] = useState('all');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  // modals
  const [viewField, setViewField] = useState<any | null>(null);
  const [editField, setEditField] = useState<any | null>(null);
  const [editForm, setEditForm] = useState({ name: '', variety: '', size: '', irrigationType: '', status: 'active', plantingDate: '' });
  const [notifyField, setNotifyField] = useState<any | null>(null);
  const [notifyForm, setNotifyForm] = useState({ title: '', message: '', severity: 'medium' as typeof severityOptions[number] });
  const [deleteField, setDeleteField] = useState<any | null>(null);

  const showToast = (type: 'success' | 'error', msg: string) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchFields = async () => {
    setLoading(true);
    try {
      const usersSnap = await getDocs(collection(db, 'users'));
      const allFields: any[] = [];
      await Promise.all(usersSnap.docs.map(async (userDoc) => {
        const userData = userDoc.data() as any;
        const fieldsSnap = await getDocs(collection(db, 'users', userDoc.id, 'fields'));
        fieldsSnap.docs.forEach(fieldDoc => {
          allFields.push({
            id: fieldDoc.id,
            userId: userDoc.id,
            userName: userData.name || userData.fullName || userData.email || 'Unknown',
            userEmail: userData.email || '',
            userProvince: userData.province || '—',
            userPhone: userData.phone || userData.phoneNumber || '',
            ...fieldDoc.data(),
          });
        });
      }));
      setFields(allFields);
    } catch (e) {
      console.error(e);
      showToast('error', 'Failed to load fields');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchFields(); }, []);

  const varieties = useMemo(() => Array.from(new Set(fields.map(f => f.variety).filter(Boolean))).sort(), [fields]);

  const filtered = useMemo(() => fields.filter(f => {
    const q = search.toLowerCase();
    const matchesSearch = !q || f.name?.toLowerCase().includes(q) || f.userName?.toLowerCase().includes(q) || f.variety?.toLowerCase().includes(q) || f.userProvince?.toLowerCase().includes(q) || f.userEmail?.toLowerCase().includes(q);
    const matchesVariety = filterVariety === 'all' || f.variety === filterVariety;
    const matchesStatus = filterStatus === 'all' || (f.status || 'active') === filterStatus;
    const matchesIrrigation = filterIrrigation === 'all' || (f.irrigationType || '—') === filterIrrigation;
    return matchesSearch && matchesVariety && matchesStatus && matchesIrrigation;
  }), [fields, search, filterVariety, filterStatus, filterIrrigation]);

  const totalHa = fields.reduce((sum, f) => sum + (Number(f.size) || 0), 0);
  const activeFields = fields.filter(f => (f.status || 'active') === 'active').length;
  const harvestedFields = fields.filter(f => f.status === 'harvested').length;
  const varietyCounts = fields.reduce((acc, f) => {
    if (f.variety) acc[f.variety] = (acc[f.variety] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // --- Edit ---
  const openEdit = (field: any) => {
    setEditField(field);
    const dt = field.plantingDate?.toDate ? field.plantingDate.toDate().toISOString().slice(0, 10) : '';
    setEditForm({
      name: field.name || '',
      variety: field.variety || '',
      size: String(field.size ?? ''),
      irrigationType: field.irrigationType || '',
      status: field.status || 'active',
      plantingDate: dt,
    });
  };

  const saveEdit = async () => {
    if (!editField) return;
    if (!editForm.name.trim()) { showToast('error', 'Field name is required'); return; }
    setActionLoading(`edit-${editField.id}`);
    try {
      const ref = doc(db, 'users', editField.userId, 'fields', editField.id);
      const payload: any = {
        name: editForm.name.trim(),
        variety: editForm.variety.trim(),
        size: editForm.size ? Number(editForm.size) : 0,
        irrigationType: editForm.irrigationType.trim(),
        status: editForm.status,
        updatedAt: serverTimestamp(),
        updatedBy: adminUser?.uid || 'admin',
      };
      if (editForm.plantingDate) {
        payload.plantingDate = Timestamp.fromDate(new Date(editForm.plantingDate));
      }
      await updateDoc(ref, payload);
      setFields(prev => prev.map(f => f.id === editField.id && f.userId === editField.userId ? { ...f, ...payload, plantingDate: payload.plantingDate || f.plantingDate } : f));
      showToast('success', `Updated "${editForm.name}"`);
      setEditField(null);
    } catch (e: any) {
      console.error(e);
      showToast('error', e.message || 'Failed to update field');
    } finally {
      setActionLoading(null);
    }
  };

  // --- Delete ---
  const confirmDelete = async () => {
    if (!deleteField) return;
    setActionLoading(`del-${deleteField.id}`);
    try {
      await deleteDoc(doc(db, 'users', deleteField.userId, 'fields', deleteField.id));
      setFields(prev => prev.filter(f => !(f.id === deleteField.id && f.userId === deleteField.userId)));
      showToast('success', `Removed "${deleteField.name || deleteField.id}"`);
      setDeleteField(null);
    } catch (e: any) {
      console.error(e);
      showToast('error', e.message || 'Failed to remove farm');
    } finally {
      setActionLoading(null);
    }
  };

  // --- Notify owner ---
  const openNotify = (field: any) => {
    setNotifyField(field);
    setNotifyForm({
      title: `Update for ${field.name || 'your farm'}`,
      message: `Hi ${field.userName}, `,
      severity: 'medium',
    });
  };

  const sendNotification = async () => {
    if (!notifyField) return;
    if (!notifyForm.title.trim() || !notifyForm.message.trim()) { showToast('error', 'Title and message are required'); return; }
    setActionLoading(`notify-${notifyField.id}`);
    try {
      const base = {
        title: notifyForm.title.trim(),
        subtitle: notifyForm.message.trim(),
        message: notifyForm.message.trim(),
        severity: notifyForm.severity,
        type: 'admin',
        location: notifyField.name || '',
        farmId: notifyField.id,
        farmName: notifyField.name || '',
        fieldId: notifyField.id,
        province: notifyField.userProvince || '',
        read: false,
        active: true,
        autoGenerated: false,
        fromAdmin: true,
        fromAdminId: adminUser?.uid || null,
        fromAdminEmail: adminUser?.email || null,
        createdAt: serverTimestamp(),
        targetUserId: notifyField.userId,
      };
      // Owner-scoped alerts (mobile app listens to collectionGroup alerts)
      await addDoc(collection(db, 'users', notifyField.userId, 'alerts'), base);
      // Owner notifications inbox
      try {
        await addDoc(collection(db, 'users', notifyField.userId, 'notifications'), base);
      } catch {}
      // Global audit for admin visibility
      try {
        await addDoc(collection(db, 'adminNotifications'), { ...base, userId: notifyField.userId, userName: notifyField.userName, userEmail: notifyField.userEmail });
      } catch {}
      showToast('success', `Notification sent to ${notifyField.userName}`);
      setNotifyField(null);
    } catch (e: any) {
      console.error(e);
      showToast('error', e.message || 'Failed to send notification');
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {toast && (
          <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl shadow-lg text-sm font-medium flex items-center gap-2 ${toast.type === 'success' ? 'bg-[#2E7D32] text-white' : 'bg-red-600 text-white'}`}>
            {toast.type === 'success' ? <Bell size={16} /> : <X size={16} />} {toast.msg}
          </div>
        )}

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-bold text-gray-900">Farm Fields</h1>
            <p className="text-gray-500 text-sm mt-1">{fields.length} registered farms across all users · Manage, notify owners, or remove farms</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={fetchFields} disabled={loading} className="btn-secondary flex items-center gap-2">
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} /> Refresh
            </button>
          </div>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="card p-4">
            <p className="text-xs text-gray-500">Total Area</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{totalHa.toFixed(1)} ha</p>
            <p className="text-xs text-gray-400">{fields.length} farms</p>
          </div>
          <div className="card p-4">
            <p className="text-xs text-gray-500">Active Farms</p>
            <p className="text-2xl font-bold text-[#2E7D32] mt-1">{activeFields}</p>
            <p className="text-xs text-gray-400">Harvest-ready: {fields.filter(f => getGrowthStage(f.plantingDate) === 'Ready for Harvest').length}</p>
          </div>
          <div className="card p-4">
            <p className="text-xs text-gray-500">Harvested</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{harvestedFields}</p>
            <p className="text-xs text-gray-400">Marked harvested</p>
          </div>
          <div className="card p-4">
            <p className="text-xs text-gray-500">Top Variety</p>
            <p className="text-sm font-bold text-gray-900 mt-1 truncate">
              {(Object.entries(varietyCounts) as [string, number][]).sort((a,b)=>b[1] - a[1])[0]?.[0] || '-'}
            </p>
            <p className="text-xs text-gray-400">{varieties.length} varieties total</p>
          </div>
        </div>

        {/* Variety breakdown */}
        {Object.keys(varietyCounts).length > 0 && (
          <div className="card p-5">
            <h3 className="font-semibold text-gray-900 mb-3">Farms by Variety</h3>
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

        {/* Farm Density Heatmap */}
        {!loading && fields.length > 0 && (
          <FarmHeatmap fields={filtered} />
        )}
        {loading && (
          <div className="card p-8 text-center text-sm text-gray-400">Loading farm distribution…</div>
        )}

        {/* Filters */}
        <div className="card p-4 flex flex-col lg:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text" placeholder="Search farm, farmer, email, variety, province..." value={search}
              onChange={e => setSearch(e.target.value)} className="input pl-9 w-full" />
          </div>
          <div className="flex flex-wrap gap-2">
            <div className="relative">
              <Filter size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <select value={filterVariety} onChange={e => setFilterVariety(e.target.value)} className="input pl-7 pr-8 py-2 text-sm">
                <option value="all">All Varieties</option>
                {varieties.map(v => <option key={v} value={v}>{v}</option>)}
              </select>
            </div>
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="input py-2 text-sm">
              <option value="all">All Status</option>
              {statusOptions.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <select value={filterIrrigation} onChange={e => setFilterIrrigation(e.target.value)} className="input py-2 text-sm">
              <option value="all">All Irrigation</option>
              {irrigationOptions.filter(o=>o!=='—').map(o => <option key={o} value={o}>{o}</option>)}
            </select>
            {(filterVariety !== 'all' || filterStatus !== 'all' || filterIrrigation !== 'all' || search) && (
              <button onClick={() => { setSearch(''); setFilterVariety('all'); setFilterStatus('all'); setFilterIrrigation('all'); }} className="btn-secondary text-sm">Clear</button>
            )}
          </div>
        </div>
        <p className="text-xs text-gray-400 -mt-2">Showing {filtered.length} of {fields.length} farms</p>

        {/* Fields table */}
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {['Field', 'Farmer', 'Province', 'Variety', 'Size', 'Irrigation', 'Stage', 'Progress', 'Status', 'Actions'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-gray-500 font-medium text-xs uppercase tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loading ? (
                  <tr><td colSpan={10} className="py-12 text-center text-gray-400">Loading fields...</td></tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="py-12 text-center">
                      <Sprout size={32} className="mx-auto text-gray-200 mb-2" />
                      <p className="text-gray-400">No farms found</p>
                      <p className="text-xs text-gray-400 mt-1">Try adjusting search or filters</p>
                    </td>
                  </tr>
                ) : filtered.map((field) => {
                  const stage = getGrowthStage(field.plantingDate);
                  const progress = getProgress(field.plantingDate);
                  return (
                    <tr key={`${field.userId}-${field.id}`} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 font-medium text-gray-900">
                        <div>{field.name || '—'}</div>
                        <div className="text-xs text-gray-400 font-normal truncate max-w-[160px]">{field.id.slice(0, 8)}…</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-gray-900 font-medium">{field.userName}</div>
                        <div className="text-xs text-gray-400 truncate max-w-[160px]">{field.userEmail}</div>
                      </td>
                      <td className="px-4 py-3 text-gray-500">{field.userProvince}</td>
                      <td className="px-4 py-3 text-gray-600">{field.variety || '—'}</td>
                      <td className="px-4 py-3 text-gray-600">{field.size != null ? `${field.size} ha` : '—'}</td>
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
                        <span className={field.status === 'harvested' ? 'badge-gray' : field.status === 'fallow' ? 'badge-yellow' : 'badge-green'}>
                          {field.status || 'active'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button onClick={() => setViewField(field)} title="View details" className="p-1.5 rounded-lg text-gray-400 hover:text-gray-900 hover:bg-gray-100">
                            <Eye size={16} />
                          </button>
                          <button onClick={() => openEdit(field)} title="Manage / Edit" className="p-1.5 rounded-lg text-gray-400 hover:text-[#2E7D32] hover:bg-green-50">
                            <Pencil size={16} />
                          </button>
                          <button onClick={() => openNotify(field)} title="Send notification to owner" className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50">
                            <Send size={16} />
                          </button>
                          <button onClick={() => setDeleteField(field)} title="Remove farm" className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* View modal */}
      {viewField && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setViewField(null)} />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[85vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between rounded-t-2xl">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2"><Sprout size={18} className="text-[#2E7D32]" /> {viewField.name || 'Farm Details'}</h3>
              <button onClick={() => setViewField(null)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400"><X size={18} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><p className="text-xs text-gray-500">Farmer</p><p className="font-medium">{viewField.userName}</p><p className="text-xs text-gray-400">{viewField.userEmail}</p><p className="text-xs text-gray-400">{viewField.userPhone || ''}</p></div>
                <div><p className="text-xs text-gray-500">Province</p><p className="font-medium flex items-center gap-1"><MapPin size={12} />{viewField.userProvince}</p></div>
                <div><p className="text-xs text-gray-500">Variety</p><p className="font-medium">{viewField.variety || '—'}</p></div>
                <div><p className="text-xs text-gray-500">Size</p><p className="font-medium">{viewField.size ?? '—'} ha</p></div>
                <div><p className="text-xs text-gray-500">Irrigation</p><p className="font-medium">{viewField.irrigationType || '—'}</p></div>
                <div><p className="text-xs text-gray-500">Status</p><p><span className={viewField.status === 'harvested' ? 'badge-gray' : 'badge-green'}>{viewField.status || 'active'}</span></p></div>
                <div><p className="text-xs text-gray-500">Growth Stage</p><p><span className={stageColor[getGrowthStage(viewField.plantingDate)] || 'badge-gray'}>{getGrowthStage(viewField.plantingDate)}</span></p></div>
                <div><p className="text-xs text-gray-500">Planting Date</p><p className="font-medium">{viewField.plantingDate?.toDate ? viewField.plantingDate.toDate().toLocaleDateString() : '—'}</p></div>
                <div className="col-span-2"><p className="text-xs text-gray-500">Field ID</p><p className="font-mono text-xs break-all">{viewField.userId}/{viewField.id}</p></div>
                {viewField.location && <div className="col-span-2"><p className="text-xs text-gray-500">Location</p><p className="text-sm">{typeof viewField.location === 'string' ? viewField.location : JSON.stringify(viewField.location)}</p></div>}
                {viewField.notes && <div className="col-span-2"><p className="text-xs text-gray-500">Notes</p><p className="text-sm text-gray-600">{viewField.notes}</p></div>}
              </div>
              <div className="flex gap-2 pt-2">
                <button onClick={() => { setViewField(null); openEdit(viewField); }} className="btn-primary flex items-center gap-2"><Pencil size={14} /> Manage</button>
                <button onClick={() => { setViewField(null); openNotify(viewField); }} className="btn-secondary flex items-center gap-2"><Send size={14} /> Notify Owner</button>
                <button onClick={() => setViewField(null)} className="btn-secondary ml-auto">Close</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit modal */}
      {editField && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setEditField(null)} />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between rounded-t-2xl">
              <h3 className="font-semibold text-gray-900">Manage Farm — {editField.name}</h3>
              <button onClick={() => setEditField(null)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400"><X size={18} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 flex gap-2">
                <MapPin size={14} className="text-amber-600 mt-0.5 shrink-0" />
                <p className="text-xs text-amber-800">Owner: <span className="font-semibold">{editField.userName}</span> ({editField.userEmail}) · Will update <span className="font-mono text-xs">{editField.userId}/{editField.id}</span></p>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Farm Name *</label>
                <input className="input" value={editForm.name} onChange={e => setEditForm(p => ({ ...p, name: e.target.value }))} placeholder="e.g. Sablayan Block A" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Variety</label>
                  <input className="input" value={editForm.variety} onChange={e => setEditForm(p => ({ ...p, variety: e.target.value }))} placeholder="Red Creole, Yellow Granex..." />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Size (ha)</label>
                  <input type="number" step="0.1" className="input" value={editForm.size} onChange={e => setEditForm(p => ({ ...p, size: e.target.value }))} placeholder="0.5" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Irrigation</label>
                  <select className="input" value={editForm.irrigationType} onChange={e => setEditForm(p => ({ ...p, irrigationType: e.target.value }))}>
                    <option value="">Select</option>
                    {irrigationOptions.filter(o=>o!=='—').map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Status</label>
                  <select className="input" value={editForm.status} onChange={e => setEditForm(p => ({ ...p, status: e.target.value }))}>
                    {statusOptions.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Planting Date</label>
                <input type="date" className="input" value={editForm.plantingDate} onChange={e => setEditForm(p => ({ ...p, plantingDate: e.target.value }))} />
                <p className="text-xs text-gray-400 mt-1">Stage auto-calculates from this date (0–110+ DAP)</p>
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={saveEdit} disabled={!!actionLoading} className="btn-primary flex items-center gap-2">
                  {actionLoading === `edit-${editField.id}` ? <RefreshCw size={14} className="animate-spin" /> : <Save size={14} />} Save Changes
                </button>
                <button onClick={() => setEditField(null)} className="btn-secondary">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Notify modal */}
      {notifyField && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setNotifyField(null)} />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between rounded-t-2xl">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2"><Send size={16} className="text-blue-600" /> Notify {notifyField.userName}</h3>
              <button onClick={() => setNotifyField(null)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400"><X size={18} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-3">
                <p className="text-xs text-blue-800">Farm: <span className="font-semibold">{notifyField.name}</span> · Farmer: <span className="font-semibold">{notifyField.userName}</span> ({notifyField.userProvince})</p>
                <p className="text-xs text-blue-600 mt-1">Delivers to <span className="font-mono">users/{notifyField.userId}/alerts</span> & <span className="font-mono">notifications</span> (mobile app inbox). Appears in Alerts via collectionGroup.</p>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Title *</label>
                <input className="input" value={notifyForm.title} onChange={e => setNotifyForm(p => ({ ...p, title: e.target.value }))} placeholder="e.g. Irrigation reminder for Sablayan Block A" maxLength={80} />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Message to owner *</label>
                <textarea className="input min-h-[96px] resize-y" value={notifyForm.message} onChange={e => setNotifyForm(p => ({ ...p, message: e.target.value }))} placeholder="Hi farmer, please check drainage before heavy rain forecast..." maxLength={400} />
                <p className="text-xs text-gray-400 mt-1">{notifyForm.message.length}/400</p>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Severity</label>
                <select className="input" value={notifyForm.severity} onChange={e => setNotifyForm(p => ({ ...p, severity: e.target.value as any }))}>
                  {severityOptions.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="flex gap-3">
                <button onClick={sendNotification} disabled={!!actionLoading} className="btn-primary flex items-center gap-2">
                  {actionLoading === `notify-${notifyField.id}` ? <RefreshCw size={14} className="animate-spin" /> : <Send size={14} />} Send to Owner
                </button>
                <button onClick={() => setNotifyField(null)} className="btn-secondary">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {deleteField && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setDeleteField(null)} />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-red-600"><Trash2 size={20} /></div>
            <h3 className="font-semibold text-center">Remove farm?</h3>
            <p className="text-sm text-gray-500 text-center mt-2">
              This will permanently delete <span className="font-semibold text-gray-900">“{deleteField.name}”</span> owned by <span className="font-semibold">{deleteField.userName}</span> ({deleteField.userProvince}). Readings subcollections will remain orphaned. This cannot be undone.
            </p>
            <p className="text-xs font-mono text-gray-400 text-center mt-2 break-all">{deleteField.userId}/{deleteField.id}</p>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setDeleteField(null)} className="btn-secondary flex-1">Cancel</button>
              <button onClick={confirmDelete} disabled={!!actionLoading} className="btn-danger flex-1 flex items-center justify-center gap-2">
                {actionLoading === `del-${deleteField.id}` ? <RefreshCw size={14} className="animate-spin" /> : <Trash2 size={14} />} Remove Farm
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
