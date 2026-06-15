/**
 * cardViewStore.ts - Preferências de visualização dos cards de Produtos.
 *
 * É GLOBAL por usuário (não por aba): com/sem imagem, largura e altura do card,
 * e o modo de proporção. Persistido no localStorage com escopo de usuário, mesmo
 * padrão do themeStore. O modo lista/cards continua por aba (useTabState).
 *
 * Proporção:
 *   - 'livre'        largura e altura independentes
 *   - 'travada'      mantém a proporção do momento em que foi escolhida
 *   - 'a4-paisagem'  relação ~1,41 : 1 (folha A4 deitada)
 *   - 'a4-retrato'   relação ~1 : 1,41 (folha A4 em pé)
 * A4 é PROPORÇÃO (relação largura/altura), não tamanho.
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { userScopedStorage } from '@/lib/userScopedStorage';

export type ProporcaoCard = 'livre' | 'travada' | 'a4-paisagem' | 'a4-retrato';

/** Fator largura/altura da proporção A4 paisagem (~1,414). */
export const A4_FATOR = Math.SQRT2;

/**
 * Fator largura/altura do modo de proporção, ou null quando livre.
 * Fonte única usada tanto pelo painel (sliders) quanto pelo card (aspect-ratio).
 */
export function fatorProporcao(proporcao: ProporcaoCard, ratioTravado: number): number | null {
  switch (proporcao) {
    case 'a4-paisagem': return A4_FATOR;
    case 'a4-retrato': return 1 / A4_FATOR;
    case 'travada': return ratioTravado;
    default: return null;
  }
}

interface CardViewState {
  /** Mostrar miniatura no card (true) ou card compacto (false). */
  comImagem: boolean;
  /** Largura mínima do card no grid, em px. */
  cardWidth: number;
  /** Altura da área da miniatura, em px. */
  cardHeight: number;
  /** Modo de proporção entre largura e altura (modo COM imagem). */
  proporcao: ProporcaoCard;
  /** Proporção (largura/altura) capturada quando entra no modo 'travada'. */
  ratioTravado: number;

  /** Largura do card no modo SEM imagem, em px (independente do com imagem). */
  semImgWidth: number;
  /** Altura do card no modo SEM imagem, em px. */
  semImgHeight: number;
  /** Proporção do card SEM imagem travada (largura/altura acopladas). */
  semImgTravado: boolean;
  /** Proporção (largura/altura) capturada ao travar o card sem imagem. */
  semImgRatio: number;

  setComImagem: (v: boolean) => void;
  setCardWidth: (v: number) => void;
  setCardHeight: (v: number) => void;
  setProporcao: (v: ProporcaoCard) => void;
  setSemImgWidth: (v: number) => void;
  setSemImgHeight: (v: number) => void;
  setSemImgTravado: (v: boolean) => void;
  /** Volta tamanhos/proporção ao padrão, mantendo o modo (com/sem imagem) atual. */
  reset: () => void;
}

// Padrão de código: proporção A4 paisagem (280 / 1,414 ≈ 198).
const PADRAO = {
  comImagem: true,
  cardWidth: 280,
  cardHeight: 198,
  proporcao: 'a4-paisagem' as ProporcaoCard,
  ratioTravado: 280 / 198,
  semImgWidth: 240,
  semImgHeight: 110,
  semImgTravado: false,
  semImgRatio: 240 / 110,
};

export const useCardViewStore = create<CardViewState>()(
  persist(
    (set) => ({
      ...PADRAO,

      setComImagem: (comImagem) => set({ comImagem }),
      setCardWidth: (cardWidth) => set({ cardWidth }),
      setCardHeight: (cardHeight) => set({ cardHeight }),
      setProporcao: (proporcao) =>
        set((s) =>
          proporcao === 'travada'
            ? { proporcao, ratioTravado: s.cardWidth / s.cardHeight }
            : { proporcao },
        ),
      setSemImgWidth: (semImgWidth) => set({ semImgWidth }),
      setSemImgHeight: (semImgHeight) => set({ semImgHeight }),
      setSemImgTravado: (semImgTravado) =>
        set((s) =>
          semImgTravado
            ? { semImgTravado, semImgRatio: s.semImgWidth / s.semImgHeight }
            : { semImgTravado },
        ),
      // Reseta só o modo atual: com imagem reseta os valores da imagem; sem imagem
      // reseta os do card. O outro modo e o comImagem ficam intactos.
      reset: () => set((s) =>
        s.comImagem
          ? {
              cardWidth: PADRAO.cardWidth,
              cardHeight: PADRAO.cardHeight,
              proporcao: PADRAO.proporcao,
              ratioTravado: PADRAO.ratioTravado,
            }
          : {
              semImgWidth: PADRAO.semImgWidth,
              semImgHeight: PADRAO.semImgHeight,
              semImgTravado: PADRAO.semImgTravado,
              semImgRatio: PADRAO.semImgRatio,
            },
      ),
    }),
    {
      name: 'arjsys-card-view',
      storage: createJSONStorage(() => userScopedStorage),
    },
  ),
);
