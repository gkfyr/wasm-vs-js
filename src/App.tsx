import BenchmarkControls from './components/BenchmarkControls'

export default function App() {
  return (
    <div className="mx-auto max-w-5xl p-6">
      <header className="mb-6">
        <h1 className="text-2xl font-bold">WASM (C++/Rust) vs JS — 연산 대결</h1>
        <p className="text-slate-600">여러 연산 케이스를 동일 파라미터로 실행하고 성능을 비교합니다.</p>
      </header>
      <BenchmarkControls />
      <footer className="mt-10 text-xs text-slate-500">
        Tip: Rust/C++ WASM이 빌드되지 않았다면 해당 엔진은 "not available"로 표시됩니다.
      </footer>
    </div>
  )
}
