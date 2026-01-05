import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="text-center px-8 py-6 bg-white rounded-xl shadow-md">
        <h1 className="text-5xl font-semibold tracking-tight text-gray-800">
          Hello World
        </h1>
        <p className="mt-4 text-gray-600">
          Vite + React 19 + Tailwind 4 + TanStack Router
        </p>
      </div>
    </div>
  );
}