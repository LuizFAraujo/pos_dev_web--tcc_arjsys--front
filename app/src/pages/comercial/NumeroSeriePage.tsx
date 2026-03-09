import { useEffect, useState, useMemo } from 'react';
import { Hash, Search } from 'lucide-react';
import { useNumeroSerieStore } from '@/stores/comercial/numeroSerieStore';
import { useTabState } from '@/hooks/useTabState';
import { PageShell } from '@/components/shared/PageShell';
import { DataGrid } from '@/components/shared/DataGrid/DataGrid';
import type { DataGridColumn } from '@/components/shared/DataGrid/DataGrid';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { NS_STATUS_LABELS, NS_STATUS_COLORS, TRANSICOES_NS } from '@/types/comercial/numeroserie.types';
import type { NumeroSerie, StatusNumeroSerie } from '@/types/comercial/numeroserie.types';

const NS_STATUS_OPTIONS = [
  { label: 'Aberto', value: 'Aberto' },
  { label: 'Em Fabricacao', value: 'EmFabricacao' },
  { label: 'Concluido', value: 'Concluido' },
  { label: 'Entregue', value: 'Entregue' },
];

interface NumeroSeriePageProps { tab: { id: string; type: string; title: string }; }

export function NumeroSeriePage({ tab }: NumeroSeriePageProps) {
  const [searchTerm, setSearchTerm] = useTabState(tab.id, '');

  const series = useNumeroSerieStore((s) => s.series);
  const isLoading = useNumeroSerieStore((s) => s.isLoading);
  const error = useNumeroSerieStore((s) => s.error);
  const fetchSeries = useNumeroSerieStore((s) => s.fetchSeries);
  const alterarStatus = useNumeroSerieStore((s) => s.alterarStatus);

  useEffect(() => { fetchSeries(); }, [fetchSeries]);

  const filtrados = useMemo(() => {
    if (!searchTerm) return series || [];
    const term = searchTerm.toLowerCase();
    return (series || []).filter((s) => (s.codigo || '').toLowerCase().includes(term) || (s.pedidoVendaCodigo || '').toLowerCase().includes(term) || (s.clienteNome || '').toLowerCase().includes(term));
  }, [series, searchTerm]);

  const formatDate = (val?: string) => !val ? '-' : new Date(val).toLocaleDateString('pt-BR');

  const handleStatusChange = async (serie: NumeroSerie, novoStatus: StatusNumeroSerie) => {
    try { await alterarStatus(serie.id, novoStatus); } catch { /* store */ }
  };

  const columns: DataGridColumn<NumeroSerie>[] = [
    { key: 'codigo', header: 'N Serie', filterType: 'exact', render: (s) => <div className="flex items-center gap-1.5 font-mono font-medium"><Hash className="h-3.5 w-3.5 text-muted-foreground" />{s.codigo || '-'}</div> },
    { key: 'pedidoVendaCodigo', header: 'Pedido', className: 'font-mono' },
    { key: 'clienteNome', header: 'Cliente' },
    { key: 'status', header: 'Status', filterType: 'select', filterOptions: NS_STATUS_OPTIONS, render: (s) => <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${NS_STATUS_COLORS[s.status] || ''}`}>{NS_STATUS_LABELS[s.status] || s.status}</span> },
    { key: 'criadoEm', header: 'Data', render: (s) => formatDate(s.criadoEm) },
    { key: 'acoes', header: 'Acoes', sortable: false, filterable: false, resizable: false, render: (s) => {
        const transicoes = TRANSICOES_NS[s.status] || [];
        return (<div className="flex gap-1">{transicoes.map((ns) => (<Button key={ns} variant="outline" size="sm" className="text-xs h-7" onClick={() => handleStatusChange(s, ns)}>{'-> '}{NS_STATUS_LABELS[ns]}</Button>))}</div>);
      },
    },
  ];

  return (
    <PageShell breadcrumbs={[{ label: 'Comercial' }, { label: 'Numero de Serie' }]} title="Numeros de Serie" tooltip="Rastreie numeros de serie gerados a partir de pedidos"
      headerExtra={<div className="relative"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input placeholder="Buscar por codigo, pedido ou cliente..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-9" /></div>}
      footer={<p className="text-sm text-muted-foreground">{filtrados.length} de {series?.length || 0} series</p>}
    >
      {error && <div className="mb-3 rounded-lg border border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20 px-4 py-3 text-sm text-red-700 dark:text-red-400">{error}</div>}
      <DataGrid columns={columns} data={filtrados} loading={isLoading} loadingText="Carregando series..." emptyTitle="Nenhum numero de serie encontrado" emptyDescription="Numeros de serie sao gerados a partir de pedidos aprovados" />
    </PageShell>
  );
}
