import { ArrowUpDown, ArrowUp, ArrowDown, Filter, FilterX } from 'lucide-react';
import { useBOMFlatState, type SortField } from '@/hooks/useBOMFlatState';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ScrollArea } from '@/components/ui/scroll-area';

interface BOMFlatViewProps {
  clearFiltersFlag: number;
  onOpenPai?: (codigoPai: string) => void;
  selectedPai?: string;
}

function formatQtde(q: number) {
  return q.toLocaleString('pt-BR', { minimumFractionDigits: 3, maximumFractionDigits: 3 });
}

export function BOMFlatView(props: BOMFlatViewProps) {
  const {
    colWidths,
    filters,
    setFilters,
    sortField,
    sortOrder,
    selectedIndex,
    rows,
    handleMouseDown,
    handleSort,
    totalWidth,
  } = useBOMFlatState(props);

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return <ArrowUpDown className="h-3 w-3" />;
    return sortOrder === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />;
  };

  const temFiltroAtivo = (tipo: string) => {
    switch (tipo) {
      case 'codigoPai':
        return !!(filters.codigoPaiExpressao || filters.codigoPaiContem || filters.codigoPaiComeca || filters.codigoPaiNaoComeca || filters.codigoPaiTermina || filters.codigoPaiNaoTermina || filters.codigoPaiNaoContem);
      case 'descPai':
        return !!(filters.descPaiExpressao || filters.descPaiContem || filters.descPaiComeca || filters.descPaiNaoComeca || filters.descPaiTermina || filters.descPaiNaoTermina || filters.descPaiNaoContem);
      case 'qtde':
        return !!filters.qtdeMin || !!filters.qtdeMax;
      case 'codigoFilho':
        return !!(filters.codigoFilhoExpressao || filters.codigoFilhoContem || filters.codigoFilhoComeca || filters.codigoFilhoNaoComeca || filters.codigoFilhoTermina || filters.codigoFilhoNaoTermina || filters.codigoFilhoNaoContem);
      case 'descFilho':
        return !!(filters.descFilhoExpressao || filters.descFilhoContem || filters.descFilhoComeca || filters.descFilhoNaoComeca || filters.descFilhoTermina || filters.descFilhoNaoTermina || filters.descFilhoNaoContem);
      case 'unidade':
        return !!filters.unidade;
      case 'desenho':
        return filters.somenteComDesenho || filters.somenteSemDesenho;
      default:
        return false;
    }
  };

  return (
    <div className="flex h-full flex-col overflow-hidden font-mono text-[12px]">
      <div className="flex-1 overflow-auto">
        <table className="w-full border-collapse" style={{ tableLayout: 'fixed', width: `${totalWidth}px` }}>
          <thead className="sticky top-0 z-10 bg-slate-600 text-[11px] font-semibold uppercase text-white">
            <tr>
              {/* DESCRIÇÃO PAI - 1ª */}
              <th style={{ width: `${colWidths.descPai}px` }} className="relative h-8.5 overflow-hidden whitespace-nowrap border-b-2 border-r border-slate-300 px-2 py-2">
                <div className="flex items-center justify-between gap-1">
                  <button className="flex items-center gap-1 hover:text-slate-200" onClick={() => handleSort('descPai')}>
                    {getSortIcon('descPai')}<span>Descrição Pai</span>
                  </button>

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Popover>
                          <PopoverTrigger asChild>
                            <button className="hover:text-slate-200">{temFiltroAtivo('descPai') ? <FilterX className="h-3 w-3 text-yellow-300" /> : <Filter className="h-3 w-3" />}</button>
                          </PopoverTrigger>

                          <PopoverContent className="w-80">
                            <ScrollArea className="h-100">
                              <div className="space-y-2 pr-4">
                                <div className="flex items-center justify-between">
                                  <p className="text-sm font-semibold">Filtrar Descrição Pai</p>
                                  {temFiltroAtivo('descPai') && (
                                    <Button variant="ghost" size="sm" onClick={() => setFilters((f) => ({ ...f, descPaiExpressao: '', descPaiContem: '', descPaiComeca: '', descPaiNaoComeca: '', descPaiTermina: '', descPaiNaoTermina: '', descPaiNaoContem: '' }))} className="h-6 px-2 text-[11px]">
                                      Limpar
                                    </Button>
                                  )}
                                </div>

                                <div>
                                  <Label className="text-xs">Expressão (use * como coringa)</Label>
                                  <Input placeholder="KIT*MOTOR" value={filters.descPaiExpressao} onChange={(e) => setFilters((f) => ({ ...f, descPaiExpressao: e.target.value }))} />
                                </div>
                                <div>
                                  <Label className="text-xs">Contém</Label>
                                  <Input value={filters.descPaiContem} onChange={(e) => setFilters((f) => ({ ...f, descPaiContem: e.target.value }))} />
                                </div>
                                <div>
                                  <Label className="text-xs">Começa com</Label>
                                  <Input value={filters.descPaiComeca} onChange={(e) => setFilters((f) => ({ ...f, descPaiComeca: e.target.value }))} />
                                </div>
                                <div>
                                  <Label className="text-xs">Não começa com</Label>
                                  <Input value={filters.descPaiNaoComeca} onChange={(e) => setFilters((f) => ({ ...f, descPaiNaoComeca: e.target.value }))} />
                                </div>
                                <div>
                                  <Label className="text-xs">Termina com</Label>
                                  <Input value={filters.descPaiTermina} onChange={(e) => setFilters((f) => ({ ...f, descPaiTermina: e.target.value }))} />
                                </div>
                                <div>
                                  <Label className="text-xs">Não termina com</Label>
                                  <Input value={filters.descPaiNaoTermina} onChange={(e) => setFilters((f) => ({ ...f, descPaiNaoTermina: e.target.value }))} />
                                </div>
                                <div>
                                  <Label className="text-xs">Não contém</Label>
                                  <Input value={filters.descPaiNaoContem} onChange={(e) => setFilters((f) => ({ ...f, descPaiNaoContem: e.target.value }))} />
                                </div>
                              </div>
                            </ScrollArea>
                          </PopoverContent>
                        </Popover>
                      </TooltipTrigger>
                      <TooltipContent>Filtrar</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>

                <div className="absolute right-0 top-0 h-full w-1 cursor-col-resize hover:bg-slate-400" onMouseDown={(e) => handleMouseDown('descPai', e)} />
              </th>

              {/* CÓDIGO PAI - 2ª */}
              <th style={{ width: `${colWidths.codigoPai}px` }} className="relative h-8.5 overflow-hidden whitespace-nowrap border-b-2 border-r border-slate-300 px-2 py-2">
                <div className="flex items-center justify-between gap-1">
                  <button className="flex items-center gap-1 hover:text-slate-200" onClick={() => handleSort('codigoPai')}>
                    {getSortIcon('codigoPai')}<span>Código Pai</span>
                  </button>

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Popover>
                          <PopoverTrigger asChild>
                            <button className="hover:text-slate-200">{temFiltroAtivo('codigoPai') ? <FilterX className="h-3 w-3 text-yellow-300" /> : <Filter className="h-3 w-3" />}</button>
                          </PopoverTrigger>

                          <PopoverContent className="w-80">
                            <ScrollArea className="h-100">
                              <div className="space-y-2 pr-4">
                                <div className="flex items-center justify-between">
                                  <p className="text-sm font-semibold">Filtrar Código Pai</p>
                                  {temFiltroAtivo('codigoPai') && (
                                    <Button variant="ghost" size="sm" onClick={() => setFilters((f) => ({ ...f, codigoPaiExpressao: '', codigoPaiContem: '', codigoPaiComeca: '', codigoPaiNaoComeca: '', codigoPaiTermina: '', codigoPaiNaoTermina: '', codigoPaiNaoContem: '' }))} className="h-6 px-2 text-[11px]">
                                      Limpar
                                    </Button>
                                  )}
                                </div>

                                <div>
                                  <Label className="text-xs">Expressão</Label>
                                  <Input placeholder="10.*.GM07" value={filters.codigoPaiExpressao} onChange={(e) => setFilters((f) => ({ ...f, codigoPaiExpressao: e.target.value }))} />
                                </div>
                                <div>
                                  <Label className="text-xs">Contém</Label>
                                  <Input value={filters.codigoPaiContem} onChange={(e) => setFilters((f) => ({ ...f, codigoPaiContem: e.target.value }))} />
                                </div>
                                <div>
                                  <Label className="text-xs">Começa com</Label>
                                  <Input value={filters.codigoPaiComeca} onChange={(e) => setFilters((f) => ({ ...f, codigoPaiComeca: e.target.value }))} />
                                </div>
                                <div>
                                  <Label className="text-xs">Não começa com</Label>
                                  <Input value={filters.codigoPaiNaoComeca} onChange={(e) => setFilters((f) => ({ ...f, codigoPaiNaoComeca: e.target.value }))} />
                                </div>
                                <div>
                                  <Label className="text-xs">Termina com</Label>
                                  <Input value={filters.codigoPaiTermina} onChange={(e) => setFilters((f) => ({ ...f, codigoPaiTermina: e.target.value }))} />
                                </div>
                                <div>
                                  <Label className="text-xs">Não termina com</Label>
                                  <Input value={filters.codigoPaiNaoTermina} onChange={(e) => setFilters((f) => ({ ...f, codigoPaiNaoTermina: e.target.value }))} />
                                </div>
                                <div>
                                  <Label className="text-xs">Não contém</Label>
                                  <Input value={filters.codigoPaiNaoContem} onChange={(e) => setFilters((f) => ({ ...f, codigoPaiNaoContem: e.target.value }))} />
                                </div>
                              </div>
                            </ScrollArea>
                          </PopoverContent>
                        </Popover>
                      </TooltipTrigger>
                      <TooltipContent>Filtrar</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>

                <div className="absolute right-0 top-0 h-full w-1 cursor-col-resize hover:bg-slate-400" onMouseDown={(e) => handleMouseDown('codigoPai', e)} />
              </th>

              {/* QTDE - 3ª */}
              <th style={{ width: `${colWidths.qtde}px` }} className="relative h-8.5 overflow-hidden whitespace-nowrap border-b-2 border-r border-slate-300 px-2 py-2">
                <div className="flex items-center justify-between gap-1">
                  <button className="flex items-center gap-1 hover:text-slate-200" onClick={() => handleSort('qtde')}>
                    {getSortIcon('qtde')}<span>Qtde</span>
                  </button>

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Popover>
                          <PopoverTrigger asChild>
                            <button className="hover:text-slate-200">{temFiltroAtivo('qtde') ? <FilterX className="h-3 w-3 text-yellow-300" /> : <Filter className="h-3 w-3" />}</button>
                          </PopoverTrigger>

                          <PopoverContent className="w-64">
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <p className="text-sm font-semibold">Filtrar quantidade</p>
                                {(filters.qtdeMin || filters.qtdeMax) && (
                                  <Button variant="ghost" size="sm" onClick={() => setFilters((f) => ({ ...f, qtdeMin: '', qtdeMax: '' }))} className="h-6 px-2 text-[11px]">
                                    Limpar
                                  </Button>
                                )}
                              </div>

                              <div className="grid grid-cols-2 gap-2">
                                <div>
                                  <Label className="text-xs">Mín</Label>
                                  <Input type="number" step="0.001" placeholder="0.000" value={filters.qtdeMin} onChange={(e) => setFilters((f) => ({ ...f, qtdeMin: e.target.value }))} />
                                </div>
                                <div>
                                  <Label className="text-xs">Máx</Label>
                                  <Input type="number" step="0.001" placeholder="999.999" value={filters.qtdeMax} onChange={(e) => setFilters((f) => ({ ...f, qtdeMax: e.target.value }))} />
                                </div>
                              </div>
                            </div>
                          </PopoverContent>
                        </Popover>
                      </TooltipTrigger>
                      <TooltipContent>Filtrar</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>

                <div className="absolute right-0 top-0 h-full w-1 cursor-col-resize hover:bg-slate-400" onMouseDown={(e) => handleMouseDown('qtde', e)} />
              </th>

              {/* COMPONENTE - 4ª */}
              <th style={{ width: `${colWidths.codigoFilho}px` }} className="relative h-8.5 overflow-hidden whitespace-nowrap border-b-2 border-r border-slate-300 px-2 py-2">
                <div className="flex items-center justify-between gap-1">
                  <button className="flex items-center gap-1 hover:text-slate-200" onClick={() => handleSort('codigoFilho')}>
                    {getSortIcon('codigoFilho')}<span>Componente</span>
                  </button>

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Popover>
                          <PopoverTrigger asChild>
                            <button className="hover:text-slate-200">{temFiltroAtivo('codigoFilho') ? <FilterX className="h-3 w-3 text-yellow-300" /> : <Filter className="h-3 w-3" />}</button>
                          </PopoverTrigger>

                          <PopoverContent className="w-80">
                            <ScrollArea className="h-100">
                              <div className="space-y-2 pr-4">
                                <div className="flex items-center justify-between">
                                  <p className="text-sm font-semibold">Filtrar Componente</p>
                                  {temFiltroAtivo('codigoFilho') && (
                                    <Button variant="ghost" size="sm" onClick={() => setFilters((f) => ({ ...f, codigoFilhoExpressao: '', codigoFilhoContem: '', codigoFilhoComeca: '', codigoFilhoNaoComeca: '', codigoFilhoTermina: '', codigoFilhoNaoTermina: '', codigoFilhoNaoContem: '' }))} className="h-6 px-2 text-[11px]">
                                      Limpar
                                    </Button>
                                  )}
                                </div>

                                <div>
                                  <Label className="text-xs">Expressão</Label>
                                  <Input placeholder="30.*.DIV" value={filters.codigoFilhoExpressao} onChange={(e) => setFilters((f) => ({ ...f, codigoFilhoExpressao: e.target.value }))} />
                                </div>
                                <div>
                                  <Label className="text-xs">Contém</Label>
                                  <Input value={filters.codigoFilhoContem} onChange={(e) => setFilters((f) => ({ ...f, codigoFilhoContem: e.target.value }))} />
                                </div>
                                <div>
                                  <Label className="text-xs">Começa com</Label>
                                  <Input value={filters.codigoFilhoComeca} onChange={(e) => setFilters((f) => ({ ...f, codigoFilhoComeca: e.target.value }))} />
                                </div>
                                <div>
                                  <Label className="text-xs">Não começa com</Label>
                                  <Input value={filters.codigoFilhoNaoComeca} onChange={(e) => setFilters((f) => ({ ...f, codigoFilhoNaoComeca: e.target.value }))} />
                                </div>
                                <div>
                                  <Label className="text-xs">Termina com</Label>
                                  <Input value={filters.codigoFilhoTermina} onChange={(e) => setFilters((f) => ({ ...f, codigoFilhoTermina: e.target.value }))} />
                                </div>
                                <div>
                                  <Label className="text-xs">Não termina com</Label>
                                  <Input value={filters.codigoFilhoNaoTermina} onChange={(e) => setFilters((f) => ({ ...f, codigoFilhoNaoTermina: e.target.value }))} />
                                </div>
                                <div>
                                  <Label className="text-xs">Não contém</Label>
                                  <Input value={filters.codigoFilhoNaoContem} onChange={(e) => setFilters((f) => ({ ...f, codigoFilhoNaoContem: e.target.value }))} />
                                </div>
                              </div>
                            </ScrollArea>
                          </PopoverContent>
                        </Popover>
                      </TooltipTrigger>
                      <TooltipContent>Filtrar</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>

                <div className="absolute right-0 top-0 h-full w-1 cursor-col-resize hover:bg-slate-400" onMouseDown={(e) => handleMouseDown('codigoFilho', e)} />
              </th>

              {/* DESCRIÇÃO COMPONENTE - 5ª */}
              <th style={{ width: `${colWidths.descFilho}px` }} className="relative h-8.5 overflow-hidden whitespace-nowrap border-b-2 border-r border-slate-300 px-2 py-2">
                <div className="flex items-center justify-between gap-1">
                  <button className="flex items-center gap-1 hover:text-slate-200" onClick={() => handleSort('descFilho')}>
                    {getSortIcon('descFilho')}<span>Descrição Componente</span>
                  </button>

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Popover>
                          <PopoverTrigger asChild>
                            <button className="hover:text-slate-200">{temFiltroAtivo('descFilho') ? <FilterX className="h-3 w-3 text-yellow-300" /> : <Filter className="h-3 w-3" />}</button>
                          </PopoverTrigger>

                          <PopoverContent className="w-80">
                            <ScrollArea className="h-100">
                              <div className="space-y-2 pr-4">
                                <div className="flex items-center justify-between">
                                  <p className="text-sm font-semibold">Filtrar Descrição Componente</p>
                                  {temFiltroAtivo('descFilho') && (
                                    <Button variant="ghost" size="sm" onClick={() => setFilters((f) => ({ ...f, descFilhoExpressao: '', descFilhoContem: '', descFilhoComeca: '', descFilhoNaoComeca: '', descFilhoTermina: '', descFilhoNaoTermina: '', descFilhoNaoContem: '' }))} className="h-6 px-2 text-[11px]">
                                      Limpar
                                    </Button>
                                  )}
                                </div>

                                <div>
                                  <Label className="text-xs">Expressão</Label>
                                  <Input placeholder="DIVISOR*" value={filters.descFilhoExpressao} onChange={(e) => setFilters((f) => ({ ...f, descFilhoExpressao: e.target.value }))} />
                                </div>
                                <div>
                                  <Label className="text-xs">Contém</Label>
                                  <Input value={filters.descFilhoContem} onChange={(e) => setFilters((f) => ({ ...f, descFilhoContem: e.target.value }))} />
                                </div>
                                <div>
                                  <Label className="text-xs">Começa com</Label>
                                  <Input value={filters.descFilhoComeca} onChange={(e) => setFilters((f) => ({ ...f, descFilhoComeca: e.target.value }))} />
                                </div>
                                <div>
                                  <Label className="text-xs">Não começa com</Label>
                                  <Input value={filters.descFilhoNaoComeca} onChange={(e) => setFilters((f) => ({ ...f, descFilhoNaoComeca: e.target.value }))} />
                                </div>
                                <div>
                                  <Label className="text-xs">Termina com</Label>
                                  <Input value={filters.descFilhoTermina} onChange={(e) => setFilters((f) => ({ ...f, descFilhoTermina: e.target.value }))} />
                                </div>
                                <div>
                                  <Label className="text-xs">Não termina com</Label>
                                  <Input value={filters.descFilhoNaoTermina} onChange={(e) => setFilters((f) => ({ ...f, descFilhoNaoTermina: e.target.value }))} />
                                </div>
                                <div>
                                  <Label className="text-xs">Não contém</Label>
                                  <Input value={filters.descFilhoNaoContem} onChange={(e) => setFilters((f) => ({ ...f, descFilhoNaoContem: e.target.value }))} />
                                </div>
                              </div>
                            </ScrollArea>
                          </PopoverContent>
                        </Popover>
                      </TooltipTrigger>
                      <TooltipContent>Filtrar</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>

                <div className="absolute right-0 top-0 h-full w-1 cursor-col-resize hover:bg-slate-400" onMouseDown={(e) => handleMouseDown('descFilho', e)} />
              </th>

              {/* UNIDADE - 6ª */}
              <th style={{ width: `${colWidths.unidade}px` }} className="relative h-8.5 overflow-hidden whitespace-nowrap border-b-2 border-r border-slate-300 px-2 py-2">
                <div className="flex items-center justify-between gap-1">
                  <button className="flex items-center gap-1 hover:text-slate-200" onClick={() => handleSort('unidade')}>
                    {getSortIcon('unidade')}<span>Unid.</span>
                  </button>

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Popover>
                          <PopoverTrigger asChild>
                            <button className="hover:text-slate-200">{temFiltroAtivo('unidade') ? <FilterX className="h-3 w-3 text-yellow-300" /> : <Filter className="h-3 w-3" />}</button>
                          </PopoverTrigger>

                          <PopoverContent className="w-48">
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <p className="text-sm font-semibold">Filtrar unidade</p>
                                {filters.unidade && (
                                  <Button variant="ghost" size="sm" onClick={() => setFilters((f) => ({ ...f, unidade: '' }))} className="h-6 px-2 text-[11px]">
                                    Limpar
                                  </Button>
                                )}
                              </div>

                              <div>
                                <Label className="text-xs">Unidade (exata)</Label>
                                <Input placeholder="PC" value={filters.unidade} onChange={(e) => setFilters((f) => ({ ...f, unidade: e.target.value }))} />
                              </div>
                            </div>
                          </PopoverContent>
                        </Popover>
                      </TooltipTrigger>
                      <TooltipContent>Filtrar</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>

                <div className="absolute right-0 top-0 h-full w-1 cursor-col-resize hover:bg-slate-400" onMouseDown={(e) => handleMouseDown('unidade', e)} />
              </th>

              {/* DESENHO - 7ª */}
              <th style={{ width: `${colWidths.desenho}px` }} className="relative h-8.5 overflow-hidden whitespace-nowrap border-b-2 border-slate-300 px-2 py-2">
                <div className="flex items-center justify-between gap-1">
                  <span>Des.</span>

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Popover>
                          <PopoverTrigger asChild>
                            <button className="hover:text-slate-200">{temFiltroAtivo('desenho') ? <FilterX className="h-3 w-3 text-yellow-300" /> : <Filter className="h-3 w-3" />}</button>
                          </PopoverTrigger>

                          <PopoverContent className="w-64">
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <p className="text-sm font-semibold">Filtrar desenho</p>
                                {temFiltroAtivo('desenho') && (
                                  <Button variant="ghost" size="sm" onClick={() => setFilters((f) => ({ ...f, somenteComDesenho: false, somenteSemDesenho: false }))} className="h-6 px-2 text-[11px]">
                                    Limpar
                                  </Button>
                                )}
                              </div>

                              <RadioGroup value={filters.somenteComDesenho ? 'comDesenho' : filters.somenteSemDesenho ? 'semDesenho' : 'todos'} onValueChange={(v) => {
                                if (v === 'todos') setFilters((f) => ({ ...f, somenteComDesenho: false, somenteSemDesenho: false }));
                                else if (v === 'comDesenho') setFilters((f) => ({ ...f, somenteComDesenho: true, somenteSemDesenho: false }));
                                else if (v === 'semDesenho') setFilters((f) => ({ ...f, somenteComDesenho: false, somenteSemDesenho: true }));
                              }}>
                                <div className="flex items-center space-x-2"><RadioGroupItem value="todos" id="todos" /><Label htmlFor="todos" className="text-sm">Todos</Label></div>
                                <div className="flex items-center space-x-2"><RadioGroupItem value="comDesenho" id="comDesenho" /><Label htmlFor="comDesenho" className="text-sm">Com desenho</Label></div>
                                <div className="flex items-center space-x-2"><RadioGroupItem value="semDesenho" id="semDesenho" /><Label htmlFor="semDesenho" className="text-sm">Sem desenho</Label></div>
                              </RadioGroup>
                            </div>
                          </PopoverContent>
                        </Popover>
                      </TooltipTrigger>
                      <TooltipContent>Filtrar</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>

                <div className="absolute right-0 top-0 h-full w-1 cursor-col-resize hover:bg-slate-400" onMouseDown={(e) => handleMouseDown('desenho', e)} />
              </th>
            </tr>
          </thead>

          <tbody>
            {rows.map((r, i) => {
              const selected = i === selectedIndex;
              const zebra = i % 2 === 0 ? 'bg-white' : 'bg-slate-50';

              return (
                <tr
                  key={`${r.codigoPai}__${r.codigoFilho}__${r.ordem ?? ''}__${i}`}
                  className={['border-b border-slate-200', zebra, selected ? 'bg-sky-200' : 'hover:bg-slate-100'].join(' ')}
                  onDoubleClick={() => props.onOpenPai?.(r.codigoPai)}
                >
                  <td className="truncate px-2 py-1 font-semibold uppercase text-slate-800" title={r.descPai}>{r.descPai}</td>
                  <td className="truncate px-2 py-1 text-center font-mono font-semibold text-blue-900" title={r.codigoPai}>{r.codigoPai}</td>
                  <td className="px-2 py-1 text-right font-bold text-emerald-700">{formatQtde(r.qtde)}</td>
                  <td className="truncate px-2 py-1 text-center font-mono text-blue-900" title={r.codigoFilho}>{r.codigoFilho}</td>
                  <td className="truncate px-2 py-1 font-semibold uppercase text-slate-800" title={r.descFilho}>{r.descFilho}</td>
                  <td className="px-2 py-1 text-center text-slate-600">{r.unidade}</td>
                  <td className="px-2 py-1 text-center">{r.possuiDesenho ? 'S' : '-'}</td>
                </tr>
              );
            })}

            {!rows.length && (
              <tr>
                <td className="px-3 py-6 text-center text-muted-foreground" colSpan={7}>Nenhuma relação encontrada</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="border-t bg-muted/40 px-4 py-2 text-xs text-muted-foreground">
        <span>↑ ↓ para navegar</span>
        <span className="mx-2">•</span>
        <span>Enter ou duplo clique para abrir estrutura</span>
        <span className="mx-2">•</span>
        <span>{rows.length} {rows.length === 1 ? 'relação' : 'relações'}</span>
      </div>
    </div>
  );
}
