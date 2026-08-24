import { GETPRODUCTS } from "../GraphQL/Queries/GetProducts.graphql.js";
import shopify from "../shopify.js"
export const getProducts = async (req, res) => {
    try {
        const client = new shopify.api.clients.Graphql({ session: res.locals.shopify.session });
        const response = await client.request(GETPRODUCTS);
        res.status(200).send(response.data.products.nodes);
    } catch (error) {
        console.log(`Error: ${error.message}`);
        res.status(500).send({ error: error.message });
    }
}