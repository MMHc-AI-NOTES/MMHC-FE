import { Sidebar, SidebarContent } from '@/components/ui/sidebar';
import { useLocation, useNavigate } from 'react-router-dom';
import { NavItem, bottomNavItems, navItems } from './navItems';
import { handleLogout } from '@/utils/helper';
import SidebarHeaderSection from './SidebarHeaderSection';
import SidebarMenuSection from './SidebarMenuSection';
import SidebarFooterSection from './SidebarFooterSection';

const AppSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleItemClick = (item: NavItem) => {
    if (item.actionType === 'logout') {
      handleLogout();
    } else if (item.path) {
      navigate(item.path);
    }
  };

  const isActive = (item: NavItem): boolean => {
    if (!item.path) return false;
    return location.pathname === item.path || location.pathname.startsWith(`${item.path}/`);
  };

  const hasActiveChild = (item: NavItem): boolean => {
    if (!item.children) return false;
    return item.children.some(child => isActive(child));
  };

  return (
    <Sidebar collapsible="icon" className="border-r">
      <SidebarHeaderSection />

      <SidebarContent>
        <SidebarMenuSection
          items={navItems}
          label="Main Menu"
          isActive={isActive}
          hasActiveChild={hasActiveChild}
          onItemClick={handleItemClick}
        />
      </SidebarContent>

      <SidebarFooterSection items={bottomNavItems} isActive={isActive} onItemClick={handleItemClick} />
    </Sidebar>
  );
};

export default AppSidebar;
