import withBundleAnalyzer from '@next/bundle-analyzer'

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    logging: {
      level: 'verbose',
      fullUrl: true
    },
    serverActions: true,
  },
  productionBrowserSourceMaps: true,
}

export default withBundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
})(nextConfig)
