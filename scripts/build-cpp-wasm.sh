#!/usr/bin/env bash
set -euo pipefail

# Build C++ WASM using Emscripten (emcc)
ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
OUT_DIR="$ROOT_DIR/public/wasm/cpp"
SRC_DIR="$ROOT_DIR/wasm/cpp"

if ! command -v emcc >/dev/null 2>&1; then
  echo "emcc not found. Install Emscripten SDK and activate it." >&2
  echo "See: https://emscripten.org/docs/getting_started/downloads.html" >&2
  exit 1
fi

mkdir -p "$OUT_DIR"

emcc "$SRC_DIR/benchmark.cpp" \
  -O3 -DNDEBUG \
  -s WASM=1 \
  -s EXPORTED_FUNCTIONS='["_fib","_prime_sieve","_arith_loop","_matmul"]' \
  -s EXPORTED_RUNTIME_METHODS='["cwrap"]' \
  -s MODULARIZE=1 -s EXPORT_ES6=1 -s ENVIRONMENT=web \
  -o "$OUT_DIR/benchmark.js"

echo "C++ WASM built at $OUT_DIR/benchmark.js"

