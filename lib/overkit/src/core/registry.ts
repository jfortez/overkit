import type React from 'react';
import type { RegistryComponentProps, InitViewProps } from '../types';
export type { RegistryComponentProps }


export interface RegistryItem<
  Key extends string = string,
  OtherProps extends object = object
> {
  name: Key;
  render: (
    opt: RegistryComponentProps & InitViewProps<OtherProps>
  ) => React.ReactElement | null
}

export const registry = <
  Key extends string = string,
  ItemProps extends object = object
>(
  config: RegistryItem<Key, ItemProps>
): RegistryItem<Key, ItemProps> => {
  return {
    name: config.name,
    render: config.render,
  };
};


export type RegistryItemMap = Record<string, RegistryItem<any, any>>;

export class Registry<
  Items extends RegistryItemMap = Record<string, never>
> {
  private items: RegistryItem<string, object>[] = [];

  add<Key extends string, ItemProps extends object = object>(
    config: RegistryItem<Key, ItemProps>
  ): Registry<Items & Record<Key, RegistryItem<Key, ItemProps>>> {
    this.items.push(config as unknown as RegistryItem<string, object>);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return this as any as Registry<
      Items & Record<Key, RegistryItem<Key, ItemProps>>
    >;
  }

  get<Key extends keyof Items>(key: Key): Items[Key] {
    const item = this.items.find((item) => item.name === key);
    if (!item) throw new Error(`Item ${String(key)} not found`);
    return item as Items[Key];
  }
}
