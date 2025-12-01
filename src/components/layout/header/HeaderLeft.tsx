import { useRouteTitle } from '@/hooks/useRouteTitle';

const HeaderLogo = () => {
  const title = useRouteTitle();
  return (
    <div className="flex items-center gap-3">
      <p className="text-primary text-xl font-semibold">{title}</p>
    </div>
  );
};

export default HeaderLogo;
