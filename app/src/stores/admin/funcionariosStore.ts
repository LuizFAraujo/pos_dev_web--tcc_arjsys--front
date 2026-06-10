// ========================================
// STORE - FUNCIONÁRIOS (Admin) - API Real
// ========================================
// Listagem agora vem do useGridQuery (POST /buscar). Store mantém só as
// mutações pra serem chamadas pelas pages com refetch após sucesso.

import { create } from 'zustand';
import { apiPost, apiPut, apiDelete, ApiError } from '@/lib/api';
import type { Funcionario, FuncionarioFormData } from '@/types/admin/funcionario.types';

interface FuncionariosState {
  createFuncionario: (data: FuncionarioFormData) => Promise<void>;
  updateFuncionario: (id: number, data: FuncionarioFormData) => Promise<void>;
  deleteFuncionario: (id: number) => Promise<void>;
}

export const useFuncionariosStore = create<FuncionariosState>(() => ({
  createFuncionario: async (data) => {
    try {
      await apiPost<Funcionario>('/api/admin/Funcionarios', data);
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Erro ao criar funcionário';
      throw new Error(message);
    }
  },

  updateFuncionario: async (id, data) => {
    try {
      await apiPut<Funcionario | null>(`/api/admin/Funcionarios/${id}`, data);
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Erro ao atualizar funcionário';
      throw new Error(message);
    }
  },

  deleteFuncionario: async (id) => {
    try {
      await apiDelete(`/api/admin/Funcionarios/${id}`);
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Erro ao excluir funcionário';
      throw new Error(message);
    }
  },
}));
