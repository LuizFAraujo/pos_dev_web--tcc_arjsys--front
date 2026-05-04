// ========================================
// STORE - CONFIGURAÇÃO DE EMPRESA (Admin)
// ========================================
// Endpoints:
//   GET /api/admin/ConfiguracaoEmpresa  → lê (back auto-cria com fallback se não existir)
//   PUT /api/admin/ConfiguracaoEmpresa  → atualiza ano (bloqueia após NS emitido)
//
// Endpoint admin-override (PUT .../admin-override) NÃO é coberto aqui -
// fica pra quando o sistema de funções/admin estiver definido.
//
// Configurado=true libera a emissão de Números de Série.

import { create } from 'zustand';
import { apiGet, apiPut, ApiError } from '@/lib/api';
import type {
  ConfiguracaoEmpresa,
  ConfiguracaoEmpresaUpdateData,
} from '@/types/admin/configuracaoEmpresa.types';

interface ConfiguracaoEmpresaState {
  config: ConfiguracaoEmpresa | null;
  isLoading: boolean;
  error: string | null;

  fetchConfig: () => Promise<void>;
  updateConfig: (data: ConfiguracaoEmpresaUpdateData) => Promise<void>;
  clearError: () => void;
}

export const useConfiguracaoEmpresaStore = create<ConfiguracaoEmpresaState>((set) => ({
  config: null,
  isLoading: false,
  error: null,

  fetchConfig: async () => {
    set({ isLoading: true, error: null });
    try {
      const config = await apiGet<ConfiguracaoEmpresa>('/api/admin/ConfiguracaoEmpresa');
      set({ config, isLoading: false });
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : 'Erro ao carregar configuração da empresa';
      set({ error: message, isLoading: false });
    }
  },

  updateConfig: async (data) => {
    set({ error: null });
    try {
      await apiPut('/api/admin/ConfiguracaoEmpresa', data);
      // 204 No Content - refaz fetch pra refletir o novo estado (configurado=true após sucesso)
      const config = await apiGet<ConfiguracaoEmpresa>('/api/admin/ConfiguracaoEmpresa');
      set({ config });
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : 'Erro ao atualizar configuração da empresa';
      set({ error: message });
      throw err;
    }
  },

  clearError: () => set({ error: null }),
}));
