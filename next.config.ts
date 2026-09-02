import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "aexbtrgitskffsxuntca.supabase.co",
        port: "",
        pathname: "/storage/v1/**",
      },
    ],
  },
};

export default nextConfig;