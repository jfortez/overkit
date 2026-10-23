import {
  Children,
  cloneElement,
  type ReactElement,
  type ReactNode,
} from "react";

const EVENT_HANDLER = /^on[A-Z]/;

type Props = Record<string, unknown>;

export interface SlotProps {
  children?: ReactNode;
  [key: string]: unknown;
}

function mergeProps(slotProps: Props, childProps: Props): Props {
  const merged: Props = { ...childProps };

  for (const name in childProps) {
    const slotValue = slotProps[name];
    const childValue = childProps[name];

    if (EVENT_HANDLER.test(name)) {
      if (typeof slotValue === "function" && typeof childValue === "function") {
        merged[name] = (...args: unknown[]) => {
          childValue(...args);
          slotValue(...args);
        };
      } else if (typeof slotValue === "function") {
        merged[name] = slotValue;
      }
    } else if (name === "className") {
      merged[name] = [slotValue, childValue].filter(Boolean).join(" ");
    } else if (name === "style") {
      merged[name] = Object.assign({}, slotValue, childValue);
    }
  }

  return { ...slotProps, ...merged };
}

export function Slot({ children, ...slotProps }: SlotProps) {
  const child = Children.only(children) as ReactElement<Props>;

  return cloneElement(child, mergeProps(slotProps, child.props));
}
