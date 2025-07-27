/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ['puppeteer-core'],
  webpack: (config, { isServer }) => {
    // Handle Puppeteer in serverless environment
    if (isServer) {
      config.externals = [...(config.externals || []), 'puppeteer-core']
    }

    return config
  },
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
  }
}

module.exports = nextConfig
