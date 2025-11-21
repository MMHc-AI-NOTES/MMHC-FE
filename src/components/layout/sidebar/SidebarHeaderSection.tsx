import { SidebarHeader, useSidebar } from '@/components/ui/sidebar';
import Logo from '@/images/logo.svg';
import LogoText from '@/images/logo-with-text.svg';

const SidebarHeaderSection = () => {
  const { state } = useSidebar();

  return (
    <SidebarHeader>{state === 'expanded' ? <img src={LogoText} alt="logo-with-text" /> : <img src={Logo} alt="logo" />}</SidebarHeader>
  );
};

export default SidebarHeaderSection;
