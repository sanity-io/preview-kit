/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    logging: 'verbose',
    serverActions: true,
  },
  productionBrowserSourceMaps: true,
}

export default nextConfig
