"use client";

import { Overkit, registry, type RegistryComponentProps } from "overkit";
import { X } from "lucide-react";

// Registry Component - Modal
const Modal = ({
  open,
  onOpenChange,
  title,
  description,
  className,
  children,
}: RegistryComponentProps) => {
  if (!open) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm ${
        className || ""
      }`}
      onClick={() => onOpenChange?.(false)}
    >
      <div
        className="relative bg-white dark:bg-zinc-900 rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={() => onOpenChange?.(false)}
          className="absolute top-4 right-4 p-1 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
        >
          <X className="w-5 h-5 text-zinc-500" />
        </button>

        {title && (
          <h2 className="text-xl font-bold mb-2 text-zinc-900 dark:text-zinc-100 pr-8">{title}</h2>
        )}
        {description && <p className="text-zinc-600 dark:text-zinc-400 mb-4">{description}</p>}

        {children}
      </div>
    </div>
  );
};

const ModalRegistry = registry({
  name: "modal",
  render: Modal,
});

// Registry Component - Drawer
const Drawer = ({
  open,
  onOpenChange,
  title,
  description,
  className,
  children,
}: RegistryComponentProps) => {
  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/30" onClick={() => onOpenChange?.(false)} />
      <div
        className={`fixed right-0 top-0 h-full z-50 bg-white dark:bg-zinc-900 shadow-2xl border-l border-zinc-200 dark:border-zinc-800 w-full max-w-md ${
          className || ""
        }`}
      >
        <div className="p-6 h-full flex flex-col">
          <div className="flex justify-between items-center mb-4">
            {title && (
              <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">{title}</h2>
            )}
            <button
              onClick={() => onOpenChange?.(false)}
              className="p-1 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              <X className="w-5 h-5 text-zinc-500" />
            </button>
          </div>

          {description && <p className="text-zinc-600 dark:text-zinc-400 mb-4">{description}</p>}

          <div className="flex-1">{children}</div>
        </div>
      </div>
    </>
  );
};

const DrawerRegistry = registry({
  name: "drawer",
  render: Drawer,
});

// Create Overkit instance
const o = new Overkit(["userModal", "settingsDrawer", "confirmDialog", "productSheet"] as const)
  .with(ModalRegistry)
  .with(DrawerRegistry)
  .build();

// 1. User Dialog - Basic modal with close function
const userDialog = o.create("userModal", "modal").configure({
  title: "User Profile",
  description: "Manage your personal information",
});

export const UserModalTrigger = userDialog.trigger;
export const UserModalView = userDialog.view(({ close }) => (
  <div className="space-y-4">
    <div className="flex items-center gap-4 p-4 bg-zinc-50 dark:bg-zinc-800 rounded-lg">
      <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
        JD
      </div>
      <div>
        <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">John Doe</h3>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">john.doe@example.com</p>
      </div>
    </div>

    <div className="space-y-3">
      <label className="block">
        <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Full Name</span>
        <input
          type="text"
          defaultValue="John Doe"
          className="mt-1 w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-md bg-white dark:bg-zinc-800"
        />
      </label>
    </div>

    <div className="flex gap-3 pt-4 border-t border-zinc-200 dark:border-zinc-700">
      <button
        onClick={close}
        className="flex-1 px-4 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800"
      >
        Cancel
      </button>
      <button
        onClick={() => {
          alert("Profile saved!");
          close?.();
        }}
        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
      >
        Save
      </button>
    </div>
  </div>
));

// 2. Settings Drawer
const settingsDialog = o.create("settingsDrawer", "drawer").configure({
  title: "Settings",
  description: "Customize your experience",
});

export const SettingsDrawerTrigger = settingsDialog.trigger;
export const SettingsDrawerView = settingsDialog.view(({ close }) => (
  <div className="space-y-6">
    <div className="space-y-4">
      <h3 className="text-sm font-semibold uppercase tracking-wider">Preferences</h3>

      {["Notifications", "Dark Mode", "Auto-save"].map((item) => (
        <label
          key={item}
          className="flex items-center justify-between p-3 bg-zinc-50 dark:bg-zinc-800 rounded-lg cursor-pointer"
        >
          <span className="font-medium">{item}</span>
          <input type="checkbox" defaultChecked className="w-5 h-5" />
        </label>
      ))}
    </div>

    <button
      onClick={close}
      className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
    >
      Save Settings
    </button>
  </div>
));

// 3. Confirm Dialog with close function
const confirmDialog = o.create("confirmDialog", "modal").configure({
  title: "Confirm Action",
  description: "Are you sure you want to proceed?",
});

export const ConfirmDialogTrigger = confirmDialog.trigger;
export const ConfirmDialogView = confirmDialog.view(({ close }) => (
  <div className="space-y-4">
    <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
      <p className="text-sm text-amber-800 dark:text-amber-200">
        This action cannot be undone. All associated data will be permanently deleted.
      </p>
    </div>

    <div className="flex gap-3">
      <button
        onClick={close}
        className="flex-1 px-4 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg hover:bg-zinc-50"
      >
        Cancel
      </button>
      <button
        onClick={() => {
          alert("Action confirmed!");
          close?.();
        }}
        className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
      >
        Confirm
      </button>
    </div>
  </div>
));

// 4. Product Sheet with Dynamic Configuration
const productDialog = o
  .create("productSheet", "modal")
  .extend<{
    mode: "create" | "edit";
    setMode: (mode: "create" | "edit") => void;
  }>((set) => ({
    mode: "create",
    setMode: (mode) => set({ mode }),
  }))
  .configure({
    title: (store) => (store?.mode === "create" ? "Create Product" : "Edit Product"),
    description: (store) =>
      store?.mode === "create"
        ? "Fill in the details to create a product"
        : "Fill in the details to edit the product",
    className: (store) =>
      store?.mode === "create" ? "border-l-4 border-green-500" : "border-l-4 border-blue-500",
  });

export const ProductSheetTrigger = productDialog.trigger;
export const ProductSheetView = productDialog.view(({ close, useInnerContext }) => {
  const mode = useInnerContext((state) => state.mode);
  const setMode = useInnerContext((state) => state.setMode);

  return (
    <div className="space-y-4">
      <div className="p-3 bg-zinc-50 dark:bg-zinc-800 rounded-lg">
        <p className="text-sm font-medium">
          Current Mode:{" "}
          <span className={mode === "create" ? "text-green-600" : "text-blue-600"}>{mode}</span>
        </p>
      </div>

      <div className="space-y-3">
        <label className="block">
          <span className="text-sm font-medium">Product Name</span>
          <input
            type="text"
            placeholder="Enter product name"
            className="mt-1 w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-md"
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium">Price</span>
          <input
            type="number"
            placeholder="0.00"
            className="mt-1 w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-md"
          />
        </label>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => setMode("create")}
          className={`px-3 py-1.5 text-sm rounded-lg ${
            mode === "create" ? "bg-green-600 text-white" : "bg-zinc-200 dark:bg-zinc-700"
          }`}
        >
          Create Mode
        </button>
        <button
          onClick={() => setMode("edit")}
          className={`px-3 py-1.5 text-sm rounded-lg ${
            mode === "edit" ? "bg-blue-600 text-white" : "bg-zinc-200 dark:bg-zinc-700"
          }`}
        >
          Edit Mode
        </button>
      </div>

      <div className="flex gap-3 pt-4 border-t border-zinc-200 dark:border-zinc-700">
        <button
          onClick={close}
          className="flex-1 px-4 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg"
        >
          Cancel
        </button>
        <button
          onClick={() => {
            alert(`${mode === "create" ? "Created" : "Updated"} successfully!`);
            close?.();
          }}
          className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          {mode === "create" ? "Create" : "Save"} Product
        </button>
      </div>
    </div>
  );
});

// Exports
export const useOverkitStore = o.useOverkitStore;
