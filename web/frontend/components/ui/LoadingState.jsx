import React from "react";

export function Skeleton({ width = "100%", height = "20px", borderRadius = "var(--radius-xs)", style = {}, className = "" }) {
  return (
    <div
      className={`pl-skeleton ${className}`}
      style={{
        width,
        height,
        borderRadius,
        ...style,
      }}
    />
  );
}

export function LoadingState({ message = "Loading..." }) {
  return (
    <div className="pl-empty-state" style={{ padding: "40px 20px" }}>
      <span className="pl-btn-spinner" style={{ width: "32px", height: "32px", color: "var(--color-primary)" }} />
      <p style={{ marginTop: "12px", color: "var(--color-text-secondary)", fontSize: "0.875rem" }}>
        {message}
      </p>
    </div>
  );
}
