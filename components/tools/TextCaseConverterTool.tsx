'use client';

import React, { useState } from 'react';
import { ShieldCheck, Copy, Check, RotateCcw } from 'lucide-react';

export default function TextCaseConverterTool() {
  const [input, setInput] = useState<string>('Sann tools fast and privacy friendly web utilities');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Case transform algorithms
  const getWords = (str: string): string[] => {
    return str
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      .replace(/[^a-zA-Z0-9]+/g, ' ')
      .trim()
      .split(/\s+/)
      .filter(Boolean);
  };

  const words = getWords(input);

  const conversions = [
    {
      key: 'upper',
      name: 'UPPERCASE',
      val: input.toUpperCase(),
    },
    {
      key: 'lower',
      name: 'lowercase',
      val: input.toLowerCase(),
    },
    {
      key: 'title',
      name: 'Title Case',
      val: words.map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' '),
    },
    {
      key: 'sentence',
      name: 'Sentence case',
      val: input.charAt(0).toUpperCase() + input.slice(1).toLowerCase(),
    },
    {
      key: 'camel',
      name: 'camelCase',
      val: words
        .map((w, i) =>
          i === 0
            ? w.toLowerCase()
            : w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()
        )
        .join(''),
    },
    {
      key: 'pascal',
      name: 'PascalCase',
      val: words.map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(''),
    },
    {
      key: 'snake',
      name: 'snake_case',
      val: words.map((w) => w.toLowerCase()).join('_'),
    },
    {
      key: 'kebab',
      name: 'kebab-case',
      val: words.map((w) => w.toLowerCase()).join('-'),
    },
    {
      key: 'constant',
      name: 'CONSTANT_CASE',
      val: words.map((w) => w.toUpperCase()).join('_'),
    },
    {
      key: 'dot',
      name: 'dot.case',
      val: words.map((w) => w.toLowerCase()).join('.'),
    },
  ];

  const handleCopy = async (val: string, key: string) => {
    await navigator.clipboard.writeText(val);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1500);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-zinc-900/60 border border-zinc-800/80 rounded-xl text-xs">
        <div className="flex items-center gap-2 text-emerald-400 font-medium">
          <ShieldCheck className="w-4 h-4" />
          <span>Runs locally in your browser</span>
        </div>
        <span className="text-zinc-400">Transform between 10 case styles</span>
      </div>

      <div>
        <label className="block text-xs text-zinc-400 mb-1.5 font-medium">
          Source Text
        </label>
        <textarea
          id="text-case-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          rows={3}
          placeholder="Type or paste text to convert..."
          className="w-full bg-[#0d0f17] border border-zinc-800 text-zinc-200 text-sm p-3.5 rounded-xl focus:outline-none focus:border-emerald-500/50 resize-y transition shadow-inner"
        />
      </div>

      {/* Grid of transformed case styles */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
        {conversions.map((item) => (
          <div
            key={item.key}
            className="flex items-center justify-between p-3 bg-[#0d0f17] border border-zinc-800 rounded-xl hover:border-zinc-700 transition group"
          >
            <div className="min-w-0 flex-1 pr-2">
              <div className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
                {item.name}
              </div>
              <div className="font-mono text-xs sm:text-sm text-zinc-200 truncate mt-0.5 select-all">
                {item.val || '—'}
              </div>
            </div>

            <button
              id={`copy-case-${item.key}`}
              onClick={() => handleCopy(item.val, item.key)}
              disabled={!item.val}
              className="p-2 text-zinc-400 hover:text-white rounded-lg bg-zinc-800/60 hover:bg-zinc-700 transition shrink-0"
              title="Copy to clipboard"
            >
              {copiedKey === item.key ? (
                <Check className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
        ))}
      </div>

      <div className="flex justify-start">
        <button
          id="btn-clear-text-case"
          onClick={() => setInput('')}
          className="flex items-center gap-1 text-xs text-zinc-400 hover:text-rose-400 transition"
        >
          <RotateCcw className="w-3 h-3" />
          Clear text
        </button>
      </div>
    </div>
  );
}
