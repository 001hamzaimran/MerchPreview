import React, { useState, useMemo, useEffect } from "react";
import { TitleBar } from "@shopify/app-bridge-react";
import {
  Layout,
  WelcomeBanner,
  SetupProgressCard,
  StatCard,
  HowItWorks,
  RecentConfigurations,
  Toast,
  LoadingState,
  LayersIcon,
  SparklesIcon,
  CheckCircleIcon,
  SlidersIcon,
} from "../components";

export default function Dashboard() {
  const [configurations, setConfigurations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isBlockAdded, setIsBlockAdded] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // Fetch configurations and block status strictly from MongoDB for this store
  useEffect(() => {
    let isMounted = true;

    const fetchDbConfigs = async () => {
      try {
        const res = await fetch("/api/configurations");
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && isMounted) {
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
        console.warn("Error fetching store configurations:", err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    const fetchBlockStatus = async () => {
      try {
        const res = await fetch("/api/themes/block-status");
        if (res.ok) {
          const data = await res.json();
          if (isMounted && typeof data.isBlockAdded === "boolean") {
            setIsBlockAdded(data.isBlockAdded);
          }
        }
      } catch (e) {
        console.warn("Could not check block status:", e);
      }
    };

    fetchDbConfigs();
    fetchBlockStatus();

    // Re-check block status when window regains focus (e.g. after returning from theme editor)
    const onWindowFocus = () => {
      fetchBlockStatus();
    };
    window.addEventListener("focus", onWindowFocus);

    return () => {
      isMounted = false;
      window.removeEventListener("focus", onWindowFocus);
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
  const personalizationStatus = isBlockAdded
    ? "Active"
    : configuredProductsCount > 0
    ? "Configured"
    : "Not Set";

  const handleDeleteConfig = async (id) => {
    try {
      await fetch(`/api/configurations/${id}`, { method: "DELETE" });
    } catch (e) {
      console.warn("Delete error:", e);
    }
    setConfigurations((prev) => prev.filter((c) => c.id !== id));
    setToastMessage("Configuration deleted from database.");
  };

  const handleDuplicateConfig = async (id) => {
    const item = configurations.find((c) => c.id === id);
    if (!item) return;

    try {
      const res = await fetch("/api/configurations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...item,
          productId: `${item.productId}_copy_${Date.now().toString().slice(-4)}`,
          productTitle: `${item.productTitle} (Copy)`,
        }),
      });

      if (res.ok) {
        const saved = await res.json();
        const newDoc = saved?.data || saved;
        const newItem = {
          ...item,
          id: newDoc._id || newDoc.id || `cfg_${Date.now().toString().slice(-4)}`,
          productId: newDoc.productId || `${item.productId}_copy`,
          productTitle: newDoc.productTitle || `${item.productTitle} (Copy)`,
          lastUpdated: "Just now",
        };
        setConfigurations((prev) => [newItem, ...prev]);
      } else {
        const fallbackItem = {
          ...item,
          id: `cfg_${Date.now().toString().slice(-4)}`,
          productTitle: `${item.productTitle} (Copy)`,
          lastUpdated: "Just now",
        };
        setConfigurations((prev) => [fallbackItem, ...prev]);
      }
    } catch (e) {
      console.warn("Local duplicate fallback:", e);
    }

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
      {/* App Bridge TitleBar */}
      <TitleBar title="Dashboard" />

      {/* Welcome Banner */}
      <WelcomeBanner onLearnMore={handleScrollToHowItWorks} />

      {/* Setup Progress Card */}
      <SetupProgressCard
        hasConfiguredProducts={configuredProductsCount > 0}
        configuredCount={configuredProductsCount}
        isBlockAdded={isBlockAdded}
        onBlockVerified={() => {
          setIsBlockAdded(true);
          setToastMessage("🎉 MerchPreview block verified! Setup is 100% complete.");
        }}
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
          subtext={isBlockAdded ? "Live on Storefront" : "App Block Pending"}
          icon={<SparklesIcon size={18} />}
        />
      </div>

      {/* How MerchPreview Works Section */}
      <div id="how-it-works-section">
        <HowItWorks />
      </div>

      {/* Recent Configurations Table Section */}
      {isLoading ? (
        <LoadingState label="Loading your store's configurations..." />
      ) : (
        <RecentConfigurations
          configurations={configurations}
          onDelete={handleDeleteConfig}
          onDuplicate={handleDuplicateConfig}
        />
      )}

      {/* Toast Feedback */}
      <Toast
        message={toastMessage}
        onClose={() => setToastMessage(null)}
      />
    </Layout>
  );
}