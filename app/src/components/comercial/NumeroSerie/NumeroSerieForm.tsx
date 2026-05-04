/**
 * NumeroSerieForm.tsx - Form de criação/edição/visualização de Número de Série
 *
 * Layout em grid 2 colunas:
 *   [ Pedido Venda    ] | [ Número de Série          ]
 *   [ Cód. Cliente    ] | [ Cliente                  ]
 *   [ Código BOM      ] | [ Produto                  ]
 *
 * Coluna esquerda fixa em 240px (todos os "códigos"); coluna direita 1fr.
 *
 * Modos:
 *   - new:  Pedido editável (busca), Produto editável (busca),
 *           Código preenchido com preview local (lápis libera edição manual)
 *   - edit: Pedido readonly, Produto editável, Código readonly (back ignora no PUT)
 *   - view: tudo readonly
 *
 * Preview do código (local):
 *   II.MM.AA.NNNNN - idade da empresa, mês, ano, max sequencial conhecido + 1.
 *   Race condition: se outro cliente criar NS antes do save, o backend recusa
 *   por unicidade. Usuário vê toast e refaz.
 */

import { useEffect, useImperativeHandle, useMemo, useState, forwardRef } from 'react';
import { Pencil } from 'lucide-react';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/shared/AppTooltip';
import { useFormTabNavigation } from '@/hooks/useFormTabNavigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useConfiguracaoEmpresaStore } from '@/stores/admin/configuracaoEmpresaStore';
import { useNumeroSerieStore } from '@/stores/comercial/numeroSerieStore';
import type { NumeroSerie } from '@/types/comercial/numeroSerie.types';
import type { PageMode } from '@/components/shared/PageShell';
import { NumeroSeriePedidoField } from './NumeroSeriePedidoField';
import { NumeroSerieProdutoField } from './NumeroSerieProdutoField';

export interface NumeroSerieFormHandle {
  submit: () => Promise<boolean>;
}

export interface NumeroSerieFormData {
  pedidoVendaId: number;
  produtoId?: number | null;
  codigo?: string | null;
}

interface NumeroSerieFormProps {
  mode: Extract<PageMode, 'new' | 'edit' | 'view'>;
  serie: NumeroSerie | null;
  onDirty: () => void;
  onSave: (data: NumeroSerieFormData) => Promise<void>;
}

const CODIGO_REGEX = /^\d{2}\.(0[1-9]|1[0-2])\.\d{2}\.\d{5}$/;
const TABS = ['identificacao'];

function computeProximoCodigo(
  anoFundacao: number | null | undefined,
  allSeries: NumeroSerie[],
): string {
  if (anoFundacao == null || anoFundacao <= 0) return '';
  const now = new Date();
  const anoAtual = now.getFullYear();
  const idade = anoAtual - anoFundacao;
  if (idade < 0 || idade > 99) return '';

  const ii = String(idade).padStart(2, '0');
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const aa = String(anoAtual % 100).padStart(2, '0');

  let maxSeq = 0;
  for (const s of allSeries) {
    const parts = (s.codigo ?? '').split('.');
    if (parts.length === 4) {
      const n = parseInt(parts[3], 10);
      if (!isNaN(n) && n > maxSeq) maxSeq = n;
    }
  }
  const nnnnn = String(maxSeq + 1).padStart(5, '0');
  return `${ii}.${mm}.${aa}.${nnnnn}`;
}

