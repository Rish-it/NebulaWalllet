/** @type {import('next').NextConfig} */
const nextConfig = {
  // Suppress image warnings
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'assets.coingecko.com',
        pathname: '**',
      },
    ],
  },
  // Suppress ESLint warnings during build
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Suppress hydration warnings
  reactStrictMode: false,
};

export default nextConfig;
