WASM vs JS — 연산 대결 (Vite + React + Tailwind)

웹에서 JavaScript, WASM(Rust), WASM(C++) 구현을 동일한 파라미터로 실행해 성능을 비교합니다. Vite + React + Tailwind로 UI를 만들고, Rust는 wasm-bindgen (wasm-pack), C++은 Emscripten으로 빌드합니다.

빠른 시작
- Node 18+ 권장
- Rust toolchain + wasm-pack
- Emscripten (emcc) 활성화

명령어
- npm install
- npm run wasm:rust  (선택)
- npm run wasm:cpp   (선택)
- npm run wasm:all   (선택)
- npm run dev

브라우저에서 각 연산의 파라미터와 라운드를 조절하며 JS/Rust/C++의 실행 시간을 비교할 수 있습니다. 빌드되지 않은 엔진은 "not available"로 표시됩니다.

벤치마크 케이스
- Fibonacci (iterative): fib(n)
- Prime Sieve: prime_sieve(n) — n 이하 소수 개수
- Integer Arithmetic Loop: arith_loop(iterations) — (i^2 + i) mod 1e9+7 누적
- Matrix Multiply: matmul(size) — 두 size×size 행렬 곱 결과 체크섬

모든 구현은 동일한 로직/반환형(정수)으로 맞췄으며, 오버플로 처리를 위해 mod 1e9+7을 사용했습니다.

Rust WASM 빌드
- cargo install wasm-pack  (최초 1회)
- npm run wasm:rust
- 산출물: public/wasm/rust/pkg/wasm_benches.js 및 wasm_benches_bg.wasm
- 브라우저 로딩: src/wasm/rust.ts에서 동적 로딩하여 사용

C++ WASM 빌드 (Emscripten)
- EMSDK 설치 가이드: emscripten 공식 문서 참고
- npm run wasm:cpp
- 설정: ES 모듈(-s MODULARIZE=1 -s EXPORT_ES6=1), 웹 환경(-s ENVIRONMENT=web)
- 내보내기: fib, prime_sieve, arith_loop, matmul
- src/wasm/cpp.ts에서 emscripten cwrap으로 JS 함수로 감싸서 사용

구조
- src/bench/ — JS 구현과 러너
- src/wasm/ — Rust/C++ 로더
- wasm/rust/ — Rust 소스 (wasm-bindgen)
- wasm/cpp/ — C++ 소스 (Emscripten)
- public/wasm/ — 빌드 산출물 배치 위치

주의 사항
- 브라우저 성능/전원 상태/탭 포커스 등에 따라 수치가 변동될 수 있습니다. 여러 라운드를 실행하여 최솟값(best) 기준으로 표시합니다.
- 메인 스레드에서 실행하므로 큰 파라미터는 UI가 순간 멈출 수 있습니다. 필요시 Web Worker로 확장 가능합니다.

다음 단계 아이디어
- Web Worker로 비동기 실행 및 UI 프리즈 최소화
- 추가 연산(FFT, 문자열 처리, 해시 등) 케이스 확장
- 결과 내보내기(CSV) 및 그래프 시각화

