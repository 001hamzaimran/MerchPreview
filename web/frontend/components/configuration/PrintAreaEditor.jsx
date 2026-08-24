import React, { useState } from "react";
import { usePrintAreaEditor } from "./usePrintAreaEditor";
import { ZoomInIcon, ZoomOutIcon, RefreshCwIcon, MaximizeIcon, LayersIcon } from "../ui/Icons";
import { Button } from "../ui/Button";

const HANDLES = [
  { id: "nw", className: "pl-handle-nw" },
  { id: "n",  className: "pl-handle-n"  },
  { id: "ne", className: "pl-handle-ne" },
  { id: "e",  className: "pl-handle-e"  },
  { id: "se", className: "pl-handle-se" },
  { id: "s",  className: "pl-handle-s"  },
  { id: "sw", className: "pl-handle-sw" },
  { id: "w",  className: "pl-handle-w"  },
];

export function PrintAreaEditor({
  selectedImage,
  printArea,
  onChangePrintArea,
}) {
  const [imageLoaded, setImageLoaded] = useState(false);

  const {
    zoom,
    isDragging,
    activeHandle,
    containerRef,
    handleZoomIn,
    handleZoomOut,
    handleResetZoom,
    handleFitToScreen,
    handleDragStart,
    handleResizeStart,
  } = usePrintAreaEditor({ printArea, onChangePrintArea });

  const xPercent = Math.max(0, Math.min(100, (printArea?.x ?? 0.25) * 100));
  const yPercent = Math.max(0, Math.min(100, (printArea?.y ?? 0.20) * 100));
  const wPercent = Math.max(5, Math.min(100, (printArea?.width ?? 0.50) * 100));
  const hPercent = Math.max(5, Math.min(100, (printArea?.height ?? 0.40) * 100));

  return (
    <div className="pl-canvas-card">
      {/* Canvas Top Toolbar */}
      <div className="pl-canvas-toolbar">
        <div className="pl-canvas-toolbar-group">
          <span style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--color-text-main)", display: "flex", alignItems: "center", gap: "6px" }}>
            <LayersIcon size={16} />
            Canvas Editor
          </span>
          <span style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>
            ({selectedImage?.title || "Product View"})
          </span>
        </div>

        <div className="pl-canvas-toolbar-group">
          <Button
            variant="secondary"
            size="icon"
            className="pl-btn-sm"
            onClick={handleZoomOut}
            disabled={zoom <= 50}
            title="Zoom Out"
            aria-label="Zoom Out"
            icon={<ZoomOutIcon size={14} />}
          />
          <span className="pl-zoom-badge">{zoom}%</span>
          <Button
            variant="secondary"
            size="icon"
            className="pl-btn-sm"
            onClick={handleZoomIn}
            disabled={zoom >= 200}
            title="Zoom In"
            aria-label="Zoom In"
            icon={<ZoomInIcon size={14} />}
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={handleResetZoom}
            icon={<RefreshCwIcon size={13} />}
            title="Reset Zoom"
          >
            Reset
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleFitToScreen}
            icon={<MaximizeIcon size={13} />}
            title="Fit to Screen"
          >
            Fit
          </Button>
        </div>
      </div>

      {/* Canvas Viewport */}
      <div className="pl-canvas-viewport">
        {selectedImage ? (
          <div
            ref={containerRef}
            className="pl-canvas-stage"
            style={{
              transform: `scale(${zoom / 100})`,
            }}
          >
            <img
              src={selectedImage.url}
              alt={selectedImage.title || "Product view"}
              className="pl-canvas-product-image"
              onLoad={() => setImageLoaded(true)}
              draggable={false}
            />

            {/* Print Area Overlay Box */}
            <div
              className={`pl-print-box ${isDragging ? "is-dragging" : ""}`}
              style={{
                left: `${xPercent}%`,
                top: `${yPercent}%`,
                width: `${wPercent}%`,
                height: `${hPercent}%`,
              }}
              onPointerDown={handleDragStart}
            >
              {/* Internal grid guides */}
              <div className="pl-print-box-grid" />

              {/* Center Label Badge */}
              <div className="pl-print-box-badge">
                <span>PRINT AREA</span>
                <span>[{Math.round(wPercent)}% × {Math.round(hPercent)}%]</span>
              </div>

              {/* 8 Resize Handles */}
              {HANDLES.map((handle) => (
                <div
                  key={handle.id}
                  className={`pl-resize-handle ${handle.className} ${activeHandle === handle.id ? "active" : ""}`}
                  onPointerDown={(e) => handleResizeStart(e, handle.id)}
                />
              ))}
            </div>
          </div>
        ) : (
          <div style={{ color: "var(--color-text-muted)", fontSize: "0.875rem" }}>
            No product image selected.
          </div>
        )}
      </div>
    </div>
  );
}
