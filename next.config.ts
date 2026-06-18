import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  reactCompiler: true,
  turbopack: {
    root: __dirname,
    resolveAlias: {
      "@": path.resolve(__dirname, "src"),
      "@lib": path.resolve(__dirname, "src/lib"),
      "@config": path.resolve(__dirname, "src/config"),
      "@types": path.resolve(__dirname, "src/types"),
      "@components": path.resolve(__dirname, "src/components"),
      "@catalogs": path.resolve(__dirname, "src/modules/catalogs"),
      "@clauses": path.resolve(__dirname, "src/modules/clauses"),
      "@contracts": path.resolve(__dirname, "src/modules/contracts"),
      "@locations": path.resolve(__dirname, "src/modules/locations"),
      "@payments": path.resolve(__dirname, "src/modules/payments"),
      "@properties": path.resolve(__dirname, "src/modules/properties"),
      "@services": path.resolve(__dirname, "src/modules/services"),
      "@uploads": path.resolve(__dirname, "src/modules/uploads"),
      "@users": path.resolve(__dirname, "src/modules/users"),
      "@visits": path.resolve(__dirname, "src/modules/visits"),
    },
  },
};

export default nextConfig;
