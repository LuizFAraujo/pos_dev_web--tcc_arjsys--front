/**
 * useBomEditState.ts — Estado de edição em lote da BOM
 *
 * Gerencia pendências locais antes de salvar no banco:
 *   - Linhas novas (added): criadas pelo usuário, ainda não persistidas
 *   - Alterações (changed): QTDE ou POS diferente do original
 *   - Linhas marcadas pra deletar (deleted): reversível antes de salvar
 *
 * Ao salvar, retorna as 3 listas pro chamador processar (POST/PUT/DELETE).
 * Ao resetar, limpa tudo (usado quando dados recarregam do banco).
 *
 * Não faz chamadas à API — responsabilidade do BOMForm/BOMPage.
 */

import { useCallback, useState } from 'react';
import type { BomTreeItem } from '@/types/engenharia/bom.types';

// ─── Tipos ────────────────────────────────────────────────────────────────────

/** Linha nova adicionada pelo usuário (ainda não existe no banco) */
export interface BomPendingAdd {
  /** ID temporário local (negativo pra não colidir com IDs do banco) */
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
  // Linhas novas adicionadas pelo usuário
  const [pendingAdds, setPendingAdds] = useState<BomPendingAdd[]>([]);

  // Alterações em linhas existentes (chave: bomItemId)
  const [pendingChanges, setPendingChanges] = useState<Map<number, BomPendingChange>>(new Map());

  // IDs de linhas marcadas pra deletar (do banco)
  const [pendingDeletes, setPendingDeletes] = useState<Set<number>>(new Set());

  // Contador pra IDs temporários (negativos)
  const [nextTempId, setNextTempId] = useState(-1);

  // ── Queries ───────────────────────────────────────────────────────────────

  /** Retorna o status visual de uma linha da tree */
  const getRowStatus = useCallback((node: BomTreeItem): BomRowStatus => {
    // Nó raiz (nível 1) nunca tem status
    if (node.nivel === 1) return 'clean';

    // Linha nova?
    if (node.id < 0 && pendingAdds.some((a) => a.tempId === node.id)) return 'added';

    // Marcada pra deletar?
    if (pendingDeletes.has(node.id)) return 'deleted';

    // Alterada?
    if (pendingChanges.has(node.id)) return 'changed';

    return 'clean';
  }, [pendingAdds, pendingChanges, pendingDeletes]);

  /** Verifica se há qualquer pendência (pra isDirty) */
  const hasPendingChanges = pendingAdds.length > 0
    || pendingChanges.size > 0
    || pendingDeletes.size > 0;

  // ── Mutations ─────────────────────────────────────────────────────────────

  /** Adiciona uma linha nova */
  const addItem = useCallback((item: Omit<BomPendingAdd, 'tempId'>) => {
    const tempId = nextTempId;
    setNextTempId((prev) => prev - 1);
    setPendingAdds((prev) => [...prev, { ...item, tempId }]);
    return tempId;
  }, [nextTempId]);

  /** Remove uma linha nova (antes de salvar) */
  const removeAddedItem = useCallback((tempId: number) => {
    setPendingAdds((prev) => prev.filter((a) => a.tempId !== tempId));
  }, []);

  /** Registra alteração de quantidade numa linha existente */
  const changeQuantidade = useCallback((bomItemId: number, qtdeOriginal: number, qtdeNova: number, posOriginal: number) => {
    setPendingChanges((prev) => {
      const next = new Map(prev);
      const existing = next.get(bomItemId);
      const posNova = existing?.posicaoNova ?? posOriginal;

      // Se voltou tudo ao original, remove a pendência
      if (qtdeNova === qtdeOriginal && posNova === posOriginal) {
        next.delete(bomItemId);
      } else {
        next.set(bomItemId, {
          bomItemId, quantidadeOriginal: qtdeOriginal, quantidadeNova: qtdeNova,
          posicaoOriginal: posOriginal, posicaoNova: posNova,
        });
      }
      return next;
    });
  }, []);

  /** Registra alteração de posição numa linha existente */
  const changePosicao = useCallback((bomItemId: number, posOriginal: number, posNova: number, qtdeOriginal: number) => {
    setPendingChanges((prev) => {
      const next = new Map(prev);
      const existing = next.get(bomItemId);
      const qtdeNova = existing?.quantidadeNova ?? qtdeOriginal;

      // Se voltou tudo ao original, remove a pendência
      if (qtdeNova === qtdeOriginal && posNova === posOriginal) {
        next.delete(bomItemId);
      } else {
        next.set(bomItemId, {
          bomItemId, quantidadeOriginal: qtdeOriginal, quantidadeNova: qtdeNova,
          posicaoOriginal: posOriginal, posicaoNova: posNova,
        });
      }
      return next;
    });
  }, []);

  /** Altera quantidade de uma linha nova (added) */
  const changeAddedQuantidade = useCallback((tempId: number, quantidade: number) => {
    setPendingAdds((prev) =>
      prev.map((a) => a.tempId === tempId ? { ...a, quantidade } : a)
    );
  }, []);

  /** Altera posição de uma linha nova (added) */
  const changeAddedPosicao = useCallback((tempId: number, posicao: number) => {
    setPendingAdds((prev) =>
      prev.map((a) => a.tempId === tempId ? { ...a, posicao } : a)
    );
  }, []);

  /** Toggle: marca/desmarca uma linha existente pra deletar */
  const toggleDelete = useCallback((bomItemId: number) => {
    setPendingDeletes((prev) => {
      const next = new Set(prev);
      if (next.has(bomItemId)) {
        next.delete(bomItemId);
      } else {
        next.add(bomItemId);
      }
      return next;
    });
    // Remove change pendente ao marcar pra deletar
    setPendingChanges((prev) => {
      if (!prev.has(bomItemId)) return prev;
      const next = new Map(prev);
      next.delete(bomItemId);
      return next;
    });
  }, []);

  /** Retorna as pendências pra processar no salvar */
  const getPendingOperations = useCallback(() => ({
    adds: [...pendingAdds],
    changes: [...pendingChanges.values()],
    deletes: [...pendingDeletes],
  }), [pendingAdds, pendingChanges, pendingDeletes]);

  /** Limpa todas as pendências (após salvar com sucesso ou ao resetar) */
  const resetPending = useCallback(() => {
    setPendingAdds([]);
    setPendingChanges(new Map());
    setPendingDeletes(new Set());
    setNextTempId(-1);
  }, []);

  return {
    // Estado
    pendingAdds,
    pendingChanges,
    pendingDeletes,
    hasPendingChanges,

    // Queries
    getRowStatus,

    // Mutations
    addItem,
    removeAddedItem,
    changeQuantidade,
    changePosicao,
    changeAddedQuantidade,
    changeAddedPosicao,
    toggleDelete,

    // Lote
    getPendingOperations,
    resetPending,
  };
}
