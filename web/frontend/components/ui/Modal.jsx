import React, { useEffect } from "react";
import { XIcon } from "./Icons";
import { Button } from "./Button";

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  footer,
  maxWidth = "520px",
}) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="pl-modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div
        className="pl-modal-dialog"
        style={{ maxWidth }}
        onClick={(e) => e.stopPropagation()}
      >
        {title && (
          <div className="pl-modal-header">
            <h2 className="pl-modal-title">{title}</h2>
            <Button
              variant="ghost"
              size="icon"
              className="pl-btn-sm"
              onClick={onClose}
              aria-label="Close modal"
              icon={<XIcon size={18} />}
            />
          </div>
        )}
        <div className="pl-modal-body">{children}</div>
        {footer && <div className="pl-modal-footer">{footer}</div>}
      </div>
    </div>
  );
}
