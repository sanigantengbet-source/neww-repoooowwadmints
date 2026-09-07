import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import * as Icons from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(isoString?: string): string {
  if (!isoString) return '—';
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return '—';
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return '—';
  }
}

/**
 * Dynamically resolves a Lucide icon by string name.
 * Falls back to Wrench if icon is not found.
 */
export function getLucideIcon(iconName?: string): LucideIcon {
  if (!iconName) return Icons.Wrench;
  const direct = (Icons as unknown as Record<string, LucideIcon>)[iconName];
  if (direct) return direct;

  // Try capitalized or camelCase matching
  const keys = Object.keys(Icons);
  const matched = keys.find(
    (k) => k.toLowerCase() === iconName.toLowerCase().replace(/[^a-z0-9]/g, '')
  );
  if (matched && (Icons as unknown as Record<string, LucideIcon>)[matched]) {
    return (Icons as unknown as Record<string, LucideIcon>)[matched];
  }

  return Icons.Wrench;
}
