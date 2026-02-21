# Overkit

Simplified overlay management system for React and Next.js. Uses Zustand for state management and allows creating modals, drawers, sheets, and more with ease.

## Features

- **Centralized State**: State management with Zustand
- **Simple Triggers**: Open overlays with a single click
- **Portals**: Flexible rendering with tunnel-rat
- **TypeScript**: Complete and safe typing
- **Dynamic Configuration**: Props based on store state
- **Built-in Hooks**: Access state from any component

## Installation

```bash
npm install overkit
# or
yarn add overkit
# or
pnpm add overkit
```

## Dependencies

```bash
npm install zustand @radix-ui/react-slot tunnel-rat
```

## Basic Usage

### 1. Create a Registry

First, create a base component that will serve as the overlay (Modal, Drawer, Sheet, etc.):

```tsx
// components/modal.tsx
import { registry, type RegistryComponentProps } from "overkit";

const Modal = ({
  open,
  onOpenChange,
  title,
  description,
  children,
}: RegistryComponentProps) => {
  if (!open) return null;

  return (
    <div className="modal-backdrop" onClick={() => onOpenChange?.(false)}>
      <div className="modal-content">
        <h2>{title}</h2>
        <p>{description}</p>
        {children}
      </div>
    </div>
  );
};

export const ModalRegistry = registry({
  name: "modal",
  render: Modal,
});
```

### 2. Configure Overkit

```tsx
// overlays.tsx
import { Overkit } from "overkit";
import { ModalRegistry } from "./modal";

const o = new Overkit(["userModal", "confirmDialog"] as const)
  .with(ModalRegistry)
  .build();

// Create simple overlay
const userDialog = o.create("userModal", "modal").configure({
  title: "User Profile",
  description: "Manage your profile information",
});

// Create overlay with extended state
const confirmDialog = o
  .create("confirmDialog", "modal")
  .extend<{ message: string }>(() => ({
    message: "",
  }))
  .configure({
    title: "Confirm Action",
    description: "Are you sure?",
  });

// Export components
export const UserModalTrigger = userDialog.trigger;
export const UserModalView = userDialog.view;

export const ConfirmTrigger = confirmDialog.trigger;
export const ConfirmView = confirmDialog.view;
export const useOverkitStore = o.useOverkitStore;
```

### 3. Use in Your App

```tsx
// page.tsx
import { UserModalTrigger, UserModalView } from "./overlays";

export default function Page() {
  return (
    <div>
      <UserModalTrigger>
        <button>Open User Modal</button>
      </UserModalTrigger>

      <UserModalView />
    </div>
  );
}
```

## API

### `Overkit`

The main class for creating and managing overlays.

```tsx
const o = new Overkit(["key1", "key2"] as const).with(RegistryItem).build();
```

### `.create(key, registryName)`

Creates a new overlay.

```tsx
const dialog = o.create("myDialog", "modal");
```

### `.extend<State>(storeCreator)`

Extends the overlay state with additional properties.

```tsx
const dialog = o
  .create("myDialog", "modal")
  .extend<{ count: number }>((set) => ({
    count: 0,
    increment: () => set((state) => ({ count: state.count + 1 })),
  }));
```

### `.configure(options)`

Configures the overlay properties. You can use static values or functions that receive the store:

```tsx
const dialog = o
  .create("productDialog", "modal")
  .extend<{ mode: "create" | "edit" }>((set) => ({
    mode: "create",
    setMode: (mode) => set({ mode }),
  }))
  .configure({
    // Static values
    title: "Product",

    // Functions with store access
    title: (store) =>
      store?.mode === "create" ? "Create Product" : "Edit Product",
    description: (store) =>
      store?.mode === "create"
        ? "Create a new product"
        : "Edit existing product",
    className: (store) =>
      store?.mode === "create" ? "mode-create" : "mode-edit",
  });
```

### `trigger`

Component to open the overlay.

```tsx
<Trigger>
  <button>Open</button>
</Trigger>

// With initial store values
<Trigger count={100}>
  <button>Open with 100</button>
</Trigger>

// With componentProps for the view
<Trigger componentProps={{ items: ["a", "b", "c"] }}>
  <button>Open with Items</button>
</Trigger>
```

### `view`

Component that renders the overlay content.

```tsx
// Basic
const View = dialog.view(() => <div>Content</div>);

// With props
const View = dialog.view<{ items: string[] }>(({ items }) => (
  <ul>
    {items.map((item) => (
      <li key={item}>{item}</li>
    ))}
  </ul>
));

// With close function
const View = dialog.view(({ close }) => (
  <div>
    <button onClick={close}>Close</button>
  </div>
));

// With useInnerContext (requires .extend())
const View = dialog.view(({ useInnerContext }) => {
  const count = useInnerContext((state) => state.count);
  const increment = useInnerContext((state) => state.increment);

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={increment}>Increment</button>
    </div>
  );
});
```

### `useOverkitStore`

Hook to access the global state of all overlays.

```tsx
const isOpen = useOverkitStore((state) => state.states.myDialog);
const setOpen = useOverkitStore((state) => state.setMyDialog);

// Open/close programmatically
setOpen(true);
setOpen(false);
```

## Advanced Examples

### Product Sheet (Create/Edit)

```tsx
const productSheet = o
  .create("productSheet", "Sheet")
  .extend<ProductState>((set) => ({
    mode: "create",
    setMode: (mode) => set({ mode }),
  }))
  .configure({
    title: (store) => {
      return store?.mode === "create" ? "Create a Product" : "Edit Product";
    },
    description: (store) => {
      return store?.mode === "create"
        ? "Fill in the details of the product you want to create"
        : "Fill in the details of the product you want to edit";
    },
    className: "!max-w-none w-3/8",
  });
```

### Counter with Extended State

```tsx
const counterDialog = o
  .create("counter", "modal")
  .extend<{ count: number }>((set) => ({
    count: 0,
  }))
  .configure({
    title: "Counter Dialog",
  });

// Open with initial value
<counterDialog.trigger count={100}>
  <button>Open with 100</button>
</counterDialog.trigger>;

// Use in the view
const CounterView = counterDialog.view(({ useInnerContext }) => {
  const count = useInnerContext((state) => state.count);
  return <div>Count: {count}</div>;
});
```

## TypeScript

Overkit is fully typed. When creating overlays, types are automatically inferred:

```tsx
// Keys are validated at compile time
const o = new Overkit(["dialog1", "dialog2"] as const);

// TypeScript knows only "dialog1" and "dialog2" are valid
o.create("dialog1", "modal"); // ✅
o.create("dialog3", "modal"); // ❌ Type error
```

## License

MIT
