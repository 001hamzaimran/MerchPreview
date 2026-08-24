import React, { useEffect } from "react";
import { CheckCircleIcon, AlertCircleIcon, XIcon } from "./Icons";

export function Toast({
  message,
  type = "success", // 'success', 'error', 'info'
  duration = 3500,
  onClose,
}) {
  useEffect(() => {
    if (duration && onClose) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  if (!message) return null;

  return (
    <div className="pl-toast-container">
      <div className="pl-toast">
        {type === "success" && <CheckCircleIcon size={18} style={{ color: "var(--color-success)" }} />}
        {type === "error" && <AlertCircleIcon size={18} style={{ color: "var(--color-danger)" }} />}
        <span>{message}</span>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            style={{ background: "none", border: "none", color: "inherit", cursor: "pointer", marginLeft: "8px", display: "flex" }}
            aria-label="Dismiss toast"
          >
            <XIcon size={14} />
          </button>
        )}
      </div>
    </div>
  );
}
