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
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label className="block text-sm font-medium">Benchmark</label>
          <select
            className="w-full rounded border border-slate-300 bg-white p-2"
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
          <p className="text-xs text-slate-500">{selected.description}</p>
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium">{selected.paramLabel}</label>
          <input
            type="range"
            min={selected.min ?? 1}
            max={selected.max ?? selected.defaultParam * 2}
            step={selected.step ?? 1}
            value={param}
            onChange={(e) => setParam(Number(e.target.value))}
            className="w-full"
          />
          <div className="text-sm">Current: <span className="font-mono">{param}</span></div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div>
          <label className="block text-sm font-medium">Warmup</label>
          <input type="number" className="w-full rounded border border-slate-300 p-2" value={warmup} min={0} onChange={e=>setWarmup(Number(e.target.value))} />
        </div>
        <div>
          <label className="block text-sm font-medium">Rounds (best time)</label>
          <input type="number" className="w-full rounded border border-slate-300 p-2" value={rounds} min={1} onChange={e=>setRounds(Number(e.target.value))} />
        </div>
        <div className="flex items-end gap-3">
          <button disabled={running} onClick={run} className="inline-flex items-center gap-2 rounded bg-blue-600 px-4 py-2 text-white disabled:opacity-50">
            {running && <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/60 border-t-transparent" />}
            {running ? 'Running…' : 'Run'}
          </button>
          {!impls && (
            <span className="inline-flex items-center gap-2 text-sm text-slate-500">
              <span className="h-3 w-3 animate-spin rounded-full border-2 border-slate-400/70 border-t-transparent" />
              Loading engines…
            </span>
          )}
        </div>
      </div>

      <EngineLoader onReady={setImpls} />

      {running && (
        <div className="rounded border border-slate-200 bg-white p-3">
          <div className="mb-1 flex items-center justify-between text-xs text-slate-600">
            <span>{progressText || 'Starting…'}</span>
            <span className="font-mono">{doneSteps}/{totalSteps}</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded bg-slate-100">
            <div className="h-full bg-blue-600" style={{ width: `${progressPct}%` }} />
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
    <div className="rounded border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-2 text-sm text-slate-500">Param: <span className="font-mono">{result.param}</span>{unavailable && <> • Unavailable: {unavailable}</>}</div>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-slate-600">
            <th className="py-1">Impl</th>
            <th className="py-1">Best</th>
            <th className="py-1">x faster</th>
            <th className="py-1">Note</th>
          </tr>
        </thead>
        <tbody>
          {result.results.map(r => (
            <tr key={r.impl} className="border-t border-slate-100">
              <td className="py-1 font-medium uppercase">{r.impl}</td>
              <td className="py-1 font-mono">{fmtTime(r.timeMs)}</td>
              <td className="py-1">{isFinite(r.timeMs) && isFinite(fastest) ? (fastest / r.timeMs).toFixed(2) : '-'}</td>
              <td className="py-1 text-slate-500">{r.error ?? ''}</td>
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
