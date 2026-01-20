/**
 * modelosRegistry.ts - Registry de páginas modelo
 * 
 * Páginas de exemplo que servem como template para o desenvolvimento
 * de novas funcionalidades do sistema.
 */

import { ModeloListaPage } from '@/pages/_modelos/ModeloListaPage';
import { ModeloFormPage } from '@/pages/_modelos/ModeloFormPage';
import { ModeloComplexoPage } from '@/pages/_modelos/ModeloComplexoPage';

import { FileText, FileEdit, Layout } from 'lucide-react';
import type { TabRegistry } from '@/types/registry.types';


export const modelosRegistry: TabRegistry = {
    'modelo-lista': {
        component: ModeloListaPage,
        icon: FileText,
        defaultTitle: 'Lista Simples',
        category: 'modelos',
    },
    'modelo-form': {
        component: ModeloFormPage,
        icon: FileEdit,
        defaultTitle: 'Formulário',
        category: 'modelos',
    },
    'modelo-complexo': {
        component: ModeloComplexoPage,
        icon: Layout,
        defaultTitle: 'Página Complexa',
        category: 'modelos',
    },
};