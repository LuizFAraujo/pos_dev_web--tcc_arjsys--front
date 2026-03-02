// ========================================
// STORE — FUNCIONÁRIOS (Admin) — API Real
// ========================================

import { create } from 'zustand';
import { apiGet, apiPost, apiPut, apiDelete, ApiError } from '@/lib/api';
import type { Funcionario, FuncionarioFormData } from '@/types/admin/funcionario.types';

interface FuncionariosState {
  funcionarios: Funcionario[];
  isLoading: boolean;
  error: string | null;

  fetchFuncionarios: () => Promise<void>;
  createFuncionario: (data: FuncionarioFormData) => Promise<void>;
  updateFuncionario: (id: number, data: FuncionarioFormData) => Promise<void>;
  deleteFuncionario: (id: number) => Promise<void>;
  clearError: () => void;
}

export const useFuncionariosStore = create<FuncionariosState>((set, get) => ({
  funcionarios: [],
  isLoading: false,
  error: null,

  fetchFuncionarios: async () => {
    set({ isLoading: true, error: null });
    try {
      const raw = await apiGet<any>('/api/admin/Funcionarios');
      let funcionarios: Funcionario[] = [];
      if (Array.isArray(raw)) {
        funcionarios = raw;
      } else if (raw && Array.isArray(raw.itens)) {
        funcionarios = raw.itens;
      } else if (raw && typeof raw === 'object') {
        const arrays = Object.values(raw).filter(Array.isArray);
        if (arrays.length > 0) funcionarios = arrays[0] as Funcionario[];
      }
      set({ funcionarios, isLoading: false });
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Erro ao carregar funcionários';
      set({ error: message, isLoading: false });
    }
  },

  createFuncionario: async (data) => {
    set({ error: null });
    try {
      const novo = await apiPost<Funcionario>('/api/admin/Funcionarios', data);
      if (novo && novo.id) {
        set((state) => ({ funcionarios: [...state.funcionarios, novo] }));
      } else {
        await get().fetchFuncionarios();
      }
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Erro ao criar funcionário';
      set({ error: message });
      throw err;
    }
  },

  updateFuncionario: async (id, data) => {
    set({ error: null });
    try {
      const resposta = await apiPut<Funcionario | null>(`/api/admin/Funcionarios/${id}`, data);
      if (resposta && resposta.id) {
        set((state) => ({
          funcionarios: state.funcionarios.map((f) => (f.id === id ? resposta : f)),
        }));
      } else {
        // 204 No Content — mescla dados locais
        set((state) => ({
          funcionarios: state.funcionarios.map((f) =>
            f.id === id ? { ...f, ...data, updatedAt: new Date().toISOString() } : f
          ),
        }));
      }
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Erro ao atualizar funcionário';
      set({ error: message });
      throw err;
    }
  },

  deleteFuncionario: async (id) => {
    set({ error: null });
    try {
      await apiDelete(`/api/admin/Funcionarios/${id}`);
      set((state) => ({
        funcionarios: state.funcionarios.filter((f) => f.id !== id),
      }));
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Erro ao excluir funcionário';
      set({ error: message });
      throw err;
    }
  },

  clearError: () => set({ error: null }),
}));
