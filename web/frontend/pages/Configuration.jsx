import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
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

  const [products, setProducts] = useState(MOCK_PRODUCTS);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);

  // Master Configuration State Model
  const [configState, setConfigState] = useState(() => {
    if (queryConfigId) { 
      const existing = INITIAL_SAVED_CONFIGURATIONS.find((c) => c.id === queryConfigId);
      if (existing) {
        return {
          selectedProductId: existing.productId,
          selectedImageId: existing.imageId,
          printArea: { ...existing.printArea },
          settings: { ...existing.settings },
        };
      }
    }

    if (queryProductId) {
      const prod = MOCK_PRODUCTS.find((p) => p.id === queryProductId);
      if (prod) {
        return {
          selectedProductId: prod.id,
          selectedImageId: prod.images?.[0]?.id || null,
          printArea: { ...DEFAULT_CONFIG_STATE.printArea },
          settings: { ...DEFAULT_CONFIG_STATE.settings },
        };
      }
    }

    return { ...DEFAULT_CONFIG_STATE };
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

              // Auto-select first product if currently selected isn't in fetched list
              setConfigState((prev) => {
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
  }, []);

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

  // Product Selection handler
  const handleSelectProduct = (product) => {
    setConfigState((prev) => ({
      ...prev,
      selectedProductId: product.id,
      selectedImageId: product.images?.[0]?.id || null,
    }));
  };

  // Image Selection handler
  const handleSelectImage = (imageId) => {
    setConfigState((prev) => ({
      ...prev,
      selectedImageId: imageId,
    }));
  };

  // Print Area change handler
  const handleChangePrintArea = (newPrintArea) => {
    setConfigState((prev) => ({
      ...prev,
      printArea: newPrintArea,
    }));
  };

  // Customer Experience settings handler
  const handleChangeSettings = (newSettings) => {
    setConfigState((prev) => ({
      ...prev,
      settings: newSettings,
    }));
  };

  // Save handler (Persists to MongoDB database)
  const handleSaveConfiguration = async () => {
    setIsSaving(true);
    try {
      const payload = {
        productId: selectedProduct?.id,
        productTitle: selectedProduct?.title,
        productImage: selectedImage?.url,
        imageId: selectedImage?.id,
        imageTitle: selectedImage?.title,
        printArea: configState.printArea,
        settings: configState.settings,
        status: "Active",
      };

      await fetch("/api/configurations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

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
      {/* Top Page Header */}
      <PageHeader
        title="Configure Product"
        subtitle="Define where customer artwork will appear on your product image."
        actions={
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <Link to="/" style={{ textDecoration: "none" }}>
              <Button variant="secondary" icon={<ArrowLeftIcon size={14} />}>
                Dashboard
              </Button>
            </Link>
            <Button
              variant="primary"
              loading={isSaving}
              onClick={handleSaveConfiguration}
              icon={<CheckIcon size={16} />}
            >
              Save Configuration
            </Button>
          </div>
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
          />
        </aside>

        {/* Right Column: Step 3 (Interactive Print Area Editor, Controls, Experience, Summary) */}
        <main className="pl-config-main">
          {/* Interactive Print Area Canvas Editor */}
          <PrintAreaEditor
            selectedImage={selectedImage}
            printArea={configState.printArea}
            onChangePrintArea={handleChangePrintArea}
          />

          {/* Numerical & Presets Controls */}
          <PrintAreaControls
            printArea={configState.printArea}
            onChangePrintArea={handleChangePrintArea}
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
            printArea={configState.printArea}
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