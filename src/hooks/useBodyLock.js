import { useEffect } from 'react';

export function useBodyLock(locked) {
  useEffect(() => {
    if (!locked) return undefined;
    document.body.classList.add('is-locked');
    return () => document.body.classList.remove('is-locked');
  }, [locked]);
}
