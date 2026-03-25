'use client';

import { useEffect, useState } from 'react';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import AdminLayout from '@/components/AdminLayout';
import { Plus, Trash2, Edit2, BookOpen, Eye, EyeOff } from 'lucide-react';

const categories = ['Crop Management', 'Pest & Disease', 'Weather', 'Irrigation', 'Harvest', 'Market', 'General'];

export default function ArticlesPage() {
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ title: '', summary: '', content: '', category: 'General', imageUrl: '' });
  const [saving, setSaving] = useState(false);

  const fetchArticles = async () => {
    const snap = await getDocs(collection(db, 'articles'));
    setArticles(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    setLoading(false);
  };

  useEffect(() => { fetchArticles(); }, []);

  const openAdd = () => {
    setEditing(null);
    setForm({ title: '', summary: '', content: '', category: 'General', imageUrl: '' });
    setShowForm(true);
  };

  const openEdit = (article: any) => {
    setEditing(article);
    setForm({ title: article.title, summary: article.summary, content: article.content, category: article.category, imageUrl: article.imageUrl || '' });
    setShowForm(true);
  };

  const save = async () => {
    if (!form.title || !form.content) return;
    setSaving(true);
    try {
      if (editing) {
        await updateDoc(doc(db, 'articles', editing.id), { ...form, updatedAt: serverTimestamp() });
        setArticles(prev => prev.map(a => a.id === editing.id ? { ...a, ...form } : a));
      } else {
        const ref = await addDoc(collection(db, 'articles'), {
          ...form, published: false, createdAt: serverTimestamp(),
        });
        setArticles(prev => [...prev, { id: ref.id, ...form, published: false }]);
      }
      setShowForm(false);
    } finally {
      setSaving(false);
    }
  };

  const togglePublish = async (id: string, current: boolean) => {
    await updateDoc(doc(db, 'articles', id), { published: !current });
    setArticles(prev => prev.map(a => a.id === id ? { ...a, published: !current } : a));
  };

  const deleteArticle = async (id: string) => {
    if (!confirm('Delete this article?')) return;
    await deleteDoc(doc(db, 'articles', id));
    setArticles(prev => prev.filter(a => a.id !== id));
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold text-gray-900">Articles & Guides</h1>
            <p className="text-gray-500 text-sm mt-1">{articles.length} articles · {articles.filter(a => a.published).length} published</p>
          </div>
          <button onClick={openAdd} className="btn-primary flex items-center gap-2">
            <Plus size={16} /> New Article
          </button>
        </div>

        {/* Form */}
        {showForm && (
          <div className="card p-6">
            <h3 className="font-semibold text-gray-900 mb-4">{editing ? 'Edit Article' : 'New Article'}</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                  <input className="input" placeholder="Article title" value={form.title}
                    onChange={e => setForm(p => ({ ...p, title: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select className="input" value={form.category}
                    onChange={e => setForm(p => ({ ...p, category: e.target.value }))}>
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Summary</label>
                <input className="input" placeholder="Short description shown in the app" value={form.summary}
                  onChange={e => setForm(p => ({ ...p, summary: e.target.value }))} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
                <input className="input" placeholder="https://..." value={form.imageUrl}
                  onChange={e => setForm(p => ({ ...p, imageUrl: e.target.value }))} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Content *</label>
                <textarea className="input min-h-[200px] resize-y" placeholder="Write your article here..."
                  value={form.content} onChange={e => setForm(p => ({ ...p, content: e.target.value }))} />
              </div>
              <div className="flex gap-3">
                <button onClick={save} disabled={saving} className="btn-primary">
                  {saving ? 'Saving...' : editing ? 'Save Changes' : 'Create Article'}
                </button>
                <button onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
              </div>
            </div>
          </div>
        )}

        {/* Articles grid */}
        {loading ? (
          <div className="card p-8 text-center text-gray-400">Loading articles...</div>
        ) : articles.length === 0 ? (
          <div className="card p-16 text-center">
            <BookOpen size={48} className="mx-auto text-gray-200 mb-4" />
            <p className="text-gray-500">No articles yet. Create your first guide above.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {articles.map((article) => (
              <div key={article.id} className={`card p-5 flex flex-col ${!article.published ? 'opacity-70' : ''}`}>
                <div className="flex items-start justify-between mb-3">
                  <span className="badge-blue">{article.category}</span>
                  <div className="flex items-center gap-1">
                    <button onClick={() => togglePublish(article.id, article.published)}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-[#2E7D32] hover:bg-green-50 transition-colors"
                      title={article.published ? 'Unpublish' : 'Publish'}>
                      {article.published ? <Eye size={16} className="text-[#2E7D32]" /> : <EyeOff size={16} />}
                    </button>
                    <button onClick={() => openEdit(article)}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-blue-500 hover:bg-blue-50 transition-colors">
                      <Edit2 size={16} />
                    </button>
                    <button onClick={() => deleteArticle(article.id)}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{article.title}</h3>
                {article.summary && <p className="text-sm text-gray-500 line-clamp-3 flex-1">{article.summary}</p>}
                <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
                  <span className={article.published ? 'badge-green' : 'badge-gray'}>
                    {article.published ? 'Published' : 'Draft'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
