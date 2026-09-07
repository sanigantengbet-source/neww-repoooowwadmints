'use client';

import React, { useState, useEffect } from 'react';
import { ShieldCheck, Clock, Copy, Check } from 'lucide-react';

export default function TimestampConverterTool() {
  const [currentEpoch, setCurrentEpoch] = useState<number>(() => Math.floor(Date.now() / 1000));
  const [epochInput, setEpochInput] = useState<string>(() => Math.floor(Date.now() / 1000).toString());
  const [dateInput, setDateInput] = useState<string>(() => new Date().toISOString().slice(0, 19));
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Live timer tick
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentEpoch(Math.floor(Date.now() / 1000));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Compute Human dates from epochInput
  const getParsedEpochDate = (): Date | null => {
    const num = Number(epochInput.trim());
    if (isNaN(num) || num <= 0) return null;
    // auto detect seconds vs milliseconds (e.g. > 100000000000 is ms)
    const ms = num > 100000000000 ? num : num * 1000;
    const d = new Date(ms);
    return isNaN(d.getTime()) ? null : d;
  };

  const parsedDate = getParsedEpochDate();

  // Compute Epoch from dateInput
  const getEpochFromDate = (): { seconds: number; ms: number } | null => {
    try {
      const d = new Date(dateInput);
      if (isNaN(d.getTime())) return null;
      return {
        seconds: Math.floor(d.getTime() / 1000),
        ms: d.getTime(),
      };
    } catch {
      return null;
    }
  };

  const computedEpoch = getEpochFromDate();

  const handleCopy = async (val: string, key: string) => {
    await navigator.clipboard.writeText(val);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1500);
  };

  const formatRelative = (d: Date, nowSec: number): string => {
    const diffSec = Math.floor(nowSec - d.getTime() / 1000);
    if (Math.abs(diffSec) < 5) return 'just now';
    const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
    if (Math.abs(diffSec) < 60) return rtf.format(-diffSec, 'second');
    const diffMin = Math.floor(diffSec / 60);
    if (Math.abs(diffMin) < 60) return rtf.format(-diffMin, 'minute');
    const diffHr = Math.floor(diffMin / 60);
    if (Math.abs(diffHr) < 24) return rtf.format(-diffHr, 'hour');
    const diffDays = Math.floor(diffHr / 24);
    return rtf.format(-diffDays, 'day');
  };

  return (
    <div className="space-y-4">
      {/* Live ticker banner */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-zinc-900/60 border border-zinc-800/80 rounded-xl text-xs sm:text-sm">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-emerald-400 animate-pulse" />
          <span className="text-zinc-400">Current Epoch Unix Time:</span>
          <span className="font-mono text-emerald-400 font-bold text-base">
            {currentEpoch}
          </span>
        </div>
        <div className="flex items-center gap-2 text-emerald-400 font-medium text-xs">
          <ShieldCheck className="w-4 h-4" />
          <span>Runs locally in browser</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Section 1: Timestamp to Human Date */}
        <div className="p-4 bg-[#0d0f17] border border-zinc-800 rounded-xl space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-zinc-200">
              Timestamp &rarr; Human Date
            </h3>
            <button
              onClick={() => setEpochInput(currentEpoch.toString())}
              className="text-xs text-emerald-400 hover:underline"
            >
              Set Current Time
            </button>
          </div>

          <div>
            <label className="block text-xs text-zinc-400 mb-1">
              Unix Epoch (Seconds or Milliseconds)
            </label>
            <input
              type="text"
              id="timestamp-epoch-input"
              value={epochInput}
              onChange={(e) => setEpochInput(e.target.value)}
              placeholder="e.g. 1772870400"
              className="w-full bg-zinc-900 border border-zinc-800 text-zinc-200 font-mono text-sm px-3 py-2 rounded-lg focus:outline-none focus:border-emerald-500/50"
            />
          </div>

          {parsedDate ? (
            <div className="space-y-2 pt-2 border-t border-zinc-800/80 text-xs font-mono">
              <div className="flex justify-between items-center p-2 rounded bg-zinc-900/40">
                <span className="text-zinc-400">UTC:</span>
                <span className="text-zinc-200">{parsedDate.toUTCString()}</span>
                <button
                  onClick={() => handleCopy(parsedDate.toUTCString(), 'utc')}
                  className="text-zinc-400 hover:text-white p-1"
                >
                  {copiedKey === 'utc' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>

              <div className="flex justify-between items-center p-2 rounded bg-zinc-900/40">
                <span className="text-zinc-400">Local:</span>
                <span className="text-zinc-200">{parsedDate.toString()}</span>
                <button
                  onClick={() => handleCopy(parsedDate.toString(), 'local')}
                  className="text-zinc-400 hover:text-white p-1"
                >
                  {copiedKey === 'local' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>

              <div className="flex justify-between items-center p-2 rounded bg-zinc-900/40">
                <span className="text-zinc-400">ISO 8601:</span>
                <span className="text-emerald-400">{parsedDate.toISOString()}</span>
                <button
                  onClick={() => handleCopy(parsedDate.toISOString(), 'iso')}
                  className="text-zinc-400 hover:text-white p-1"
                >
                  {copiedKey === 'iso' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>

              <div className="flex justify-between items-center p-2 rounded bg-zinc-900/40">
                <span className="text-zinc-400">Relative:</span>
                <span className="text-zinc-300 font-sans text-xs">{formatRelative(parsedDate, currentEpoch)}</span>
              </div>
            </div>
          ) : (
            <p className="text-xs text-rose-400 font-mono">Invalid timestamp input</p>
          )}
        </div>

        {/* Section 2: Human Date to Timestamp */}
        <div className="p-4 bg-[#0d0f17] border border-zinc-800 rounded-xl space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-zinc-200">
              Human Date &rarr; Timestamp
            </h3>
            <button
              onClick={() => setDateInput(new Date().toISOString().slice(0, 19))}
              className="text-xs text-emerald-400 hover:underline"
            >
              Set Current
            </button>
          </div>

          <div>
            <label className="block text-xs text-zinc-400 mb-1">
              Date & Time String (ISO or Local)
            </label>
            <input
              type="datetime-local"
              id="timestamp-datetime-input"
              value={dateInput}
              onChange={(e) => setDateInput(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 text-zinc-200 font-mono text-sm px-3 py-2 rounded-lg focus:outline-none focus:border-emerald-500/50"
            />
          </div>

          {computedEpoch ? (
            <div className="space-y-2 pt-2 border-t border-zinc-800/80 text-xs font-mono">
              <div className="flex justify-between items-center p-2 rounded bg-zinc-900/40">
                <span className="text-zinc-400">Seconds:</span>
                <span className="text-emerald-400 text-sm font-bold">{computedEpoch.seconds}</span>
                <button
                  onClick={() => handleCopy(computedEpoch.seconds.toString(), 'sec')}
                  className="text-zinc-400 hover:text-white p-1"
                >
                  {copiedKey === 'sec' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>

              <div className="flex justify-between items-center p-2 rounded bg-zinc-900/40">
                <span className="text-zinc-400">Milliseconds:</span>
                <span className="text-zinc-200">{computedEpoch.ms}</span>
                <button
                  onClick={() => handleCopy(computedEpoch.ms.toString(), 'ms')}
                  className="text-zinc-400 hover:text-white p-1"
                >
                  {copiedKey === 'ms' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          ) : (
            <p className="text-xs text-rose-400 font-mono">Invalid date input format</p>
          )}
        </div>
      </div>
    </div>
  );
}
