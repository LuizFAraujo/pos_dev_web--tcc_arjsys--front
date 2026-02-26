/**
 * authStore.ts - Store de autenticação com API real
 *
 * POST /api/admin/Auth/login
 * Armazena FuncionarioLogado + permissões no Zustand com persist.
 * Sem JWT — armazena apenas dados retornados pelo backend.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { apiPost, ApiError } from '@/lib/api';
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

  /**
   * Verifica se o funcionário tem permissão em um módulo.
   * @param modulo - Módulo a verificar
   * @param nivelMinimo - Nível mínimo necessário (default: 'Leitura')
   * @returns true se tem permissão suficiente
   */
  temPermissao: (modulo: ModuloSistema, nivelMinimo?: NivelPermissao) => boolean;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // Estado inicial
      funcionario: null,
      isAuthenticated: false,

      login: async (credentials: LoginCredentials) => {
        const data = await apiPost<FuncionarioLogado>(
          '/api/admin/Auth/login',
          credentials,
        );

        set({
          funcionario: data,
          isAuthenticated: true,
        });
      },

      logout: () => {
        set({
          funcionario: null,
          isAuthenticated: false,
        });
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
