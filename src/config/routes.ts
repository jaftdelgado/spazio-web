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
    propertyDetail: (uuid: string) => `/admin/properties/${uuid}`,
    propertiesCreate: "/admin/properties/new",
    propertiesEdit: "/admin/properties/edit",
    visits: "/admin/visits",
    payments: "/admin/payments",
  },
} as const;
