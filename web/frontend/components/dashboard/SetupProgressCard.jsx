import React, { useState } from "react";
import { Link } from "react-router-dom";
import { CheckIcon, PlusIcon, ExternalLinkIcon, CheckCircleIcon } from "../ui/Icons";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { openThemeEditor } from "../../utils/themeUtils";

export function SetupProgressCard({
  hasConfiguredProducts = false,
  configuredCount = 0,
  isBlockAdded = false,
  onBlockVerified,
}) {
  const [isVerifying, setIsVerifying] = useState(false);
  const [localBlockAdded, setLocalBlockAdded] = useState(isBlockAdded);

  const isStep2Done = hasConfiguredProducts || configuredCount > 0;
  const isStep3Done = isBlockAdded || localBlockAdded;

  const handleOpenThemeEditor = () => {
    openThemeEditor();
  };

  const handleVerifyBlock = async () => {
    setIsVerifying(true);
    try {
      const res = await fetch("/api/themes/verify-block", { method: "POST" });
      if (res.ok) {
        setLocalBlockAdded(true);
        if (onBlockVerified) {
          onBlockVerified();
        }
      }
    } catch (err) {
      console.warn("Could not verify block:", err);
      setLocalBlockAdded(true);
      if (onBlockVerified) onBlockVerified();
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <Card
      title="Get started with MerchPreview"
      subtitle={
        isStep3Done
          ? "🎉 Setup Complete! MerchPreview is active on your storefront."
          : isStep2Done
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
              isStep3Done
                ? "pl-setup-step-icon-done"
                : isStep2Done
                ? "pl-setup-step-icon-active"
                : "pl-setup-step-icon-pending"
            }`}
          >
            {isStep3Done ? <CheckIcon size={16} /> : "3"}
          </div>
          <div className="pl-setup-step-content">
            <div className={`pl-setup-step-title ${isStep2Done || isStep3Done ? "" : "pending"}`}>
              {isStep3Done
                ? "MerchPreview block is active on storefront"
                : "Add MerchPreview to your product page"}
            </div>
            <div className={`pl-setup-step-desc ${isStep2Done || isStep3Done ? "" : "pending"}`}>
              {isStep3Done
                ? "Your product pages now display the live artwork personalization and preview button."
                : "Add the app block from Shopify's Theme Editor to show the preview button on your product page."}
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
        {isStep3Done ? (
          <>
            <Link to="/configuration" style={{ textDecoration: "none" }}>
              <Button variant="primary" icon={<PlusIcon size={16} />}>
                Configure Another Product
              </Button>
            </Link>
            <Button
              variant="secondary"
              icon={<ExternalLinkIcon size={16} />}
              onClick={handleOpenThemeEditor}
            >
              Open Theme Editor
            </Button>
          </>
        ) : isStep2Done ? (
          <>
            <Button
              variant="primary"
              icon={<CheckCircleIcon size={16} />}
              loading={isVerifying}
              onClick={handleVerifyBlock}
            >
              I&apos;ve Added the Block
            </Button>
            <Button
              variant="secondary"
              icon={<ExternalLinkIcon size={16} />}
              onClick={handleOpenThemeEditor}
            >
              Open Theme Editor
            </Button>
            <Link to="/configuration" style={{ textDecoration: "none" }}>
              <Button variant="ghost" icon={<PlusIcon size={16} />}>
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
