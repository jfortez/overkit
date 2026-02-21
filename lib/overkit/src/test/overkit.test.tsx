import React from "react";
import { describe, it, expect, beforeAll, beforeEach, afterEach } from "vitest";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  cleanup,
} from "@testing-library/react";
import { DialogRegistry } from "../test/base";
import { Overkit } from "../core/overkit";

function buildOverkit(keys: readonly string[]) {
  return new Overkit(keys).with(DialogRegistry).build();
}

describe("Overkit Integration", () => {
  let o: ReturnType<typeof buildOverkit>;
  let Trigger: React.ComponentType<{ children: React.ReactNode }>;
  let View: React.FC;

  beforeAll(() => {
    o = buildOverkit([
      "dialog1",
      "dialog2",
      "dialog3",
      "dialog4",
      "dialog5",
      "dialog6",
      "productDialog",
      "portalDialog",
      "multiPortalDialog",
    ] as const);
  });

  afterEach(() => {
    cleanup();
  });

  describe("Basic Dialog", () => {
    beforeAll(() => {
      const myDialog = o.create("dialog1", "dialog").configure({
        title: "Title",
        description: "Description",
      });

      Trigger = myDialog.trigger;
      View = myDialog.view(() => <div>Hello</div>);
    });

    it("should render dialog and open on trigger click", async () => {
      const App = () => (
        <div>
          <h1>Hello World</h1>
          <Trigger>
            <button>Open</button>
          </Trigger>
          <View />
        </div>
      );

      render(<App />);

      expect(screen.getByText("Hello World")).toBeInTheDocument();
      expect(screen.queryByTestId("dialog")).toBeNull();

      fireEvent.click(screen.getByText("Open"));

      await waitFor(() => {
        expect(screen.getByTestId("dialog")).toBeInTheDocument();
        expect(screen.getByTestId("dialog-title")).toHaveTextContent("Title");
        expect(screen.getByTestId("dialog-description")).toHaveTextContent(
          "Description",
        );
        expect(screen.getByText("Hello")).toBeInTheDocument();
      });
    });

    it("should close dialog when clicking backdrop", async () => {
      const App = () => (
        <div>
          <Trigger>
            <button>Open</button>
          </Trigger>
          <View />
        </div>
      );

      render(<App />);

      fireEvent.click(screen.getByText("Open"));
      await waitFor(() => {
        expect(screen.getByTestId("dialog")).toBeInTheDocument();
      });

      fireEvent.click(screen.getByTestId("dialog"));
      await waitFor(() => {
        expect(screen.queryByTestId("dialog")).toBeNull();
      });
    });
  });

  describe("Extended State", () => {
    it("should maintain extended state correctly", async () => {
      const myDialog = o
        .create("dialog3", "dialog")
        .extend<{ count: number }>(() => ({
          count: 0,
        }))
        .configure({
          title: "Counter Dialog",
          description: "Test extended state",
        });

      const Trigger3 = myDialog.trigger;
      const TestComponent = myDialog.view(({ useInnerContext }) => {
        const count = useInnerContext(
          (state: { count: number }) => state.count,
        );
        return <div>Count: {count}</div>;
      });

      const App = () => (
        <div>
          <Trigger3 count={0}>
            <button>Open</button>
          </Trigger3>
          <TestComponent />
        </div>
      );

      render(<App />);

      fireEvent.click(screen.getByText("Open"));

      await waitFor(() => {
        expect(screen.getByTestId("dialog-title")).toHaveTextContent(
          "Counter Dialog",
        );
        expect(screen.getByText("Count: 0")).toBeInTheDocument();
      });
    });

    it("should open with different counter value", async () => {
      const myDialog = o
        .create("dialog4", "dialog")
        .extend<{ count: number }>(() => ({
          count: 0,
        }))
        .configure({
          title: "Counter Dialog",
          description: "Test with value 100",
        });

      const Trigger4 = myDialog.trigger;
      const TestComponent = myDialog.view(({ useInnerContext }) => {
        const count = useInnerContext(
          (state: { count: number }) => state.count,
        );
        return <div>Count: {count}</div>;
      });

      const App = () => (
        <div>
          <Trigger4 count={100}>
            <button>Open with 100</button>
          </Trigger4>
          <TestComponent />
        </div>
      );

      render(<App />);

      fireEvent.click(screen.getByText("Open with 100"));

      await waitFor(() => {
        expect(screen.getByTestId("dialog-title")).toHaveTextContent(
          "Counter Dialog",
        );
        expect(screen.getByText("Count: 100")).toBeInTheDocument();
      });
    });
  });

  describe("Component Props", () => {
    it("should pass componentProps to view", async () => {
      type FormProps = {
        items?: string[];
      };

      const myDialog = o
        .create("dialog5", "dialog")
        .extend<object>(() => ({}))
        .configure({
          title: "Form Dialog",
          description: "Test component props",
        });

      const Trigger5 = myDialog.trigger<FormProps>;
      const FormView = myDialog.view<FormProps>(({ items }) => (
        <ul>
          {items?.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      ));

      const App = () => (
        <div>
          <Trigger5
            componentProps={{
              items: ["Item 1", "Item 2", "Item 3"],
            }}
          >
            <button>Open Form</button>
          </Trigger5>
          <FormView />
        </div>
      );

      render(<App />);

      fireEvent.click(screen.getByText("Open Form"));

      await waitFor(() => {
        expect(screen.getByText("Item 1")).toBeInTheDocument();
        expect(screen.getByText("Item 2")).toBeInTheDocument();
        expect(screen.getByText("Item 3")).toBeInTheDocument();
      });
    });
  });

  describe("Close Function", () => {
    it("should close dialog from inside view", async () => {
      const myDialog = o.create("dialog6", "dialog").configure({
        title: "Close Test",
        description: "Test close function",
      });

      const Trigger6 = myDialog.trigger;
      const TestView = myDialog.view(({ close }) => (
        <div>
          <p>Dialog Content</p>
          <button onClick={close}>Close from Inside</button>
        </div>
      ));

      const App = () => (
        <div>
          <Trigger6>
            <button>Open</button>
          </Trigger6>
          <TestView />
        </div>
      );

      render(<App />);

      fireEvent.click(screen.getByText("Open"));
      await waitFor(() => {
        expect(screen.getByTestId("dialog")).toBeInTheDocument();
        expect(screen.getByText("Dialog Content")).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText("Close from Inside"));
      await waitFor(() => {
        expect(screen.queryByTestId("dialog")).toBeNull();
      });
    });
  });

  describe("Dynamic Configuration", () => {
    it("should configure title and description based on store state", async () => {
      type ProductState = {
        mode: "create" | "edit";
        setMode: (mode: "create" | "edit") => void;
      };

      const productDialog = o
        .create("productDialog", "dialog")
        .extend<ProductState>((set) => ({
          mode: "create",
          setMode: (mode: "create" | "edit") => set({ mode }),
        }))
        .configure({
          title: (store: ProductState | undefined) =>
            store?.mode === "create" ? "Create Product" : "Edit Product",
          description: (store: ProductState | undefined) =>
            store?.mode === "create"
              ? "Fill in the details to create a product"
              : "Fill in the details to edit the product",
          className: (store: ProductState | undefined) =>
            store?.mode === "create" ? "mode-create" : "mode-edit",
        });

      const TriggerProduct = productDialog.trigger<{
        mode?: "create" | "edit";
      }>;
      const ViewProduct = productDialog.view<{ mode?: "create" | "edit" }>(
        (props: any) => {
          const mode = props.useInnerContext?.(
            (state: ProductState) => state.mode,
          );
          const setMode = props.useInnerContext?.(
            (state: ProductState) => state.setMode,
          );
          return (
            <div>
              <p data-testid="current-mode">Mode: {mode || "create"}</p>
              <button
                onClick={() => setMode?.(mode === "create" ? "edit" : "create")}
              >
                Toggle Mode
              </button>
            </div>
          );
        },
      );

      const App = () => (
        <div>
          <TriggerProduct mode="create">
            <button>Open Product Dialog</button>
          </TriggerProduct>
          <ViewProduct />
        </div>
      );

      render(<App />);

      fireEvent.click(screen.getByText("Open Product Dialog"));

      await waitFor(() => {
        expect(screen.getByTestId("dialog-title")).toHaveTextContent(
          "Create Product",
        );
        expect(screen.getByTestId("dialog-description")).toHaveTextContent(
          "Fill in the details to create a product",
        );
        expect(screen.getByTestId("current-mode")).toHaveTextContent(
          "Mode: create",
        );
      });

      const dialogContent = screen.getByTestId("dialog");
      expect(dialogContent).toHaveClass("mode-create");

      fireEvent.click(screen.getByText("Toggle Mode"));

      await waitFor(() => {
        expect(screen.getByTestId("current-mode")).toHaveTextContent(
          "Mode: edit",
        );
      });
    });
  });

  describe("Portal (tunnel-rat)", () => {
    it("should render In content through portal", async () => {
      const portalDialog = o.create("portalDialog", "dialog").configure({
        title: "Portal Test",
        description: "Testing tunnel-rat portal functionality",
      });

      const TriggerPortal = portalDialog.trigger;
      const PortalView = portalDialog.view(({ close, In }) => (
        <div>
          <p data-testid="main-content">Main Dialog Content</p>
          <In>
            <div data-testid="portal-content">Portal Content</div>
            <button data-testid="portal-button" onClick={close}>
              Close
            </button>
          </In>
        </div>
      ));

      const App = () => (
        <div>
          <TriggerPortal>
            <button>Open Portal Dialog</button>
          </TriggerPortal>
          <PortalView />
        </div>
      );

      render(<App />);

      expect(screen.queryByTestId("dialog")).toBeNull();

      fireEvent.click(screen.getByText("Open Portal Dialog"));

      await waitFor(() => {
        expect(screen.getByTestId("dialog")).toBeInTheDocument();
        expect(screen.getByTestId("main-content")).toBeInTheDocument();
        expect(screen.getByTestId("portal-button")).toBeInTheDocument();
      });

      expect(screen.getByTestId("portal-button")).toHaveTextContent("Close");

      fireEvent.click(screen.getByTestId("portal-button"));

      await waitFor(() => {
        expect(screen.queryByTestId("dialog")).toBeNull();
      });
    });

    it("should render multiple portal elements", async () => {
      const multiPortalDialog = o
        .create("multiPortalDialog", "dialog")
        .configure({
          title: "Multi Portal Test",
          description: "Testing multiple tunnel-rat portals",
        });

      const TriggerMulti = multiPortalDialog.trigger;
      const MultiPortalView = multiPortalDialog.view(({ In }: { In?: any }) => (
        <div>
          <p data-testid="content-1">First Content</p>
          <In>
            <div data-testid="portal-content-1">Portal Item 1</div>
            <div data-testid="portal-content-2">Portal Item 2</div>
            <button data-testid="portal-action">Portal Action</button>
          </In>
          <p data-testid="content-2">Second Content</p>
        </div>
      ));

      const App = () => (
        <div>
          <TriggerMulti>
            <button>Open Multi Portal</button>
          </TriggerMulti>
          <MultiPortalView />
        </div>
      );

      render(<App />);

      fireEvent.click(screen.getByText("Open Multi Portal"));

      await waitFor(() => {
        expect(screen.getByTestId("dialog")).toBeInTheDocument();
        expect(screen.getByTestId("content-1")).toBeInTheDocument();
        expect(screen.getByTestId("content-2")).toBeInTheDocument();
        expect(screen.getByTestId("portal-content-1")).toBeInTheDocument();
        expect(screen.getByTestId("portal-content-2")).toBeInTheDocument();
        expect(screen.getByTestId("portal-action")).toBeInTheDocument();
      });

      expect(screen.getByTestId("portal-content-1")).toHaveTextContent(
        "Portal Item 1",
      );
      expect(screen.getByTestId("portal-content-2")).toHaveTextContent(
        "Portal Item 2",
      );
      expect(screen.getByTestId("portal-action")).toHaveTextContent(
        "Portal Action",
      );
    });
  });
});
