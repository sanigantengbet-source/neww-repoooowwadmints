import React from 'react';
import Link from 'next/link';
import { ShieldCheck, GitBranch, Terminal } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="w-full border-t border-zinc-800/80 bg-[#090a0f] text-zinc-400 py-10 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-zinc-200 font-mono font-bold text-sm tracking-wider uppercase">
              <Terminal className="w-4 h-4 text-emerald-400" />
              <span>SANN TOOLS</span>
            </div>
            <p className="text-xs text-zinc-500 max-w-md">
              Useful tools. One simple place. Fast, simple and privacy-friendly utilities for developers, creators and everyday tasks.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-xs">
            <Link href="/tools" className="hover:text-zinc-200 transition">
              Tools Directory
            </Link>
            <Link href="/admin" className="hover:text-zinc-200 transition">
              Admin Console
            </Link>
            <Link href="/admin/login" className="hover:text-zinc-200 transition">
              GitHub Auth
            </Link>
          </div>
        </div>

        <div className="pt-4 border-t border-zinc-800/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-zinc-500">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Runs locally in your browser. Zero SQL databases. Zero telemetry.</span>
          </div>

          <div className="flex items-center gap-2 font-mono text-[11px]">
            <GitBranch className="w-3.5 h-3.5 text-zinc-400" />
            <span>GitHub Repository as persistent storage</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
