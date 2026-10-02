/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  experimental: {
    serverComponentsExternalPackages: ['ffmpeg-static'],
    outputFileTracingIncludes: {
      '/api/**/*': ['./bin/**/*', './node_modules/ffmpeg-static/**/*'],
    },
  },
};

module.exports = nextConfig;
