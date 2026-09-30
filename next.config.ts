import type { NextConfig } from "next";
import pkg from "./package.json";

const nextConfig: NextConfig = {
  env: {
    // Single source of truth for the version shown in the login footer / sidebar.
    NEXT_PUBLIC_APP_VERSION: pkg.version,
  },
};

export default nextConfig;
