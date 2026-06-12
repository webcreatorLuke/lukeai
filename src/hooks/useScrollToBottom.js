// src/hooks/useScrollToBottom.js
import { useEffect, useRef } from 'react';

export function useScrollToBottom(deps = []) {
  const ref = useRef(null);

  useEffect(() => {
    if (!ref.current) return;
    ref.current.scrollTo({ top: ref.current.scrollHeight, behavior: 'smooth' });
  }, deps);

  return ref;
}
