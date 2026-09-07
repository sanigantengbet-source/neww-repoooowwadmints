import type {Metadata} from 'next';
import './globals.css'; // Global styles

export const metadata: Metadata = {
  title: 'SANN TOOLS — Useful tools. One simple place.',
  description: 'Fast, simple and privacy-friendly web utilities for developers, creators and everyday tasks. Runs locally in your browser.',
  openGraph: {
    title: 'SANN TOOLS — Useful tools. One simple place.',
    description: 'Fast, simple and privacy-friendly web utilities for developers, creators and everyday tasks. Runs locally in your browser.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SANN TOOLS — Useful tools. One simple place.',
    description: 'Fast, simple and privacy-friendly web utilities for developers, creators and everyday tasks. Runs locally in your browser.',
  },
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#090a0f] text-zinc-100 antialiased min-h-screen selection:bg-zinc-800 selection:text-emerald-400 font-sans" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
