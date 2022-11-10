/** @type {import('next').NextConfig} */
// eslint-disable-next-line import/no-anonymous-default-export
export default {
  // eslint-disable-next-line no-warning-comments
  // @TODO figure out why the swc minifier breaks preview mode
  swcMinify: false,

  experimental: {
    appDir: true,
  },
}
