'use client';

import React, { useState } from 'react';
import { ShieldCheck, ArrowRightLeft, Copy, Check, RotateCcw } from 'lucide-react';

export default function UrlEncoderTool() {
  const [mode, setMode] = useState<'encode' | 'decode'>('encode');
  const [encodeType, setEncodeType] = useState<'component' | 'full'>('component');
  const [input, setInput] = useState('https://sann-tools.vercel.app/search?query=web utilities&lang=en&category=security');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const processUrl = (): string => {
    if (!input) return '';
    try {
      setError(null);
      if (mode === 'encode') {
        return encodeType === 'component' ? encodeURIComponent(input) : encodeURI(input);
      } else {
        return decodeURIComponent(input);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Malformed URI sequence');
      return '';
    }
  };

  const output = processUrl();

  // Parse query parameters if input is a valid URL
  const getQueryParams = (): Array<[string, string]> => {
    try {
      const urlStr = input.startsWith('http://') || input.startsWith('https://')
        ? input
        : `https://example.com/${input.startsWith('?') ? '' : '?'}${input}`;
      const url = new URL(urlStr);
      const params: Array<[string, string]> = [];
      url.searchParams.forEach((v, k) => {
        params.push([k, v]);
      });
      return params;
    } catch {
      return [];
    }
  };

  const queryParams = getQueryParams();

  const handleCopy = async () => {
    if (!output) return;
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-zinc-900/60 border border-zinc-800/80 rounded-xl text-xs">
        <div className="flex items-center gap-2 text-emerald-400 font-medium">
          <ShieldCheck className="w-4 h-4" />
          <span>Runs locally in your browser</span>
        </div>

        <div className="flex items-center gap-2">
          {mode === 'encode' && (
            <select
              value={encodeType}
              onChange={(e) => setEncodeType(e.target.value as 'component' | 'full')}
              className="bg-zinc-800 border border-zinc-700 text-zinc-200 text-xs px-2 py-1 rounded-md focus:outline-none"
            >
              <option value="component">encodeURIComponent (Strict)</option>
              <option value="full">encodeURI (Preserve protocol/host)</option>
            </select>
          )}

          <div className="inline-flex rounded-lg bg-zinc-800 p-0.5 border border-zinc-700/50">
            <button
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
        <div className="space-y-1.5">
          <div className="text-xs text-zinc-400 px-1">
            {mode === 'encode' ? 'Decoded / Plain URL' : 'Encoded URL Input'}
          </div>
          <textarea
            id="url-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            rows={7}
            placeholder="Type or paste URL here..."
            className="w-full bg-[#0d0f17] border border-zinc-800 text-zinc-200 font-mono text-xs sm:text-sm p-3.5 rounded-xl focus:outline-none focus:border-emerald-500/50 resize-y transition"
          />
        </div>

        <div className="space-y-1.5">
          <div className="text-xs text-zinc-400 px-1">
            {mode === 'encode' ? 'Encoded URL Output' : 'Decoded URL Output'}
          </div>
          <textarea
            id="url-output"
            value={output}
            readOnly
            rows={7}
            placeholder="Output will appear here..."
            className="w-full bg-[#0d0f17] border border-zinc-800/80 text-emerald-400 font-mono text-xs sm:text-sm p-3.5 rounded-xl focus:outline-none resize-y transition shadow-inner select-all"
          />
        </div>
      </div>

      {error && (
        <div className="p-3 bg-rose-950/40 border border-rose-800/50 text-rose-300 rounded-lg text-xs font-mono">
          {error}
        </div>
      )}

      {/* Query parameters breakdown inspector */}
      {queryParams.length > 0 && (
        <div className="p-4 bg-zinc-900/40 border border-zinc-800/80 rounded-xl space-y-2">
          <h4 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">
            Detected Query Parameters ({queryParams.length})
          </h4>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-400">
                  <th className="py-1.5 pr-4">Parameter Key</th>
                  <th className="py-1.5">Value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {queryParams.map(([key, val], i) => (
                  <tr key={i} className="hover:bg-zinc-800/30">
                    <td className="py-1.5 pr-4 text-emerald-400">{key}</td>
                    <td className="py-1.5 text-zinc-300 break-all">{val}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between gap-3 pt-1">
        <div className="flex gap-2">
          <button
            id="btn-swap-url"
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
            id="btn-clear-url"
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
          id="btn-copy-url"
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
