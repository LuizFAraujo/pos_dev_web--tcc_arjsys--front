/**
 * useFormTabNavigation.ts — Hook para navegação automática entre abas de formulário
 *
 * Funciona com Radix Tabs (shadcn) que desmonta conteúdo de abas inativas.
 *
 * Funcionalidades:
 *   1. Foca no primeiro campo focável ao montar
 *   2. Foca no primeiro campo focável ao trocar de aba
 *   3. Tab no último campo visível → troca para próxima aba, foca no primeiro campo
 *   4. Shift+Tab no primeiro campo visível → volta para aba anterior, foca no último campo
 *
 * Uso:
 *   const { activeTab, setActiveTab, formFieldsRef, handleFieldsKeyDown } = useFormTabNavigation({
 *     tabs: ['identificacao', 'contato', 'endereco'],
 *   });
 *
 *   <Tabs value={activeTab} onValueChange={setActiveTab}>
 *     <TabsList>...</TabsList>
 *     <TabsContent value="identificacao">
 *       <div ref={formFieldsRef} onKeyDown={handleFieldsKeyDown}>
 *         ...campos...
 *       </div>
 *     </TabsContent>
 *   </Tabs>
 *
 * O div wrapper com ref e onKeyDown vai DENTRO de cada TabsContent,
 * envolvendo os campos. Como o Radix só monta a aba ativa, o ref
 * sempre aponta para os campos visíveis.
 */

import { useState, useRef, useEffect, useCallback } from 'react';

/** Seletor CSS para elementos focáveis editáveis em formulários */
const FOCUSABLE =
  'input:not([disabled]):not([type="hidden"]):not([readonly]), ' +
  'textarea:not([disabled]):not([readonly]), ' +
  'select:not([disabled]), ' +
  '[tabindex]:not([tabindex="-1"]):not([disabled])';

interface UseFormTabNavigationOptions {
  /** Lista ordenada de IDs das abas (bater com os values do TabsTrigger/TabsContent) */
  tabs: string[];
  /** Aba inicial (default: primeira da lista) */
  defaultTab?: string;
  /**
   * Se `true` (default), foca no primeiro campo focável ao montar.
   * Se `false`, não foca em nada inicialmente — útil em modo edição
   * onde o usuário pode querer escolher qual campo editar.
   *
   * Em ambos os casos, trocar de aba via Tab/Shift+Tab continua focando
   * o primeiro/último campo da nova aba.
   */
  autoFocus?: boolean;
}

interface UseFormTabNavigationReturn {
  /** Aba ativa atual — usar como value do Tabs */
  activeTab: string;
  /** Setter da aba ativa — usar como onValueChange do Tabs */
  setActiveTab: (tab: string) => void;
  /** Ref para o div que envolve os campos da aba ativa */
  formFieldsRef: React.RefCallback<HTMLDivElement>;
  /** Handler de keydown para o div que envolve os campos */
  handleFieldsKeyDown: (e: React.KeyboardEvent<HTMLDivElement>) => void;
}

export function useFormTabNavigation({
  tabs,
  defaultTab,
  autoFocus = true,
}: UseFormTabNavigationOptions): UseFormTabNavigationReturn {
  const [activeTab, setActiveTabRaw] = useState(defaultTab || tabs[0]);
  const contentEl = useRef<HTMLDivElement | null>(null);

  // Controle de foco pendente: 'first' foca no primeiro campo, 'last' no último.
  // Inicial respeita autoFocus — null = não foca em nada ao montar.
  const pendingFocusRef = useRef<'first' | 'last' | null>(autoFocus ? 'first' : null);

  // ─── Focus helpers ────────────────────────────────────────────────────────

  const getFocusableFields = useCallback((): HTMLElement[] => {
    if (!contentEl.current) return [];
    return Array.from(contentEl.current.querySelectorAll<HTMLElement>(FOCUSABLE));
  }, []);

  const applyPendingFocus = useCallback(() => {
    const target = pendingFocusRef.current;
    if (!target) return;
    pendingFocusRef.current = null;

    // requestAnimationFrame garante que o Radix já montou o conteúdo
    requestAnimationFrame(() => {
      const fields = getFocusableFields();
      if (fields.length === 0) return;
      if (target === 'first') {
        fields[0].focus();
      } else {
        fields[fields.length - 1].focus();
      }
    });
  }, [getFocusableFields]);

  // Aplica foco quando aba muda
  useEffect(() => {
    applyPendingFocus();
  }, [activeTab, applyPendingFocus]);

  // ─── Ref callback — chamado quando o div monta/desmonta ───────────────────

  const formFieldsRef = useCallback((el: HTMLDivElement | null) => {
    contentEl.current = el;
    if (el && pendingFocusRef.current) {
      // O div acabou de montar — aplica foco
      applyPendingFocus();
    }
  }, [applyPendingFocus]);

  // ─── Setters ──────────────────────────────────────────────────────────────

  const setActiveTab = useCallback((tab: string) => {
    if (tab === activeTab) return;
    pendingFocusRef.current = 'first';
    setActiveTabRaw(tab);
  }, [activeTab]);

  // ─── KeyDown handler ──────────────────────────────────────────────────────

  const handleFieldsKeyDown = useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== 'Tab') return;

    const fields = getFocusableFields();
    if (fields.length === 0) return;

    const currentIdx = tabs.indexOf(activeTab);

    if (!e.shiftKey) {
      // Tab normal: se no último campo → próxima aba
      const last = fields[fields.length - 1];
      if (document.activeElement === last && currentIdx < tabs.length - 1) {
        e.preventDefault();
        pendingFocusRef.current = 'first';
        setActiveTabRaw(tabs[currentIdx + 1]);
      }
    } else {
      // Shift+Tab: se no primeiro campo → aba anterior
      const first = fields[0];
      if (document.activeElement === first && currentIdx > 0) {
        e.preventDefault();
        pendingFocusRef.current = 'last';
        setActiveTabRaw(tabs[currentIdx - 1]);
      }
    }
  }, [getFocusableFields, activeTab, tabs]);

  return {
    activeTab,
    setActiveTab,
    formFieldsRef,
    handleFieldsKeyDown,
  };
}
