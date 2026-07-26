export class Semaphore {
  #active = 0;
  #queue = [];

  constructor(limit) {
    if (!Number.isInteger(limit) || limit < 1) {
      throw new TypeError('Semaphore limit must be a positive integer.');
    }
    this.limit = limit;
  }

  async acquire() {
    if (this.#active < this.limit) {
      this.#active += 1;
      return this.#createRelease();
    }

    return new Promise((resolve) => {
      this.#queue.push(resolve);
    }).then(() => {
      this.#active += 1;
      return this.#createRelease();
    });
  }

  #createRelease() {
    let released = false;
    return () => {
      if (released) return;
      released = true;
      this.#active -= 1;
      const next = this.#queue.shift();
      if (next) next();
    };
  }
}
