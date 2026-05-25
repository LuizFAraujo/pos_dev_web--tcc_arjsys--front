/**
 * ExportarBOMDialog.tsx - Dialog de configuração da exportação da BOM
 *
 * Exporta a árvore hierárquica da estrutura (mesma ordem/dados do BOMForm)
 * para .xlsx (SheetJS) ou .csv. Download direto pelo navegador.
 *
 * Recebe os nós da árvore via callback getTreeNodes() do BOMForm — assim
 * exporta exatamente o que está na tela, sem refazer cálculo de hierarquia.
 *
 * Nome do arquivo: EST_<CODIGO_PAI>_<YYYY-MM-DD>_<HHMMSS> (gerado no momento
 * da exportação, não editável pelo usuário).
 */

import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { NumberStepper } from '@/components/shared/NumberStepper';
import type { BomTreeItem } from '@/types/engenharia/bom.types';

// ─── Tipos ────────────────────────────────────────────────────────────────────

type ColunaKey =
  | 'rowNum'
  | 'nivel'
  | 'posicao'
  | 'quantidade'
  | 'codigo'
  | 'descricao'
  | 'unidade'
  | 'temDocumento';

interface ColunaDef {
  key: ColunaKey;
  label: string;
  defaultChecked: boolean;
}

const COLUNAS: ColunaDef[] = [
  { key: 'rowNum', label: '#', defaultChecked: false },
  { key: 'nivel', label: 'Nível', defaultChecked: true },
  { key: 'posicao', label: 'Posição', defaultChecked: true },
  { key: 'quantidade', label: 'Quantidade', defaultChecked: true },
  { key: 'codigo', label: 'Código', defaultChecked: true },
  { key: 'descricao', label: 'Descrição', defaultChecked: true },
  { key: 'unidade', label: 'Unidade', defaultChecked: false },
  { key: 'temDocumento', label: 'Documento', defaultChecked: false },
];

/**
 * Nós da árvore vindos do BOMForm. Cada item já tem _rowNum sequencial e
 * a ordem hierárquica preservada (mesma do DataGridTree).
 */
