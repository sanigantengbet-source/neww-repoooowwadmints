import React, { Suspense } from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import ToolsDirectoryClient from '@/components/tools/ToolsDirectoryClient';
import { getPublicTools } from '@/lib/tools';
import { getAllCategories } from '@/lib/categories';
import { Wrench } from 'lucide-react';

export const metadata = {
  title: 'Tools Directory | SANN TOOLS',
  description: 'Explore the full catalog of client-side web utilities on SANN TOOLS.',
};

export const revalidate = 60;

export default async function ToolsDirectoryPage() {
  const [tools, categories] = await Promise.all([
    getPublicTools(),
    getAllCategories(),
  ]);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8">
        <div>
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-mono mb-1">
            <Wrench className="w-3.5 h-3.5" />
            <span>Complete Catalog</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Tools Directory
          </h1>
          <p className="text-zinc-400 text-xs sm:text-sm mt-1">
            Filter, search and launch browser utilities instantly. Zero tracking, zero latency.
          </p>
        </div>

        <Suspense
          fallback={
            <div className="p-8 text-center text-zinc-500 font-mono text-xs">
              Loading catalog...
            </div>
          }
        >
          <ToolsDirectoryClient initialTools={tools} categories={categories} />
        </Suspense>
      </main>

      <Footer />
    </div>
  );
}
