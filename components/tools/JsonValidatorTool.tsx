'use client';

import React, { useState } from 'react';
import { ShieldCheck, CheckCircle2, XCircle, RotateCcw, Copy, Check } from 'lucide-react';

export default function JsonValidatorTool() {
  const [input, setInput] = useState('{\n  "status": "success",\n  "code": 200,\n  "data": {\n    "message": "Valid payload"\n  }\n}');
  const [result, setResult] = useState<{
    valid: boolean;
    error?: string;
    details?: { keys: number; depth: number; bytes: number };
  } | null>({ valid: true, details: { keys: 3, depth: 2, bytes: 85 } });
  const [copied, setCopied] = useState(false);

  const validate = () => {
    if (!input.trim()) {
      setResult(null);
      return;
    }
    try {
      const parsed = JSON.parse(input);
      const getDepth = (obj: unknown): number => {
        if (typeof obj !== 'object' || obj === null) return 0;
        const depths = Object.values(obj).map(getDepth);
        return 1 + (depths.length ? Math.max(...depths) : 0);
      };
      const keys = typeof parsed === 'object' && parsed !== null ? Object.keys(parsed).length : 1;
      const depth = getDepth(parsed);
      const bytes = new Blob([input]).size;

      setResult({
        valid: true,
        details: { keys, depth, bytes },
      });
    } catch (err) {
      setResult({
        valid: false,
        error: err instanceof Error ? err.message : 'Invalid JSON Syntax',
      });
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
      <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-zinc-900/60 border border-zinc-800/80 rounded-xl text-xs">
        <div className="flex items-center gap-2 text-emerald-400 font-medium">
          <ShieldCheck className="w-4 h-4" />
          <span>Runs locally in your browser</span>
        </div>
        <span className="text-zinc-500 font-mono">Real-time syntax diagnostics</span>
      </div>

      <textarea
        id="json-validator-input"
        value={input}
        onChange={(e) => {
          setInput(e.target.value);
        }}
        placeholder="Enter JSON text to validate..."
        rows={12}
        spellCheck={false}
        className="w-full bg-[#0d0f17] border border-zinc-800 text-zinc-200 font-mono text-xs sm:text-sm p-4 rounded-xl focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30 resize-y leading-relaxed transition shadow-inner"
      />

      {/* Result banner */}
      {result && (
        <div
          className={`p-4 rounded-xl border text-xs sm:text-sm font-sans flex items-start gap-3 transition ${
            result.valid
              ? 'bg-emerald-950/20 border-emerald-800/60 text-emerald-300'
              : 'bg-rose-950/30 border-rose-800/60 text-rose-300'
          }`}
        >
          {result.valid ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          ) : (
            <XCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          )}
          <div className="flex-1 space-y-1">
            <p className="font-semibold text-sm">
              {result.valid ? 'Valid JSON Format' : 'Syntax Error Detected'}
            </p>
            {result.valid && result.details && (
              <div className="flex flex-wrap gap-4 text-xs text-zinc-400 font-mono pt-1">
                <span>Keys: <strong className="text-zinc-200">{result.details.keys}</strong></span>
                <span>Max Depth: <strong className="text-zinc-200">{result.details.depth}</strong></span>
                <span>Size: <strong className="text-zinc-200">{result.details.bytes} B</strong></span>
              </div>
            )}
            {!result.valid && (
              <p className="font-mono text-xs text-rose-400/90 break-all">{result.error}</p>
            )}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-2">
          <button
            id="btn-validate-json"
            onClick={validate}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs sm:text-sm rounded-lg transition active:scale-95 shadow-sm"
          >
            <CheckCircle2 className="w-4 h-4" />
            Validate JSON
          </button>
          <button
            id="btn-clear-validator"
            onClick={() => {
              setInput('');
              setResult(null);
            }}
            className="flex items-center gap-1 px-3 py-2.5 text-zinc-400 hover:text-rose-400 text-xs sm:text-sm rounded-lg transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Clear
          </button>
        </div>

        <button
          id="btn-copy-validator-text"
          onClick={handleCopy}
          disabled={!input}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 text-zinc-200 text-xs sm:text-sm rounded-lg transition border border-zinc-700 font-medium"
        >
          {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
    </div>
  );
}
