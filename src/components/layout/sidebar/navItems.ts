import { LayoutDashboard, FileText, Ban, ShieldCheck, ScrollText, Settings, HelpCircle, LogOut } from 'lucide-react';

export const navItems: NavItem[] = [
  { path: '/dashboard', name: 'Dashboard', icon: LayoutDashboard },
  { path: '/notes-queue', name: 'Notes Queue', icon: FileText },
  // { path: '/single-note-audit', name: 'Single Note Audit', icon: FileSearch },
  { path: '/blacklisted-notes', name: 'Blacklisted Notes', icon: Ban },
  { path: '/manager-review', name: 'Manager Review', icon: ShieldCheck },
  { path: '/ai-logs', name: 'AI Logs', icon: ScrollText },
  { path: '/settings', name: 'Settings', icon: Settings },
];

export const bottomNavItems: NavItem[] = [
  { path: '/help', name: 'Help', icon: HelpCircle },
  { path: undefined, name: 'Logout', icon: LogOut, actionType: 'logout' },
];

import type { LucideIcon } from 'lucide-react';

export interface NavItem {
  path?: string;
  name: string;
  icon?: LucideIcon;
  actionType?: 'logout' | 'action';
  children?: NavItem[];
}
