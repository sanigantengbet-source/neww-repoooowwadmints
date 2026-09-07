'use client';

import React, { useState, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import type { Tool, Category } from '@/types';
import ToolCard from '@/components/shared/ToolCard';
import { Search, Filter, ArrowUpDown, RotateCcw } from 'lucide-react';

interface ToolsDirectoryClientProps {
  initialTools: Tool[];
  categories: Category[];
}

export default function ToolsDirectoryClient({
  initialTools,
  categories,
}: ToolsDirectoryClientProps) {
  const searchParams = useSearchParams();
  const initialCat = searchParams.get('category') || 'all';
  const initialQuery = searchParams.get('q') || '';
  const initialFeatured = searchParams.get('featured') === 'true';
  const initialPopular = searchParams.get('popular') === 'true';

  const [query, setQuery] = useState(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCat);
  const [featuredOnly, setFeaturedOnly] = useState<boolean>(initialFeatured);
  const [popularOnly, setPopularOnly] = useState<boolean>(initialPopular);
  const [sortBy, setSortBy] = useState<'name' | 'category' | 'newest'>('name');

  const filteredTools = useMemo(() => {
    return initialTools
      .filter((tool) => {
        // Category filter
        if (
          selectedCategory !== 'all' &&
          tool.category.toLowerCase() !== selectedCategory.toLowerCase()
        ) {
          return false;
        }

        // Featured & Popular toggles
        if (featuredOnly && !tool.featured) return false;
        if (popularOnly && !tool.popular) return false;

        // Search text
        if (query.trim()) {
          const q = query.toLowerCase().trim();
          const matchName = tool.name.toLowerCase().includes(q);
          const matchDesc = tool.description.toLowerCase().includes(q);
          const matchCat = tool.category.toLowerCase().includes(q);
          const matchTag = tool.tags?.some((tag) => tag.toLowerCase().includes(q));
          if (!matchName && !matchDesc && !matchCat && !matchTag) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'name') return a.name.localeCompare(b.name);
        if (sortBy === 'category') return a.category.localeCompare(b.category);
        if (sortBy === 'newest') {
          return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
        }
        return 0;
      });
  }, [initialTools, selectedCategory, featuredOnly, popularOnly, query, sortBy]);

  const resetFilters = () => {
    setQuery('');
    setSelectedCategory('all');
    setFeaturedOnly(false);
    setPopularOnly(false);
    setSortBy('name');
  };

  return (
    <div className="space-y-6">
      {/* Search and control bar */}
      <div className="p-4 bg-[#0d0f17] border border-zinc-800 rounded-xl space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3.5" />
            <input
              type="text"
              id="directory-search-input"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by tool name, tag, or function..."
              className="w-full bg-zinc-900 border border-zinc-800 text-zinc-200 placeholder-zinc-500 text-xs sm:text-sm pl-10 pr-4 py-2.5 rounded-lg focus:outline-none focus:border-emerald-500/50"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-zinc-900 border border-zinc-800 text-zinc-200 px-3 py-2.5 rounded-lg focus:outline-none"
            >
              <option value="all">All Categories ({initialTools.length})</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'name' | 'category' | 'newest')}
              className="bg-zinc-900 border border-zinc-800 text-zinc-200 px-3 py-2.5 rounded-lg focus:outline-none"
            >
              <option value="name">Sort: Name (A-Z)</option>
              <option value="category">Sort: Category</option>
              <option value="newest">Sort: Newest First</option>
            </select>
          </div>
        </div>

        {/* Filter chips */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-zinc-800/60 text-xs">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setFeaturedOnly(!featuredOnly)}
              className={`px-2.5 py-1 rounded-md transition ${
                featuredOnly
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-semibold'
                  : 'bg-zinc-900 text-zinc-400 border border-zinc-800 hover:text-zinc-200'
              }`}
            >
              ★ Featured Only
            </button>
            <button
              onClick={() => setPopularOnly(!popularOnly)}
              className={`px-2.5 py-1 rounded-md transition ${
                popularOnly
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-semibold'
                  : 'bg-zinc-900 text-zinc-400 border border-zinc-800 hover:text-zinc-200'
              }`}
            >
              🔥 Popular Only
            </button>
          </div>

          <div className="flex items-center gap-3 text-zinc-400">
            <span>
              Showing <strong className="text-zinc-200 font-mono">{filteredTools.length}</strong> of {initialTools.length} tools
            </span>
            {(query || selectedCategory !== 'all' || featuredOnly || popularOnly) && (
              <button
                onClick={resetFilters}
                className="flex items-center gap-1 text-zinc-500 hover:text-rose-400"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Grid of tools */}
      {filteredTools.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTools.map((tool) => (
            <ToolCard key={tool.id} tool={tool} />
          ))}
        </div>
      ) : (
        <div className="p-12 text-center bg-[#0d0f17] border border-zinc-800 rounded-xl space-y-3">
          <p className="text-zinc-300 font-medium">No tools found matching your criteria.</p>
          <p className="text-xs text-zinc-500">
            Try adjusting your search terms or clearing active filters.
          </p>
          <button
            onClick={resetFilters}
            className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs rounded-lg transition"
          >
            Clear all filters
          </button>
        </div>
      )}
    </div>
  );
}
