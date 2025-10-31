// Loader for Emscripten ES6 module produced with -s MODULARIZE=1 -s EXPORT_ES6=1
// Expects files at /wasm/cpp/benchmark.js and benchmark.wasm

export type CppModule = {
  fib(n: number): number
  prime_sieve(n: number): number
  arith_loop(n: number): number
  matmul(n: number): number
}

export async function loadCpp(): Promise<CppModule | undefined> {
  try {
    // Load the JS from /public via a runtime URL to bypass Vite transforms
    const jsUrl = new URL('/wasm/cpp/benchmark.js', window.location.origin).toString()
    const factory: any = (await import(/* @vite-ignore */ jsUrl)).default
    const instance: any = await factory({ locateFile: (p: string) => `/wasm/cpp/${p}` })
    const fib = instance.cwrap('fib', 'number', ['number'])
    const prime_sieve = instance.cwrap('prime_sieve', 'number', ['number'])
    const arith_loop = instance.cwrap('arith_loop', 'number', ['number'])
    const matmul = instance.cwrap('matmul', 'number', ['number'])
    return { fib, prime_sieve, arith_loop, matmul }
  } catch (e) {
    console.warn('C++ WASM not available:', e)
    return undefined
  }
}
