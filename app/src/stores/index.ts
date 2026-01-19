/**
 * stores/index.ts - Exports centralizados dos stores
 * 
 * Exporta todos os stores para facilitar imports.
 */

export { useAuthStore } from './authStore';
export { useFavoritesStore } from './favoritesStore';
export { usePageRightSidebarStore } from './pageRightSidebarStore';
export { useRecentsStore } from './recentsStore';
export { useRightSidebarStore } from './rightSidebarStore';
export { useSidebarStore } from './sidebarStore';
export { useTabsStore } from './tabsStore';
export { useThemeStore } from './themeStore';
export * from './useAppStore';
