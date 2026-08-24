import React from "react";
import { Modal } from "../ui/Modal";
import { Button } from "../ui/Button";
import { CheckCircleIcon, ExternalLinkIcon, SparklesIcon } from "../ui/Icons";
import { openThemeEditor } from "../../utils/themeUtils";

export function SaveSuccessModal({
  isOpen,
  onClose,
  productTitle,
  onGoToDashboard,
  onContinueConfiguring,
}) {
  const handleOpenThemeEditor = () => {
    openThemeEditor();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title=""
      maxWidth="480px"
      footer={
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
          <Button variant="ghost" onClick={onContinueConfiguring || onClose}>
            Continue Configuring
          </Button>
          <Button variant="secondary" onClick={onGoToDashboard}>
            View Dashboard
          </Button>
        </div>
      }
    >
      <div style={{ textAlign: "center", padding: "10px 0" }}>
        <div className="pl-success-icon-wrap">
          <CheckCircleIcon size={32} />
        </div>

        <h3 style={{ fontSize: "1.3rem", fontWeight: 700, color: "var(--color-text-main)", marginBottom: "6px" }}>
          Configuration Saved!
        </h3>

        <p style={{ fontSize: "0.9rem", color: "var(--color-text-secondary)", lineHeight: 1.5 }}>
          Your print area for <strong>{productTitle || "your product"}</strong> has been configured successfully.
        </p>

        {/* Theme Editor Next Steps Box */}
        <div className="pl-success-info-box" style={{ textAlign: "left", marginTop: "20px" }}>
          <div className="pl-success-info-title">
            <SparklesIcon size={16} />
            Next Step: Activate in Theme Editor
          </div>
          <p className="pl-success-info-desc">
            To display the live customer preview and upload button on your storefront, add the <strong>MerchPreview block</strong> from Shopify&apos;s Theme Editor.
          </p>

          <div style={{ marginTop: "14px" }}>
            <Button
              variant="primary"
              size="sm"
              icon={<ExternalLinkIcon size={14} />}
              onClick={handleOpenThemeEditor}
            >
              Open Theme Editor
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
