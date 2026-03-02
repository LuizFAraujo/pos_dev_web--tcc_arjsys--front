// ========================================
// STORE — CLIENTES (Admin) — API Real
// ========================================

import { create } from 'zustand';
import { apiGet, apiPost, apiPut, apiDelete, ApiError } from '@/lib/api';
import type { Cliente, ClienteFormData } from '@/types/admin/cliente.types';

interface ClientesState {
  clientes: Cliente[];
  isLoading: boolean;
  error: string | null;

  fetchClientes: () => Promise<void>;
  createCliente: (data: ClienteFormData) => Promise<void>;
  updateCliente: (id: number, data: ClienteFormData) => Promise<void>;
  deleteCliente: (id: number) => Promise<void>;
  clearError: () => void;
}

export const useClientesStore = create<ClientesState>((set, get) => ({
  clientes: [],
  isLoading: false,
  error: null,

  fetchClientes: async () => {
    set({ isLoading: true, error: null });
    try {
      const raw = await apiGet<any>('/api/admin/Clientes');
      let clientes: Cliente[] = [];
      if (Array.isArray(raw)) {
        clientes = raw;
      } else if (raw && Array.isArray(raw.itens)) {
        clientes = raw.itens;
      } else if (raw && typeof raw === 'object') {
        const arrays = Object.values(raw).filter(Array.isArray);
        if (arrays.length > 0) clientes = arrays[0] as Cliente[];
      }
      set({ clientes, isLoading: false });
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Erro ao carregar clientes';
      set({ error: message, isLoading: false });
    }
  },

  createCliente: async (data) => {
    set({ error: null });
    try {
      const novo = await apiPost<Cliente>('/api/admin/Clientes', data);
      if (novo && novo.id) {
        set((state) => ({ clientes: [...state.clientes, novo] }));
      } else {
        // POST retornou vazio, recarrega lista
        await get().fetchClientes();
      }
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Erro ao criar cliente';
      set({ error: message });
      throw err;
    }
  },

  updateCliente: async (id, data) => {
    set({ error: null });
    try {
      const resposta = await apiPut<Cliente | null>(`/api/admin/Clientes/${id}`, data);
      if (resposta && resposta.id) {
        // Backend retornou o objeto atualizado
        set((state) => ({
          clientes: state.clientes.map((c) => (c.id === id ? resposta : c)),
        }));
      } else {
        // Backend retornou 204 No Content — mescla dados locais
        set((state) => ({
          clientes: state.clientes.map((c) =>
            c.id === id ? { ...c, ...data, updatedAt: new Date().toISOString() } : c
          ),
        }));
      }
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Erro ao atualizar cliente';
      set({ error: message });
      throw err;
    }
  },

  deleteCliente: async (id) => {
    set({ error: null });
    try {
      await apiDelete(`/api/admin/Clientes/${id}`);
      set((state) => ({
        clientes: state.clientes.filter((c) => c.id !== id),
      }));
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Erro ao excluir cliente';
      set({ error: message });
      throw err;
    }
  },

  clearError: () => set({ error: null }),
}));
