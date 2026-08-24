/**
 * MerchPreview Mock Data
 * Realistic Shopify GraphQL products structure (media.edges), saved configurations with unique IDs,
 * and support for large product catalogs (250+ items).
 */
import { normalizeShopifyProducts } from "../utils/productUtils";

export const RAW_SHOPIFY_PRODUCTS = [
  {
    id: "gid://shopify/Product/9182557274364",
    title: "Gift Card",
    productType: "Cards & Vouchers",
    status: "Active",
    variantsCount: 4,
    media: {
      edges: [
        {
          node: {
            id: "gid://shopify/MediaImage/38059568890108",
            preview: {
              image: {
                url: "https://cdn.shopify.com/s/files/1/0779/5376/1532/files/gift_card.png?v=1764259233",
                altText: "Gift Card Design",
              },
            },
          },
        },
      ],
    },
  },
  {
    id: "gid://shopify/Product/9182557307132",
    title: "The Inventory Not Tracked Snowboard",
    productType: "Sports & Outdoors",
    status: "Active",
    variantsCount: 3,
    media: {
      edges: [
        {
          node: {
            id: "gid://shopify/MediaImage/38059568922876",
            preview: {
              image: {
                url: "https://cdn.shopify.com/s/files/1/0779/5376/1532/files/snowboard_purple_hydrogen.png?v=1764259233",
                altText: "Snowboard Top Deck",
              },
            },
          },
        },
      ],
    },
  },
  {
    id: "gid://shopify/Product/9182557339900",
    title: "Classic Cotton Crewneck T-Shirt",
    productType: "Apparel",
    status: "Active",
    variantsCount: 5,
    media: {
      edges: [
        {
          node: {
            id: "gid://shopify/MediaImage/38059568955644",
            preview: {
              image: {
                url: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80",
                altText: "Front View",
              },
            },
          },
        },
        {
          node: {
            id: "gid://shopify/MediaImage/38059568988412",
            preview: {
              image: {
                url: "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?auto=format&fit=crop&w=800&q=80",
                altText: "Back View",
              },
            },
          },
        },
        {
          node: {
            id: "gid://shopify/MediaImage/38059569021180",
            preview: {
              image: {
                url: "https://images.unsplash.com/photo-1581655353564-df123a1eb820?auto=format&fit=crop&w=800&q=80",
                altText: "Folded / Mockup",
              },
            },
          },
        },
      ],
    },
  },
  {
    id: "gid://shopify/Product/9182557372668",
    title: "Premium Heavyweight Pullover Hoodie",
    productType: "Apparel",
    status: "Active",
    variantsCount: 4,
    media: {
      edges: [
        {
          node: {
            id: "gid://shopify/MediaImage/38059569053948",
            preview: {
              image: {
                url: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80",
                altText: "Front View",
              },
            },
          },
        },
        {
          node: {
            id: "gid://shopify/MediaImage/38059569086716",
            preview: {
              image: {
                url: "https://images.unsplash.com/photo-1578587018452-892bacefd3f2?auto=format&fit=crop&w=800&q=80",
                altText: "Back View",
              },
            },
          },
        },
      ],
    },
  },
  {
    id: "gid://shopify/Product/9182557405436",
    title: "Minimalist Ceramic Coffee Mug (11oz)",
    productType: "Home & Living",
    status: "Active",
    variantsCount: 2,
    media: {
      edges: [
        {
          node: {
            id: "gid://shopify/MediaImage/38059569119484",
            preview: {
              image: {
                url: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80",
                altText: "Front View",
              },
            },
          },
        },
        {
          node: {
            id: "gid://shopify/MediaImage/38059569152252",
            preview: {
              image: {
                url: "https://images.unsplash.com/photo-1577937927133-66ef06acdf18?auto=format&fit=crop&w=800&q=80",
                altText: "Side Angle",
              },
            },
          },
        },
      ],
    },
  },
  {
    id: "gid://shopify/Product/9182557438204",
    title: "Organic Cotton Canvas Tote Bag",
    productType: "Accessories",
    status: "Active",
    variantsCount: 3,
    media: {
      edges: [
        {
          node: {
            id: "gid://shopify/MediaImage/38059569185020",
            preview: {
              image: {
                url: "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80",
                altText: "Front Center",
              },
            },
          },
        },
      ],
    },
  },
  {
    id: "gid://shopify/Product/9182557470972",
    title: "Stainless Steel Thermal Tumbler (20oz)",
    productType: "Drinkware",
    status: "Active",
    variantsCount: 4,
    media: {
      edges: [
        {
          node: {
            id: "gid://shopify/MediaImage/38059569217788",
            preview: {
              image: {
                url: "https://images.unsplash.com/photo-1570570626315-95c1b1263d91?auto=format&fit=crop&w=800&q=80",
                altText: "Front View",
              },
            },
          },
        },
      ],
    },
  },
];

