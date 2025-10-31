use wasm_bindgen::prelude::*;

const MOD: u32 = 1_000_000_007;

#[wasm_bindgen]
pub fn fib(n: u32) -> u32 {
    if n <= 1 { return n; }
    let (mut a, mut b) = (0u32, 1u32);
    for _ in 2..=n {
        let t = a.wrapping_add(b);
        a = b;
        b = t;
    }
    b
}

#[wasm_bindgen]
pub fn prime_sieve(n: u32) -> u32 {
    if n < 2 { return 0; }
    let n = n as usize;
    let mut sieve = vec![false; n + 1];
    sieve[0] = true; sieve[1] = true;
    let mut count: u32 = (n as u32).saturating_sub(1); // 2..=n
    let mut p = 2usize;
    while p * p <= n {
        if !sieve[p] {
            let mut j = p * p;
            while j <= n {
                if !sieve[j] { sieve[j] = true; count -= 1; }
                j += p;
            }
        }
        p += 1;
    }
    count
}

#[wasm_bindgen]
pub fn arith_loop(iterations: u32) -> u32 {
    let mut acc: u64 = 0;
    for i in 1..=iterations as u64 {
        acc = (acc + ((i*i + i) % MOD as u64)) % MOD as u64;
    }
    (acc as u32)
}

#[wasm_bindgen]
pub fn matmul(size: u32) -> u32 {
    let n = size as usize;
    let mut a = vec![0f64; n*n];
    let mut b = vec![0f64; n*n];
    let mut c = vec![0f64; n*n];
    for i in 0..n {
        for j in 0..n {
            a[i*n + j] = ((i + j) % 7) as f64;
            b[i*n + j] = if i == j { 1.0 } else { ((i + 2*j) % 5) as f64 };
        }
    }
    for i in 0..n {
        for k in 0..n {
            let aik = a[i*n + k];
            for j in 0..n {
                c[i*n + j] += aik * b[k*n + j];
            }
        }
    }
    let mut checksum: u32 = 0;
    for x in c.into_iter() {
        checksum = (checksum + (x.floor() as u32 % MOD)) % MOD;
    }
    checksum
}

