/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  // Ensure we're not using React Server Components for now
  // to avoid the useState errors
  compiler: {
    styledComponents: true,
  },
}

module.exports = nextConfig 