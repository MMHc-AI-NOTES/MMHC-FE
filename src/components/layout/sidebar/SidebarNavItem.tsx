import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from '@/components/ui/sidebar';
import { ChevronRight } from 'lucide-react';
import { NavItem } from './navItems';

interface SidebarNavItemProps {
  item: NavItem;
  isActive: (item: NavItem) => boolean;
  hasActiveChild: (item: NavItem) => boolean;
  onItemClick: (item: NavItem) => void;
  isOpen?: boolean;
  onToggle?: () => void;
}

const SidebarNavItem = ({ item, isActive, hasActiveChild, onItemClick, isOpen, onToggle }: SidebarNavItemProps) => {
  const { state } = useSidebar();

  if (item.children) {
    const hasActive = hasActiveChild(item);
    return (
      <Collapsible key={item.name} asChild open={isOpen} onOpenChange={onToggle} className="group/collapsible">
        <SidebarMenuItem>
          <CollapsibleTrigger asChild>
            <SidebarMenuButton
              tooltip={state === 'collapsed' ? item.name : undefined}
              className={hasActive ? 'text-primary font-medium' : ''}
            >
              {item.icon && <item.icon className="h-4 w-4 shrink-0" />}
              <span>{item.name}</span>
              <ChevronRight className="ml-auto h-4 w-4 shrink-0 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
            </SidebarMenuButton>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <SidebarMenuSub>
              {item.children.map(subItem => {
                const subActive = isActive(subItem);
                return (
                  <SidebarMenuSubItem key={subItem.name}>
                    <SidebarMenuSubButton onClick={() => onItemClick(subItem)} isActive={subActive}>
                      {subItem.icon && <subItem.icon className={subActive ? 'h-5 w-5' : 'h-4 w-4'} />}
                      <span className={subActive ? 'font-semibold' : ''}>{subItem.name}</span>
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                );
              })}
            </SidebarMenuSub>
          </CollapsibleContent>
        </SidebarMenuItem>
      </Collapsible>
    );
  }

  const active = isActive(item);
  return (
    <SidebarMenuItem key={item.name}>
      <SidebarMenuButton onClick={() => onItemClick(item)} isActive={active} tooltip={state === 'collapsed' ? item.name : undefined}>
        {item.icon && <item.icon className={active ? 'h-5 w-5' : 'h-4 w-4'} />}
        <span className={active ? 'text-base font-semibold' : 'text-base'}>{item.name}</span>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
};

export default SidebarNavItem;
