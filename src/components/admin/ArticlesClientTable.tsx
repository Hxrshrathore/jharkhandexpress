'use client';

import React, { useState, useMemo } from 'react';
import { Plus, Search, Filter, Edit3, Trash2, FileText, ExternalLink, ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { motion, AnimatePresence } from 'motion/react';
import Link from 'next/link';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { deleteArticleAction } from '@/app/admin/articles/actions';
import { toast } from 'sonner';

export default function ArticlesClientTable({ initialArticles }: { initialArticles: any[] }) {
  const [articles, setArticles] = useState(initialArticles);
  const [showFilters, setShowFilters] = useState(false);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  
  const itemsPerPage = 10;

  const handleDelete = async (id: string) => {
    setIsDeleting(id);
    try {
      const res = await deleteArticleAction(id);
      if (res.success) {
        toast.success(res.message);
        setArticles(prev => prev.filter(a => a.id !== id));
      } else {
        toast.error(res.message);
      }
    } catch (err) {
      toast.error('Failed to delete article');
    } finally {
      setIsDeleting(null);
    }
  };

  // Filter & Global Sort Logic (always latest first globally)
  const processedArticles = useMemo(() => {
    let filtered = [...articles]; // clone to avoid mutating state

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(a => 
        a.title.toLowerCase().includes(q) || 
        a.slug.toLowerCase().includes(q) ||
        (a.categories?.[0] && a.categories[0].toLowerCase().includes(q))
      );
    }

    return filtered.sort((a, b) => {
      const dateA = new Date(a.published_at).getTime();
      const dateB = new Date(b.published_at).getTime();
      return dateB - dateA; // Global default is always latest first
    });
  }, [articles, searchQuery]);

  // Pagination Logic
  const totalPages = Math.max(1, Math.ceil(processedArticles.length / itemsPerPage));
  
  // Sort ONLY the visible paginated slice based on the UI toggle
  const paginatedArticles = useMemo(() => {
    const slice = processedArticles.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
    );

    return slice.sort((a, b) => {
      const dateA = new Date(a.published_at).getTime();
      const dateB = new Date(b.published_at).getTime();
      return sortDirection === 'desc' ? dateB - dateA : dateA - dateB;
    });
  }, [processedArticles, currentPage, sortDirection]);

  const toggleSort = () => {
    setSortDirection(prev => prev === 'desc' ? 'asc' : 'desc');
    // We intentionally DO NOT reset to first page here, because the user wants to sort the CURRENT visible page only.
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const PaginationControls = () => (
    <div className="flex items-center justify-between px-4 py-3 border-border bg-muted/10">
      <div className="text-xs text-muted-foreground font-medium">
        Showing {Math.min((currentPage - 1) * itemsPerPage + 1, processedArticles.length)} to {Math.min(currentPage * itemsPerPage, processedArticles.length)} of {processedArticles.length} entries
      </div>
      <div className="flex items-center gap-2">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
          disabled={currentPage === 1}
        >
          <ChevronLeft className="w-4 h-4 mr-1" /> Prev
        </Button>
        <span className="text-xs font-bold px-2">{currentPage} / {totalPages}</span>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
          disabled={currentPage === totalPages}
        >
          Next <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-foreground tracking-tighter">Articles</h1>
          <p className="text-muted-foreground mt-1 text-sm">Manage syndicated and original content.</p>
        </div>
        <Button asChild>
          <Link href="/admin/articles/new">
            <Plus className="w-4 h-4 mr-2" /> New Article
          </Link>
        </Button>
      </div>

      <Card className="overflow-hidden shadow-xl">
        {/* Table Controls */}
        <div className="p-4 border-b flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-muted/30 relative z-10">
          <div className="relative flex-1 max-w-full md:max-w-md">
            <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
            <Input 
              type="text" 
              placeholder="Search articles by title, slug, or category..." 
              className="pl-9 bg-background w-full"
              value={searchQuery}
              onChange={handleSearch}
            />
          </div>
          <Button 
            variant={showFilters ? "default" : "outline"}
            className="gap-2 w-full md:w-auto" 
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="w-4 h-4" /> Filters
          </Button>
        </div>

        {/* Slide-Down Filter Area */}
        <AnimatePresence>
          {showFilters && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="border-b bg-muted/10 overflow-hidden"
            >
              <div className="p-4 flex gap-4">
                <div className="space-y-2 flex-1">
                  <label className="text-xs font-bold text-muted-foreground uppercase">Status</label>
                  <Select defaultValue="all">
                    <SelectTrigger className="w-full bg-background">
                      <SelectValue placeholder="All Statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="published">Published</SelectItem>
                      <SelectItem value="draft">Draft</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2 flex-1">
                  <label className="text-xs font-bold text-muted-foreground uppercase">Author</label>
                  <Select defaultValue="all">
                    <SelectTrigger className="w-full bg-background">
                      <SelectValue placeholder="All Authors" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Authors</SelectItem>
                      <SelectItem value="system">System Sync</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Top Pagination */}
        <div className="border-b">
          <PaginationControls />
        </div>

        {/* Table */}
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead className="w-[50%]">Article</TableHead>
              <TableHead className="text-center">Category</TableHead>
              <TableHead 
                className="text-center cursor-pointer hover:bg-muted/80 transition-colors select-none"
                onClick={toggleSort}
              >
                <div className="flex items-center justify-center gap-1">
                  Date
                  {sortDirection === 'desc' ? <ChevronDown className="w-4 h-4 text-primary" /> : <ChevronUp className="w-4 h-4 text-primary" />}
                </div>
              </TableHead>
              <TableHead className="text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedArticles.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-32 text-center text-muted-foreground">
                  No articles found matching your criteria.
                </TableCell>
              </TableRow>
            ) : (
              paginatedArticles.map((article: any) => (
                <TableRow key={article.id} className="group cursor-pointer">
                  <TableCell>
                    <div className="flex items-center gap-4">
                      {article.featured_image ? (
                        <img src={article.featured_image} alt="" className="w-20 aspect-video rounded-md object-cover border shrink-0 bg-muted" />
                      ) : (
                        <div className="w-20 aspect-video rounded-md bg-muted border flex items-center justify-center shrink-0">
                          <FileText className="w-5 h-5 text-muted-foreground" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-foreground line-clamp-2 whitespace-normal wrap-break-word group-hover:text-primary transition-colors">{article.title}</p>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{article.slug}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    {article.categories && article.categories.length > 0 ? (
                      <div className="flex flex-wrap items-center justify-center gap-1">
                        {article.categories.map((cat: string, idx: number) => (
                          <Badge 
                            key={idx} 
                            variant="secondary" 
                            className={`uppercase text-[10px] tracking-wider ${cat === 'Breaking News' ? 'bg-red-600 text-white border-red-600' : ''}`}
                          >
                            {cat}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground italic">Uncategorized</span>
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    <span className="text-sm text-muted-foreground whitespace-nowrap">
                      {new Date(article.published_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" size="icon" asChild>
                            <a href={`/article/${article.slug}`} target="_blank" rel="noreferrer">
                              <ExternalLink className="w-4 h-4 text-muted-foreground" />
                            </a>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>View on site</TooltipContent>
                      </Tooltip>
                      
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" size="icon" asChild>
                            <Link href={`/admin/articles/edit/${article.id}`}>
                              <Edit3 className="w-4 h-4 text-primary" />
                            </Link>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Edit Article</TooltipContent>
                      </Tooltip>
                      <Dialog>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <DialogTrigger asChild>
                              <Button variant="ghost" size="icon" className="hover:bg-destructive/10 hover:text-destructive" disabled={isDeleting === article.id}>
                                <Trash2 className="w-4 h-4 text-destructive" />
                              </Button>
                            </DialogTrigger>
                          </TooltipTrigger>
                          <TooltipContent>Delete Article</TooltipContent>
                        </Tooltip>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Delete Article</DialogTitle>
                            <DialogDescription>
                              Are you sure you want to delete "{article.title}"? This action cannot be undone. 
                              The article will be removed from the database and its media files will be deleted from storage.
                            </DialogDescription>
                          </DialogHeader>
                          <DialogFooter>
                            <DialogClose asChild>
                              <Button variant="outline" type="button">Cancel</Button>
                            </DialogClose>
                            <Button 
                              variant="destructive" 
                              onClick={() => handleDelete(article.id)}
                              disabled={isDeleting === article.id}
                            >
                              {isDeleting === article.id ? 'Deleting...' : 'Delete'}
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {/* Bottom Pagination */}
        {processedArticles.length > 0 && (
          <div className="border-t">
            <PaginationControls />
          </div>
        )}
      </Card>
    </div>
  );
}
