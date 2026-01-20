/**
 * login.tsx - Rota de login
 * 
 * Rota pública para autenticação.
 * Renderiza LoginPage dentro do AuthLayout.
 */

import { createFileRoute, redirect } from '@tanstack/react-router';
import { AuthLayout } from '@/layouts/AuthLayout';
import { LoginPage } from '@/pages/auth/LoginPage';
import { useAuthStore } from '@stores';

export const Route = createFileRoute('/login')({
    // Verifica se já está logado antes de carregar
    beforeLoad: () => {
        const { isAuthenticated, checkAuth } = useAuthStore.getState();

        // Se já está autenticado e token válido, redireciona para /app
        if (isAuthenticated && checkAuth()) {
            throw redirect({ to: '/app' });
        }
    },

    component: LoginRoute,
});

function LoginRoute() {
    return (
        <AuthLayout>
            <LoginPage />
        </AuthLayout>
    );
}