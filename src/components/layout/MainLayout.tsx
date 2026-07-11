import { Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import { SidebarProvider } from '@/components/ui/sidebar';
import AppSidebar from './sidebar/Sidebar';
import Header from './header/Header';
import { FallBackLoader } from './loader/FallBackLoader';

const MainLayout = () => {
  return (
    <SidebarProvider>
      <div className="flex h-screen w-full">
        <AppSidebar />
        <div className="flex min-h-0 flex-1 flex-col overflow-x-hidden">
          <Header />
          <main className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto p-4">
            <Suspense fallback={<FallBackLoader type="page" />}>
              <Outlet />
            </Suspense>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default MainLayout;
