/**
 * Factory for creating lightweight external stores compatible with
 * React's `useSyncExternalStore`.
 *
 * Eliminates boilerplate (listeners, subscribe, getSnapshot, setState)
 * that was previously duplicated across every store module.
 */
export function createStore<T extends object>(initialState: T) {
  let state: T = { ...initialState };
  const listeners = new Set<() => void>();

  function emitChange() {
    listeners.forEach(listener => listener());
  }

  function subscribe(listener: () => void) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  }

  function getSnapshot(): T {
    return state;
  }

  function getState(): T {
    return state;
  }

  function setState(partial: Partial<T>) {
    state = { ...state, ...partial };
    emitChange();
  }

  function reset() {
    state = { ...initialState };
    emitChange();
  }

  return { subscribe, getSnapshot, getState, setState, reset };
}
