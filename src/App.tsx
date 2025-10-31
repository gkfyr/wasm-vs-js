import BenchmarkControls from './components/BenchmarkControls'

export default function App() {
  return (
    <div className="relative min-h-screen w-full overflow-x-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-slate-800 text-slate-100">
      {/* gradient accents */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -left-32 -top-24 h-64 w-64 rounded-full bg-fuchsia-500/20 blur-3xl" />
        <div className="absolute -right-24 top-40 h-72 w-72 rounded-full bg-indigo-500/20 blur-3xl" />
        <div className="absolute bottom-0 left-1/2 h-40 w-96 -translate-x-1/2 bg-gradient-to-t from-slate-900/60 to-transparent" />
      </div>

      <div className="mx-auto max-w-6xl p-6">
        <header className="mb-8">
          <h1 className="bg-gradient-to-r from-fuchsia-300 via-violet-300 to-indigo-300 bg-clip-text text-3xl font-bold tracking-tight text-transparent md:text-4xl">
            WASM vs JS Benchmarks
          </h1>
          <p className="mt-2 text-sm text-slate-300/80 md:text-base">Compare JavaScript with Rust and C++ WebAssembly across common compute tasks.</p>
          <div className="mt-4 flex flex-wrap items-center gap-2 text-[11px] md:text-xs">
            <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-slate-200 backdrop-blur">Client-side</span>
            <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-slate-200 backdrop-blur">No network</span>
            <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-slate-200 backdrop-blur">Vite + React + Tailwind</span>
          </div>
        </header>
        <BenchmarkControls />
        <footer className="mt-10 text-xs text-slate-400">
          Tip: If Rust/C++ WASM isn’t built yet, that engine shows as “not available”.
        </footer>
      </div>
    </div>
  )
}
