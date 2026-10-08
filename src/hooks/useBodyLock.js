import { useEffect } from 'react';
import { setScrollLocked } from '../lib/scroll';

export function useBodyLock(locked) {
  useEffect(() => {
    if (!locked) return undefined;
    setScrollLocked(true);
    return () => setScrollLocked(false);
  }, [locked]);
}
