'use client';

import React, { useState, useEffect } from 'react';
import type { Category, Tool } from '@/types';
import DynamicIcon from '@/components/shared/DynamicIcon';
import {
  FolderTree,
  PlusCircle,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  GitCommit,
  X,
} from 'lucide-react';

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [tools, setTools] = useState<Tool[]>([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [form, setForm] = useState({ id: '', name: '', description: '', icon: 'Folder' });
  const [saving, setSaving] = useState(false);

  const loadData = async () => {
    try {
      const [catRes, toolsRes] = await Promise.all([
        fetch('/api/admin/categories'),
        fetch('/api/admin/tools'),
      ]);
      if (catRes.ok) {
        const c = await catRes.json();
        setCategories(c.categories || []);
      }
      if (toolsRes.ok) {
        const t = await toolsRes.json();
        setTools(t.tools || []);
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
      fetch('/api/admin/categories'),
      fetch('/api/admin/tools'),
    ])
      .then(async ([catRes, toolsRes]) => {
        if (!isMounted) return;
        if (catRes.ok) {
          const c = await catRes.json();
          setCategories(c.categories || []);
        }
        if (toolsRes.ok) {
          const t = await toolsRes.json();
          setTools(t.tools || []);
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

  const openCreateModal = () => {
    setEditingCategory(null);
    setForm({ id: '', name: '', description: '', icon: 'Folder' });
    setModalOpen(true);
  };

  const openEditModal = (cat: Category) => {
    setEditingCategory(cat);
    setForm({
      id: cat.id,
      name: cat.name,
      description: cat.description,
      icon: cat.icon || 'Folder',
    });
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setFeedback(null);

    const isEdit = Boolean(editingCategory);
    const payload = {
      id: form.id.trim().toLowerCase(),
      name: form.name.trim(),
      description: form.description.trim(),
      icon: form.icon.trim() || 'Folder',
    };

    try {
      const res = await fetch('/api/admin/categories', {
        method: isEdit ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update categories');
      }

      setFeedback({
        type: 'success',
        msg: `Category "${form.name}" ${isEdit ? 'updated' : 'created'}. Commit SHA: ${data.commitSha ? data.commitSha.slice(0, 7) : 'saved'}`,
      });
      setModalOpen(false);
      await loadData();
    } catch (err) {
      setFeedback({
        type: 'error',
        msg: err instanceof Error ? err.message : 'Action failed',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (cat: Category) => {
    const toolCount = tools.filter((t) => t.category === cat.id).length;
    if (toolCount > 0) {
      alert(`Cannot delete category "${cat.name}". There are ${toolCount} tool(s) assigned to it.`);
      return;
    }

    if (!confirm(`Are you sure you want to delete category "${cat.name}"?`)) return;

    try {
      const res = await fetch(`/api/admin/categories?id=${cat.id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Deletion failed');

      setFeedback({
        type: 'success',
        msg: `Category "${cat.name}" deleted. Commit SHA: ${data.commitSha ? data.commitSha.slice(0, 7) : 'saved'}`,
      });
      await loadData();
    } catch (err) {
      setFeedback({
        type: 'error',
        msg: err instanceof Error ? err.message : 'Deletion failed',
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Categories Management
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Taxonomy configuration stored in <code className="text-emerald-400 font-mono">data/categories.json</code>.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold transition shadow-sm"
        >
          <PlusCircle className="w-4 h-4" />
          <span>New Category</span>
        </button>
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
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          )}
          <span>{feedback.msg}</span>
        </div>
      )}

      {/* Grid of Category Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((cat) => {
          const toolCount = tools.filter((t) => t.category === cat.id).length;

          return (
            <div
              key={cat.id}
              className="p-5 bg-[#0d0f17] border border-zinc-800 rounded-xl flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="w-9 h-9 rounded-lg bg-zinc-900 border border-zinc-700/80 flex items-center justify-center text-emerald-400">
                    <DynamicIcon name={cat.icon} className="w-4 h-4" />
                  </div>
                  <span className="font-mono text-[11px] text-zinc-500 bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800">
                    {toolCount} tools
                  </span>
                </div>

                <h3 className="text-base font-semibold text-zinc-100">{cat.name}</h3>
                <span className="text-[11px] font-mono text-emerald-400 block mb-1">
                  id: {cat.id}
                </span>
                <p className="text-xs text-zinc-400 leading-relaxed line-clamp-2">
                  {cat.description}
                </p>
              </div>

              <div className="pt-3 border-t border-zinc-800/80 flex items-center justify-between text-xs">
                <span className="text-zinc-500 font-mono text-[11px]">
                  Icon: {cat.icon}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openEditModal(cat)}
                    className="p-1.5 text-zinc-400 hover:text-white rounded hover:bg-zinc-800 transition"
                    title="Edit category"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(cat)}
                    className="p-1.5 text-zinc-400 hover:text-rose-400 rounded hover:bg-zinc-800 transition"
                    title="Delete category"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal for Create/Edit Category */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#0d0f17] border border-zinc-800 rounded-2xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white">
                {editingCategory ? `Edit Category: ${editingCategory.name}` : 'New Category'}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="text-zinc-500 hover:text-zinc-300"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs sm:text-sm">
              <div>
                <label className="block text-zinc-300 font-medium mb-1">
                  Category ID (Slug) <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  disabled={Boolean(editingCategory)}
                  value={form.id}
                  onChange={(e) => setForm({ ...form, id: e.target.value })}
                  placeholder="e.g. developer, multimedia, security"
                  className="w-full bg-zinc-900 border border-zinc-800 text-zinc-200 font-mono text-xs sm:text-sm px-3 py-2 rounded-lg focus:outline-none focus:border-emerald-500/50 disabled:opacity-50"
                />
              </div>

              <div>
                <label className="block text-zinc-300 font-medium mb-1">
                  Category Name <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Developer Utilities"
                  className="w-full bg-zinc-900 border border-zinc-800 text-zinc-200 text-xs sm:text-sm px-3 py-2 rounded-lg focus:outline-none focus:border-emerald-500/50"
                />
              </div>

              <div>
                <label className="block text-zinc-300 font-medium mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Short description for badges and directory lists..."
                  className="w-full bg-zinc-900 border border-zinc-800 text-zinc-200 text-xs sm:text-sm p-3 rounded-lg focus:outline-none focus:border-emerald-500/50 resize-y"
                />
              </div>

              <div>
                <label className="block text-zinc-300 font-medium mb-1">
                  Lucide Icon Name
                </label>
                <input
                  type="text"
                  value={form.icon}
                  onChange={(e) => setForm({ ...form, icon: e.target.value })}
                  placeholder="e.g. Code, Shield, Palette, Type, Clock"
                  className="w-full bg-zinc-900 border border-zinc-800 text-zinc-200 font-mono text-xs sm:text-sm px-3 py-2 rounded-lg focus:outline-none focus:border-emerald-500/50"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-semibold rounded-lg transition"
                >
                  {saving && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>{saving ? 'Committing...' : 'Save Category'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
