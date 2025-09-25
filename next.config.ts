import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable static optimization for better performance
  output: 'export',
  trailingSlash: true,
  
  // Optimize images
  images: {
    unoptimized: true, // Required for static export
  },
  
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
    
    // Optimize for client-side processing
    config.optimization.splitChunks = {
      chunks: 'all',
      cacheGroups: {
        tensorflow: {
          test: /[\\/]node_modules[\\/]@tensorflow[\\/]/,
          name: 'tensorflow',
          chunks: 'all',
          priority: 10,
        },
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
          priority: 5,
        },
      },
    };
    
    return config;
  },
  
};

export default nextConfig;
