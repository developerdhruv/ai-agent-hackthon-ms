/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    // Alias canvas to prevent it from being resolved in the browser
    config.resolve.alias = {
      ...config.resolve.alias,
      canvas: false,
    };

    // Optional: Handle .node files if needed (not required for pdfjs-dist)
    config.module.rules.push({
      test: /\.node$/,
      use: 'raw-loader',
    });

    return config;
  },
  experimental: {
    // If using Turbopack, configure alias for canvas
    turbo: {
      resolveAlias: {
        canvas: './empty-module.ts',
      },
    },
  },
  // Disable SWC minify for older Next.js versions if needed
  swcMinify: false, // Remove this if using Next.js 15 or later
};

export default nextConfig;