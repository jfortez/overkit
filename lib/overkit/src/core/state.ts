import { useRef, useSyncExternalStore } from "react";

export type Listener = () => void;

export type StateUpdate<T> = T | Partial<T> | ((state: T) => T | Partial<T>);

export type SetState<T> = (update: StateUpdate<T>, replace?: boolean) => void;

export interface StoreApi<T> {
  getState: () => T;
  getInitialState: () => T;
  setState: SetState<T>;
  subscribe: (listener: Listener) => () => void;
}

export interface UseBoundStore<T> extends StoreApi<T> {
  (): T;
  <Selection>(selector: (state: T) => Selection): Selection;
}

type SelectionCache<T, Selection> = {
  state: T;
  selector: ((state: T) => Selection) | undefined;
  selection: Selection;
};

export function createStore<T>(
  initializer: (set: SetState<T>, get: () => T) => T,
): UseBoundStore<T> {
  const listeners = new Set<Listener>();

  let state: T;
  let initialState: T;

  const getState = () => state;

  const setState: SetState<T> = (update, replace = false) => {
    const next =
      typeof update === "function"
        ? (update as (state: T) => T | Partial<T>)(state)
        : update;

    if (Object.is(next, state)) return;

    state = (
      replace || next === null || typeof next !== "object"
        ? next
        : Object.assign({}, state, next)
    ) as T;

    for (const listener of listeners) listener();
  };

  const subscribe = (listener: Listener) => {
    listeners.add(listener);

    return () => {
      listeners.delete(listener);
    };
  };

  initialState = initializer(setState, getState);
  state = initialState;

  const store: StoreApi<T> = {
    getState,
    getInitialState: () => initialState,
    setState,
    subscribe,
  };

  const useBoundStore = ((selector?: (state: T) => unknown) =>
    useStore(store, selector)) as UseBoundStore<T>;

  return Object.assign(useBoundStore, store);
}

export function useStore<T, Selection = T>(
  store: StoreApi<T>,
  selector?: (state: T) => Selection,
): Selection {
  const cache = useRef<SelectionCache<T, Selection> | null>(null);

  const getSnapshot = () => {
    const current = store.getState();
    const cached = cache.current;

    if (
      cached &&
      Object.is(cached.state, current) &&
      cached.selector === selector
    ) {
      return cached.selection;
    }

    const selection = selector
      ? selector(current)
      : (current as unknown as Selection);

    if (cached && Object.is(cached.selection, selection)) {
      cache.current = {
        state: current,
        selector,
        selection: cached.selection,
      };

      return cached.selection;
    }

    cache.current = { state: current, selector, selection };

    return selection;
  };

  return useSyncExternalStore(store.subscribe, getSnapshot, getSnapshot);
}
