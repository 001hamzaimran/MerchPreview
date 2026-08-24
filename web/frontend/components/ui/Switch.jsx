import React from "react";

export function Switch({ checked = false, onChange, label, description, id }) {
  const switchId = id || (label ? `switch-${label.toLowerCase().replace(/\s+/g, "-")}` : undefined);

  return (
    <div
      className="pl-switch-wrapper"
      onClick={() => onChange && onChange(!checked)}
      role="switch"
      aria-checked={checked}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onChange && onChange(!checked);
        }
      }}
    >
      <div className={`pl-switch ${checked ? "checked" : ""}`}>
        <div className="pl-switch-thumb" />
      </div>
      {(label || description) && (
        <div className="pl-switch-text-group">
          {label && <span className="pl-label" style={{ cursor: "pointer" }}>{label}</span>}
          {description && <p className="pl-card-subtitle">{description}</p>}
        </div>
      )}
    </div>
  );
}
