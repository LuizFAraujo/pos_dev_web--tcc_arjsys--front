import { createFileRoute } from "@tanstack/react-router";
import { useAppStore } from "@stores";

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  const { count, increment, decrement, reset } = useAppStore();

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="text-center px-8 py-6 bg-white rounded-xl shadow-md">
        <h1 className="text-5xl font-semibold tracking-tight text-gray-800">
          Hello World
        </h1>
        <p className="mt-4 text-gray-600">
          Vite + React 19 + Tailwind 4 + TanStack Router + Zustand
        </p>

        {/* Contador Zustand */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-3xl font-bold text-center text-gray-700">
            Count: {count}
          </p>
          <div className="flex gap-3 mt-4 justify-center">
            <button
              onClick={increment}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
            >
              +
            </button>
            <button
              onClick={decrement}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
            >
              -
            </button>
            <button
              onClick={reset}
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition"
            >
              Reset
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}