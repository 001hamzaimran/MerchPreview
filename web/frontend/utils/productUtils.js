/**
 * Product Normalization Utilities
 * Handles Shopify GraphQL API response structures (e.g. media.edges[].node.preview.image.url)
 * as well as mock catalog data and large datasets (250+ products).
 */

const FALLBACK_PRODUCT_IMAGE =
  "https://cdn.shopify.com/s/files/1/0533/2089/files/placeholder-images-image_large.png?format=webp";

/**
 * Normalizes a raw Shopify GraphQL Product node or mock product into a standardized format.
 */
export function normalizeShopifyProduct(product) {
  if (!product) return null;

  // Extract images from GraphQL `media.edges` or fallback `images`
  let images = [];

  if (product.media?.edges && Array.isArray(product.media.edges)) {
    images = product.media.edges
      .filter((edge) => edge?.node?.preview?.image?.url)
      .map((edge, index) => {
        const node = edge.node;
        const img = node.preview.image;
        return {
          id: node.id || `img_${product.id}_${index}`,
          title: img.altText || (index === 0 ? "Front View" : `View ${index + 1}`),
          url: img.url,
          width: img.width || 800,
          height: img.height || 800,
        };
      });
  } else if (product.images) {
    const rawImages = Array.isArray(product.images)
      ? product.images
      : Array.isArray(product.images?.nodes)
      ? product.images.nodes
      : [];
    images = rawImages.map((img, index) => {
      if (typeof img === "string") {
        return {
          id: `img_${product.id}_${index}`,
          title: index === 0 ? "Front View" : `View ${index + 1}`,
          url: img,
          width: 800,
          height: 800,
        };
      }
      return {
        id: img.id || `img_${product.id}_${index}`,
        title: img.title || img.altText || (index === 0 ? "Front View" : `View ${index + 1}`),
        url: img.url || img.src || FALLBACK_PRODUCT_IMAGE,
        width: img.width || 800,
        height: img.height || 800,
      };
    });
  }

  // If product has no media, provide a reliable placeholder view
  if (images.length === 0) {
    images = [
      {
        id: `img_placeholder_${product.id}`,
        title: "Default View",
        url: FALLBACK_PRODUCT_IMAGE,
        width: 800,
        height: 800,
      },
    ];
  }

  // Extract category / vendor / type
  const category =
    product.productType ||
    product.category ||
    (product.tags && product.tags[0]) ||
    "Merch";

  // Calculate variants count
  const variantsCount =
    product.variantsCount ??
    (product.variants?.edges?.length ?? product.variants?.length ?? 1);

  return {
    id: product.id,
    title: product.title || "Untitled Product",
    handle: product.handle || "",
    status: product.status || "Active",
    variantsCount,
    category,
    images,
    raw: product,
  };
}

/**
 * Normalizes an array of raw Shopify products.
 */
export function normalizeShopifyProducts(products) {
  if (!Array.isArray(products)) return [];
  return products.map(normalizeShopifyProduct).filter(Boolean);
}
