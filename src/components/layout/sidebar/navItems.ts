import {
  LayoutDashboard,
  FileText,
  Ban,
  ShieldCheck,
  ScrollText,
  Settings,
  HelpCircle,
  LogOut,
  FilePlus,
  UserCheck,
  Database,
} from 'lucide-react';
import { UserRoleEnum } from '@/constants/common';
import type { UserRole } from '@/types/settings';

export const allNavItems: NavItem[] = [
  { path: '/dashboard', name: 'Dashboard', icon: LayoutDashboard },
  { path: '/notes-queue', name: 'Notes Queue', icon: FileText },
  // { path: '/single-note-audit', name: 'Single Note Audit', icon: FileSearch },
  { path: '/admin-review-queue', name: 'Admin Review Queue', icon: UserCheck },
  { path: '/blacklisted-notes', name: 'Blacklisted Notes', icon: Ban },
  { path: '/manager-review', name: 'Manager Review', icon: ShieldCheck },
  { path: '/ai-logs', name: 'AI Logs', icon: ScrollText },
  { path: '/settings', name: 'Settings', icon: Settings },
  { path: '/note-submission', name: 'Note Submission', icon: FilePlus },
  { path: '/notes-fetch-from-airtable', name: 'Notes Fetch From Airtable', icon: Database },
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

// Access rules: Super Admin (1), User (2), Practitioner (3), SME Reviewer (4)
export const routeAccess: Record<string, UserRole[]> = {
  '/dashboard': [UserRoleEnum.superAdmin, UserRoleEnum.user, UserRoleEnum.practitioner, UserRoleEnum.sme_reviewer],
  '/notes-queue': [UserRoleEnum.superAdmin, UserRoleEnum.practitioner, UserRoleEnum.sme_reviewer],
  '/admin-review-queue': [UserRoleEnum.superAdmin, UserRoleEnum.sme_reviewer],
  '/blacklisted-notes': [UserRoleEnum.superAdmin],
  '/manager-review': [UserRoleEnum.superAdmin],
  '/ai-logs': [UserRoleEnum.superAdmin],
  '/note-submission': [UserRoleEnum.superAdmin],
  '/notes-fetch-from-airtable': [UserRoleEnum.superAdmin],
  '/settings': [UserRoleEnum.superAdmin],
};

export const getFilteredNavItems = (userRole: UserRole | null | undefined): NavItem[] => {
  if (!userRole) return [];

  return allNavItems.filter(item => {
    if (!item.path) return true; // Keep items without paths (like logout)
    const allowedRoles = routeAccess[item.path];
    return allowedRoles?.includes(userRole) ?? false;
  });
};

// Export navItems for backward compatibility (used by useRouteTitle hook)
export const navItems = allNavItems;
