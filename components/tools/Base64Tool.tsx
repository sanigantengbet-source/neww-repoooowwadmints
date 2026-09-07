'use client';

import React, { useState } from 'react';
import { ShieldCheck, ArrowRightLeft, Copy, Check, RotateCcw, Upload } from 'lucide-react';

export default function Base64Tool() {
  const [mode, setMode] = useState<'encode' | 'decode'>('encode');
  const [input, setInput] = useState('Hello, SANN TOOLS! 🚀');
  const [urlSafe, setUrlSafe] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const convert = (text: string, currentMode: 'encode' | 'decode', isUrlSafe: boolean): string => {
    if (!text) {
      setError(null);
      return '';
    }
    try {
      if (currentMode === 'encode') {
        const bytes = new TextEncoder().encode(text);
        let binary = '';
        for (let i = 0; i < bytes.byteLength; i++) {
          binary += String.fromCharCode(bytes[i]);
        }
        let b64 = btoa(binary);
        if (isUrlSafe) {
          b64 = b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
        }
        setError(null);
        return b64;
      } else {
        let clean = text.trim();
        if (isUrlSafe) {
          clean = clean.replace(/-/g, '+').replace(/_/g, '/');
          while (clean.length % 4) clean += '=';
        }
        const binary = atob(clean);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) {
          bytes[i] = binary.charCodeAt(i);
        }
        setError(null);
        return new TextDecoder().decode(bytes);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Base64 conversion failed');
      return '';
    }
  };

  const output = convert(input, mode, urlSafe);

  const handleCopy = async () => {
    if (!output) return;
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result;
      if (typeof result === 'string') {
        if (result.includes('base64,')) {
          setInput(result.split('base64,')[1]);
        } else {
          setInput(result);
        }
      }
    };
    if (mode === 'decode') {
      reader.readAsText(file);
    } else {
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-zinc-900/60 border border-zinc-800/80 rounded-xl text-xs">
        <div className="flex items-center gap-2 text-emerald-400 font-medium">
          <ShieldCheck className="w-4 h-4" />
          <span>Runs locally in your browser</span>
        </div>

        <div className="flex items-center gap-3">
          <label className="flex items-center gap-1.5 cursor-pointer text-zinc-300 select-none">
            <input
              type="checkbox"
              id="base64-urlsafe-toggle"
              checked={urlSafe}
              onChange={(e) => setUrlSafe(e.target.checked)}
              className="rounded border-zinc-700 bg-zinc-800 text-emerald-500 focus:ring-0 w-3.5 h-3.5"
            />
            <span>URL-safe Base64</span>
          </label>

          <div className="inline-flex rounded-lg bg-zinc-800 p-0.5 border border-zinc-700/50">
            <button
              id="mode-encode"
              onClick={() => {
                setMode('encode');
                setError(null);
              }}
              className={`px-3 py-1 text-xs rounded-md transition font-medium ${
                mode === 'encode' ? 'bg-zinc-700 text-white font-semibold' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Encode
            </button>
            <button
              id="mode-decode"
              onClick={() => {
                setMode('decode');
                setError(null);
              }}
              className={`px-3 py-1 text-xs rounded-md transition font-medium ${
                mode === 'decode' ? 'bg-zinc-700 text-white font-semibold' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Decode
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Input */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs text-zinc-400 px-1">
            <span>{mode === 'encode' ? 'Plain Text Input' : 'Base64 Encoded Input'}</span>
            <label className="flex items-center gap-1 text-zinc-400 hover:text-emerald-400 cursor-pointer transition">
              <Upload className="w-3 h-3" />
              <span>Load file</span>
              <input type="file" onChange={handleFileUpload} className="hidden" />
            </label>
          </div>
          <textarea
            id="base64-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            rows={8}
            placeholder={mode === 'encode' ? 'Enter text to encode...' : 'Paste Base64 to decode...'}
            className="w-full bg-[#0d0f17] border border-zinc-800 text-zinc-200 font-mono text-xs sm:text-sm p-3.5 rounded-xl focus:outline-none focus:border-emerald-500/50 resize-y transition"
          />
        </div>

        {/* Output */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs text-zinc-400 px-1">
            <span>{mode === 'encode' ? 'Base64 Result' : 'Decoded Plain Text'}</span>
            <span className="font-mono text-[11px] text-zinc-500">
              {output.length} characters
            </span>
          </div>
          <div className="relative">
            <textarea
              id="base64-output"
              value={output}
              readOnly
              rows={8}
              placeholder="Conversion output appears here..."
              className="w-full bg-[#0d0f17] border border-zinc-800/80 text-emerald-400 font-mono text-xs sm:text-sm p-3.5 rounded-xl focus:outline-none resize-y transition shadow-inner select-all"
            />
          </div>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-rose-950/40 border border-rose-800/50 text-rose-300 rounded-lg text-xs font-mono">
          {error}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between gap-3 pt-1">
        <div className="flex gap-2">
          <button
            id="btn-swap-base64"
            onClick={() => {
              if (output) {
                setInput(output);
                setMode(mode === 'encode' ? 'decode' : 'encode');
              }
            }}
            disabled={!output}
            className="flex items-center gap-1.5 px-3 py-2 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 text-zinc-300 text-xs sm:text-sm rounded-lg transition border border-zinc-700"
          >
            <ArrowRightLeft className="w-3.5 h-3.5" />
            Swap
          </button>
          <button
            id="btn-clear-base64"
            onClick={() => {
              setInput('');
              setError(null);
            }}
            className="flex items-center gap-1 px-3 py-2 text-zinc-400 hover:text-rose-400 text-xs sm:text-sm rounded-lg transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Clear
          </button>
        </div>

        <button
          id="btn-copy-base64"
          onClick={handleCopy}
          disabled={!output}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-medium text-xs sm:text-sm rounded-lg transition active:scale-95 shadow-sm"
        >
          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          {copied ? 'Copied!' : 'Copy Result'}
        </button>
      </div>
    </div>
  );
}
