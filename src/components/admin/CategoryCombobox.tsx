'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { getCategories, addCategory, Category } from '@/app/admin/articles/new/categoryActions';
import { Check, ChevronsUpDown, Loader2, Plus, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';

interface CategoryComboboxProps {
  value: string; // Comma separated string of category names
  onChange: (value: string) => void;
}

export default function CategoryCombobox({ value, onChange }: CategoryComboboxProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [creating, setCreating] = useState(false);

  // Initialize selected values from the comma-separated string
  const selectedNames = useMemo(() => {
    return value.split(',').map(s => s.trim()).filter(Boolean);
  }, [value]);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const data = await getCategories();
      setCategories(data);
      setLoading(false);
    }
    load();
  }, []);

  const handleSelect = (name: string) => {
    let newSelected: string[];
    if (selectedNames.includes(name)) {
      newSelected = selectedNames.filter(n => n !== name);
    } else {
      newSelected = [...selectedNames, name];
    }
    onChange(newSelected.join(', '));
  };

  const handleRemove = (nameToRemove: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newSelected = selectedNames.filter(n => n !== nameToRemove);
    onChange(newSelected.join(', '));
  };

  const handleCreate = async () => {
    if (!searchQuery) return;
    setCreating(true);
    const newCat = await addCategory(searchQuery);
    if (newCat) {
      setCategories(prev => [...prev, newCat]);
      handleSelect(newCat.name);
      setSearchQuery('');
    }
    setCreating(false);
  };

  // Grouping logic: parents vs children
  const parents = categories.filter(c => !c.parent_id);
  
  const groupedCategories = parents.map(parent => {
    const children = categories.filter(c => c.parent_id === parent.id);
    return {
      parent,
      children
    };
  });

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between h-auto min-h-10 bg-muted/30 hover:bg-muted/50 border-border text-foreground font-normal px-3 py-2"
        >
          <div className="flex flex-wrap gap-1 items-center">
            {selectedNames.length === 0 && <span className="text-muted-foreground text-sm">Select categories...</span>}
            {selectedNames.map(name => (
              <Badge key={name} variant="secondary" className="mr-1 mb-1 text-[10px] uppercase tracking-wider bg-primary/10 text-primary hover:bg-primary/20 border-primary/20">
                {name}
                <div 
                  className="ml-1 ring-offset-background rounded-full outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 hover:bg-primary/30 cursor-pointer p-0.5"
                  onClick={(e) => handleRemove(name, e)}
                >
                  <X className="h-3 w-3" />
                </div>
              </Badge>
            ))}
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      
      <PopoverContent className="w-full p-0 shadow-xl border-border bg-card min-w-[300px]" align="start">
        <Command shouldFilter={true}>
          <CommandInput 
            placeholder="Search categories..." 
            value={searchQuery}
            onValueChange={setSearchQuery}
            className="text-sm"
          />
          <CommandList className="max-h-[300px] overflow-y-auto">
            <CommandEmpty className="p-4 text-center text-sm">
              <p className="text-muted-foreground mb-3">No categories found.</p>
              {searchQuery && (
                <Button 
                  type="button"
                  variant="outline" 
                  size="sm" 
                  onClick={handleCreate} 
                  disabled={creating}
                  className="w-full gap-2 border-primary/50 text-primary hover:bg-primary hover:text-black"
                >
                  {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  Create &quot;{searchQuery}&quot;
                </Button>
              )}
            </CommandEmpty>
            
            {loading ? (
              <div className="p-4 flex items-center justify-center text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin mr-2" /> Loading...
              </div>
            ) : (
              groupedCategories.map(group => (
                <CommandGroup key={group.parent.id} heading={group.parent.name} className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                  <CommandItem
                    key={group.parent.id}
                    value={group.parent.name}
                    onSelect={() => handleSelect(group.parent.name)}
                    className="text-sm cursor-pointer"
                  >
                    <Check className={cn("mr-2 h-4 w-4", selectedNames.includes(group.parent.name) ? "opacity-100 text-primary" : "opacity-0")} />
                    {group.parent.name}
                  </CommandItem>
                  
                  {group.children.map(child => (
                    <CommandItem
                      key={child.id}
                      value={child.name}
                      onSelect={() => handleSelect(child.name)}
                      className="text-sm cursor-pointer pl-6" // Indent children
                    >
                      <Check className={cn("mr-2 h-4 w-4", selectedNames.includes(child.name) ? "opacity-100 text-primary" : "opacity-0")} />
                      {child.name}
                    </CommandItem>
                  ))}
                </CommandGroup>
              ))
            )}
            
            {/* Display root categories that have no parent but also didn't get grouped correctly (failsafe) */}
            {categories.filter(c => !c.parent_id && !groupedCategories.find(g => g.parent.id === c.id)).map(orphan => (
               <CommandItem
                 key={orphan.id}
                 value={orphan.name}
                 onSelect={() => handleSelect(orphan.name)}
                 className="text-sm cursor-pointer"
               >
                 <Check className={cn("mr-2 h-4 w-4", selectedNames.includes(orphan.name) ? "opacity-100 text-primary" : "opacity-0")} />
                 {orphan.name}
               </CommandItem>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
