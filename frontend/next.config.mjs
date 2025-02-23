/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true,
  poweredByHeader: false,
  
  // Output configuration
  output: 'standalone',
  
  // Asset optimization
  images: {
    domains: [],
    unoptimized: process.env.NODE_ENV === 'development'
  },
  
  // Experimental features
  experimental: {
    // Turbopack configuration
    turbo: {
      rules: {
        '**/*.{ico,png,jpg,jpeg,gif,svg}': ['asset'],
        '**/static/**': ['static']
      },
      resolveAlias: {
        '@': './src'
      }
    }
  },

  // Headers configuration
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          }
        ]
      },
      {
        source: '/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable'
          }
        ]
      }
    ];
  },

  // Redirect configuration
  async redirects() {
    return [];
  },

  // Webpack configuration for non-Turbopack fallback
  webpack: (config, { dev, isServer }) => {
    if (!dev && !isServer) {
      Object.assign(config.resolve.alias, {
        'react': 'preact/compat',
        'react-dom': 'preact/compat'
      });
    }
    return config;
  }
};

export default config;