'use client';

import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { ShieldCheck, Download, Copy, Check } from 'lucide-react';

export default function QrCodeGeneratorTool() {
  const [text, setText] = useState<string>('https://sann-tools.vercel.app');
  const [errorLevel, setErrorLevel] = useState<'L' | 'M' | 'Q' | 'H'>('M');
  const [fgColor, setFgColor] = useState<string>('#ffffff');
  const [bgColor, setBgColor] = useState<string>('#090a0f');
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    let isMounted = true;
    if (!text.trim()) {
      Promise.resolve().then(() => {
        if (isMounted) setQrDataUrl('');
      });
      return () => {
        isMounted = false;
      };
    }

    QRCode.toDataURL(text, {
      width: 400,
      margin: 2,
      color: {
        dark: fgColor,
        light: bgColor,
      },
      errorCorrectionLevel: errorLevel,
    })
      .then((url) => {
        if (isMounted) setQrDataUrl(url);
      })
      .catch((err) => console.error('QR generation error:', err));

    return () => {
      isMounted = false;
    };
  }, [text, errorLevel, fgColor, bgColor]);

  const handleDownload = () => {
    if (!qrDataUrl) return;
    const a = document.createElement('a');
    a.href = qrDataUrl;
    a.download = `sann-tools-qr-${Date.now()}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleCopyImage = async () => {
    if (!qrDataUrl) return;
    try {
      const res = await fetch(qrDataUrl);
      const blob = await res.blob();
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob }),
      ]);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback copy text
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-zinc-900/60 border border-zinc-800/80 rounded-xl text-xs">
        <div className="flex items-center gap-2 text-emerald-400 font-medium">
          <ShieldCheck className="w-4 h-4" />
          <span>Runs locally in your browser</span>
        </div>
        <span className="text-zinc-400">High-resolution client-side canvas</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Controls */}
        <div className="md:col-span-2 space-y-4 p-4 bg-[#0d0f17] border border-zinc-800 rounded-xl">
          <div>
            <label className="block text-xs text-zinc-300 font-medium mb-1.5">
              Content or URL to Encode
            </label>
            <textarea
              id="qr-content-input"
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={4}
              placeholder="Enter URL, text, phone number, or credentials..."
              className="w-full bg-zinc-900 border border-zinc-800 text-zinc-200 text-xs sm:text-sm p-3 rounded-lg focus:outline-none focus:border-emerald-500/50 resize-y"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-zinc-400 mb-1">Error Correction Level:</label>
              <div className="grid grid-cols-4 gap-1 bg-zinc-900 p-1 rounded-lg border border-zinc-800">
                {(['L', 'M', 'Q', 'H'] as const).map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setErrorLevel(lvl)}
                    className={`py-1 rounded text-center font-mono font-semibold transition ${
                      errorLevel === lvl
                        ? 'bg-zinc-700 text-white shadow-sm'
                        : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-zinc-400 mb-1">Colors (FG & BG):</label>
              <div className="flex items-center gap-3 bg-zinc-900 p-1.5 rounded-lg border border-zinc-800">
                <div className="flex items-center gap-1.5">
                  <input
                    type="color"
                    value={fgColor}
                    onChange={(e) => setFgColor(e.target.value)}
                    className="w-6 h-6 rounded cursor-pointer bg-transparent border-0"
                    title="Foreground Color"
                  />
                  <span className="text-zinc-400 text-[11px]">Dots</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <input
                    type="color"
                    value={bgColor}
                    onChange={(e) => setBgColor(e.target.value)}
                    className="w-6 h-6 rounded cursor-pointer bg-transparent border-0"
                    title="Background Color"
                  />
                  <span className="text-zinc-400 text-[11px]">Base</span>
                </div>
                <button
                  onClick={() => {
                    setFgColor('#ffffff');
                    setBgColor('#090a0f');
                  }}
                  className="text-[11px] text-zinc-500 hover:text-zinc-300 ml-auto"
                >
                  Reset
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* QR Preview & Actions */}
        <div className="p-4 bg-[#0d0f17] border border-zinc-800 rounded-xl flex flex-col items-center justify-between space-y-4">
          <div className="w-48 h-48 sm:w-52 sm:h-52 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center p-3 shadow-inner overflow-hidden">
            {qrDataUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={qrDataUrl}
                alt="Generated QR Code"
                className="w-full h-full object-contain rounded"
              />
            ) : (
              <span className="text-xs text-zinc-500">Enter text to view QR</span>
            )}
          </div>

          <div className="flex gap-2 w-full">
            <button
              id="btn-download-qr"
              onClick={handleDownload}
              disabled={!qrDataUrl}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs sm:text-sm font-medium rounded-lg transition active:scale-95 shadow-sm"
            >
              <Download className="w-4 h-4" />
              <span>Download</span>
            </button>

            <button
              id="btn-copy-qr"
              onClick={handleCopyImage}
              disabled={!qrDataUrl}
              className="flex items-center justify-center gap-1 px-3 py-2.5 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 text-zinc-200 text-xs rounded-lg border border-zinc-700 transition"
              title="Copy Image"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
