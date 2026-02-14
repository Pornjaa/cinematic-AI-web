/** @type {import('next').NextConfig} */
const nextConfig = {
  typedRoutes: true,
  typescript: {
    ignoreBuildErrors: true
  },
  webpack: (config, { dev }) => {
    if (dev) {
      // Avoid filesystem cache read timeouts seen on some local environments.
      config.cache = false;
      config.watchOptions = {
        ...config.watchOptions,
        poll: 1000,
        aggregateTimeout: 300
      };
    }
    return config;
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "*.amazonaws.com" },
      { protocol: "https", hostname: "image.mux.com" },
      { protocol: "https", hostname: "*.r2.cloudflarestorage.com" }
    ]
  }
};

export default nextConfig;
