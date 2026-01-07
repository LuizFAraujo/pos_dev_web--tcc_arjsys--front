/**
 * themeStore.ts - Store de gerenciamento de temas
 * 
 * Gerencia tema de cores e modo dark/light do sistema.
 * Persiste configurações no localStorage.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type ThemeName = 'default' | 'emerald' | 'orange' | 'purple';

interface ThemeState {
    /** Tema de cores atual */
    theme: ThemeName;

    /** Modo escuro ativado */
    darkMode: boolean;

    /** Alterar tema */
    setTheme: (theme: ThemeName) => void;

    /** Toggle dark mode */
    toggleDarkMode: () => void;

    /** Aplicar classe dark no HTML */
    applyDarkMode: () => void;
}

export const useThemeStore = create<ThemeState>()(
    persist(
        (set, get) => ({
            theme: 'default',
            darkMode: false,

            setTheme: (theme) => {
                set({ theme });
            },

            toggleDarkMode: () => {
                set((state) => ({ darkMode: !state.darkMode }));
                get().applyDarkMode();
            },

            applyDarkMode: () => {
                const { darkMode } = get();
                if (darkMode) {
                    document.documentElement.classList.add('dark');
                } else {
                    document.documentElement.classList.remove('dark');
                }
            },
        }),
        {
            name: 'arjsys-theme',
            onRehydrateStorage: () => (state) => {
                // Aplicar dark mode ao carregar do localStorage
                state?.applyDarkMode();
            },
        }
    )
);