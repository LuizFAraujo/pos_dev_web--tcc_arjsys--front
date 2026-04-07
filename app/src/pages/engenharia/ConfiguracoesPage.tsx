/**
 * ConfiguracoesPage.tsx — Configurações do módulo de engenharia
 *
 * Abas:
 *   Documentos — Path raiz, checkbox por subpasta, paths alternativos por prefixo (CRUD), varredura
 *   Código Inteligente — Flag de controle (futuro)
 *
 * Varredura em lotes:
 *   Frontend controla o loop (BATCH_SIZE = 500).
 *   Barra de progresso com processados/total, % e botão cancelar.
 *   Resultado final acumulado dos lotes.
 *
 * Estado isolado por aba via useTabState.
 * Toasts via Sonner.
 * Após varredura, recarrega produtosStore.
 */

import { useEffect, useMemo, useCallback, useRef } from 'react';
import { Save, FolderSearch, Loader2, Plus, Trash2, Info, X } from 'lucide-react';
import { toast } from 'sonner';
import { useConfiguracoesStore } from '@/stores/engenharia/configuracoesStore';
import type { VarreduraProgresso } from '@/stores/engenharia/configuracoesStore';
import { useProdutosStore } from '@/stores/engenharia/produtosStore';
import { useGruposStore } from '@/stores/engenharia/gruposStore';
import { useTabState } from '@/hooks/useTabState';
import { PageShell } from '@/components/shared/PageShell';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/shared/AppTooltip';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';

// ─── Constantes ───────────────────────────────────────────────────────────────

const BATCH_SIZE = 500;

// ─── Props ────────────────────────────────────────────────────────────────────

interface ConfiguracoesPageProps {
  tab: { id: string; type: string; title: string };
}

// ─── Componente ───────────────────────────────────────────────────────────────