export interface BomTreeNodeForExport extends BomTreeItem {
  _rowNum: number;
  _treePath: string;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  codigoPai: string;
  /** Função que retorna a lista de nós já achatada e ordenada (allNodes do BOMForm). */
  getTreeNodes: () => BomTreeNodeForExport[];
  /** True quando o form está em edit mode com alterações não salvas. */
  hasDirtyChanges?: boolean;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatQtde(q: number): string {
  return q.toLocaleString('pt-BR', {
    minimumFractionDigits: 3,
    maximumFractionDigits: 3,
  });
}

function formatPos(p: number): string {
  return String(p).padStart(4, '0');
}

function dataHoraAgora(): string {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  const hh = String(d.getHours()).padStart(2, '0');
  const mi = String(d.getMinutes()).padStart(2, '0');
  const ss = String(d.getSeconds()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}_${hh}${mi}${ss}`;
}

function sanitizarNomeArquivo(nome: string): string {
  // Remove caracteres inválidos pra nome de arquivo Windows/Linux
  return nome.replace(/[<>:"/\\|?*\x00-\x1f]/g, '_').trim();
}

// ─── Componente ───────────────────────────────────────────────────────────────

export function ExportarBOMDialog({
  open,
  onOpenChange,
  codigoPai,
  getTreeNodes,
  hasDirtyChanges = false,
}: Props) {
  // ── Estado dos campos ──────────────────────────────────────────────────────

  const [colunasMarcadas, setColunasMarcadas] = useState<Set<ColunaKey>>(
    new Set(COLUNAS.filter((c) => c.defaultChecked).map((c) => c.key)),
  );
  const [todasColunas, setTodasColunas] = useState(false);
  const [todosNiveis, setTodosNiveis] = useState(true);
  const [limiteNivelStr, setLimiteNivelStr] = useState<string>('1');
  const [indentar, setIndentar] = useState(true);
  const [incluirCabecalho, setIncluirCabecalho] = useState(true);
  const [formato, setFormato] = useState<'xlsx' | 'csv'>('xlsx');
  const [exportando, setExportando] = useState(false);

  // Reseta valores quando abre
  useEffect(() => {
    if (open) {
      setColunasMarcadas(
        new Set(COLUNAS.filter((c) => c.defaultChecked).map((c) => c.key)),
      );
      setTodasColunas(false);
      setTodosNiveis(true);
      setLimiteNivelStr('1');
      setIndentar(true);
      setIncluirCabecalho(true);
      setFormato('xlsx');
    }
  }, [open]);

  const toggleColuna = (key: ColunaKey) => {
    setColunasMarcadas((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  /**
   * Quando "Todas as colunas" está marcado, força todas no export
   * ignorando o estado individual (que está visualmente preservado).
   */
  const colunasOrdenadas = useMemo(() => {
    if (todasColunas) return COLUNAS;
    return COLUNAS.filter((c) => colunasMarcadas.has(c.key));
  }, [todasColunas, colunasMarcadas]);

  // ── Exportação ─────────────────────────────────────────────────────────────

  const handleExportar = async () => {
    if (colunasOrdenadas.length === 0) {
      toast.error('Selecione ao menos uma coluna para exportar.');
      return;
    }

    setExportando(true);
    try {
      const todosNos = getTreeNodes();

      let nos = todosNos;
      if (!todosNiveis) {
        const limite = parseInt(limiteNivelStr, 10);
        if (!Number.isNaN(limite) && limite > 0) {
          nos = todosNos.filter((n) => n.nivel <= limite);
        }
      }

      if (nos.length === 0) {
        toast.error('Nenhum item para exportar com os filtros aplicados.');
        setExportando(false);
        return;
      }

      // Monta as linhas: cada nó da árvore vira um array de células
      // na ordem das colunas marcadas.
      const linhas: (string | number)[][] = nos.map((n) => {
        return colunasOrdenadas.map((col) => {
          switch (col.key) {
            case 'rowNum':
              return n._rowNum;
            case 'nivel':
              return n.nivel;
            case 'posicao':
              return n.nivel === 1 ? '' : formatPos(n.posicao);
            case 'quantidade':
              return n.nivel === 1 ? '' : formatQtde(n.quantidade);
            case 'codigo': {
              if (!indentar) return n.codigo;
              // Indentação: 2 espaços por nível (a partir do nível 2).
              const indent = '  '.repeat(Math.max(0, n.nivel - 1));
              return `${indent}${n.codigo}`;
            }
            case 'descricao':
              return n.descricao;
            case 'unidade':
              return n.unidade;
            case 'temDocumento':
              return n.temDocumento ? 'Sim' : 'Não';
            default:
              return '';
          }
        });
      });

      const cabecalho = colunasOrdenadas.map((c) => c.label);
      const dados = incluirCabecalho ? [cabecalho, ...linhas] : linhas;

      const nomeArquivo = sanitizarNomeArquivo(
        `EST_${codigoPai}_${dataHoraAgora()}`,
      );

      if (formato === 'xlsx') {
        exportarXlsx(dados, nomeArquivo, incluirCabecalho, colunasOrdenadas);
      } else {
        exportarCsv(dados, nomeArquivo);
      }

      toast.success(
        `Estrutura exportada (${nos.length} ${nos.length === 1 ? 'linha' : 'linhas'}).`,
      );
      onOpenChange(false);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erro ao exportar';
      toast.error(msg);
    } finally {
      setExportando(false);
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="text-base font-semibold flex items-center gap-2">
            <span>Exportar Estrutura</span>
            <span className="font-mono text-sm font-normal text-muted-foreground">
              {codigoPai}
            </span>
          </DialogTitle>
        </DialogHeader>

        {hasDirtyChanges && (
          <div className="rounded-md border border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/40 px-3 py-2 text-xs text-amber-800 dark:text-amber-300">
            ⚠ Há alterações não salvas. A exportação usará o estado atual da tela.
          </div>
        )}

        {/* ── Colunas ─────────────────────────────────────────────────────── */}
        <div className="flex flex-col gap-2">
          <Label className="text-[11px] uppercase tracking-wide text-muted-foreground">
            Colunas
          </Label>
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <Checkbox
              checked={todasColunas}
              onCheckedChange={(c) => setTodasColunas(!!c)}
            />
            <span>Todas as colunas</span>
          </label>
          <div className="grid grid-cols-4 gap-x-3 gap-y-2">
            {COLUNAS.map((col) => (
              <label
                key={col.key}
                className={`flex items-center gap-2 text-sm ${todasColunas ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                  }`}
              >
                <Checkbox
                  checked={colunasMarcadas.has(col.key)}
                  onCheckedChange={() => toggleColuna(col.key)}
                  disabled={todasColunas}
                />
                <span>{col.label}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="border-t border-slate-200 dark:border-slate-700" />

        {/* ── Níveis + Opções lado a lado ─────────────────────────────────── */}
        <div className="grid grid-cols-2 gap-6">
          <div className="flex flex-col gap-2">
            <Label className="text-[11px] uppercase tracking-wide text-muted-foreground">
              Níveis
            </Label>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <Checkbox
                checked={todosNiveis}
                onCheckedChange={(c) => setTodosNiveis(!!c)}
              />
              <span>Todos os níveis</span>
            </label>
            <NumberStepper
              value={limiteNivelStr}
              onChange={setLimiteNivelStr}
              min={1}
              step={1}
              disabled={todosNiveis}
              className="max-w-35"
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label className="text-[11px] uppercase tracking-wide text-muted-foreground">
              Opções
            </Label>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <Checkbox
                checked={indentar}
                onCheckedChange={(c) => setIndentar(!!c)}
              />
              <span>Indentar código</span>
            </label>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <Checkbox
                checked={incluirCabecalho}
                onCheckedChange={(c) => setIncluirCabecalho(!!c)}
              />
              <span>Incluir cabeçalhos</span>
            </label>
          </div>
        </div>

        <div className="border-t border-slate-200 dark:border-slate-700" />

        {/* ── Formato (radio inline) ──────────────────────────────────────── */}
        <div className="flex flex-col gap-2">
          <Label className="text-[11px] uppercase tracking-wide text-muted-foreground">
            Formato
          </Label>
          <RadioGroup
            value={formato}
            onValueChange={(v) => setFormato(v as 'xlsx' | 'csv')}
            className="flex flex-row gap-6"
          >
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <RadioGroupItem value="xlsx" id="fmt-xlsx" />
              <span>Excel (.xlsx)</span>
            </label>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <RadioGroupItem value="csv" id="fmt-csv" />
              <span>CSV (.csv)</span>
            </label>
          </RadioGroup>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            disabled={exportando}
          >
            Cancelar
          </Button>
          <Button
            size="sm"
            onClick={() => void handleExportar()}
            disabled={exportando}
          >
            {exportando ? 'Exportando...' : 'Exportar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Exportação XLSX ──────────────────────────────────────────────────────────

function exportarXlsx(
  dados: (string | number)[][],
  nomeArquivo: string,
  temCabecalho: boolean,
  colunasOrdenadas: ColunaDef[],
) {
  const ws = XLSX.utils.aoa_to_sheet(dados);

  // Largura automática por coluna (mínimo 8, máximo 60)
  const larguras: { wch: number }[] = colunasOrdenadas.map((_, colIdx) => {
    let max = 8;
    for (const linha of dados) {
      const v = linha[colIdx];
      const len = v != null ? String(v).length : 0;
      if (len > max) max = len;
    }
    return { wch: Math.min(60, max + 2) };
  });
  ws['!cols'] = larguras;

  // Freeze do cabeçalho
  if (temCabecalho) {
    ws['!freeze'] = { xSplit: 0, ySplit: 1 };
    // Negrito + fundo cinza no header. SheetJS Community não estiliza por
    // padrão, mas configurar a célula com .s ajuda quando aberto em Excel.
    const range = XLSX.utils.decode_range(ws['!ref'] || 'A1');
    for (let c = range.s.c; c <= range.e.c; c++) {
      const addr = XLSX.utils.encode_cell({ r: 0, c });
      if (ws[addr]) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (ws[addr] as any).s = {
          font: { bold: true },
          fill: { fgColor: { rgb: 'F0F0F0' } },
        };
      }
    }
  }

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Estrutura');
  XLSX.writeFile(wb, `${nomeArquivo}.xlsx`);
}

// ─── Exportação CSV ───────────────────────────────────────────────────────────

function exportarCsv(dados: (string | number)[][], nomeArquivo: string) {
  // Separador ';' (padrão pt-BR do Excel — vírgula é separador decimal).
  // Aspas duplas + escape padrão CSV. BOM no início pra Excel reconhecer UTF-8.
  const linhasCsv = dados.map((linha) =>
    linha
      .map((v) => {
        const s = v == null ? '' : String(v);
        if (s.includes(';') || s.includes('"') || s.includes('\n')) {
          return `"${s.replace(/"/g, '""')}"`;
        }
        return s;
      })
      .join(';'),
  );
  const conteudo = '\uFEFF' + linhasCsv.join('\r\n');
  const blob = new Blob([conteudo], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${nomeArquivo}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
