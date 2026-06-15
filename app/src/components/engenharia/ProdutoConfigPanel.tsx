/**
 * ProdutoConfigPanel.tsx - Conteúdo do painel de Configurações da página de Produtos.
 *
 * Vai dentro do PagePanel (mesma sidebar do Filtros). Organizado em abas pra
 * separar assuntos e crescer no futuro:
 *   - "Visualização": ajustes dos cards (com/sem imagem, largura, altura, proporção, resetar)
 *   - "Geral": placeholder pra configurações futuras
 *
 * Lê e grava no cardViewStore (preferências globais por usuário).
 */

import { Image as ImageIcon, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useCardViewStore, fatorProporcao, type ProporcaoCard } from '@/stores/engenharia/cardViewStore';

// Limites dos sliders (passo de 10).
const W_MIN = 50;
const W_MAX = 460;
const H_MIN = 50;
const H_MAX = 340;
const STEP = 1;

// Altura aproximada do rodapé do card (código + descrição), pra estimar o tamanho do card.
const RODAPE = 70;

function clampStep(valor: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, Math.round(valor / STEP) * STEP));
}

const ceilStep = (v: number) => Math.ceil(v / STEP) * STEP;
const floorStep = (v: number) => Math.floor(v / STEP) * STEP;

/**
 * Faixa válida de largura/altura para um fator de proporção (null = livre).
 * Limita os sliders para que a proporção nunca seja violada: nenhum dos dois
 * pode passar do ponto em que o par sairia do próprio intervalo.
 */
function faixas(fator: number | null) {
  if (!fator) return { wMin: W_MIN, wMax: W_MAX, hMin: H_MIN, hMax: H_MAX };
  return {
    wMin: Math.max(W_MIN, ceilStep(H_MIN * fator)),
    wMax: Math.min(W_MAX, floorStep(H_MAX * fator)),
    hMin: Math.max(H_MIN, ceilStep(W_MIN / fator)),
    hMax: Math.min(H_MAX, floorStep(W_MAX / fator)),
  };
}

const PROPORCOES: { valor: ProporcaoCard; label: string }[] = [
  { valor: 'livre', label: 'Sem trava' },
  { valor: 'travada', label: 'Trava atual' },
  { valor: 'a4-paisagem', label: 'A4 paisagem' },
  { valor: 'a4-retrato', label: 'A4 retrato' },
];

/** Classe de um botão de proporção (ativo destacado). */
function botaoProporcao(ativo: boolean): string {
  return `rounded border px-2 py-1.5 text-xs transition-colors ${ativo
    ? 'bg-blue-600 border-blue-600 text-white'
    : 'border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:border-slate-400'
    }`;
}

