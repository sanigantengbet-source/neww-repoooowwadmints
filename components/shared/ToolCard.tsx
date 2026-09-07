import React from 'react';
import Link from 'next/link';
import type { Tool } from '@/types';
import DynamicIcon from '@/components/shared/DynamicIcon';
import { ArrowRight, Star, Flame } from 'lucide-react';

interface ToolCardProps {
  tool: Tool;
}

export default function ToolCard({ tool }: ToolCardProps) {
  return (
    <Link
      href={`/tools/${tool.slug}`}
      id={`tool-card-${tool.slug}`}
      className="group relative flex flex-col justify-between p-5 bg-[#0f111a] hover:bg-[#141724] border border-zinc-800/80 hover:border-zinc-700 rounded-xl transition-all duration-200 hover:-translate-y-0.5 shadow-sm"
    >
      <div>
        {/* Top badges */}
        <div className="flex items-center justify-between gap-2 mb-3.5">
          <div className="w-10 h-10 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-200 group-hover:text-emerald-400 group-hover:border-emerald-500/30 transition-colors">
            <DynamicIcon name={tool.icon} className="w-5 h-5" />
          </div>

          <div className="flex items-center gap-1.5">
            {tool.featured && (
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-500/10 text-amber-300 border border-amber-500/20">
                <Star className="w-3 h-3 fill-amber-300" />
                Featured
              </span>
            )}
            {tool.popular && (
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                <Flame className="w-3 h-3" />
                Popular
              </span>
            )}
          </div>
        </div>

        {/* Title and description */}
        <h3 className="font-semibold text-zinc-100 group-hover:text-white text-base tracking-tight mb-1.5 flex items-center gap-1.5">
          <span>{tool.name}</span>
        </h3>
        <p className="text-zinc-400 text-xs sm:text-sm line-clamp-2 leading-relaxed">
          {tool.description}
        </p>
      </div>

      {/* Footer tags and link */}
      <div className="pt-4 mt-3 border-t border-zinc-800/60 flex items-center justify-between text-xs">
        <span className="px-2 py-0.5 rounded-md bg-zinc-900 border border-zinc-800/80 text-zinc-400 font-mono text-[11px] capitalize">
          {tool.category}
        </span>

        <span className="inline-flex items-center gap-1 text-zinc-400 group-hover:text-emerald-400 font-medium transition-colors">
          <span>Open</span>
          <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
        </span>
      </div>
    </Link>
  );
}
