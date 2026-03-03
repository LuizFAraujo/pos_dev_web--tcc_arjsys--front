import { useEffect, useState } from 'react';
import { Save, Undo2, FolderSearch, Loader2 } from 'lucide-react';
import { useConfiguracoesStore } from '@/stores/engenharia/configuracoesStore';
import { PageWrapper } from '@/components/shared/PageWrapper';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { ConfiguracaoEngenharia } from '@/types/engenharia/configuracao.types';

/** Labels amigáveis para as chaves */
const CHAVE_LABELS: Record<string, string> = {
  PathRaizDocumentos: 'Diretório Raiz de Documentos',
};

const CHAVE_DESCRIPTIONS: Record<string, string> = {
  PathRaizDocumentos: 'Caminho no servidor onde estão os arquivos de desenho dos produtos (ex: D:\\Codigos)',
};

interface ConfiguracoesPageProps {
  tab: { id: string; type: string; title: string };
}

export function ConfiguracoesPage({ tab }: ConfiguracoesPageProps) {
  const configuracoes = useConfiguracoesStore((s) => s.configuracoes);
  const isLoading = useConfiguracoesStore((s) => s.isLoading);
  const isSaving = useConfiguracoesStore((s) => s.isSaving);
  const isVarrendo = useConfiguracoesStore((s) => s.isVarrendo);
  const error = useConfiguracoesStore((s) => s.error);
  const successMsg = useConfiguracoesStore((s) => s.successMsg);
  const fetchConfiguracoes = useConfiguracoesStore((s) => s.fetchConfiguracoes);
  const updateConfiguracao = useConfiguracoesStore((s) => s.updateConfiguracao);
  const executarVarredura = useConfiguracoesStore((s) => s.executarVarredura);
  const clearSuccess = useConfiguracoesStore((s) => s.clearSuccess);

  // Estado local editável (cópia das configs)
  const [editValues, setEditValues] = useState<Record<number, string>>({});
  const [prefixoVarredura, setPrefixoVarredura] = useState('');

  useEffect(() => {
    fetchConfiguracoes();
  }, [fetchConfiguracoes]);

  // Sincroniza editValues quando carrega
  useEffect(() => {
    const values: Record<number, string> = {};
    (configuracoes || []).forEach((c) => {
      values[c.id] = c.valor ?? '';
    });
    setEditValues(values);
  }, [configuracoes]);

  // Limpa successMsg após 3s
  useEffect(() => {
    if (successMsg) {
      const t = setTimeout(() => clearSuccess(), 3000);
      return () => clearTimeout(t);
    }
  }, [successMsg]);

  const hasChanges = (config: ConfiguracaoEngenharia) => {
    return (editValues[config.id] ?? '') !== (config.valor ?? '');
  };

  const anyChanges = (configuracoes || []).some(hasChanges);

  const handleSave = async (config: ConfiguracaoEngenharia) => {
    const novoValor = editValues[config.id] ?? '';
    await updateConfiguracao(config.id, novoValor);
  };

  const handleUndo = (config: ConfiguracaoEngenharia) => {
    setEditValues((prev) => ({ ...prev, [config.id]: config.valor ?? '' }));
  };

  const handleUndoAll = () => {
    const values: Record<number, string> = {};
    (configuracoes || []).forEach((c) => {
      values[c.id] = c.valor ?? '';
    });
    setEditValues(values);
  };

  const handleVarredura = async () => {
    await executarVarredura(prefixoVarredura.trim() || undefined);
  };

  return (
    <PageWrapper>
      <PageHeader
        breadcrumbs={[{ label: 'Engenharia' }, { label: 'Configurações' }]}
        title="Configurações de Engenharia"
        description="Parâmetros do módulo de engenharia"
        actions={
          anyChanges ? (
            <Button variant="outline" onClick={handleUndoAll}>
              <Undo2 className="mr-2 h-4 w-4" />
              Desfazer Tudo
            </Button>
          ) : undefined
        }
      />

      {error && (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20 px-4 py-3 text-sm text-red-700 dark:text-red-400">
          {error}
        </div>
      )}

      {successMsg && (
        <div className="mt-4 rounded-lg border border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20 px-4 py-3 text-sm text-green-700 dark:text-green-400">
          ✓ {successMsg}
        </div>
      )}

      {isLoading && (
        <div className="flex h-64 items-center justify-center">
          <div className="text-center">
            <div className="mx-auto mb-2 h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            <p className="text-sm text-muted-foreground">Carregando configurações...</p>
          </div>
        </div>
      )}

      {!isLoading && (
        <div className="mt-6 space-y-6">
          {/* Configurações */}
          {(configuracoes || []).length > 0 ? (
            <div className="space-y-4">
              {(configuracoes || []).map((config) => {
                const label = CHAVE_LABELS[config.chave] || config.chave;
                const desc = CHAVE_DESCRIPTIONS[config.chave] || '';
                const changed = hasChanges(config);

                return (
                  <div key={config.id} className="rounded-lg border p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-sm font-semibold">{label}</Label>
                        {desc && <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>}
                      </div>
                      <div className="flex gap-2">
                        {changed && (
                          <Button variant="ghost" size="sm" onClick={() => handleUndo(config)} title="Desfazer">
                            <Undo2 className="h-3.5 w-3.5" />
                          </Button>
                        )}
                        <Button
                          size="sm"
                          disabled={!changed || isSaving}
                          onClick={() => handleSave(config)}
                        >
                          {isSaving ? <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" /> : <Save className="mr-1 h-3.5 w-3.5" />}
                          Salvar
                        </Button>
                      </div>
                    </div>
                    <Input
                      value={editValues[config.id] ?? ''}
                      onChange={(e) => setEditValues((prev) => ({ ...prev, [config.id]: e.target.value }))}
                      className={changed ? 'border-yellow-400 dark:border-yellow-600' : ''}
                    />
                    <p className="text-[10px] text-muted-foreground font-mono">
                      Chave: {config.chave} | ID: {config.id}
                    </p>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex h-32 items-center justify-center rounded-lg border border-dashed">
              <p className="text-sm text-muted-foreground">Nenhuma configuração encontrada no backend</p>
            </div>
          )}

          {/* Varredura de Documentos */}
          <div className="rounded-lg border p-4 space-y-3">
            <div>
              <Label className="text-sm font-semibold">Varredura de Documentos</Label>
              <p className="text-xs text-muted-foreground mt-0.5">
                Varre o diretório de documentos e atualiza o campo TemDocumento de cada produto
              </p>
            </div>
            <div className="flex gap-2 items-end">
              <div className="flex-1 space-y-1">
                <Label className="text-xs text-muted-foreground">Prefixo (opcional — deixe vazio para varrer tudo)</Label>
                <Input
                  placeholder="Ex: 30"
                  value={prefixoVarredura}
                  onChange={(e) => setPrefixoVarredura(e.target.value)}
                  className="max-w-[200px]"
                />
              </div>
              <Button onClick={handleVarredura} disabled={isVarrendo}>
                {isVarrendo ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <FolderSearch className="mr-2 h-4 w-4" />
                )}
                {isVarrendo ? 'Varrendo...' : 'Executar Varredura'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </PageWrapper>
  );
}
