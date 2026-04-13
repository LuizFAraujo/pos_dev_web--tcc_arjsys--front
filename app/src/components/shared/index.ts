// Componentes compartilhados — import centralizado
// import { DataGrid, CardGrid, PageShell, usePageMode, PageActions } from '@/components/shared';

export { Tooltip, TooltipTrigger, TooltipContent } from './AppTooltip';
export { CardGrid } from './CardGrid';
export type { CardGridHandle, CardGridProps } from './CardGrid';
export { DataGrid } from './DataGrid';
export type { GridColumn, DataGridHandle, GridFilterType } from './DataGrid';
export { ListFooter } from './ListFooter';
export { PageShell, usePageMode, PageActions } from './PageShell';
export type { PageShellProps, PageMode, PageModeState, PageActionsProps } from './PageShell';
export { SearchBar, type SearchColumn } from './SearchBar';
