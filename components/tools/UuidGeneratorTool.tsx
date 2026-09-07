'use client';

import React, { useState } from 'react';
import { ShieldCheck, RefreshCw, Copy, Check, CheckCheck } from 'lucide-react';

export default function UuidGeneratorTool() {
  const [count, setCount] = useState<number>(5);
  const [uppercase, setUppercase] = useState<boolean>(false);
  const [hyphens, setHyphens] = useState<boolean>(true);
  const [uuids, setUuids] = useState<string[]>(() => generateUuids(5, false, true));
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [copiedAll, setCopiedAll] = useState<boolean>(false);

  function generateSingleUuid(isUpper: boolean, hasHyphens: boolean): string {
    let id = typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
          const r = (Math.random() * 16) | 0;
          const v = c === 'x' ? r : (r & 0x3) | 0x8;
          return v.toString(16);
        });

    if (!hasHyphens) id = id.replace(/-/g, '');
    if (isUpper) id = id.toUpperCase();
    return id;
  }

  function generateUuids(num: number, isUpper: boolean, hasHyphens: boolean): string[] {
    const arr: string[] = [];
    for (let i = 0; i < num; i++) {
      arr.push(generateSingleUuid(isUpper, hasHyphens));
    }
    return arr;
  }

  const handleRegenerate = () => {
    setUuids(generateUuids(count, uppercase, hyphens));
  };

  const copySingle = async (val: string, index: number) => {
    await navigator.clipboard.writeText(val);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 1500);
  };

  const copyAll = async () => {
    await navigator.clipboard.writeText(uuids.join('\n'));
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  return (
    <div className="space-y-4">
      {/* Control panel */}
      <div className="p-4 bg-zinc-900/60 border border-zinc-800/80 rounded-xl space-y-3 text-xs">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-emerald-400 font-medium">
            <ShieldCheck className="w-4 h-4" />
            <span>Runs locally with CSPRNG</span>
          </div>
          <span className="text-zinc-500 font-mono">RFC 4122 Version 4</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-zinc-800/60">
          <div>
            <label className="block text-zinc-400 mb-1">Quantity:</label>
            <div className="flex gap-1.5">
              {[1, 5, 10, 20].map((n) => (
                <button
                  key={n}
                  type="button"
                  id={`uuid-count-${n}`}
                  onClick={() => {
                    setCount(n);
                    setUuids(generateUuids(n, uppercase, hyphens));
                  }}
                  className={`px-2.5 py-1 rounded border text-xs font-mono transition ${
                    count === n
                      ? 'bg-zinc-700 text-white border-zinc-600 font-bold'
                      : 'bg-zinc-800 text-zinc-400 border-zinc-700/50 hover:text-zinc-200'
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4 sm:col-span-2 pt-2 sm:pt-4">
            <label className="flex items-center gap-1.5 cursor-pointer text-zinc-300">
              <input
                type="checkbox"
                id="uuid-hyphens-toggle"
                checked={hyphens}
                onChange={(e) => {
                  const val = e.target.checked;
                  setHyphens(val);
                  setUuids(generateUuids(count, uppercase, val));
                }}
                className="rounded border-zinc-700 bg-zinc-800 text-emerald-500 focus:ring-0 w-4 h-4"
              />
              <span>Include hyphens</span>
            </label>

            <label className="flex items-center gap-1.5 cursor-pointer text-zinc-300">
              <input
                type="checkbox"
                id="uuid-upper-toggle"
                checked={uppercase}
                onChange={(e) => {
                  const val = e.target.checked;
                  setUppercase(val);
                  setUuids(generateUuids(count, val, hyphens));
                }}
                className="rounded border-zinc-700 bg-zinc-800 text-emerald-500 focus:ring-0 w-4 h-4"
              />
              <span>Uppercase (HEX)</span>
            </label>
          </div>
        </div>
      </div>

      {/* UUID output list */}
      <div className="space-y-2">
        {uuids.map((idStr, idx) => (
          <div
            key={idx}
            className="flex items-center justify-between p-3 bg-[#0d0f17] border border-zinc-800 rounded-xl hover:border-zinc-700 transition group"
          >
            <span className="font-mono text-xs sm:text-sm text-zinc-200 break-all select-all pr-2">
              {idStr}
            </span>
            <button
              id={`copy-uuid-${idx}`}
              onClick={() => copySingle(idStr, idx)}
              className="p-1.5 text-zinc-400 hover:text-white rounded-lg bg-zinc-800/80 hover:bg-zinc-700 shrink-0 transition"
              title="Copy to clipboard"
            >
              {copiedIndex === idx ? (
                <Check className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between gap-3 pt-2">
        <button
          id="btn-regen-uuid"
          onClick={handleRegenerate}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs sm:text-sm rounded-lg transition active:scale-95 shadow-sm"
        >
          <RefreshCw className="w-4 h-4" />
          Generate New
        </button>

        <button
          id="btn-copy-all-uuid"
          onClick={copyAll}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-medium text-xs sm:text-sm rounded-lg transition border border-zinc-700 active:scale-95"
        >
          {copiedAll ? (
            <>
              <CheckCheck className="w-4 h-4 text-emerald-400" />
              <span className="text-emerald-400">All Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" />
              <span>Copy All ({uuids.length})</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
