import { SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu } from '@/components/ui/sidebar';
import SidebarNavItem from './SidebarNavItem';
import { NavItem } from './navItems';

interface SidebarMenuSectionProps {
  items: NavItem[];
  label: string;
  isActive: (item: NavItem) => boolean;
  hasActiveChild: (item: NavItem) => boolean;
  onItemClick: (item: NavItem) => void;
}

const SidebarMenuSection = ({ items, label, isActive, hasActiveChild, onItemClick }: SidebarMenuSectionProps) => {
  return (
    <SidebarGroup>
      <SidebarGroupLabel className="text-sm">{label}</SidebarGroupLabel>
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
