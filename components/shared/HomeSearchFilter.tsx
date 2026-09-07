'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, ArrowRight, Sparkles } from 'lucide-react';
import type { Tool, Category } from '@/types';
import ToolCard from '@/components/shared/ToolCard';

interface HomeSearchFilterProps {
  initialTools: Tool[];
  categories: Category[];
}

export default function HomeSearchFilter({ initialTools, categories }: HomeSearchFilterProps) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const filteredTools = initialTools.filter((t) => {
    const matchesCategory =
      selectedCategory === 'all' ||
      t.category.toLowerCase() === selectedCategory.toLowerCase();

    if (!matchesCategory) return false;

    if (!query.trim()) return true;
    const q = query.toLowerCase().trim();
    return (
      t.name.toLowerCase().includes(q) ||
      t.description.toLowerCase().includes(q) ||
      t.category.toLowerCase().includes(q) ||
      t.tags?.some((tag) => tag.toLowerCase().includes(q))
    );
  });

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/tools?q=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Search Input Bar */}
      <form onSubmit={handleSearchSubmit} className="relative max-w-2xl mx-auto">
        <div className="relative flex items-center">
          <Search className="w-5 h-5 text-zinc-500 absolute left-4 pointer-events-none" />
          <input
            type="text"
            id="home-search-input"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search tools, categories or tags (e.g. json, qr, base64)..."
            className="w-full bg-[#0d0f17] border border-zinc-800 text-zinc-200 placeholder-zinc-500 text-sm pl-11 pr-24 py-3.5 rounded-xl focus:outline-none focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/30 transition shadow-lg"
          />
          {query.trim() && (
            <button
              type="submit"
              className="absolute right-2 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs rounded-lg transition"
            >
              Search
            </button>
          )}
        </div>
      </form>

      {/* Category Pills */}
      <div className="flex items-center justify-center gap-1.5 flex-wrap">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
            selectedCategory === 'all'
              ? 'bg-zinc-800 text-white font-semibold border border-zinc-700'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 border border-transparent'
          }`}
        >
          All Categories
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            id={`filter-cat-${cat.id}`}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              selectedCategory === cat.id
                ? 'bg-zinc-800 text-white font-semibold border border-zinc-700'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 border border-transparent'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Dynamic Results Grid when user is searching */}
      {query.trim() || selectedCategory !== 'all' ? (
        <div className="space-y-4 pt-4 border-t border-zinc-800/80">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span>
              Found <strong className="text-emerald-400 font-mono">{filteredTools.length}</strong> matching utilities
            </span>
            <button
              onClick={() => {
                setQuery('');
                setSelectedCategory('all');
              }}
              className="text-xs text-zinc-500 hover:text-zinc-300"
            >
              Reset filters
            </button>
          </div>

          {filteredTools.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTools.map((tool) => (
                <ToolCard key={tool.id} tool={tool} />
              ))}
            </div>
          ) : (
            <div className="p-8 text-center bg-[#0d0f17] border border-zinc-800 rounded-xl space-y-2">
              <p className="text-zinc-300 text-sm font-medium">No tools found matching your query.</p>
              <p className="text-xs text-zinc-500">
                Try searching for keywords like &quot;json&quot;, &quot;generator&quot;, &quot;color&quot;, or &quot;uuid&quot;.
              </p>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}
