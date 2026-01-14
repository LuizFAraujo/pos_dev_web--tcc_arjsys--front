/**
 * useTabForm.ts - Hook para gerenciar formulários completos isolados por aba
 * 
 * Usa um único objeto de estado ao invés de múltiplos useTabState.
 * Mais simples e performático!
 */

import { useTabState } from './useTabState';
import type { Tab } from '@/types/tab.types';

/**
 * Hook que gerencia formulário completo com um único estado
 * 
 * @param tab - Objeto da aba atual
 * @param initialValues - Valores iniciais do formulário
 * @returns [values, handlers] - Estado e funções auxiliares
 */
export function useTabForm<T extends Record<string, any>>(
    tab: Tab,
    initialValues: T
) {
    const [values, setValues] = useTabState(tab.id, initialValues);

    const setValue = (field: keyof T, value: any) => {
        setValues((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const setMultipleValues = (updates: Partial<T>) => {
        setValues((prev) => ({
            ...prev,
            ...updates,
        }));
    };

    const resetForm = () => {
        setValues(initialValues);
    };

    const resetField = (field: keyof T) => {
        setValues((prev) => ({
            ...prev,
            [field]: initialValues[field],
        }));
    };

    return {
        values,
        setValue,
        setMultipleValues,
        resetForm,
        resetField,
    };
}