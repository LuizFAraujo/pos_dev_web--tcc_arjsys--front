/**
 * app.tsx - Rota principal do sistema
 * 
 * Rota: /app
 * 
 * Esta é a rota principal do sistema após o login.
 * Renderiza o WorkspaceLayout que contém toda a estrutura
 * do sistema (Header, Sidebar, Tabs, Content).
 */

import { createFileRoute } from '@tanstack/react-router';
import { WorkspaceLayout } from '@/layouts/WorkspaceLayout';

export const Route = createFileRoute('/app')({
    component: AppPage,
});

function AppPage() {
    return <WorkspaceLayout />;
}