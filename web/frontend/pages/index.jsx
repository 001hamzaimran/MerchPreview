import React, { useState, useMemo, useEffect } from "react";
import {
  Layout,
  WelcomeBanner,
  SetupProgressCard,
  StatCard,
  HowItWorks,
  RecentConfigurations,
  Toast,
  LayersIcon,
  SparklesIcon,
  CheckCircleIcon,
  SlidersIcon,
} from "../components";
import { INITIAL_SAVED_CONFIGURATIONS } from "../data/mockData";

export default function Dashboard() {
  const [configurations, setConfigurations] = useState(INITIAL_SAVED_CONFIGURATIONS);
  const [toastMessage, setToastMessage] = useState(null);

  // Fetch configurations from MongoDB database
  useEffect(() => {
    let isMounted = true;
    const fetchDbConfigs = async () => {
      try {
        const res = await fetch("/api/configurations");
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0 && isMounted) {
            const formatted = data.map((item) => ({
              id: item._id || item.id,
              productId: item.productId,
              productTitle: item.productTitle,
              productImage: item.productImage,
              imageId: item.imageId,
              imageTitle: item.imageTitle || "Front View",
              printArea: item.printArea,
              settings: item.settings,
              status: item.status || "Active",
              lastUpdated: item.updatedAt ? new Date(item.updatedAt).toLocaleDateString() : "Recently",
            }));
            setConfigurations(formatted);
          }
        }
      } catch (err) {
        console.warn("Using default configurations:", err);
      }
    };

    fetchDbConfigs();

    return () => {
      isMounted = false;
    };
  }, []);

  // Compute live statistics from configurations
  const configuredProductsCount = configurations.length;
  const activeConfigurationsCount = useMemo(
    () => configurations.filter((c) => (c.status || "").toLowerCase() === "active").length,
    [configurations]
  );
  const productsWithPrintAreas = useMemo(
    () => new Set(configurations.map((c) => c.productId)).size,
    [configurations]
  );
  const personalizationStatus = configuredProductsCount > 0 ? "Active" : "Not Set";

  const handleDeleteConfig = async (id) => {
    try {
      await fetch(`/api/configurations/${id}`, { method: "DELETE" });
    } catch (e) {
      console.warn("Local delete:", e);
    }
    setConfigurations((prev) => prev.filter((c) => c.id !== id));
    setToastMessage("Configuration deleted from database.");
  };

  const handleDuplicateConfig = async (id) => {
    const item = configurations.find((c) => c.id === id);
    if (!item) return;

    const newItem = {
      ...item,
      id: `cfg_${Date.now().toString().slice(-4)}`,
      productTitle: `${item.productTitle} (Copy)`,
      lastUpdated: "Just now",
    };

    try {
      await fetch("/api/configurations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...item,
          productId: `${item.productId}_copy_${Date.now().toString().slice(-4)}`,
          productTitle: `${item.productTitle} (Copy)`,
        }),
      });
    } catch (e) {
      console.warn("Local duplicate:", e);
    }

    setConfigurations((prev) => [newItem, ...prev]);
    setToastMessage("Configuration duplicated.");
  };

  const handleScrollToHowItWorks = () => {
    const el = document.getElementById("how-it-works-section");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <Layout>
      {/* Welcome Banner */}
      <WelcomeBanner onLearnMore={handleScrollToHowItWorks} />

      {/* Setup Progress Card */}
      <SetupProgressCard
        hasConfiguredProducts={configuredProductsCount > 0}
        configuredCount={configuredProductsCount}
      />

      {/* Statistics Section */}
      <div className="pl-stats-grid">
        <StatCard
          label="Configured Products"
          value={configuredProductsCount}
          subtext="Total items configured"
          icon={<LayersIcon size={18} />}
        />
        <StatCard
          label="Active Configurations"
          value={activeConfigurationsCount}
          subtext="Ready on storefront"
          icon={<CheckCircleIcon size={18} />}
        />
        <StatCard
          label="Products With Print Areas"
          value={productsWithPrintAreas}
          subtext="Unique product templates"
          icon={<SlidersIcon size={18} />}
        />
        <StatCard
          label="Personalization Status"
          value={personalizationStatus}
          subtext="App block state"
          icon={<SparklesIcon size={18} />}
        />
      </div>

      {/* How MerchPreview Works Section */}
      <div id="how-it-works-section">
        <HowItWorks />
      </div>

      {/* Recent Configurations Table Section */}
      <RecentConfigurations
        configurations={configurations}
        onDelete={handleDeleteConfig}
        onDuplicate={handleDuplicateConfig}
      />

      {/* Toast Feedback */}
      <Toast
        message={toastMessage}
        onClose={() => setToastMessage(null)}
      />
    </Layout>
  );
}