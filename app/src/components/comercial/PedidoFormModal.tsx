import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { usePedidosStore } from '@/stores/comercial/pedidosStore';
import { useClientesStore } from '@/stores/admin/clientesStore';
import type { PedidoVenda } from '@/types/comercial/pedido.types';

interface PedidoFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pedido?: PedidoVenda | null;
}

export function PedidoFormModal({ open, onOpenChange, pedido }: PedidoFormModalProps) {
  const createPedido = usePedidosStore((s) => s.createPedido);
  const updatePedido = usePedidosStore((s) => s.updatePedido);
  const clientes = useClientesStore((s) => s.clientes);
  const fetchClientes = useClientesStore((s) => s.fetchClientes);

  const [formData, setFormData] = useState({ clienteId: 0, observacao: '' });
  const [clienteSearch, setClienteSearch] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [ready, setReady] = useState(false);

  const isEditing = !!pedido;

  useEffect(() => {
    if (!open) { setReady(false); return; }
    // Carrega clientes se não tem
    if (clientes.length === 0) fetchClientes();

    if (pedido) {
      setFormData({
        clienteId: pedido.clienteId ?? 0,
        observacao: pedido.observacao ?? '',
      });
      setClienteSearch(pedido.clienteNome ?? '');
    } else {
      setFormData({ clienteId: 0, observacao: '' });
      setClienteSearch('');
    }
    setErrors({});
    setReady(true);
  }, [open, pedido]);

  const clientesFiltrados = (clientes || []).filter((c) => {
    if (!clienteSearch) return true;
    const term = clienteSearch.toLowerCase();
    return (c.nome || '').toLowerCase().includes(term) || (c.cpfCnpj || '').toLowerCase().includes(term);
  }).slice(0, 10);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!formData.clienteId) e.clienteId = 'Selecione um cliente';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;

    const payload: any = { clienteId: formData.clienteId };
    if (formData.observacao.trim()) payload.observacao = formData.observacao.trim();

    setIsSubmitting(true);
    try {
      if (isEditing && pedido) {
        await updatePedido(pedido.id, payload);
      } else {
        await createPedido(payload);
      }
      onOpenChange(false);
    } catch {
      // erro tratado no store
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!ready) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Editar Pedido' : 'Novo Pedido de Venda'}</DialogTitle>
          <DialogDescription>
            {isEditing ? 'Atualize os dados do pedido (só em Orçamento)' : 'O código será gerado automaticamente'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Cliente *</Label>
            <Input
              placeholder="Buscar cliente..."
              value={clienteSearch}
              onChange={(e) => {
                setClienteSearch(e.target.value);
                if (!e.target.value) setFormData((prev) => ({ ...prev, clienteId: 0 }));
              }}
            />
            {errors.clienteId && <p className="text-sm text-destructive">{errors.clienteId}</p>}
            {clienteSearch && formData.clienteId === 0 && (
              <div className="max-h-40 overflow-y-auto rounded-lg border">
                {clientesFiltrados.length > 0 ? clientesFiltrados.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    className="w-full px-3 py-2 text-left text-sm hover:bg-muted/50 transition-colors"
                    onClick={() => {
                      setFormData((prev) => ({ ...prev, clienteId: c.id }));
                      setClienteSearch(c.nome || '');
                    }}
                  >
                    <span className="font-medium">{c.nome}</span>
                    {c.cpfCnpj && <span className="ml-2 text-muted-foreground">({c.cpfCnpj})</span>}
                  </button>
                )) : (
                  <p className="px-3 py-2 text-sm text-muted-foreground">Nenhum cliente encontrado</p>
                )}
              </div>
            )}
            {formData.clienteId > 0 && (
              <p className="text-xs text-muted-foreground">
                Cliente selecionado: {clienteSearch}
                <button type="button" className="ml-2 text-destructive hover:underline" onClick={() => { setFormData((prev) => ({ ...prev, clienteId: 0 })); setClienteSearch(''); }}>
                  Limpar
                </button>
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="observacao">Observação</Label>
            <Textarea
              id="observacao"
              value={formData.observacao}
              onChange={(e) => setFormData((prev) => ({ ...prev, observacao: e.target.value }))}
              rows={3}
              placeholder="Observações sobre o pedido..."
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>Cancelar</Button>
            <Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Salvando...' : isEditing ? 'Salvar' : 'Criar Pedido'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
