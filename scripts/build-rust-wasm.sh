#!/usr/bin/env bash
set -euo pipefail

# Build Rust WASM using wasm-pack, output to public/wasm/rust
ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
OUT_DIR="$ROOT_DIR/public/wasm/rust"
SRC_DIR="$ROOT_DIR/wasm/rust"

if ! command -v wasm-pack >/dev/null 2>&1; then
  echo "wasm-pack not found. Install with: cargo install wasm-pack" >&2
  exit 1
fi

mkdir -p "$OUT_DIR"
pushd "$SRC_DIR" >/dev/null
wasm-pack build --release --target web --out-dir "$OUT_DIR/pkg"
popd >/dev/null

echo "Rust WASM built at $OUT_DIR/pkg"

