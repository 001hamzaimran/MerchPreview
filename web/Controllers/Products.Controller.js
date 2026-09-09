import { GETPRODUCTS } from "../GraphQL/Queries/GetProducts.graphql.js";
import shopify from "../shopify.js";

export const getProducts = async (req, res) => {
  try {
    const session = res.locals?.shopify?.session;
    if (!session) {
      return res.status(200).json([]);
    }
    const client = new shopify.api.clients.Graphql({ session });
    const response = await client.request(GETPRODUCTS);
    res.status(200).json(response?.data?.products?.nodes || []);
  } catch (error) {
    console.warn("Could not query products from Shopify Admin GraphQL:", error.message);
    res.status(200).json([]);
  }
};