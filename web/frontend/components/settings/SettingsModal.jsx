import React, { useState, useEffect } from "react";
import { Modal } from "../ui/Modal";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { Switch } from "../ui/Switch";
import { StatusBadge } from "../ui/StatusBadge";
import {
  CopyIcon,
  CheckIcon,
  EyeIcon,
  EyeOffIcon,
  SparklesIcon,
  SettingsIcon,
  LayersIcon,
} from "../ui/Icons";

const STORAGE_KEY = "merchpreview_cloudinary_settings";

const DEFAULT_CLOUDINARY = {
  cloudName: "",
  apiKey: "",
  apiSecret: "",
  uploadFolder: "merchpreview_custom_designs",
  autoValidateDpi: true,
  autoSaveCanvas: true,
};

export function SettingsModal({ isOpen, onClose, onSaveSuccess }) {
  const [activeTab, setActiveTab] = useState("cloudinary"); // 'cloudinary' | 'general'
  const [showSecret, setShowSecret] = useState(false);
  const [showEnvSecret, setShowEnvSecret] = useState(false);
  const [copiedField, setCopiedField] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return { ...DEFAULT_CLOUDINARY, ...JSON.parse(saved) };
      }
    } catch (e) {
      console.warn("Could not load stored Cloudinary settings:", e);
    }
    return DEFAULT_CLOUDINARY;
  });

  // Fetch settings from database on open
  useEffect(() => {
    let isMounted = true;
    const fetchDbSettings = async () => {
      try {
        const res = await fetch("/api/settings");
        if (res.ok) {
          const data = await res.json();
          if (data && isMounted) {
            setFormData((prev) => ({
              ...prev,
              cloudName: data.cloudName ?? prev.cloudName ?? "",
              apiKey: data.apiKey ?? prev.apiKey ?? "",
              apiSecret: data.apiSecret ?? prev.apiSecret ?? "",
              uploadFolder: data.uploadFolder || prev.uploadFolder,
              autoValidateDpi: data.autoValidateDpi ?? prev.autoValidateDpi,
              autoSaveCanvas: data.autoSaveCanvas ?? prev.autoSaveCanvas,
            }));
          }
        }
      } catch (err) {
        console.warn("Could not fetch settings from API:", err);
      }
    };

    if (isOpen) {
      fetchDbSettings();
    }

    return () => {
      isMounted = false;
    };
  }, [isOpen]);

  const handleCopy = (text, fieldName) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Save Cloudinary keys & preferences to database
      await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      // Save to local cache
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(formData));
      } catch (e) {
        console.warn(e);
      }

      if (onSaveSuccess) {
        onSaveSuccess("Cloudinary configuration saved successfully in database!");
      }
    } catch (e) {
      console.warn("Database save fallback:", e);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(formData));
      if (onSaveSuccess) {
        onSaveSuccess("Settings saved successfully!");
      }
    } finally {
      setIsSaving(false);
      onClose();
    }
  };

  const isConfigured = Boolean(formData.cloudName && formData.apiKey && formData.apiSecret);

  // Masked or unmasked CLOUDINARY_URL
  const envUrlMasked = isConfigured
    ? `CLOUDINARY_URL=cloudinary://${formData.apiKey}:${showEnvSecret ? formData.apiSecret : "************"}@${formData.cloudName}`
    : `CLOUDINARY_URL=cloudinary://<API_KEY>:<API_SECRET>@<CLOUD_NAME>`;

  const envUrlRaw = isConfigured
    ? `CLOUDINARY_URL=cloudinary://${formData.apiKey}:${formData.apiSecret}@${formData.cloudName}`
    : "";

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Settings & Integrations"
      maxWidth="620px"
      footer={
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
          <Button variant="ghost" onClick={onClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button
            variant="primary"
            loading={isSaving}
            onClick={handleSave}
            icon={<CheckIcon size={16} />}
          >
            Save Configuration
          </Button>
        </div>
      }
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        {/* Settings Navigation Tabs */}
        <div className="pl-settings-tabs">
          <button
            type="button"
            className={`pl-settings-tab ${activeTab === "cloudinary" ? "active" : ""}`}
            onClick={() => setActiveTab("cloudinary")}
          >
            <SparklesIcon size={15} />
            Cloudinary API
          </button>
          <button
            type="button"
            className={`pl-settings-tab ${activeTab === "general" ? "active" : ""}`}
            onClick={() => setActiveTab("general")}
          >
            <SettingsIcon size={15} />
            Preferences
          </button>
        </div>

        {activeTab === "cloudinary" ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
            {/* Status Banner */}
            <div className="pl-settings-status-box">
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div className="pl-settings-cloud-icon">
                  <LayersIcon size={20} />
                </div>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <h4 style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--color-text-main)" }}>
                      Cloudinary Media Engine
                    </h4>
                    <StatusBadge status={isConfigured ? "Active" : "Not Set"} />
                  </div>
                  <p style={{ fontSize: "0.8125rem", color: "var(--color-text-secondary)", marginTop: "2px" }}>
                    Enter your Cloudinary API credentials below to enable cloud storage for customer artwork.
                  </p>
                </div>
              </div>
            </div>

            {/* Cloud Name */}
            <div className="pl-form-group">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <label className="pl-label">Cloud Name</label>
                {formData.cloudName && (
                  <button
                    type="button"
                    className="pl-copy-btn"
                    onClick={() => handleCopy(formData.cloudName, "cloudName")}
                  >
                    {copiedField === "cloudName" ? <CheckIcon size={13} /> : <CopyIcon size={13} />}
                    {copiedField === "cloudName" ? "Copied" : "Copy"}
                  </button>
                )}
              </div>
              <Input
                value={formData.cloudName}
                onChange={(e) => setFormData({ ...formData, cloudName: e.target.value })}
                placeholder="Enter your Cloudinary cloud name"
              />
            </div>

            {/* API Key */}
            <div className="pl-form-group">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <label className="pl-label">API Key</label>
                {formData.apiKey && (
                  <button
                    type="button"
                    className="pl-copy-btn"
                    onClick={() => handleCopy(formData.apiKey, "apiKey")}
                  >
                    {copiedField === "apiKey" ? <CheckIcon size={13} /> : <CopyIcon size={13} />}
                    {copiedField === "apiKey" ? "Copied" : "Copy"}
                  </button>
                )}
              </div>
              <Input
                value={formData.apiKey}
                onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
                placeholder="Enter your Cloudinary API key"
              />
            </div>

            {/* API Secret */}
            <div className="pl-form-group">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <label className="pl-label">API Secret</label>
                {formData.apiSecret && (
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <button
                      type="button"
                      className="pl-copy-btn"
                      onClick={() => setShowSecret(!showSecret)}
                      title={showSecret ? "Hide secret" : "Show secret"}
                    >
                      {showSecret ? <EyeOffIcon size={13} /> : <EyeIcon size={13} />}
                      {showSecret ? "Hide" : "Reveal"}
                    </button>
                    <button
                      type="button"
                      className="pl-copy-btn"
                      onClick={() => handleCopy(formData.apiSecret, "apiSecret")}
                    >
                      {copiedField === "apiSecret" ? <CheckIcon size={13} /> : <CopyIcon size={13} />}
                      {copiedField === "apiSecret" ? "Copied" : "Copy"}
                    </button>
                  </div>
                )}
              </div>
              <Input
                type={showSecret ? "text" : "password"}
                value={formData.apiSecret}
                onChange={(e) => setFormData({ ...formData, apiSecret: e.target.value })}
                placeholder="Enter your Cloudinary API secret"
              />
            </div>

            {/* API Environment Variable Preview */}
            <div className="pl-env-var-box">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--color-text-secondary)", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                  API Environment Variable
                </span>
                {envUrlRaw && (
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <button
                      type="button"
                      className="pl-copy-btn"
                      onClick={() => setShowEnvSecret(!showEnvSecret)}
                    >
                      {showEnvSecret ? <EyeOffIcon size={13} /> : <EyeIcon size={13} />}
                    </button>
                    <button
                      type="button"
                      className="pl-copy-btn"
                      onClick={() => handleCopy(envUrlRaw, "envUrl")}
                    >
                      {copiedField === "envUrl" ? <CheckIcon size={13} /> : <CopyIcon size={13} />}
                      {copiedField === "envUrl" ? "Copied" : "Copy"}
                    </button>
                  </div>
                )}
              </div>
              <div className="pl-env-code">
                {envUrlMasked}
              </div>
            </div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <Switch
              label="Auto-validate DPI constraints"
              description="Warn merchants when customer uploaded artwork is below 150 DPI for the selected print area."
              checked={formData.autoValidateDpi}
              onChange={(checked) => setFormData({ ...formData, autoValidateDpi: checked })}
            />
            <Switch
              label="Enable live canvas auto-sync"
              description="Automatically synchronize numeric inputs with coordinate overlays."
              checked={formData.autoSaveCanvas}
              onChange={(checked) => setFormData({ ...formData, autoSaveCanvas: checked })}
            />
          </div>
        )}
      </div>
    </Modal>
  );
}
