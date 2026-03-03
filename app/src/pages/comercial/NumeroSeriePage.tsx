import { useEffect, useState, useMemo } from 'react';
import { Hash } from 'lucide-react';
import { useNumeroSerieStore } from '@/stores/comercial/numeroSerieStore';
import { PageShell } from '@/components/shared/PageShell';
import { DataGrid } from '@/components/shared/DataGrid';
import type { DataGridColumn } from '@/components/shared/DataGrid';
import { Button } from '@/components/ui/button';
import { NS_STATUS_LABELS, NS_STATUS_COLORS, TRANSICOES_NS } from '@/types/comercial/numeroserie.types';
import type { NumeroSerie, StatusNumeroSerie } from '@/types/comercial/numeroserie.types';

interface NumeroSeriePageProps {
  tab: { id: string; type: string; title: string };
}

export function NumeroSeriePage({ tab }: NumeroSeriePageProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const series = useNumeroSerieStore((s) => s.series);
  const isLoading = useNumeroSerieStore((s) => s.isLoading);
  const error = useNumeroSerieStore((s) => s.error);
  const fetchSeries = useNumeroSerieStore((s) => s.fetchSeries);
  const alterarStatus = useNumeroSerieStore((s) => s.alterarStatus);

  useEffect(() => { fetchSeries(); }, [fetchSeries]);

  const filtrados = useMemo(() => {
    if (!searchTerm) return series || [];
    const term = searchTerm.toLowerCase();
    return (series || []).filter((s) =>
      (s.codigo || '').toLowerCase().includes(term) ||
      (s.pedidoVendaCodigo || '').toLowerCase().includes(term) ||
      (s.clienteNome || '').toLowerCase().includes(term) ||
      (s.status || '').toLowerCase().includes(term)
    );
  }, [series, searchTerm]);

  const formatDate = (val?: string) => !val ? '-' : new Date(val).toLocaleDateString('pt-BR');

  const handleStatusChange = async (serie: NumeroSerie, novoStatus: StatusNumeroSerie) => {
    try { await alterarStatus(serie.id, novoStatus); } catch { /* store */ }
  };

  const columns: DataGridColumn<NumeroSerie>[] = [
    {
      key: 'codigo', header: 'N° Série', render: (s) => (
        <div className="flex items-center gap-1.5 font-mono font-medium">
          <Hash className="h-3.5 w-3.5 text-muted-foreground" />{s.codigo || '-'}
        </div>
      ),
    },
    { key: 'pedidoVendaCodigo', header: 'Pedido', className: 'font-mono' },
    { key: 'clienteNome', header: 'Cliente' },
    {
      key: 'status', header: 'Status', render: (s) => (
        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${NS_STATUS_COLORS[s.status] || ''}`}>
          {NS_STATUS_LABELS[s.status] || s.status}
        </span>
      ),
    },
    { key: 'criadoEm', header: 'Data', render: (s) => formatDate(s.criadoEm) },
    {
      key: 'acoes', header: 'Ações', render: (s) => {
        const transicoes = TRANSICOES_NS[s.status] || [];
        return (
          <div className="flex gap-1">
            {transicoes.map((ns) => (
              <Button key={ns} variant="outline" size="sm" className="text-xs h-7" onClick={() => handleStatusChange(s, ns)}>
                → {NS_STATUS_LABELS[ns]}
              </Button>
            ))}
          </div>
        );
      },
    },
  ];

  return (
    <PageShell
      breadcrumbs={[{ label: 'Comercial' }, { label: 'Número de Série' }]}
      title="Números de Série"
      description="Rastreie números de série gerados a partir de pedidos"
      error={error}
      searchTerm={searchTerm}
      onSearchChange={setSearchTerm}
      searchPlaceholder="Buscar por código, pedido, cliente ou status..."
    >
      <DataGrid
        columns={columns}
        data={filtrados}
        total={series?.length}
        loading={isLoading}
        loadingText="Carregando números de série..."
        emptyTitle="Nenhum número de série encontrado"
        emptyDescription="Números de série são gerados a partir de pedidos aprovados"
        itemLabel="séries"
      />
    </PageShell>
  );
}
