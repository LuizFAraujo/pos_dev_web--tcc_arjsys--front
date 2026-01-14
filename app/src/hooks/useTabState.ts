/**
 * useTabState.ts - Hook para gerenciar estado isolado por aba
 * 
 * Cada aba mantém seu próprio estado independente usando um Map global.
 * Quando a aba é fechada, o estado é limpo automaticamente.
 */

import { useState, useEffect, useRef } from 'react';

// Map global para armazenar estado de cada aba
const tabStates = new Map<string, any>();

/**
 * Hook que cria estado isolado por tabId
 * 
 * @param tabId - ID único da aba
 * @param initialState - Estado inicial
 * @returns [state, setState] - Tupla igual ao useState
 */
export function useTabState<T>(tabId: string, initialState: T): [T, (value: T | ((prev: T) => T)) => void] {
    // Inicializa estado da aba se não existir
    if (!tabStates.has(tabId)) {
        tabStates.set(tabId, initialState);
    }

    const [, forceUpdate] = useState({});
    const mounted = useRef(true);

    useEffect(() => {
        mounted.current = true;
        return () => {
            mounted.current = false;
        };
    }, []);

    const setState = (value: T | ((prev: T) => T)) => {
        const currentState = tabStates.get(tabId);
        const newState = typeof value === 'function' 
            ? (value as (prev: T) => T)(currentState)
            : value;
        
        tabStates.set(tabId, newState);
        
        if (mounted.current) {
            forceUpdate({});
        }
    };

    const state = tabStates.get(tabId) as T;

    return [state, setState];
}

/**
 * Limpa o estado de uma aba quando ela é fechada
 */
export function clearTabState(tabId: string) {
    tabStates.delete(tabId);
}

/**
 * Limpa todos os estados (útil para logout)
 */
export function clearAllTabStates() {
    tabStates.clear();
}