/**
 * modelosRegistry.ts - Registry de páginas modelo
 *
 * Páginas de exemplo que servem como template para o desenvolvimento
 * de novas funcionalidades do sistema.
 *
 * Páginas carregadas via React.lazy — cada uma vira chunk separado no build.
 */

import { lazy } from 'react';
import { FileText, FileEdit, Layout } from 'lucide-react';
import type { TabRegistry } from '@/types/registry.types';

const ModeloListaPage = lazy(() =>
  import('@/pages/_modelos/ModeloListaPage').then((m) => ({ default: m.ModeloListaPage })),
);
const ModeloFormPage = lazy(() =>
  import('@/pages/_modelos/ModeloFormPage').then((m) => ({ default: m.ModeloFormPage })),
);
const ModeloComplexoPage = lazy(() =>
  import('@/pages/_modelos/ModeloComplexoPage').then((m) => ({ default: m.ModeloComplexoPage })),
);

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
