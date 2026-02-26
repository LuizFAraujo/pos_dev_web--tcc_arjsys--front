/**
 * NovaEstruturaDialog.tsx — Modal para criar nova estrutura de produto.
 */

import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useProdutosStore } from '@/stores/engenharia/produtosStore';
import { useBOMStore } from '@/stores/engenharia/bomStore';
import { ProdutoSelect } from './ProdutoSelect';

interface NovaEstruturaDialogProps {
  onEstruturaCreated: (codigoProduto: string) => void;
}

export function NovaEstruturaDialog({ onEstruturaCreated }: NovaEstruturaDialogProps) {
  const [open, setOpen] = useState(false);
  const [selectedProdutoId, setSelectedProdutoId] = useState<number | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const produtos = useProdutosStore((s) => s.produtos);
  const fetchProdutos = useProdutosStore((s) => s.fetchProdutos);
  const produtosComEstrutura = useBOMStore((s) => s.produtosComEstrutura);

  useEffect(() => {
    if (produtos.length === 0) {
      fetchProdutos();
    }
  }, [produtos.length, fetchProdutos]);

  // Filtrar apenas FABRICADOS que ainda NÃO têm estrutura
  const produtosDisponiveis = produtos.filter(
    (p) => p.tipo === 'Fabricado' && !produtosComEstrutura.includes(p.codigo),
  );

  const handleCreate = () => {
    if (selectedProdutoId == null) return;

    const produto = produtos.find((p) => p.id === selectedProdutoId);
    if (!produto) return;

    setIsCreating(true);

    // TODO: Implementar criação real via API
    setTimeout(() => {
      setIsCreating(false);
      setOpen(false);
      setSelectedProdutoId(null);
      onEstruturaCreated(produto.codigo);
    }, 300);
  };

  const handleCancel = () => {
    setOpen(false);
    setSelectedProdutoId(null);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Nova Estrutura
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-162.5">
        <DialogHeader>
          <DialogTitle>Criar Nova Estrutura de Produto</DialogTitle>
          <DialogDescription>
            Selecione um produto FABRICADO para iniciar sua estrutura (BOM).
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="produto">
              Produto Pai <span className="text-destructive">*</span>
            </Label>
            <ProdutoSelect
              produtos={produtosDisponiveis}
              value={selectedProdutoId}
              onChange={setSelectedProdutoId}
              placeholder="Selecione o produto..."
              emptyMessage="Nenhum produto fabricado disponível"
            />
            {produtosDisponiveis.length === 0 && (
              <p className="text-sm text-muted-foreground">
                Todos os produtos fabricados já possuem estrutura cadastrada.
              </p>
            )}
            {produtosDisponiveis.length > 0 && (
              <p className="text-xs text-muted-foreground">
                {produtosDisponiveis.length} produto(s) disponível(is) para criar estrutura
              </p>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel} disabled={isCreating}>
            Cancelar
          </Button>
          <Button onClick={handleCreate} disabled={selectedProdutoId == null || isCreating}>
            {isCreating ? 'Criando...' : 'Criar e Abrir'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
