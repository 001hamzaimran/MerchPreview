import React from "react";
import { Card } from "../ui/Card";
import { CheckIcon } from "../ui/Icons";

export function ProductImageGallery({
  images = [],
  selectedImageId,
  onSelectImage,
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
          return (
            <button
              key={img.id}
              type="button"
              className={`pl-image-thumb-btn ${isSelected ? "selected" : ""}`}
              onClick={() => onSelectImage(img.id)}
              title={img.title || "Product image"}
            >
              <img
                src={img.url}
                alt={img.title || "Product image"}
                className="pl-image-thumb-img"
              />
              <span className="pl-image-thumb-label">{img.title}</span>
              {isSelected && (
                <div
                  style={{
                    position: "absolute",
                    top: "4px",
                    right: "4px",
                    width: "18px",
                    height: "18px",
                    borderRadius: "50%",
                    backgroundColor: "var(--color-primary)",
                    color: "#ffffff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
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
