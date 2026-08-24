export const GETPRODUCTS = `query GetProducts {
  products(first: 250, query: "status:ACTIVE published_status:published") {
    nodes {
      id
      title
      media(first: 250){
        edges{
          node{
            id
            preview{
              image{
                url
              }
            }
          }
        }
      }
    }
  }
}`