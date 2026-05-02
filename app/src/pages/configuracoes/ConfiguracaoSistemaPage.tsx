/**
 * ConfiguracaoSistemaPage.tsx — Página de configurações do sistema
 *
 * Reúne ajustes gerais do ARJSYS em seções isoladas.
 * Atualmente: somente "Dados da Empresa" (ano de fundação).
 *
 * Endpoints consumidos (via store):
 *   GET /api/admin/ConfiguracaoEmpresa
 *   PUT /api/admin/ConfiguracaoEmpresa
 *
 * Comportamento da seção "Dados da Empresa":
 *   - Carrega config no mount
 *   - Salvar dispara PUT; se já houver NS, o backend retorna 400 e o toast mostra a mensagem
 *   - Indicador exibe "Configurado" quando configurado=true
 */

import { useEffect, useState } from 'react';
import { Settings } from 'lucide-react';
import { toast } from 'sonner';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useConfiguracaoEmpresaStore } from '@/stores/admin/configuracaoEmpresaStore';

const ANO_MIN = 1800;
const ANO_MAX = new Date().getFullYear();

export function ConfiguracaoSistemaPage() {
  const config = useConfiguracaoEmpresaStore((s) => s.config);
  const isLoading = useConfiguracaoEmpresaStore((s) => s.isLoading);
  const error = useConfiguracaoEmpresaStore((s) => s.error);
  const fetchConfig = useConfiguracaoEmpresaStore((s) => s.fetchConfig);
  const updateConfig = useConfiguracaoEmpresaStore((s) => s.updateConfig);

  const [anoFundacao, setAnoFundacao] = useState<string>('');
  const [salvando, setSalvando] = useState(false);

  // Carrega configuração no mount
  useEffect(() => {
    fetchConfig();
  }, [fetchConfig]);

  // Toasts de erro vindos do store
  useEffect(() => {
    if (error) toast.error(error);
  }, [error]);

  // Sincroniza input quando config chega ou muda
  useEffect(() => {
    if (config) setAnoFundacao(String(config.anoFundacao));
  }, [config]);

  const anoNum = Number(anoFundacao);
  const anoValido =
    Number.isInteger(anoNum) && anoNum >= ANO_MIN && anoNum <= ANO_MAX;
  const dirty = config
    ? anoNum !== config.anoFundacao
    : Boolean(anoFundacao);

  const handleSalvar = async () => {
    if (!anoValido) {
      toast.error(`Informe um ano entre ${ANO_MIN} e ${ANO_MAX}.`);
      return;
    }
    setSalvando(true);
    try {
      await updateConfig({ anoFundacao: anoNum });
      toast.success('Configuração salva');
    } catch {
      // erro já é exposto via store.error e toast.error é disparado pelo useEffect
    } finally {
      setSalvando(false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6">
      <header className="flex items-center gap-3">
        <Settings className="h-6 w-6 text-slate-500" />
        <div>
          <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
            Configurações do Sistema
          </h1>
          <p className="text-sm text-muted-foreground">
            Ajustes gerais que afetam o funcionamento do ARJSYS.
          </p>
        </div>
      </header>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-4">
            <div>
              <CardTitle>Dados da Empresa</CardTitle>
              <CardDescription>
                Informações usadas para gerar Números de Série e identificar a empresa.
              </CardDescription>
            </div>
            {config &&
              (config.configurado ? (
                <Badge className="bg-emerald-600 hover:bg-emerald-700">
                  Configurado
                </Badge>
              ) : (
                <Badge variant="destructive">Não configurado</Badge>
              ))}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2 max-w-xs">
            <Label htmlFor="anoFundacao">Ano de fundação</Label>
            <Input
              id="anoFundacao"
              type="number"
              min={ANO_MIN}
              max={ANO_MAX}
              value={anoFundacao}
              onChange={(e) => setAnoFundacao(e.target.value)}
              disabled={isLoading || salvando}
              className="bg-white dark:bg-slate-950"
            />
            <p className="text-xs text-muted-foreground">
              O ano só pode ser alterado enquanto não houver Número de Série emitido.
            </p>
          </div>

          <div className="flex justify-end">
            <Button
              onClick={handleSalvar}
              disabled={!anoValido || !dirty || isLoading || salvando}
            >
              {salvando ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
