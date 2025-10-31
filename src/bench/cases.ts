import type { BenchCase } from '../types'

export const BENCH_CASES: BenchCase[] = [
  {
    id: 'fib',
    label: 'Fibonacci (iterative)',
    paramLabel: 'n',
    defaultParam: 42,
    min: 10,
    max: 55,
    description: 'Compute F(n) with iterative algorithm.'
  },
  {
    id: 'prime_sieve',
    label: 'Prime Sieve (count ≤ n)',
    paramLabel: 'n',
    defaultParam: 2000000,
    min: 100000,
    max: 5000000,
    step: 50000,
    description: 'Count primes up to n using Sieve of Eratosthenes.'
  },
  {
    id: 'arith_loop',
    label: 'Integer Arithmetic Loop',
    paramLabel: 'iterations',
    defaultParam: 100000000,
    min: 1000000,
    max: 200000000,
    step: 1000000,
    description: 'Sum i^2 + i (mod 1,000,000,007).'
  },
  {
    id: 'matmul',
    label: 'Matrix Multiply checksum',
    paramLabel: 'size',
    defaultParam: 120,
    min: 32,
    max: 256,
    step: 8,
    description: 'Multiply two size×size matrices; return checksum (mod 1e9+7).'
  }
]

