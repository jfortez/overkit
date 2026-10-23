import { createStore, type UseBoundStore } from "./state";
import type { FactoryStore, StoreSetters, StoreStates } from "../types";

export class Store<TKeys extends readonly string[]> {
  private factoryStore: UseBoundStore<FactoryStore<TKeys>>;
  private keys: TKeys;

  constructor(keys: TKeys) {
    this.keys = keys;
    this.factoryStore = this.createFactoryStore();
  }

  private createFactoryStore() {
    return createStore<FactoryStore<TKeys>>((set) => {
      const states = {} as StoreStates<TKeys>;
      for (const key of this.keys) {
        states[key as TKeys[number]] = false;
      }

      const setters = {} as StoreSetters<TKeys>;
      for (const key of this.keys) {
        const capitalizedKey = (key.charAt(0).toUpperCase() +
          key.slice(1)) as Capitalize<TKeys[number]>;
        const setterKey = `set${capitalizedKey}`;

        Object.assign(setters, {
          [setterKey]: (value: boolean) =>
            set((state) =>
              state.states[key as TKeys[number]] === value
                ? state
                : {
                    ...state,
                    states: { ...state.states, [key as TKeys[number]]: value },
                  },
            ),
        });
      }

      return { states, ...setters };
    });
  }

  public getStore = () => this.factoryStore;
}
