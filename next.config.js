/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'utfs.io',
        port: ''
      },
      {
        protocol: 'https',
        hostname: 'api.slingacademy.com',
        port: ''
      }
    ]
  },
  transpilePackages: ['geist'],
  experimental: {
    serverActions: {
      allowedOrigins: [
        'localhost:3000',
        'https://stl-rewardify.azurewebsites.net',
        process.env.NEXT_PUBLIC_API_URL || ''
      ]
    }
  }
};

module.exports = nextConfig;