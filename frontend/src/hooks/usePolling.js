import { useEffect, useRef } from 'react';

export function usePolling(callback, delay = 5000, enabled = true) {
  const savedCallback = useRef(callback);

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    if (!enabled || !delay) return undefined;
    const timer = window.setInterval(() => savedCallback.current?.(), delay);
    return () => window.clearInterval(timer);
  }, [delay, enabled]);
}
