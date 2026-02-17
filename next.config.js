/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  distDir: 'dist',
  images: {
    unoptimized: true,
  },
  webpack: config => {
    config.externals.push({
      electron: 'commonjs electron',
    });
    return config;
  },
};

export default nextConfig;
