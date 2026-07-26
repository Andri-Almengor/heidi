import { useEffect, useRef } from 'react';

export function usePolling(callback, delay = 8000, enabled = true) {
  const savedCallback = useRef(callback);

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    if (!enabled || !delay) return undefined;

    const interval = Math.max(delay, 8000);
    let cancelled = false;
    let timerId;

    const schedule = () => {
      if (cancelled) return;
      // Small jitter prevents several dashboards opened at the same time from
      // hitting Apps Script on the exact same millisecond.
      const jitter = Math.floor(Math.random() * Math.max(250, interval * 0.15));
      timerId = window.setTimeout(run, interval + jitter);
    };

    const run = async () => {
      if (cancelled) return;
      if (!document.hidden) {
        try {
          await savedCallback.current?.();
        } finally {
          schedule();
        }
      } else {
        schedule();
      }
    };

    const onVisibilityChange = () => {
      if (!document.hidden && enabled) {
        window.clearTimeout(timerId);
        run();
      }
    };

    document.addEventListener('visibilitychange', onVisibilityChange);
    schedule();

    return () => {
      cancelled = true;
      window.clearTimeout(timerId);
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, [delay, enabled]);
}
