import type React from "react";
import { useCallback, useMemo } from "react";

import { Slot } from "./slot";
import { createStore, type StoreApi, type UseBoundStore } from "./state";

import type {
  _SharedProps,
  Capitalize,
  FactoryStore,
  RegistryComponentProps,
  InitViewProps,
} from "../types";

type ViewProps<TProps extends object> = TProps & {
  close: () => void;
};

type ExtendedState<T> = T & {
  _injectedProps?: Record<string, unknown>;
};

type UseInnerContextHook<TState> = <TSelected = TState>(
  selector?: (state: TState) => TSelected,
) => TSelected;

type ValueProperties<T> = {
  [K in keyof T as T[K] extends (...args: never[]) => unknown
    ? never
    : K]: T[K];
};

type HookName = "beforeOpen" | "beforeClose";

const isHookName = (name: string): name is HookName =>
  name === "beforeOpen" || name === "beforeClose";

const capitalizeKey = <Key extends string>(key: Key) =>
  `${key.charAt(0).toUpperCase()}${key.slice(1)}` as Capitalize<Key>;

const setFactoryValue = <TKeys extends readonly string[]>(
  store: UseBoundStore<FactoryStore<TKeys>>,
  key: keyof FactoryStore<TKeys>,
  value: boolean,
) => (store.getState()[key] as (value: boolean) => void)(value);

export class PortalBuilder<
  TKeys extends readonly string[],
  TKey extends TKeys[number],
  TExtendedProps extends object = object,
  TExtendedState extends object = object,
  Extended extends boolean = false,
> {
  private key: TKey;
  private options: InitViewProps<TExtendedProps>;
  private RegistryComponent: React.ComponentType<RegistryComponentProps>;
  private innerStore: UseBoundStore<ExtendedState<TExtendedState>> | undefined;
  private useFactoryStore: UseBoundStore<FactoryStore<TKeys>>;
  private extended: boolean;

  constructor(
    key: TKey,
    useFactoryStore: UseBoundStore<FactoryStore<TKeys>>,
    HubItemComponent: React.ComponentType<RegistryComponentProps>,
    options: InitViewProps<TExtendedProps> = {} as InitViewProps<TExtendedProps>,
    extended: Extended = false as Extended,
  ) {
    this.key = key;
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

    newBuilder.innerStore = createStore<ExtendedState<TNewState>>(
      (set, get) => ({
        ...storeCreator(set, get),
      }),
    );

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
    state: TExtendedState | undefined,
  ): _SharedProps<TExtendedProps> {
    const shared: Record<string, unknown> = {};

    for (const name of Object.keys(this.options)) {
      if (isHookName(name)) continue;

      const value = (this.options as Record<string, unknown>)[name];
      shared[name] =
        typeof value === "function"
          ? (value as (state: TExtendedState | undefined) => unknown)(state)
          : value;
    }

    return shared as _SharedProps<TExtendedProps>;
  }

  private runHook(name: HookName) {
    const hook = this.options[name] as unknown as
      | ((
          state?: TExtendedState,
          api?: UseBoundStore<ExtendedState<TExtendedState>>,
        ) => void)
      | undefined;

    if (!hook) return;

    hook(this.innerStore?.getState(), this.innerStore);
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
    const setterKey = `set${capitalizeKey(key)}` as keyof FactoryStore<TKeys>;

    const RegistryComponent = this.RegistryComponent;
    const useInnerContextHook = this.getInnerStore()();
    const useFactoryStore = this.useFactoryStore;
    const innerStore = this.innerStore;
    const extended = this.extended;

    return (props: TProps) => {
      const isOpen = useFactoryStore((store) => store.states[key]);

      const openChange = useCallback((value: boolean) => {
        setFactoryValue(useFactoryStore, setterKey, value);
      }, []);

      const innerState = extended
        ? useInnerContextHook((state) => state)
        : undefined;
      const injectedProps = innerState?._injectedProps;

      const shared = useMemo(() => this.parseOptions(innerState), [innerState]);

      const close = useCallback(() => {
        this.runHook("beforeClose");

        if (innerStore && innerStore.getState()._injectedProps !== undefined) {
          innerStore.setState({ _injectedProps: undefined } as Partial<
            ExtendedState<TExtendedState>
          >);
        }

        openChange(false);
      }, [openChange]);

      const handleOpenChange = useCallback(
        (open: boolean) => {
          if (open) openChange(true);
          else close();
        },
        [close, openChange],
      );

      const componentProps = {
        ...injectedProps,
        ...props,
        close,
        ...(extended ? { useInnerContext: useInnerContextHook } : {}),
      } as React.ComponentProps<typeof Component>;

      return (
        <RegistryComponent
          open={isOpen}
          onOpenChange={handleOpenChange}
          {...shared}
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
    const setterKey =
      `set${capitalizeKey(this.key)}` as keyof FactoryStore<TKeys>;
    const portalStore = this.innerStore;
    const initialValues = portalStore?.getInitialState();
    const storeKeys = initialValues ? Object.keys(initialValues) : [];
    const storeValues: Partial<TExtendedState> = {
      ...(initialValues as TExtendedState | undefined),
    };
    const safeProps: Record<string, unknown> = {};

    for (const name in props) {
      if (!Object.prototype.hasOwnProperty.call(props, name)) continue;

      if (storeKeys.includes(name)) {
        storeValues[name as keyof TExtendedState] = (props as TExtendedState)[
          name as keyof TExtendedState
        ];
      } else {
        safeProps[name] = (props as Record<string, unknown>)[name];
      }
    }

    const { onClick: triggerClick, ...restProps } = safeProps as {
      onClick?: React.MouseEventHandler;
    } & Record<string, unknown>;

    const handleClick: React.MouseEventHandler = (event) => {
      triggerClick?.(event);

      if (portalStore) {
        portalStore.setState({
          ...storeValues,
          _injectedProps:
            (componentProps as Record<string, unknown> | undefined) ??
            undefined,
        } as Partial<ExtendedState<TExtendedState>>);
      }

      this.runHook("beforeOpen");
      before?.(portalStore?.getState());
      setFactoryValue(this.useFactoryStore, setterKey, true);
    };

    return <Slot onClick={handleClick} {...restProps} />;
  };
}
