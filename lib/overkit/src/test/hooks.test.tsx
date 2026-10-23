import { afterEach, describe, expect, it, vi } from "vitest";
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from "@testing-library/react";

import { Overkit } from "../core/overkit";
import { registry } from "../core/registry";
import { DialogRegistry } from "./base";

afterEach(() => cleanup());

const o = new Overkit(["hooks1", "hooks2", "hooks3", "hooks4"] as const)
  .with(DialogRegistry)
  .build();

describe("ciclo de vida", () => {
  it("beforeClose corre cuando el registry cierra por onOpenChange", async () => {
    const beforeClose = vi.fn();
    const dialog = o.create("hooks1", "dialog").configure({
      title: "Backdrop",
      description: "Cierre por backdrop",
      beforeClose,
    });
    const Trigger = dialog.trigger;
    const View = dialog.view(() => <p>contenido</p>);

    render(
      <div>
        <Trigger>
          <button>open</button>
        </Trigger>
        <View />
      </div>,
    );

    act(() => {
      fireEvent.click(screen.getByText("open"));
    });
    act(() => {
      fireEvent.click(screen.getAllByTestId("dialog")[0]!);
    });

    expect(beforeClose).toHaveBeenCalledTimes(1);
  });

  it("beforeClose ve el estado actual del store", async () => {
    type Mode = {
      mode: "create" | "edit";
      setMode: (mode: "create" | "edit") => void;
    };
    let seen: string | undefined;

    const dialog = o
      .create("hooks2", "dialog")
      .extend<Mode>((set) => ({
        mode: "create",
        setMode: (mode) => set({ mode }),
      }))
      .configure({
        title: "Fresh",
        description: "Estado fresco",
        beforeClose: (state?: Mode) => {
          seen = state?.mode;
        },
      });

    const Trigger = dialog.trigger;
    const View = dialog.view(({ useInnerContext, close }) => {
      const setMode = useInnerContext((state: Mode) => state.setMode);
      return (
        <div>
          <button onClick={() => setMode("edit")}>switch</button>
          <button onClick={close}>close</button>
        </div>
      );
    });

    render(
      <div>
        <Trigger mode="create">
          <button>open</button>
        </Trigger>
        <View />
      </div>,
    );

    act(() => {
      fireEvent.click(screen.getByText("open"));
    });
    act(() => {
      fireEvent.click(screen.getByText("switch"));
    });
    act(() => {
      fireEvent.click(screen.getByText("close"));
    });

    expect(seen).toBe("edit");
  });

  it("beforeOpen ve los valores inyectados por el trigger", async () => {
    type Mode = {
      mode: "create" | "edit";
      setMode: (mode: "create" | "edit") => void;
    };
    let seen: string | undefined;

    const dialog = o
      .create("hooks3", "dialog")
      .extend<Mode>((set) => ({
        mode: "create",
        setMode: (mode) => set({ mode }),
      }))
      .configure({
        title: "Injected",
        description: "Props inyectadas",
        beforeOpen: (state?: Mode) => {
          seen = state?.mode;
        },
      });

    const Trigger = dialog.trigger;
    const View = dialog.view(() => <p>contenido</p>);

    render(
      <div>
        <Trigger mode="edit">
          <button>open</button>
        </Trigger>
        <View />
      </div>,
    );

    act(() => {
      fireEvent.click(screen.getByText("open"));
    });

    expect(seen).toBe("edit");
  });

  it("los valores de configure derivados del store se actualizan", async () => {
    type Mode = {
      mode: "create" | "edit";
      setMode: (mode: "create" | "edit") => void;
    };

    const dialog = o
      .create("hooks4", "dialog")
      .extend<Mode>((set) => ({
        mode: "create",
        setMode: (mode) => set({ mode }),
      }))
      .configure({
        title: "Reactivo",
        description: "className derivado",
        className: (state: Mode) => `mode-${state.mode}`,
      });

    const Trigger = dialog.trigger;
    const View = dialog.view(({ useInnerContext }) => {
      const setMode = useInnerContext((state: Mode) => state.setMode);
      return <button onClick={() => setMode("edit")}>switch</button>;
    });

    render(
      <div>
        <Trigger mode="create">
          <button>open</button>
        </Trigger>
        <View />
      </div>,
    );

    act(() => {
      fireEvent.click(screen.getByText("open"));
    });
    expect(screen.getAllByTestId("dialog")[0]!).toHaveClass("mode-create");

    act(() => {
      fireEvent.click(screen.getByText("switch"));
    });

    expect(screen.getAllByTestId("dialog")[0]!).toHaveClass("mode-edit");
  });
});

describe("props del registry", () => {
  it("no filtra los hooks como props al componente de registry", () => {
    const seen: string[] = [];
    const ProbeRegistry = registry({
      name: "probe",
      render: (props) => {
        seen.push(...Object.keys(props));

        return props.open ? (
          <div data-testid="probe">{props.children}</div>
        ) : null;
      },
    });

    const probe = new Overkit(["probe1"] as const).with(ProbeRegistry).build();
    const dialog = probe.create("probe1", "probe").configure({
      title: "Probe",
      description: "props",
      beforeOpen: () => {},
      beforeClose: () => {},
    });

    const Trigger = dialog.trigger;
    const View = dialog.view(() => <p>probe</p>);

    render(
      <div>
        <Trigger>
          <button>open probe</button>
        </Trigger>
        <View />
      </div>,
    );

    act(() => {
      fireEvent.click(screen.getByText("open probe"));
    });

    expect(seen).not.toContain("beforeOpen");
    expect(seen).not.toContain("beforeClose");
  });
});
