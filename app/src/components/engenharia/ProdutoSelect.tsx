/**
 * ProdutoSelect.tsx — Componente select reutilizável para seleção de produtos.
 */

import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import type { Produto } from '@/types/engenharia/produto.types';
import { useState } from 'react';

interface ProdutoSelectProps {
  produtos: Produto[];
  value: number | null;
  onChange: (produtoId: number) => void;
  placeholder?: string;
  emptyMessage?: string;
  disabled?: boolean;
}

export function ProdutoSelect({
  produtos,
  value,
  onChange,
  placeholder = 'Selecione um produto...',
  emptyMessage = 'Nenhum produto encontrado',
  disabled = false,
}: ProdutoSelectProps) {
  const [open, setOpen] = useState(false);

  const selectedProduto = produtos.find((p) => p.id === value);

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between text-left font-normal"
          disabled={disabled}
        >
          {selectedProduto ? (
            <div className="flex flex-col gap-0.5 overflow-hidden">
              <span className="font-mono text-xs font-semibold">{selectedProduto.codigo}</span>
              <span className="text-xs text-muted-foreground truncate">
                {truncateText(selectedProduto.descricao, 60)}
              </span>
            </div>
          ) : (
            <span className="text-muted-foreground">{placeholder}</span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-150 p-0" align="start">
        <Command>
          <CommandInput placeholder="Buscar por código ou descrição..." />
          <CommandList>
            <CommandEmpty>{emptyMessage}</CommandEmpty>
            <CommandGroup>
              {produtos.map((produto) => (
                <CommandItem
                  key={produto.id}
                  value={`${produto.codigo} ${produto.descricao}`}
                  onSelect={() => {
                    onChange(produto.id);
                    setOpen(false);
                  }}
                  className="cursor-pointer"
                >
                  <Check
                    className={cn(
                      'mr-2 h-4 w-4 shrink-0',
                      value === produto.id ? 'opacity-100' : 'opacity-0',
                    )}
                  />
                  <div className="flex flex-col gap-0.5 overflow-hidden flex-1 min-w-0">
                    <span className="font-mono text-xs font-semibold">{produto.codigo}</span>
                    <span className="text-xs text-muted-foreground truncate">
                      {truncateText(produto.descricao, 80)}
                    </span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
