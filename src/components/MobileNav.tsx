import { Home, Radio, Search, Bookmark } from 'lucide-react';

interface MobileNavProps {
  currentView: 'home' | 'article' | 'saved';
  onHomeClick: () => void;
  onLiveClick?: () => void;
  onSavedClick?: () => void;
  onSearchClick: () => void;
  onMenuClick: () => void;
}

export default function MobileNav({
  currentView,
  onHomeClick,
  onLiveClick,
  onSavedClick,
  onSearchClick
}: MobileNavProps) {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-xl border-t border-slate-200/90 lg:hidden shadow-lg"
      style={{ paddingBottom: 'max(8px, env(safe-area-inset-bottom))' }}
      aria-label="Mobile Navigation"
    >
      <div className="flex items-center justify-around px-3 py-2">
        <button 
          onClick={onHomeClick}
          className={`flex flex-col items-center gap-1 p-1.5 transition-colors ${currentView === 'home' ? 'text-[#E63946]' : 'text-slate-500 hover:text-slate-900'}`}
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px] font-sans font-bold tracking-tight">Home</span>
        </button>

        <button 
          onClick={onLiveClick}
          className="flex flex-col items-center gap-1 p-1.5 text-slate-500 hover:text-slate-900 transition-colors"
        >
          <div className="relative">
            <Radio className="w-5 h-5 text-[#0D5C46]" />
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-500" />
          </div>
          <span className="text-[10px] font-sans font-bold tracking-tight text-[#0D5C46]">Live Wire</span>
        </button>

        <button 
          onClick={onSearchClick}
          className="flex flex-col items-center gap-1 p-1.5 text-slate-500 hover:text-slate-900 transition-colors"
        >
          <Search className="w-5 h-5" />
          <span className="text-[10px] font-sans font-bold tracking-tight">Search</span>
        </button>

        <button 
          onClick={onSavedClick}
          className={`flex flex-col items-center gap-1 p-1.5 transition-colors ${currentView === 'saved' ? 'text-[#E63946]' : 'text-slate-500 hover:text-slate-900'}`}
        >
          <Bookmark className="w-5 h-5" />
          <span className="text-[10px] font-sans font-bold tracking-tight">Saved</span>
        </button>
      </div>
    </nav>
  );
}
