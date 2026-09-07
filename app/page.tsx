import React from 'react';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import ToolCard from '@/components/shared/ToolCard';
import HomeSearchFilter from '@/components/shared/HomeSearchFilter';
import { getPublicTools } from '@/lib/tools';
import { getAllCategories } from '@/lib/categories';
import { getSettings } from '@/lib/settings';
import DynamicIcon from '@/components/shared/DynamicIcon';
import { Sparkles, Flame, Grid, ArrowRight, ShieldCheck, Cpu } from 'lucide-react';

export const revalidate = 60; // ISR cache revalidation

export default async function HomePage() {
  const [tools, categories, settings] = await Promise.all([
    getPublicTools(),
    getAllCategories(),
    getSettings(),
  ]);

  const featuredTools = tools.filter((t) => t.featured).slice(0, settings.featuredToolLimit || 6);
  const popularTools = tools.filter((t) => t.popular).slice(0, settings.popularToolLimit || 6);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-10 sm:py-14 space-y-14">
        {/* Hero Section */}
        <section className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono font-medium">
            <Cpu className="w-3.5 h-3.5" />
            <span>Zero Server Roundtrips • 100% Client-Side Computing</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white font-sans">
            SANN TOOLS
          </h1>

          <p className="text-lg sm:text-xl font-medium text-zinc-200">
            Useful tools. One simple place.
          </p>

          <p className="text-xs sm:text-sm text-zinc-400 max-w-xl mx-auto leading-relaxed">
            Fast, simple and privacy-friendly utilities for developers, creators and everyday tasks. All processing runs directly in your browser.
          </p>

          {/* Quick stats */}
          <div className="flex items-center justify-center gap-6 pt-2 font-mono text-xs text-zinc-400">
            <div className="flex items-center gap-1.5">
              <span className="text-emerald-400 font-bold text-sm">{tools.length}</span>
              <span>Tools</span>
            </div>
            <span className="text-zinc-700">•</span>
            <div className="flex items-center gap-1.5">
              <span className="text-emerald-400 font-bold text-sm">{categories.length}</span>
              <span>Categories</span>
            </div>
            <span className="text-zinc-700">•</span>
            <div className="flex items-center gap-1 text-zinc-300">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Private & Offline-Ready</span>
            </div>
          </div>
        </section>

        {/* Live Search & Filter Bar */}
        <section>
          <HomeSearchFilter initialTools={tools} categories={categories} />
        </section>

        {/* Featured Tools Section */}
        {featuredTools.length > 0 && (
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <h2 className="text-lg font-bold text-zinc-100 tracking-tight">
                  Featured Tools
                </h2>
              </div>
              <Link
                href="/tools?featured=true"
                className="text-xs text-zinc-400 hover:text-emerald-400 flex items-center gap-1 font-medium transition"
              >
                <span>View all</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {featuredTools.map((tool) => (
                <ToolCard key={tool.id} tool={tool} />
              ))}
            </div>
          </section>
        )}

        {/* Popular Tools Section */}
        {popularTools.length > 0 && (
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Flame className="w-4 h-4 text-emerald-400" />
                <h2 className="text-lg font-bold text-zinc-100 tracking-tight">
                  Popular Tools
                </h2>
              </div>
              <Link
                href="/tools?popular=true"
                className="text-xs text-zinc-400 hover:text-emerald-400 flex items-center gap-1 font-medium transition"
              >
                <span>View all</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {popularTools.map((tool) => (
                <ToolCard key={tool.id} tool={tool} />
              ))}
            </div>
          </section>
        )}

        {/* Browse by Categories Section */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Grid className="w-4 h-4 text-zinc-400" />
              <h2 className="text-lg font-bold text-zinc-100 tracking-tight">
                Categories
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((cat) => {
              const count = tools.filter((t) => t.category === cat.id).length;

              return (
                <Link
                  key={cat.id}
                  href={`/tools?category=${cat.id}`}
                  className="p-4 bg-[#0d0f17] hover:bg-[#131622] border border-zinc-800 rounded-xl transition group flex items-start justify-between"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-300 group-hover:text-emerald-400 group-hover:border-emerald-500/30 transition shrink-0 mt-0.5">
                      <DynamicIcon name={cat.icon} className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-zinc-200 group-hover:text-white">
                        {cat.name}
                      </h3>
                      <p className="text-xs text-zinc-400 line-clamp-2 mt-0.5">
                        {cat.description}
                      </p>
                    </div>
                  </div>

                  <span className="text-xs font-mono text-zinc-500 bg-zinc-900/80 px-2 py-0.5 rounded-full border border-zinc-800 shrink-0">
                    {count}
                  </span>
                </Link>
              );
            })}
          </div>
        </section>

        {/* All Tools Catalog Grid */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-zinc-100 tracking-tight">
              All Tools ({tools.length})
            </h2>
            <Link
              href="/tools"
              className="text-xs text-emerald-400 hover:underline flex items-center gap-1 font-medium"
            >
              <span>Full Directory View</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {tools.map((tool) => (
              <ToolCard key={tool.id} tool={tool} />
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
