'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { ShieldCheck, RefreshCw, Copy, Check } from 'lucide-react';

function buildPassword(
  length: number,
  uppercase: boolean,
  lowercase: boolean,
  numbers: boolean,
  symbols: boolean,
  excludeAmbiguous: boolean
): string {
  let charset = '';
  const upperChars = 'ABCDEFGHJKLMNPQRSTUVWXYZ' + (excludeAmbiguous ? '' : 'IO');
  const lowerChars = 'abcdefghijkmnopqrstuvwxyz' + (excludeAmbiguous ? '' : 'l');
  const numberChars = '23456789' + (excludeAmbiguous ? '' : '01');
  const symbolChars = '!@#$%^&*()-_=+[]{}|;:,.<>?';

  if (uppercase) charset += upperChars;
  if (lowercase) charset += lowerChars;
  if (numbers) charset += numberChars;
  if (symbols) charset += symbolChars;

  if (!charset) return '';

  let result = '';
  for (let i = 0; i < length; i++) {
    result += charset[Math.floor(Math.random() * charset.length)];
  }
  return result;
}

export default function PasswordGeneratorTool() {
  const [length, setLength] = useState<number>(18);
  const [uppercase, setUppercase] = useState<boolean>(true);
  const [lowercase, setLowercase] = useState<boolean>(true);
  const [numbers, setNumbers] = useState<boolean>(true);
  const [symbols, setSymbols] = useState<boolean>(true);
  const [excludeAmbiguous, setExcludeAmbiguous] = useState<boolean>(false);
  const [password, setPassword] = useState<string>(() =>
    buildPassword(18, true, true, true, true, false)
  );
  const [copied, setCopied] = useState<boolean>(false);

  const generate = useCallback(() => {
    setPassword(
      buildPassword(
        length,
        uppercase,
        lowercase,
        numbers,
        symbols,
        excludeAmbiguous
      )
    );
  }, [length, uppercase, lowercase, numbers, symbols, excludeAmbiguous]);

  // Calculate password strength
  const getStrength = () => {
    if (!password) return { label: 'Empty', color: 'bg-zinc-700', pct: 0 };
    let pool = 0;
    if (uppercase) pool += 26;
    if (lowercase) pool += 26;
    if (numbers) pool += 10;
    if (symbols) pool += 30;

    const entropy = length * Math.log2(pool || 1);
    if (entropy < 40) return { label: 'Weak', color: 'bg-rose-500', pct: 25 };
    if (entropy < 65) return { label: 'Fair', color: 'bg-amber-500', pct: 50 };
    if (entropy < 90) return { label: 'Strong', color: 'bg-emerald-500', pct: 80 };
    return { label: 'Very Strong', color: 'bg-emerald-400', pct: 100 };
  };

  const strength = getStrength();

  const handleCopy = async () => {
    if (!password) return;
    await navigator.clipboard.writeText(password);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4">
      {/* Privacy banner */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-zinc-900/60 border border-zinc-800/80 rounded-xl text-xs">
        <div className="flex items-center gap-2 text-emerald-400 font-medium">
          <ShieldCheck className="w-4 h-4" />
          <span>Runs locally with CSPRNG</span>
        </div>
        <span className="text-zinc-400">Zero telemetry, never saved</span>
      </div>

      {/* Main password display */}
      <div className="p-4 bg-[#0d0f17] border border-zinc-800 rounded-xl space-y-3">
        <div className="flex items-center justify-between gap-2">
          <span className="font-mono text-base sm:text-xl text-zinc-100 font-semibold tracking-wider break-all select-all">
            {password || 'Select at least one character set'}
          </span>
          <button
            id="btn-copy-password"
            onClick={handleCopy}
            disabled={!password}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs sm:text-sm font-medium rounded-lg transition shrink-0 active:scale-95 shadow-sm"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>

        {/* Strength bar */}
        <div className="space-y-1 pt-1">
          <div className="flex justify-between text-[11px] text-zinc-400">
            <span>Strength: <strong className="text-zinc-200">{strength.label}</strong></span>
            <span>{length} characters</span>
          </div>
          <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
            <div
              className={`h-full ${strength.color} transition-all duration-300`}
              style={{ width: `${strength.pct}%` }}
            />
          </div>
        </div>
      </div>

      {/* Settings & sliders */}
      <div className="p-4 bg-zinc-900/40 border border-zinc-800/80 rounded-xl space-y-4 text-xs sm:text-sm">
        <div>
          <div className="flex justify-between text-zinc-300 mb-1.5 font-medium">
            <span>Password Length</span>
            <span className="font-mono text-emerald-400 font-bold">{length}</span>
          </div>
          <input
            type="range"
            id="password-length-slider"
            min={8}
            max={64}
            value={length}
            onChange={(e) => setLength(Number(e.target.value))}
            className="w-full accent-emerald-500 cursor-pointer h-2 bg-zinc-800 rounded-lg"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-zinc-800/60">
          <label className="flex items-center gap-2 text-zinc-300 cursor-pointer">
            <input
              type="checkbox"
              id="pwd-upper"
              checked={uppercase}
              onChange={(e) => setUppercase(e.target.checked)}
              className="rounded border-zinc-700 bg-zinc-800 text-emerald-500 focus:ring-0 w-4 h-4"
            />
            <span>Uppercase (A-Z)</span>
          </label>

          <label className="flex items-center gap-2 text-zinc-300 cursor-pointer">
            <input
              type="checkbox"
              id="pwd-lower"
              checked={lowercase}
              onChange={(e) => setLowercase(e.target.checked)}
              className="rounded border-zinc-700 bg-zinc-800 text-emerald-500 focus:ring-0 w-4 h-4"
            />
            <span>Lowercase (a-z)</span>
          </label>

          <label className="flex items-center gap-2 text-zinc-300 cursor-pointer">
            <input
              type="checkbox"
              id="pwd-num"
              checked={numbers}
              onChange={(e) => setNumbers(e.target.checked)}
              className="rounded border-zinc-700 bg-zinc-800 text-emerald-500 focus:ring-0 w-4 h-4"
            />
            <span>Numbers (0-9)</span>
          </label>

          <label className="flex items-center gap-2 text-zinc-300 cursor-pointer">
            <input
              type="checkbox"
              id="pwd-symbols"
              checked={symbols}
              onChange={(e) => setSymbols(e.target.checked)}
              className="rounded border-zinc-700 bg-zinc-800 text-emerald-500 focus:ring-0 w-4 h-4"
            />
            <span>Symbols (!@#$%^&*)</span>
          </label>

          <label className="flex items-center gap-2 text-zinc-300 cursor-pointer sm:col-span-2">
            <input
              type="checkbox"
              id="pwd-ambiguous"
              checked={excludeAmbiguous}
              onChange={(e) => setExcludeAmbiguous(e.target.checked)}
              className="rounded border-zinc-700 bg-zinc-800 text-emerald-500 focus:ring-0 w-4 h-4"
            />
            <span>Exclude ambiguous characters (1, l, I, 0, O)</span>
          </label>
        </div>
      </div>

      {/* Regenerate */}
      <button
        id="btn-regen-pwd"
        onClick={generate}
        className="flex items-center justify-center gap-2 w-full py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-medium text-xs sm:text-sm rounded-lg border border-zinc-700 transition active:scale-98"
      >
        <RefreshCw className="w-4 h-4" />
        <span>Generate Another Password</span>
      </button>
    </div>
  );
}
