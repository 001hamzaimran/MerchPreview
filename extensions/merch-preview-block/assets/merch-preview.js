/**
 * MerchPreview Storefront Theme App Extension
 * Handles customer artwork upload, live 2D canvas preview scaling, and Shopify cart integration.
 */

(function () {
  "use strict";

  function initMerchPreview() {
    const blocks = document.querySelectorAll(".mp-block-container");
    if (!blocks.length) return;

    blocks.forEach((block) => {
      // Prevent multiple initializations
      if (block.dataset.mpInitialized) return;
      block.dataset.mpInitialized = "true";

      // Notify backend that theme app block is rendered on storefront
      try {
        fetch("/api/themes/verify-block", { method: "POST", keepalive: true }).catch(() => {});
      } catch (e) {
        // ignore
      }

      const productId = block.dataset.productId;
      const variantId = block.dataset.variantId;
      const productTitle = block.dataset.productTitle;
      const triggerBtn = block.querySelector(".mp-trigger-btn");
      const modal = block.querySelector(".mp-modal-backdrop");
      if (!modal || !triggerBtn) return;

      const closeBtn = modal.querySelector(".mp-modal-close-btn");
      const dropzone = modal.querySelector(".mp-dropzone");
      const fileInput = modal.querySelector(".mp-file-input");
      const fileCard = modal.querySelector(".mp-file-card");
      const thumbImg = modal.querySelector(".mp-file-card-thumb img");
      const fileNameEl = modal.querySelector(".mp-file-card-name");
      const fileSizeEl = modal.querySelector(".mp-file-card-size");
      const removeBtn = modal.querySelector(".mp-file-remove-btn");

      const printBox = modal.querySelector(".mp-print-box");
      const artworkWrap = modal.querySelector(".mp-artwork-container");
      const artworkImg = modal.querySelector(".mp-artwork-img");
      const placeholder = modal.querySelector(".mp-artwork-placeholder");

      const adjustSection = modal.querySelector(".mp-adjust-section");
      const scaleSlider = modal.querySelector(".mp-scale-slider");
      const scaleVal = modal.querySelector(".mp-scale-val");
      const centerBtn = modal.querySelector("#mp-center-btn-" + block.id.replace("mp-block-", ""));
      const fitBtn = modal.querySelector("#mp-fit-btn-" + block.id.replace("mp-block-", ""));
      const rotateBtn = modal.querySelector("#mp-rotate-btn-" + block.id.replace("mp-block-", ""));
      const toggleGuideBtn = modal.querySelector(".mp-preview-toggle-btn");
      const resetBtn = modal.querySelector(".mp-preview-reset-btn");
      const applyBtn = modal.querySelector(".mp-apply-btn");

      // State
      let printArea = { x: 0.25, y: 0.20, width: 0.50, height: 0.40 };
      let artworkDataUrl = null;
      let artworkFile = null;
      let scale = 1.0;
      let rotation = 0;
      let posX = 0;
      let posY = 0;
      let isDragging = false;
      let startX = 0;
      let startY = 0;

      // Fetch configured print area from backend API or App Proxy
      async function loadPrintAreaConfig() {
        try {
          const res = await fetch(`/api/configurations/${productId}`);
          if (res.ok) {
            const data = await res.json();
            if (data && data.printArea) {
              printArea = data.printArea;
              applyPrintAreaStyles();
            }
          }
        } catch (e) {
          // Fallback to default print area
          applyPrintAreaStyles();
        }
      }

      function applyPrintAreaStyles() {
        if (!printBox) return;
        printBox.style.left = `${(printArea.x * 100).toFixed(2)}%`;
        printBox.style.top = `${(printArea.y * 100).toFixed(2)}%`;
        printBox.style.width = `${(printArea.width * 100).toFixed(2)}%`;
        printBox.style.height = `${(printArea.height * 100).toFixed(2)}%`;
      }

      function updateArtworkTransform() {
        if (!artworkImg) return;
        artworkImg.style.transform = `translate(${posX}px, ${posY}px) scale(${scale}) rotate(${rotation}deg)`;
      }

      function resetTransform() {
        scale = 1.0;
        rotation = 0;
        posX = 0;
        posY = 0;
        if (scaleSlider) scaleSlider.value = "100";
        if (scaleVal) scaleVal.textContent = "100%";
        updateArtworkTransform();
      }

      // Open Modal
      triggerBtn.addEventListener("click", () => {
        modal.classList.add("mp-open");
        document.body.style.overflow = "hidden";
        loadPrintAreaConfig();
      });

      // Close Modal
      function closeModal() {
        modal.classList.remove("mp-open");
        document.body.style.overflow = "";
      }

      closeBtn.addEventListener("click", closeModal);
      modal.addEventListener("click", (e) => {
        if (e.target === modal) closeModal();
      });

      // File Handling
      function handleSelectedFile(file) {
        if (!file) return;

        // Validation (Max 10MB)
        if (file.size > 10 * 1024 * 1024) {
          alert("File size exceeds 10MB limit. Please choose a smaller image.");
          return;
        }

        artworkFile = file;
        const reader = new FileReader();
        reader.onload = (e) => {
          artworkDataUrl = e.target.result;
          artworkImg.src = artworkDataUrl;
          artworkImg.style.display = "block";
          if (placeholder) placeholder.style.display = "none";
          if (thumbImg) thumbImg.src = artworkDataUrl;
          if (fileNameEl) fileNameEl.textContent = file.name;
          if (fileSizeEl) fileSizeEl.textContent = `${(file.size / (1024 * 1024)).toFixed(2)} MB`;

          if (dropzone) dropzone.style.display = "none";
          if (fileCard) fileCard.style.display = "flex";
          if (adjustSection) {
            adjustSection.style.opacity = "1";
            adjustSection.style.pointerEvents = "auto";
          }
          if (applyBtn) applyBtn.disabled = false;

          resetTransform();
        };
        reader.readAsDataURL(file);
      }

      fileInput.addEventListener("change", (e) => {
        if (e.target.files && e.target.files[0]) {
          handleSelectedFile(e.target.files[0]);
        }
      });

      // Drag & Drop
      ["dragenter", "dragover"].forEach((eventName) => {
        dropzone.addEventListener(eventName, (e) => {
          e.preventDefault();
          e.stopPropagation();
          dropzone.classList.add("dragover");
        });
      });

      ["dragleave", "drop"].forEach((eventName) => {
        dropzone.addEventListener(eventName, (e) => {
          e.preventDefault();
          e.stopPropagation();
          dropzone.classList.remove("dragover");
        });
      });

      dropzone.addEventListener("drop", (e) => {
        if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0]) {
          handleSelectedFile(e.dataTransfer.files[0]);
        }
      });

      // Remove File
      removeBtn.addEventListener("click", () => {
        artworkFile = null;
        artworkDataUrl = null;
        artworkImg.src = "";
        artworkImg.style.display = "none";
        fileInput.value = "";
        if (placeholder) placeholder.style.display = "flex";
        if (dropzone) dropzone.style.display = "block";
        if (fileCard) fileCard.style.display = "none";
        if (adjustSection) {
          adjustSection.style.opacity = "0.5";
          adjustSection.style.pointerEvents = "none";
        }
        if (applyBtn) applyBtn.disabled = true;
        resetTransform();
      });

      // Scale Slider
      if (scaleSlider) {
        scaleSlider.addEventListener("input", (e) => {
          const val = parseInt(e.target.value, 10);
          scale = val / 100;
          if (scaleVal) scaleVal.textContent = `${val}%`;
          updateArtworkTransform();
        });
      }

      // Center Preset
      if (centerBtn) {
        centerBtn.addEventListener("click", () => {
          posX = 0;
          posY = 0;
          updateArtworkTransform();
        });
      }

      // Fit Preset
      if (fitBtn) {
        fitBtn.addEventListener("click", () => {
          posX = 0;
          posY = 0;
          scale = 1.0;
          if (scaleSlider) scaleSlider.value = "100";
          if (scaleVal) scaleVal.textContent = "100%";
          updateArtworkTransform();
        });
      }

      // Rotate Preset
      if (rotateBtn) {
        rotateBtn.addEventListener("click", () => {
          rotation = (rotation + 90) % 360;
          updateArtworkTransform();
        });
      }

      // Toggle Guide Box
      if (toggleGuideBtn) {
        toggleGuideBtn.addEventListener("click", () => {
          const isGuideHidden = printBox.classList.toggle("guide-hidden");
          toggleGuideBtn.classList.toggle("active", !isGuideHidden);
        });
      }

      // Reset All
      if (resetBtn) {
        resetBtn.addEventListener("click", resetTransform);
      }

      // Canvas Dragging / Repositioning
      if (artworkWrap) {
        artworkWrap.addEventListener("mousedown", (e) => {
          if (!artworkDataUrl) return;
          isDragging = true;
          startX = e.clientX - posX;
          startY = e.clientY - posY;
        });

        window.addEventListener("mousemove", (e) => {
          if (!isDragging) return;
          posX = e.clientX - startX;
          posY = e.clientY - startY;
          updateArtworkTransform();
        });

        window.addEventListener("mouseup", () => {
          isDragging = false;
        });

        // Touch support for mobile devices
        artworkWrap.addEventListener("touchstart", (e) => {
          if (!artworkDataUrl || !e.touches[0]) return;
          isDragging = true;
          startX = e.touches[0].clientX - posX;
          startY = e.touches[0].clientY - posY;
        });

        window.addEventListener("touchmove", (e) => {
          if (!isDragging || !e.touches[0]) return;
          posX = e.touches[0].clientX - startX;
          posY = e.touches[0].clientY - startY;
          updateArtworkTransform();
        });

        window.addEventListener("touchend", () => {
          isDragging = false;
        });
      }

      // Apply & Add to Cart
      if (applyBtn) {
        applyBtn.addEventListener("click", async () => {
          if (!artworkDataUrl) return;

          applyBtn.disabled = true;
          const originalText = applyBtn.innerHTML;
          applyBtn.innerHTML = `<span>Saving & Adding to Cart...</span>`;

          try {
            // Storefront Line Item Properties (visible to merchants in Admin Order details)
            const customProperties = {
              "Artwork Name": artworkFile?.name || "custom-design.png",
              "Print Area Placement": `X:${(printArea.x * 100).toFixed(0)}% Y:${(printArea.y * 100).toFixed(0)}% W:${(printArea.width * 100).toFixed(0)}% H:${(printArea.height * 100).toFixed(0)}%`,
              "Artwork Scale": `${(scale * 100).toFixed(0)}%`,
              "Artwork Rotation": `${rotation}°`,
            };

            // Post to Shopify Ajax Cart API
            const cartResponse = await fetch("/cart/add.js", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                items: [
                  {
                    id: variantId,
                    quantity: 1,
                    properties: customProperties,
                  },
                ],
              }),
            });

            if (cartResponse.ok) {
              applyBtn.innerHTML = `<span>✓ Added to Cart!</span>`;
              setTimeout(() => {
                closeModal();
                // Redirect to cart or trigger cart drawer
                window.location.href = "/cart";
              }, 600);
            } else {
              // Fallback: inject properties to native product form if on page
              const form = document.querySelector('form[action*="/cart/add"]');
              if (form) {
                Object.entries(customProperties).forEach(([key, val]) => {
                  let input = form.querySelector(`input[name="properties[${key}]"]`);
                  if (!input) {
                    input = document.createElement("input");
                    input.type = "hidden";
                    input.name = `properties[${key}]`;
                    form.appendChild(input);
                  }
                  input.value = val;
                });
                closeModal();
                form.submit();
              } else {
                window.location.href = "/cart";
              }
            }
          } catch (err) {
            console.error("Error adding customized product to cart:", err);
            window.location.href = "/cart";
          }
        });
      }

      // Initial positioning
      applyPrintAreaStyles();
    });
  }

  // DOM ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initMerchPreview);
  } else {
    initMerchPreview();
  }
})();

window.addEventListener("DOMContentLoaded", () => {
  const { productId, store, productPrice, variantId } = window.Configuration;
  console.log(productId, store, productPrice, variantId);
});
