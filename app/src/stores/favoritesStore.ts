/**
 * favoritesStore.ts - Store para gerenciar favoritos
 * 
 * Permite marcar páginas como favoritas para acesso rápido.
 * Persiste no localStorage.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface FavoritesState {
    /** Array de tipos de abas favoritadas */
    favorites: string[];

    /** Adiciona um favorito */
    addFavorite: (type: string) => void;

    /** Remove um favorito */
    removeFavorite: (type: string) => void;

    /** Verifica se é favorito */
    isFavorite: (type: string) => boolean;

    /** Limpa todos os favoritos */
    clearFavorites: () => void;
}

export const useFavoritesStore = create<FavoritesState>()(
    persist(
        (set, get) => ({
            favorites: [],

            addFavorite: (type) =>
                set((state) => ({
                    favorites: state.favorites.includes(type)
                        ? state.favorites
                        : [...state.favorites, type],
                })),

            removeFavorite: (type) =>
                set((state) => ({
                    favorites: state.favorites.filter((f) => f !== type),
                })),

            isFavorite: (type) => get().favorites.includes(type),

            clearFavorites: () => set({ favorites: [] }),
        }),
        {
            name: 'arjsys-favorites',
        }
    )
);