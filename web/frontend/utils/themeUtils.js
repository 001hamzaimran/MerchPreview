/**
 * Dynamically queries the backend Shopify GraphQL API for the store's published MAIN theme ID
 * and opens the exact live Theme Editor URL for any merchant store.
 */
export async function openThemeEditor() {
  try {
    const res = await fetch("/api/themes/editor-url");
    if (res.ok) {
      const data = await res.json();
      if (data && data.editorUrl) {
        window.open(data.editorUrl, "_blank");
        return;
      }
    }
  } catch (err) {
    console.warn("Could not retrieve live theme editor URL from API:", err);
  }

  // Fallback: Use dynamic shop param from URL
  try {
    const params = new URLSearchParams(window.location.search);
    const shop = params.get("shop");
    if (shop) {
      window.open(`https://${shop}/admin/themes/current/editor`, "_blank");
      return;
    }
  } catch (e) {
    // ignore
  }

  window.open("https://admin.shopify.com", "_blank");
}

/**
 * Synchronous helper fallback for URL string resolution.
 */
export function getThemeEditorUrl() {
  try {
    const params = new URLSearchParams(window.location.search);
    const shop = params.get("shop");
    if (shop) {
      return `https://${shop}/admin/themes/current/editor`;
    }
  } catch (e) {
    // ignore
  }
  return "https://admin.shopify.com";
}

export default openThemeEditor;
