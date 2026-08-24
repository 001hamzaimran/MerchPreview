import React from "react";
import { StatusBadge } from "../ui/StatusBadge";
import { CheckIcon } from "../ui/Icons";

const FALLBACK_IMAGE =
  "https://cdn.shopify.com/s/files/1/0533/2089/files/placeholder-images-image_large.png?format=webp";

export function ProductCard({ product, isSelected, onSelect }) {
  const defaultImg = product.images?.[0]?.url || FALLBACK_IMAGE;

  return (
    <button
      type="button"
      className={`pl-product-item ${isSelected ? "selected" : ""}`}
      onClick={() => onSelect(product)}
    >
      <img
        src={defaultImg}
        alt={product.title}
        className="pl-product-item-thumb"
        loading="lazy"
        onError={(e) => {
          e.target.onerror = null;
          e.target.src = FALLBACK_IMAGE;
        }}
      />
      <div className="pl-product-item-info">
        <div className="pl-product-item-title" title={product.title}>
          {product.title}
        </div>
        <div className="pl-product-item-meta">
          <StatusBadge status={product.status || "Active"} />
          {product.category && (
            <>
              <span>•</span>
              <span className="pl-product-category-tag">{product.category}</span>
            </>
          )}
          <span>•</span>
          <span>{product.images?.length || 1} image{product.images?.length === 1 ? "" : "s"}</span>
        </div>
      </div>
      {isSelected && (
        <div
          style={{
            width: "22px",
            height: "22px",
            borderRadius: "50%",
            backgroundColor: "var(--color-primary)",
            color: "#ffffff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <CheckIcon size={13} />
        </div>
      )}
    </button>
  );
}
