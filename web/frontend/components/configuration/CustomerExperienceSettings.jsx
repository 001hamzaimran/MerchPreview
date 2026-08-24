import React from "react";
import { Card } from "../ui/Card";
import { Switch } from "../ui/Switch";
import { Input } from "../ui/Input";

const ALL_FORMATS = ["PNG", "JPG", "WEBP", "SVG"];
const SIZE_OPTIONS = [5, 10, 15, 25];

export function CustomerExperienceSettings({
  settings = {
    enabled: true,
    acceptedFormats: ["png", "jpg", "webp", "svg"],
    maxFileSize: 10,
    previewButtonText: "Preview Design",
  },
  onChangeSettings,
}) {
  const handleToggleEnabled = (checked) => {
    onChangeSettings({ ...settings, enabled: checked });
  };

  const handleFormatToggle = (fmt) => {
    const lower = fmt.toLowerCase();
    const current = settings.acceptedFormats || [];
    let updated;
    if (current.includes(lower)) {
      if (current.length === 1) return; // keep at least one format
      updated = current.filter((f) => f !== lower);
    } else {
      updated = [...current, lower];
    }
    onChangeSettings({ ...settings, acceptedFormats: updated });
  };

  const handleSizeSelect = (size) => {
    onChangeSettings({ ...settings, maxFileSize: size });
  };

  const handleButtonTextChange = (text) => {
    onChangeSettings({ ...settings, previewButtonText: text });
  };

  return (
    <Card
      title="Customer Experience Settings"
      subtitle="Customize the storefront upload options and preview button"
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        {/* Enable Personalization Switch */}
        <Switch
          label="Enable personalization on product page"
          description="Displays the customer upload & live preview block on your Shopify product page."
          checked={settings.enabled}
          onChange={handleToggleEnabled}
        />

        {settings.enabled && (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px", paddingTop: "12px", borderTop: "1px solid var(--color-border-subtle)" }}>
            {/* Accepted File Formats */}
            <div className="pl-form-group">
              <label className="pl-label">Accepted File Formats</label>
              <div className="pl-tags-group">
                {ALL_FORMATS.map((fmt) => {
                  const isActive = (settings.acceptedFormats || []).includes(fmt.toLowerCase());
                  return (
                    <button
                      key={fmt}
                      type="button"
                      className={`pl-tag-item ${isActive ? "active" : ""}`}
                      onClick={() => handleFormatToggle(fmt)}
                    >
                      {fmt}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Max File Size */}
            <div className="pl-form-group">
              <label className="pl-label">Maximum Upload Size (MB)</label>
              <div className="pl-tags-group">
                {SIZE_OPTIONS.map((size) => {
                  const isActive = settings.maxFileSize === size;
                  return (
                    <button
                      key={size}
                      type="button"
                      className={`pl-tag-item ${isActive ? "active" : ""}`}
                      onClick={() => handleSizeSelect(size)}
                    >
                      {size} MB
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Preview Button Text */}
            <Input
              label="Preview Button Text"
              value={settings.previewButtonText || "Preview Design"}
              onChange={(e) => handleButtonTextChange(e.target.value)}
              placeholder="e.g. Preview Design, Customize Now"
            />
          </div>
        )}
      </div>
    </Card>
  );
}
