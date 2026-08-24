import React from "react";
import { Link } from "react-router-dom";
import { CheckIcon, PlusIcon, ExternalLinkIcon } from "../ui/Icons";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { openThemeEditor } from "../../utils/themeUtils";

export function SetupProgressCard({ hasConfiguredProducts = false, configuredCount = 0 }) {
  const isStep2Done = hasConfiguredProducts || configuredCount > 0;

  const handleOpenThemeEditor = () => {
    openThemeEditor();
  };

  return (
    <Card
      title="Get started with MerchPreview"
      subtitle={
        isStep2Done
          ? "Step 2 completed! Next, activate the MerchPreview block in your Shopify theme."
          : "Complete these 3 steps to start accepting custom artwork on your store"
      }
      className="pl-setup-card"
    >
      <div className="pl-setup-steps">
        {/* Step 1: App installed */}
        <div className="pl-setup-step-row">
          <div className="pl-setup-step-icon-wrap pl-setup-step-icon-done">
            <CheckIcon size={16} />
          </div>
          <div className="pl-setup-step-content">
            <div className="pl-setup-step-title">App installed</div>
            <div className="pl-setup-step-desc">
              MerchPreview is connected to your Shopify store and ready to use.
            </div>
          </div>
        </div>

        {/* Step 2: Configure your first product */}
        <div className="pl-setup-step-row">
          <div
            className={`pl-setup-step-icon-wrap ${
              isStep2Done ? "pl-setup-step-icon-done" : "pl-setup-step-icon-active"
            }`}
          >
            {isStep2Done ? <CheckIcon size={16} /> : "2"}
          </div>
          <div className="pl-setup-step-content">
            <div className="pl-setup-step-title">
              Configure your first product
            </div>
            <div className="pl-setup-step-desc">
              {isStep2Done
                ? `${configuredCount} product${configuredCount > 1 ? "s" : ""} configured with print area templates.`
                : "Define where customer artwork should appear on your product images."}
            </div>
          </div>
        </div>

        {/* Step 3: Add to product page */}
        <div className="pl-setup-step-row">
          <div
            className={`pl-setup-step-icon-wrap ${
              isStep2Done
                ? "pl-setup-step-icon-active"
                : "pl-setup-step-icon-pending"
            }`}
          >
            3
          </div>
          <div className="pl-setup-step-content">
            <div className={`pl-setup-step-title ${isStep2Done ? "" : "pending"}`}>
              Add MerchPreview to your product page
            </div>
            <div className={`pl-setup-step-desc ${isStep2Done ? "" : "pending"}`}>
              Add the app block from Shopify&apos;s Theme Editor to show the preview button on your product page.
            </div>
          </div>
        </div>
      </div>

      <div
        style={{
          marginTop: "24px",
          paddingTop: "16px",
          borderTop: "1px solid var(--color-border-subtle)",
          display: "flex",
          alignItems: "center",
          gap: "12px",
          flexWrap: "wrap",
        }}
      >
        {isStep2Done ? (
          <>
            <Button
              variant="primary"
              icon={<ExternalLinkIcon size={16} />}
              onClick={handleOpenThemeEditor}
            >
              Open Theme Editor
            </Button>
            <Link to="/configuration" style={{ textDecoration: "none" }}>
              <Button variant="secondary" icon={<PlusIcon size={16} />}>
                Configure Another Product
              </Button>
            </Link>
          </>
        ) : (
          <Link to="/configuration" style={{ textDecoration: "none" }}>
            <Button variant="primary" icon={<PlusIcon size={16} />}>
              Configure Product
            </Button>
          </Link>
        )}
      </div>
    </Card>
  );
}
