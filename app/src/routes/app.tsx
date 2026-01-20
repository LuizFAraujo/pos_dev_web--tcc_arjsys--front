/**
 * app.tsx - Rota protegida do workspace
 * 
 * Rota principal do sistema que exige autenticação.
 * Redireciona para /login se não autenticado ou token expirado.
 */

import { createFileRoute, redirect } from '@tanstack/react-router';
import { WorkspaceLayout } from '@/layouts/WorkspaceLayout';
import { useAuthStore } from '@stores';

export const Route = createFileRoute('/app')({
    // Protege a rota - só autenticados podem acessar
    beforeLoad: () => {
        const { isAuthenticated, checkAuth } = useAuthStore.getState();

        // Se não autenticado ou token expirado, redireciona para login
        if (!isAuthenticated || !checkAuth()) {
            throw redirect({ to: '/login' });
        }
    },

    component: AppLayout,
});

function AppLayout() {
    return <WorkspaceLayout />;
}