import { SidebarTrigger } from '@/components/ui/sidebar';
import SharedLogo from '@/shared/SharedLogo';

const HeaderLogo = () => {
  return (
    <div className="flex items-center gap-3">
      <SidebarTrigger />
      <SharedLogo />
    </div>
  );
};

export default HeaderLogo;
