// Componentes compartilhados — import centralizado
// import { DataGrid, CardGrid, PageShell, usePageMode } from '@/components/shared';

export { Tooltip, TooltipTrigger, TooltipContent } from './AppTooltip';
export { CardGrid } from './CardGrid';
export type { CardGridHandle, CardGridProps } from './CardGrid';
export { DataGrid } from './DataGrid';
export type { GridColumn, DataGridHandle, GridFilterType } from './DataGrid';
export { PageShell, usePageMode } from './PageShell';
export type { PageShellProps, PageMode, PageModeState } from './PageShell';
export { SearchBar, type SearchColumn } from './SearchBar';
