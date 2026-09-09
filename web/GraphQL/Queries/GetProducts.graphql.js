export const GETPRODUCTS = `query GetProducts {
  products(first: 250, query: "status:ACTIVE published_status:published") {
    nodes {
      id
      title
      images(first: 50) {
        nodes {
          id
          url
          altText
          width
          height
        }
      }
    }
  }
}`;