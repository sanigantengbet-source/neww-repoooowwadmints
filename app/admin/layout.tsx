import React from 'react';
import AdminShell from '@/components/admin/AdminShell';

export const metadata = {
  title: 'Admin Console | SANN TOOLS',
  description: 'Manage tool catalog, categories, and settings using GitHub persistent storage.',
};

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminShell>{children}</AdminShell>;
}
