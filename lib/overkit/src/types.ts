import type React from 'react';
import type tunnel from 'tunnel-rat';
import type { StoreApi } from 'zustand';

export type Capitalize<S extends string> = S extends `${infer F}${infer R}`
	? `${Uppercase<F>}${R}`
	: S;

export type StoreStates<TKeys extends readonly string[]> = {
	[K in TKeys[number]]: boolean;
};

export type StoreSetters<TKeys extends readonly string[]> = {
	[K in TKeys[number]as `set${Capitalize<K>}`]: (value: boolean) => void;
};

export type FactoryStore<TKeys extends readonly string[]> = {
	states: StoreStates<TKeys>;
} & StoreSetters<TKeys>;

type ValueOrFunction<T, Store> = T | ((value: Store) => T);

export type _SharedProps<ExtendedProps extends object = object> =
	ExtendedProps & {
		title: string;
		description: string;
		className: string;
		beforeOpen?: () => void;
		beforeClose?: () => void;
	};

export type RegistryHooks<Store = unknown> = {
	beforeOpen?: (store?: Store, api?: StoreApi<Store>) => void;
	beforeClose?: (store?: Store, api?: StoreApi<Store>) => void;
};

export type InitViewProps<
	ExtendedProps extends object = object,
	Store = unknown
> = ExtendedProps & {
	[K in keyof Omit<_SharedProps, keyof RegistryHooks>]?: ValueOrFunction<
		_SharedProps[K],
		Store
	>;
} & RegistryHooks<Store>;
export type RegistryComponentProps<ExtendedProps extends object = object> = {
	children?: React.ReactNode;
	open?: boolean;
	onOpenChange?: (open: boolean) => void;
	t: ReturnType<typeof tunnel>;
} & _SharedProps<ExtendedProps>;
