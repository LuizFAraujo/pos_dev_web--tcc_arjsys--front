/**
 * recentsStore.ts - Store para gerenciar páginas acessadas recentemente
 * 
 * Mantém histórico dos últimos 10 acessos.
 * Remove duplicatas automaticamente.
 * Persiste no localStorage.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface RecentsState {
    /** Array de tipos de abas acessadas recentemente (max 10) */
    recents: string[];

    /** Adiciona um acesso recente (remove duplicatas e mantém limite de 10) */
    addRecent: (type: string) => void;

    /** Limpa todo o histórico de recentes */
    clearRecents: () => void;
}

export const useRecentsStore = create<RecentsState>()(
    persist(
        (set) => ({
            recents: [],

            addRecent: (type) =>
                set((state) => {
                    // Remove duplicata se existir
                    const filtered = state.recents.filter((t) => t !== type);

                    // Adiciona no início (mais recente)
                    const updated = [type, ...filtered];

                    // Mantém apenas os 10 mais recentes
                    return { recents: updated.slice(0, 10) };
                }),

            clearRecents: () => set({ recents: [] }),
        }),
        {
            name: 'arjsys-recents',
        }
    )
);