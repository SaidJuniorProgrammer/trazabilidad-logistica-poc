import { useEffect, useState } from 'react';

export default function useDebounce(value, delayMs = 300) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(handler);
  }, [value, delayMs]);

  return debounced;
}