/**
 * Generates a realistic catalog of 250+ products for performance testing and mock browsing.
 */
function generateLargeProductCatalog(baseList, targetCount = 250) {
  const result = [...baseList];
  const prefixes = ["Vintage", "Eco-Friendly", "Custom", "Athletic", "Limited Edition", "Urban", "Signature", "Heritage", "Bold", "Seamless"];
  const types = ["T-Shirt", "Hoodie", "Sweatshirt", "Mug", "Tumbler", "Tote", "Cap", "Beanie", "Phone Case", "Poster", "Sticker Pack", "Backpack"];
  const images = [
    "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1570570626315-95c1b1263d91?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&w=800&q=80",
    "https://cdn.shopify.com/s/files/1/0779/5376/1532/files/gift_card.png?v=1764259233",
    "https://cdn.shopify.com/s/files/1/0779/5376/1532/files/snowboard_purple_hydrogen.png?v=1764259233",
  ];

  for (let i = baseList.length; i < targetCount; i++) {
    const prefix = prefixes[i % prefixes.length];
    const type = types[i % types.length];
    const imgUrl = images[i % images.length];
    const id = `gid://shopify/Product/9182557${(4000000 + i).toString()}`;

    result.push({
      id,
      title: `${prefix} ${type} #${i + 1}`,
      productType: type,
      status: i % 7 === 0 ? "Draft" : "Active",
      variantsCount: (i % 5) + 1,
      media: {
        edges: [
          {
            node: {
              id: `gid://shopify/MediaImage/380595${(7000000 + i).toString()}`,
              preview: {
                image: {
                  url: imgUrl,
                  altText: `${prefix} ${type} - View 1`,
                },
              },
            },
          },
        ],
      },
    });
  }

  return result;
}

export const LARGE_RAW_CATALOG = generateLargeProductCatalog(RAW_SHOPIFY_PRODUCTS, 260);

export const MOCK_PRODUCTS = normalizeShopifyProducts(LARGE_RAW_CATALOG);

export const INITIAL_SAVED_CONFIGURATIONS = [
  {
    id: "cfg_101",
    productId: "gid://shopify/Product/9182557274364",
    productTitle: "Gift Card",
    productImage: "https://cdn.shopify.com/s/files/1/0779/5376/1532/files/gift_card.png?v=1764259233",
    imageTitle: "Gift Card Design",
    imageId: "gid://shopify/MediaImage/38059568890108",
    printArea: {
      x: 0.15,
      y: 0.20,
      width: 0.70,
      height: 0.60,
    },
    settings: {
      enabled: true,
      acceptedFormats: ["png", "jpg", "webp", "svg"],
      maxFileSize: 10,
      previewButtonText: "Personalize Gift Card",
    },
    status: "Active",
    lastUpdated: "5 mins ago",
  },
  {
    id: "cfg_102",
    productId: "gid://shopify/Product/9182557307132",
    productTitle: "The Inventory Not Tracked Snowboard",
    productImage: "https://cdn.shopify.com/s/files/1/0779/5376/1532/files/snowboard_purple_hydrogen.png?v=1764259233",
    imageTitle: "Snowboard Top Deck",
    imageId: "gid://shopify/MediaImage/38059568922876",
    printArea: {
      x: 0.35,
      y: 0.15,
      width: 0.30,
      height: 0.70,
    },
    settings: {
      enabled: true,
      acceptedFormats: ["png", "jpg", "svg"],
      maxFileSize: 25,
      previewButtonText: "Design Snowboard",
    },
    status: "Active",
    lastUpdated: "45 mins ago",
  },
  {
    id: "cfg_103",
    productId: "gid://shopify/Product/9182557339900",
    productTitle: "Classic Cotton Crewneck T-Shirt",
    productImage: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80",
    imageTitle: "Front View",
    imageId: "gid://shopify/MediaImage/38059568955644",
    printArea: {
      x: 0.28,
      y: 0.22,
      width: 0.44,
      height: 0.42,
    },
    settings: {
      enabled: true,
      acceptedFormats: ["png", "jpg", "webp", "svg"],
      maxFileSize: 10,
      previewButtonText: "Preview Design",
    },
    status: "Active",
    lastUpdated: "2 hours ago",
  },
];

export const DEFAULT_CONFIG_STATE = {
  selectedProductId: "gid://shopify/Product/9182557274364",
  selectedImageId: "gid://shopify/MediaImage/38059568890108",
  printArea: {
    x: 0.20,
    y: 0.20,
    width: 0.60,
    height: 0.50,
  },
  settings: {
    enabled: true,
    acceptedFormats: ["png", "jpg", "webp", "svg"],
    maxFileSize: 10,
    previewButtonText: "Preview Design",
  },
};
