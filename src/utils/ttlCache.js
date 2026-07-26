export class TtlCache {
  #entries = new Map();
  #inflight = new Map();

  async getOrCreate(key, ttlMs, loader) {
    const now = Date.now();
    const entry = this.#entries.get(key);
    if (entry && entry.expiresAt > now) return entry.value;

    if (this.#inflight.has(key)) return this.#inflight.get(key);

    const promise = Promise.resolve()
      .then(loader)
      .then((value) => {
        this.#entries.set(key, { value, expiresAt: Date.now() + ttlMs });
        return value;
      })
      .finally(() => {
        this.#inflight.delete(key);
      });

    this.#inflight.set(key, promise);
    return promise;
  }

  deletePrefix(prefix) {
    for (const key of this.#entries.keys()) {
      if (key.startsWith(prefix)) this.#entries.delete(key);
    }
  }
}
