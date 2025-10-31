import { useMemo, useState } from 'react'
import { BENCH_CASES } from '../bench/cases'
import type { BenchCase, BenchResult, BenchProgress } from '../types'
import { runOne } from '../bench/runner'

export default function BenchmarkControls() {
  const [selected, setSelected] = useState<BenchCase>(BENCH_CASES[0])
  const [param, setParam] = useState<number>(BENCH_CASES[0].defaultParam)
  const [warmup, setWarmup] = useState(1)
  const [rounds, setRounds] = useState(5)
  const [running, setRunning] = useState(false)
  const [result, setResult] = useState<BenchResult | null>(null)
  const [impls, setImpls] = useState<any>(null)
  const [progressText, setProgressText] = useState<string>('')
  const [progressPct, setProgressPct] = useState<number>(0)
  const [totalSteps, setTotalSteps] = useState<number>(0)
  const [doneSteps, setDoneSteps] = useState<number>(0)

  const disabledInfo = useMemo(() => {
    if (!impls) return 'Rust, C++ (loading)'
    const list: string[] = []
    if (!impls.rust) list.push('Rust')
    if (!impls.cpp) list.push('C++')
    return list.join(', ')
  }, [impls])

  const engines = useMemo(() => ({
    js: { label: 'JS', available: true },
    rust: { label: 'Rust', available: !!impls?.rust },
    cpp: { label: 'C++', available: !!impls?.cpp },
  }), [impls])

  async function run() {
    if (!impls) return
    setRunning(true)
    // Give the browser a chance to paint the spinner/progress
    try { await new Promise<void>(r => requestAnimationFrame(() => r())) } catch {}
    // Compute total work units (warmup + rounds) for available implementations
    const implCount = 1 + (impls.rust ? 1 : 0) + (impls.cpp ? 1 : 0)
    const total = implCount * (warmup + rounds)
    setTotalSteps(total)
    setDoneSteps(0)
    setProgressPct(total === 0 ? 100 : 0)
    const onProgress = (p: BenchProgress) => {
      setDoneSteps(prev => {
        const next = prev + 1
        setProgressPct(total > 0 ? Math.min(100, Math.round((next / total) * 100)) : 100)
        setProgressText(`${p.impl.toUpperCase()} ${p.phase} ${p.current}/${p.total}`)
        return next
      })
    }
    try {
      const r = await runOne(impls, selected.id, param, warmup, rounds, onProgress)
      setResult(r)
    } finally {
      setRunning(false)
      setProgressText('')
      setProgressPct(0)
    }
  }

  return (
    <div className="space-y-5">
      <div className="grid gap-5 lg:grid-cols-3">
        {/* Engines Card (moved above) */}
        <div className="lg:col-span-3 rounded border border-white/10 bg-white/5 p-5 shadow-sm backdrop-blur">
          <h2 className="mb-3 text-lg font-semibold text-slate-100">Engines</h2>
          <div className="flex flex-wrap gap-2">
            {Object.entries(engines).map(([key, e]) => (
              <span key={key} className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs ${e.available ? 'border-emerald-400/40 bg-emerald-400/10 text-emerald-200' : 'border-white/10 bg-white/5 text-slate-300/80'}`}>
                <span className={`h-2 w-2 rounded-full ${e.available ? 'bg-emerald-400' : 'bg-slate-400'}`} />
                {e.label}
                <span className="ml-1 opacity-60">{e.available ? 'ready' : 'n/a'}</span>
              </span>
            ))}
          </div>
          <p className="mt-3 text-xs text-slate-300/70">JS is always available. Rust/C++ require local WASM builds placed under <span className="font-mono text-slate-200">/public/wasm</span>.</p>
        </div>

        {/* Controls Card */}
        <div className="lg:col-span-3 rounded border border-white/10 bg-white/5 p-5 shadow-sm backdrop-blur">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-100">Benchmark Controls</h2>
              <p className="text-sm text-slate-300/80">Configure the case, parameter, and rounds, then run.</p>
            </div>
            <div className="hidden md:block text-xs text-slate-300/70">Best time across rounds</div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-200">Benchmark</label>
              <select
                className="w-full rounded border border-white/10 bg-white/10 p-2 text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-fuchsia-500/60"
                value={selected.id}
                onChange={(e) => {
                  const next = BENCH_CASES.find(c => c.id === e.target.value)! as BenchCase
                  setSelected(next)
                  setParam(next.defaultParam)
                }}
              >
                {BENCH_CASES.map(c => (
                  <option key={c.id} value={c.id}>{c.label}</option>
                ))}
              </select>
              <p className="text-xs text-slate-300/70">{selected.description}</p>
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-200">{selected.paramLabel}</label>
              <input
                type="range"
                min={selected.min ?? 1}
                max={selected.max ?? selected.defaultParam * 2}
                step={selected.step ?? 1}
                value={param}
                onChange={(e) => setParam(Number(e.target.value))}
                className="w-full accent-fuchsia-500"
              />
              <div className="text-sm text-slate-300/80">Current: <span className="font-mono text-slate-100">{param}</span></div>
            </div>
          </div>

          <div className="mt-4 grid gap-4 md:grid-cols-3">
            <div>
              <label className="block text-sm font-medium text-slate-200">Warmup</label>
              <input type="number" className="w-full rounded border border-white/10 bg-white/10 p-2 text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-fuchsia-500/60" value={warmup} min={0} onChange={e=>setWarmup(Number(e.target.value))} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-200">Rounds (best time)</label>
              <input type="number" className="w-full rounded border border-white/10 bg-white/10 p-2 text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-fuchsia-500/60" value={rounds} min={1} onChange={e=>setRounds(Number(e.target.value))} />
            </div>
            <div className="flex items-end gap-3">
              <button disabled={running} onClick={run} className="inline-flex items-center gap-2 rounded bg-gradient-to-r from-fuchsia-600 to-indigo-600 px-4 py-2 text-white shadow hover:from-fuchsia-500 hover:to-indigo-500 disabled:opacity-50">
                {running && <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/70 border-t-transparent" />}
                {running ? 'Running…' : 'Run Benchmark'}
              </button>
              {!impls && (
                <span className="inline-flex items-center gap-2 text-sm text-slate-300/80">
                  <span className="h-3 w-3 animate-spin rounded-full border-2 border-slate-200/70 border-t-transparent" />
                  Loading engines…
                </span>
              )}
            </div>
          </div>
        </div>

      </div>

      <EngineLoader onReady={setImpls} />

      {running && (
        <div className="rounded border border-white/10 bg-white/5 p-4 shadow-sm backdrop-blur">
          <div className="mb-2 flex items-center justify-between text-xs text-slate-300/80">
            <span className="inline-flex items-center gap-2">
              <span className="h-3 w-3 animate-spin rounded-full border-2 border-slate-200/70 border-t-transparent" />
              {progressText || 'Starting…'}
            </span>
            <span className="font-mono text-slate-200">{doneSteps}/{totalSteps}</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded bg-white/10">
            <div className="h-full bg-gradient-to-r from-fuchsia-500 to-indigo-500 transition-[width] duration-150" style={{ width: `${progressPct}%` }} />
          </div>
        </div>
      )}

      {result && <ResultsCard result={result} unavailable={disabledInfo} />}
    </div>
  )
}

function ResultsCard({ result, unavailable }: { result: BenchResult, unavailable: string }) {
  const byTime = [...result.results].filter(r => isFinite(r.timeMs)).sort((a,b)=>a.timeMs-b.timeMs)
  const fastest = byTime[0]?.timeMs ?? Infinity
  const fmtTime = (ms: number) => {
    if (!isFinite(ms)) return '-'
    if (ms >= 1) return ms.toFixed(2) + ' ms'
    if (ms >= 0.1) return ms.toFixed(2) + ' ms'
    // very small -> show microseconds
    const us = ms * 1000
    return (us < 10 ? us.toFixed(2) : us.toFixed(1)) + ' µs'
  }
  return (
    <div className="rounded border border-white/10 bg-white/5 p-4 shadow-sm backdrop-blur">
      <div className="mb-2 text-sm text-slate-300/80">Param: <span className="font-mono text-slate-200">{result.param}</span>{unavailable && <> • Unavailable: {unavailable}</>}</div>
      <table className="w-full text-sm text-slate-100">
        <thead>
          <tr className="text-left text-slate-300/80">
            <th className="py-1">Impl</th>
            <th className="py-1">Best</th>
            <th className="py-1">x faster</th>
            <th className="py-1">Note</th>
          </tr>
        </thead>
        <tbody>
          {result.results.map(r => (
            <tr key={r.impl} className="border-t border-white/10">
              <td className="py-1 font-medium uppercase text-slate-200">{r.impl}</td>
              <td className="py-1 font-mono text-slate-100">{fmtTime(r.timeMs)}</td>
              <td className="py-1 text-slate-100">{isFinite(r.timeMs) && isFinite(fastest) ? (fastest / r.timeMs).toFixed(2) : '-'}</td>
              <td className="py-1 text-slate-300/70">{r.error ?? ''}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function EngineLoader({ onReady }: { onReady: (impls: any)=>void }) {
  // lazy load rust/cpp to speed initial load
  useMemo(() => {
    let cancelled = false
    async function go() {
      const { loadRust } = await import('../wasm/rust')
      const { loadCpp } = await import('../wasm/cpp')
      const [rust, cpp] = await Promise.all([loadRust(), loadCpp()])
      if (!cancelled) onReady({ js: await import('../bench/js_impl'), rust, cpp })
    }
    go()
    return () => { cancelled = true }
  }, [onReady])
  return null
}
