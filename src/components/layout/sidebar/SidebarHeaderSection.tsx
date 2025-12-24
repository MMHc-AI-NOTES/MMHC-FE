import { SidebarHeader, SidebarTrigger, useSidebar } from '@/components/ui/sidebar';
// import Logo from '@/images/logo.svg';
import LogoText from '@/images/logo-with-text.svg';

const SidebarHeaderSection = () => {
  const { state } = useSidebar();

  return (
    <SidebarHeader className={`${state === 'expanded' ? 'px-4' : 'px-2'}`}>
      {state === 'expanded' ? (
        <div className="flex w-full items-center justify-between">
          <img src={LogoText} alt="logo-with-text" className="h-12" />
          <SidebarTrigger />
        </div>
      ) : (
        <SidebarTrigger className="ml-4" />
      )}
    </SidebarHeader>
  );
};

export default SidebarHeaderSection;
