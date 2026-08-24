import React from "react";
import { LayersIcon } from "./Icons";
import { Button } from "./Button";

export function EmptyState({
  title = "No items found",
  description = "Get started by adding your first item.",
  actionLabel,
  onAction,
  icon = <LayersIcon size={32} />,
}) {
  return (
    <div className="pl-empty-state">
      <div className="pl-empty-icon-wrap">{icon}</div>
      <h3 className="pl-empty-title">{title}</h3>
      <p className="pl-empty-desc">{description}</p>
      {actionLabel && (
        <div style={{ marginTop: "12px" }}>
          <Button variant="primary" onClick={onAction}>
            {actionLabel}
          </Button>
        </div>
      )}
    </div>
  );
}
