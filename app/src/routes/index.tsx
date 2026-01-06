import { createFileRoute } from "@tanstack/react-router";
import { useAppStore } from "@stores";
import { Button } from "@ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@ui/card";
import { Input } from "@ui/input";
import { Plus, Minus, RotateCcw, Search, Sparkles } from "lucide-react";

export const Route = createFileRoute("/")({
  component: Home,
});

// ========================================
// COMPONENTE PRINCIPAL
// ========================================

function Home() {
  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-slate-100 flex items-center justify-center p-3">
      <Card className="w-full max-w-6xl shadow-2xl border-slate-200/60 backdrop-blur-sm bg-white/95">
        <PageHeader />
        
        <CardContent className="p-4 pb-5">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Coluna Esquerda */}
            <div className="space-y-4">
              <SearchInput />
              <ButtonVariants />
            </div>
            
            {/* Coluna Direita */}
            <div className="space-y-4">
              <ButtonSizes />
              <CounterSection />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ========================================
// SUBCOMPONENTES
// ========================================

function PageHeader() {
  return (
    <CardHeader className="text-center space-y-3 py-5 bg-linear-to-br from-slate-50 to-white border-b">
      <div className="flex items-center justify-center gap-3">
        <div className="w-11 h-11 bg-linear-to-br from-slate-700 to-slate-900 rounded-xl flex items-center justify-center shadow-lg">
          <Sparkles className="w-6 h-6 text-white" />
        </div>
        <CardTitle className="text-4xl font-bold bg-linear-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
          ArjSys
        </CardTitle>
      </div>
      <CardDescription className="text-base text-slate-700 font-medium">
        Sistema de Gerenciamento de Projetos Mecânicos
      </CardDescription>
      <CardDescription className="text-sm text-slate-500 font-mono bg-slate-100 px-4 py-1.5 rounded-full inline-block">
        Vite + React 19 + Tailwind 4 + TanStack Router + Zustand + Shadcn UI
      </CardDescription>
    </CardHeader>
  );
}

function SectionTitle({ color, children }: { color: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 mb-2">
      <div className={`w-1 h-4 ${color} rounded-full`} />
      <h3 className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
        {children}
      </h3>
    </div>
  );
}

function SearchInput() {
  return (
    <div>
      <SectionTitle color="bg-linear-to-b from-slate-600 to-slate-400">
        Campo de Busca
      </SectionTitle>
      <div className="relative group">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-slate-700 transition-colors" />
        <Input
          type="text"
          placeholder="Digite algo aqui..."
          className="pl-10 h-9 text-sm border-slate-300 focus:border-slate-600 focus:ring-2 focus:ring-slate-600/20 bg-white transition-all"
        />
      </div>
    </div>
  );
}

function ButtonVariants() {
  return (
    <div>
      <SectionTitle color="bg-linear-to-b from-blue-600 to-blue-400">
        Variantes de Botão
      </SectionTitle>
      <div className="grid grid-cols-2 gap-2">
        <Button className="h-9 font-medium text-xs shadow-md hover:shadow-xl hover:scale-[1.02] transition-all hover:bg-slate-900">
          Default
        </Button>
        <Button 
          variant="secondary" 
          className="h-9 font-medium text-xs hover:bg-slate-300 hover:shadow-md hover:scale-[1.02] transition-all"
        >
          Secondary
        </Button>
        <Button 
          variant="outline" 
          className="h-9 font-medium text-xs border-2 hover:bg-slate-100 hover:border-slate-400 hover:shadow-md hover:scale-[1.02] transition-all"
        >
          Outline
        </Button>
        <Button 
          variant="destructive" 
          className="h-9 font-medium text-xs shadow-md hover:shadow-xl hover:scale-[1.02] hover:bg-red-700 transition-all"
        >
          Destructive
        </Button>
        <Button 
          variant="ghost" 
          className="h-9 font-medium text-xs hover:bg-slate-200 hover:shadow-sm hover:scale-[1.02] transition-all"
        >
          Ghost
        </Button>
        <Button 
          variant="link" 
          className="h-9 font-medium text-xs hover:underline-offset-4 hover:scale-[1.02] transition-all"
        >
          Link
        </Button>
      </div>
    </div>
  );
}

function ButtonSizes() {
  return (
    <div>
      <SectionTitle color="bg-linear-to-b from-purple-600 to-purple-400">
        Tamanhos
      </SectionTitle>
      <div className="flex gap-2 items-center justify-center flex-wrap">
        <Button 
          size="sm" 
          className="shadow-sm text-xs hover:shadow-lg hover:scale-105 hover:bg-slate-900 transition-all"
        >
          Small
        </Button>
        <Button 
          size="default" 
          className="shadow-sm text-xs hover:shadow-lg hover:scale-105 hover:bg-slate-900 transition-all"
        >
          Default
        </Button>
        <Button 
          size="lg" 
          className="shadow-md text-sm hover:shadow-xl hover:scale-105 hover:bg-slate-900 transition-all"
        >
          Large
        </Button>
        <Button 
          size="icon" 
          variant="outline" 
          className="border-2 h-9 w-9 hover:bg-slate-100 hover:border-slate-400 hover:shadow-md hover:scale-105 transition-all"
        >
          <Search className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

function CounterSection() {
  const { count, increment, decrement, reset } = useAppStore();

  return (
    <div className="pt-3 border-t-2 border-slate-200">
      <SectionTitle color="bg-linear-to-b from-emerald-600 to-emerald-400">
        Contador com Zustand
      </SectionTitle>
      
      <div className="relative overflow-hidden bg-linear-to-br from-slate-50 to-slate-100 rounded-xl p-4 border-2 border-slate-200 shadow-inner">
        {/* Decorative blurs */}
        <div className="absolute top-0 right-0 w-20 h-20 bg-linear-to-br from-blue-100/50 to-transparent rounded-full blur-2xl" />
        <div className="absolute bottom-0 left-0 w-20 h-20 bg-linear-to-tr from-slate-200/50 to-transparent rounded-full blur-2xl" />
        
        {/* Counter display */}
        <div className="relative text-center mb-3">
          <div className="inline-block">
            <div className="text-4xl font-black text-slate-900 tabular-nums tracking-tighter drop-shadow-sm">
              {count}
            </div>
            <div className="h-0.5 w-full bg-linear-to-r from-transparent via-slate-400 to-transparent mt-1 rounded-full" />
          </div>
          <p className="text-[10px] text-slate-600 mt-1.5 font-medium">
            Gerenciamento de Estado Global
          </p>
        </div>

        {/* Counter buttons */}
        <div className="relative flex gap-2 justify-center items-center">
          <Button
            onClick={decrement}
            variant="destructive"
            className="w-11 h-11 rounded-lg shadow-lg hover:shadow-2xl hover:scale-110 hover:bg-red-700 transition-all"
          >
            <Minus className="h-5 w-5" strokeWidth={3} />
          </Button>
          
          <Button
            onClick={reset}
            variant="outline"
            className="px-4 h-11 rounded-lg border-2 shadow-md hover:shadow-xl hover:scale-105 hover:bg-slate-100 hover:border-slate-400 transition-all font-semibold text-xs"
          >
            <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
            Reset
          </Button>
          
          <Button
            onClick={increment}
            className="w-11 h-11 rounded-lg shadow-lg hover:shadow-2xl hover:scale-110 hover:bg-slate-900 transition-all bg-linear-to-br from-slate-700 to-slate-900"
          >
            <Plus className="h-5 w-5" strokeWidth={3} />
          </Button>
        </div>
      </div>
    </div>
  );
}