import type { BenchName, BenchProgress, BenchResult, BenchResultEntry } from '../types'

async function nextFrame() {
  try {
    await new Promise<void>(resolve => requestAnimationFrame(() => resolve()))
  } catch {
    await new Promise<void>(resolve => setTimeout(resolve, 0))
  }
}
import * as JS from './js_impl'

export type RustModule = {
  fib(n: number): number
  prime_sieve(n: number): number
  arith_loop(n: number): number
  matmul(n: number): number
}

export type CppModule = RustModule

export interface Implementations {
  js: typeof JS
  rust?: RustModule
  cpp?: CppModule
}

export function hasWasmRust(impls: Implementations) { return !!impls.rust }
export function hasWasmCpp(impls: Implementations) { return !!impls.cpp }

export async function runOne(
  impls: Implementations,
  caseId: BenchName,
  param: number,
  warmup = 1,
  rounds = 5,
  onProgress?: (p: BenchProgress) => void
): Promise<BenchResult> {
  const entries: BenchResultEntry[] = []
  const minBatchTimeMs = 10 // ensure measurable duration per round

  async function timeOne(kind: keyof Implementations) {
    const mod: any = (impls as any)[kind]
    if (!mod) {
      entries.push({ impl: kind as any, timeMs: NaN, error: 'not available' })
      return
    }
    const fn = mod[caseId]
    if (typeof fn !== 'function') {
      entries.push({ impl: kind as any, timeMs: NaN, error: 'function missing' })
      return
    }
    try {
      // warmup
      for (let i = 0; i < warmup; i++) {
        await nextFrame() // yield so UI can paint spinners
        fn(param)
        onProgress?.({ impl: kind as any, phase: 'warmup', current: i + 1, total: warmup })
      }
      let best = Number.POSITIVE_INFINITY
      for (let r = 0; r < rounds; r++) {
        await nextFrame() // yield before each measured round
        // Run in batches until we accumulate a minimum wall time,
        // then divide to get per-call time. This avoids 0.00ms results.
        let reps = 0
        let out: any
        const t0 = performance.now()
        let t1 = t0
        do {
          out = fn(param)
          reps++
          t1 = performance.now()
        } while (t1 - t0 < minBatchTimeMs)

        if (typeof out !== 'number') throw new Error('invalid result')
        const dt = (t1 - t0) / reps
        if (dt < best) best = dt
        onProgress?.({ impl: kind as any, phase: 'round', current: r + 1, total: rounds })
      }
      entries.push({ impl: kind as any, timeMs: best })
    } catch (e: any) {
      entries.push({ impl: kind as any, timeMs: NaN, error: e?.message ?? String(e) })
    }
  }

  await timeOne('js')
  await timeOne('rust')
  await timeOne('cpp')

  return { caseId, param, results: entries }
}
