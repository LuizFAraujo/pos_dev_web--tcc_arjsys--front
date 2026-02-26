/**
 * index.tsx - Rota raiz /
 *
 * Redireciona para /app se autenticado, senão para /login.
 */
import { createFileRoute, redirect } from '@tanstack/react-router';
import { useAuthStore } from '@stores';

export const Route = createFileRoute('/')({
  beforeLoad: () => {
    const isAuthenticated = useAuthStore.getState().isAuthenticated;

    if (isAuthenticated) {
      throw redirect({ to: '/app' });
    }

    throw redirect({ to: '/login' });
  },
});