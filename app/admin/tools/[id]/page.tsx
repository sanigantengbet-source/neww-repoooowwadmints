'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import ToolForm from '@/components/admin/ToolForm';
import type { Tool } from '@/types';
import { AlertCircle } from 'lucide-react';

export default function EditToolPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const [tool, setTool] = useState<Tool | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    fetch('/api/admin/tools')
      .then((res) => res.json())
      .then((data) => {
        const found = (data.tools || []).find((t: Tool) => t.id === id);
        if (found) {
          setTool(found);
        } else {
          setError(`Tool with ID "${id}" was not found.`);
        }
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Failed to fetch tool');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div className="p-8 text-center text-zinc-500 font-mono text-xs">
        Loading tool data...
      </div>
    );
  }

  if (error || !tool) {
    return (
      <div className="p-6 bg-rose-950/30 border border-rose-800/60 rounded-xl text-rose-300 space-y-2">
        <div className="flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-rose-400" />
          <h2 className="font-semibold text-sm">Error Loading Tool</h2>
        </div>
        <p className="text-xs">{error || 'Tool not found'}</p>
        <button
          onClick={() => router.push('/admin/tools')}
          className="mt-2 text-xs text-rose-400 underline"
        >
          Return to Tools Catalog
        </button>
      </div>
    );
  }

  return (
    <div>
      <ToolForm initialData={tool} isEdit={true} />
    </div>
  );
}
