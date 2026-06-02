export const ROUTES = {
  home: "/",
  explore: "/explore",
  auth: {
    login: "/auth/login",
    signUp: "/auth/sign-up",
  },
  admin: {
    root: "/admin",
    properties: "/admin/properties",
    propertiesCreate: "/admin/properties/new",
    visits: "/admin/visits",
    payments: "/admin/payments",
  },
} as const;
