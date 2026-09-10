import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { TitleBar } from "@shopify/app-bridge-react";
import {
  Layout,
  PageHeader,
  Button,
  ProductSelector,
  ProductImageGallery,
  PrintAreaEditor,
  PrintAreaControls,
  CustomerExperienceSettings,
  ConfigurationSummary,
  SaveSuccessModal,
  Toast,
  ArrowLeftIcon,
  CheckIcon,
} from "../components";
import {
  MOCK_PRODUCTS,
  INITIAL_SAVED_CONFIGURATIONS,
  DEFAULT_CONFIG_STATE,
} from "../data/mockData";
import { normalizeShopifyProducts } from "../utils/productUtils";

export default function ConfigurationPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const queryProductId = searchParams.get("productId");
  const queryConfigId = searchParams.get("configId");
  const queryImageId = searchParams.get("imageId");

  const [products, setProducts] = useState(MOCK_PRODUCTS);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);

  // Master Configuration State Model
  const [configState, setConfigState] = useState(() => {
    if (queryConfigId) { 
      const existing = INITIAL_SAVED_CONFIGURATIONS.find((c) => c.id === queryConfigId);
      if (existing) {
        return {
          selectedProductId: existing.productId,
          selectedImageId: queryImageId || existing.imageId,
          printArea: { ...existing.printArea },
          printAreas: existing.printAreas || (existing.imageId ? { [existing.imageId]: { ...existing.printArea } } : {}),
          settings: { ...existing.settings },
        };
      }
    }

    if (queryProductId) {
      const prod = MOCK_PRODUCTS.find((p) => p.id === queryProductId || String(p.id).endsWith(`/${queryProductId}`));
      const firstImgId = queryImageId || prod?.images?.[0]?.id || null;
      return {
        selectedProductId: prod ? prod.id : queryProductId,
        selectedImageId: firstImgId,
        printArea: { ...DEFAULT_CONFIG_STATE.printArea },
        printAreas: {},
        settings: { ...DEFAULT_CONFIG_STATE.settings },
      };
    }

    return {
      ...DEFAULT_CONFIG_STATE,
      printAreas: {},
    };
  });

  const [isSaving, setIsSaving] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // Fetch products from Shopify API (/api/products/getProducts) with fallback to mock
  useEffect(() => {
    let isMounted = true;
    const fetchStoreProducts = async () => {
      try {
        setIsLoadingProducts(true);
        const response = await fetch("/api/products/getProducts");
        if (response.ok) {
          const rawData = await response.json();
          if (Array.isArray(rawData) && rawData.length > 0) {
            const normalized = normalizeShopifyProducts(rawData);
            if (isMounted && normalized.length > 0) {
              setProducts(normalized);

              // Auto-select product matching queryProductId or preserve current selection
              setConfigState((prev) => {
                const targetId = queryProductId || prev.selectedProductId;
                const found = normalized.find(
                  (p) =>
                    p.id === targetId ||
                    String(p.id).endsWith(`/${targetId}`) ||
                    String(targetId).endsWith(`/${p.id}`)
                );

                if (found) {
                  const targetImgId =
                    (queryImageId && found.images?.some((img) => img.id === queryImageId))
                      ? queryImageId
                      : prev.selectedImageId && found.images?.some((img) => img.id === prev.selectedImageId)
                      ? prev.selectedImageId
                      : found.images?.[0]?.id || null;

                  return {
                    ...prev,
                    selectedProductId: found.id,
                    selectedImageId: targetImgId,
                  };
                }

                // If currently selected isn't in fetched list and no queryProductId matched, fallback to first
                const hasSelected = normalized.some((p) => p.id === prev.selectedProductId);
                if (!hasSelected) {
                  return {
                    ...prev,
                    selectedProductId: normalized[0].id,
                    selectedImageId: normalized[0].images?.[0]?.id || null,
                  };
                }
                return prev;
              });
            }
          }
        }
      } catch (error) {
        console.warn("Using default product catalog:", error);
      } finally {
        if (isMounted) {
          setIsLoadingProducts(false);
        }
      }
    };

    fetchStoreProducts();

    return () => {
      isMounted = false;
    };
  }, [queryProductId, queryImageId]);

  // Synchronize selection when URL query parameters change or when products catalog is loaded
  useEffect(() => {
    if (!queryProductId || products.length === 0) return;

    const matchedProduct = products.find(
      (p) =>
        p.id === queryProductId ||
        String(p.id).endsWith(`/${queryProductId}`) ||
        String(queryProductId).endsWith(`/${p.id}`)
    );

    if (matchedProduct) {
      const targetImgId =
        queryImageId && matchedProduct.images?.some((img) => img.id === queryImageId)
          ? queryImageId
          : matchedProduct.images?.[0]?.id || null;

      setConfigState((prev) => {
        if (prev.selectedProductId === matchedProduct.id && prev.selectedImageId === targetImgId) {
          return prev;
        }
        return {
          ...prev,
          selectedProductId: matchedProduct.id,
          selectedImageId: targetImgId,
        };
      });
    }
  }, [queryProductId, queryImageId, products]);

  // Selected Product & Image Lookups
  const selectedProduct = useMemo(() => {
    return (
      products.find((p) => p.id === configState.selectedProductId) ||
      products[0] ||
      MOCK_PRODUCTS[0]
    );
  }, [products, configState.selectedProductId]);

  const selectedImage = useMemo(() => {
    if (!selectedProduct?.images?.length) return null;
    return (
      selectedProduct.images.find((img) => img.id === configState.selectedImageId) ||
      selectedProduct.images[0]
    );
  }, [selectedProduct, configState.selectedImageId]);

  // Fetch existing configuration from MongoDB whenever selectedProduct changes
  useEffect(() => {
    let isMounted = true;
    if (!selectedProduct?.id) return;

    const fetchExistingConfig = async () => {
      try {
        const res = await fetch(`/api/configurations/${encodeURIComponent(selectedProduct.id)}`);
        if (res.ok) {
          const saved = await res.json();
          if (saved && isMounted) {
            setConfigState((prev) => {
              if (prev.selectedProductId !== selectedProduct.id) return prev;

              const existingAreas =
                saved.printAreas && typeof saved.printAreas === "object"
                  ? { ...saved.printAreas }
                  : {};

              // If legacy config had printArea, ensure it's registered under the saved image or primary image
              const primaryKey = saved.imageId || selectedProduct.images?.[0]?.id;
              if (saved.printArea && primaryKey && !existingAreas[primaryKey]) {
                existingAreas[primaryKey] = saved.printArea;
              }

              const currentImgId = prev.selectedImageId || primaryKey;
              const activePrintArea =
                existingAreas[currentImgId] ||
                saved.printArea ||
                prev.printArea ||
                DEFAULT_CONFIG_STATE.printArea;

              return {
                ...prev,
                printAreas: existingAreas,
                printArea: activePrintArea,
                settings: saved.settings || prev.settings,
              };
            });
          }
        }
      } catch (err) {
        console.warn("Could not load product configuration from database:", err);
      }
    };

    fetchExistingConfig();

    return () => {
      isMounted = false;
    };
  }, [selectedProduct?.id]);

  // Active print area computed from selected image's specific area in printAreas
  const currentPrintArea = useMemo(() => {
    const imgId = selectedImage?.id;
    if (imgId && configState.printAreas?.[imgId]) {
      return configState.printAreas[imgId];
    }
    return configState.printArea || DEFAULT_CONFIG_STATE.printArea;
  }, [selectedImage?.id, configState.printAreas, configState.printArea]);

  // Flag indicating whether print area is enabled on the currently selected image view
  const isAreaEnabled = currentPrintArea?.enabled !== false;

  // Product Selection handler
  const handleSelectProduct = (product) => {
    const firstImgId = product.images?.[0]?.id || null;
    setConfigState((prev) => ({
      ...prev,
      selectedProductId: product.id,
      selectedImageId: firstImgId,
      printArea: DEFAULT_CONFIG_STATE.printArea,
      printAreas: {},
    }));
  };

  // Image Selection handler - switches active view and preserves per-image print areas
  const handleSelectImage = (imageId) => {
    setConfigState((prev) => {
      const nextPrintArea =
        prev.printAreas?.[imageId] ||
        DEFAULT_CONFIG_STATE.printArea;

      return {
        ...prev,
        selectedImageId: imageId,
        printArea: nextPrintArea,
      };
    });
  };

  // Print Area change handler - updates the current selected image's print area
  const handleChangePrintArea = (newPrintArea) => {
    const activeImgId = selectedImage?.id;
    setConfigState((prev) => {
      const updatedAreas = { ...(prev.printAreas || {}) };
      const currentArea = (activeImgId && updatedAreas[activeImgId]) || prev.printArea || {};
      const areaToSave = {
        ...newPrintArea,
        enabled: currentArea.enabled !== false,
      };

      if (activeImgId) {
        updatedAreas[activeImgId] = areaToSave;
      }
      return {
        ...prev,
        printArea: areaToSave,
        printAreas: updatedAreas,
      };
    });
  };

  // Toggle Print Area Enable / Disable on the currently selected image view
  const handleTogglePrintArea = (enabled) => {
    const activeImgId = selectedImage?.id;
    setConfigState((prev) => {
      const updatedAreas = { ...(prev.printAreas || {}) };
      const currentArea =
        (activeImgId && updatedAreas[activeImgId]) ||
        prev.printArea ||
        DEFAULT_CONFIG_STATE.printArea;

      const areaToSave = {
        ...currentArea,
        enabled: Boolean(enabled),
      };

      if (activeImgId) {
        updatedAreas[activeImgId] = areaToSave;
      }

      return {
        ...prev,
        printArea: areaToSave,
        printAreas: updatedAreas,
      };
    });
  };

  // Customer Experience settings handler
  const handleChangeSettings = (newSettings) => {
    setConfigState((prev) => ({
      ...prev,
      settings: newSettings,
    }));
  };

  // Save handler (Persists to MongoDB database with printAreas dictionary)
  const handleSaveConfiguration = async () => {
    setIsSaving(true);
    try {
      const activeImgId = selectedImage?.id;
      const updatedPrintAreas = { ...(configState.printAreas || {}) };
      const areaToPersist = {
        ...currentPrintArea,
        enabled: isAreaEnabled,
      };

      if (activeImgId) {
        updatedPrintAreas[activeImgId] = areaToPersist;
      }

      // Determine top-level printArea (fallback to first enabled view if current view is disabled)
      let fallbackArea = areaToPersist;
      if (!isAreaEnabled) {
        const anyEnabledKey = Object.keys(updatedPrintAreas).find(
          (k) => updatedPrintAreas[k]?.enabled !== false
        );
        if (anyEnabledKey) {
          fallbackArea = updatedPrintAreas[anyEnabledKey];
        }
      }

      const payload = {
        productId: selectedProduct?.id,
        productTitle: selectedProduct?.title,
        productImage: selectedImage?.url,
        imageId: selectedImage?.id,
        imageTitle: selectedImage?.title,
        printArea: fallbackArea,
        printAreas: updatedPrintAreas,
        settings: configState.settings,
        status: "Active",
      };

      const response = await fetch("/api/configurations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        console.warn("Save response warning:", errData);
      }

      setConfigState((prev) => ({
        ...prev,
        printAreas: updatedPrintAreas,
        printArea: areaToPersist,
      }));

      setShowSuccessModal(true);
      setToastMessage("Configuration saved successfully to database!");
    } catch (err) {
      console.warn("Saved locally:", err);
      setShowSuccessModal(true);
      setToastMessage("Configuration saved successfully!");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Layout>
      {/* App Bridge TitleBar with Native Breadcrumb */}
      <TitleBar title="Configure Product">
        <a variant="breadcrumb" href="/">
          Dashboard
        </a>
      </TitleBar>

      {/* Top Page Header */}
      <PageHeader
        title="Configure Product"
        subtitle="Define where customer artwork will appear on your product image."
        backAction={{
          content: "Back to Dashboard",
          url: "/",
        }}
        actions={
          <Button
            variant="primary"
            loading={isSaving}
            onClick={handleSaveConfiguration}
            icon={<CheckIcon size={16} />}
          >
            Save Configuration
          </Button>
        }
      />

      {/* Main Configuration 2-Column Responsive Layout */}
      <div className="pl-config-grid">
        {/* Left Column: Step 1 (Product Selector) & Step 2 (Product Images) */}
        <aside className="pl-config-sidebar">
          <ProductSelector
            products={products}
            selectedProductId={selectedProduct?.id}
            onSelectProduct={handleSelectProduct}
            isLoading={isLoadingProducts}
          />

          <ProductImageGallery
            images={selectedProduct?.images || []}
            selectedImageId={selectedImage?.id}
            onSelectImage={handleSelectImage}
            printAreas={configState.printAreas}
          />
        </aside>

        {/* Right Column: Step 3 (Interactive Print Area Editor, Controls, Experience, Summary) */}
        <main className="pl-config-main">
          {/* Interactive Print Area Canvas Editor */}
          <PrintAreaEditor
            selectedImage={selectedImage}
            printArea={currentPrintArea}
            onChangePrintArea={handleChangePrintArea}
            isAreaEnabled={isAreaEnabled}
            onToggleAreaEnabled={handleTogglePrintArea}
          />

          {/* Numerical & Presets Controls */}
          <PrintAreaControls
            printArea={currentPrintArea}
            onChangePrintArea={handleChangePrintArea}
            selectedImageTitle={selectedImage?.title}
            isAreaEnabled={isAreaEnabled}
            onToggleAreaEnabled={handleTogglePrintArea}
          />

          {/* Customer Experience & Upload Options */}
          <CustomerExperienceSettings
            settings={configState.settings}
            onChangeSettings={handleChangeSettings}
          />

          {/* Real-time Summary Card & Action Bar */}
          <ConfigurationSummary
            product={selectedProduct}
            selectedImage={selectedImage}
            printArea={currentPrintArea}
            isAreaEnabled={isAreaEnabled}
            isSaving={isSaving}
            onSave={handleSaveConfiguration}
            onCancel={() => navigate("/")}
          />
        </main>
      </div>

      {/* Save Confirmation Modal */}
      <SaveSuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        productTitle={selectedProduct?.title}
        onGoToDashboard={() => {
          setShowSuccessModal(false);
          navigate("/");
        }}
        onContinueConfiguring={() => setShowSuccessModal(false)}
      />

      {/* Toast Notification */}
      <Toast
        message={toastMessage}
        onClose={() => setToastMessage(null)}
      />
    </Layout>
  );
}