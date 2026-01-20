/**
 * index.tsx - Rota raiz /
 * 
 * Redireciona para /app se autenticado, senão para /login.
 */

import { createFileRoute, redirect } from '@tanstack/react-router';
import { useAuthStore } from '@stores';

export const Route = createFileRoute('/')({
  beforeLoad: () => {
    const { isAuthenticated, checkAuth } = useAuthStore.getState();

    // Se autenticado, vai para /app
    if (isAuthenticated && checkAuth()) {
      throw redirect({ to: '/app' });
    }

    // Senão, vai para /login
    throw redirect({ to: '/login' });
  },
});