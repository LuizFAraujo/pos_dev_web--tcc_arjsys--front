// ========================================
// STORE — CLIENTES (Admin) — v3.1
// ========================================
// Endpoints:
//   GET    /api/admin/Clientes?busca=texto  → LIKE em nome/codigo/cpfCnpj/cidade
//   GET    /api/admin/Clientes/{id}
//   POST   /api/admin/Clientes              → retorna 201 + Cliente (com codigo gerado)
//   PUT    /api/admin/Clientes/{id}
//   DELETE /api/admin/Clientes/{id}
//
// Mudanças v3.1:
//   - fetchClientes aceita busca server-side opcional
//   - Preserva API pública antiga (chamadas sem argumento continuam funcionando)

import { create } from 'zustand';
import { apiGet, apiPost, apiPut, apiDelete, ApiError } from '@/lib/api';
import type { Cliente, ClienteFormData } from '@/types/admin/cliente.types';

interface ClientesState {
  clientes: Cliente[];
  /** Busca atual aplicada (pra debounce no input) */
  ultimaBusca: string;
  isLoading: boolean;
  error: string | null;

  /** Lista clientes. Se `busca` passado, faz LIKE no back; senão traz tudo. */
  fetchClientes: (busca?: string) => Promise<void>;
  createCliente: (data: ClienteFormData) => Promise<void>;
  updateCliente: (id: number, data: ClienteFormData) => Promise<void>;
  deleteCliente: (id: number) => Promise<void>;
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

export const useClientesStore = create<ClientesState>((set, get) => ({
  clientes: [],
  ultimaBusca: '',
  isLoading: false,
  error: null,

  fetchClientes: async (busca) => {
    set({ isLoading: true, error: null });
    try {
      const url = busca && busca.trim()
        ? `/api/admin/Clientes?busca=${encodeURIComponent(busca.trim())}`
        : '/api/admin/Clientes';
      const raw = await apiGet<unknown>(url);
      const clientes = extractArray<Cliente>(raw);
      set({ clientes, ultimaBusca: busca ?? '', isLoading: false });
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
        await get().fetchClientes(get().ultimaBusca || undefined);
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
        set((state) => ({
          clientes: state.clientes.map((c) => (c.id === id ? resposta : c)),
        }));
      } else {
        await get().fetchClientes(get().ultimaBusca || undefined);
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
