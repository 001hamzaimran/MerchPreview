export const GET_MAIN_THEME = `query GetMainTheme {
  themes(first: 5, roles: [MAIN]) {
    nodes {
      id
      name
      role
    }
  }
}`;
