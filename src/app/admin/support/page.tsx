'use client';

import React, { useState } from 'react';
import { 
  Folder, 
  FileText, 
  Image as ImageIcon, 
  Video, 
  FileSpreadsheet, 
  ChevronLeft, 
  ChevronRight, 
  Search, 
  LayoutGrid, 
  List, 
  MoreHorizontal,
  Download,
  AlertCircle,
  X,
  Maximize2,
  Minus,
  Play,
  Pause,
  ZoomIn,
  ZoomOut
} from 'lucide-react';
import { Button } from '@/components/ui/button';

// Mock File System Data
type FileType = 'folder' | 'document' | 'spreadsheet' | 'image' | 'video';

interface FileNode {
  id: string;
  name: string;
  type: FileType;
  size?: string;
  updatedAt: string;
  children?: FileNode[];
}

const fileSystem: FileNode[] = [
  {
    id: '1',
    name: 'Documentation',
    type: 'folder',
    updatedAt: 'Oct 24, 2026',
    children: [
      { id: '1-1', name: 'Brand_Guidelines_v2.pdf', type: 'document', size: '4.2 MB', updatedAt: 'Sep 12, 2026' },
      { id: '1-2', name: 'Editor_Workflow.pdf', type: 'document', size: '1.1 MB', updatedAt: 'Aug 05, 2026' },
      { id: '1-3', name: 'Logo_Kit', type: 'folder', updatedAt: 'Jul 22, 2026', children: [
          { id: '1-3-1', name: 'logo-dark.png', type: 'image', size: '245 KB', updatedAt: 'Jul 22, 2026' },
          { id: '1-3-2', name: 'logo-light.png', type: 'image', size: '230 KB', updatedAt: 'Jul 22, 2026' },
      ]},
    ]
  },
  {
    id: '2',
    name: 'DevOps Support',
    type: 'folder',
    updatedAt: 'Nov 02, 2026',
    children: [
      { id: '2-1', name: 'Server_Architecture.pdf', type: 'document', size: '2.8 MB', updatedAt: 'Oct 15, 2026' },
      { id: '2-2', name: 'Database_Schema.xlsx', type: 'spreadsheet', size: '156 KB', updatedAt: 'Nov 01, 2026' },
      { id: '2-3', name: 'API_Keys_Backup.txt', type: 'document', size: '12 KB', updatedAt: 'Oct 28, 2026' },
      { id: '2-4', name: 'Deployment_Logs', type: 'folder', updatedAt: 'Nov 02, 2026', children: [] }
    ]
  },
  {
    id: '3',
    name: 'Credentials.xlsx',
    type: 'spreadsheet',
    size: '45 KB',
    updatedAt: 'Today at 9:41 AM'
  },
  {
    id: '4',
    name: 'Marketing Assets',
    type: 'folder',
    updatedAt: 'Last Week',
    children: [
      { id: '4-1', name: 'Campaign_Q4.mp4', type: 'video', size: '124 MB', updatedAt: 'Last Week' },
      { id: '4-2', name: 'Social_Banners', type: 'folder', updatedAt: 'Last Week', children: [] }
    ]
  }
];

