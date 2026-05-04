/**
 * useTabState.ts - Hook para gerenciar estado isolado por aba
 *
 * Cada aba mantém seu próprio estado independente usando um Map global.
 * Quando a aba é fechada, o estado é limpo automaticamente.
 *
 * Subscriber pattern: múltiplos componentes lendo a mesma key
 * são notificados quando qualquer um deles (ou a page) faz setState.
 * Isso permite sincronização bidirecional (ex: DataGrid ↔ PanelFilters).
 */

import { useState, useEffect, useCallback, useRef } from 'react';

// Map global para armazenar estado de cada aba
const tabStates = new Map<string, any>();

// Subscribers por key - cada listener é um forceUpdate de um componente
const subscribers = new Map<string, Set<() => void>>();

function notify(key: string) {
  const subs = subscribers.get(key);
  if (subs) subs.forEach(fn => fn());
}

/**
 * Hook que cria estado isolado por tabId
 *
 * @param tabId - ID único (ex: 'tab1-filters', 'tab1-sort')
 * @param initialState - Estado inicial
 * @returns [state, setState] - Tupla igual ao useState
 */
export function useTabState<T>(tabId: string, initialState: T): [T, (value: T | ((prev: T) => T)) => void] {
  // Inicializa estado da aba se não existir
  if (!tabStates.has(tabId)) {
    tabStates.set(tabId, initialState);
  }

  const [, forceUpdate] = useState({});
  const mountedRef = useRef(true);

  // Registra subscriber
  useEffect(() => {
    mountedRef.current = true;

    const listener = () => {
      if (mountedRef.current) forceUpdate({});
    };

    if (!subscribers.has(tabId)) {
      subscribers.set(tabId, new Set());
    }
    subscribers.get(tabId)!.add(listener);

    return () => {
      mountedRef.current = false;
      subscribers.get(tabId)?.delete(listener);
      if (subscribers.get(tabId)?.size === 0) {
        subscribers.delete(tabId);
      }
    };
  }, [tabId]);

  const setState = useCallback((value: T | ((prev: T) => T)) => {
    const currentState = tabStates.get(tabId);
    const newState = typeof value === 'function'
      ? (value as (prev: T) => T)(currentState)
      : value;

    tabStates.set(tabId, newState);
    notify(tabId);
  }, [tabId]);

  const state = tabStates.get(tabId) as T;

  return [state, setState];
}

/**
 * Limpa o estado de uma aba quando ela é fechada
 */
export function clearTabState(tabId: string) {
  // Limpa todos os estados que começam com o tabId
  for (const key of tabStates.keys()) {
    if (key === tabId || key.startsWith(tabId + '-')) {
      tabStates.delete(key);
      subscribers.delete(key);
    }
  }
}

/**
 * Limpa todos os estados (útil para logout)
 */
export function clearAllTabStates() {
  tabStates.clear();
  subscribers.clear();
}
