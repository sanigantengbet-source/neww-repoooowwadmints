import React from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import ToolInterface from '@/components/tools/ToolInterface';
import ToolCard from '@/components/shared/ToolCard';
import { getToolBySlug, getPublicTools } from '@/lib/tools';
import { getCategoryById } from '@/lib/categories';
import { formatDate } from '@/lib/utils';
import DynamicIcon from '@/components/shared/DynamicIcon';
import {
  ChevronRight,
  ShieldCheck,
  Tag,
  Calendar,
  User,
  Star,
  Flame,
  ArrowLeft,
} from 'lucide-react';

interface ToolPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({ params }: ToolPageProps): Promise<Metadata> {
  const { slug } = await params;
  const tool = await getToolBySlug(slug);

  if (!tool) {
    return {
      title: 'Tool Not Found | SANN TOOLS',
    };
  }

  return {
    title: `${tool.name} | SANN TOOLS`,
    description: tool.description,
    keywords: tool.tags,
    openGraph: {
      title: `${tool.name} - Free Browser Utility`,
      description: tool.description,
      type: 'website',
    },
  };
}

export default async function ToolDetailPage({ params }: ToolPageProps) {
  const { slug } = await params;
  const tool = await getToolBySlug(slug);

  if (!tool || tool.status !== 'active') {
    notFound();
  }

  const [allTools, category] = await Promise.all([
    getPublicTools(),
    getCategoryById(tool.category),
  ]);

  const relatedTools = allTools
    .filter((t) => t.category === tool.category && t.id !== tool.id)
    .slice(0, 3);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-8">
        {/* Breadcrumb navigation */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-zinc-400">
          <Link href="/" className="hover:text-zinc-200 transition">
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-zinc-600" />
          <Link href="/tools" className="hover:text-zinc-200 transition">
            Tools
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-zinc-600" />
          <span className="text-zinc-200 font-medium truncate">{tool.name}</span>
        </nav>

        {/* Tool Header */}
        <div className="p-6 bg-[#0d0f17] border border-zinc-800 rounded-2xl space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-zinc-900 border border-zinc-700/80 flex items-center justify-center text-emerald-400 shadow-md">
                <DynamicIcon name={tool.icon} className="w-6 h-6" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                    {tool.name}
                  </h1>
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

                <div className="flex items-center gap-2 text-xs text-zinc-400 mt-1">
                  <span className="capitalize font-mono text-zinc-300">
                    {category ? category.name : tool.category}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1 text-emerald-400 font-medium">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Runs in browser
                  </span>
                </div>
              </div>
            </div>

            <Link
              href="/tools"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs text-zinc-400 hover:text-zinc-200 bg-zinc-900 border border-zinc-800 rounded-lg transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Directory</span>
            </Link>
          </div>

          <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed max-w-3xl">
            {tool.description}
          </p>

          {/* Tags */}
          {tool.tags && tool.tags.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-zinc-800/60">
              <Tag className="w-3 h-3 text-zinc-500" />
              {tool.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-400 font-mono text-[11px]"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Interactive Tool Runner Component */}
        <section aria-label="Tool runner" className="p-6 bg-[#0a0c12] border border-zinc-800/90 rounded-2xl shadow-xl">
          <ToolInterface tool={tool} />
        </section>

        {/* Metadata section */}
        <section className="p-4 bg-[#0d0f17] border border-zinc-800/80 rounded-xl flex flex-wrap items-center justify-between gap-4 text-xs text-zinc-400 font-mono">
          <div className="flex items-center gap-2">
            <User className="w-3.5 h-3.5 text-zinc-500" />
            <span>Author: <strong className="text-zinc-300">{tool.author || 'SANN Team'}</strong></span>
          </div>

          <div className="flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5 text-zinc-500" />
            <span>Updated: <strong className="text-zinc-300">{formatDate(tool.updatedAt)}</strong></span>
          </div>

          <div>
            <span>Version: <strong className="text-emerald-400">{tool.version || '1.0.0'}</strong></span>
          </div>
        </section>

        {/* Related tools */}
        {relatedTools.length > 0 && (
          <section className="space-y-4 pt-4">
            <h2 className="text-base font-bold text-zinc-100 tracking-tight">
              Related {category ? category.name : ''} Utilities
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {relatedTools.map((t) => (
                <ToolCard key={t.id} tool={t} />
              ))}
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}
