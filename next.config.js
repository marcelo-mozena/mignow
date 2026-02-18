/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  distDir: 'dist',
  images: {
    unoptimized: true,
  },
  turbopack: {
    resolveAlias: {
      electron: { browser: './src/infrastructure/electron-api/types.d.ts' },
    },
  },
  webpack: config => {
    config.externals.push({
      electron: 'commonjs electron',
    });
    return config;
  },
};

export default nextConfig;
