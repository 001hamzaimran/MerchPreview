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
        const shopDomain = window.Configuration?.store || window.Shopify?.shop || window.location.hostname;
        const proxyVerifyUrl = `/apps/proxy/verify-block?shop=${encodeURIComponent(shopDomain)}`;
        const directVerifyUrl = `/customapi/verify-block?shop=${encodeURIComponent(shopDomain)}`;

        fetch(proxyVerifyUrl, { method: "POST", keepalive: true })
          .catch(() => fetch(directVerifyUrl, { method: "POST", keepalive: true }))
          .catch(() => {});
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

      function applyConfig(data) {
        if (!data) return;
        if (data.printAreas && typeof data.printAreas === "object" && Object.keys(data.printAreas).length > 0) {
          const keys = Object.keys(data.printAreas);
          const enabledKey = keys.find((k) => data.printAreas[k]?.enabled !== false) || keys[0];
          printArea = data.printAreas[enabledKey] || data.printArea || printArea;
        } else if (data.printArea) {
          printArea = data.printArea;
        }
        applyPrintAreaStyles();
      }

      // Fetch configured print area from backend API or App Proxy
      async function loadPrintAreaConfig() {
        if (block._mpConfiguration) {
          applyConfig(block._mpConfiguration);
          return;
        }

        try {
          const shop = window.Configuration?.store || window.Shopify?.shop || window.location.hostname;
          const directUrl = `/customapi/configuration?shop=${encodeURIComponent(shop)}&productId=${encodeURIComponent(productId)}`;
          const proxyUrl = `/apps/proxy/configuration?productId=${encodeURIComponent(productId)}`;

          let res = await fetch(directUrl);
          if (!res.ok && res.status === 404) {
            res = await fetch(proxyUrl);
          }
          if (res.ok) {
            const result = await res.json();
            if (result && result.configuration) {
              block._mpConfiguration = result.configuration;
              applyConfig(result.configuration);
              return;
            }
          }
        } catch (e) {
          // Fallback to default print area
        }
        applyPrintAreaStyles();
      }

      block.addEventListener("mp:config-loaded", (e) => {
        if (e.detail) {
          applyConfig(e.detail);
        }
      });

      function applyPrintAreaStyles() {
        if (!printBox) return;
        if (printArea && printArea.enabled === false) {
          printBox.style.display = "none";
          return;
        }
        printBox.style.display = "block";
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

      function generateMockupImage() {
        return new Promise((resolve) => {
          const productImgEl = modal.querySelector(".mp-product-img");
          const viewport = modal.querySelector(".mp-canvas-viewport");
          const printBoxEl = modal.querySelector(".mp-print-box");
          if (!productImgEl || !viewport || !artworkDataUrl) {
            return resolve(null);
          }

          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");
          if (!ctx) return resolve(null);

          // Use natural dimensions of the product image for high-res output
          const naturalW = productImgEl.naturalWidth || viewport.clientWidth || 800;
          const naturalH = productImgEl.naturalHeight || viewport.clientHeight || 800;
          canvas.width = Math.max(800, naturalW);
          canvas.height = Math.max(800, naturalH);

          const baseImg = new Image();
          baseImg.crossOrigin = "anonymous";
          baseImg.onload = () => {
            try {
              // 1. Draw base product image
              ctx.drawImage(baseImg, 0, 0, canvas.width, canvas.height);

              // 2. Calculate print area on canvas
              const targetX = printArea.x * canvas.width;
              const targetY = printArea.y * canvas.height;
              const targetW = printArea.width * canvas.width;
              const targetH = printArea.height * canvas.height;

              // 3. Load customer artwork
              const artImg = new Image();
              artImg.crossOrigin = "anonymous";
              artImg.onload = () => {
                try {
                  // Clip to print box
                  ctx.save();
                  ctx.beginPath();
                  ctx.rect(targetX, targetY, targetW, targetH);
                  ctx.clip();

                  const centerX = targetX + targetW / 2;
                  const centerY = targetY + targetH / 2;

                  const uiBoxW = printBoxEl?.clientWidth || 200;
                  const ratio = targetW / uiBoxW;

                  const artAspect = (artImg.naturalWidth || 1) / (artImg.naturalHeight || 1);
                  const boxAspect = targetW / targetH;
                  let fitW, fitH;
                  if (artAspect > boxAspect) {
                    fitW = targetW;
                    fitH = targetW / artAspect;
                  } else {
                    fitH = targetH;
                    fitW = targetH * artAspect;
                  }

                  ctx.translate(centerX + posX * ratio, centerY + posY * ratio);
                  ctx.rotate((rotation * Math.PI) / 180);
                  ctx.scale(scale, scale);
                  ctx.drawImage(artImg, -fitW / 2, -fitH / 2, fitW, fitH);
                  ctx.restore();

                  const mockupData = canvas.toDataURL("image/png");
                  resolve(mockupData);
                } catch (drawErr) {
                  console.warn("Canvas artwork composite error:", drawErr);
                  resolve(null);
                }
              };
              artImg.onerror = () => resolve(null);
              artImg.src = artworkDataUrl;
            } catch (drawBaseErr) {
              console.warn("Canvas base image composite error:", drawBaseErr);
              resolve(null);
            }
          };
          baseImg.onerror = () => resolve(null);
          baseImg.src = productImgEl.src;
        });
      }

      // Apply & Add to Cart
      if (applyBtn) {
        applyBtn.addEventListener("click", async () => {
          if (!artworkDataUrl) return;

          applyBtn.disabled = true;
          const originalText = applyBtn.innerHTML;
          applyBtn.innerHTML = `<span>Uploading to Cloudinary...</span>`;

          try {
            // 1. Generate composite mockup (product image + artwork)
            let mockupDataUrl = null;
            try {
              mockupDataUrl = await generateMockupImage();
            } catch (canvasErr) {
              console.warn("Mockup composite generation fallback:", canvasErr);
            }

            // 2. Upload both images to Cloudinary via backend API
            const shopDomain = window.Configuration?.store || window.Shopify?.shop || window.location.hostname;
            const directUploadUrl = `/customapi/upload-design?shop=${encodeURIComponent(shopDomain)}`;
            const proxyUploadUrl = `/apps/proxy/upload-design?shop=${encodeURIComponent(shopDomain)}`;

            let uploadResult = null;
            try {
              const uploadPayload = {
                shop: shopDomain,
                artwork: artworkDataUrl,
                mockup: mockupDataUrl,
                artworkName: artworkFile?.name || "custom-artwork.png",
                productId: productId,
              };

              let uploadResponse = await fetch(directUploadUrl, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(uploadPayload),
              });

              if (!uploadResponse.ok && uploadResponse.status === 404) {
                uploadResponse = await fetch(proxyUploadUrl, {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify(uploadPayload),
                });
              }

              if (uploadResponse.ok) {
                uploadResult = await uploadResponse.json();
                console.log("[MerchPreview] Cloudinary upload successful:", uploadResult);
              } else {
                console.warn("[MerchPreview] Cloudinary upload response not OK:", uploadResponse.status);
              }
            } catch (uploadErr) {
              console.error("[MerchPreview] Error calling /customapi/upload-design:", uploadErr);
            }

            // 3. Prepare Line Item Properties with both Cloudinary links
            const artworkLink = uploadResult?.artworkUrl || "";
            const mockupLink = uploadResult?.mockupUrl || "";

            const customProperties = {
              ...(artworkLink ? { "Custom Artwork": artworkLink } : {}),
              ...(mockupLink ? { "Preview Mockup": mockupLink } : {}),
              "Artwork Name": artworkFile?.name || "custom-design.png",
              "Print Area Placement": `X:${(printArea.x * 100).toFixed(0)}% Y:${(printArea.y * 100).toFixed(0)}% W:${(printArea.width * 100).toFixed(0)}% H:${(printArea.height * 100).toFixed(0)}%`,
              "Artwork Scale": `${(scale * 100).toFixed(0)}%`,
              "Artwork Rotation": `${rotation}°`,
            };

            applyBtn.innerHTML = `<span>Adding to Cart...</span>`;

            // 4. Post to Shopify Ajax Cart API
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
  const { productId, store, productPrice, variantId } = window.Configuration || {};
  console.log(productId, store, productPrice, variantId);

  // call this API and console here /customapi/getallproducts
  const shopDomain = store || window.Shopify?.shop || window.location.hostname;
  const directUrl = `/customapi/getallproducts?shop=${encodeURIComponent(shopDomain)}`;
  const proxyUrl = `/apps/proxy/getallproducts`;

  function handleProductsResponse(data) {
    console.log("/customapi/getallproducts response:", data);

    const blocks = document.querySelectorAll(".mp-block-container");
    if (!blocks.length) return;

    blocks.forEach((block) => {
      const blockProductId = String(block.dataset.productId || productId || "");
      const cleanBlockId = blockProductId.replace(/^gid:\/\/shopify\/Product\//, "");

      // Match configuration from API response
      let matchedConfig = null;
      if (data?.configurations && Array.isArray(data.configurations)) {
        matchedConfig = data.configurations.find((cfg) => {
          const cleanCfgId = String(cfg.productId || "").replace(/^gid:\/\/shopify\/Product\//, "");
          return cleanCfgId === cleanBlockId && cfg.status !== "Draft";
        });
      }

      const isConfigured = Boolean(
        matchedConfig ||
        data?.configuredProductIds?.some((id) => {
          const cleanId = String(id).replace(/^gid:\/\/shopify\/Product\//, "");
          return cleanId === cleanBlockId;
        }) ||
        data?.products?.some((p) => {
          const cleanId = String(p.id).replace(/^gid:\/\/shopify\/Product\//, "");
          return cleanId === cleanBlockId && p.isConfigured;
        })
      );

      if (isConfigured) {
        console.log(`[MerchPreview] Product ${cleanBlockId} is configured. Displaying personalization component.`);
        block.style.display = "block";
        block.classList.add("mp-visible");
        if (matchedConfig) {
          block._mpConfiguration = matchedConfig;
          block.dispatchEvent(new CustomEvent("mp:config-loaded", { detail: matchedConfig }));
        }
      } else {
        console.log(`[MerchPreview] Product ${cleanBlockId} is not configured. Personalization component hidden.`);
        block.style.display = "none";
        block.classList.remove("mp-visible");
      }
    });
  }

  fetch(directUrl)
    .then((res) => {
      if (!res.ok && res.status === 404) {
        return fetch(proxyUrl);
      }
      return res;
    })
    .then((res) => res.json())
    .then((data) => {
      handleProductsResponse(data);
    })
    .catch((err) => {
      fetch(proxyUrl)
        .then((res) => res.json())
        .then((data) => {
          console.log("/customapi/getallproducts response via proxy:", data);
          handleProductsResponse(data);
        })
        .catch((proxyErr) => {
          console.error("Error calling /customapi/getallproducts:", err);
          document.querySelectorAll(".mp-block-container").forEach((block) => {
            block.style.display = "none";
            block.classList.remove("mp-visible");
          });
        });
    });
});
