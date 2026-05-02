// ========================================
// STORE — ORDEM DE PRODUÇÃO (Produção) — v3
// ========================================
// Endpoints (feature/vendas):
//   GET    /api/producao/OrdemProducao                      → lista (?pagina=N&tamanho=N)
//   GET    /api/producao/OrdemProducao/{id}                 → detalhe (itens + filhas)
//   GET    /api/producao/OrdemProducao/pedido/{pvId}        → OPs de um PV
//   GET    /api/producao/OrdemProducao/{id}/status-producao → consolidado %
//   GET    /api/producao/OrdemProducao/{id}/divergencia-bom → snapshot × BOM atual
//   GET    /api/producao/OrdemProducao/{id}/historico       → log
//   POST   /api/producao/OrdemProducao/master               → cria Master (PV opcional)
//   POST   /api/producao/OrdemProducao/filha                → cria Filha (de uma Master)
//   PUT    /api/producao/OrdemProducao/{id}                 → edita observações
//   PATCH  /api/producao/OrdemProducao/{id}/status          → muda status (justificativa condicional)
//   PATCH  /api/producao/OrdemProducao/{id}/itens/{itemId}/apontar → aponta produção
//   DELETE /api/producao/OrdemProducao/{id}                 → só Pendente sem apontamento

import { create } from 'zustand';
import { apiGet, apiPost, apiPut, apiPatch, apiDelete, ApiError } from '@/lib/api';
import type {
  OrdemProducao,
  OrdemProducaoMasterCreateData,
  OrdemProducaoFilhaCreateData,
  OrdemProducaoUpdateData,
  OrdemProducaoStatusUpdate,
  OrdemProducaoApontamentoData,
  OrdemProducaoHistorico,
  OrdemProducaoStatusProducao,
  OrdemProducaoDivergencia,
  StatusOrdemProducao,
} from '@/types/producao/ordemProducao.types';

interface OrdemProducaoState {
  ordens: OrdemProducao[];
  ordemDetalhe: OrdemProducao | null;
  historico: OrdemProducaoHistorico[];
  statusProducao: OrdemProducaoStatusProducao | null;
  divergencia: OrdemProducaoDivergencia | null;
  isLoading: boolean;
  error: string | null;

  fetchOrdens: () => Promise<void>;
  fetchOrdem: (id: number) => Promise<void>;
  fetchOrdensByPedido: (pedidoVendaId: number) => Promise<OrdemProducao[]>;
  fetchStatusProducao: (id: number) => Promise<void>;
  fetchDivergencia: (id: number) => Promise<void>;
  fetchHistorico: (id: number) => Promise<void>;

