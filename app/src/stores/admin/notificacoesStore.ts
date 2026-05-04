// ========================================
// STORE - NOTIFICAÇÕES (Admin) - v3
// ========================================
// Endpoints (feature/vendas):
//   GET    /api/admin/Notificacoes?modulo=X&lidas=true|false&pagina=N&tamanho=N
//   GET    /api/admin/Notificacoes/{id}
//   GET    /api/admin/Notificacoes/nao-lidas/contagem?modulo=X  → int
//   POST   /api/admin/Notificacoes                              → criação manual (raro)
//   PATCH  /api/admin/Notificacoes/{id}/lida
//   PATCH  /api/admin/Notificacoes/modulo/{modulo}/marcar-todas-lidas
//   DELETE /api/admin/Notificacoes/{id}
//
// Polling sugerido: 30s para contagem de não-lidas (ainda sem WebSocket).

import { create } from 'zustand';
import { apiGet, apiPatch, apiPost, apiDelete, ApiError } from '@/lib/api';
import type {
  Notificacao,
  NotificacaoCreateData,
  ModuloSistema,
} from '@/types/admin/notificacao.types';

interface NotificacoesState {
  notificacoes: Notificacao[];
  naoLidasPorModulo: Partial<Record<ModuloSistema, number>>;
  isLoading: boolean;
  error: string | null;

  fetchNotificacoes: (modulo: ModuloSistema, lidas?: boolean) => Promise<void>;
  fetchContagemNaoLidas: (modulo: ModuloSistema) => Promise<number>;
  createNotificacao: (data: NotificacaoCreateData) => Promise<Notificacao | null>;
  marcarLida: (id: number) => Promise<void>;
  marcarTodasLidas: (modulo: ModuloSistema) => Promise<number>;
  deleteNotificacao: (id: number) => Promise<void>;
  clearError: () => void;
}

function extractArray<T>(raw: unknown): T[] {
  if (Array.isArray(raw)) return raw as T[];
  if (raw && typeof raw === 'object') {
    const obj = raw as Record<string, unknown>;
    if (Array.isArray(obj.itens)) return obj.itens as T[];
    const arrays = Object.values(obj).filter(Array.isArray);
    if (arrays.length > 0) return arrays[0] as T[];
  }
  return [];
}

export const useNotificacoesStore = create<NotificacoesState>((set, get) => ({
  notificacoes: [],
  naoLidasPorModulo: {},
  isLoading: false,
  error: null,

  fetchNotificacoes: async (modulo, lidas) => {
    set({ isLoading: true, error: null });
    try {
      const params = new URLSearchParams();
      params.set('modulo', modulo);
      if (typeof lidas === 'boolean') params.set('lidas', String(lidas));
      const raw = await apiGet<unknown>(`/api/admin/Notificacoes?${params.toString()}`);
      const notificacoes = extractArray<Notificacao>(raw);
      set({ notificacoes, isLoading: false });
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Erro ao carregar notificações';
      set({ error: message, isLoading: false });
    }
  },

  fetchContagemNaoLidas: async (modulo) => {
    try {
      const count = await apiGet<number>(
        `/api/admin/Notificacoes/nao-lidas/contagem?modulo=${modulo}`,
      );
      const safe = typeof count === 'number' ? count : 0;
      set((state) => ({
        naoLidasPorModulo: { ...state.naoLidasPorModulo, [modulo]: safe },
      }));
      return safe;
    } catch {
      return 0;
    }
  },

  createNotificacao: async (data) => {
    set({ error: null });
    try {
      const nova = await apiPost<Notificacao>('/api/admin/Notificacoes', data);
      if (nova && nova.id) {
        set((state) => ({ notificacoes: [nova, ...state.notificacoes] }));
        return nova;
      }
      return null;
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Erro ao criar notificação';
      set({ error: message });
      throw err;
    }
  },

  marcarLida: async (id) => {
    set({ error: null });
    try {
      await apiPatch(`/api/admin/Notificacoes/${id}/lida`, {});
      set((state) => ({
        notificacoes: state.notificacoes.map((n) =>
          n.id === id ? { ...n, lida: true, dataLeitura: new Date().toISOString() } : n,
        ),
      }));
      // Atualiza contagem do módulo afetado
      const afetada = get().notificacoes.find((n) => n.id === id);
      if (afetada) await get().fetchContagemNaoLidas(afetada.moduloDestino);
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Erro ao marcar como lida';
      set({ error: message });
      throw err;
    }
  },

  marcarTodasLidas: async (modulo) => {
    set({ error: null });
    try {
      const resp = await apiPatch<{ afetadas: number }>(
        `/api/admin/Notificacoes/modulo/${modulo}/marcar-todas-lidas`,
        {},
      );
      set((state) => ({
        notificacoes: state.notificacoes.map((n) =>
          n.moduloDestino === modulo && !n.lida
            ? { ...n, lida: true, dataLeitura: new Date().toISOString() }
            : n,
        ),
        naoLidasPorModulo: { ...state.naoLidasPorModulo, [modulo]: 0 },
      }));
      return resp?.afetadas ?? 0;
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Erro ao marcar todas como lidas';
      set({ error: message });
      throw err;
    }
  },

  deleteNotificacao: async (id) => {
    set({ error: null });
    try {
      await apiDelete(`/api/admin/Notificacoes/${id}`);
      set((state) => ({
        notificacoes: state.notificacoes.filter((n) => n.id !== id),
      }));
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Erro ao excluir notificação';
      set({ error: message });
      throw err;
    }
  },

  clearError: () => set({ error: null }),
}));