export function ConfiguracoesPage({ tab }: ConfiguracoesPageProps) {

  // ── Stores (seletores individuais) ──────────────────────────────────────────
  const configuracoes = useConfiguracoesStore((s) => s.configuracoes);
  const isLoading = useConfiguracoesStore((s) => s.isLoading);
  const isSaving = useConfiguracoesStore((s) => s.isSaving);
  const error = useConfiguracoesStore((s) => s.error);
  const fetchConfiguracoes = useConfiguracoesStore((s) => s.fetchConfiguracoes);
  const updateConfiguracao = useConfiguracoesStore((s) => s.updateConfiguracao);

  const paths = useConfiguracoesStore((s) => s.paths);
  const isLoadingPaths = useConfiguracoesStore((s) => s.isLoadingPaths);
  const isSavingPath = useConfiguracoesStore((s) => s.isSavingPath);
  const fetchPaths = useConfiguracoesStore((s) => s.fetchPaths);
  const createPath = useConfiguracoesStore((s) => s.createPath);
  const updatePath = useConfiguracoesStore((s) => s.updatePath);
  const deletePath = useConfiguracoesStore((s) => s.deletePath);

  const isVarrendo = useConfiguracoesStore((s) => s.isVarrendo);
  const varreduraProgresso = useConfiguracoesStore((s) => s.varreduraProgresso);
  const executarVarreduraEmLotes = useConfiguracoesStore((s) => s.executarVarreduraEmLotes);

  const fetchProdutos = useProdutosStore((s) => s.fetchProdutos);

  const grupos = useGruposStore((s) => s.grupos);
  const fetchGrupos = useGruposStore((s) => s.fetchGrupos);

  // ── Estado local (isolado por aba) ──────────────────────────────────────────
  const [activeTab, setActiveTab] = useTabState(tab.id + '-tab', 'documentos');
  const [pathRaiz, setPathRaiz] = useTabState(tab.id + '-pathRaiz', '');
  const [ctrlPrefixoRaiz, setCtrlPrefixoRaiz] = useTabState(tab.id + '-ctrlPrefixo', false);
  const [prefixoVarredura, setPrefixoVarredura] = useTabState(tab.id + '-prefixoVarredura', '');
  const [varreduraResult, setVarreduraResult] = useTabState<VarreduraProgresso | null>(tab.id + '-varResult', null);
  const [varreduraCancelada, setVarreduraCancelada] = useTabState(tab.id + '-varCancelada', false);

  // Novo path alternativo
  const [novoPrefixoId, setNovoPrefixoId] = useTabState<string>(tab.id + '-novoPrefixo', '');
  const [novoPath, setNovoPath] = useTabState(tab.id + '-novoPath', '');

  // Delete dialog
  const [deleteId, setDeleteId] = useTabState<number | null>(tab.id + '-delId', null);
  const [deleteOpen, setDeleteOpen] = useTabState(tab.id + '-delOpen', false);

  // Ref de cancelamento
  const cancelRef = useRef({ current: false });

  // ── Carregar dados ──────────────────────────────────────────────────────────
  useEffect(() => {
    fetchConfiguracoes();
    fetchPaths();
    if (grupos.length === 0) fetchGrupos();
  }, [fetchConfiguracoes, fetchPaths, fetchGrupos, grupos.length]);

  // Sincronizar estado local com configs do backend (só na primeira carga)
  useEffect(() => {
    if (!pathRaiz && configuracoes.length > 0) {
      const cfgPath = configuracoes.find((c) => c.chave === 'PathRaizDocumentos');
      if (cfgPath) setPathRaiz(cfgPath.valor);

      const cfgCtrl = configuracoes.find((c) => c.chave === 'ControlarPorPrefixoRaiz');
      if (cfgCtrl) setCtrlPrefixoRaiz(cfgCtrl.valor === 'true');
    }
  }, [configuracoes, pathRaiz, setPathRaiz, setCtrlPrefixoRaiz]);

  // Toast de erro
  useEffect(() => { if (error) toast.error(error); }, [error]);

  // ── Prefixos disponíveis (Coluna1 sem path cadastrado) ──────────────────────
  const prefixosColuna1 = useMemo(
    () => grupos.filter((g) => g.nivel === 'Coluna1' || (g as any).nivel === 0),
    [grupos],
  );

  const prefixosSemPath = useMemo(
    () => prefixosColuna1.filter((g) => !paths.some((p) => p.grupoProdutoId === g.id)),
    [prefixosColuna1, paths],
  );

  // ── Salvar configurações globais ────────────────────────────────────────────
  const handleSaveGlobais = useCallback(async () => {
    try {
      const cfgPath = configuracoes.find((c) => c.chave === 'PathRaizDocumentos');
      const cfgCtrl = configuracoes.find((c) => c.chave === 'ControlarPorPrefixoRaiz');

      if (cfgPath) await updateConfiguracao(cfgPath.id, pathRaiz);
      if (cfgCtrl) await updateConfiguracao(cfgCtrl.id, ctrlPrefixoRaiz ? 'true' : 'false');

      toast.success('Configurações salvas.');
    } catch {
      // erro já tratado na store
    }
  }, [configuracoes, pathRaiz, ctrlPrefixoRaiz, updateConfiguracao]);

  // ── Tem mudanças nas configs globais? ───────────────────────────────────────
  const globalDirty = useMemo(() => {
    const cfgPath = configuracoes.find((c) => c.chave === 'PathRaizDocumentos');
    const cfgCtrl = configuracoes.find((c) => c.chave === 'ControlarPorPrefixoRaiz');
    const pathChanged = cfgPath ? cfgPath.valor !== pathRaiz : false;
    const ctrlChanged = cfgCtrl ? (cfgCtrl.valor === 'true') !== ctrlPrefixoRaiz : false;
    return pathChanged || ctrlChanged;
  }, [configuracoes, pathRaiz, ctrlPrefixoRaiz]);

  // ── Adicionar path alternativo ──────────────────────────────────────────────
  const handleAddPath = useCallback(async () => {
    if (!novoPrefixoId || !novoPath.trim()) {
      toast.error('Selecione um prefixo e informe o endereço.');
      return;
    }
    try {
      await createPath({
        grupoProdutoId: Number(novoPrefixoId),
        path: novoPath.trim(),
        controlarPorPrefixo: false,
        ativo: true,
      });
      setNovoPrefixoId('');
      setNovoPath('');
      toast.success('Endereço alternativo adicionado.');
    } catch {
      // erro já tratado na store
    }
  }, [novoPrefixoId, novoPath, createPath, setNovoPrefixoId, setNovoPath]);

  // ── Toggle ativo/desativado de um path ──────────────────────────────────────
  const handleToggleAtivo = useCallback(async (pathItem: typeof paths[0]) => {
    try {
      await updatePath(pathItem.id, {
        path: pathItem.path,
        controlarPorPrefixo: pathItem.controlarPorPrefixo,
        ativo: !pathItem.ativo,
      });
    } catch {
      // erro já tratado
    }
  }, [updatePath]);

  // ── Toggle controlar por prefixo de um path ────────────────────────────────
  const handleToggleCtrlPrefixo = useCallback(async (pathItem: typeof paths[0]) => {
    if (!pathItem.ativo) return;
    try {
      await updatePath(pathItem.id, {
        path: pathItem.path,
        controlarPorPrefixo: !pathItem.controlarPorPrefixo,
        ativo: pathItem.ativo,
      });
    } catch {
      // erro já tratado
    }
  }, [updatePath]);

  // ── Editar path inline ──────────────────────────────────────────────────────
  const handlePathBlur = useCallback(async (pathItem: typeof paths[0], newPath: string) => {
    const trimmed = newPath.trim();
    if (trimmed === pathItem.path) return;
    if (!trimmed) {
      toast.error('Endereço não pode estar vazio.');
      return;
    }
    try {
      await updatePath(pathItem.id, {
        path: trimmed,
        controlarPorPrefixo: pathItem.controlarPorPrefixo,
        ativo: pathItem.ativo,
      });
      toast.success('Endereço atualizado.');
    } catch {
      // erro já tratado
    }
  }, [updatePath]);

  // ── Deletar path ────────────────────────────────────────────────────────────
  const handleConfirmDelete = useCallback(async () => {
    if (deleteId == null) return;
    try {
      await deletePath(deleteId);
      toast.success('Endereço alternativo excluído.');
    } catch {
      // erro já tratado
    }
    setDeleteOpen(false);
    setDeleteId(null);
  }, [deleteId, deletePath, setDeleteOpen, setDeleteId]);

  // ── Varredura em lotes ──────────────────────────────────────────────────────
  const handleVarredura = useCallback(async () => {
    setVarreduraResult(null);
    setVarreduraCancelada(false);
    cancelRef.current = { current: false };

    try {
      const resultado = await executarVarreduraEmLotes(
        prefixoVarredura.trim() || undefined,
        BATCH_SIZE,
        (progresso) => {
          // Callback de progresso — atualizado a cada lote
          setVarreduraResult(progresso);
        },
        cancelRef.current,
      );

      if (resultado) {
        toast.success(
          `Varredura concluída: ${resultado.processados} verificados, ` +
          `${resultado.comDocumento} com documento, ${resultado.atualizados} atualizados.`
        );
        setVarreduraResult(resultado);
      } else {
        setVarreduraCancelada(true);
        toast.info('Varredura cancelada pelo usuário.');
      }
      await fetchProdutos();
    } catch {
      // erro já tratado na store
    }
  }, [prefixoVarredura, executarVarreduraEmLotes, setVarreduraResult, setVarreduraCancelada, fetchProdutos]);

  // ── Cancelar varredura ──────────────────────────────────────────────────────
  const handleCancelar = useCallback(() => {
    cancelRef.current.current = true;
  }, []);

  // ── Header ──────────────────────────────────────────────────────────────────
  const headerRight = globalDirty ? (
    <Button size="sm" className="h-8" onClick={handleSaveGlobais} disabled={isSaving}>
      {isSaving ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <Save className="mr-1.5 h-3.5 w-3.5" />}
      Salvar
    </Button>
  ) : undefined;

  // ── Progresso calculado ─────────────────────────────────────────────────────
  const progresso = varreduraProgresso;
  const pct = progresso && progresso.totalGeral > 0
    ? Math.round((progresso.processados / progresso.totalGeral) * 100)
    : 0;

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <PageShell module="Engenharia" title="Configurações" headerRight={headerRight}>
      <div className="h-full flex flex-col overflow-hidden">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col h-full gap-0">

          <div className="shrink-0 px-6 pt-4 pb-0">
            <TabsList>
              <TabsTrigger value="documentos">Documentos</TabsTrigger>
              <TabsTrigger value="codigo">Código Inteligente</TabsTrigger>
            </TabsList>
          </div>

          {/* ═══════ ABA DOCUMENTOS ═══════ */}
          <TabsContent value="documentos" className="flex-1 overflow-auto mt-0 px-6 py-5">
            {isLoading ? (
              <div className="flex h-64 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <div className="space-y-6">

                {/* ── Diretório Raiz ──────────────────────── */}
                <div>
                  <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-3 flex items-center gap-2 after:content-[''] after:flex-1 after:h-px after:bg-slate-200 dark:after:bg-slate-700">
                    Diretório Raiz
                  </h3>
                  <div className="rounded-lg border p-4 space-y-3">
                    <div className="flex flex-col gap-1.5">
                      <Label className="text-xs font-medium text-slate-500 dark:text-slate-400">
                        Endereço Raiz de Documentos
                      </Label>
                      <p className="text-[11px] text-muted-foreground">
                        Caminho base no servidor onde ficam as pastas de desenho/documentos dos produtos
                      </p>
                      <Input
                        value={pathRaiz}
                        onChange={(e) => setPathRaiz(e.target.value)}
                        className="bg-white dark:bg-slate-950 font-mono text-sm"
                        placeholder="Ex: D:\ARJ\TCC\CODIGOS"
                      />
                    </div>

                    <div className="flex items-start gap-3 pt-1">
                      <Switch
                        checked={ctrlPrefixoRaiz}
                        onCheckedChange={setCtrlPrefixoRaiz}
                      />
                      <div>
                        <p className="text-sm text-slate-800 dark:text-slate-200">Organizar por subpasta de prefixo</p>
                        <p className="text-[11px] text-muted-foreground mt-0.5">
                          Ligado: <code className="text-[11px] bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">...\CODIGOS\30\30.XXX.0000\</code>
                          {' · '}
                          Desligado: <code className="text-[11px] bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">...\CODIGOS\30.XXX.0000\</code>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* ── Endereços Alternativos ───────────────── */}
                <div>
                  <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-3 flex items-center gap-2 after:content-[''] after:flex-1 after:h-px after:bg-slate-200 dark:after:bg-slate-700">
                    Endereços Alternativos por Prefixo
                  </h3>

                  <div className="flex items-start gap-2 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 px-3 py-2.5 mb-3">
                    <Info className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
                    <p className="text-xs text-blue-700 dark:text-blue-300">
                      Prefixos com endereço alternativo <strong>ativo</strong> usam seu endereço próprio na varredura.
                      Prefixos <strong>desativados</strong> ou sem endereço alternativo usam o diretório raiz.
                    </p>
                  </div>

                  {/* Tabela de paths */}
                  <div className="rounded-lg border overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-muted/50">
                        <tr>
                          <th className="p-2.5 text-center text-xs font-medium text-slate-500 dark:text-slate-400 w-17.5">Ativo</th>
                          <th className="p-2.5 text-left text-xs font-medium text-slate-500 dark:text-slate-400 w-20">Prefixo</th>
                          <th className="p-2.5 text-left text-xs font-medium text-slate-500 dark:text-slate-400">Endereço</th>
                          <th className="p-2.5 text-center text-xs font-medium text-slate-500 dark:text-slate-400 w-25">Por Subpasta</th>
                          <th className="p-2.5 w-12.5" />
                        </tr>
                      </thead>
                      <tbody>
                        {paths.length === 0 && !isLoadingPaths && (
                          <tr>
                            <td colSpan={5} className="p-4 text-center text-sm text-muted-foreground">
                              Nenhum endereço alternativo cadastrado.
                            </td>
                          </tr>
                        )}
                        {paths.map((p) => (
                          <tr key={p.id} className={p.ativo ? '' : 'opacity-45'}>
                            <td className="p-2.5 text-center border-t">
                              <Switch
                                checked={p.ativo}
                                onCheckedChange={() => handleToggleAtivo(p)}
                              />
                            </td>
                            <td className="p-2.5 border-t">
                              <span className="font-mono text-xs font-medium">{p.grupoCodigo}</span>
                            </td>
                            <td className="p-2.5 border-t">
                              <Input
                                defaultValue={p.path}
                                onBlur={(e) => handlePathBlur(p, e.target.value)}
                                disabled={!p.ativo}
                                className="h-8 text-xs font-mono bg-white dark:bg-slate-950"
                              />
                            </td>
                            <td className="p-2.5 text-center border-t">
                              <Switch
                                checked={p.controlarPorPrefixo}
                                onCheckedChange={() => handleToggleCtrlPrefixo(p)}
                                disabled={!p.ativo}
                              />
                            </td>
                            <td className="p-2.5 text-center border-t">
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost" size="icon"
                                    className="h-7 w-7 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                                    onClick={() => { setDeleteId(p.id); setDeleteOpen(true); }}
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent><p>Excluir permanentemente</p></TooltipContent>
                              </Tooltip>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      {/* Rodapé: adicionar novo */}
                      <tfoot>
                        <tr>
                          <td colSpan={5} className="p-2.5 bg-muted/30 border-t">
                            <div className="flex items-center gap-2">
                              <Select value={novoPrefixoId} onValueChange={setNovoPrefixoId}>
                                <SelectTrigger className="w-35 h-8 text-xs font-mono bg-white dark:bg-slate-950">
                                  <SelectValue placeholder="Prefixo..." />
                                </SelectTrigger>
                                <SelectContent>
                                  {prefixosSemPath.length === 0 ? (
                                    <SelectItem value="_none" disabled>Todos com path</SelectItem>
                                  ) : (
                                    prefixosSemPath.map((g) => (
                                      <SelectItem key={g.id} value={String(g.id)}>
                                        {g.codigo} — {g.descricao}
                                      </SelectItem>
                                    ))
                                  )}
                                </SelectContent>
                              </Select>
                              <Input
                                value={novoPath}
                                onChange={(e) => setNovoPath(e.target.value)}
                                placeholder="Endereço..."
                                className="flex-1 h-8 text-xs font-mono bg-white dark:bg-slate-950"
                              />
                              <Button
                                variant="outline" size="sm" className="h-8"
                                disabled={isSavingPath || !novoPrefixoId || !novoPath.trim()}
                                onClick={handleAddPath}
                              >
                                <Plus className="h-3.5 w-3.5 mr-1" />
                                Adicionar
                              </Button>
                            </div>
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>

                  <p className="text-[11px] text-muted-foreground mt-1.5">
                    Apenas prefixos cadastrados em Grupos de Produto (Coluna 1) aparecem no seletor.
                  </p>
                </div>

                {/* ── Varredura ────────────────────────────── */}
                <div>
                  <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-3 flex items-center gap-2 after:content-[''] after:flex-1 after:h-px after:bg-slate-200 dark:after:bg-slate-700">
                    Varredura de Documentos
                  </h3>

                  <div className="rounded-lg border p-4 space-y-3">
                    <p className="text-[11px] text-muted-foreground">
                      Verifica para cada produto se existe a pasta e o documento correspondente no endereço configurado.
                      Atualiza <strong>TemPasta</strong> e <strong>TemDocumento</strong> no banco de dados.
                    </p>

                    <div className="flex items-end gap-3">
                      <div className="flex flex-col gap-1.5" style={{ maxWidth: 200 }}>
                        <Label className="text-xs font-medium text-slate-500 dark:text-slate-400">
                          Prefixo (opcional)
                        </Label>
                        <Input
                          value={prefixoVarredura}
                          onChange={(e) => setPrefixoVarredura(e.target.value)}
                          placeholder="Ex: 30"
                          disabled={isVarrendo}
                          className="h-9 text-sm font-mono bg-white dark:bg-slate-950"
                        />
                      </div>

                      {!isVarrendo ? (
                        <Button onClick={handleVarredura}>
                          <FolderSearch className="mr-2 h-4 w-4" />
                          Executar Varredura
                        </Button>
                      ) : (
                        <Button variant="destructive" onClick={handleCancelar}>
                          <X className="mr-2 h-4 w-4" />
                          Cancelar
                        </Button>
                      )}
                    </div>

                    {/* Barra de progresso */}
                    {isVarrendo && progresso && progresso.totalGeral > 0 && (
                      <div className="space-y-1.5 pt-1">
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>
                            {progresso.processados.toLocaleString('pt-BR')} / {progresso.totalGeral.toLocaleString('pt-BR')} verificados
                          </span>
                          <span className="font-mono font-medium">{pct}%</span>
                        </div>
                        <div className="h-2.5 w-full rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-blue-500 transition-all duration-300"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <div className="flex gap-4 text-[11px] text-muted-foreground">
                          <span>{progresso.comPasta.toLocaleString('pt-BR')} com pasta</span>
                          <span>{progresso.comDocumento.toLocaleString('pt-BR')} com doc.</span>
                          <span>{progresso.atualizados.toLocaleString('pt-BR')} atualizados</span>
                        </div>
                      </div>
                    )}

                    {/* Resultado final */}
                    {!isVarrendo && varreduraResult && (
                      <>
                        {varreduraCancelada && (
                          <div className="flex items-center gap-2 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 px-3 py-2 mt-1">
                            <Info className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
                            <p className="text-xs text-amber-700 dark:text-amber-300">
                              Varredura cancelada — resultados parciais abaixo ({varreduraResult.processados.toLocaleString('pt-BR')} de {varreduraResult.totalGeral.toLocaleString('pt-BR')} verificados).
                              Os produtos já processados foram atualizados no banco.
                            </p>
                          </div>
                        )}
                        <div className="flex gap-4 rounded-lg bg-muted/50 p-3 mt-2">
                          <ResultItem label="Verificados" value={varreduraResult.processados} color="text-blue-600" />
                          <ResultItem label="Com Pasta" value={varreduraResult.comPasta} color="text-green-600" />
                          <ResultItem label="Com Doc." value={varreduraResult.comDocumento} color="text-green-700" />
                          <ResultItem label="Pasta Vazia" value={varreduraResult.pastaVazia} color="text-amber-600" />
                          <ResultItem label="Sem Pasta" value={varreduraResult.semPasta} color="text-red-500" />
                          <ResultItem label="Atualizados" value={varreduraResult.atualizados} color="text-blue-500" />
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}
          </TabsContent>

          {/* ═══════ ABA CÓDIGO INTELIGENTE ═══════ */}
          <TabsContent value="codigo" className="flex-1 overflow-auto mt-0 px-6 py-5">
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-3 flex items-center gap-2 after:content-[''] after:flex-1 after:h-px after:bg-slate-200 dark:after:bg-slate-700">
                  Controle de Composição de Código
                </h3>

                <div className="rounded-lg border p-4">
                  <div className="flex items-start gap-3">
                    <Switch disabled />
                    <div>
                      <p className="text-sm text-slate-800 dark:text-slate-200">
                        Controlar composição de código por grupos
                      </p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        Se ativado, o cadastro de produtos valida a composição do código conforme os vínculos definidos em Grupos de Produto.
                        Se desativado, os grupos servem apenas para organização e endereços de documentos.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 px-3 py-2.5 mt-4 opacity-60">
                    <Info className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
                    <p className="text-xs text-blue-700 dark:text-blue-300">
                      Os vínculos entre prefixos, grupos e subgrupos são gerenciados na tela de <strong>Grupos de Produto</strong>.
                      Esta funcionalidade será implementada em fase posterior.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

        </Tabs>
      </div>

      {/* Dialog de confirmação de exclusão */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Endereço Alternativo</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir permanentemente este endereço alternativo?
              O prefixo passará a usar o diretório raiz.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} className="bg-red-600 text-white hover:bg-red-700">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </PageShell>
  );
}

// ─── Componente auxiliar: item do resultado da varredura ───────────────────────

function ResultItem({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="flex flex-col items-center gap-0.5 flex-1">
      <span className={`text-lg font-bold font-mono ${color}`}>{value.toLocaleString('pt-BR')}</span>
      <span className="text-[10px] text-muted-foreground uppercase tracking-wider">{label}</span>
    </div>
  );
}
