import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Card } from "../ui/Card";
import { StatusBadge } from "../ui/StatusBadge";
import { Button } from "../ui/Button";
import { EmptyState } from "../ui/EmptyState";
import { EditIcon, CopyIcon, TrashIcon, PlusIcon } from "../ui/Icons";

export function RecentConfigurations({
  configurations = [],
  onDelete,
  onDuplicate,
}) {
  const navigate = useNavigate();

  if (!configurations || configurations.length === 0) {
    return (
      <Card title="Recent Configurations" subtitle="Manage your configured products and print areas">
        <EmptyState
          title="No products configured yet."
          description="Configure your first product to start offering personalization on your store."
          actionLabel="Configure Product"
          onAction={() => navigate("/configuration")}
        />
      </Card>
    );
  }

  return (
    <Card
      title="Recent Configurations"
      subtitle={`${configurations.length} product${configurations.length > 1 ? "s" : ""} currently configured with print layers`}
      headerAction={
        <Link to="/configuration" style={{ textDecoration: "none" }}>
          <Button variant="outline" size="sm" icon={<PlusIcon size={14} />}>
            New Configuration
          </Button>
        </Link>
      }
    >
      <div className="pl-table-container">
        <table className="pl-table">
          <thead>
            <tr>
              <th>Product</th>
              <th>Image View</th>
              <th>Print Area</th>
              <th>Status</th>
              <th>Last Updated</th>
              <th style={{ textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {configurations.map((cfg) => {
              const { x, y, width, height } = cfg.printArea || { x: 0, y: 0, width: 0, height: 0 };
              const xPct = Math.round(x * 100);
              const yPct = Math.round(y * 100);
              const wPct = Math.round(width * 100);
              const hPct = Math.round(height * 100);

              return (
                <tr key={cfg.id}>
                  <td>
                    <div className="pl-product-cell">
                      <img
                        src={cfg.productImage}
                        alt={cfg.productTitle}
                        className="pl-product-thumb"
                      />
                      <div>
                        <div className="pl-product-info-name">{cfg.productTitle}</div>
                        <div className="pl-product-info-meta">ID: {cfg.id}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span style={{ fontWeight: 500, color: "var(--color-text-main)" }}>
                      {cfg.imageTitle || "Front View"}
                    </span>
                  </td>
                  <td>
                    <span className="pl-coord-pill">
                      {wPct}% × {hPct}% at ({xPct}%, {yPct}%)
                    </span>
                  </td>
                  <td>
                    <StatusBadge status={cfg.status || "Active"} />
                  </td>
                  <td>
                    <span style={{ fontSize: "0.8125rem", color: "var(--color-text-muted)" }}>
                      {cfg.lastUpdated || "Recently"}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "6px" }}>
                      <Button
                        variant="secondary"
                        size="sm"
                        icon={<EditIcon size={14} />}
                        onClick={() => navigate(`/configuration?productId=${cfg.productId}&configId=${cfg.id}`)}
                        title="Edit Configuration"
                      >
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="pl-btn-sm"
                        icon={<CopyIcon size={14} />}
                        onClick={() => onDuplicate && onDuplicate(cfg.id)}
                        title="Duplicate Configuration"
                        aria-label="Duplicate"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="pl-btn-sm"
                        style={{ color: "var(--color-danger)" }}
                        icon={<TrashIcon size={14} />}
                        onClick={() => onDelete && onDelete(cfg.id)}
                        title="Delete Configuration"
                        aria-label="Delete"
                      />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
