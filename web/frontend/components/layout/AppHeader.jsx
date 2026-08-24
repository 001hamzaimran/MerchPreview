import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { LayersIcon, HelpCircleIcon, SettingsIcon } from "../ui/Icons";
import { Button } from "../ui/Button";
import { Modal } from "../ui/Modal";
import { Toast } from "../ui/Toast";
import { SettingsModal } from "../settings/SettingsModal";

export function AppHeader() {
  const location = useLocation();
  const [helpOpen, setHelpOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  const isHome = location.pathname === "/" || location.pathname === "";
  const isConfig = location.pathname.toLowerCase().includes("config");

  return (
    <>
      <header className="pl-header">
        <div className="pl-header-inner">
          <div className="pl-header-brand-group">
            <Link to="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "10px" }}>
              <div className="pl-header-logo-icon">
                <LayersIcon size={18} />
              </div>
              <div className="pl-header-title-wrap">
                <span className="pl-header-title">MerchPreview</span>
                <span className="pl-header-status-pill">
                  <span className="pl-header-status-dot" />
                  Active
                </span>
              </div>
            </Link>

            <nav className="pl-header-nav-links" style={{ marginLeft: "20px" }}>
              <Link to="/" className={`pl-header-link ${isHome ? "active" : ""}`}>
                Dashboard
              </Link>
              <Link to="/configuration" className={`pl-header-link ${isConfig ? "active" : ""}`}>
                Configure Product
              </Link>
            </nav>
          </div>

          <div className="pl-header-actions">
            <Button
              variant="ghost"
              size="sm"
              icon={<HelpCircleIcon size={16} />}
              onClick={() => setHelpOpen(true)}
            >
              Help
            </Button>
            <Button
              variant="ghost"
              size="sm"
              icon={<SettingsIcon size={16} />}
              onClick={() => setSettingsOpen(true)}
            >
              Settings
            </Button>
          </div>
        </div>
      </header>

      {/* Help Modal */}
      <Modal
        isOpen={helpOpen}
        onClose={() => setHelpOpen(false)}
        title="MerchPreview Help & Documentation"
        footer={
          <Button variant="primary" onClick={() => setHelpOpen(false)}>
            Got it
          </Button>
        }
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div>
            <h4 style={{ fontSize: "0.95rem", fontWeight: 600, color: "var(--color-text-main)", marginBottom: "4px" }}>
              How print areas work
            </h4>
            <p style={{ fontSize: "0.875rem", color: "var(--color-text-secondary)", lineHeight: 1.5 }}>
              MerchPreview enables merchants to designate exact bounding boxes where customer-uploaded artwork will be placed. Coordinates are stored in normalized percentages (0–100%) ensuring pixel-perfect scaling across all device viewports.
            </p>
          </div>

          <div style={{ padding: "12px", background: "var(--color-surface-subtle)", borderRadius: "var(--radius-sm)", border: "1px solid var(--color-border)" }}>
            <h5 style={{ fontSize: "0.8125rem", fontWeight: 700, color: "var(--color-text-main)", marginBottom: "4px" }}>
              Recommended Artwork Specs:
            </h5>
            <ul style={{ fontSize: "0.8125rem", color: "var(--color-text-secondary)", paddingLeft: "18px", lineHeight: 1.6 }}>
              <li>Transparent PNG or high-res JPG / WEBP</li>
              <li>300 DPI for standard apparel & drinkware</li>
              <li>RGB or sRGB color space</li>
            </ul>
          </div>
        </div>
      </Modal>

      {/* Cloudinary & App Preferences Settings Modal */}
      <SettingsModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        onSaveSuccess={(msg) => setToastMessage(msg)}
      />

      {/* Toast Feedback */}
      <Toast
        message={toastMessage}
        onClose={() => setToastMessage(null)}
      />
    </>
  );
}
