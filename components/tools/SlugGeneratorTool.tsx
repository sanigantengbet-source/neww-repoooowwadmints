'use client';

import React, { useState } from 'react';
import { ShieldCheck, Copy, Check, RotateCcw } from 'lucide-react';

export default function SlugGeneratorTool() {
  const [input, setInput] = useState('How to Build a Production Ready Web Tool in 2026!');
  const [separator, setSeparator] = useState<'-' | '_' | '.'>('-');
  const [lowercase, setLowercase] = useState<boolean>(true);
  const [removeStopWords, setRemoveStopWords] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  const STOP_WORDS = new Set([
    'a', 'an', 'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'with', 'by', 'of', 'from',
    'yang', 'di', 'ke', 'dari', 'dan', 'atau', 'untuk', 'dengan', 'pada', 'adalah'
  ]);

  const generateSlug = (text: string): string => {
    if (!text.trim()) return '';
    let processed = text.normalize('NFD').replace(/[\u0300-\u036f]/g, '');

    if (lowercase) {
      processed = processed.toLowerCase();
    }

    if (removeStopWords) {
      const words = processed.split(/\s+/);
      processed = words
        .filter((w) => !STOP_WORDS.has(w.toLowerCase().replace(/[^a-z0-9]/g, '')))
        .join(' ');
    }

    // Replace non-alphanumeric with separator
    const sepEscaped = separator === '.' ? '\\.' : separator;
    const regex = new RegExp(`[^a-zA-Z0-9${sepEscaped}]+`, 'g');
    processed = processed.replace(regex, separator);

    // Remove duplicate separators
    const dupRegex = new RegExp(`${sepEscaped}+`, 'g');
    processed = processed.replace(dupRegex, separator);

    // Trim separators from start and end
    const trimRegex = new RegExp(`^${sepEscaped}+|${sepEscaped}+$`, 'g');
    return processed.replace(trimRegex, '');
  };

  const slug = generateSlug(input);

  const handleCopy = async () => {
    if (!slug) return;
    await navigator.clipboard.writeText(slug);
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
        <span className="text-zinc-400">SEO friendly URL generation</span>
      </div>

      <div className="space-y-3">
        <div>
          <label className="block text-xs text-zinc-400 mb-1.5 font-medium">
            Input Headline / Title
          </label>
          <textarea
            id="slug-text-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            rows={3}
            placeholder="Type any article or page title here..."
            className="w-full bg-[#0d0f17] border border-zinc-800 text-zinc-200 text-sm p-3.5 rounded-xl focus:outline-none focus:border-emerald-500/50 resize-y transition"
          />
        </div>

        {/* Options */}
        <div className="p-3 bg-zinc-900/40 border border-zinc-800/80 rounded-xl flex flex-wrap items-center gap-4 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-zinc-400">Separator:</span>
            <div className="inline-flex rounded bg-zinc-800 p-0.5 border border-zinc-700/50">
              {(['-', '_', '.'] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setSeparator(s)}
                  className={`px-2.5 py-1 rounded text-xs font-mono ${
                    separator === s ? 'bg-zinc-700 text-white font-bold' : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  {s === '-' ? 'Hyphen (-)' : s === '_' ? 'Underscore (_)' : 'Dot (.)'}
                </button>
              ))}
            </div>
          </div>

          <label className="flex items-center gap-1.5 cursor-pointer text-zinc-300">
            <input
              type="checkbox"
              id="slug-lower-toggle"
              checked={lowercase}
              onChange={(e) => setLowercase(e.target.checked)}
              className="rounded border-zinc-700 bg-zinc-800 text-emerald-500 focus:ring-0 w-3.5 h-3.5"
            />
            <span>Lowercase</span>
          </label>

          <label className="flex items-center gap-1.5 cursor-pointer text-zinc-300">
            <input
              type="checkbox"
              id="slug-stopwords-toggle"
              checked={removeStopWords}
              onChange={(e) => setRemoveStopWords(e.target.checked)}
              className="rounded border-zinc-700 bg-zinc-800 text-emerald-500 focus:ring-0 w-3.5 h-3.5"
            />
            <span>Remove stop words</span>
          </label>
        </div>

        {/* Output */}
        <div className="p-4 bg-[#0d0f17] border border-zinc-800 rounded-xl space-y-2">
          <div className="flex justify-between items-center text-xs text-zinc-400">
            <span>Generated Slug Preview</span>
            <span className="font-mono text-[11px] text-zinc-500">{slug.length} chars</span>
          </div>

          <div className="flex items-center justify-between gap-3 p-3 bg-zinc-900/60 rounded-lg border border-zinc-800/80">
            <span className="font-mono text-emerald-400 text-sm sm:text-base font-medium break-all select-all">
              {slug || 'empty-slug'}
            </span>
            <button
              id="btn-copy-slug"
              onClick={handleCopy}
              disabled={!slug}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-medium rounded-md transition shrink-0 active:scale-95"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
        </div>
      </div>

      <div className="flex justify-start">
        <button
          id="btn-clear-slug"
          onClick={() => setInput('')}
          className="flex items-center gap-1 text-xs text-zinc-400 hover:text-rose-400 transition"
        >
          <RotateCcw className="w-3 h-3" />
          Clear input
        </button>
      </div>
    </div>
  );
}
