import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { CheckIcon, PlusIcon, ExternalLinkIcon, CheckCircleIcon, SettingsIcon } from "../ui/Icons";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { SettingsModal } from "../settings/SettingsModal";
import { openThemeEditor } from "../../utils/themeUtils";

export function SetupProgressCard({
  hasConfiguredProducts = false,
  configuredCount = 0,
  isBlockAdded = false,
  isCloudinaryConfigured = false,
  onBlockVerified,
  onCloudinaryConfigured,
}) {
  const [isVerifying, setIsVerifying] = useState(false);
  const [localBlockAdded, setLocalBlockAdded] = useState(isBlockAdded);
  const [localCloudinaryConfigured, setLocalCloudinaryConfigured] = useState(isCloudinaryConfigured);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  useEffect(() => {
    setLocalBlockAdded(isBlockAdded);
  }, [isBlockAdded]);

  useEffect(() => {
    setLocalCloudinaryConfigured(isCloudinaryConfigured);
  }, [isCloudinaryConfigured]);

  // Check Cloudinary status from backend
  useEffect(() => {
    let isMounted = true;
    const checkCloudinary = async () => {
      try {
        const res = await fetch("/api/settings");
        if (res.ok) {
          const data = await res.json();
          if (isMounted && data && data.cloudName && data.apiKey) {
            setLocalCloudinaryConfigured(true);
          }
        }
      } catch (err) {
        console.warn("Could not check Cloudinary status:", err);
      }
    };

    checkCloudinary();
    return () => {
      isMounted = false;
    };
  }, []);

  const isStep2Done = hasConfiguredProducts || configuredCount > 0;
  const isStep3Done = isCloudinaryConfigured || localCloudinaryConfigured;
  const isStep4Done = isBlockAdded || localBlockAdded;

  const completedCount = 1 + (isStep2Done ? 1 : 0) + (isStep3Done ? 1 : 0) + (isStep4Done ? 1 : 0);

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

  const getSubtitle = () => {
    if (completedCount === 4) {
      return "🎉 Setup Complete! MerchPreview is fully configured and active on your storefront.";
    }
    if (!isStep2Done) {
      return "Step 1 completed! Next, configure your first product print area.";
    }
    if (!isStep3Done) {
      return "Step 2 completed! Next, configure Cloudinary to store customer artwork.";
    }
    return "Step 3 completed! Next, activate the MerchPreview block in your Shopify theme.";
  };

  return (
    <>
      <Card
        title="Get started with MerchPreview"
        subtitle={getSubtitle()}
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

          {/* Step 3: Configure Cloudinary */}
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
              <div className={`pl-setup-step-title ${isStep3Done || isStep2Done ? "" : "pending"}`}>
                Configure Cloudinary
              </div>
              <div className={`pl-setup-step-desc ${isStep3Done || isStep2Done ? "" : "pending"}`}>
                {isStep3Done
                  ? "Cloudinary is connected to store customer-uploaded artwork and print files."
                  : "Enter your Cloudinary API credentials to enable cloud storage for customer artwork."}
                {!isStep3Done && (
                  <span
                    style={{
                      marginLeft: "8px",
                      color: "var(--color-primary)",
                      fontWeight: 600,
                      cursor: "pointer",
                      textDecoration: "underline",
                      display: "inline-block",
                    }}
                    onClick={() => setIsSettingsOpen(true)}
                  >
                    Configure Cloudinary →
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Step 4: Add to product page */}
          <div className="pl-setup-step-row">
            <div
              className={`pl-setup-step-icon-wrap ${
                isStep4Done
                  ? "pl-setup-step-icon-done"
                  : isStep2Done && isStep3Done
                  ? "pl-setup-step-icon-active"
                  : "pl-setup-step-icon-pending"
              }`}
            >
              {isStep4Done ? <CheckIcon size={16} /> : "4"}
            </div>
            <div className="pl-setup-step-content">
              <div className={`pl-setup-step-title ${isStep4Done || (isStep2Done && isStep3Done) ? "" : "pending"}`}>
                {isStep4Done
                  ? "MerchPreview block is active on storefront"
                  : "Add MerchPreview to your product page"}
              </div>
              <div className={`pl-setup-step-desc ${isStep4Done || (isStep2Done && isStep3Done) ? "" : "pending"}`}>
                {isStep4Done
                  ? "Your product pages now display the live artwork personalization and preview button."
                  : "Add the app block from Shopify's Theme Editor to show the preview button on your product page."}
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
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
          {completedCount === 4 ? (
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
              <Button
                variant="ghost"
                icon={<SettingsIcon size={16} />}
                onClick={() => setIsSettingsOpen(true)}
              >
                Cloudinary Settings
              </Button>
            </>
          ) : !isStep2Done ? (
            <>
              <Link to="/configuration" style={{ textDecoration: "none" }}>
                <Button variant="primary" icon={<PlusIcon size={16} />}>
                  Configure Product
                </Button>
              </Link>
              <Button
                variant="secondary"
                icon={<SettingsIcon size={16} />}
                onClick={() => setIsSettingsOpen(true)}
              >
                Configure Cloudinary
              </Button>
            </>
          ) : !isStep3Done ? (
            <>
              <Button
                variant="primary"
                icon={<SettingsIcon size={16} />}
                onClick={() => setIsSettingsOpen(true)}
              >
                Configure Cloudinary
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
          )}
        </div>
      </Card>

      {/* Cloudinary Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onSaveSuccess={() => {
          setLocalCloudinaryConfigured(true);
          if (onCloudinaryConfigured) {
            onCloudinaryConfigured();
          }
        }}
      />
    </>
  );
}
