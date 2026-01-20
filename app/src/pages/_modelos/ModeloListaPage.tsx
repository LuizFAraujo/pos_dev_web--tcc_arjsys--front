/**
 * ModeloListaPage.tsx - Página modelo de lista simples
 * 
 * Template de página com lista de items.
 * Serve como exemplo de implementação para outras páginas do sistema.
 * 
 * Funcionalidades:
 * - PageHeader com título e ações
 * - Lista de items com mock data
 * - Scroll vertical
 * - Botão de adicionar
 * - Hover effects
 * - Dark mode
 */

import { Plus, Package } from 'lucide-react';
import { PageWrapper } from '@/components/shared/PageWrapper';
import { PageHeader } from '@/components/shared/PageHeader';

// Mock data
const ITEMS = [
    { id: 1, name: 'Item Alpha', code: 'ITM-001', status: 'Ativo', date: '2024-01-15' },
    { id: 2, name: 'Item Beta', code: 'ITM-002', status: 'Ativo', date: '2024-01-16' },
    { id: 3, name: 'Item Gamma', code: 'ITM-003', status: 'Inativo', date: '2024-01-17' },
    { id: 4, name: 'Item Delta', code: 'ITM-004', status: 'Ativo', date: '2024-01-18' },
    { id: 5, name: 'Item Epsilon', code: 'ITM-005', status: 'Ativo', date: '2024-01-19' },
    { id: 6, name: 'Item Zeta', code: 'ITM-006', status: 'Pendente', date: '2024-01-20' },
    { id: 7, name: 'Item Eta', code: 'ITM-007', status: 'Ativo', date: '2024-01-21' },
    { id: 8, name: 'Item Theta', code: 'ITM-008', status: 'Inativo', date: '2024-01-22' },
];

export function ModeloListaPage() {
    const handleAdd = () => {
        console.log('Adicionar novo item');
    };

    const handleItemClick = (id: number) => {
        console.log('Item clicado:', id);
    };

    return (
        <PageWrapper>
            {/* Header */}
            <PageHeader
                title="Lista Simples"
                description="Template de página com lista de items e ações básicas"
                breadcrumbs={[
                    { label: 'Páginas Modelo', href: '/app' },
                    { label: 'Lista Simples' },
                ]}
                actions={
                    <button
                        onClick={handleAdd}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                    >
                        <Plus className="h-4 w-4" />
                        <span>Adicionar</span>
                    </button>
                }
            />

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
                <div className="max-w-4xl mx-auto space-y-2">
                    {ITEMS.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => handleItemClick(item.id)}
                            className="w-full flex items-center gap-4 p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-left"
                        >
                            {/* Ícone */}
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30 shrink-0">
                                <Package className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                                <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                                    {item.name}
                                </h3>
                                <p className="text-sm text-slate-600 dark:text-slate-400">
                                    Código: {item.code}
                                </p>
                            </div>

                            {/* Status */}
                            <div className="shrink-0">
                                <span
                                    className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${item.status === 'Ativo'
                                            ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                                            : item.status === 'Inativo'
                                                ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                                                : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
                                        }`}
                                >
                                    {item.status}
                                </span>
                            </div>

                            {/* Data */}
                            <div className="shrink-0 text-sm text-slate-500 dark:text-slate-400">
                                {item.date}
                            </div>
                        </button>
                    ))}
                </div>
            </div>
        </PageWrapper>
    );
}