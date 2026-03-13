// import { TanStackRouterDevtools } from '@tanstack/react-router-devtools';
import { createRootRoute, Outlet } from '@tanstack/react-router';
import { NotFoundPage } from '@/pages/auth/NotFoundPage';
import { Toaster } from '@/components/ui/sonner';

export const Route = createRootRoute({
  component: () => (
    <>
      <Outlet />
      <Toaster position="top-right" richColors closeButton duration={3000} />
      {/* <TanStackRouterDevtools /> */}
    </>
  ),
  notFoundComponent: NotFoundPage,
});
