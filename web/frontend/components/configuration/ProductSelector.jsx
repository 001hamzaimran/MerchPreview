import React, { useState, useMemo, useEffect } from "react";
import { Card } from "../ui/Card";
import { Input } from "../ui/Input";
import { Button } from "../ui/Button";
import { ProductCard } from "./ProductCard";
import { SearchIcon, LayersIcon, XIcon, ChevronLeftIcon, ChevronRightIcon } from "../ui/Icons";
import { EmptyState } from "../ui/EmptyState";
import { Skeleton } from "../ui/LoadingState";

export function ProductSelector({
  products = [],
  selectedProductId,
  onSelectProduct,
  isLoading = false,
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);

  // Extract unique categories across all products
  const categories = useMemo(() => {
    const set = new Set();
    products.forEach((p) => {
      if (p.category) set.add(p.category);
    });
    return ["All", ...Array.from(set)];
  }, [products]);

  // Filter products by search and category
  const filteredProducts = useMemo(() => {
    let result = products;

    if (selectedCategory !== "All") {
      result = result.filter(
        (p) => (p.category || "").toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    if (searchTerm.trim()) {
      const query = searchTerm.toLowerCase().trim();
      result = result.filter(
        (p) =>
          p.title?.toLowerCase().includes(query) ||
          p.category?.toLowerCase().includes(query) ||
          p.id?.toLowerCase().includes(query) ||
          p.handle?.toLowerCase().includes(query)
      );
    }

    return result;
  }, [products, searchTerm, selectedCategory]);

  // Reset to page 1 when search or category changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategory, pageSize]);

  // Ensure current page includes selected product if page changes
  useEffect(() => {
    if (!selectedProductId) return;
    const index = filteredProducts.findIndex((p) => p.id === selectedProductId);
    if (index !== -1) {
      const targetPage = Math.floor(index / pageSize) + 1;
      if (targetPage !== currentPage && targetPage <= Math.ceil(filteredProducts.length / pageSize)) {
        setCurrentPage(targetPage);
      }
    }
  }, [selectedProductId]);

  // Paginated slice
  const totalItems = filteredProducts.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedProducts = useMemo(
    () => filteredProducts.slice(startIndex, startIndex + pageSize),
    [filteredProducts, startIndex, pageSize]
  );

  return (
    <Card
      title="Select Product"
      subtitle="Choose the product to define a printable area"
      headerAction={
        <span className="pl-product-count-badge">
          {products.length} Products
        </span>
      }
    >
      {/* Search Input with Clear Button */}
      <div style={{ marginBottom: "12px" }}>
        <Input
          placeholder="Search products by title, type, or ID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          iconLeft={<SearchIcon size={16} />}
          iconRight={
            searchTerm ? (
              <button
                type="button"
                onClick={() => setSearchTerm("")}
                style={{ background: "none", border: "none", cursor: "pointer", color: "var(--color-text-muted)", display: "flex" }}
                aria-label="Clear search"
              >
                <XIcon size={14} />
              </button>
            ) : null
          }
        />
      </div>

      {/* Category Filter Chips (if more than 1 category) */}
      {categories.length > 2 && (
        <div className="pl-category-chips-scroll">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              className={`pl-category-chip ${selectedCategory === cat ? "active" : ""}`}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {/* Product List or Skeleton Loader */}
      <div className="pl-product-list">
        {isLoading ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px", padding: "8px 0" }}>
            {[...Array(5)].map((_, i) => (
              <div key={i} style={{ display: "flex", gap: "12px", alignItems: "center", padding: "10px", border: "1px solid var(--color-border)", borderRadius: "var(--radius-md)" }}>
                <Skeleton width="48px" height="48px" borderRadius="var(--radius-sm)" />
                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "6px" }}>
                  <Skeleton width="70%" height="16px" />
                  <Skeleton width="40%" height="12px" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <EmptyState
            title="No matching products"
            description={
              searchTerm || selectedCategory !== "All"
                ? "Try adjusting your search terms or category filter."
                : "No products available in this store."
            }
            actionLabel={searchTerm || selectedCategory !== "All" ? "Clear Filters" : undefined}
            onAction={() => {
              setSearchTerm("");
              setSelectedCategory("All");
            }}
            icon={<LayersIcon size={24} />}
          />
        ) : (
          paginatedProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              isSelected={product.id === selectedProductId}
              onSelect={onSelectProduct}
            />
          ))
        )}
      </div>

      {/* Pagination Controls for Large Product Catalogs (250+ products) */}
      {totalItems > 0 && !isLoading && (
        <div className="pl-pagination-container">
          <div className="pl-pagination-info">
            Showing {Math.min(startIndex + 1, totalItems)}–{Math.min(startIndex + pageSize, totalItems)} of {totalItems}
          </div>

          <div className="pl-pagination-actions">
            <Button
              variant="secondary"
              size="icon"
              className="pl-btn-sm"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              title="Previous Page"
              aria-label="Previous Page"
              icon={<ChevronLeftIcon size={14} />}
            />

            <span className="pl-pagination-page-label">
              {currentPage} / {totalPages}
            </span>

            <Button
              variant="secondary"
              size="icon"
              className="pl-btn-sm"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              title="Next Page"
              aria-label="Next Page"
              icon={<ChevronRightIcon size={14} />}
            />
          </div>
        </div>
      )}
    </Card>
  );
}
