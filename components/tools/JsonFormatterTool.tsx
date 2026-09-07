'use client';

import React, { useState } from 'react';
import { Copy, Check, RotateCcw, Sparkles, ShieldCheck, AlertCircle } from 'lucide-react';

const SAMPLE_JSON = `{
  "platform": "SANN TOOLS",
  "version": "1.0.0",
  "features": ["browser-first", "client-side", "github-storage"],
  "stats": {
    "active": true,
    "speedMs": 1.2
  }
}`;

export default function JsonFormatterTool() {
  const [input, setInput] = useState(SAMPLE_JSON);
  const [indent, setIndent] = useState<'2' | '4' | 'tab'>('2');
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const formatJson = (spaces: '2' | '4' | 'tab' = indent) => {
    if (!input.trim()) {
      setError(null);
      return;
    }
    try {
      const parsed = JSON.parse(input);
      const spaceVal = spaces === 'tab' ? '\t' : Number(spaces);
      const formatted = JSON.stringify(parsed, null, spaceVal);
      setInput(formatted);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid JSON format');
    }
  };

  const minifyJson = () => {
    if (!input.trim()) return;
    try {
      const parsed = JSON.parse(input);
      setInput(JSON.stringify(parsed));
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid JSON format');
    }
  };

  const handleCopy = async () => {
    if (!input) return;
    await navigator.clipboard.writeText(input);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4">
      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-zinc-900/60 border border-zinc-800/80 rounded-xl text-xs">
        <div className="flex items-center gap-2 text-emerald-400 font-medium">
          <ShieldCheck className="w-4 h-4" />
          <span>Runs locally in your browser</span>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-zinc-400">Indent:</label>
          <div className="inline-flex rounded-lg bg-zinc-800 p-0.5 border border-zinc-700/50">
            {(['2', '4', 'tab'] as const).map((opt) => (
              <button
                key={opt}
                id={`indent-btn-${opt}`}
                onClick={() => {
                  setIndent(opt);
                  formatJson(opt);
                }}
                className={`px-2.5 py-1 text-xs rounded-md transition font-mono ${
                  indent === opt
                    ? 'bg-zinc-700 text-white font-semibold'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {opt === 'tab' ? 'Tab' : `${opt} sp`}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Editor box */}
      <div className="relative">
        <textarea
          id="json-formatter-input"
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            if (error) setError(null);
          }}
          placeholder="Paste or type raw JSON here..."
          rows={14}
          spellCheck={false}
          className="w-full bg-[#0d0f17] border border-zinc-800 text-zinc-200 font-mono text-xs sm:text-sm p-4 rounded-xl focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30 resize-y leading-relaxed transition shadow-inner"
        />

        {error && (
          <div className="mt-2 flex items-start gap-2 p-3 bg-rose-950/40 border border-rose-800/50 text-rose-300 rounded-lg text-xs font-mono">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <div className="overflow-x-auto">{error}</div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
        <div className="flex flex-wrap gap-2">
          <button
            id="btn-beautify-json"
            onClick={() => formatJson()}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs sm:text-sm rounded-lg transition active:scale-95 shadow-sm"
          >
            <Sparkles className="w-4 h-4" />
            Beautify
          </button>
          <button
            id="btn-minify-json"
            onClick={minifyJson}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs sm:text-sm rounded-lg transition border border-zinc-700 active:scale-95"
          >
            Minify
          </button>
          <button
            id="btn-load-sample"
            onClick={() => {
              setInput(SAMPLE_JSON);
              setError(null);
            }}
            className="px-3 py-2.5 text-zinc-400 hover:text-zinc-200 text-xs sm:text-sm rounded-lg transition"
          >
            Sample
          </button>
          <button
            id="btn-clear-json"
            onClick={() => {
              setInput('');
              setError(null);
            }}
            className="flex items-center gap-1 px-3 py-2.5 text-zinc-400 hover:text-rose-400 text-xs sm:text-sm rounded-lg transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Clear
          </button>
        </div>

        <button
          id="btn-copy-json"
          onClick={handleCopy}
          disabled={!input}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 text-zinc-200 text-xs sm:text-sm rounded-lg transition border border-zinc-700 active:scale-95 font-medium ml-auto"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4 text-emerald-400" />
              <span className="text-emerald-400 font-semibold">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
