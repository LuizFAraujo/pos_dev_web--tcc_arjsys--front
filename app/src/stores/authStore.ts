/**
 * authStore.ts - Store de autenticação com API real
 *
 * POST /api/admin/Auth/login
 * Armazena FuncionarioLogado + permissões no Zustand com persist.
 * Sem JWT - sessão expira via TTL local (ver lib/authConfig.ts).
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { apiPost } from '@/lib/api';
import { SESSION_TTL_MS } from '@/lib/authConfig';
import type {
  AuthState,
  LoginCredentials,
  FuncionarioLogado,
  ModuloSistema,
  NivelPermissao,
} from '@/types/auth.types';

/** Hierarquia de níveis para comparação */
const NIVEL_HIERARQUIA: Record<NivelPermissao, number> = {
  SemAcesso: 0,
  Leitura: 1,
  LeituraEscrita: 2,
  Admin: 3,
};

interface AuthStore extends AuthState {
  /** Faz login com credenciais reais */
  login: (credentials: LoginCredentials) => Promise<void>;

  /** Faz logout e limpa dados */
  logout: () => void;

  /** Renova o timestamp da sessão (chamado por atividade do user). */
  refreshSession: () => void;

  /** Retorna true se a sessão expirou pelo TTL. */
  isSessionExpired: () => boolean;

  /** Retorna milissegundos restantes até expirar (negativo se já expirou). */
  msUntilExpiry: () => number;

  /**
   * Verifica se o funcionário tem permissão em um módulo.
   */
  temPermissao: (modulo: ModuloSistema, nivelMinimo?: NivelPermissao) => boolean;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      funcionario: null,
      isAuthenticated: false,
      loggedInAt: null,

      login: async (credentials: LoginCredentials) => {
        const data = await apiPost<FuncionarioLogado>(
          '/api/admin/Auth/login',
          credentials,
        );

        set({
          funcionario: data,
          isAuthenticated: true,
          loggedInAt: Date.now(),
        });

        // Re-hidrata stores user-scoped pra carregar dados do user atual.
        // Import dinâmico evita ciclo de dependência.
        try {
          const [
            { useFavoritesStore },
            { useRecentsStore },
            { useSidebarStore },
            { useThemeStore },
          ] = await Promise.all([
            import('./favoritesStore'),
            import('./recentsStore'),
            import('./sidebarStore'),
            import('./themeStore'),
          ]);
          await useFavoritesStore.persist.rehydrate();
          await useRecentsStore.persist.rehydrate();
          await useSidebarStore.persist.rehydrate();
          await useThemeStore.persist.rehydrate();
        } catch (e) {
          console.warn('Falha ao re-hidratar stores user-scoped:', e);
        }
      },

      logout: () => {
        set({
          funcionario: null,
          isAuthenticated: false,
          loggedInAt: null,
        });

        // Limpa abas abertas e estado em memória das abas.
        try {
          // Imports dinâmicos pra evitar ciclo.
          void import('./tabsStore').then(({ useTabsStore }) => {
            useTabsStore.setState({
              tabs: [],
              activeTabId: null,
              closedHistory: [],
            });
          });
          void import('@/hooks/useTabState').then(({ clearAllTabStates }) => {
            clearAllTabStates();
          });
        } catch (e) {
          console.warn('Falha ao limpar abas no logout:', e);
        }
      },

      refreshSession: () => {
        // Só renova se houver sessão ativa.
        if (!get().isAuthenticated) return;
        set({ loggedInAt: Date.now() });
      },

      isSessionExpired: () => {
        const t = get().loggedInAt;
        if (!t) return false; // sem sessão ativa, nada a expirar
        return Date.now() - t > SESSION_TTL_MS;
      },

      msUntilExpiry: () => {
        const t = get().loggedInAt;
        if (!t) return 0;
        return SESSION_TTL_MS - (Date.now() - t);
      },

      temPermissao: (modulo: ModuloSistema, nivelMinimo: NivelPermissao = 'Leitura') => {
        const { funcionario } = get();
        if (!funcionario) return false;

        const permissao = funcionario.permissoes.find((p) => p.modulo === modulo);
        if (!permissao) return false;

        return NIVEL_HIERARQUIA[permissao.nivel] >= NIVEL_HIERARQUIA[nivelMinimo];
      },
    }),
    {
      name: 'arjsys-auth',
    },
  ),
);