export default function SupportPage() {
  const [currentPath, setCurrentPath] = useState<FileNode[]>([{ id: 'root', name: 'Truth24x7', type: 'folder', updatedAt: '', children: fileSystem }]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [previewFile, setPreviewFile] = useState<FileNode | null>(null);

  const currentFolder = currentPath[currentPath.length - 1];
  const contents = currentFolder.children || [];

  const handleNavigateBack = () => {
    if (currentPath.length > 1) {
      setCurrentPath(prev => prev.slice(0, -1));
      setSelectedId(null);
    }
  };

  const handleDoubleClick = (file: FileNode) => {
    if (file.type === 'folder') {
      setCurrentPath(prev => [...prev, file]);
      setSelectedId(null);
    } else {
      setPreviewFile(file);
    }
  };

  const getIcon = (type: FileType, className: string = "w-12 h-12") => {
    switch(type) {
      case 'folder': return <Folder className={`${className} text-blue-400 fill-blue-400/20`} strokeWidth={1.5} />;
      case 'document': return <FileText className={`${className} text-slate-400`} strokeWidth={1.5} />;
      case 'spreadsheet': return <FileSpreadsheet className={`${className} text-emerald-500`} strokeWidth={1.5} />;
      case 'image': return <ImageIcon className={`${className} text-purple-400`} strokeWidth={1.5} />;
      case 'video': return <Video className={`${className} text-rose-400`} strokeWidth={1.5} />;
    }
  };

  const renderMockAppContent = () => {
    if (!previewFile) return null;

    if (previewFile.type === 'spreadsheet') {
      return (
        <div className="flex flex-col h-full bg-background overflow-hidden text-sm">
          {/* Excel Ribbon */}
          <div className="h-10 border-b border-border bg-muted/50 flex items-center px-4 gap-6 text-xs font-medium text-muted-foreground">
            <span className="hover:text-foreground cursor-pointer">File</span>
            <span className="hover:text-foreground cursor-pointer text-emerald-600 font-bold border-b-2 border-emerald-600 h-full flex items-center">Home</span>
            <span className="hover:text-foreground cursor-pointer">Insert</span>
            <span className="hover:text-foreground cursor-pointer">Data</span>
            <span className="hover:text-foreground cursor-pointer">Review</span>
          </div>
          {/* Formula Bar */}
          <div className="h-8 border-b border-border flex items-center px-2 gap-2 text-xs">
            <span className="font-mono text-muted-foreground px-2 border-r border-border">A1</span>
            <span className="font-mono text-muted-foreground italic px-2">fx</span>
            <input type="text" className="flex-1 bg-transparent outline-none" value="DATABASE_URL" readOnly />
          </div>
          {/* Grid */}
          <div className="flex-1 overflow-auto flex bg-muted/20">
            {/* Row Numbers */}
            <div className="w-10 bg-muted/40 border-r border-border shrink-0 flex flex-col font-mono text-[10px] text-muted-foreground text-center">
              <div className="h-7 border-b border-border bg-muted/60" /> {/* Corner */}
              {[1, 2, 3, 4, 5].map(n => <div key={n} className="h-8 border-b border-border flex items-center justify-center">{n}</div>)}
            </div>
            {/* Columns */}
            <div className="flex-1 flex flex-col">
              <div className="flex h-7 border-b border-border bg-muted/60 font-mono text-[10px] text-muted-foreground">
                <div className="w-48 border-r border-border flex items-center justify-center">A</div>
                <div className="w-96 border-r border-border flex items-center justify-center">B</div>
                <div className="flex-1 border-r border-border flex items-center justify-center">C</div>
              </div>
              {/* Data Rows */}
              <div className="flex h-8 border-b border-border">
                <div className="w-48 border-r border-border px-2 flex items-center font-bold">DATABASE_URL</div>
                <div className="w-96 border-r border-border px-2 flex items-center font-mono text-xs text-muted-foreground">postgresql://truth24x7_admin:************@db.truth24x7.internal/prod</div>
                <div className="flex-1 px-2 flex items-center text-muted-foreground">Primary production DB</div>
              </div>
              <div className="flex h-8 border-b border-border">
                <div className="w-48 border-r border-border px-2 flex items-center font-bold">AWS_ACCESS_KEY</div>
                <div className="w-96 border-r border-border px-2 flex items-center font-mono text-xs text-muted-foreground">AKIAIOSFODNN7EXAMPLE</div>
                <div className="flex-1 px-2 flex items-center text-muted-foreground">S3 media bucket</div>
              </div>
              <div className="flex h-8 border-b border-border">
                <div className="w-48 border-r border-border px-2 flex items-center font-bold">JWT_SECRET</div>
                <div className="w-96 border-r border-border px-2 flex items-center font-mono text-xs text-muted-foreground">****************************************</div>
                <div className="flex-1 px-2 flex items-center text-muted-foreground">Admin auth signing</div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (previewFile.type === 'document') {
      return (
        <div className="flex flex-col h-full bg-muted/30">
          <div className="h-12 border-b border-border flex items-center justify-center gap-4 px-4 bg-background">
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full"><ZoomOut className="w-4 h-4" /></Button>
            <span className="text-xs font-medium">100%</span>
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full"><ZoomIn className="w-4 h-4" /></Button>
          </div>
          <div className="flex-1 overflow-auto p-8 flex justify-center">
            <div className="w-full max-w-2xl bg-background border border-border shadow-sm min-h-[800px] p-12">
              <h1 className="text-3xl font-bold mb-6 font-serif">{previewFile.name.replace('.pdf', '').replace(/_/g, ' ')}</h1>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <div className="h-4 bg-muted/60 rounded w-full animate-pulse" />
                <div className="h-4 bg-muted/60 rounded w-5/6 animate-pulse" />
                <div className="h-4 bg-muted/60 rounded w-4/6 animate-pulse" />
                <br/>
                <div className="h-4 bg-muted/60 rounded w-full animate-pulse" />
                <div className="h-4 bg-muted/60 rounded w-full animate-pulse" />
                <div className="h-4 bg-muted/60 rounded w-3/4 animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (previewFile.type === 'video' || previewFile.type === 'image') {
      return (
        <div className="flex flex-col h-full bg-black">
          <div className="flex-1 flex items-center justify-center p-8 group">
            <div className="relative w-full max-w-3xl aspect-video bg-zinc-900 rounded-lg flex items-center justify-center border border-zinc-800 shadow-2xl overflow-hidden">
               {previewFile.type === 'video' ? (
                 <>
                   <Play className="w-16 h-16 text-white/50" />
                   <div className="absolute bottom-0 inset-x-0 h-16 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center px-6 gap-4">
                     <Play className="w-5 h-5 text-white cursor-pointer" />
                     <div className="flex-1 h-1 bg-white/20 rounded-full cursor-pointer">
                       <div className="w-1/3 h-full bg-white rounded-full relative">
                         <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow" />
                       </div>
                     </div>
                     <span className="text-white text-xs font-mono">0:24 / 1:30</span>
                   </div>
                 </>
               ) : (
                 <ImageIcon className="w-16 h-16 text-white/20" />
               )}
            </div>
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="w-full max-w-6xl mx-auto h-[80vh] min-h-[600px] bg-background/50 backdrop-blur-xl border border-border rounded-xl shadow-2xl overflow-hidden flex flex-col relative" style={{ fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}>
      
      {/* Top Bar (Traffic Lights + Navigation) */}
      <div className="h-14 bg-muted/80 backdrop-blur-md border-b border-border flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-6">
          {/* Traffic Lights */}
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500/90 hover:bg-red-500 cursor-pointer border border-red-600/20" />
            <div className="w-3 h-3 rounded-full bg-amber-500/90 hover:bg-amber-500 cursor-pointer border border-amber-600/20" />
            <div className="w-3 h-3 rounded-full bg-green-500/90 hover:bg-green-500 cursor-pointer border border-green-600/20" />
          </div>

          {/* Navigation Arrows */}
          <div className="flex items-center gap-1">
            <button 
              onClick={handleNavigateBack}
              disabled={currentPath.length === 1}
              className="p-1 rounded bg-transparent hover:bg-muted-foreground/10 disabled:opacity-30 transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-foreground/70" />
            </button>
            <button disabled className="p-1 rounded bg-transparent hover:bg-muted-foreground/10 disabled:opacity-30 transition-colors">
              <ChevronRight className="w-5 h-5 text-foreground/70" />
            </button>
            <span className="text-sm font-semibold text-foreground/90 ml-3 hidden sm:block">
              {currentFolder.name}
            </span>
          </div>
        </div>

        {/* Search & Views */}
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center bg-background/60 border border-border rounded-md px-3 py-1.5 w-64 shadow-inner">
            <Search className="w-4 h-4 text-muted-foreground mr-2" />
            <input 
              type="text" 
              placeholder="Search" 
              className="bg-transparent border-none outline-none text-sm w-full text-foreground placeholder:text-muted-foreground/60"
            />
          </div>
          <div className="flex items-center bg-background/60 border border-border rounded-md p-0.5 shadow-sm">
            <button onClick={() => setViewMode('grid')} className={`p-1.5 rounded-sm ${viewMode === 'grid' ? 'bg-muted shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button onClick={() => setViewMode('list')} className={`p-1.5 rounded-sm ${viewMode === 'list' ? 'bg-muted shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="w-48 sm:w-56 bg-muted/30 backdrop-blur-sm border-r border-border shrink-0 flex flex-col py-4 hidden sm:flex">
          <div className="px-4 mb-2">
            <h3 className="text-xs font-semibold text-muted-foreground mb-1 px-2">Favorites</h3>
            <div className="space-y-0.5">
              <button onClick={() => { setCurrentPath([{ id: 'root', name: 'Truth24x7', type: 'folder', updatedAt: '', children: fileSystem }]); setSelectedId(null); }} className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-sm transition-colors font-medium ${currentPath.length === 1 ? 'bg-muted/60 text-foreground' : 'hover:bg-muted/60 text-foreground'}`}>
                <Folder className="w-4 h-4 text-blue-400 fill-blue-400/20" />
                Truth24x7
              </button>
              <button className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-sm hover:bg-muted/60 text-foreground transition-colors">
                <FileText className="w-4 h-4 text-blue-400" />
                Recents
              </button>
            </div>
          </div>
          
          <div className="px-4 mt-6">
            <h3 className="text-xs font-semibold text-muted-foreground mb-1 px-2">Tags</h3>
            <div className="space-y-0.5">
              <button className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-sm hover:bg-muted/60 text-foreground transition-colors">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500" /> Urgent
              </button>
              <button className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-sm hover:bg-muted/60 text-foreground transition-colors">
                <div className="w-2.5 h-2.5 rounded-full bg-orange-500" /> Important
              </button>
              <button className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-sm hover:bg-muted/60 text-foreground transition-colors">
                <div className="w-2.5 h-2.5 rounded-full bg-blue-500" /> Work
              </button>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 bg-background overflow-y-auto p-6" onClick={() => setSelectedId(null)}>
          
          {/* Breadcrumb path for aesthetics */}
          <div className="text-xs text-muted-foreground mb-6 flex items-center gap-1 opacity-60">
            {currentPath.map((node, i) => (
              <React.Fragment key={node.id}>
                <span className="hover:underline cursor-pointer" onClick={(e) => { e.stopPropagation(); setCurrentPath(currentPath.slice(0, i + 1)); }}>{node.name}</span>
                {i < currentPath.length - 1 && <span>›</span>}
              </React.Fragment>
            ))}
          </div>

          {viewMode === 'grid' ? (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-6">
              {contents.map(file => (
                <div 
                  key={file.id}
                  onClick={(e) => { e.stopPropagation(); setSelectedId(file.id); }}
                  onDoubleClick={(e) => { e.stopPropagation(); handleDoubleClick(file); }}
                  className={`flex flex-col items-center gap-2 p-2 rounded-lg cursor-default border border-transparent transition-all ${
                    selectedId === file.id ? 'bg-primary/10 border-primary/20' : 'hover:bg-muted/50'
                  }`}
                >
                  <div className="relative">
                    {getIcon(file.type)}
                  </div>
                  <span className={`text-xs text-center font-medium line-clamp-2 px-1 ${selectedId === file.id ? 'bg-primary text-primary-foreground rounded px-1.5' : 'text-foreground/80'}`}>
                    {file.name}
                  </span>
                </div>
              ))}
              {contents.length === 0 && (
                <div className="col-span-full text-center text-sm text-muted-foreground mt-10">
                  This folder is empty.
                </div>
              )}
            </div>
          ) : (
            <div className="w-full text-sm">
              <div className="grid grid-cols-12 gap-4 pb-2 border-b border-border text-muted-foreground font-semibold px-2">
                <div className="col-span-7 sm:col-span-6">Name</div>
                <div className="col-span-3 hidden sm:block">Date Modified</div>
                <div className="col-span-5 sm:col-span-3">Size</div>
              </div>
              <div className="pt-2">
                {contents.map(file => (
                  <div 
                    key={file.id}
                    onClick={(e) => { e.stopPropagation(); setSelectedId(file.id); }}
                    onDoubleClick={(e) => { e.stopPropagation(); handleDoubleClick(file); }}
                    className={`grid grid-cols-12 gap-4 py-1.5 px-2 rounded-md cursor-default border border-transparent items-center ${
                      selectedId === file.id ? 'bg-primary text-primary-foreground' : 'hover:bg-muted/50 text-foreground'
                    }`}
                  >
                    <div className="col-span-7 sm:col-span-6 flex items-center gap-3">
                      {getIcon(file.type, "w-5 h-5")}
                      <span className="truncate">{file.name}</span>
                    </div>
                    <div className={`col-span-3 hidden sm:block truncate ${selectedId === file.id ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
                      {file.updatedAt}
                    </div>
                    <div className={`col-span-5 sm:col-span-3 ${selectedId === file.id ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
                      {file.size || '--'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* StatusBar */}
      <div className="h-7 bg-muted/50 border-t border-border flex items-center justify-center text-[11px] text-muted-foreground">
        {contents.length} item{contents.length !== 1 ? 's' : ''} {selectedId && `- 1 of ${contents.length} selected`}
      </div>

      {/* Mock Application Window Overlay */}
      {previewFile && (
        <div className="absolute inset-0 z-50 flex items-center justify-center p-8 bg-background/20 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setPreviewFile(null)}>
          <div 
            className="w-full max-w-4xl h-[90%] bg-background border border-border rounded-xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200"
            onClick={e => e.stopPropagation()}
          >
            {/* App Window Header */}
            <div className={`h-12 border-b flex items-center justify-between px-4 shrink-0 select-none ${previewFile.type === 'video' || previewFile.type === 'image' ? 'bg-[#1e1e1e] border-black/50 text-white/70' : 'bg-muted/80 backdrop-blur-md border-border'}`}>
              <div className="flex items-center gap-2 w-20">
                <div onClick={() => setPreviewFile(null)} className="w-3 h-3 rounded-full bg-red-500/90 hover:bg-red-500 cursor-pointer border border-red-600/20 flex items-center justify-center group"><X className="w-2 h-2 text-red-900 opacity-0 group-hover:opacity-100" /></div>
                <div className="w-3 h-3 rounded-full bg-amber-500/90 hover:bg-amber-500 cursor-pointer border border-amber-600/20 flex items-center justify-center group"><Minus className="w-2 h-2 text-amber-900 opacity-0 group-hover:opacity-100" /></div>
                <div className="w-3 h-3 rounded-full bg-green-500/90 hover:bg-green-500 cursor-pointer border border-green-600/20 flex items-center justify-center group"><Maximize2 className="w-2 h-2 text-green-900 opacity-0 group-hover:opacity-100" /></div>
              </div>
              <div className="flex-1 text-center flex items-center justify-center gap-2">
                {previewFile.type === 'spreadsheet' && <FileSpreadsheet className="w-4 h-4 text-emerald-500" />}
                <span className="text-sm font-semibold truncate max-w-[300px]">
                  {previewFile.type === 'spreadsheet' ? 'Microsoft Excel - ' : previewFile.type === 'document' ? 'Preview - ' : previewFile.type === 'video' ? 'QuickTime Player - ' : ''}
                  {previewFile.name}
                </span>
              </div>
              <div className="w-20 flex justify-end">
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={() => setPreviewFile(null)}>
                  <Download className={`w-4 h-4 ${previewFile.type === 'video' || previewFile.type === 'image' ? 'text-white/70' : 'text-foreground'}`} />
                </Button>
              </div>
            </div>

            {/* App Content */}
            <div className="flex-1 overflow-hidden relative">
              {renderMockAppContent()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
