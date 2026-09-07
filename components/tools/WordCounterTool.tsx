'use client';

import React, { useState } from 'react';
import { ShieldCheck, RotateCcw, Copy, Check } from 'lucide-react';

const SAMPLE_TEXT = `SANN TOOLS is an open, serverless collection of browser utilities built for developers, creators, and everyday internet users.

All computations occur directly in your browser without transmitting sensitive input data to remote servers. This ensures maximum privacy, low latency, and zero telemetry.`;

export default function WordCounterTool() {
  const [text, setText] = useState<string>(SAMPLE_TEXT);
  const [copied, setCopied] = useState<boolean>(false);

  // Compute metrics
  const clean = text.trim();
  const words = clean ? clean.split(/\s+/).filter(Boolean).length : 0;
  const charsWithSpaces = text.length;
  const charsNoSpaces = text.replace(/\s/g, '').length;
  const sentences = clean ? clean.split(/[.!?]+/).filter((s) => s.trim().length > 0).length : 0;
  const paragraphs = clean ? clean.split(/\n+/).filter((p) => p.trim().length > 0).length : 0;

  const readingTimeMin = Math.ceil(words / 200);
  const speakingTimeMin = Math.ceil(words / 130);

  // Top keywords
  const getWordFrequency = () => {
    if (!clean) return [];
    const counts: Record<string, number> = {};
    const tokens = clean
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .split(/\s+/)
      .filter((w) => w.length > 2);

    for (const t of tokens) {
      counts[t] = (counts[t] || 0) + 1;
    }

    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6);
  };

  const frequencies = getWordFrequency();

  const handleCopyStats = async () => {
    const summary = `Word Count: ${words}\nCharacters: ${charsWithSpaces}\nCharacters (no spaces): ${charsNoSpaces}\nSentences: ${sentences}\nParagraphs: ${paragraphs}\nReading Time: ~${readingTimeMin} min`;
    await navigator.clipboard.writeText(summary);
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
        <span className="text-zinc-400">Live text metrics & reading time</span>
      </div>

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <div className="p-3 bg-[#0d0f17] border border-zinc-800 rounded-xl text-center">
          <div className="text-[11px] text-zinc-400 font-medium">Words</div>
          <div className="text-xl sm:text-2xl font-bold font-mono text-emerald-400 mt-0.5">{words}</div>
        </div>

        <div className="p-3 bg-[#0d0f17] border border-zinc-800 rounded-xl text-center">
          <div className="text-[11px] text-zinc-400 font-medium">Characters</div>
          <div className="text-xl sm:text-2xl font-bold font-mono text-zinc-200 mt-0.5">{charsWithSpaces}</div>
        </div>

        <div className="p-3 bg-[#0d0f17] border border-zinc-800 rounded-xl text-center">
          <div className="text-[11px] text-zinc-400 font-medium">No Spaces</div>
          <div className="text-xl sm:text-2xl font-bold font-mono text-zinc-200 mt-0.5">{charsNoSpaces}</div>
        </div>

        <div className="p-3 bg-[#0d0f17] border border-zinc-800 rounded-xl text-center">
          <div className="text-[11px] text-zinc-400 font-medium">Sentences</div>
          <div className="text-xl sm:text-2xl font-bold font-mono text-zinc-200 mt-0.5">{sentences}</div>
        </div>

        <div className="p-3 bg-[#0d0f17] border border-zinc-800 rounded-xl text-center col-span-2 sm:col-span-1">
          <div className="text-[11px] text-zinc-400 font-medium">Reading Time</div>
          <div className="text-xl sm:text-2xl font-bold font-mono text-emerald-400 mt-0.5">~{readingTimeMin}m</div>
        </div>
      </div>

      {/* Textarea */}
      <textarea
        id="word-counter-input"
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={10}
        placeholder="Start typing or paste your content here..."
        className="w-full bg-[#0d0f17] border border-zinc-800 text-zinc-200 text-xs sm:text-sm p-4 rounded-xl focus:outline-none focus:border-emerald-500/50 resize-y leading-relaxed transition shadow-inner"
      />

      {/* Frequency analysis and bottom actions */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-1">
        {frequencies.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="text-zinc-500">Top words:</span>
            {frequencies.map(([word, cnt]) => (
              <span
                key={word}
                className="px-2 py-0.5 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-300 font-mono text-[11px]"
              >
                {word} <span className="text-emerald-400 font-bold">({cnt})</span>
              </span>
            ))}
          </div>
        )}

        <div className="flex items-center gap-2 ml-auto">
          <button
            id="btn-clear-words"
            onClick={() => setText('')}
            className="flex items-center gap-1 px-3 py-2 text-zinc-400 hover:text-rose-400 text-xs rounded-lg transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Clear
          </button>
          <button
            id="btn-copy-stats"
            onClick={handleCopyStats}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs rounded-lg border border-zinc-700 transition"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy Stats'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
