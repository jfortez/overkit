import React, { useEffect, useRef } from "react";
import { createPortal } from "react-dom";

import { registry, type RegistryComponentProps } from "../core/registry";
import "./base.css";

const Dialog = ({
  open,
  onOpenChange,
  title,
  description,
  className,
  children,
}: RegistryComponentProps) => {
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) {
        onOpenChange?.(false);
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [open, onOpenChange]);

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onOpenChange?.(false);
    }
  };

  if (!open) return null;

  return createPortal(
    <div
      className={`dialog-backdrop ${className || ""}`}
      onClick={handleBackdropClick}
      data-testid="dialog"
    >
      <div className={`dialog-content ${className || ""}`} ref={contentRef}>
        {title && <h2 data-testid="dialog-title">{title}</h2>}
        {description && <p data-testid="dialog-description">{description}</p>}
        {children}
      </div>
    </div>,
    document.body,
  );
};

export const DialogRegistry = registry({
  name: "dialog",
  render: Dialog,
});
