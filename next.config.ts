import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Webpack configuration for TensorFlow.js
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        crypto: false,
      };
    }
    
    return config;
  },
  
  // Optimize images for Vercel deployment
  images: {
    domains: [],
    formats: ['image/webp', 'image/avif'],
  },
  
  // Enable experimental features if needed
  experimental: {
    optimizePackageImports: ['@tensorflow/tfjs'],
  },
};

export default nextConfig;
