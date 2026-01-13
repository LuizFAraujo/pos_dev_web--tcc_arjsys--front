/**
 * ModeloComplexoPage.tsx - Página modelo complexa
 * 
 * Template de página com múltiplas seções e componentes.
 * Serve como exemplo de implementação para páginas complexas do sistema.
 * 
 * Funcionalidades:
 * - PageHeader com título e ações
 * - Tabs internas (shadcn)
 * - Tabela de dados
 * - Cards com estatísticas
 * - Múltiplas seções
 * - Dark mode
 */

import { RefreshCw, Download, TrendingUp, Users, Package, DollarSign } from 'lucide-react';
import { PageWrapper } from '@/components/shared/PageWrapper';
import { PageHeader } from '@/components/shared/PageHeader';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@ui/table';

// Mock data - Estatísticas
const STATS = [
    { label: 'Total Vendas', value: 'R$ 125.430', icon: DollarSign, color: 'text-green-600 dark:text-green-400', bg: 'bg-green-100 dark:bg-green-900/30' },
    { label: 'Clientes Ativos', value: '342', icon: Users, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-100 dark:bg-blue-900/30' },
    { label: 'Produtos', value: '1.284', icon: Package, color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-100 dark:bg-purple-900/30' },
    { label: 'Crescimento', value: '+12.5%', icon: TrendingUp, color: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-100 dark:bg-orange-900/30' },
];

// Mock data - Tabela recentes
const RECENT_ITEMS = [
    { id: 'PED-001', cliente: 'Empresa Alpha', valor: 'R$ 5.430', status: 'Concluído', data: '2024-01-20' },
    { id: 'PED-002', cliente: 'Empresa Beta', valor: 'R$ 3.250', status: 'Pendente', data: '2024-01-20' },
    { id: 'PED-003', cliente: 'Empresa Gamma', valor: 'R$ 8.920', status: 'Concluído', data: '2024-01-19' },
    { id: 'PED-004', cliente: 'Empresa Delta', valor: 'R$ 2.150', status: 'Cancelado', data: '2024-01-19' },
    { id: 'PED-005', cliente: 'Empresa Epsilon', valor: 'R$ 6.780', status: 'Concluído', data: '2024-01-18' },
];

// Mock data - Tabela histórico
const HISTORY_ITEMS = [
    { id: 'HIS-001', tipo: 'Venda', descricao: 'Pedido #PED-001 concluído', usuario: 'João Silva', data: '2024-01-20 14:30' },
    { id: 'HIS-002', tipo: 'Cadastro', descricao: 'Novo cliente: Empresa Zeta', usuario: 'Maria Santos', data: '2024-01-20 13:15' },
    { id: 'HIS-003', tipo: 'Atualização', descricao: 'Produto #PRD-123 atualizado', usuario: 'Pedro Costa', data: '2024-01-20 11:45' },
    { id: 'HIS-004', tipo: 'Venda', descricao: 'Pedido #PED-002 criado', usuario: 'Ana Souza', data: '2024-01-20 10:20' },
];

export function ModeloComplexoPage() {
    const handleRefresh = () => {
        console.log('Atualizar dados');
    };

    const handleExport = () => {
        console.log('Exportar dados');
    };

    return (
        <PageWrapper>
            {/* Header */}
            <PageHeader
                title="Modelo: Página Complexa"
                description="Template com múltiplas seções, tabs, tabelas e estatísticas"
                breadcrumbs={[
                    { label: 'Modelos', href: '/app' },
                    { label: 'Página Complexa' },
                ]}
                actions={
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleRefresh}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-900 dark:text-slate-100 rounded-lg font-medium transition-colors"
                        >
                            <RefreshCw className="h-4 w-4" />
                            <span>Atualizar</span>
                        </button>
                        <button
                            onClick={handleExport}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                        >
                            <Download className="h-4 w-4" />
                            <span>Exportar</span>
                        </button>
                    </div>
                }
            />

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
                <div className="max-w-7xl mx-auto space-y-6">
                    {/* Cards de Estatísticas */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {STATS.map((stat, index) => {
                            const Icon = stat.icon;
                            return (
                                <div
                                    key={index}
                                    className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4"
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm text-slate-600 dark:text-slate-400">
                                            {stat.label}
                                        </span>
                                        <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${stat.bg}`}>
                                            <Icon className={`h-4 w-4 ${stat.color}`} />
                                        </div>
                                    </div>
                                    <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                                        {stat.value}
                                    </p>
                                </div>
                            );
                        })}
                    </div>

                    {/* Tabs */}
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg">
                        <Tabs defaultValue="recentes" className="w-full">
                            <div className="border-b border-slate-200 dark:border-slate-800 px-4">
                                <TabsList className="h-12 bg-transparent">
                                    <TabsTrigger value="recentes">Recentes</TabsTrigger>
                                    <TabsTrigger value="historico">Histórico</TabsTrigger>
                                    <TabsTrigger value="relatorios">Relatórios</TabsTrigger>
                                </TabsList>
                            </div>

                            {/* Tab: Recentes */}
                            <TabsContent value="recentes" className="p-0 m-0">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>ID</TableHead>
                                            <TableHead>Cliente</TableHead>
                                            <TableHead>Valor</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Data</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {RECENT_ITEMS.map((item) => (
                                            <TableRow key={item.id}>
                                                <TableCell className="font-medium">{item.id}</TableCell>
                                                <TableCell>{item.cliente}</TableCell>
                                                <TableCell>{item.valor}</TableCell>
                                                <TableCell>
                                                    <span
                                                        className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${item.status === 'Concluído'
                                                                ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                                                                : item.status === 'Pendente'
                                                                    ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
                                                                    : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                                                            }`}
                                                    >
                                                        {item.status}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="text-slate-600 dark:text-slate-400">
                                                    {item.data}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TabsContent>

                            {/* Tab: Histórico */}
                            <TabsContent value="historico" className="p-0 m-0">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Tipo</TableHead>
                                            <TableHead>Descrição</TableHead>
                                            <TableHead>Usuário</TableHead>
                                            <TableHead>Data/Hora</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {HISTORY_ITEMS.map((item) => (
                                            <TableRow key={item.id}>
                                                <TableCell>
                                                    <span className="inline-flex px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300">
                                                        {item.tipo}
                                                    </span>
                                                </TableCell>
                                                <TableCell>{item.descricao}</TableCell>
                                                <TableCell>{item.usuario}</TableCell>
                                                <TableCell className="text-slate-600 dark:text-slate-400">
                                                    {item.data}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TabsContent>

                            {/* Tab: Relatórios */}
                            <TabsContent value="relatorios" className="p-6">
                                <div className="text-center py-12">
                                    <div className="flex justify-center mb-4">
                                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
                                            <Download className="h-8 w-8 text-slate-400" />
                                        </div>
                                    </div>
                                    <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
                                        Relatórios Disponíveis
                                    </h3>
                                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
                                        Nenhum relatório gerado ainda. Use o botão Exportar para criar relatórios.
                                    </p>
                                    <button
                                        onClick={handleExport}
                                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                                    >
                                        <Download className="h-4 w-4" />
                                        <span>Gerar Relatório</span>
                                    </button>
                                </div>
                            </TabsContent>
                        </Tabs>
                    </div>
                </div>
            </div>
        </PageWrapper>
    );
}