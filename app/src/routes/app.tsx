/**
 * app.tsx - Rota protegida do workspace
 *
 * Rota principal do sistema que exige autenticação.
 * Redireciona para /login se não autenticado ou sessão expirada.
 */

import { createFileRoute, redirect } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { WorkspaceLayout } from '@/layouts/WorkspaceLayout';
import { useAuthStore } from '@stores';
import {
  SESSION_CHECK_INTERVAL_MS,
  SESSION_WARNING_MS,
} from '@/lib/authConfig';
import { useSessionActivityTracker } from '@/hooks/useSessionActivityTracker';
import { SessionExpiringDialog } from '@/components/shared/SessionExpiringDialog';

export const Route = createFileRoute('/app')({
  // Protege a rota - só autenticados E com sessão válida podem acessar
  beforeLoad: () => {
    const auth = useAuthStore.getState();

    if (!auth.isAuthenticated) {
      throw redirect({ to: '/login' });
    }

    if (auth.isSessionExpired()) {
      auth.logout();
      throw redirect({ to: '/login' });
    }
  },

  component: AppLayout,
});

function AppLayout() {
  // Renova sessão por atividade do user (sliding expiration).
  useSessionActivityTracker();

  // Estado do modal de aviso.
  const [warningOpen, setWarningOpen] = useState(false);

  // Checagem periódica de expiração e janela de aviso.
  useEffect(() => {
    const interval = setInterval(() => {
      const auth = useAuthStore.getState();
      if (!auth.isAuthenticated) return;

      const restante = auth.msUntilExpiry();

      // Expirou: logout + redireciona
      if (restante <= 0) {
        setWarningOpen(false);
        auth.logout();
        window.location.href = '/login';
        return;
      }

      // Dentro da janela de aviso: abre modal (se ainda não estiver aberto)
      if (restante <= SESSION_WARNING_MS) {
        setWarningOpen(true);
      } else if (warningOpen) {
        // Saiu da janela (atividade renovou) - fecha modal
        setWarningOpen(false);
      }
    }, SESSION_CHECK_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [warningOpen]);

  const handleExtend = () => {
    useAuthStore.getState().refreshSession();
    setWarningOpen(false);
  };

  const handleLogoutNow = () => {
    setWarningOpen(false);
    useAuthStore.getState().logout();
    window.location.href = '/login';
  };

  const handleTimeout = () => {
    setWarningOpen(false);
    useAuthStore.getState().logout();
    window.location.href = '/login';
  };

  return (
    <>
      <WorkspaceLayout />
      <SessionExpiringDialog
        open={warningOpen}
        warningMs={SESSION_WARNING_MS}
        onExtend={handleExtend}
        onLogout={handleLogoutNow}
        onTimeout={handleTimeout}
      />
    </>
  );
}
