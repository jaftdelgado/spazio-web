export const ROUTES = {
  home: "/",
  explore: "/explore",
  auth: {
    login: "/auth/login",
    signUp: "/auth/sign-up",
    forgotPassword: "/auth/forgot-password",
  },
  admin: {
    root: "/admin",
    properties: "/admin/properties",
    propertyDetail: (uuid: string) => `/admin/properties/${uuid}`,
    propertiesCreate: "/admin/properties/new",
    propertiesEdit: "/admin/properties/edit",
    visits: "/admin/visits",
    payments: "/admin/payments",
    users: "/admin/users",
  },
  settings: {
    root: "/settings",
    account: "/settings/account",
    preferences: "/settings/preferences",
    withSource: (path: "/settings" | "/settings/account" | "/settings/preferences", source: "admin" | "explore") =>
      `${path}?from=${source}`,
  },
  client: {
    myVisits: "/my-visits",
    myPayments: "/my-payments",
    myContracts: "/my-contracts",
  },
} as const;
