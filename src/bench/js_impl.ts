const MOD = 1_000_000_007

export function fib(n: number): number {
  if (n <= 1) return n
  let a = 0, b = 1
  for (let i = 2; i <= n; i++) {
    // keep semantics close to u32 wrap-around
    const t = (a + b) >>> 0
    a = b
    b = t
  }
  return b
}

export function prime_sieve(n: number): number {
  if (n < 2) return 0
  const sieve = new Uint8Array(n + 1)
  let count = n - 1 // 2..n
  sieve[0] = sieve[1] = 1
  for (let p = 2; p * p <= n; p++) {
    if (sieve[p] === 0) {
      for (let j = p * p; j <= n; j += p) {
        if (sieve[j] === 0) { sieve[j] = 1; count-- }
      }
    }
  }
  return count
}

export function arith_loop(iterations: number): number {
  let acc = 0
  for (let i = 1; i <= iterations; i++) {
    acc = (acc + (i * i + i) % MOD) % MOD
  }
  return acc
}

export function matmul(n: number): number {
  // Create matrices with deterministic values
  const A = new Float64Array(n * n)
  const B = new Float64Array(n * n)
  const C = new Float64Array(n * n)
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      A[i*n + j] = (i + j) % 7
      B[i*n + j] = (i === j ? 1 : (i + 2*j) % 5)
    }
  }
  for (let i = 0; i < n; i++) {
    for (let k = 0; k < n; k++) {
      let aik = A[i*n + k]
      for (let j = 0; j < n; j++) {
        C[i*n + j] += aik * B[k*n + j]
      }
    }
  }
  let checksum = 0
  for (let i = 0; i < C.length; i++) {
    checksum = (checksum + Math.floor(C[i]) ) % MOD
  }
  return checksum
}

export type JsImpl = typeof import('./js_impl')
