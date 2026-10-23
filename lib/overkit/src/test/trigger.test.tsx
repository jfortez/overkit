import { afterEach, describe, expect, it, vi } from "vitest";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";

import { Overkit } from "../core/overkit";
import { DialogRegistry } from "./base";

function build(keys: readonly string[]) {
  return new Overkit(keys).with(DialogRegistry).build();
}

const o = build(["trigger1", "trigger2", "trigger3", "trigger4"] as const);

afterEach(() => {
  cleanup();
});

describe("Trigger (Slot contract)", () => {
  it("merges the trigger className with the child className", async () => {
    const dialog = o.create("trigger1", "dialog").configure({
      title: "Class Test",
      description: "Trigger keeps both class names",
    });
    const Trigger = dialog.trigger;
    const View = dialog.view(() => <p>content</p>);

    render(
      <div>
        <Trigger className="from-trigger">
          <button className="from-child">Open</button>
        </Trigger>
        <View />
      </div>,
    );

    const button = screen.getByText("Open");
    expect(button).toHaveClass("from-trigger");
    expect(button).toHaveClass("from-child");

    fireEvent.click(button);
    await waitFor(() =>
      expect(screen.getByTestId("dialog")).toBeInTheDocument(),
    );
  });

  it("keeps child props over trigger props and fills the missing ones", async () => {
    const dialog = o.create("trigger2", "dialog").configure({
      title: "Props Test",
      description: "Child props win",
    });
    const Trigger = dialog.trigger;
    const View = dialog.view(() => <p>content</p>);

    render(
      <div>
        <Trigger id="slot-id" data-from-slot="yes">
          <button id="child-id">Open</button>
        </Trigger>
        <View />
      </div>,
    );

    const button = screen.getByText("Open");
    expect(button).toHaveAttribute("id", "child-id");
    expect(button).toHaveAttribute("data-from-slot", "yes");
  });

  it("runs the child onClick before opening the overlay", async () => {
    const calls: string[] = [];
    const dialog = o.create("trigger3", "dialog").configure({
      title: "Click Test",
      description: "Both handlers run",
    });
    const Trigger = dialog.trigger;
    const View = dialog.view(() => <p>content</p>);

    render(
      <div>
        <Trigger
          onClick={() => {
            calls.push("trigger");
          }}
        >
          <button
            onClick={() => {
              calls.push("child");
            }}
          >
            Open
          </button>
        </Trigger>
        <View />
      </div>,
    );

    fireEvent.click(screen.getByText("Open"));

    expect(calls).toEqual(["child", "trigger"]);
    await waitFor(() =>
      expect(screen.getByTestId("dialog")).toBeInTheDocument(),
    );
  });

  it("calls beforeOpen on trigger and beforeClose when closing", async () => {
    const beforeOpen = vi.fn();
    const beforeClose = vi.fn();
    const dialog = o.create("trigger4", "dialog").configure({
      title: "Hooks Test",
      description: "Lifecycle hooks",
      beforeOpen,
      beforeClose,
    });
    const Trigger = dialog.trigger;
    const View = dialog.view(({ close }) => (
      <button onClick={close}>Close</button>
    ));

    render(
      <div>
        <Trigger>
          <button>Open</button>
        </Trigger>
        <View />
      </div>,
    );

    expect(beforeOpen).not.toHaveBeenCalled();

    fireEvent.click(screen.getByText("Open"));
    await waitFor(() =>
      expect(screen.getByTestId("dialog")).toBeInTheDocument(),
    );
    expect(beforeOpen).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByText("Close"));
    await waitFor(() => expect(screen.queryByTestId("dialog")).toBeNull());
    expect(beforeClose).toHaveBeenCalledTimes(1);
  });
});
