import { useSyncExternalStore } from 'react';
import { getPwaState, subscribePwa } from './pwaState';

export function usePwaState() {
  return useSyncExternalStore(subscribePwa, getPwaState);
}
