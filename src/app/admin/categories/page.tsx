'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Loader2, Save, Trash2, Edit2, Folder, FolderTree, Plus, X } from 'lucide-react';

interface Category {
  id: number;
  name: string;
  slug: string;
  parent_id: number | null;
  parent_name: string | null;
}

export default function CategoryManager() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  
  const [formData, setFormData] = useState({ name: '', parent_id: '' });
  const [saving, setSaving] = useState(false);

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/admin/categories');
      const data = await res.json();
      setCategories(data.categories || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const openNewForm = () => {
    setEditingId(null);
    setFormData({ name: '', parent_id: '' });
    setIsFormOpen(true);
  };

  const openEditForm = (cat: Category) => {
    setEditingId(cat.id);
    setFormData({ name: cat.name, parent_id: cat.parent_id ? cat.parent_id.toString() : '' });
    setIsFormOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      const payload = {
        id: editingId,
        name: formData.name,
        parent_id: formData.parent_id ? parseInt(formData.parent_id) : null
      };

      const method = editingId ? 'PUT' : 'POST';
      const res = await fetch('/api/admin/categories', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save');
      
      await fetchCategories();
      setIsFormOpen(false);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this category? Any sub-categories will be unlinked.')) return;
    try {
      const res = await fetch(`/api/admin/categories?id=${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
      await fetchCategories();
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Group categories for Tree View
  const rootCategories = categories.filter(c => !c.parent_id);
  const getChildren = (parentId: number) => categories.filter(c => c.parent_id === parentId);

  if (loading) {
    return <div className="min-h-screen bg-background flex items-center justify-center"><Loader2 className="w-8 h-8 text-blue-500 animate-spin" /></div>;
  }

  return (
    <div className="relative min-h-screen bg-background text-foreground pb-24">
      {/* Background glow */}
      <div className="fixed top-0 right-1/4 w-200 h-125 bg-blue-600/10 rounded-full blur-[140px] pointer-events-none -z-10"></div>
      
      <header className="sticky top-0 z-50 bg-background/60 backdrop-blur-xl border-b border-border px-6 py-4 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-4">
          <Link href="/admin" className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2 font-bold text-sm">
            <ArrowLeft className="w-4 h-4" /> Back to Core
          </Link>
          <div className="h-4 w-px bg-muted mx-2 hidden sm:block"></div>
          <h1 className="font-black text-lg tracking-tighter hidden sm:block uppercase">Category Manager</h1>
        </div>
        <button 
          onClick={openNewForm}
          className="bg-blue-500 hover:bg-blue-400 text-black px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest flex items-center gap-2 transition-colors shadow-[0_0_15px_rgba(59,130,246,0.3)]"
        >
          <Plus className="w-4 h-4" /> New Category
        </button>
      </header>

      <div className="max-w-4xl mx-auto px-4 md:px-6 mt-12 relative z-10">
        
        {/* CRUD Form Modal/Overlay */}
        {isFormOpen && (
          <div className="fixed inset-0 z-60 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-background border border-border rounded-2xl w-full max-w-md p-6 shadow-2xl relative">
              <button onClick={() => setIsFormOpen(false)} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
              
              <h2 className="text-lg font-black uppercase tracking-widest mb-6 text-blue-400">
                {editingId ? 'Edit Category' : 'Create Category'}
              </h2>
              
              <form onSubmit={handleSave} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest pl-1">Name</label>
                  <input 
                    type="text" 
                    required
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-muted border border-border p-3 text-sm rounded-xl focus:border-blue-500 outline-none"
                    placeholder="e.g. Politics"
                  />
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest pl-1">Parent Category (Optional)</label>
                  <select
                    value={formData.parent_id}
                    onChange={e => setFormData({ ...formData, parent_id: e.target.value })}
                    className="w-full bg-muted border border-border p-3 text-sm rounded-xl focus:border-blue-500 outline-none text-zinc-300"
                  >
                    <option value="">None (Top Level)</option>
                    {categories.filter(c => c.id !== editingId).map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <button 
                  type="submit" 
                  disabled={saving}
                  className="w-full bg-blue-500 text-black font-black uppercase tracking-widest py-3 rounded-xl mt-4 hover:bg-blue-400 transition-colors flex items-center justify-center gap-2"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {editingId ? 'Save Changes' : 'Create Category'}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Tree View */}
        <div className="bg-card backdrop-blur-xl border border-border rounded-2xl p-6 shadow-xl">
          <div className="flex items-center gap-3 mb-8 border-b border-border pb-4">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <FolderTree className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-foreground tracking-widest uppercase">Hierarchy</h2>
              <p className="text-[10px] text-muted-foreground mt-1 uppercase tracking-widest">{categories.length} Total Categories</p>
            </div>
          </div>

          <div className="space-y-3">
            {rootCategories.length === 0 ? (
              <div className="text-center text-muted-foreground py-12 text-sm uppercase tracking-widest">No categories found</div>
            ) : (
              rootCategories.map(root => (
                <div key={root.id} className="space-y-2">
                  {/* Root Row */}
                  <div className="flex items-center justify-between p-4 bg-muted border border-border rounded-xl group hover:border-blue-500/30 transition-colors">
                    <div className="flex items-center gap-3">
                      <Folder className="w-5 h-5 text-muted-foreground group-hover:text-blue-400 transition-colors" />
                      <div>
                        <span className="font-bold text-sm block">{root.name}</span>
                        <span className="text-[10px] font-mono text-muted-foreground">/{root.slug}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => openEditForm(root)} className="p-2 hover:bg-muted rounded-lg text-muted-foreground hover:text-blue-400 transition-colors">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(root.id)} className="p-2 hover:bg-red-500/10 rounded-lg text-muted-foreground hover:text-red-500 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Children Rows */}
                  {getChildren(root.id).map(child => (
                    <div key={child.id} className="flex items-center justify-between p-3 pl-12 bg-background/40 border-l-2 border-border ml-4 rounded-r-xl group hover:border-blue-500/50 transition-colors relative">
                      <div className="absolute -left-0.5 top-1/2 w-4 h-px bg-muted group-hover:bg-blue-500/50"></div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-zinc-300 group-hover:text-foreground transition-colors">{child.name}</span>
                      </div>
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => openEditForm(child)} className="p-1.5 hover:bg-muted rounded-lg text-muted-foreground hover:text-blue-400 transition-colors">
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => handleDelete(child.id)} className="p-1.5 hover:bg-red-500/10 rounded-lg text-muted-foreground hover:text-red-500 transition-colors">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ))
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
