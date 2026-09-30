// Simulated network latency so the interface behaves like it is talking to a real
// backend. Remove `delay()` calls once these functions are backed by fetch().
export function delay<T>(value: T, ms = 380): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

export function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value));
}
