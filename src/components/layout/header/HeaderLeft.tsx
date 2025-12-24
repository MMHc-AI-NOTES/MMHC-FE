import { SidebarTrigger } from '@/components/ui/sidebar';
import { useIsMobile } from '@/hooks/use-mobile';
import { useRouteTitle } from '@/hooks/useRouteTitle';

const HeaderLogo = () => {
  const title = useRouteTitle();
  const isMobile = useIsMobile();

  return (
    <div className="flex items-center gap-3">
      {isMobile ? <SidebarTrigger /> : null}
      <p className="text-primary hidden text-xl font-semibold lg:block">{title}</p>
    </div>
  );
};

export default HeaderLogo;
