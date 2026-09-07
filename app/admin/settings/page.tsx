'use client';

import React, { useState, useEffect } from 'react';
import type { Settings } from '@/types';
import {
  Settings as SettingsIcon,
  Save,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  GitCommit,
  Shield,
  Sliders,
} from 'lucide-react';

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Settings>({
    siteName: 'SANN TOOLS',
    siteDescription: 'Web utility tools collection',
    maintenanceMode: false,
    featuredToolLimit: 6,
    popularToolLimit: 6,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  useEffect(() => {
    fetch('/api/admin/settings')
      .then((res) => res.json())
      .then((d) => {
        if (d.settings) {
          setSettings(d.settings);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setFeedback(null);

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update settings');
      }

      setFeedback({
        type: 'success',
        msg: `Settings updated successfully. Commit SHA: ${data.commitSha ? data.commitSha.slice(0, 7) : 'recorded'}`,
      });
    } catch (err) {
      setFeedback({
        type: 'error',
        msg: err instanceof Error ? err.message : 'Update failed',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
          Site Configuration
        </h1>
        <p className="text-xs sm:text-sm text-zinc-400 mt-1">
          Global platform settings committed directly to <code className="text-emerald-400 font-mono">data/settings.json</code>.
        </p>
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

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="p-5 bg-[#0d0f17] border border-zinc-800 rounded-xl space-y-4 text-xs sm:text-sm">
          <div>
            <label className="block text-zinc-300 font-medium mb-1">
              Platform Brand Name
            </label>
            <input
              type="text"
              required
              value={settings.siteName}
              onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
              className="w-full bg-zinc-900 border border-zinc-800 text-zinc-200 text-xs sm:text-sm px-3.5 py-2.5 rounded-lg focus:outline-none focus:border-emerald-500/50 font-medium"
            />
          </div>

          <div>
            <label className="block text-zinc-300 font-medium mb-1">
              Platform Description
            </label>
            <textarea
              rows={3}
              value={settings.siteDescription}
              onChange={(e) =>
                setSettings({ ...settings, siteDescription: e.target.value })
              }
              className="w-full bg-zinc-900 border border-zinc-800 text-zinc-200 text-xs sm:text-sm p-3.5 rounded-lg focus:outline-none focus:border-emerald-500/50 resize-y"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-zinc-300 font-medium mb-1">
                Featured Tools Limit
              </label>
              <input
                type="number"
                min={1}
                max={24}
                value={settings.featuredToolLimit}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    featuredToolLimit: Number(e.target.value),
                  })
                }
                className="w-full bg-zinc-900 border border-zinc-800 text-zinc-200 font-mono text-xs sm:text-sm px-3 py-2 rounded-lg focus:outline-none focus:border-emerald-500/50"
              />
            </div>

            <div>
              <label className="block text-zinc-300 font-medium mb-1">
                Popular Tools Limit
              </label>
              <input
                type="number"
                min={1}
                max={24}
                value={settings.popularToolLimit}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    popularToolLimit: Number(e.target.value),
                  })
                }
                className="w-full bg-zinc-900 border border-zinc-800 text-zinc-200 font-mono text-xs sm:text-sm px-3 py-2 rounded-lg focus:outline-none focus:border-emerald-500/50"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-zinc-800/80">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.maintenanceMode}
                onChange={(e) =>
                  setSettings({ ...settings, maintenanceMode: e.target.checked })
                }
                className="rounded border-zinc-700 bg-zinc-800 text-rose-500 focus:ring-0 w-4 h-4"
              />
              <div>
                <span className="font-semibold text-zinc-200 block">
                  Maintenance Mode
                </span>
                <span className="text-zinc-500 text-xs">
                  Display maintenance advisory banner across public pages.
                </span>
              </div>
            </label>
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs sm:text-sm font-semibold rounded-lg transition active:scale-95 shadow-sm"
        >
          {saving ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          <span>{saving ? 'Committing Settings...' : 'Save Settings to GitHub'}</span>
        </button>
      </form>
    </div>
  );
}
