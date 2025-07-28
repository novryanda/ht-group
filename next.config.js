/** @type {import('next').NextConfig} */
const nextConfig = {
  // External packages for serverless deployment
  serverExternalPackages: ['puppeteer-core'],

  // Optimize for production
  poweredByHeader: false,
  compress: true,

  // Handle static file serving
  async headers() {
    return [
      {
        source: '/uploads/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable'
          }
        ]
      }
    ]
  },

  // Experimental features for better performance
  experimental: {
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons']
  },

  // Webpack configuration for production builds
  webpack: (config, { isServer }) => {
    // Handle Puppeteer in serverless environment
    if (isServer) {
      config.externals = [...(config.externals || []), 'puppeteer-core']
    }

    return config
  }
}

module.exports = nextConfig
