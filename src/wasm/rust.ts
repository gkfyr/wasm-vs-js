// Loader for wasm-bindgen JS wrapper produced by wasm-pack --target web
// Expects files at /wasm/rust/pkg/wasm_benches.js and .wasm (served from public)

export type RustModule = {
  fib(n: number): number
  prime_sieve(n: number): number
  arith_loop(n: number): number
  matmul(n: number): number
}

export async function loadRust(): Promise<RustModule | undefined> {
  try {
    // Load the JS from /public via a runtime URL to bypass Vite transforms
    const jsUrl = new URL('/wasm/rust/pkg/wasm_benches.js', window.location.origin).toString()
    const mod = (await import(/* @vite-ignore */ jsUrl)) as any

    // wasm-bindgen (target web) expects init() to be called with the wasm URL
    if (typeof mod?.default === 'function') {
      const wasmUrl = new URL('/wasm/rust/pkg/wasm_benches_bg.wasm', window.location.origin).toString()
      await mod.default(wasmUrl)
    }
    return mod as RustModule
  } catch (e) {
    console.warn('Rust WASM not available:', e)
    return undefined
  }
}
