import { describe, expect, it } from "vitest";

import { Overkit } from "../core/overkit";
import { createStore } from "../core/state";

describe("store", () => {
  it("no notifica cuando el updater devuelve el mismo estado", () => {
    const store = createStore<{ count: number }>(() => ({ count: 0 }));
    let notifications = 0;
    const unsubscribe = store.subscribe(() => {
      notifications += 1;
    });

    store.setState((state) => state);
    unsubscribe();

    expect(notifications).toBe(0);
  });

  it("deja de notificar después del unsubscribe", () => {
    const store = createStore<{ count: number }>(() => ({ count: 0 }));
    let notifications = 0;
    const unsubscribe = store.subscribe(() => {
      notifications += 1;
    });

    store.setState({ count: 1 });
    unsubscribe();
    store.setState({ count: 2 });

    expect(notifications).toBe(1);
  });

  it("no notifica al setear un overlay que ya tiene ese valor", () => {
    const o = new Overkit(["alpha"] as const).build();
    const store = o.useOverkitStore;
    const setAlpha = store.getState().setAlpha;

    let notifications = 0;
    const unsubscribe = store.subscribe(() => {
      notifications += 1;
    });

    setAlpha(true);
    setAlpha(true);

    unsubscribe();

    expect(notifications).toBe(1);
  });
});
