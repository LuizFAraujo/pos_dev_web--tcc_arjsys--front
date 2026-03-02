import { useEffect, useState } from 'react';
import { Search, Hash } from 'lucide-react';
import { useNumeroSerieStore } from '@/stores/comercial/numeroSerieStore';
import { PageWrapper } from '@/components/shared/PageWrapper';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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

  useEffect(() => {
    fetchSeries();
  }, [fetchSeries]);

  const filtrados = (series || []).filter((s) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      (s.codigo || '').toLowerCase().includes(term) ||
      (s.pedidoVendaCodigo || '').toLowerCase().includes(term) ||
      (s.clienteNome || '').toLowerCase().includes(term) ||
      (s.status || '').toLowerCase().includes(term)
    );
  });

  const formatDate = (val?: string) => {
    if (!val) return '-';
    return new Date(val).toLocaleDateString('pt-BR');
  };

  const handleStatusChange = async (serie: NumeroSerie, novoStatus: StatusNumeroSerie) => {
    try {
      await alterarStatus(serie.id, novoStatus);
    } catch {
      // erro tratado no store
    }
  };

  return (
    <PageWrapper>
      <PageHeader
        breadcrumbs={[{ label: 'Comercial' }, { label: 'Número de Série' }]}
        title="Números de Série"
        description="Rastreie números de série gerados a partir de pedidos"
      />

      {error && (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20 px-4 py-3 text-sm text-red-700 dark:text-red-400">
          {error}
        </div>
      )}

      <div className="mt-4 mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por código, pedido, cliente ou status..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {isLoading && (
        <div className="flex h-64 items-center justify-center">
          <div className="text-center">
            <div className="mx-auto mb-2 h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            <p className="text-sm text-muted-foreground">Carregando números de série...</p>
          </div>
        </div>
      )}

      {!isLoading && filtrados.length > 0 && (
        <div className="rounded-lg border">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="p-3 text-left text-sm font-medium">N° Série</th>
                  <th className="p-3 text-left text-sm font-medium">Pedido</th>
                  <th className="p-3 text-left text-sm font-medium">Cliente</th>
                  <th className="p-3 text-left text-sm font-medium">Status</th>
                  <th className="p-3 text-left text-sm font-medium">Data</th>
                  <th className="p-3 text-left text-sm font-medium">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filtrados.map((serie) => {
                  const transicoes = TRANSICOES_NS[serie.status] || [];
                  return (
                    <tr key={serie.id} className="border-t transition-colors hover:bg-muted/30">
                      <td className="p-3 text-sm font-mono font-medium">
                        <div className="flex items-center gap-1.5">
                          <Hash className="h-3.5 w-3.5 text-muted-foreground" />
                          {serie.codigo || '-'}
                        </div>
                      </td>
                      <td className="p-3 text-sm font-mono">{serie.pedidoVendaCodigo || '-'}</td>
                      <td className="p-3 text-sm">{serie.clienteNome || '-'}</td>
                      <td className="p-3 text-sm">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${NS_STATUS_COLORS[serie.status] || ''}`}>
                          {NS_STATUS_LABELS[serie.status] || serie.status}
                        </span>
                      </td>
                      <td className="p-3 text-sm">{formatDate(serie.criadoEm)}</td>
                      <td className="p-3">
                        <div className="flex gap-1">
                          {transicoes.map((novoStatus) => (
                            <Button
                              key={novoStatus}
                              variant="outline"
                              size="sm"
                              className="text-xs h-7"
                              onClick={() => handleStatusChange(serie, novoStatus)}
                            >
                              → {NS_STATUS_LABELS[novoStatus]}
                            </Button>
                          ))}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="border-t bg-muted/30 p-3">
            <p className="text-sm text-muted-foreground">{filtrados.length} de {series.length} séries</p>
          </div>
        </div>
      )}

      {!isLoading && filtrados.length === 0 && (
        <div className="flex h-64 flex-col items-center justify-center rounded-lg border border-dashed">
          <p className="mb-2 text-lg font-medium">Nenhum número de série encontrado</p>
          <p className="text-sm text-muted-foreground">
            Números de série são gerados a partir de pedidos aprovados
          </p>
        </div>
      )}
    </PageWrapper>
  );
}
