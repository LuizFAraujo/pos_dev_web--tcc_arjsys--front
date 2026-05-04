/**
 * useBomEditState.ts - Estado de edição em lote da BOM
 *
 * Gerencia pendências locais antes de salvar no banco:
 *   - Linhas novas (added): criadas pelo usuário, ainda não persistidas
 *   - Alterações (changed): QTDE ou POS diferente do original
 *   - Linhas marcadas pra deletar (deleted): reversível antes de salvar
 *
 * Ao salvar, retorna as 3 listas pro chamador processar (POST/PUT/DELETE).
 * Ao resetar, limpa tudo (usado quando dados recarregam do banco).
 *
 * Não faz chamadas à API - responsabilidade do BOMForm/BOMPage.
 *
 * NOTA: nextTempId começa em -100 pra não colidir com o id=-1 do nó raiz da tree.
 */

import { useCallback, useState } from 'react';
import type { BomTreeItem } from '@/types/engenharia/bom.types';

// ─── Tipos ────────────────────────────────────────────────────────────────────

/** Linha nova adicionada pelo usuário (ainda não existe no banco) */
export interface BomPendingAdd {
  /** ID temporário local (negativo, a partir de -100) */
  tempId: number;
  /** ID do produto pai (na tabela Produtos) */
  produtoPaiId: number;
  /** ID do produto filho (na tabela Produtos) */
  produtoFilhoId: number;
  /** Código do produto filho (display) */
  codigo: string;
  /** Descrição do produto filho (display) */
  descricao: string;
  /** Unidade do produto filho (display) */
  unidade: string;
  /** Quantidade informada */
  quantidade: number;
  /** Posição na estrutura */
  posicao: number;
  /** Se o produto filho tem documento */
  temDocumento: boolean;
}

/** Alteração numa linha existente (qtde e/ou posição) */
export interface BomPendingChange {
  /** ID real do item BOM no banco */
  bomItemId: number;
  /** Quantidade original */
  quantidadeOriginal: number;
  /** Nova quantidade */
  quantidadeNova: number;
  /** Posição original */
  posicaoOriginal: number;
  /** Nova posição */
  posicaoNova: number;
}

/** Tipo de status visual de cada linha */
export type BomRowStatus = 'clean' | 'added' | 'changed' | 'deleted';

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useBomEditState() {
  const [pendingAdds, setPendingAdds] = useState<BomPendingAdd[]>([]);
  const [pendingChanges, setPendingChanges] = useState<Map<number, BomPendingChange>>(new Map());
  const [pendingDeletes, setPendingDeletes] = useState<Set<number>>(new Set());

  // Começa em -100 pra não colidir com id=-1 do nó raiz
  const [nextTempId, setNextTempId] = useState(-100);

  // ── Queries ───────────────────────────────────────────────────────────────

  const getRowStatus = useCallback((node: BomTreeItem): BomRowStatus => {
    if (node.nivel === 1) return 'clean';
    if (node.id <= -100 && pendingAdds.some((a) => a.tempId === node.id)) return 'added';
    if (pendingDeletes.has(node.id)) return 'deleted';
    if (pendingChanges.has(node.id)) return 'changed';
    return 'clean';
  }, [pendingAdds, pendingChanges, pendingDeletes]);

  const hasPendingChanges = pendingAdds.length > 0
    || pendingChanges.size > 0
    || pendingDeletes.size > 0;

  // ── Mutations ─────────────────────────────────────────────────────────────

  const addItem = useCallback((item: Omit<BomPendingAdd, 'tempId'>) => {
    const tempId = nextTempId;
    setNextTempId((prev) => prev - 1);
    setPendingAdds((prev) => [...prev, { ...item, tempId }]);
    return tempId;
  }, [nextTempId]);

  const removeAddedItem = useCallback((tempId: number) => {
    setPendingAdds((prev) => prev.filter((a) => a.tempId !== tempId));
  }, []);

  const changeQuantidade = useCallback((bomItemId: number, qtdeOriginal: number, qtdeNova: number, posOriginal: number) => {
    setPendingChanges((prev) => {
      const next = new Map(prev);
      const existing = next.get(bomItemId);
      const posNova = existing?.posicaoNova ?? posOriginal;
      if (qtdeNova === qtdeOriginal && posNova === posOriginal) {
        next.delete(bomItemId);
      } else {
        next.set(bomItemId, { bomItemId, quantidadeOriginal: qtdeOriginal, quantidadeNova: qtdeNova, posicaoOriginal: posOriginal, posicaoNova: posNova });
      }
      return next;
    });
  }, []);

  const changePosicao = useCallback((bomItemId: number, posOriginal: number, posNova: number, qtdeOriginal: number) => {
    setPendingChanges((prev) => {
      const next = new Map(prev);
      const existing = next.get(bomItemId);
      const qtdeNova = existing?.quantidadeNova ?? qtdeOriginal;
      if (qtdeNova === qtdeOriginal && posNova === posOriginal) {
        next.delete(bomItemId);
      } else {
        next.set(bomItemId, { bomItemId, quantidadeOriginal: qtdeOriginal, quantidadeNova: qtdeNova, posicaoOriginal: posOriginal, posicaoNova: posNova });
      }
      return next;
    });
  }, []);

  const changeAddedQuantidade = useCallback((tempId: number, quantidade: number) => {
    setPendingAdds((prev) => prev.map((a) => a.tempId === tempId ? { ...a, quantidade } : a));
  }, []);

  const changeAddedPosicao = useCallback((tempId: number, posicao: number) => {
    setPendingAdds((prev) => prev.map((a) => a.tempId === tempId ? { ...a, posicao } : a));
  }, []);

  const toggleDelete = useCallback((bomItemId: number) => {
    setPendingDeletes((prev) => {
      const next = new Set(prev);
      if (next.has(bomItemId)) { next.delete(bomItemId); } else { next.add(bomItemId); }
      return next;
    });
    setPendingChanges((prev) => {
      if (!prev.has(bomItemId)) return prev;
      const next = new Map(prev);
      next.delete(bomItemId);
      return next;
    });
  }, []);

  const getPendingOperations = useCallback(() => ({
    adds: [...pendingAdds],
    changes: [...pendingChanges.values()],
    deletes: [...pendingDeletes],
  }), [pendingAdds, pendingChanges, pendingDeletes]);

  const resetPending = useCallback(() => {
    setPendingAdds([]);
    setPendingChanges(new Map());
    setPendingDeletes(new Set());
    setNextTempId(-100);
  }, []);

  return {
    pendingAdds, pendingChanges, pendingDeletes, hasPendingChanges,
    getRowStatus,
    addItem, removeAddedItem, changeQuantidade, changePosicao,
    changeAddedQuantidade, changeAddedPosicao, toggleDelete,
    getPendingOperations, resetPending,
  };
}
