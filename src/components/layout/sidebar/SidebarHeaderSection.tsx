import { SidebarHeader, useSidebar } from '@/components/ui/sidebar';

const SidebarHeaderSection = () => {
  const { state } = useSidebar();

  return (
    <SidebarHeader className="border-b px-4 py-2.5">
      {state === 'expanded' ? (
        <div className="flex items-center gap-2">
          <div className="bg-primary text-primary-foreground flex h-9 w-9 shrink-0 items-center justify-center rounded-lg">
            <span className="text-lg font-bold">R</span>
          </div>
          <div className="flex min-w-0 flex-col">
            <span className="truncate text-base font-semibold">React Theme</span>
            <span className="text-muted-foreground truncate text-sm">v4.0</span>
          </div>
        </div>
      ) : (
        <div className="flex justify-center">
          <div className="bg-primary text-primary-foreground flex h-9 w-9 shrink-0 items-center justify-center rounded-lg">
            <span className="text-lg font-bold">R</span>
          </div>
        </div>
      )}
    </SidebarHeader>
  );
};

export default SidebarHeaderSection;
