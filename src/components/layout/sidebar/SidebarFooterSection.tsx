import { SidebarFooter, SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from '@/components/ui/sidebar';
import { NavItem } from './navItems';

interface SidebarFooterSectionProps {
  items: NavItem[];
  isActive: (item: NavItem) => boolean;
  onItemClick: (item: NavItem) => void;
}

const SidebarFooterSection = ({ items, isActive, onItemClick }: SidebarFooterSectionProps) => {
  const { state } = useSidebar();

  return (
    <SidebarFooter className="border-t">
      <SidebarMenu>
        {items.map(item => {
          const active = isActive(item);
          return (
            <SidebarMenuItem key={item.name}>
              <SidebarMenuButton
                onClick={() => onItemClick(item)}
                isActive={active}
                tooltip={state === 'collapsed' ? item.name : undefined}
                className={active ? '!bg-primary !text-primary-foreground hover:!bg-primary hover:!text-primary-foreground' : ''}
              >
                {item.icon && <item.icon className={active ? 'h-5 w-5' : 'h-4 w-4'} />}
                <span className={active ? 'font-semibold' : ''}>{item.name}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          );
        })}
      </SidebarMenu>
    </SidebarFooter>
  );
};

export default SidebarFooterSection;
