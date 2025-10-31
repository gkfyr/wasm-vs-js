#include <cmath>
#include <cstdint>
#include <vector>

extern "C" {

uint32_t fib(int n) {
  if (n <= 1) return n;
  uint32_t a = 0, b = 1;
  for (int i = 2; i <= n; ++i) {
    uint32_t t = a + b;
    a = b;
    b = t;
  }
  return b;
}

int prime_sieve(int n) {
  if (n < 2) return 0;
  std::vector<uint8_t> sieve(n + 1, 0);
  int count = n - 1; // 2..n
  sieve[0] = sieve[1] = 1;
  for (int p = 2; p * p <= n; ++p) {
    if (!sieve[p]) {
      for (int j = p * p; j <= n; j += p) {
        if (!sieve[j]) { sieve[j] = 1; --count; }
      }
    }
  }
  return count;
}

static const uint32_t MOD = 1000000007u;

int arith_loop(int iterations) {
  uint32_t acc = 0;
  for (int i = 1; i <= iterations; ++i) {
    uint64_t t = (uint64_t)i * (uint64_t)i + (uint64_t)i;
    acc = (acc + (uint32_t)(t % MOD)) % MOD;
  }
  return (int)acc;
}

int matmul(int size) {
  const int n = size;
  std::vector<double> A(n*n), B(n*n), C(n*n, 0.0);
  for (int i = 0; i < n; ++i) {
    for (int j = 0; j < n; ++j) {
      A[i*n + j] = (double)((i + j) % 7);
      B[i*n + j] = (i == j) ? 1.0 : (double)((i + 2*j) % 5);
    }
  }
  for (int i = 0; i < n; ++i) {
    for (int k = 0; k < n; ++k) {
      double aik = A[i*n + k];
      for (int j = 0; j < n; ++j) {
        C[i*n + j] += aik * B[k*n + j];
      }
    }
  }
  uint32_t checksum = 0;
  for (double x : C) {
    checksum = (checksum + (uint32_t)floor(x)) % MOD;
  }
  return (int)checksum;
}

}
