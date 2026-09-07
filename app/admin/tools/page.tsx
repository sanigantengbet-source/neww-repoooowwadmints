'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import type { Tool, Category } from '@/types';
import { formatDate } from '@/lib/utils';
import DynamicIcon from '@/components/shared/DynamicIcon';
import {
  Wrench,
  PlusCircle,
  Search,
  ExternalLink,
  Edit2,
  Trash2,
  AlertTriangle,
  RefreshCw,
  Star,
  Flame,
  CheckCircle2,
} from 'lucide-react';

export default function AdminToolsListPage() {
  const [tools, setTools] = useState<Tool[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Delete modal state
  const [deleteTarget, setDeleteTarget] = useState<Tool | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  const loadTools = async () => {
    try {
      const [toolsRes, catRes] = await Promise.all([
        fetch('/api/admin/tools'),
        fetch('/api/admin/categories'),
      ]);
      if (toolsRes.ok) {
        const d = await toolsRes.json();
        setTools(d.tools || []);
      }
      if (catRes.ok) {
        const c = await catRes.json();
        setCategories(c.categories || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    Promise.all([
      fetch('/api/admin/tools'),
      fetch('/api/admin/categories'),
    ])
      .then(async ([toolsRes, catRes]) => {
        if (!isMounted) return;
        if (toolsRes.ok) {
          const d = await toolsRes.json();
          setTools(d.tools || []);
        }
        if (catRes.ok) {
          const c = await catRes.json();
          setCategories(c.categories || []);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    setFeedback(null);
    try {
      const res = await fetch(`/api/admin/tools?id=${deleteTarget.id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to delete tool');
      }

      setFeedback({
        type: 'success',
        msg: `Tool "${deleteTarget.name}" deleted. Commit SHA: ${data.commitSha ? data.commitSha.slice(0, 7) : 'recorded'}`,
      });
      setDeleteTarget(null);
      await loadTools();
    } catch (err) {
      setFeedback({
        type: 'error',
        msg: err instanceof Error ? err.message : 'Deletion failed',
      });
    } finally {
      setDeleting(false);
    }
  };

  const filteredTools = tools.filter((t) => {
    if (categoryFilter !== 'all' && t.category !== categoryFilter) return false;
    if (statusFilter !== 'all' && t.status !== statusFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      return (
        t.name.toLowerCase().includes(q) ||
        t.slug.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.tags?.some((tag) => tag.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Tools Management
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Manage your catalog of utilities stored in <code className="text-emerald-400 font-mono">data/tools.json</code>.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadTools}
            className="p-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg border border-zinc-700 transition"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <Link
            href="/admin/tools/new"
            id="admin-btn-add-tool"
            className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold transition shadow-sm"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add Tool</span>
          </Link>
        </div>
      </div>

      {feedback && (
        <div
          className={`p-3 rounded-xl border text-xs flex items-center gap-2 font-mono ${
            feedback.type === 'success'
              ? 'bg-emerald-950/40 border-emerald-800/60 text-emerald-300'
              : 'bg-rose-950/40 border-rose-800/60 text-rose-300'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
          )}
          <span>{feedback.msg}</span>
        </div>
      )}

      {/* Filter and search bar */}
      <div className="p-4 bg-[#0d0f17] border border-zinc-800 rounded-xl space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, slug or description..."
              className="w-full bg-zinc-900 border border-zinc-800 text-zinc-200 text-xs sm:text-sm pl-10 pr-3 py-2 rounded-lg focus:outline-none focus:border-emerald-500/50"
            />
          </div>

          <div className="flex items-center gap-2 text-xs">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-zinc-900 border border-zinc-800 text-zinc-200 px-3 py-2 rounded-lg focus:outline-none"
            >
              <option value="all">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-zinc-900 border border-zinc-800 text-zinc-200 px-3 py-2 rounded-lg focus:outline-none"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active Only</option>
              <option value="draft">Drafts Only</option>
              <option value="deprecated">Deprecated Only</option>
            </select>
          </div>
        </div>

        <div className="text-xs text-zinc-500 flex justify-between">
          <span>Found <strong className="text-zinc-300 font-mono">{filteredTools.length}</strong> utilities</span>
          {(search || categoryFilter !== 'all' || statusFilter !== 'all') && (
            <button
              onClick={() => {
                setSearch('');
                setCategoryFilter('all');
                setStatusFilter('all');
              }}
              className="text-emerald-400 hover:underline"
            >
              Clear filters
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="bg-[#0d0f17] border border-zinc-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-900/70 border-b border-zinc-800 text-zinc-400 font-mono">
              <tr>
                <th className="py-3 px-4">Tool</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Badges</th>
                <th className="py-3 px-4">Updated</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {filteredTools.map((tool) => {
                return (
                  <tr key={tool.id} className="hover:bg-zinc-900/30 transition">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-emerald-400 shrink-0">
                          <DynamicIcon name={tool.icon} className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-semibold text-zinc-100">{tool.name}</div>
                          <div className="font-mono text-[10px] text-zinc-500">/{tool.slug}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono text-zinc-400 capitalize">
                      {tool.category}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase font-semibold ${
                          tool.status === 'active'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : tool.status === 'draft'
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                            : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                        }`}
                      >
                        {tool.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5">
                        {tool.featured && (
                          <span className="p-1 rounded bg-amber-500/10 text-amber-300" title="Featured">
                            <Star className="w-3 h-3 fill-amber-300" />
                          </span>
                        )}
                        {tool.popular && (
                          <span className="p-1 rounded bg-emerald-500/10 text-emerald-300" title="Popular">
                            <Flame className="w-3 h-3" />
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-zinc-400">
                      {formatDate(tool.updatedAt)}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          href={`/tools/${tool.slug}`}
                          target="_blank"
                          className="p-1.5 rounded-md hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition"
                          title="Open Live Tool"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Link>
                        <Link
                          href={`/admin/tools/${tool.id}`}
                          className="p-1.5 rounded-md hover:bg-zinc-800 text-zinc-400 hover:text-white transition"
                          title="Edit Tool"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </Link>
                        <button
                          onClick={() => setDeleteTarget(tool)}
                          className="p-1.5 rounded-md hover:bg-rose-950/40 text-zinc-400 hover:text-rose-400 transition"
                          title="Delete Tool"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#0d0f17] border border-zinc-800 rounded-2xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 text-rose-400">
              <div className="w-10 h-10 rounded-xl bg-rose-950/50 border border-rose-800/60 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Delete Utility</h3>
                <p className="text-xs text-zinc-400">This action will commit to GitHub.</p>
              </div>
            </div>

            <p className="text-xs text-zinc-300 leading-relaxed">
              Are you sure you want to remove <strong className="text-white">{deleteTarget.name}</strong> from the catalog? This will remove the entry from <code className="text-emerald-400 font-mono">data/tools.json</code>.
            </p>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setDeleteTarget(null)}
                disabled={deleting}
                className="px-3.5 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-medium rounded-lg transition"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex items-center gap-1.5 px-4 py-2 bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white text-xs font-medium rounded-lg transition"
              >
                {deleting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                <span>{deleting ? 'Committing Deletion...' : 'Confirm Delete'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
