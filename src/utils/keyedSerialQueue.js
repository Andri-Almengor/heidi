const tails = new Map();

export async function runKeyedSerial(key, task) {
  const previous = tails.get(key) || Promise.resolve();
  let release;
  const current = new Promise((resolve) => {
    release = resolve;
  });

  tails.set(key, current);
  await previous.catch(() => undefined);

  try {
    return await task();
  } finally {
    release();
    if (tails.get(key) === current) {
      tails.delete(key);
    }
  }
}
