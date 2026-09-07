'use client';

import React, { useState } from 'react';
import { ShieldCheck, Copy, Check } from 'lucide-react';

export default function ColorConverterTool() {
  const [hex, setHex] = useState<string>('#10b981');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Helper converters
  const hexToRgb = (h: string): { r: number; g: number; b: number } | null => {
    const clean = h.replace('#', '');
    if (clean.length !== 3 && clean.length !== 6) return null;
    const full = clean.length === 3
      ? clean.split('').map((c) => c + c).join('')
      : clean;
    const num = parseInt(full, 16);
    if (isNaN(num)) return null;
    return {
      r: (num >> 16) & 255,
      g: (num >> 8) & 255,
      b: num & 255,
    };
  };

  const rgbToHsl = (r: number, g: number, b: number) => {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0;
    let s = 0;
    const l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }
    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      l: Math.round(l * 100),
    };
  };

  const rgbToCmyk = (r: number, g: number, b: number) => {
    const rNorm = r / 255;
    const gNorm = g / 255;
    const bNorm = b / 255;
    const k = 1 - Math.max(rNorm, gNorm, bNorm);
    if (k === 1) return { c: 0, m: 0, y: 0, k: 100 };
    const c = Math.round(((1 - rNorm - k) / (1 - k)) * 100);
    const m = Math.round(((1 - gNorm - k) / (1 - k)) * 100);
    const y = Math.round(((1 - bNorm - k) / (1 - k)) * 100);
    return { c, m, y, k: Math.round(k * 100) };
  };

  // WCAG Luminance and Contrast
  const getLuminance = (r: number, g: number, b: number) => {
    const a = [r, g, b].map((v) => {
      v /= 255;
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
  };

  const rgb = hexToRgb(hex) || { r: 16, g: 185, b: 129 };
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
  const cmyk = rgbToCmyk(rgb.r, rgb.g, rgb.b);

  const lum = getLuminance(rgb.r, rgb.g, rgb.b);
  const contrastWhite = ((1.0 + 0.05) / (lum + 0.05)).toFixed(2);
  const contrastBlack = ((lum + 0.05) / (0.0 + 0.05)).toFixed(2);

  const formats = [
    { key: 'hex', label: 'HEX', val: hex.toUpperCase() },
    { key: 'rgb', label: 'RGB', val: `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})` },
    { key: 'rgba', label: 'RGBA', val: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 1)` },
    { key: 'hsl', label: 'HSL', val: `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)` },
    { key: 'cmyk', label: 'CMYK', val: `cmyk(${cmyk.c}%, ${cmyk.m}%, ${cmyk.y}%, ${cmyk.k}%)` },
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
        <span className="text-zinc-400">Color spaces & WCAG contrast</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Visual Preview Card */}
        <div className="p-4 bg-[#0d0f17] border border-zinc-800 rounded-xl flex flex-col justify-between space-y-4">
          <div
            className="w-full h-32 rounded-lg border border-white/10 shadow-inner flex flex-col items-center justify-center p-3 transition-colors duration-150"
            style={{ backgroundColor: hex }}
          >
            <span
              className="text-xs font-bold font-mono tracking-wider drop-shadow-sm"
              style={{ color: lum > 0.4 ? '#000000' : '#ffffff' }}
            >
              {hex.toUpperCase()}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="color"
              id="color-picker-input"
              value={hex}
              onChange={(e) => setHex(e.target.value)}
              className="w-10 h-10 rounded-lg cursor-pointer bg-transparent border-0 p-0"
            />
            <input
              type="text"
              id="color-hex-input"
              value={hex}
              onChange={(e) => {
                let v = e.target.value;
                if (!v.startsWith('#')) v = '#' + v;
                setHex(v);
              }}
              placeholder="#10b981"
              maxLength={7}
              className="w-full bg-zinc-900 border border-zinc-800 text-zinc-200 font-mono text-sm px-3 py-2 rounded-lg focus:outline-none focus:border-emerald-500/50 uppercase"
            />
          </div>
        </div>

        {/* Formats table */}
        <div className="md:col-span-2 p-4 bg-[#0d0f17] border border-zinc-800 rounded-xl space-y-2">
          <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
            Color Formats
          </h3>
          <div className="space-y-2">
            {formats.map((f) => (
              <div
                key={f.key}
                className="flex items-center justify-between p-2.5 bg-zinc-900/50 border border-zinc-800/80 rounded-lg hover:border-zinc-700 transition"
              >
                <span className="text-xs font-semibold text-zinc-400 w-16">{f.label}</span>
                <span className="font-mono text-xs sm:text-sm text-zinc-200 flex-1 px-2 select-all">
                  {f.val}
                </span>
                <button
                  id={`copy-color-${f.key}`}
                  onClick={() => handleCopy(f.val, f.key)}
                  className="p-1.5 text-zinc-400 hover:text-white rounded bg-zinc-800/60 hover:bg-zinc-700 transition shrink-0"
                  title="Copy to clipboard"
                >
                  {copiedKey === f.key ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            ))}
          </div>

          {/* Contrast Check */}
          <div className="pt-3 border-t border-zinc-800/80 grid grid-cols-2 gap-2 text-xs">
            <div className="p-2 bg-zinc-900/40 rounded border border-zinc-800 flex justify-between items-center">
              <span className="text-zinc-400">vs White Text:</span>
              <span className="font-mono text-zinc-200 font-bold">{contrastWhite}:1</span>
            </div>
            <div className="p-2 bg-zinc-900/40 rounded border border-zinc-800 flex justify-between items-center">
              <span className="text-zinc-400">vs Black Text:</span>
              <span className="font-mono text-zinc-200 font-bold">{contrastBlack}:1</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
