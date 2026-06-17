/**
 * GridSkeleton.tsx - Placeholder de carregamento para grids.
 *
 * Combina duas pistas visuais pra nao passar sensacao de travado:
 *   - linhas cinza com brilho pulsante (animate-pulse), dando a forma do grid;
 *   - spinner girando + texto central, comunicando atividade em andamento.
 */
interface GridSkeletonProps {
  /** Numero de linhas do esqueleto. */
  rows?: number;
  /** Texto exibido ao lado do spinner. */
  label?: string;
}

export function GridSkeleton({ rows = 10, label = 'Carregando...' }: GridSkeletonProps) {
  return (
    <div className="relative h-full" role="status" aria-busy="true">
      {/* Linhas de fundo (forma do grid) */}
      <div className="flex h-full flex-col gap-2 p-3" aria-hidden="true">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="h-4 w-8 animate-pulse rounded bg-muted" />
            <div className="h-4 w-24 animate-pulse rounded bg-muted" />
            <div className="h-4 flex-1 animate-pulse rounded bg-muted" />
            <div className="h-4 w-12 animate-pulse rounded bg-muted" />
          </div>
        ))}
      </div>

      {/* Spinner central (movimento) */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="flex flex-col items-center gap-2 rounded-lg bg-background/70 px-5 py-4 shadow-sm backdrop-blur-sm">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <span className="text-sm text-muted-foreground">{label}</span>
        </div>
      </div>
    </div>
  );
}
