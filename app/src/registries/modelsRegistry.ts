/**
 * modelsRegistry.ts - Registry de páginas modelo
 * 
 * Páginas de exemplo que servem como template para o desenvolvimento
 * de novas funcionalidades do sistema.
 */

import { FileText } from 'lucide-react';
import type { TabRegistry } from '@/types/registry.types';
import { ModeloListaPage } from '@/pages/models/ModeloListaPage';

export const modelsRegistry: TabRegistry = {
    'modelo-lista': {
        component: ModeloListaPage,
        icon: FileText,
        defaultTitle: 'Modelo: Lista Simples',
        category: 'models',
    },
};