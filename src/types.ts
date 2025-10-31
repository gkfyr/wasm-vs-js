export type BenchName = 'fib' | 'prime_sieve' | 'arith_loop' | 'matmul'

export type ImplName = 'js' | 'rust' | 'cpp'

export interface BenchCase {
  id: BenchName
  label: string
  paramLabel: string
  defaultParam: number
  min?: number
  max?: number
  step?: number
  description?: string
}

export interface BenchRunOptions {
  warmup: number
  rounds: number
}

export interface BenchResultEntry {
  impl: ImplName
  timeMs: number
  error?: string
}

export interface BenchResult {
  caseId: BenchName
  param: number
  results: BenchResultEntry[]
}

export type BenchPhase = 'warmup' | 'round'

export interface BenchProgress {
  impl: ImplName
  phase: BenchPhase
  current: number // 1-based
  total: number
}