export const NumeroSerieForm = forwardRef<NumeroSerieFormHandle, NumeroSerieFormProps>(
  function NumeroSerieForm({ mode, serie, onDirty, onSave }, ref) {
    const readOnly = mode === 'view';
    const isNew = mode === 'new';

    const [pedidoVendaId, setPedidoVendaId] = useState<number | null>(null);
    const [pedidoDisplay, setPedidoDisplay] = useState<{
      codigo: string | null;
      clienteCodigo: string | null;
      clienteNome: string | null;
    }>({ codigo: null, clienteCodigo: null, clienteNome: null });

    const [produtoId, setProdutoId] = useState<number | null>(null);
    const [produtoDisplay, setProdutoDisplay] = useState<{
      codigo: string | null;
      descricao: string | null;
    }>({ codigo: null, descricao: null });

    const [codigo, setCodigo] = useState<string>('');
    const [codigoEditavel, setCodigoEditavel] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const { activeTab, setActiveTab, formFieldsRef, handleFieldsKeyDown } = useFormTabNavigation({
      tabs: TABS,
      defaultTab: 'identificacao',
    });

    const config = useConfiguracaoEmpresaStore((s) => s.config);
    const allSeries = useNumeroSerieStore((s) => s.series);

    const proximoCodigo = useMemo(
      () => (isNew ? computeProximoCodigo(config?.anoFundacao, allSeries) : ''),
      [isNew, config?.anoFundacao, allSeries],
    );

    useEffect(() => {
      setErrors({});
      setCodigoEditavel(false);
      if (serie) {
        setPedidoVendaId(serie.pedidoVendaId);
        setPedidoDisplay({
          codigo: serie.pedidoVendaCodigo ?? null,
          clienteCodigo: serie.clienteCodigo ?? null,
          clienteNome: serie.clienteNome ?? null,
        });
        setProdutoId(serie.produtoId ?? null);
        setProdutoDisplay({
          codigo: serie.produtoCodigo ?? null,
          descricao: serie.produtoDescricao ?? null,
        });
        setCodigo(serie.codigo ?? '');
      } else {
        setPedidoVendaId(null);
        setPedidoDisplay({ codigo: null, clienteCodigo: null, clienteNome: null });
        setProdutoId(null);
        setProdutoDisplay({ codigo: null, descricao: null });
        setCodigo('');
      }
    }, [serie, mode]);

    useEffect(() => {
      if (isNew && !codigoEditavel) {
        setCodigo(proximoCodigo);
      }
    }, [isNew, codigoEditavel, proximoCodigo]);

    useImperativeHandle(ref, () => ({
      submit: async () => {
        const e: Record<string, string> = {};

        if (isNew) {
          if (!pedidoVendaId) e.pedidoVendaId = 'Selecione um pedido';
          if (codigo.trim() && !CODIGO_REGEX.test(codigo.trim())) {
            e.codigo = 'Formato inválido. Esperado: II.MM.AA.NNNNN';
          }
        }

        setErrors(e);
        if (Object.keys(e).length > 0) {
          toast.error('Corrija os campos destacados.');
          return false;
        }

        const codigoEnviar = isNew && codigo.trim() ? codigo.trim() : null;

        await onSave({
          pedidoVendaId: pedidoVendaId ?? serie?.pedidoVendaId ?? 0,
          produtoId: produtoId ?? null,
          codigo: codigoEnviar,
        });
        return true;
      },
    }));

    const clearErr = (field: string) => {
      if (errors[field]) {
        setErrors((prev) => {
          const next = { ...prev };
          delete next[field];
          return next;
        });
      }
    };

    return (
      <div className="h-full flex flex-col overflow-hidden">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col h-full gap-0">

          <div className="shrink-0 px-6 pt-4 pb-0">
            <TabsList>
              <TabsTrigger value="identificacao">Identificação</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="identificacao" className="flex-1 overflow-auto mt-0 px-6 py-5">
            <div ref={formFieldsRef} onKeyDown={handleFieldsKeyDown}
              className="grid gap-x-3 gap-y-5"
              style={{ gridTemplateColumns: '240px minmax(0, 1fr)' }}>

              {/* ────── Linha 1: Pedido de Venda | Número de Série ────── */}
              <NumeroSeriePedidoField
                value={pedidoVendaId}
                displayCodigo={pedidoDisplay.codigo}
                onChange={(pid, pedido) => {
                  setPedidoVendaId(pid);
                  if (pedido) {
                    setPedidoDisplay({
                      codigo: pedido.codigo ?? null,
                      clienteCodigo: pedido.clienteCodigo ?? null,
                      clienteNome: pedido.clienteNome ?? null,
                    });
                  } else {
                    setPedidoDisplay({ codigo: null, clienteCodigo: null, clienteNome: null });
                  }
                  clearErr('pedidoVendaId');
                  onDirty();
                }}
                readOnly={!isNew}
                error={errors.pedidoVendaId}
              />

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="codigo"
                  className={`text-xs font-medium ${errors.codigo ? 'text-red-500 dark:text-red-400' : 'text-slate-500 dark:text-slate-400'}`}>
                  Número de Série
                </Label>
                <div className="flex items-center gap-2">
                  <Input id="codigo" value={codigo}
                    placeholder="II.MM.AA.NNNNN"
                    readOnly={!isNew || !codigoEditavel}
                    onChange={(e) => {
                      setCodigo(e.target.value);
                      clearErr('codigo');
                      onDirty();
                    }}
                    maxLength={14}
                    className={`h-9 text-sm bg-white dark:bg-slate-950 font-mono ${
                      (!isNew || !codigoEditavel) ? 'cursor-default focus-visible:ring-0 focus-visible:ring-offset-0' : ''
                    } ${errors.codigo ? 'border-red-400 dark:border-red-500' : ''}`} />
                  {isNew && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button type="button" variant={codigoEditavel ? 'default' : 'outline'} size="icon"
                          className="h-9 w-9 shrink-0"
                          onClick={() => {
                            const next = !codigoEditavel;
                            setCodigoEditavel(next);
                            if (!next) {
                              setCodigo(proximoCodigo);
                              clearErr('codigo');
                            }
                            onDirty();
                          }}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{codigoEditavel ? 'Voltar pro código automático' : 'Informar código manualmente'}</p>
                      </TooltipContent>
                    </Tooltip>
                  )}
                </div>
                {isNew && !codigoEditavel && proximoCodigo && (
                  <p className="text-xs text-muted-foreground">
                    Próximo código sugerido. Lápis abre edição manual.
                  </p>
                )}
                {isNew && !codigoEditavel && !proximoCodigo && (
                  <p className="text-xs text-amber-600 dark:text-amber-400">
                    Configure o ano de fundação em Configurações &gt; Sistema.
                  </p>
                )}
                {isNew && codigoEditavel && !errors.codigo && (
                  <p className="text-xs text-muted-foreground">
                    Editando manualmente. Formato: II.MM.AA.NNNNN.
                  </p>
                )}
                {errors.codigo && (
                  <p className="text-xs text-red-500 dark:text-red-400">{errors.codigo}</p>
                )}
              </div>

              {/* ────── Linha 2: Cód. Cliente | Cliente (readonly, derivados do PV) ────── */}
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  Cód. Cliente
                </Label>
                <Input
                  value={pedidoDisplay.clienteCodigo ?? ''}
                  readOnly
                  className="h-9 text-sm bg-white dark:bg-slate-950 font-mono cursor-default focus-visible:ring-0 focus-visible:ring-offset-0"
                  tabIndex={-1}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  Cliente
                </Label>
                <Input
                  value={pedidoDisplay.clienteNome ?? ''}
                  readOnly
                  placeholder="Selecione um pedido"
                  className="h-9 text-sm bg-white dark:bg-slate-950 cursor-default focus-visible:ring-0 focus-visible:ring-offset-0"
                  tabIndex={-1}
                />
              </div>

              {/* ────── Linha 3: Código BOM | Produto (descrição readonly) ────── */}
              <NumeroSerieProdutoField
                value={produtoId}
                displayCodigo={produtoDisplay.codigo}
                onChange={(pid, produto) => {
                  setProdutoId(pid);
                  if (produto) {
                    setProdutoDisplay({
                      codigo: produto.codigo ?? null,
                      descricao: produto.descricao ?? null,
                    });
                  } else {
                    setProdutoDisplay({ codigo: null, descricao: null });
                  }
                  onDirty();
                }}
                readOnly={readOnly}
              />

              <div className="flex flex-col gap-1.5">
                <Label className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  Produto
                </Label>
                <Input
                  value={produtoDisplay.descricao ?? ''}
                  readOnly
                  placeholder="Selecione um produto BOM"
                  className="h-9 text-sm bg-white dark:bg-slate-950 cursor-default focus-visible:ring-0 focus-visible:ring-offset-0"
                  tabIndex={-1}
                />
              </div>

            </div>
          </TabsContent>

        </Tabs>
      </div>
    );
  }
);
