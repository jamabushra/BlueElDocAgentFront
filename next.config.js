/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  experimental: {
    // This is experimental but can be enabled to help with
    // issues related to React hydration
    serverActions: true,
  },
  // Ensure we're not using React Server Components for now
  // to avoid the useState errors
  compiler: {
    styledComponents: true,
  },
}

module.exports = nextConfig 