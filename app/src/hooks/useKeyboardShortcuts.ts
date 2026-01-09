/**
 * useKeyboardShortcuts.ts - Hook para gerenciar atalhos de teclado globais
 * 
 * Registra listeners de teclado para atalhos do sistema:
 * - Ctrl+K ou Cmd+K: Abre Command Palette
 * - Ctrl+Shift+T: Reabre última aba fechada
 * 
 * Uso:
 * ```tsx
 * useKeyboardShortcuts({
 *   onCommandPalette: () => setOpen(true),
 *   onReopenTab: () => tabsStore.reopenLastTab()
 * });
 * ```
 */

import { useEffect } from 'react';

interface KeyboardShortcutsProps {
    /** Callback ao pressionar Ctrl+K */
    onCommandPalette?: () => void;

    /** Callback ao pressionar Ctrl+Shift+T */
    onReopenTab?: () => void;
}

export function useKeyboardShortcuts({
    onCommandPalette,
    onReopenTab,
}: KeyboardShortcutsProps) {
    useEffect(() => {
        /**
         * Handler do evento de teclado
         */
        const handleKeyDown = (e: KeyboardEvent) => {
            // Ctrl+K ou Cmd+K (Mac)
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                onCommandPalette?.();
            }

            // Ctrl+Shift+T ou Cmd+Shift+T (Mac)
            if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'T') {
                e.preventDefault();
                onReopenTab?.();
            }
        };

        window.addEventListener('keydown', handleKeyDown);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [onCommandPalette, onReopenTab]);
}