/** @type {import('next').NextConfig} */
// eslint-disable-next-line import/no-anonymous-default-export
export default {
  experimental: { appDir: true, runtime: 'experimental-edge' },
  // We run these checks in the CI pipeline, so we don't need to run them on Vercel
  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true },
}
