import { useSyncExternalStore } from 'react';

// Tiny external store: createStore(initial) -> { get, set, use }
export function createStore(init) {
  let s = init;
  const subs = new Set();
  const get = () => s;
  const set = (p) => {
    s = { ...s, ...(typeof p === 'function' ? p(s) : p) };
    subs.forEach((f) => f());
  };
  const sub = (f) => {
    subs.add(f);
    return () => subs.delete(f);
  };
  const use = () => useSyncExternalStore(sub, get);
  return { get, set, use };
}

export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
