'use client';

import { useState, useEffect, useMemo } from 'react';
import { Plus, Trash2, Eye, Rss, Globe, RefreshCcw, X, Search, ChevronLeft, ChevronRight, Power, Edit3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';

interface RssSource {
  id: number;
  media_house_name: string;
  description: string;
  category: string;
  sub_category: string;
  rss_feed: string;
  website: string;
  favicon_url: string;
  created_at: string;
  is_active?: boolean;
}

export default function RssManager() {
  const [sources, setSources] = useState<RssSource[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Search & Pagination State
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  // Add Source Form State
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    media_house_name: '',
    description: '',
    category: '',
    sub_category: '',
    rss_feed: '',
    website: '',
    favicon_url: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Edit Source State
  const [editingSource, setEditingSource] = useState<RssSource | null>(null);
  const [isEditingSubmitting, setIsEditingSubmitting] = useState(false);

  // Preview Modal State
  const [previewData, setPreviewData] = useState<any>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState('');
  const [showPreview, setShowPreview] = useState(false);

  // Custom Confirm Dialog State
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmText: string;
    confirmAction: () => void;
    isDestructive?: boolean;
    sourceName?: string;
    faviconUrl?: string;
  } | null>(null);

  const fetchSources = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/rss-sources');
      const data = await res.json();
      if (data.sources) setSources(data.sources);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSources();
  }, []);

  // Auto-open edit modal if query param is present
  useEffect(() => {
    if (typeof window !== 'undefined' && sources.length > 0 && !editingSource) {
      const params = new URLSearchParams(window.location.search);
      const editName = params.get('edit_name');
      if (editName) {
        const sourceToEdit = sources.find(s => s.media_house_name === editName);
        if (sourceToEdit) {
          setEditingSource(sourceToEdit);
          
          // Clean up URL so it doesn't reopen if they close and refresh
          const newUrl = window.location.pathname;
          window.history.replaceState({}, document.title, newUrl);
        }
      }
    }
  }, [sources, editingSource]);

  // Filter & Paginate
  const filteredSources = useMemo(() => {
    if (!searchQuery) return sources;
    const lowerQ = searchQuery.toLowerCase();
    return sources.filter(s => 
      s.media_house_name.toLowerCase().includes(lowerQ) ||
      s.category?.toLowerCase().includes(lowerQ) ||
      s.sub_category?.toLowerCase().includes(lowerQ) ||
      s.website?.toLowerCase().includes(lowerQ)
    );
  }, [sources, searchQuery]);

  const totalPages = Math.ceil(filteredSources.length / itemsPerPage);
  
  // Reset to page 1 when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const paginatedSources = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredSources.slice(start, start + itemsPerPage);
  }, [filteredSources, currentPage]);

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/admin/rss-sources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setShowAddForm(false);
        setFormData({ media_house_name: '', description: '', category: '', sub_category: '', rss_feed: '', website: '', favicon_url: '' });
        fetchSources();
      } else {
        alert('Failed to add source');
      }
    } catch (err) {
      console.error(err);
      alert('Error adding source');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSource) return;
    setIsEditingSubmitting(true);
    try {
      const res = await fetch(`/api/admin/rss-sources?id=${editingSource.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingSource)
      });
      if (res.ok) {
        setEditingSource(null);
        fetchSources();
      } else {
        alert('Failed to update source');
      }
    } catch (err) {
      console.error(err);
      alert('Error updating source');
    } finally {
      setIsEditingSubmitting(false);
    }
  };

  const handleDelete = (source: RssSource) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Delete Source',
      message: `Are you sure you want to permanently delete **${source.media_house_name}**? This action cannot be undone and you will lose all future fetching capabilities for this source.`,
      confirmText: 'Delete Source',
      isDestructive: true,
      sourceName: source.media_house_name,
      faviconUrl: source.favicon_url,
      confirmAction: async () => {
        try {
          await fetch(`/api/admin/rss-sources?id=${source.id}`, { method: 'DELETE' });
          fetchSources();
          setConfirmDialog(null);
        } catch (err) {
          console.error(err);
        }
      }
    });
  };

  const handleToggleActive = (source: RssSource) => {
    const currentStatus = source.is_active !== false;
    const actionText = currentStatus ? 'Disable' : 'Enable';
    setConfirmDialog({
      isOpen: true,
      title: `${actionText} Source`,
      message: `Are you sure you want to ${actionText.toLowerCase()} **${source.media_house_name}**? ${currentStatus ? `You won't be able to fetch news articles from ${source.media_house_name} until you turn it back on.` : `This will instantly resume fetching new articles from ${source.media_house_name}.`}`,
      confirmText: actionText,
      isDestructive: currentStatus,
      sourceName: source.media_house_name,
      faviconUrl: source.favicon_url,
      confirmAction: async () => {
        try {
          const res = await fetch(`/api/admin/rss-sources?id=${source.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ is_active: !currentStatus })
          });
          if (res.ok) {
            setSources(sources.map(s => s.id === source.id ? { ...s, is_active: !currentStatus } : s));
            setConfirmDialog(null);
          }
        } catch (err) {
          console.error(err);
        }
      }
    });
  };

  const handlePreview = async (url: string) => {
    setShowPreview(true);
    setPreviewLoading(true);
    setPreviewError('');
    setPreviewData(null);
    try {
      const res = await fetch(`/api/admin/rss-preview?url=${encodeURIComponent(url)}`);
      const data = await res.json();
      if (res.ok) {
        setPreviewData(data);
      } else {
        setPreviewError(data.error || 'Failed to fetch preview');
      }
    } catch (err) {
      setPreviewError('Network error while fetching preview');
    } finally {
      setPreviewLoading(false);
    }
  };

  return (
    <div className="p-2 md:p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-border pb-6 gap-4">
        <div>
          <h1 className="text-4xl font-bold text-foreground tracking-tight" style={{ fontFamily: "'General Sans', sans-serif" }}>Live Updates</h1>
          <p className="text-muted-foreground mt-2 text-sm font-medium">Manage automated news ingestion sources</p>
        </div>
        <Button 
          onClick={() => setShowAddForm(!showAddForm)}
          className="shrink-0"
        >
          {showAddForm ? <X className="w-4 h-4 mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
          {showAddForm ? 'Cancel' : 'Add Source'}
        </Button>
      </div>

      {showAddForm && (
        <form onSubmit={handleAddSubmit} className="bg-muted border border-border rounded-xl p-6 md:p-8 space-y-6 shadow-sm">
          <h2 className="text-xl font-semibold text-foreground">New Source Configuration</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Media House Name *</Label>
              <Input required value={formData.media_house_name} onChange={e => setFormData({...formData, media_house_name: e.target.value})} placeholder="e.g. The Hindu" />
            </div>
            <div className="space-y-2">
              <Label>RSS Feed URL *</Label>
              <Input required type="url" value={formData.rss_feed} onChange={e => setFormData({...formData, rss_feed: e.target.value})} placeholder="https://..." />
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <Input value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} placeholder="e.g. Indian News" />
            </div>
            <div className="space-y-2">
              <Label>Sub-Category</Label>
              <Input value={formData.sub_category} onChange={e => setFormData({...formData, sub_category: e.target.value})} placeholder="e.g. General" />
            </div>
            <div className="space-y-2">
              <Label>Website</Label>
              <div className="flex gap-3">
                {formData.website && (
                  <div className="w-10 h-10 shrink-0 bg-background border border-border rounded-lg p-1.5 flex items-center justify-center">
                    <img src={`https://www.google.com/s2/favicons?domain=${formData.website.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0]}&sz=32`} alt="Favicon" className="w-full h-full object-contain" />
                  </div>
                )}
                <Input type="url" value={formData.website} onChange={e => setFormData({...formData, website: e.target.value})} placeholder="e.g. thehindu.com" />
              </div>
            </div>
            <div className="col-span-1 md:col-span-2 space-y-2">
              <Label>Description</Label>
              <Textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} rows={3} placeholder="Brief description of the source..." />
            </div>
          </div>
          <Button disabled={isSubmitting} type="submit" size="lg" className="w-full md:w-auto font-bold">
            {isSubmitting ? 'Saving Source...' : 'Save Source'}
          </Button>
        </form>
      )}

      {/* Toolbar (Search) */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input 
          type="text" 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by media house, category, or website..." 
          className="pl-9 bg-muted/50"
        />
      </div>

      {/* Sources List */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-24 text-muted-foreground flex flex-col items-center justify-center gap-3">
            <RefreshCcw className="w-6 h-6 animate-spin text-muted-foreground" /> 
            <span className="font-medium">Loading Sources...</span>
          </div>
        ) : filteredSources.length === 0 ? (
          <div className="text-center py-24 border border-dashed border-border rounded-xl text-muted-foreground font-medium bg-muted/50">
            {searchQuery ? 'No sources match your search.' : 'No RSS Sources Configured.'}
          </div>
        ) : (
          <div className="grid gap-3">
            {paginatedSources.map(source => {
              const isActive = source.is_active !== false; // Default to true if null/undefined
              return (
                <div key={source.id} className={`bg-muted border ${isActive ? 'border-border' : 'border-border opacity-60'} rounded-xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:border-zinc-700 hover:opacity-100 transition-all`}>
                  <div className="flex items-start gap-4">
                    {source.favicon_url ? (
                      <img src={source.favicon_url} alt="" className={`w-10 h-10 rounded-md bg-background border border-border p-1.5 object-contain shrink-0 ${!isActive && 'grayscale opacity-50'}`} />
                    ) : (
                      <div className="w-10 h-10 rounded-md border border-border bg-background flex items-center justify-center shrink-0">
                        <Rss className="w-5 h-5 text-muted-foreground" />
                      </div>
                    )}
                    <div>
                      <h3 className="font-semibold text-foreground text-lg leading-tight flex items-center gap-2">
                        {source.media_house_name}
                        {!isActive && <span className="text-[10px] font-bold tracking-wider text-muted-foreground bg-muted px-2 py-0.5 rounded-full uppercase">Disabled</span>}
                      </h3>
                      <div className="flex flex-wrap items-center gap-2 mt-2">
                        <Badge variant="outline" className="font-medium bg-muted/50 text-muted-foreground">
                          {source.category} {source.sub_category ? `/ ${source.sub_category}` : ''}
                        </Badge>
                        {source.website && (
                          <a href={source.website.startsWith('http') ? source.website : `https://${source.website}`} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-xs text-primary hover:text-primary/80 hover:underline">
                            <Globe className="w-3.5 h-3.5" /> {source.website.replace(/^https?:\/\//, '')}
                          </a>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 w-full md:w-auto pt-2 md:pt-0">
                    <Button 
                      variant="outline"
                      size="icon"
                      onClick={() => handleToggleActive(source)} 
                      className={isActive ? 'text-green-500 border-green-500/20 hover:bg-green-500/10 hover:text-green-600' : 'text-muted-foreground border-border hover:bg-muted'} 
                      title={isActive ? "Active (Click to disable)" : "Disabled (Click to enable)"}
                    >
                      <Power className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => setEditingSource(source)} title="Edit Source">
                      <Edit3 className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" className="flex-1 md:flex-none" onClick={() => handlePreview(source.rss_feed)}>
                      <Eye className="w-4 h-4 mr-2" /> Preview
                    </Button>
                    <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => handleDelete(source)} title="Delete Source">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-border pt-6 mt-6">
          <p className="text-sm text-muted-foreground font-medium">
            Showing <span className="text-foreground">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="text-foreground">{Math.min(currentPage * itemsPerPage, filteredSources.length)}</span> of <span className="text-foreground">{filteredSources.length}</span> sources
          </p>
          <div className="flex items-center gap-2">
            <button 
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              className="p-2 border border-border rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-50 disabled:pointer-events-none transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button 
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              className="p-2 border border-border rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-50 disabled:pointer-events-none transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 bg-background/80 z-100 flex items-center justify-center p-4 md:p-6 backdrop-blur-sm">
          <div className="bg-muted border border-border w-full max-w-4xl max-h-[90vh] flex flex-col rounded-xl shadow-2xl overflow-hidden">
            <div className="p-4 md:px-6 md:py-5 border-b border-border flex items-center justify-between bg-card">
              <h2 className="font-semibold text-foreground text-lg flex items-center gap-2">
                <Rss className="w-5 h-5 text-primary" /> Live Feed Preview
              </h2>
              <button onClick={() => setShowPreview(false)} className="text-muted-foreground hover:text-foreground p-1 rounded-md hover:bg-muted transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1">
              {previewLoading ? (
                <div className="py-24 flex flex-col items-center justify-center gap-4 text-muted-foreground">
                  <RefreshCcw className="w-8 h-8 animate-spin text-primary" />
                  <p className="font-medium">Fetching Live XML Stream...</p>
                </div>
              ) : previewError ? (
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-5 text-red-400 font-medium flex items-start gap-3">
                  <div className="mt-0.5">⚠️</div>
                  <div>{previewError}</div>
                </div>
              ) : previewData ? (
                <div className="space-y-8">
                  <div className="border-b border-border pb-5">
                    <h3 className="text-2xl font-bold text-foreground">{previewData.title}</h3>
                    <p className="text-muted-foreground mt-2 leading-relaxed">{previewData.description}</p>
                  </div>
                  
                  <div className="grid gap-5">
                    {previewData.items.map((item: any, i: number) => (
                      <div key={i} className="bg-background border border-border rounded-lg p-5 hover:border-primary/50 transition-colors">
                        <span className="text-xs font-medium text-primary bg-primary/10 px-2.5 py-1 rounded inline-block mb-3 border border-primary/20">
                          {new Date(item.pubDate).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
                        </span>
                        <a href={item.link} target="_blank" rel="noreferrer" className="block text-xl font-semibold text-foreground hover:text-primary transition-colors mb-3 leading-snug">
                          {item.title}
                        </a>
                        <div 
                          className="text-sm text-muted-foreground line-clamp-3 prose dark:prose-invert prose-sm max-w-none leading-relaxed"
                          dangerouslySetInnerHTML={{ __html: item.contentSnippet }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      )}
      {/* Custom Confirmation Dialog */}
      {confirmDialog?.isOpen && (
        <div className="fixed inset-0 bg-background/80 z-110 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-muted border border-border rounded-2xl w-full max-w-md shadow-2xl overflow-hidden p-8 relative flex flex-col items-center text-center">
            
            {/* Background Exclamation Mark */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[200px] font-black text-zinc-800/10 select-none pointer-events-none" style={{ fontFamily: "'General Sans', sans-serif" }}>
              !
            </div>
            
            <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-transparent via-zinc-500 to-transparent opacity-20" />
            
            {/* Dynamic Favicon */}
            <div className="relative z-10 w-16 h-16 bg-background border border-border rounded-2xl flex items-center justify-center mb-6 shadow-inner p-2">
              {confirmDialog.faviconUrl ? (
                <img src={confirmDialog.faviconUrl} alt={confirmDialog.sourceName} className="w-full h-full object-contain rounded-lg" />
              ) : (
                <Rss className="w-8 h-8 text-muted-foreground" />
              )}
            </div>

            <h3 className="relative z-10 text-2xl font-bold text-foreground mb-4" style={{ fontFamily: "'General Sans', sans-serif" }}>
              {confirmDialog.title}
            </h3>
            
            <p className="relative z-10 text-muted-foreground text-sm leading-relaxed mb-10 px-2" dangerouslySetInnerHTML={{ __html: confirmDialog.message.replace(/\*\*(.*?)\*\*/g, '<strong class="text-foreground font-bold">$1</strong>') }} />
            
            <div className="relative z-10 flex items-center gap-3 w-full sm:w-auto">
              <button 
                onClick={() => setConfirmDialog(null)}
                className="w-full sm:w-auto px-6 py-3 rounded-lg text-sm font-medium text-foreground hover:bg-muted transition-colors border border-border"
              >
                Cancel
              </button>
              <button 
                onClick={confirmDialog.confirmAction}
                className={`w-full sm:w-auto px-6 py-3 rounded-lg text-sm font-bold text-primary-foreground transition-all shadow-sm border border-transparent ${
                  confirmDialog.isDestructive 
                    ? 'bg-destructive hover:bg-destructive/90' 
                    : 'bg-primary hover:bg-primary/90'
                }`}
              >
                {confirmDialog.confirmText}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Edit Source Modal */}
      {editingSource && (
        <div className="fixed inset-0 bg-background/80 z-110 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-muted border border-border rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-border flex items-center justify-between">
              <h2 className="text-xl font-bold text-foreground flex items-center gap-2" style={{ fontFamily: "'General Sans', sans-serif" }}>
                <Edit3 className="w-5 h-5 text-primary" />
                Edit Source: {editingSource.media_house_name}
              </h2>
              <button onClick={() => setEditingSource(null)} className="text-muted-foreground hover:text-foreground p-1 rounded-md hover:bg-muted transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto">
              <form id="edit-form" onSubmit={handleEditSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>Media House Name *</Label>
                    <Input required value={editingSource.media_house_name} onChange={e => setEditingSource({...editingSource, media_house_name: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label>RSS Feed URL *</Label>
                    <Input required type="url" value={editingSource.rss_feed} onChange={e => setEditingSource({...editingSource, rss_feed: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label>Category</Label>
                    <Input value={editingSource.category} onChange={e => setEditingSource({...editingSource, category: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label>Sub-Category</Label>
                    <Input value={editingSource.sub_category} onChange={e => setEditingSource({...editingSource, sub_category: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label>Website</Label>
                    <div className="flex gap-3">
                      {editingSource.website && (
                        <div className="w-10 h-10 shrink-0 bg-background border border-border rounded-lg p-1.5 flex items-center justify-center">
                          <img src={`https://www.google.com/s2/favicons?domain=${editingSource.website.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0]}&sz=32`} alt="Favicon" className="w-full h-full object-contain" />
                        </div>
                      )}
                      <Input type="url" value={editingSource.website} onChange={e => setEditingSource({...editingSource, website: e.target.value})} />
                    </div>
                  </div>
                  <div className="col-span-1 md:col-span-2 space-y-2">
                    <Label>Description</Label>
                    <Textarea value={editingSource.description} onChange={e => setEditingSource({...editingSource, description: e.target.value})} rows={3} />
                  </div>
                </div>
              </form>
            </div>
            <div className="p-6 border-t border-border bg-muted/50 flex items-center justify-end gap-3">
              <Button variant="outline" onClick={() => setEditingSource(null)}>
                Cancel
              </Button>
              <Button disabled={isEditingSubmitting} form="edit-form" type="submit" className="font-bold">
                {isEditingSubmitting ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
