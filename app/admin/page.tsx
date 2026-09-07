'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import type { Tool, Category } from '@/types';
import { formatDate } from '@/lib/utils';
import DynamicIcon from '@/components/shared/DynamicIcon';
import {
  Wrench,
  CheckCircle2,
  FileEdit,
  FolderTree,
  GitBranch,
  PlusCircle,
  ExternalLink,
  ArrowRight,
  RefreshCw,
  Shield,
  Star,
  Flame,
} from 'lucide-react';

export default function AdminDashboardPage() {
  const [tools, setTools] = useState<Tool[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    try {
      const [toolsRes, catRes] = await Promise.all([
        fetch('/api/admin/tools'),
        fetch('/api/admin/categories'),
      ]);

      if (toolsRes.ok) {
        const toolsData = await toolsRes.json();
        setTools(toolsData.tools || []);
      }
      if (catRes.ok) {
        const catData = await catRes.json();
        setCategories(catData.categories || []);
      }
    } catch (err) {
      console.error('Failed to load admin stats:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
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
          const toolsData = await toolsRes.json();
          setTools(toolsData.tools || []);
        }
        if (catRes.ok) {
          const catData = await catRes.json();
          setCategories(catData.categories || []);
        }
      })
      .catch((err) => {
        console.error('Failed to load admin stats:', err);
      })
      .finally(() => {
        if (isMounted) {
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const totalTools = tools.length;
  const activeTools = tools.filter((t) => t.status === 'active').length;
  const draftTools = tools.filter((t) => t.status === 'draft').length;
  const deprecatedTools = tools.filter((t) => t.status === 'deprecated').length;

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Dashboard Overview
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Real-time status of your GitHub-backed utilities catalog.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadData}
            disabled={refreshing}
            className="flex items-center gap-1.5 px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg text-xs font-medium border border-zinc-700 transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-emerald-400' : ''}`} />
            <span>Refresh</span>
          </button>

          <Link
            href="/admin/tools/new"
            className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-medium transition shadow-sm"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>New Tool</span>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-[#0d0f17] border border-zinc-800 rounded-xl space-y-1">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span>Total Catalog</span>
            <Wrench className="w-4 h-4 text-zinc-500" />
          </div>
          <div className="text-2xl font-bold font-mono text-white">{totalTools}</div>
          <p className="text-[11px] text-zinc-500">Configured in tools.json</p>
        </div>

        <div className="p-4 bg-[#0d0f17] border border-zinc-800 rounded-xl space-y-1">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span>Active Tools</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-400">{activeTools}</div>
          <p className="text-[11px] text-zinc-500">Publicly accessible</p>
        </div>

        <div className="p-4 bg-[#0d0f17] border border-zinc-800 rounded-xl space-y-1">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span>Drafts / Testing</span>
            <FileEdit className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-amber-400">{draftTools}</div>
          <p className="text-[11px] text-zinc-500">Hidden from public directory</p>
        </div>

        <div className="p-4 bg-[#0d0f17] border border-zinc-800 rounded-xl space-y-1">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span>Categories</span>
            <FolderTree className="w-4 h-4 text-zinc-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-zinc-200">{categories.length}</div>
          <p className="text-[11px] text-zinc-500">Classification tags</p>
        </div>
      </div>

      {/* GitHub Storage Persistence Status Box */}
      <div className="p-4 sm:p-5 bg-zinc-900/40 border border-zinc-800 rounded-xl space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-sm font-semibold text-zinc-200">
            <GitBranch className="w-4 h-4 text-emerald-400" />
            <span>GitHub Storage Backend (Database-Free)</span>
          </div>
          <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            Target: Main Branch
          </span>
        </div>

        <p className="text-xs text-zinc-400 leading-relaxed">
          Every tool addition, modification, and deletion triggers an atomic commit via the GitHub REST API with SHA concurrency protection. Local JSON serves as instant fallback if the GitHub API is temporarily unconfigured.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 border-t border-zinc-800/80 font-mono text-xs text-zinc-400">
          <div>Storage Path: <strong className="text-zinc-200">data/tools.json</strong></div>
          <div>Categories Path: <strong className="text-zinc-200">data/categories.json</strong></div>
          <div>Settings Path: <strong className="text-zinc-200">data/settings.json</strong></div>
        </div>
      </div>

      {/* Recent Tools Table */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-white tracking-tight">
            Recently Updated Tools
          </h2>
          <Link
            href="/admin/tools"
            className="text-xs text-emerald-400 hover:underline flex items-center gap-1 font-medium"
          >
            <span>Manage All ({totalTools})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="bg-[#0d0f17] border border-zinc-800 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-900/60 border-b border-zinc-800 text-zinc-400 font-mono">
                <tr>
                  <th className="py-3 px-4">Tool</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Flags</th>
                  <th className="py-3 px-4">Last Updated</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {tools.slice(0, 6).map((tool) => {
                  return (
                    <tr key={tool.id} className="hover:bg-zinc-900/30 transition">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-emerald-400 shrink-0">
                            <DynamicIcon name={tool.icon} className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <div className="font-semibold text-zinc-200">{tool.name}</div>
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
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/admin/tools/${tool.id}`}
                            className="px-2.5 py-1 text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded border border-zinc-700 transition"
                          >
                            Edit
                          </Link>
                          <Link
                            href={`/tools/${tool.slug}`}
                            target="_blank"
                            className="p-1 text-zinc-400 hover:text-zinc-200 transition"
                            title="Open live view"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
