import React from "react";
import { Card } from "../ui/Card";
import { Button } from "../ui/Button";
import { StatusBadge } from "../ui/StatusBadge";
import { CheckIcon } from "../ui/Icons";

export function ConfigurationSummary({
  product,
  selectedImage,
  printArea,
  isAreaEnabled = true,
  isSaving = false,
  onSave,
  onCancel,
}) {
  const x = Math.round((printArea?.x ?? 0.25) * 100);
  const y = Math.round((printArea?.y ?? 0.20) * 100);
  const width = Math.round((printArea?.width ?? 0.50) * 100);
  const height = Math.round((printArea?.height ?? 0.40) * 100);

  return (
    <Card
      title="Configuration Summary"
      subtitle="Review details before saving"
    >
      <div className="pl-summary-list">
        <div className="pl-summary-item">
          <span className="pl-summary-label">Product</span>
          <span className="pl-summary-val">{product?.title || "None"}</span>
        </div>

        <div className="pl-summary-item">
          <span className="pl-summary-label">Image View</span>
          <span className="pl-summary-val">{selectedImage?.title || "Default"}</span>
        </div>

        <div className="pl-summary-item">
          <span className="pl-summary-label">Print Area (X, Y)</span>
          <span className="pl-summary-val">
            {isAreaEnabled ? `${x}%, ${y}%` : "Disabled"}
          </span>
        </div>

        <div className="pl-summary-item">
          <span className="pl-summary-label">Print Dimensions (W × H)</span>
          <span className="pl-summary-val">
            {isAreaEnabled ? `${width}% × ${height}%` : "None"}
          </span>
        </div>

        <div className="pl-summary-item">
          <span className="pl-summary-label">Status</span>
          <StatusBadge status="Ready to save" />
        </div>
      </div>

      <div style={{ marginTop: "24px", display: "flex", flexDirection: "column", gap: "10px" }}>
        <Button
          variant="primary"
          size="lg"
          loading={isSaving}
          onClick={onSave}
          icon={<CheckIcon size={16} />}
          style={{ width: "100%" }}
        >
          Save Configuration
        </Button>

        {onCancel && (
          <Button
            variant="ghost"
            size="md"
            onClick={onCancel}
            style={{ width: "100%" }}
          >
            Cancel
          </Button>
        )}
      </div>
    </Card>
  );
}
