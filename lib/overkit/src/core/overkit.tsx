import type React from "react";
import { PortalBuilder } from "./builder";
import { Registry, type RegistryItem, type RegistryItemMap } from "./registry";
import { Store } from "./store";
import type { RegistryComponentProps } from "../types";

export class Overkit<
  TKeys extends readonly string[],
  Items extends RegistryItemMap = Record<string, never>,
> extends Store<TKeys> {
  private registry: Registry<Items>;

  constructor(keys: TKeys) {
    super(keys);
    this.registry = new Registry<Items>();
  }

  private create<
    TKey extends TKeys[number],
    THubItemName extends keyof Items,
    ItemProps extends React.ComponentProps<Items[THubItemName]["render"]>,
  >(key: TKey, hubItemName: THubItemName) {
    const registryElement = this.registry.get(hubItemName);
    const RegistryComponent = registryElement.render;
    return new PortalBuilder<TKeys, TKey, Omit<ItemProps, keyof RegistryComponentProps>>(
      key,
      this.useOverkitStore,
      RegistryComponent,
    );
  }

  private get useOverkitStore() {
    return this.getStore();
  }

  with<THubItemName extends string, ItemProps extends object = object>(
    item: RegistryItem<THubItemName, ItemProps>,
  ): Overkit<TKeys, Items & Record<THubItemName, RegistryItem<THubItemName, ItemProps>>> {
    this.registry.add<THubItemName, ItemProps>(item);
    return this as Overkit<
      TKeys,
      Items & Record<THubItemName, RegistryItem<THubItemName, ItemProps>>
    >;
  }

  build() {
    return {
      create: this.create.bind(this),
      useOverkitStore: this.useOverkitStore,
    };
  }
}