export function ProdutoConfigPanel() {
  const comImagem = useCardViewStore((s) => s.comImagem);
  const cardWidth = useCardViewStore((s) => s.cardWidth);
  const cardHeight = useCardViewStore((s) => s.cardHeight);
  const proporcao = useCardViewStore((s) => s.proporcao);
  const ratioTravado = useCardViewStore((s) => s.ratioTravado);
  const setComImagem = useCardViewStore((s) => s.setComImagem);
  const setCardWidth = useCardViewStore((s) => s.setCardWidth);
  const setCardHeight = useCardViewStore((s) => s.setCardHeight);
  const setProporcao = useCardViewStore((s) => s.setProporcao);
  const reset = useCardViewStore((s) => s.reset);
  const semImgWidth = useCardViewStore((s) => s.semImgWidth);
  const semImgHeight = useCardViewStore((s) => s.semImgHeight);
  const semImgTravado = useCardViewStore((s) => s.semImgTravado);
  const semImgRatio = useCardViewStore((s) => s.semImgRatio);
  const setSemImgWidth = useCardViewStore((s) => s.setSemImgWidth);
  const setSemImgHeight = useCardViewStore((s) => s.setSemImgHeight);
  const setSemImgTravado = useCardViewStore((s) => s.setSemImgTravado);

  const fator = fatorProporcao(proporcao, ratioTravado);
  const fx = faixas(fator);
  const fxSem = faixas(semImgTravado ? semImgRatio : null);

  // Sliders do card sem imagem, com trava de proporção própria (sem A4).
  const onSemLargura = (v: number) => {
    setSemImgWidth(v);
    if (semImgTravado) setSemImgHeight(clampStep(v / semImgRatio, fxSem.hMin, fxSem.hMax));
  };
  const onSemAltura = (v: number) => {
    setSemImgHeight(v);
    if (semImgTravado) setSemImgWidth(clampStep(v * semImgRatio, fxSem.wMin, fxSem.wMax));
  };

  const onLargura = (v: number) => {
    setCardWidth(v);
    if (fator) setCardHeight(clampStep(v / fator, fx.hMin, fx.hMax));
  };

  const onAltura = (v: number) => {
    setCardHeight(v);
    if (fator) setCardWidth(clampStep(v * fator, fx.wMin, fx.wMax));
  };

  const escolherProporcao = (p: ProporcaoCard) => {
    setProporcao(p);
    // Ao fixar A4, encaixa largura/altura na faixa válida mais próxima.
    if (p === 'a4-paisagem' || p === 'a4-retrato') {
      const f = fatorProporcao(p, ratioTravado)!;
      const r = faixas(f);
      const w = Math.min(r.wMax, Math.max(r.wMin, cardWidth));
      setCardWidth(w);
      setCardHeight(clampStep(w / f, r.hMin, r.hMax));
    }
  };

  return (
    <Tabs defaultValue="visual" className="flex h-full flex-col">
      <TabsList className="w-full">
        <TabsTrigger value="visual" className="flex-1">Visualização</TabsTrigger>
        <TabsTrigger value="geral" className="flex-1">Geral</TabsTrigger>
      </TabsList>

      <TabsContent value="visual" className="flex-1 overflow-y-auto space-y-4 p-1">
        {/* Com / sem imagem */}
        <button
          type="button"
          onClick={() => setComImagem(!comImagem)}
          className={`inline-flex w-full items-center justify-center gap-2 rounded border px-3 py-2 text-sm transition-colors ${comImagem
            ? 'bg-blue-600 border-blue-600 text-white'
            : 'border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300'
            }`}
        >
          <ImageIcon className="h-4 w-4" />
          {comImagem ? 'Com imagem' : 'Sem imagem'}
        </button>

        {comImagem ? (
          <>
            <div className="flex items-center justify-between gap-2 text-[11px] text-muted-foreground">
              <span>Área da imagem (proporção)</span>
              <span>Card ≈ {cardWidth} × {cardHeight + RODAPE} px</span>
            </div>

            {/* Largura da área da imagem */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <label>LARGURA</label>
                <span>{cardWidth} px</span>
              </div>
              <input
                type="range" min={fx.wMin} max={fx.wMax} step={STEP} value={cardWidth}
                onChange={(e) => onLargura(+e.target.value)}
                className="w-full accent-sky-500"
              />
            </div>

            {/* Altura: arrastável só sem trava; em proporção fixa vira valor calculado */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <label>ALTURA</label>
                <span>{cardHeight} px{fator ? ' (proporção)' : ''}</span>
              </div>
              {!fator && (
                <input
                  type="range" min={fx.hMin} max={fx.hMax} step={STEP} value={cardHeight}
                  onChange={(e) => onAltura(+e.target.value)}
                  className="w-full accent-sky-500"
                />
              )}
            </div>

            {/* Proporção */}
            <div className="space-y-1.5">
              <label className="text-xs text-muted-foreground">PROPORÇÃO</label>
              <div className="grid grid-cols-2 gap-1.5">
                {PROPORCOES.map((p) => (
                  <button
                    key={p.valor}
                    type="button"
                    onClick={() => escolherProporcao(p.valor)}
                    className={botaoProporcao(proporcao === p.valor)}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
          </>
        ) : (
          <>
            <p className="text-[11px] text-muted-foreground">Tamanho do card</p>

            {/* Largura do card */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <label>LARGURA</label>
                <span>{semImgWidth} px</span>
              </div>
              <input
                type="range" min={fxSem.wMin} max={fxSem.wMax} step={STEP} value={semImgWidth}
                onChange={(e) => onSemLargura(+e.target.value)}
                className="w-full accent-sky-500"
              />
            </div>

            {/* Altura do card: arrastável só sem trava; travado vira valor calculado */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <label>ALTURA</label>
                <span>{semImgHeight} px{semImgTravado ? ' (proporção)' : ''}</span>
              </div>
              {!semImgTravado && (
                <input
                  type="range" min={fxSem.hMin} max={fxSem.hMax} step={STEP} value={semImgHeight}
                  onChange={(e) => onSemAltura(+e.target.value)}
                  className="w-full accent-sky-500"
                />
              )}
            </div>

            {/* Trava de proporção do card (sem A4) */}
            <div className="space-y-1.5">
              <label className="text-xs text-muted-foreground">PROPORÇÃO</label>
              <div className="grid grid-cols-2 gap-1.5">
                <button type="button" onClick={() => setSemImgTravado(false)} className={botaoProporcao(!semImgTravado)}>
                  Sem trava
                </button>
                <button type="button" onClick={() => setSemImgTravado(true)} className={botaoProporcao(semImgTravado)}>
                  Trava atual
                </button>
              </div>
            </div>
          </>
        )}

        {/* Resetar */}
        <Button variant="outline" size="sm" className="w-full gap-2" onClick={reset}>
          <RotateCcw className="h-3.5 w-3.5" />
          Resetar padrão
        </Button>
      </TabsContent>

      <TabsContent value="geral" className="flex-1 overflow-y-auto p-1">
        <p className="p-4 text-center text-sm text-muted-foreground">
          Em breve.
        </p>
      </TabsContent>
    </Tabs>
  );
}
