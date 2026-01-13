/**
 * modelsRegistry.ts - Registry de páginas modelo
 * 
 * Páginas de exemplo que servem como template para o desenvolvimento
 * de novas funcionalidades do sistema.
 */

import { FileText, FileEdit, Layout } from 'lucide-react';
import type { TabRegistry } from '@/types/registry.types';
import { ModeloListaPage } from '@/pages/models/ModeloListaPage';
import { ModeloFormPage } from '@/pages/models/ModeloFormPage';
import { ModeloComplexoPage } from '@/pages/models/ModeloComplexoPage';

export const modelsRegistry: TabRegistry = {
    'modelo-lista': {
        component: ModeloListaPage,
        icon: FileText,
        defaultTitle: 'Modelo: Lista Simples',
        category: 'models',
    },
    'modelo-form': {
        component: ModeloFormPage,
        icon: FileEdit,
        defaultTitle: 'Modelo: Formulário',
        category: 'models',
    },
    'modelo-complexo': {
        component: ModeloComplexoPage,
        icon: Layout,
        defaultTitle: 'Modelo: Página Complexa',
        category: 'models',
    },
};