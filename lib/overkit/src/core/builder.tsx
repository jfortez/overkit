/* eslint-disable @typescript-eslint/no-explicit-any */
import { Slot } from "@radix-ui/react-slot";
import type React from "react";
import { useCallback, useMemo } from "react";
import tunnel from "tunnel-rat";
import { create, type StoreApi, type UseBoundStore } from "zustand";

import type {
  _SharedProps,
  Capitalize,
  FactoryStore,
  RegistryComponentProps,
  InitViewProps,
} from "../types";

type ViewProps<TProps extends object> = TProps & {
  close: () => void;
  In: ReturnType<typeof tunnel>["In"];
};

type ExtendedState<T> = T & {
  _internal?: any;

  _injectedProps?: Record<string, any>;
};

type UseInnerContextHook<TState> = <TSelected = TState>(
  selector?: (state: TState) => TSelected,
) => TSelected;

type ValueProperties<T> = {
  [K in keyof T as T[K] extends (...args: any[]) => any ? never : K]: T[K];
};

const HOOKS = ["beforeOpen", "beforeClose"];

export class PortalBuilder<
  TKeys extends readonly string[],
  TKey extends TKeys[number],
  TExtendedProps extends object = object,
  TExtendedState extends object = object,
  Extended extends boolean = false,
