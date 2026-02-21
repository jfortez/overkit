"use client";

import {
  UserModalTrigger,
  UserModalView,
  SettingsDrawerTrigger,
  SettingsDrawerView,
  ConfirmDialogTrigger,
  ConfirmDialogView,
  ProductSheetTrigger,
  ProductSheetView,
  useOverkitStore,
} from "./components/overlays";

const States = () => {
  const userOpen = useOverkitStore((state) => state.states.userModal);
  const settingsOpen = useOverkitStore((state) => state.states.settingsDrawer);
  const confirmOpen = useOverkitStore((state) => state.states.confirmDialog);
  const productOpen = useOverkitStore((state) => state.states.productSheet);
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {[
        { name: "User Modal", open: userOpen },
        { name: "Settings", open: settingsOpen },
        { name: "Confirm", open: confirmOpen },
        { name: "Product", open: productOpen },
      ].map(({ name, open }) => (
        <div
          key={name}
          className="flex items-center gap-2 p-3 bg-zinc-50 dark:bg-zinc-800 rounded-lg"
        >
          <div className={`w-3 h-3 rounded-full ${open ? "bg-green-500" : "bg-zinc-300"}`} />
          <span className="text-sm font-medium">{name}</span>
          <span
            className={`ml-auto text-xs px-2 py-0.5 rounded-full ${
              open ? "bg-green-100 text-green-800" : "bg-zinc-200 text-zinc-600"
            }`}
          >
            {open ? "Open" : "Closed"}
          </span>
        </div>
      ))}
    </div>
  );
};

export default function Home() {
  return (
    <div className="min-h-screen bg-linear-to-br from-zinc-50 to-zinc-100 dark:from-zinc-950 dark:to-zinc-900 p-8">
      <main className="max-w-4xl mx-auto">
        <header className="mb-12 text-center">
          <h1 className="text-4xl font-bold mb-4">🎭 Overkit Demo</h1>
          <p className="text-lg text-zinc-600 dark:text-zinc-400">
            Simplified overlay management for React and Next.js
          </p>
        </header>

        <section className="mb-8">
          <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border p-6">
            <h2 className="text-lg font-semibold mb-4">Overlay States</h2>
            <States />
          </div>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border p-6">
            <h3 className="text-lg font-semibold mb-2">User Profile</h3>
            <p className="text-zinc-600 dark:text-zinc-400 mb-4 text-sm">
              Basic modal with close function
            </p>
            <UserModalTrigger>
              <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                Open Profile
              </button>
            </UserModalTrigger>
          </div>

          <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border p-6">
            <h3 className="text-lg font-semibold mb-2">Settings</h3>
            <p className="text-zinc-600 dark:text-zinc-400 mb-4 text-sm">
              Drawer component from the right
            </p>
            <SettingsDrawerTrigger>
              <button className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
                Open Settings
              </button>
            </SettingsDrawerTrigger>
          </div>

          <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border p-6">
            <h3 className="text-lg font-semibold mb-2">Confirm Action</h3>
            <p className="text-zinc-600 dark:text-zinc-400 mb-4 text-sm">
              Confirmation dialog with callbacks
            </p>
            <ConfirmDialogTrigger>
              <button className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
                Delete Account
              </button>
            </ConfirmDialogTrigger>
          </div>

          <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border p-6">
            <h3 className="text-lg font-semibold mb-2">Product Sheet</h3>
            <p className="text-zinc-600 dark:text-zinc-400 mb-4 text-sm">
              Dynamic title/description based on state
            </p>
            <div className="flex items-center gap-2">
              <ProductSheetTrigger mode="create">
                <button className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                  Create Product
                </button>
              </ProductSheetTrigger>
              <ProductSheetTrigger mode="edit">
                <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  Edit Product
                </button>
              </ProductSheetTrigger>
            </div>
          </div>
        </section>
      </main>

      <UserModalView />
      <SettingsDrawerView />
      <ConfirmDialogView />
      <ProductSheetView />
    </div>
  );
}