  criarMaster: (data: OrdemProducaoMasterCreateData) => Promise<OrdemProducao | null>;
  criarFilha: (data: OrdemProducaoFilhaCreateData) => Promise<OrdemProducao | null>;
  updateOrdem: (id: number, data: OrdemProducaoUpdateData) => Promise<void>;
  alterarStatus: (id: number, novoStatus: StatusOrdemProducao, justificativa?: string) => Promise<void>;
  apontar: (id: number, itemId: number, data: OrdemProducaoApontamentoData) => Promise<void>;
  deleteOrdem: (id: number) => Promise<void>;

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

export const useOrdemProducaoStore = create<OrdemProducaoState>((set, get) => ({
  ordens: [],
  ordemDetalhe: null,
  historico: [],
  statusProducao: null,
  divergencia: null,
  isLoading: false,
  error: null,

  fetchOrdens: async () => {
    set({ isLoading: true, error: null });
    try {
      const raw = await apiGet<unknown>('/api/producao/OrdemProducao');
      const ordens = extractArray<OrdemProducao>(raw);
      set({ ordens, isLoading: false });
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Erro ao carregar ordens de produção';
      set({ error: message, isLoading: false });
    }
  },

  fetchOrdem: async (id) => {
    set({ error: null });
    try {
      const ordem = await apiGet<OrdemProducao>(`/api/producao/OrdemProducao/${id}`);
      set({ ordemDetalhe: ordem });
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Erro ao carregar ordem';
      set({ error: message });
    }
  },

  fetchOrdensByPedido: async (pedidoVendaId) => {
    try {
      const raw = await apiGet<unknown>(`/api/producao/OrdemProducao/pedido/${pedidoVendaId}`);
      return extractArray<OrdemProducao>(raw);
    } catch {
      return [];
    }
  },

  fetchStatusProducao: async (id) => {
    set({ error: null });
    try {
      const sp = await apiGet<OrdemProducaoStatusProducao>(
        `/api/producao/OrdemProducao/${id}/status-producao`,
      );
      set({ statusProducao: sp });
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Erro ao carregar status de produção';
      set({ error: message });
    }
  },

  fetchDivergencia: async (id) => {
    set({ error: null });
    try {
      const div = await apiGet<OrdemProducaoDivergencia>(
        `/api/producao/OrdemProducao/${id}/divergencia-bom`,
      );
      set({ divergencia: div });
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Erro ao carregar divergência';
      set({ error: message });
    }
  },

  fetchHistorico: async (id) => {
    set({ error: null });
    try {
      const raw = await apiGet<unknown>(`/api/producao/OrdemProducao/${id}/historico`);
      const historico = extractArray<OrdemProducaoHistorico>(raw);
      set({ historico });
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Erro ao carregar histórico';
      set({ error: message });
    }
  },

  criarMaster: async (data) => {
    set({ error: null });
    try {
      const nova = await apiPost<OrdemProducao>('/api/producao/OrdemProducao/master', data);
      if (nova && nova.id) {
        set((state) => ({ ordens: [...state.ordens, nova] }));
        return nova;
      }
      await get().fetchOrdens();
      return null;
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Erro ao criar OP Master';
      set({ error: message });
      throw err;
    }
  },

  criarFilha: async (data) => {
    set({ error: null });
    try {
      const nova = await apiPost<OrdemProducao>('/api/producao/OrdemProducao/filha', data);
      if (nova && nova.id) {
        set((state) => ({ ordens: [...state.ordens, nova] }));
        return nova;
      }
      await get().fetchOrdens();
      return null;
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Erro ao criar OP Filha';
      set({ error: message });
      throw err;
    }
  },

  updateOrdem: async (id, data) => {
    set({ error: null });
    try {
      await apiPut(`/api/producao/OrdemProducao/${id}`, data);
      await get().fetchOrdens();
      if (get().ordemDetalhe?.id === id) await get().fetchOrdem(id);
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Erro ao atualizar ordem';
      set({ error: message });
      throw err;
    }
  },

  alterarStatus: async (id, novoStatus, justificativa) => {
    set({ error: null });
    try {
      const payload: OrdemProducaoStatusUpdate = { novoStatus };
      if (justificativa && justificativa.trim()) {
        payload.justificativa = justificativa.trim();
      }
      await apiPatch(`/api/producao/OrdemProducao/${id}/status`, payload);
      await get().fetchOrdens();
      if (get().ordemDetalhe?.id === id) await get().fetchOrdem(id);
      // Atualiza histórico se já estiver carregado pra esta OP — assim a aba
      // Histórico no form reflete o evento recém-criado sem precisar fechar/reabrir.
      await get().fetchHistorico(id);
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Erro ao alterar status';
      set({ error: message });
      throw err;
    }
  },

  apontar: async (id, itemId, data) => {
    set({ error: null });
    try {
      await apiPatch(`/api/producao/OrdemProducao/${id}/itens/${itemId}/apontar`, data);
      await get().fetchOrdens();
      if (get().ordemDetalhe?.id === id) await get().fetchOrdem(id);
      await get().fetchHistorico(id);
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Erro ao apontar produção';
      set({ error: message });
      throw err;
    }
  },

  deleteOrdem: async (id) => {
    set({ error: null });
    try {
      await apiDelete(`/api/producao/OrdemProducao/${id}`);
      set((state) => ({
        ordens: state.ordens.filter((o) => o.id !== id),
        ordemDetalhe: state.ordemDetalhe?.id === id ? null : state.ordemDetalhe,
      }));
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Erro ao excluir ordem';
      set({ error: message });
      throw err;
    }
  },

  clearError: () => set({ error: null }),
}));
