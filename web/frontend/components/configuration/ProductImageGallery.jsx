import React from "react";
import { Card } from "../ui/Card";
import { CheckIcon } from "../ui/Icons";

export function ProductImageGallery({
  images = [],
  selectedImageId,
  onSelectImage,
  printAreas = {},
}) {
  if (!images || images.length === 0) {
    return null;
  }

  return (
    <Card
      title="Product Images"
      subtitle="Select the image angle or view to configure"
    >
      <div className="pl-image-gallery">
        {images.map((img) => {
          const isSelected = img.id === selectedImageId;
          const areaConfig = printAreas && printAreas[img.id];
          const isConfigured = Boolean(areaConfig);
          const isAreaDisabled = areaConfig?.enabled === false;

          let tooltipText = img.title || "Product image";
          if (isConfigured) {
            tooltipText = isAreaDisabled
              ? `${img.title} (No print area on this view)`
              : `${img.title} (Print area configured)`;
          }

          return (
            <button
              key={img.id}
              type="button"
              className={`pl-image-thumb-btn ${isSelected ? "selected" : ""}`}
              onClick={() => onSelectImage(img.id)}
              title={tooltipText}
            >
              <img
                src={img.url}
                alt={img.title || "Product image"}
                className="pl-image-thumb-img"
              />
              <span className="pl-image-thumb-label">{img.title}</span>

              {/* Status indicator: enabled vs disabled */}
              {isConfigured && (
                <div
                  style={{
                    position: "absolute",
                    top: "3px",
                    left: "3px",
                    padding: "2px 4px",
                    borderRadius: "3px",
                    backgroundColor: isAreaDisabled
                      ? "rgba(71, 85, 105, 0.88)"
                      : isSelected
                      ? "#059669"
                      : "rgba(16, 185, 129, 0.9)",
                    color: "#ffffff",
                    fontSize: "0.58rem",
                    fontWeight: 700,
                    lineHeight: 1,
                    letterSpacing: "0.02em",
                    zIndex: 2,
                    boxShadow: "0 1px 2px rgba(0,0,0,0.2)",
                  }}
                  title={isAreaDisabled ? "Print area disabled on this view" : "Print area configured"}
                >
                  {isAreaDisabled ? "No Area" : "✓ Area"}
                </div>
              )}

              {isSelected && (
                <div
                  style={{
                    position: "absolute",
                    top: "3px",
                    right: "3px",
                    width: "18px",
                    height: "18px",
                    borderRadius: "50%",
                    backgroundColor: "var(--color-primary)",
                    color: "#ffffff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    zIndex: 2,
                  }}
                >
                  <CheckIcon size={10} />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </Card>
  );
}
