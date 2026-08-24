import { useState, useRef, useCallback, useEffect } from "react";

const MIN_SIZE = 0.05; // 5% minimum width and height

/**
 * Custom Hook for Print Area Dragging, Resizing, Zooming, and Boundary Math.
 * Coordinates (x, y, width, height) are strictly normalized in range [0, 1].
 */
export function usePrintAreaEditor({ printArea, onChangePrintArea }) {
  const [zoom, setZoom] = useState(100);
  const [isDragging, setIsDragging] = useState(false);
  const [activeHandle, setActiveHandle] = useState(null);

  const containerRef = useRef(null);
  const imageRef = useRef(null);
  const dragStartRef = useRef({ mouseX: 0, mouseY: 0, startArea: null, rect: null });

  // Clamp normalized values inside [0, 1]
  const clamp = (val, min = 0, max = 1) => Math.min(Math.max(val, min), max);

  // Zoom controls
  const handleZoomIn = useCallback(() => {
    setZoom((prev) => Math.min(prev + 15, 200));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoom((prev) => Math.max(prev - 15, 50));
  }, []);

  const handleResetZoom = useCallback(() => {
    setZoom(100);
  }, []);

  const handleFitToScreen = useCallback(() => {
    setZoom(100);
  }, []);

  // Alignment Presets
  const applyPreset = useCallback(
    (preset) => {
      if (!onChangePrintArea) return;

      switch (preset) {
        case "center":
          onChangePrintArea({
            x: 0.25,
            y: 0.25,
            width: 0.50,
            height: 0.50,
          });
          break;
        case "top-center":
          onChangePrintArea({
            x: 0.25,
            y: 0.15,
            width: 0.50,
            height: 0.40,
          });
          break;
        case "chest-pocket":
          onChangePrintArea({
            x: 0.55,
            y: 0.20,
            width: 0.25,
            height: 0.25,
          });
          break;
        case "fit-max":
          onChangePrintArea({
            x: 0.08,
            y: 0.08,
            width: 0.84,
            height: 0.84,
          });
          break;
        case "square-1-1":
          onChangePrintArea({
            x: 0.30,
            y: 0.30,
            width: 0.40,
            height: 0.40,
          });
          break;
        case "reset":
        default:
          onChangePrintArea({
            x: 0.25,
            y: 0.20,
            width: 0.50,
            height: 0.40,
          });
          break;
      }
    },
    [onChangePrintArea]
  );

  // Start Dragging Print Area
  const handleDragStart = useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();

      const stageEl = containerRef.current;
      if (!stageEl) return;

      const rect = stageEl.getBoundingClientRect();
      dragStartRef.current = {
        mouseX: e.clientX,
        mouseY: e.clientY,
        startArea: { ...printArea },
        rect,
      };

      setIsDragging(true);
    },
    [printArea]
  );

  // Start Resizing via a Handle
  const handleResizeStart = useCallback(
    (e, handle) => {
      e.preventDefault();
      e.stopPropagation();

      const stageEl = containerRef.current;
      if (!stageEl) return;

      const rect = stageEl.getBoundingClientRect();
      dragStartRef.current = {
        mouseX: e.clientX,
        mouseY: e.clientY,
        startArea: { ...printArea },
        rect,
      };

      setActiveHandle(handle);
    },
    [printArea]
  );

  // Global Pointer Move & Up Listeners
  useEffect(() => {
    const handlePointerMove = (e) => {
      if (!isDragging && !activeHandle) return;

      const { mouseX, mouseY, startArea, rect } = dragStartRef.current;
      if (!startArea || !rect || rect.width === 0 || rect.height === 0) return;

      // Delta in normalized 0..1 scale
      const dx = (e.clientX - mouseX) / rect.width;
      const dy = (e.clientY - mouseY) / rect.height;

      if (isDragging) {
        // Dragging moving the entire box
        const maxX = 1 - startArea.width;
        const maxY = 1 - startArea.height;

        const newX = clamp(startArea.x + dx, 0, Math.max(0, maxX));
        const newY = clamp(startArea.y + dy, 0, Math.max(0, maxY));

        onChangePrintArea({
          ...startArea,
          x: Math.round(newX * 1000) / 1000,
          y: Math.round(newY * 1000) / 1000,
        });
      } else if (activeHandle) {
        // Resizing based on active handle
        let newX = startArea.x;
        let newY = startArea.y;
        let newWidth = startArea.width;
        let newHeight = startArea.height;

        // West handles (modify x & width)
        if (activeHandle.includes("w")) {
          const proposedX = clamp(startArea.x + dx, 0, startArea.x + startArea.width - MIN_SIZE);
          newWidth = startArea.width + (startArea.x - proposedX);
          newX = proposedX;
        }

        // East handles (modify width)
        if (activeHandle.includes("e")) {
          const proposedWidth = startArea.width + dx;
          newWidth = clamp(proposedWidth, MIN_SIZE, 1 - startArea.x);
        }

        // North handles (modify y & height)
        if (activeHandle.includes("n")) {
          const proposedY = clamp(startArea.y + dy, 0, startArea.y + startArea.height - MIN_SIZE);
          newHeight = startArea.height + (startArea.y - proposedY);
          newY = proposedY;
        }

        // South handles (modify height)
        if (activeHandle.includes("s")) {
          const proposedHeight = startArea.height + dy;
          newHeight = clamp(proposedHeight, MIN_SIZE, 1 - startArea.y);
        }

        onChangePrintArea({
          x: Math.round(newX * 1000) / 1000,
          y: Math.round(newY * 1000) / 1000,
          width: Math.round(newWidth * 1000) / 1000,
          height: Math.round(newHeight * 1000) / 1000,
        });
      }
    };

    const handlePointerUp = () => {
      setIsDragging(false);
      setActiveHandle(null);
    };

    if (isDragging || activeHandle) {
      window.addEventListener("pointermove", handlePointerMove);
      window.addEventListener("pointerup", handlePointerUp);
    }

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, [isDragging, activeHandle, onChangePrintArea]);

  return {
    zoom,
    isDragging,
    activeHandle,
    containerRef,
    imageRef,
    handleZoomIn,
    handleZoomOut,
    handleResetZoom,
    handleFitToScreen,
    applyPreset,
    handleDragStart,
    handleResizeStart,
  };
}