> {
  private key: TKey;
  private t: ReturnType<typeof tunnel>;
  private options: InitViewProps<TExtendedProps>;
  private RegistryComponent: React.ComponentType<RegistryComponentProps>;
  private innerStore?: UseBoundStore<StoreApi<ExtendedState<TExtendedState>>>;
  private useFactoryStore: UseBoundStore<StoreApi<FactoryStore<TKeys>>>;
  private extended: boolean;

  constructor(
    key: TKey,
    useFactoryStore: UseBoundStore<StoreApi<FactoryStore<TKeys>>>,
    HubItemComponent: React.ComponentType<RegistryComponentProps>,
    options: InitViewProps<TExtendedProps> = {} as InitViewProps<TExtendedProps>,
    extended: Extended = false as Extended,
  ) {
    this.key = key;
    this.t = tunnel();
    this.options = options;
    this.RegistryComponent = HubItemComponent;
    this.useFactoryStore = useFactoryStore;
    this.extended = extended;
  }

  configure(
    options: InitViewProps<
      TExtendedProps,
      Extended extends true ? TExtendedState : never
    >,
  ): PortalBuilder<TKeys, TKey, TExtendedProps, TExtendedState, Extended> {
    const newBuilder = new PortalBuilder<
      TKeys,
      TKey,
      TExtendedProps,
      TExtendedState,
      Extended
    >(
      this.key,
      this.useFactoryStore,
      this.RegistryComponent,
      { ...this.options, ...options },
      this.extended as Extended,
    );
    newBuilder.t = this.t;
    newBuilder.innerStore = this.innerStore;

    return newBuilder;
  }

  extend<TNewState extends object>(
    storeCreator: (
      set: StoreApi<ExtendedState<TNewState>>["setState"],
      get: StoreApi<ExtendedState<TNewState>>["getState"],
    ) => TNewState,
  ): PortalBuilder<TKeys, TKey, TExtendedProps, TNewState, true> {
    const newBuilder = new PortalBuilder<
      TKeys,
      TKey,
      TExtendedProps,
      TNewState,
      true
    >(
      this.key,
      this.useFactoryStore,
      this.RegistryComponent,
      this.options,
      true,
    );
    newBuilder.t = this.t;

    newBuilder.innerStore = create<ExtendedState<TNewState>>()((set, get) => ({
      ...storeCreator(set, get),
    }));

    // TODO: omit extended state from newBuilder
    return newBuilder;
  }

  private getInnerStore = () => {
    const innerStore = this.innerStore;

    return () => innerStore!;
  };

  get useInnerContext(): Extended extends true
    ? UseInnerContextHook<TExtendedState>
    : never {
    return this.getInnerStore() as Extended extends true
      ? UseInnerContextHook<TExtendedState>
      : never;
  }

  private parseOptions(
    options: InitViewProps<TExtendedProps>,
  ): _SharedProps<TExtendedProps> {
    const innerStore = this.innerStore;

    const parsedOptions = Object.fromEntries(
      Object.entries(options).map(([key, value]) => {
        const state = innerStore?.getState() || ({} as TExtendedState);
        if (typeof value === "function") {
          const isHook = HOOKS.includes(key);
          if (isHook) {
            const fn = (
              store?: TExtendedState,
              storeApi?: StoreApi<TExtendedState>,
            ) => {
              return () =>
                (
                  value as (
                    store?: TExtendedState,
                    storeApi?: StoreApi<TExtendedState>,
                  ) => void
                )(store, storeApi);
            };
            return [key, fn(state, innerStore)];
          }
          const resolvedValue = value(state);
          return [key, resolvedValue];
        }
        return [key, value];
      }),
    ) as _SharedProps<TExtendedProps>;

    return parsedOptions;
  }

  view = <TProps extends object = object>(
    Component: React.ComponentType<
      ViewProps<
        TProps &
          (Extended extends true
            ? {
                useInnerContext: UseInnerContextHook<TExtendedState>;
              }
            : object)
      >
    >,
  ): React.FC<TProps> => {
    const key = this.key;
    const t = this.t;

    const RegistryComponent = this.RegistryComponent;
    const useInnerContextHook = this.getInnerStore()();
    const useFactoryStore = this.useFactoryStore;

    return (props: TProps) => {
      const isOpen = useFactoryStore((store) => store.states[key]);
      const capitalize = (key.charAt(0).toUpperCase() +
        key.slice(1)) as Capitalize<TKey>;
      const openChange = useFactoryStore(
        (store) =>
          store[`set${capitalize}` as keyof typeof store] as (
            value: boolean,
          ) => void,
      );

      const injectedProps = this.extended
        ? useInnerContextHook((state) => state._injectedProps)
        : undefined;

      const options = this.parseOptions(this.options);

      const innerStore = this.innerStore;

      const close = useCallback(() => {
        options?.beforeClose?.();
        // Clear injected props when closing
        if (innerStore) {
          innerStore.setState({ _injectedProps: undefined } as Partial<
            ExtendedState<TExtendedState>
          >);
        }
        openChange(false);
      }, [openChange, options, innerStore]);

      const componentProps: any = {
        ...injectedProps,
        ...props,
        close,
        In: t.In,
      };

      if (this.extended) {
        componentProps.useInnerContext = useInnerContextHook;
      }

      return (
        <RegistryComponent
          open={isOpen}
          onOpenChange={openChange}
          t={t}
          {...options}
        >
          <Component {...componentProps} />
        </RegistryComponent>
      );
    };
  };

  trigger = <
    THubComponentProps extends object = object,
    TProps extends object = object,
  >({
    before,
    componentProps,
    ...props
  }: TProps & {
    before?: (innerStore?: TExtendedState) => void;
    componentProps?: Partial<THubComponentProps>;
    children?: React.ReactNode;
  } & ValueProperties<TExtendedState>) => {
    const key = this.key;
    const capitalize = (key.charAt(0).toUpperCase() +
      key.slice(1)) as Capitalize<TKey>;

    const openChange = this.useFactoryStore(
      (store) =>
        store[`set${capitalize}` as keyof typeof store] as (
          value: boolean,
        ) => void,
    );

    // eslint-disable-next-line react-hooks/rules-of-hooks
    const { safeProps, innerStoreValues } = useMemo(() => {
      // return safeProps values that is included in this.innerStore.getInitialState()
      const portalStore = this.innerStore;

      if (!portalStore)
        return { safeProps: props, innerStoreValues: undefined };
      const innerStoreDefaultValues = this.innerStore!.getInitialState();
      const storeKeys = Object.keys(innerStoreDefaultValues);

      const safeProps: Record<string, unknown> = {};
      const innerStoreValues: Partial<TExtendedState> = {
        ...innerStoreDefaultValues,
      };

      for (const key in props) {
        if (Object.prototype.hasOwnProperty.call(props, key)) {
          if (!storeKeys.includes(key)) {
            safeProps[key] = (props as Record<string, unknown>)[key];
          } else {
            innerStoreValues[key as keyof TExtendedState] = (
              props as TExtendedState
            )[key as keyof TExtendedState];
          }
        }
      }

      return { safeProps, innerStoreValues };
    }, [props]);

    const handleClick = () => {
      const portalStore = this.innerStore;
      const options = this.parseOptions(this.options);
      const innerStore = portalStore?.getState();

      options?.beforeOpen?.();

      if (portalStore) {
        const stateUpdate = {
          ...innerStoreValues,
          _injectedProps: (componentProps as any) ?? undefined,
        } as Partial<ExtendedState<TExtendedState>>;

        portalStore.setState(stateUpdate);
      }

      before?.(innerStore);
      openChange(true);
    };

    return <Slot onClick={handleClick} {...safeProps} />;
  };
}
