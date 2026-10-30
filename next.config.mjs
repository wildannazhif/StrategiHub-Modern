/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  basePath: '/StrategiHub-Modern',
  images: {
    unoptimized: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
