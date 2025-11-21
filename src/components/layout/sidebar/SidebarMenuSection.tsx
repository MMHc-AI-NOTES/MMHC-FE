import { SidebarGroup, SidebarGroupContent, SidebarMenu, useSidebar } from '@/components/ui/sidebar';
import SidebarNavItem from './SidebarNavItem';
import { NavItem } from './navItems';
import clsx from 'clsx';

interface SidebarMenuSectionProps {
  items: NavItem[];
  label: string;
  isActive: (item: NavItem) => boolean;
  hasActiveChild: (item: NavItem) => boolean;
  onItemClick: (item: NavItem) => void;
}

const SidebarMenuSection = ({ items, isActive, hasActiveChild, onItemClick }: SidebarMenuSectionProps) => {
  const { state } = useSidebar();

  return (
    <SidebarGroup className={clsx(state !== 'expanded' && 'p-2', 'pr-0')}>
      {/* <SidebarGroupLabel className="text-sm">{label}</SidebarGroupLabel> */}
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map(item => (
            <SidebarNavItem key={item.name} item={item} isActive={isActive} hasActiveChild={hasActiveChild} onItemClick={onItemClick} />
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
};

export default SidebarMenuSection;
