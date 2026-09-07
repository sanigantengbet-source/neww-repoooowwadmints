import React from 'react';
import {
  Code,
  CheckCircle2,
  Binary,
  Fingerprint,
  KeyRound,
  Link as LinkIcon,
  Clock,
  Palette,
  FileText,
  BarChart2,
  QrCode,
  Type,
  Folder,
  Shield,
  Terminal,
  Cpu,
  Wrench,
  Hash,
  FileCode,
  Sparkles,
  Flame,
  Globe,
  Database,
  Lock,
  Search,
  LucideProps,
} from 'lucide-react';

const ICON_MAP: Record<string, React.ComponentType<LucideProps>> = {
  Code,
  CheckCircle2,
  Binary,
  Fingerprint,
  KeyRound,
  Link: LinkIcon,
  Clock,
  Palette,
  FileText,
  BarChart2,
  QrCode,
  Type,
  Folder,
  Shield,
  Terminal,
  Cpu,
  Wrench,
  Hash,
  FileCode,
  Sparkles,
  Flame,
  Globe,
  Database,
  Lock,
  Search,
};

interface DynamicIconProps extends LucideProps {
  name?: string;
}

export default function DynamicIcon({ name, ...props }: DynamicIconProps) {
  const IconComponent = (name && ICON_MAP[name]) ? ICON_MAP[name] : Wrench;
  return <IconComponent {...props} />;
}
