/**
 * StatsContent.tsx - Conteúdo da sidebar de estatísticas
 * 
 * Exibe estatísticas de uso do sistema (mock data).
 * Mostra abas abertas, tempo de sessão e ações recentes.
 */

import { BarChart3, Clock, Layers, Activity } from 'lucide-react';
import { useTabsStore } from '@stores';

export function StatsContent() {
    const tabs = useTabsStore((state) => state.tabs);

    const stats = [
        {
            icon: Layers,
            label: 'Abas Abertas',
            value: tabs.length.toString(),
            color: 'text-blue-600 dark:text-blue-400',
        },
        {
            icon: Clock,
            label: 'Tempo de Sessão',
            value: '1h 23min',
            color: 'text-emerald-600 dark:text-emerald-400',
        },
        {
            icon: Activity,
            label: 'Ações Hoje',
            value: '47',
            color: 'text-orange-600 dark:text-orange-400',
        },
    ];

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                    Estatísticas
                </h3>
            </div>

            {/* Stats Cards */}
            <div className="space-y-3">
                {stats.map((stat) => {
                    const Icon = stat.icon;
                    return (
                        <div
                            key={stat.label}
                            className="p-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                        >
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800">
                                    <Icon className={`h-5 w-5 ${stat.color}`} />
                                </div>
                                <div>
                                    <p className="text-xs text-slate-600 dark:text-slate-400">
                                        {stat.label}
                                    </p>
                                    <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                                        {stat.value}
                                    </p>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Info */}
            <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
                <p className="text-xs text-slate-500 dark:text-slate-400">
                    Estatísticas detalhadas e gráficos serão adicionados em versões futuras.
                </p>
            </div>
        </div>
    );
}