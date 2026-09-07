'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import type { Tool, Category, ToolStatus } from '@/types';
import DynamicIcon from '@/components/shared/DynamicIcon';
import {
  Save,
  ArrowLeft,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  GitCommit,
  RefreshCw,
} from 'lucide-react';

interface ToolFormProps {
  initialData?: Tool;
  isEdit?: boolean;
}

const COMMON_ICONS = [
  'Code',
  'CheckCircle2',
  'Binary',
  'Fingerprint',
  'KeyRound',
  'Link',
  'Clock',
  'Palette',
  'FileText',
  'BarChart2',
  'QrCode',
  'Type',
  'Shield',
  'Terminal',
  'Cpu',
  'Wrench',
  'Hash',
  'FileCode',
];

export default function ToolForm({ initialData, isEdit }: ToolFormProps) {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successCommit, setSuccessCommit] = useState<string | null>(null);

  const [form, setForm] = useState<{
    id: string;
    name: string;
    slug: string;
    description: string;
    category: string;
    status: ToolStatus;
    icon: string;
    tags: string;
    featured: boolean;
    popular: boolean;
    author: string;
    version: string;
  }>({
    id: initialData?.id || '',
    name: initialData?.name || '',
    slug: initialData?.slug || '',
    description: initialData?.description || '',
    category: initialData?.category || 'developer',
    status: initialData?.status || 'active',
    icon: initialData?.icon || 'Code',
    tags: initialData?.tags ? initialData.tags.join(', ') : '',
    featured: initialData?.featured || false,
    popular: initialData?.popular || false,
    author: initialData?.author || 'SANN Team',
    version: initialData?.version || '1.0.0',
  });

  // Load categories
  useEffect(() => {
    fetch('/api/admin/categories')
      .then((res) => res.json())
      .then((data) => {
        if (data.categories) {
          setCategories(data.categories);
          if (!initialData && data.categories.length > 0) {
            setForm((prev) => ({ ...prev, category: data.categories[0].id }));
          }
        }
      })
      .catch(() => {});
  }, [initialData]);

  const handleNameChange = (val: string) => {
    setForm((prev) => {
      // Auto-suggest slug on new tools if slug hasn't been manually customized
      const autoSlug = !isEdit
        ? val
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '')
        : prev.slug;
      return { ...prev, name: val, slug: autoSlug };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessCommit(null);
    setSaving(true);

    const payload = {
      id: form.id || undefined,
      name: form.name.trim(),
      slug: form.slug.trim(),
      description: form.description.trim(),
      category: form.category,
      status: form.status,
      icon: form.icon.trim() || 'Code',
      tags: form.tags
        .split(',')
        .map((t) => t.trim().toLowerCase())
        .filter(Boolean),
      featured: form.featured,
      popular: form.popular,
      author: form.author.trim(),
      version: form.version.trim(),
    };

    try {
      const res = await fetch('/api/admin/tools', {
        method: isEdit ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to save tool catalog');
      }

      setSuccessCommit(data.commitSha || 'local-fallback');
      setTimeout(() => {
        router.push('/admin/tools');
        router.refresh();
      }, 1200);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/tools"
            className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-200 transition"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              {isEdit ? `Edit Tool: ${initialData?.name}` : 'Create New Utility'}
            </h1>
            <p className="text-xs text-zinc-400">
              Changes are version-controlled directly in <code className="text-emerald-400 font-mono">data/tools.json</code>.
            </p>
          </div>
        </div>

        <button
          type="submit"
          id="btn-save-tool"
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs sm:text-sm font-semibold rounded-lg transition active:scale-95 shadow-sm min-h-[40px]"
        >
          {saving ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          <span>{saving ? 'Committing...' : isEdit ? 'Save Changes' : 'Create Tool'}</span>
        </button>
      </div>

      {error && (
        <div className="p-3 bg-rose-950/40 border border-rose-800/60 rounded-xl text-xs text-rose-300 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          <div className="flex-1 font-mono">{error}</div>
        </div>
      )}

      {successCommit && (
        <div className="p-3 bg-emerald-950/40 border border-emerald-800/60 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <div className="flex-1 flex items-center gap-2 font-mono">
            <GitCommit className="w-3.5 h-3.5 text-emerald-400" />
            <span>Committed to GitHub successfully:</span>
            <strong className="text-white">{successCommit.slice(0, 7)}</strong>
          </div>
        </div>
      )}

      {/* Form sections */}
      <div className="p-5 bg-[#0d0f17] border border-zinc-800 rounded-xl space-y-4 text-xs sm:text-sm">
        {/* Basic fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-zinc-300 font-medium mb-1">
              Tool Name <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              id="tool-name-input"
              required
              value={form.name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="e.g. JSON Formatter"
              className="w-full bg-zinc-900 border border-zinc-800 text-zinc-200 text-xs sm:text-sm px-3.5 py-2.5 rounded-lg focus:outline-none focus:border-emerald-500/50"
            />
          </div>

          <div>
            <label className="block text-zinc-300 font-medium mb-1">
              URL Slug <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              id="tool-slug-input"
              required
              value={form.slug}
              onChange={(e) => setForm({ ...form, slug: e.target.value })}
              placeholder="e.g. json-formatter"
              className="w-full bg-zinc-900 border border-zinc-800 text-zinc-200 font-mono text-xs sm:text-sm px-3.5 py-2.5 rounded-lg focus:outline-none focus:border-emerald-500/50"
            />
            <span className="text-[11px] text-zinc-500 font-mono mt-1 block">
              Route: /tools/{form.slug || 'your-slug'}
            </span>
          </div>
        </div>

        <div>
          <label className="block text-zinc-300 font-medium mb-1">
            Description <span className="text-rose-400">*</span>
          </label>
          <textarea
            id="tool-desc-input"
            required
            rows={3}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Concise description of the utility for search engines and tool cards..."
            className="w-full bg-zinc-900 border border-zinc-800 text-zinc-200 text-xs sm:text-sm p-3.5 rounded-lg focus:outline-none focus:border-emerald-500/50 resize-y"
          />
        </div>

        {/* Category & Status */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-zinc-300 font-medium mb-1">
              Category <span className="text-rose-400">*</span>
            </label>
            <select
              id="tool-category-select"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="w-full bg-zinc-900 border border-zinc-800 text-zinc-200 text-xs sm:text-sm px-3.5 py-2.5 rounded-lg focus:outline-none"
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.id})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-zinc-300 font-medium mb-1">
              Status <span className="text-rose-400">*</span>
            </label>
            <select
              id="tool-status-select"
              value={form.status}
              onChange={(e) =>
                setForm({
                  ...form,
                  status: e.target.value as ToolStatus,
                })
              }
              className="w-full bg-zinc-900 border border-zinc-800 text-zinc-200 text-xs sm:text-sm px-3.5 py-2.5 rounded-lg focus:outline-none"
            >
              <option value="active">Active (Visible in public directory)</option>
              <option value="draft">Draft (Hidden, direct URL only)</option>
              <option value="deprecated">Deprecated</option>
              <option value="disabled">Disabled</option>
            </select>
          </div>
        </div>

        {/* Icon picker */}
        <div className="space-y-2">
          <label className="block text-zinc-300 font-medium">
            Lucide Icon Identifier
          </label>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-zinc-900 border border-zinc-700/80 flex items-center justify-center text-emerald-400 shrink-0">
              <DynamicIcon name={form.icon} className="w-5 h-5" />
            </div>
            <input
              type="text"
              id="tool-icon-input"
              value={form.icon}
              onChange={(e) => setForm({ ...form, icon: e.target.value })}
              placeholder="e.g. Code, Key, Terminal, QrCode"
              className="w-full bg-zinc-900 border border-zinc-800 text-zinc-200 font-mono text-xs sm:text-sm px-3.5 py-2.5 rounded-lg focus:outline-none"
            />
          </div>

          <div className="flex flex-wrap gap-1.5 pt-1">
            <span className="text-[11px] text-zinc-500 mr-1">Quick select:</span>
            {COMMON_ICONS.map((ic) => (
              <button
                key={ic}
                type="button"
                onClick={() => setForm({ ...form, icon: ic })}
                className={`px-2 py-0.5 rounded text-[11px] font-mono border transition ${
                  form.icon === ic
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                    : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-zinc-200'
                }`}
              >
                {ic}
              </button>
            ))}
          </div>
        </div>

        {/* Tags */}
        <div>
          <label className="block text-zinc-300 font-medium mb-1">
            Tags (Comma Separated)
          </label>
          <input
            type="text"
            id="tool-tags-input"
            value={form.tags}
            onChange={(e) => setForm({ ...form, tags: e.target.value })}
            placeholder="developer, json, formatter, beautify"
            className="w-full bg-zinc-900 border border-zinc-800 text-zinc-200 text-xs sm:text-sm px-3.5 py-2.5 rounded-lg focus:outline-none"
          />
        </div>

        {/* Author & Version */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-zinc-300 font-medium mb-1">
              Author
            </label>
            <input
              type="text"
              value={form.author}
              onChange={(e) => setForm({ ...form, author: e.target.value })}
              placeholder="SANN Team"
              className="w-full bg-zinc-900 border border-zinc-800 text-zinc-200 text-xs sm:text-sm px-3.5 py-2.5 rounded-lg focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-zinc-300 font-medium mb-1">
              Version
            </label>
            <input
              type="text"
              value={form.version}
              onChange={(e) => setForm({ ...form, version: e.target.value })}
              placeholder="1.0.0"
              className="w-full bg-zinc-900 border border-zinc-800 text-zinc-200 font-mono text-xs sm:text-sm px-3.5 py-2.5 rounded-lg focus:outline-none"
            />
          </div>
        </div>

        {/* Featured & Popular toggles */}
        <div className="flex flex-wrap items-center gap-6 pt-2 border-t border-zinc-800/80">
          <label className="flex items-center gap-2 cursor-pointer text-zinc-300">
            <input
              type="checkbox"
              id="tool-featured-toggle"
              checked={form.featured}
              onChange={(e) => setForm({ ...form, featured: e.target.checked })}
              className="rounded border-zinc-700 bg-zinc-800 text-emerald-500 focus:ring-0 w-4 h-4"
            />
            <span className="font-medium">Mark as Featured Tool</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer text-zinc-300">
            <input
              type="checkbox"
              id="tool-popular-toggle"
              checked={form.popular}
              onChange={(e) => setForm({ ...form, popular: e.target.checked })}
              className="rounded border-zinc-700 bg-zinc-800 text-emerald-500 focus:ring-0 w-4 h-4"
            />
            <span className="font-medium">Mark as Popular Tool</span>
          </label>
        </div>
      </div>
    </form>
  );
}
